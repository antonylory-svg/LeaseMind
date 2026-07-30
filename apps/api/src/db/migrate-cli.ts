import { loadMigrationDatabaseUrl } from '../config.js';
import { createPool } from '../db.js';
import { migrateUp, migrateDown } from './migrate.js';

async function main(): Promise<void> {
  const direction = process.argv[2];
  if (direction !== 'up' && direction !== 'down') {
    console.error('Usage: migrate-cli.ts <up|down>');
    process.exitCode = 1;
    return;
  }

  const databaseUrl = loadMigrationDatabaseUrl();
  const pool = createPool(databaseUrl);
  try {
    const result = direction === 'up' ? await migrateUp(pool) : await migrateDown(pool);
    console.log(JSON.stringify(result));
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'migration failed');
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

await main();
