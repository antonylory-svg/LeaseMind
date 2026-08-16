import pg from 'pg';
import { provisionRoles } from './provisionRoles.js';

/** Reads a required environment variable without ever echoing its value in
 * any error message -- only the variable name is safe to print. */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function main(): Promise<void> {
  let bootstrapUrl: string;
  let migratorPassword: string;
  let maintainerPassword: string;
  let apiReaderPassword: string;
  let campaignWriterPassword: string;
  let taWriterPassword: string;
  let analysisWriterPassword: string;
  let analysisWorkerPassword: string;
  let evidenceRevocationWriterPassword: string;
  let campaignOutcomeWriterPassword: string;
  try {
    bootstrapUrl = requireEnv('LEASEMIND_BOOTSTRAP_DATABASE_URL');
    migratorPassword = requireEnv('LEASEMIND_MIGRATOR_PASSWORD');
    maintainerPassword = requireEnv('LEASEMIND_MAINTAINER_PASSWORD');
    apiReaderPassword = requireEnv('LEASEMIND_API_READER_PASSWORD');
    campaignWriterPassword = requireEnv('LEASEMIND_CAMPAIGN_WRITER_PASSWORD');
    taWriterPassword = requireEnv('LEASEMIND_TA_WRITER_PASSWORD');
    analysisWriterPassword = requireEnv('LEASEMIND_ANALYSIS_WRITER_PASSWORD');
    analysisWorkerPassword = requireEnv('LEASEMIND_ANALYSIS_WORKER_PASSWORD');
    evidenceRevocationWriterPassword = requireEnv('LEASEMIND_EVIDENCE_REVOCATION_WRITER_PASSWORD');
    campaignOutcomeWriterPassword = requireEnv('LEASEMIND_CAMPAIGN_OUTCOME_WRITER_PASSWORD');
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'provisioning configuration error');
    process.exitCode = 1;
    return;
  }

  const pool = new pg.Pool({ connectionString: bootstrapUrl, max: 2 });
  try {
    const result = await provisionRoles(pool, {
      migratorPassword,
      maintainerPassword,
      apiReaderPassword,
      campaignWriterPassword,
      taWriterPassword,
      analysisWriterPassword,
      analysisWorkerPassword,
      evidenceRevocationWriterPassword,
      campaignOutcomeWriterPassword
    });
    console.log(JSON.stringify(result));
  } catch {
    // Never print the underlying error: it could echo back connection
    // details or (in principle) a password if a future change introduced
    // one into a query. Only a stable, generic message is safe to print.
    console.error('ROLE_PROVISIONING_FAILED');
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

await main();
