import { test } from 'node:test';
import assert from 'node:assert/strict';
import { enforceRuntimeSafetyGate, RuntimeSafetyViolation } from '../src/runtimePolicy.js';

const SAFE_EXPLICIT_ENV: NodeJS.ProcessEnv = {
  LEASEMIND_RUNTIME_MODE: 'synthetic',
  LEASEMIND_PRODUCTION_LAUNCH_GATE: 'blocked',
  LEASEMIND_ALLOW_REAL_PII: 'false',
  LEASEMIND_ALLOW_REAL_PAYMENTS: 'false',
  LEASEMIND_ALLOW_PROTECTED_REVEAL: 'false',
  LEASEMIND_ALLOW_PRODUCTION_ADAPTERS: 'false'
};

const SAFE_POLICY = {
  runtimeMode: 'synthetic',
  productionLaunchGate: 'blocked',
  allowRealPii: false,
  allowRealPayments: false,
  allowProtectedReveal: false,
  allowProductionAdapters: false
};

test('defaults (no LEASEMIND_* variables set) pass and resolve to the safe policy', () => {
  const policy = enforceRuntimeSafetyGate({});
  assert.deepEqual(policy, SAFE_POLICY);
});

test('a fully explicit synthetic/blocked/false env passes', () => {
  const policy = enforceRuntimeSafetyGate(SAFE_EXPLICIT_ENV);
  assert.deepEqual(policy, SAFE_POLICY);
});

test('LEASEMIND_RUNTIME_MODE=production is rejected', () => {
  assert.throws(
    () => enforceRuntimeSafetyGate({ ...SAFE_EXPLICIT_ENV, LEASEMIND_RUNTIME_MODE: 'production' }),
    RuntimeSafetyViolation
  );
});

test('LEASEMIND_RUNTIME_MODE=staging is rejected', () => {
  assert.throws(
    () => enforceRuntimeSafetyGate({ ...SAFE_EXPLICIT_ENV, LEASEMIND_RUNTIME_MODE: 'staging' }),
    RuntimeSafetyViolation
  );
});

test('LEASEMIND_PRODUCTION_LAUNCH_GATE=open is rejected', () => {
  assert.throws(
    () => enforceRuntimeSafetyGate({ ...SAFE_EXPLICIT_ENV, LEASEMIND_PRODUCTION_LAUNCH_GATE: 'open' }),
    RuntimeSafetyViolation
  );
});

const ALLOW_VARS = [
  'LEASEMIND_ALLOW_REAL_PII',
  'LEASEMIND_ALLOW_REAL_PAYMENTS',
  'LEASEMIND_ALLOW_PROTECTED_REVEAL',
  'LEASEMIND_ALLOW_PRODUCTION_ADAPTERS'
] as const;

for (const allowVar of ALLOW_VARS) {
  test(`${allowVar}=true is rejected on its own`, () => {
    assert.throws(() => enforceRuntimeSafetyGate({ ...SAFE_EXPLICIT_ENV, [allowVar]: 'true' }), RuntimeSafetyViolation);
  });
}

const INVALID_BOOLEAN_VALUES = ['TRUE', '1', 'yes', 'not-a-boolean', ''];

for (const allowVar of ALLOW_VARS) {
  for (const invalidValue of INVALID_BOOLEAN_VALUES) {
    test(`${allowVar}=${JSON.stringify(invalidValue)} is rejected, not treated as false`, () => {
      assert.throws(
        () => enforceRuntimeSafetyGate({ ...SAFE_EXPLICIT_ENV, [allowVar]: invalidValue }),
        RuntimeSafetyViolation
      );
    });
  }
}

test('error messages never include the actual offending value or any secret-shaped text', () => {
  const attempts: NodeJS.ProcessEnv[] = [
    { ...SAFE_EXPLICIT_ENV, LEASEMIND_RUNTIME_MODE: 'production' },
    { ...SAFE_EXPLICIT_ENV, LEASEMIND_PRODUCTION_LAUNCH_GATE: 'open' },
    { ...SAFE_EXPLICIT_ENV, LEASEMIND_ALLOW_REAL_PII: 'true' },
    { ...SAFE_EXPLICIT_ENV, LEASEMIND_ALLOW_REAL_PAYMENTS: 'TRUE' },
    {
      ...SAFE_EXPLICIT_ENV,
      LEASEMIND_ALLOW_PROTECTED_REVEAL: 'yes',
      DATABASE_URL: 'postgres://lmapp_dev:synthetic-dev-only-password@127.0.0.1:5433/lmapp_dev'
    }
  ];
  for (const env of attempts) {
    try {
      enforceRuntimeSafetyGate(env);
      assert.fail('expected enforceRuntimeSafetyGate to throw');
    } catch (error) {
      assert.ok(error instanceof RuntimeSafetyViolation);
      assert.equal(error.message.includes('synthetic-dev-only-password'), false);
      assert.equal(error.message.includes('postgres://'), false);
      assert.equal(error.message.includes('DATABASE_URL'), false);
    }
  }
});

test('NODE_ENV is never consulted: production NODE_ENV alone does not bypass or fail the gate', () => {
  const policy = enforceRuntimeSafetyGate({ ...SAFE_EXPLICIT_ENV, NODE_ENV: 'production' });
  assert.deepEqual(policy, SAFE_POLICY);
});
