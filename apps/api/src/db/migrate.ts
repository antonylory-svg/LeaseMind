import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type pg from 'pg';

const MIGRATIONS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'migrations');

function sha256(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

async function ensureLedger(pool: pg.Pool): Promise<void> {
  await pool.query('CREATE SCHEMA IF NOT EXISTS leasemind_app');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leasemind_app.schema_migrations (
      filename text PRIMARY KEY,
      checksum char(64) NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT clock_timestamp()
    )
  `);
}

async function listMigrationFiles(suffix: '.up.sql' | '.down.sql'): Promise<string[]> {
  const entries = await readdir(MIGRATIONS_DIR).catch(() => [] as string[]);
  return entries.filter(name => name.endsWith(suffix)).sort();
}

export interface MigrateUpResult {
  applied: string[];
  skipped: string[];
}

/**
 * Applies every *.up.sql migration exactly once, tracked by a checksum
 * ledger. Re-running is idempotent (already-applied files with a matching
 * checksum are skipped); a file whose content changed after being applied
 * is rejected rather than silently re-applied.
 */
export async function migrateUp(pool: pg.Pool): Promise<MigrateUpResult> {
  await ensureLedger(pool);
  const files = await listMigrationFiles('.up.sql');
  const applied: string[] = [];
  const skipped: string[] = [];

  for (const file of files) {
    const sql = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
    const checksum = sha256(sql);

    const existing = await pool.query<{ checksum: string }>(
      'SELECT checksum FROM leasemind_app.schema_migrations WHERE filename = $1',
      [file]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      const recordedChecksum = existing.rows[0].checksum.trim();
      if (recordedChecksum !== checksum) {
        throw new Error(`MIGRATION_CHECKSUM_MISMATCH: ${file} was modified after being applied`);
      }
      skipped.push(file);
      continue;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        'INSERT INTO leasemind_app.schema_migrations (filename, checksum) VALUES ($1, $2)',
        [file, checksum]
      );
      await client.query('COMMIT');
      applied.push(file);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  return { applied, skipped };
}

export interface MigrateDownResult {
  reverted: string[];
}

/** Runs every *.down.sql migration in reverse order. Safe to call when
 * nothing is applied (each down script is itself idempotent via IF EXISTS). */
export async function migrateDown(pool: pg.Pool): Promise<MigrateDownResult> {
  const files = (await listMigrationFiles('.down.sql')).reverse();
  const reverted: string[] = [];

  for (const file of files) {
    const sql = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      reverted.push(file);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  return { reverted };
}
