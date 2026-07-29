import { loadConfig } from '../config.js';
import { createPool } from '../db.js';
import { seedCampaigns } from './seed.js';

async function main(): Promise<void> {
  const config = loadConfig();
  const pool = createPool(config.databaseUrl);
  try {
    const result = await seedCampaigns(pool);
    console.log(JSON.stringify(result));
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'seed failed');
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

await main();
