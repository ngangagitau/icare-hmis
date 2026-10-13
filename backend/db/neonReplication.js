const { Pool } = require('pg');
const { pool: primaryPool, query: primaryQuery } = require('./pg');

const NEON_DATABASE_URL = process.env.NEON_DATABASE_URL || process.env.database_url;
const BATCH_SIZE = 50;
const RETRY_DELAY_MS = 5000;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
const IDENTIFIER_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

let neonPool;
let workerRunning = false;
let lastCleanupAt = 0;

const quoteIdentifier = (identifier) => {
  if (!IDENTIFIER_PATTERN.test(identifier)) {
    throw new Error(`Unsafe database identifier: ${identifier}`);
  }
  return `"${identifier}"`;
};

const qualifiedTableName = (schema, table) =>
  `${quoteIdentifier(schema)}.${quoteIdentifier(table)}`;

async function installOutbox() {
  await primaryQuery(`
    CREATE TABLE IF NOT EXISTS public.replication_outbox (
      id BIGSERIAL PRIMARY KEY,
      table_schema TEXT NOT NULL,
      table_name TEXT NOT NULL,
      operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
      row_data JSONB NOT NULL,
      primary_key_columns JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      replicated_at TIMESTAMPTZ,
      attempts INTEGER NOT NULL DEFAULT 0,
      last_error TEXT
    )
  `);

  await primaryQuery(`
    CREATE INDEX IF NOT EXISTS idx_replication_outbox_pending
    ON public.replication_outbox (id)
    WHERE replicated_at IS NULL
  `);
  await primaryQuery(`
    CREATE INDEX IF NOT EXISTS idx_replication_outbox_replicated_at
    ON public.replication_outbox (replicated_at)
    WHERE replicated_at IS NOT NULL
  `);

  await primaryQuery(`
    CREATE OR REPLACE FUNCTION public.capture_replication_change()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
      changed_row JSONB;
      key_columns JSONB;
    BEGIN
      changed_row := CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END;

      SELECT COALESCE(jsonb_agg(attribute.attname ORDER BY key_column.ordinality), '[]'::jsonb)
      INTO key_columns
      FROM pg_constraint primary_key
      CROSS JOIN LATERAL unnest(primary_key.conkey) WITH ORDINALITY AS key_column(attnum, ordinality)
      JOIN pg_attribute attribute
        ON attribute.attrelid = primary_key.conrelid
       AND attribute.attnum = key_column.attnum
      WHERE primary_key.conrelid = TG_RELID
        AND primary_key.contype = 'p';

      IF jsonb_array_length(key_columns) = 0 THEN
        RAISE EXCEPTION 'Cannot mirror %.% without a primary key', TG_TABLE_SCHEMA, TG_TABLE_NAME;
      END IF;

      INSERT INTO public.replication_outbox (
        table_schema, table_name, operation, row_data, primary_key_columns
      ) VALUES (
        TG_TABLE_SCHEMA, TG_TABLE_NAME, TG_OP, changed_row, key_columns
      );

      IF TG_OP = 'DELETE' THEN
        RETURN OLD;
      END IF;
      RETURN NEW;
    END;
    $$
  `);

  const tableResult = await primaryQuery(`
    SELECT table_schema, table_name,
      EXISTS (
        SELECT 1
        FROM information_schema.table_constraints constraint_info
        WHERE constraint_info.table_schema = tables.table_schema
          AND constraint_info.table_name = tables.table_name
          AND constraint_info.constraint_type = 'PRIMARY KEY'
      ) AS has_primary_key
    FROM information_schema.tables tables
    WHERE table_type = 'BASE TABLE'
      AND table_schema = 'public'
      AND table_name <> 'replication_outbox'
    ORDER BY table_name
  `);

  const withoutPrimaryKey = tableResult.rows
    .filter((table) => !table.has_primary_key)
    .map((table) => table.table_name);

  for (const table of tableResult.rows) {
    if (!table.has_primary_key) continue;
    const triggerName = `replicate_${table.table_name}`;
    await primaryQuery(
      `DROP TRIGGER IF EXISTS ${quoteIdentifier(triggerName)} ON ${qualifiedTableName(table.table_schema, table.table_name)}`
    );
    await primaryQuery(
      `CREATE TRIGGER ${quoteIdentifier(triggerName)}
       AFTER INSERT OR UPDATE OR DELETE ON ${qualifiedTableName(table.table_schema, table.table_name)}
       FOR EACH ROW EXECUTE FUNCTION public.capture_replication_change()`
    );
  }

  if (withoutPrimaryKey.length) {
    console.warn(`Neon mirroring skipped tables without primary keys: ${withoutPrimaryKey.join(', ')}`);
  }
}

async function applyOutboxEvent(event) {
  const client = await neonPool.connect();
  try {
    await client.query('BEGIN');
    const table = qualifiedTableName(event.table_schema, event.table_name);
    const keyColumns = event.primary_key_columns;
    const row = event.row_data;

    if (!Array.isArray(keyColumns) || keyColumns.length === 0) {
      throw new Error(`No primary key recorded for ${event.table_schema}.${event.table_name}`);
    }

    for (const column of keyColumns) {
      if (!(column in row)) {
        throw new Error(`Primary key column ${column} is missing from replication event ${event.id}`);
      }
    }

    if (event.operation === 'DELETE') {
      const predicates = keyColumns.map((column, index) => `${quoteIdentifier(column)} IS NOT DISTINCT FROM $${index + 1}`);
      await client.query(
        `DELETE FROM ${table} WHERE ${predicates.join(' AND ')}`,
        keyColumns.map((column) => row[column])
      );
    } else {
      const columns = Object.keys(row);
      if (!columns.length) throw new Error(`Empty row in replication event ${event.id}`);
      const columnSql = columns.map(quoteIdentifier).join(', ');
      const valueSql = columns.map((_, index) => `$${index + 1}`).join(', ');
      const conflictSql = keyColumns.map(quoteIdentifier).join(', ');
      const mutableColumns = columns.filter((column) => !keyColumns.includes(column));
      const updateSql = mutableColumns.length
        ? `DO UPDATE SET ${mutableColumns.map((column) => `${quoteIdentifier(column)} = EXCLUDED.${quoteIdentifier(column)}`).join(', ')}`
        : 'DO NOTHING';

      await client.query(
        `INSERT INTO ${table} (${columnSql}) VALUES (${valueSql}) ON CONFLICT (${conflictSql}) ${updateSql}`,
        columns.map((column) => row[column])
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function processOutboxBatch() {
  const result = await primaryQuery(
    `SELECT id, table_schema, table_name, operation, row_data, primary_key_columns
     FROM public.replication_outbox
     WHERE replicated_at IS NULL
     ORDER BY id
     LIMIT $1`,
    [BATCH_SIZE]
  );

  for (const event of result.rows) {
    try {
      await applyOutboxEvent(event);
      await primaryQuery(
        `UPDATE public.replication_outbox
         SET replicated_at = NOW(), attempts = attempts + 1, last_error = NULL
         WHERE id = $1`,
        [event.id]
      );
    } catch (error) {
      await primaryQuery(
        `UPDATE public.replication_outbox
         SET attempts = attempts + 1, last_error = $2
         WHERE id = $1`,
        [event.id, String(error.message || error).slice(0, 2000)]
      );
      console.error(`Neon replication paused at outbox event ${event.id}:`, error.message);
      break;
    }
  }

  if (Date.now() - lastCleanupAt >= CLEANUP_INTERVAL_MS) {
    await primaryQuery(`
      DELETE FROM public.replication_outbox
      WHERE replicated_at < NOW() - INTERVAL '1 day'
    `);
    lastCleanupAt = Date.now();
  }
}

async function runWorker() {
  if (workerRunning || !neonPool) return;
  workerRunning = true;
  try {
    await processOutboxBatch();
  } catch (error) {
    console.error('Neon replication worker error:', error.message);
  } finally {
    workerRunning = false;
    setTimeout(runWorker, RETRY_DELAY_MS).unref();
  }
}

async function startNeonReplication() {
  if (!NEON_DATABASE_URL) {
    console.warn('Neon mirror is not configured. Set NEON_DATABASE_URL to enable the Neon mirror.');
    return;
  }

  await installOutbox();
  neonPool = new Pool({ connectionString: NEON_DATABASE_URL, connectionTimeoutMillis: 5000 });
  neonPool.on('error', (error) => console.error('Unexpected Neon pool error:', error.message));
  try {
    await neonPool.query('SELECT 1');
    console.log('Neon mirror connected; starting asynchronous replication worker.');
  } catch (error) {
    console.error('Neon mirror is currently unavailable; replication will retry:', error.message);
  }
  runWorker();
}

async function stopNeonReplication() {
  if (neonPool) await neonPool.end();
  await primaryPool.end();
}

module.exports = { startNeonReplication, stopNeonReplication };
