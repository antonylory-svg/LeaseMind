import { loadEvidenceRevocationDatabaseUrl } from '../config.js';
import { createPool } from '../db.js';
import {
  DATABASE_PRIVILEGE_VIOLATION_CODE,
  DatabasePrivilegeViolation,
  verifyRuntimeEvidenceRevocationPrivileges
} from '../dbPrivilegePolicy.js';
import { enforceRuntimeSafetyGate, RuntimeSafetyViolation } from '../runtimePolicy.js';
import {
  EVIDENCE_REVOCATION_ARGUMENT_INVALID,
  EvidenceDatasetRevocationError,
  parseEvidenceDatasetRevocationArgs,
  runEvidenceDatasetRevocation
} from './evidenceDatasetRevocation.js';

const CONFIGURATION_ERROR_CODE = 'EVIDENCE_REVOCATION_CONFIGURATION_INVALID';
const OPERATION_ERROR_CODE = 'EVIDENCE_REVOCATION_OPERATION_FAILED';

function writeFailure(safeErrorCode: string): void {
  console.error(JSON.stringify({
    event: 'evidence_dataset_revocation_failed',
    safe_error_code: safeErrorCode
  }));
}

async function main(): Promise<void> {
  let command;
  try {
    // Contract requirement: all CLI arguments are validated before any
    // database configuration is read or a connection can be attempted.
    command = parseEvidenceDatasetRevocationArgs(process.argv.slice(2));
  } catch {
    writeFailure(EVIDENCE_REVOCATION_ARGUMENT_INVALID);
    process.exitCode = 1;
    return;
  }

  let databaseUrl: string;
  try {
    enforceRuntimeSafetyGate();
    databaseUrl = loadEvidenceRevocationDatabaseUrl();
  } catch (error) {
    writeFailure(error instanceof RuntimeSafetyViolation
      ? 'RUNTIME_SAFETY_VIOLATION'
      : CONFIGURATION_ERROR_CODE);
    process.exitCode = 1;
    return;
  }

  const pool = createPool(databaseUrl);
  try {
    await verifyRuntimeEvidenceRevocationPrivileges(pool);
    const result = await runEvidenceDatasetRevocation(pool, command);
    console.log(JSON.stringify(result));
  } catch (error) {
    const safeErrorCode = error instanceof EvidenceDatasetRevocationError
      ? error.safeCode
      : error instanceof DatabasePrivilegeViolation
        ? error.message
        : OPERATION_ERROR_CODE;
    writeFailure(safeErrorCode || DATABASE_PRIVILEGE_VIOLATION_CODE);
    process.exitCode = 1;
  } finally {
    await pool.end().catch(() => {});
  }
}

void main();
