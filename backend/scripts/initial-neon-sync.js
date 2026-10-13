const { spawn } = require('child_process');
const { existsSync, readdirSync } = require('fs');
const { mkdtemp, rm } = require('fs/promises');
const os = require('os');
const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const localUrl = process.env.DATABASE_URL;
const neonUrl = process.env.NEON_DATABASE_URL || process.env.database_url;

const parseConnection = (connectionString) => {
  const url = new URL(connectionString);
  return {
    host: url.hostname,
    port: url.port || '5432',
    username: decodeURIComponent(url.username),
    database: decodeURIComponent(url.pathname.slice(1)),
    password: decodeURIComponent(url.password),
    sslmode: url.searchParams.get('sslmode'),
  };
};

const getToolEnvironment = (connection) => {
  const env = { ...process.env, PGPASSWORD: connection.password };
  if (connection.sslmode) env.PGSSLMODE = connection.sslmode;
  return env;
};

const connectionArgs = (connection) => [
  '--host', connection.host,
  '--port', connection.port,
  '--username', connection.username,
  '--dbname', connection.database,
];

const resolvePgTool = (toolName) => {
  if (process.platform === 'win32') {
    const installRoot = 'C:\\Program Files\\PostgreSQL';
    if (existsSync(installRoot)) {
      const versions = readdirSync(installRoot).sort((left, right) => right.localeCompare(left, undefined, { numeric: true }));
      for (const version of versions) {
        const candidate = path.join(installRoot, version, 'bin', `${toolName}.exe`);
        if (existsSync(candidate)) return candidate;
      }
    }
  }
  return toolName;
};

function runTool(command, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, windowsHide: true });
    let stderr = '';

    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', (error) => reject(new Error(`${command} could not start: ${error.message}`)));
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} failed (${code}): ${stderr.trim()}`));
      }
    });
  });
}

async function main() {
  if (!localUrl || !neonUrl) {
    throw new Error('Set DATABASE_URL and NEON_DATABASE_URL in backend/.env before syncing.');
  }
  if (process.env.INITIAL_NEON_SYNC !== 'copy-local-to-empty-neon') {
    throw new Error('To confirm the initial copy, set INITIAL_NEON_SYNC=copy-local-to-empty-neon for this command.');
  }

  const neonPool = new Pool({ connectionString: neonUrl });
  const tempDirectory = await mkdtemp(path.join(os.tmpdir(), 'icare-neon-sync-'));
  const dumpFile = path.join(tempDirectory, 'icare.dump');

  try {
    const targetTables = await neonPool.query(
      `SELECT COUNT(*)::int AS count
       FROM information_schema.tables
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
    );
    if (targetTables.rows[0].count > 0) {
      throw new Error('Neon already contains public tables. Initial sync stopped without changing Neon.');
    }

    const local = parseConnection(localUrl);
    const neon = parseConnection(neonUrl);

    await runTool(
      resolvePgTool('pg_dump'),
      [...connectionArgs(local), '--format=custom', '--no-owner', '--no-privileges', '--schema=public', '--exclude-table=public.replication_outbox', '--file', dumpFile],
      getToolEnvironment(local)
    );

    await runTool(
      resolvePgTool('pg_restore'),
      [...connectionArgs(neon), '--no-owner', '--no-privileges', '--exit-on-error', dumpFile],
      getToolEnvironment(neon)
    );

    console.log('Initial local PostgreSQL schema and data copied to Neon successfully.');
    console.log('Start or restart the backend with NEON_DATABASE_URL configured to begin ongoing mirroring.');
  } finally {
    await neonPool.end();
    await rm(tempDirectory, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(`Initial Neon sync failed: ${error.message}`);
  process.exitCode = 1;
});