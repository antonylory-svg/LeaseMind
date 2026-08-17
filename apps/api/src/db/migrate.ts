import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type pg from 'pg';

const MIGRATIONS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'migrations');

function sha256(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

/** Canonical line-ending form: CRLF and lone CR both collapse to LF. Applied
 * before every checksum/execution use of a migration file's content so a
 * standard `git config core.autocrlf` LF or CRLF checkout of the exact same
 * committed SQL always identifies as the same migration -- Windows and
 * Linux/macOS checkouts of one Git blob never disagree on checksum or on
 * what SQL actually runs. Only line-ending bytes are touched: any real
 * change to a token, comment or the presence/absence of a trailing newline
 * still changes the canonical string and therefore the checksum. */
export function canonicalizeLineEndings(content: string): string {
  return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/** The one checksum every migration applied from now on is recorded and
 * verified against -- SHA-256 of the canonical (LF-only) form. */
export function computeMigrationChecksum(content: string): string {
  return sha256(canonicalizeLineEndings(content));
}

/** The exact byte form a pre-fix Windows checkout (`core.autocrlf=true`) of
 * the canonical content would have hashed: every LF expanded back to CRLF.
 * Used only to recognize a legacy ledger row already written by that older,
 * platform-sensitive checksum -- never to compute a new one. */
function legacyCrlfChecksum(canonicalContent: string): string {
  return sha256(canonicalContent.replace(/\n/g, '\r\n'));
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
    const raw = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
    const canonicalSql = canonicalizeLineEndings(raw);
    const checksum = computeMigrationChecksum(raw);

    const existing = await pool.query<{ checksum: string }>(
      'SELECT checksum FROM leasemind_app.schema_migrations WHERE filename = $1',
      [file]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      const recordedChecksum = existing.rows[0].checksum.trim();
      // Accepts exactly two byte forms: the canonical LF checksum (every
      // migration recorded from now on) and the legacy CRLF checksum a
      // pre-fix Windows checkout of this same canonical content would have
      // recorded. Any other value is a genuine content change and still
      // fails closed with the original stable error -- the ledger row
      // itself is never rewritten here, on either branch.
      if (recordedChecksum !== checksum && recordedChecksum !== legacyCrlfChecksum(canonicalSql)) {
        throw new Error(`MIGRATION_CHECKSUM_MISMATCH: ${file} was modified after being applied`);
      }
      skipped.push(file);
      continue;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(canonicalSql);
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

  // One transaction for the full chain is important when a later down
  // migration is an intentional safety barrier. For example, 006 refuses
  // to discard an immutable subject_linked event. Any newer migration
  // visited before that barrier must be rolled back with it, rather than
  // leaving the database only partially downgraded.
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const file of files) {
      const sql = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
      await client.query(sql);
      reverted.push(file);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  return { reverted };
}
