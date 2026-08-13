import type pg from 'pg';

const EVIDENCE_DATASET_REVISION_PATTERN = /^[0-9a-f]{64}$/;
const REASON_CODE_PATTERN = /^[A-Z][A-Z0-9_]{2,63}$/;

export const EVIDENCE_REVOCATION_ARGUMENT_INVALID = 'EVIDENCE_REVOCATION_ARGUMENT_INVALID';
export const EVIDENCE_DATASET_ALREADY_REVOKED = 'EVIDENCE_DATASET_ALREADY_REVOKED';

export class EvidenceDatasetRevocationError extends Error {
  constructor(public readonly safeCode: string) {
    super(safeCode);
    this.name = 'EvidenceDatasetRevocationError';
  }
}

export interface EvidenceDatasetRevocationCommand {
  evidenceDatasetRevision: string;
  reasonCode: string;
  actorRef: string;
  execute: boolean;
}

export type EvidenceDatasetRevocationResult =
  | {
      event: 'evidence_dataset_revocation_dry_run_completed';
      evidence_dataset_revision: string;
      reason_code: string;
      already_revoked: boolean;
    }
  | {
      event: 'evidence_dataset_revoked';
      evidence_dataset_revision: string;
      reason_code: string;
    };

function invalidArguments(): never {
  throw new EvidenceDatasetRevocationError(EVIDENCE_REVOCATION_ARGUMENT_INVALID);
}

/** Parses and validates the complete CLI command before any database URL is
 * loaded or any connection is attempted. Unknown, repeated and positional
 * arguments are rejected rather than silently ignored. */
export function parseEvidenceDatasetRevocationArgs(args: readonly string[]): EvidenceDatasetRevocationCommand {
  let evidenceDatasetRevision: string | undefined;
  let reasonCode: string | undefined;
  let actorRef: string | undefined;
  let execute = false;

  const takeValue = (index: number): string => {
    const value = args[index + 1];
    if (value === undefined || value.startsWith('--')) invalidArguments();
    return value;
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    switch (argument) {
      case '--evidence-dataset-revision':
        if (evidenceDatasetRevision !== undefined) invalidArguments();
        evidenceDatasetRevision = takeValue(index);
        index += 1;
        break;
      case '--reason-code':
        if (reasonCode !== undefined) invalidArguments();
        reasonCode = takeValue(index);
        index += 1;
        break;
      case '--actor-ref':
        if (actorRef !== undefined) invalidArguments();
        actorRef = takeValue(index);
        index += 1;
        break;
      case '--execute':
        if (execute) invalidArguments();
        execute = true;
        break;
      default:
        invalidArguments();
    }
  }

  if (
    evidenceDatasetRevision === undefined
    || reasonCode === undefined
    || actorRef === undefined
    || !EVIDENCE_DATASET_REVISION_PATTERN.test(evidenceDatasetRevision)
    || !REASON_CODE_PATTERN.test(reasonCode)
    || actorRef.length === 0
    || actorRef.length > 200
  ) {
    invalidArguments();
  }

  return { evidenceDatasetRevision, reasonCode, actorRef, execute };
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';
}

async function runDryRun(
  pool: pg.Pool,
  command: EvidenceDatasetRevocationCommand
): Promise<EvidenceDatasetRevocationResult> {
  const client = await pool.connect();
  let transactionOpen = false;
  try {
    // This database-enforced boundary makes the no-write guarantee survive
    // future code changes inside the dry-run transaction.
    await client.query('BEGIN TRANSACTION READ ONLY');
    transactionOpen = true;
    const existing = await client.query(
      `SELECT 1
         FROM leasemind_app.evidence_dataset_revocation
        WHERE evidence_dataset_revision = $1`,
      [command.evidenceDatasetRevision]
    );
    await client.query('ROLLBACK');
    transactionOpen = false;
    return {
      event: 'evidence_dataset_revocation_dry_run_completed',
      evidence_dataset_revision: command.evidenceDatasetRevision,
      reason_code: command.reasonCode,
      already_revoked: existing.rowCount === 1
    };
  } finally {
    if (transactionOpen) await client.query('ROLLBACK').catch(() => {});
    client.release();
  }
}

/** Executes either a provably read-only preview or one append-only INSERT.
 * No evidence payload or user data is queried by this path. */
export async function runEvidenceDatasetRevocation(
  pool: pg.Pool,
  command: EvidenceDatasetRevocationCommand
): Promise<EvidenceDatasetRevocationResult> {
  if (!command.execute) return runDryRun(pool, command);

  try {
    await pool.query(
      `INSERT INTO leasemind_app.evidence_dataset_revocation (
         evidence_dataset_revision,
         evidence_revocation_reason_code,
         revoked_by_actor_ref
       ) VALUES ($1, $2, $3)`,
      [command.evidenceDatasetRevision, command.reasonCode, command.actorRef]
    );
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new EvidenceDatasetRevocationError(EVIDENCE_DATASET_ALREADY_REVOKED);
    }
    throw error;
  }

  return {
    event: 'evidence_dataset_revoked',
    evidence_dataset_revision: command.evidenceDatasetRevision,
    reason_code: command.reasonCode
  };
}
