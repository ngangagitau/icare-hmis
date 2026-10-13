const { createHash } = require('crypto');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const databases = [
  ['local', process.env.DATABASE_URL],
  ['neon', process.env.NEON_DATABASE_URL || process.env.database_url],
];

const quoteIdentifier = (identifier) => `"${String(identifier).replaceAll('"', '""')}"`;

async function inspectDatabase(name, connectionString) {
  if (!connectionString) throw new Error(`${name} connection is not configured`);
  const pool = new Pool({ connectionString, connectionTimeoutMillis: 7000 });
  const client = await pool.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const tables = await client.query(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
       ORDER BY table_name`
    );
    const tableCounts = [];
    for (const { table_name: tableName } of tables.rows) {
      const qualified = `public.${quoteIdentifier(tableName)}`;
      const metadata = await client.query(
        `SELECT attribute.attname
         FROM pg_index index_info
         JOIN LATERAL unnest(index_info.indkey) WITH ORDINALITY AS key_column(attnum, ordinality) ON TRUE
         JOIN pg_attribute attribute ON attribute.attrelid = index_info.indrelid AND attribute.attnum = key_column.attnum
         WHERE index_info.indrelid = $1::regclass AND index_info.indisprimary
         ORDER BY key_column.ordinality`,
        [qualified]
      );
      const primaryKey = metadata.rows.map((row) => row.attname);
      const ordering = primaryKey.length
        ? primaryKey.map(quoteIdentifier).join(', ')
        : `to_jsonb(record)::text`;
      const digest = createHash('sha256');
      let offset = 0;
      let rowCount = 0;

      while (true) {
        const result = await client.query(
          `SELECT to_jsonb(record) AS row_data
           FROM ${qualified} AS record
           ORDER BY ${ordering}
           LIMIT 500 OFFSET $1`,
          [offset]
        );
        if (!result.rows.length) break;
        for (const row of result.rows) digest.update(JSON.stringify(row.row_data));
        rowCount += result.rows.length;
        offset += result.rows.length;
      }

      tableCounts.push({ table: tableName, rows: rowCount, sha256: digest.digest('hex') });
    }
    const mirrorStatus = name === 'local'
      ? await client.query(`
          SELECT
            (SELECT COUNT(*)::int FROM pg_trigger
             WHERE NOT tgisinternal
               AND tgfoid = to_regprocedure('public.capture_replication_change()')) AS capture_triggers,
            (SELECT COUNT(*)::int FROM public.replication_outbox WHERE replicated_at IS NULL) AS pending_events,
            (SELECT COALESCE(jsonb_agg(jsonb_build_object(
              'table', table_name,
              'operation', operation,
              'attempts', attempts,
              'lastError', last_error,
              'createdAt', created_at
            ) ORDER BY id), '[]'::jsonb)
             FROM (SELECT table_name, operation, attempts, last_error, created_at, id
                   FROM public.replication_outbox
                   WHERE replicated_at IS NULL
                   ORDER BY id LIMIT 10) pending) AS pending_details
        `)
      : null;

    await client.query('COMMIT');
    return {
      database: name,
      tables: tableCounts,
      ...(mirrorStatus ? { mirror: mirrorStatus.rows[0] } : {}),
    };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function main() {
  const results = [];
  for (const [name, url] of databases) {
    results.push(await inspectDatabase(name, url));
  }
  const localTables = new Map(results[0].tables.map((table) => [table.table, table]));
  const neonTables = new Map(results[1].tables.map((table) => [table.table, table]));
  const tableNames = [...new Set([...localTables.keys(), ...neonTables.keys()])].sort();
  const differences = tableNames.flatMap((tableName) => {
    const local = localTables.get(tableName);
    const neon = neonTables.get(tableName);
    if (!local || !neon) return [{ table: tableName, reason: 'table missing on one database' }];
    if (local.rows !== neon.rows) return [{ table: tableName, reason: 'row count differs', localRows: local.rows, neonRows: neon.rows }];
    if (local.sha256 !== neon.sha256) return [{ table: tableName, reason: 'content fingerprint differs', rows: local.rows }];
    return [];
  });
  console.log(JSON.stringify({
    tablesCompared: tableNames.length,
    matchingTables: tableNames.length - differences.length,
    differences,
    localMirror: results[0].mirror,
  }, null, 2));
}

main().catch((error) => {
  console.error(`Database inspection failed: ${error.message}`);
  process.exitCode = 1;
});
