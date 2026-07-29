// Pre-launch runtime safety gate. See
// 03_ARCHITECTURE/decisions/ADR-0003-pre-launch-runtime-safety-gate.md.
//
// This module enforces that, until a separate PRODUCTION_LAUNCH_GATE
// decision exists, the process can only ever run in synthetic mode with
// every real-world capability disabled. It intentionally never reads
// NODE_ENV -- runtime safety must not be bypassable by the generic
// development/test/production Node.js environment flag.

const RUNTIME_MODE_VAR = 'LEASEMIND_RUNTIME_MODE';
const LAUNCH_GATE_VAR = 'LEASEMIND_PRODUCTION_LAUNCH_GATE';

const REQUIRED_RUNTIME_MODE = 'synthetic';
const REQUIRED_LAUNCH_GATE = 'blocked';

const ALLOW_FLAG_VARS = [
  'LEASEMIND_ALLOW_REAL_PII',
  'LEASEMIND_ALLOW_REAL_PAYMENTS',
  'LEASEMIND_ALLOW_PROTECTED_REVEAL',
  'LEASEMIND_ALLOW_PRODUCTION_ADAPTERS'
] as const;

export type AllowFlagVar = (typeof ALLOW_FLAG_VARS)[number];

export interface RuntimeSafetyPolicy {
  runtimeMode: typeof REQUIRED_RUNTIME_MODE;
  productionLaunchGate: typeof REQUIRED_LAUNCH_GATE;
  allowRealPii: false;
  allowRealPayments: false;
  allowProtectedReveal: false;
  allowProductionAdapters: false;
}

/** Thrown by enforceRuntimeSafetyGate. The message only ever names a
 * variable and its required value -- never the actual value read, never
 * DATABASE_URL, and never any other environment variable. */
export class RuntimeSafetyViolation extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RuntimeSafetyViolation';
  }
}

/** Strict boolean parsing: only the exact literal strings "true"/"false" are
 * accepted. Anything else (including "TRUE", "1", "yes", empty string) is a
 * violation -- it is never silently treated as false. Absence of the
 * variable is the only case that defaults to false. */
function parseStrictBooleanFlag(varName: AllowFlagVar, rawValue: string | undefined): boolean {
  if (rawValue === undefined) {
    return false;
  }
  if (rawValue === 'false') {
    return false;
  }
  if (rawValue === 'true') {
    return true;
  }
  throw new RuntimeSafetyViolation(
    `RUNTIME_SAFETY_VIOLATION: ${varName} must be exactly "true" or "false" (unrecognized values are never treated as false)`
  );
}

/**
 * Validates the pre-launch runtime safety posture. Must be called
 * synchronously before any PostgreSQL connection is attempted and before
 * the HTTP server binds a port. Throws RuntimeSafetyViolation on any
 * deviation from the only allowed pre-launch state:
 * LEASEMIND_RUNTIME_MODE=synthetic, LEASEMIND_PRODUCTION_LAUNCH_GATE=blocked,
 * every LEASEMIND_ALLOW_* flag=false (or unset).
 */
export function enforceRuntimeSafetyGate(env: NodeJS.ProcessEnv = process.env): RuntimeSafetyPolicy {
  const runtimeMode = env[RUNTIME_MODE_VAR] ?? REQUIRED_RUNTIME_MODE;
  if (runtimeMode !== REQUIRED_RUNTIME_MODE) {
    throw new RuntimeSafetyViolation(
      `RUNTIME_SAFETY_VIOLATION: ${RUNTIME_MODE_VAR} must be "${REQUIRED_RUNTIME_MODE}" before a separate PRODUCTION_LAUNCH_GATE decision`
    );
  }

  const launchGate = env[LAUNCH_GATE_VAR] ?? REQUIRED_LAUNCH_GATE;
  if (launchGate !== REQUIRED_LAUNCH_GATE) {
    throw new RuntimeSafetyViolation(
      `RUNTIME_SAFETY_VIOLATION: ${LAUNCH_GATE_VAR} must be "${REQUIRED_LAUNCH_GATE}"`
    );
  }

  const allowRealPii = parseStrictBooleanFlag('LEASEMIND_ALLOW_REAL_PII', env.LEASEMIND_ALLOW_REAL_PII);
  const allowRealPayments = parseStrictBooleanFlag('LEASEMIND_ALLOW_REAL_PAYMENTS', env.LEASEMIND_ALLOW_REAL_PAYMENTS);
  const allowProtectedReveal = parseStrictBooleanFlag(
    'LEASEMIND_ALLOW_PROTECTED_REVEAL',
    env.LEASEMIND_ALLOW_PROTECTED_REVEAL
  );
  const allowProductionAdapters = parseStrictBooleanFlag(
    'LEASEMIND_ALLOW_PRODUCTION_ADAPTERS',
    env.LEASEMIND_ALLOW_PRODUCTION_ADAPTERS
  );

  if (allowRealPii) {
    throw new RuntimeSafetyViolation('RUNTIME_SAFETY_VIOLATION: LEASEMIND_ALLOW_REAL_PII must be false');
  }
  if (allowRealPayments) {
    throw new RuntimeSafetyViolation('RUNTIME_SAFETY_VIOLATION: LEASEMIND_ALLOW_REAL_PAYMENTS must be false');
  }
  if (allowProtectedReveal) {
    throw new RuntimeSafetyViolation('RUNTIME_SAFETY_VIOLATION: LEASEMIND_ALLOW_PROTECTED_REVEAL must be false');
  }
  if (allowProductionAdapters) {
    throw new RuntimeSafetyViolation('RUNTIME_SAFETY_VIOLATION: LEASEMIND_ALLOW_PRODUCTION_ADAPTERS must be false');
  }

  return {
    runtimeMode: REQUIRED_RUNTIME_MODE,
    productionLaunchGate: REQUIRED_LAUNCH_GATE,
    allowRealPii: false,
    allowRealPayments: false,
    allowProtectedReveal: false,
    allowProductionAdapters: false
  };
}
