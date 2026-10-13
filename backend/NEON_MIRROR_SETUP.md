# Local PostgreSQL to Neon Mirror

The backend treats `DATABASE_URL` as the authoritative local PostgreSQL database. When `NEON_DATABASE_URL` is configured, row-level changes are captured in a local transactional outbox and asynchronously applied to Neon. API writes do not wait for Neon; temporary Neon outages queue changes locally and the worker retries in order. Do not write to Neon directly; primary-database changes overwrite matching rows in the mirror.

This is an outbound connection from the backend to Neon. Do not expose a local PostgreSQL server to the public internet for this setup.

## Security

The previously shared environment configuration included database credentials and a JWT secret. Rotate the local and Neon database passwords and replace the JWT secret before using those credentials again. Keep `.env` out of source control and never paste its contents into issue trackers or chat.

Add the rotated Neon connection string to `backend/.env` using the exact uppercase name below. Use Neon’s regular connection string; a pooled connection is acceptable for this application-level mirror.

```dotenv
DATABASE_URL=postgresql://<local-user>:<local-password>@localhost:5432/<local-database>
NEON_DATABASE_URL=postgresql://<neon-user>:<rotated-password>@<neon-host>/<neon-database>?sslmode=require
```

Use the uppercase `NEON_DATABASE_URL` key for new configuration. The worker temporarily accepts the existing lowercase `database_url` key as a compatibility fallback; rotate its password and migrate it to the uppercase key.

## Initial Copy

Requirements:

- PostgreSQL client utilities (`pg_dump` and `pg_restore`) installed. The script searches `C:\Program Files\PostgreSQL\<version>\bin` on Windows, then falls back to `PATH`.
- The Neon target database must be empty of public tables. The sync script checks this and refuses to overwrite a non-empty target.
- The local application database must be reachable using `DATABASE_URL`.

From PowerShell:

```powershell
Set-Location backend
$env:INITIAL_NEON_SYNC = "copy-local-to-empty-neon"
npm run sync:neon
Remove-Item Env:INITIAL_NEON_SYNC
```

The script copies the local public schema and data. It does not print either connection string. The Neon target remains a mirror; application writes must continue to use the local primary.

It is safe for local writes to continue during the dump: database triggers record changes in the outbox, and the worker replays them after the copy. Do not run the sync again against a Neon database containing tables; incremental updates are handled by the outbox worker.

## Ongoing Replication

Start or restart the backend after setting `NEON_DATABASE_URL`. After local tables are initialized, the backend creates the outbox and row triggers for public tables that have primary keys, then runs a retrying worker.

Monitor backend logs for:

- `Neon mirror connected; starting asynchronous replication worker.`
- `Neon replication paused at outbox event ...` when Neon rejects a write or is unavailable. The worker stops at the first failed event to preserve ordering and retries after five seconds.
- `Neon mirroring skipped tables without primary keys: ...` if a public table cannot be safely upserted/deleted.

Check queue health in the local primary:

```sql
SELECT COUNT(*) AS pending_events,
       MIN(created_at) AS oldest_pending_event
FROM public.replication_outbox
WHERE replicated_at IS NULL;

SELECT id, table_schema, table_name, operation, attempts, last_error, created_at
FROM public.replication_outbox
WHERE replicated_at IS NULL
ORDER BY id
LIMIT 20;
```

Do not manually edit or delete outbox rows unless reconciling a failed replication event. Event processing is idempotent, so a crash after Neon commits but before the local acknowledgement can replay the same event safely.

## Schema Changes

Logical schema migrations are not row events. Apply schema changes to both local PostgreSQL and Neon before deploying application code that uses the new columns/tables. Tables created before backend startup are automatically given row triggers if they have primary keys. Restart the backend after schema changes so newly created tables are registered.

The Neon mirror is eventually consistent, not a distributed transaction. If Neon is unavailable, local clinical and billing operations continue and the outbox accumulates until Neon recovers.
