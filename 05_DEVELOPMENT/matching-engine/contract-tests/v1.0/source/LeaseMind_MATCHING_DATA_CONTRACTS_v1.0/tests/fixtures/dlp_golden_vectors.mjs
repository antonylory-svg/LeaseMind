// Shared golden DLP corpus for SEVENTH-B02 parity verification.
// Executed identically by tests/run_contract_suite.mjs (CT-023, service-only)
// and tests/run_postgres_suite.mjs (PG-026, service vs PostgreSQL parity).
// All values are synthetic; none correspond to real people, documents or cards.
// Never log `value` directly outside this file — only `id`/`class`/`separator`.
//
// The corpus is a programmatically generated cross-product of
// {phone, passport, card} x {15 separator variants}, plus one nested-object
// and one array vector per class -- not a hand-maintained per-class list.

const ZWSP = '​';
const ZWNJ = '‌';
const ZWJ = '‍';
const NBSP = ' ';
const NARROW_NBSP = ' ';
const MIXED_CYCLE = ['-', '.', '_', '/', ZWSP];
const LETTER_CYCLE = ['a', 'b', 'c', 'd', 'e', 'f'];
const SYMBOL_CYCLE = ['*', '#', '%', '^', '&'];

// Raw (unseparated) digit string per class, chosen to match the exact
// normative digit-length forms checked by both classifiers:
//   phone    -> ^[78]\d{10}$  (11 digits, leading 7 or 8)
//   passport -> ^\d{10}$      (10 digits)
//   card     -> ^\d{16,19}$   (16-19 digits)
const CLASS_DIGITS = {
  phone: '79991234567',
  passport: '4510123456',
  card: '4111111111111111'
};

// Column order matches the required 15-variant matrix exactly.
const SEPARATOR_VARIANTS = [
  {key: 'none', insert: () => ''},
  {key: 'space', insert: () => ' '},
  {key: 'hyphen', insert: () => '-'},
  {key: 'parentheses', insert: () => '('},
  {key: 'dot', insert: () => '.'},
  {key: 'underscore', insert: () => '_'},
  {key: 'slash', insert: () => '/'},
  {key: 'nbsp', insert: () => NBSP},
  {key: 'narrow-nbsp', insert: () => NARROW_NBSP},
  {key: 'zero-width-space', insert: () => ZWSP},
  {key: 'zero-width-non-joiner', insert: () => ZWNJ},
  {key: 'zero-width-joiner', insert: () => ZWJ},
  {key: 'mixed', insert: i => MIXED_CYCLE[i % MIXED_CYCLE.length]},
  {key: 'letters-between-digits', insert: i => LETTER_CYCLE[i % LETTER_CYCLE.length]},
  {key: 'other-symbols-between-digits', insert: i => SYMBOL_CYCLE[i % SYMBOL_CYCLE.length]}
];

function applySeparator(digits, variant) {
  const chars = [...digits];
  return chars.reduce((out, char, index) =>
    index === 0 ? char : `${out}${variant.insert(index - 1)}${char}`, '');
}

export const DLP_MALICIOUS_SCALAR_VECTORS = Object.entries(CLASS_DIGITS).flatMap(
  ([klass, digits]) => SEPARATOR_VARIANTS.map(variant => ({
    id: `${klass}-${variant.key}`,
    class: klass,
    separator: variant.key,
    value: applySeparator(digits, variant)
  }))
);

const DOT_VARIANT = SEPARATOR_VARIANTS.find(variant => variant.key === 'dot');

export const DLP_MALICIOUS_CONTAINER_VECTORS = Object.entries(CLASS_DIGITS).flatMap(
  ([klass, digits]) => {
    const separatedValue = applySeparator(digits, DOT_VARIANT);
    return [
      {
        id: `${klass}-nested-object`,
        class: klass,
        container: 'nested-object',
        value: {level1: {level2: {leaf: separatedValue}}}
      },
      {
        id: `${klass}-array`,
        class: klass,
        container: 'array',
        value: {items: ['synthetic-control', separatedValue, 'other-synthetic']}
      }
    ];
  }
);

export const DLP_MALICIOUS_VECTORS = [...DLP_MALICIOUS_SCALAR_VECTORS, ...DLP_MALICIOUS_CONTAINER_VECTORS];

// Each safe control normalizes (NFKC + strip non-digits) to a digit run that is
// NOT 10, NOT 11, and NOT 16-19 digits long -- must be accepted by both layers.
// Values are also kept between 16 and 64 characters so they fit unconstrained
// through the outbox trace_id column (char_length between 16 and 64) without
// tripping unrelated schema/enum checks.
export const DLP_SAFE_CONTROL_VECTORS = [
  {id: 'safe-short-trace', value: 'trace-synthetic-0001'},
  {id: 'safe-nine-digits', value: 'order-ref-123456789'},
  {id: 'safe-order-code', value: 'ORD-2026-0042-SYNTHETIC'},
  {id: 'safe-version-tag', value: 'v1.0.0-synthetic-build'},
  {id: 'safe-seven-digits-letters', value: 'a1b2c3d4e5f6g7h-synthetic'}
];

const CLASS_NAMES = Object.keys(CLASS_DIGITS);
const CONTAINER_KINDS = ['nested-object', 'array'];

// Pure computation, no throw -- callers decide how to assert/fail.
export function computeDlpMatrixCoverage() {
  const classCoverage = Object.fromEntries(CLASS_NAMES.map(klass => [
    klass,
    new Set(DLP_MALICIOUS_SCALAR_VECTORS.filter(v => v.class === klass).map(v => v.separator)).size
  ]));
  const containerCoverage = Object.fromEntries(CLASS_NAMES.map(klass => [
    klass,
    CONTAINER_KINDS.filter(kind =>
      DLP_MALICIOUS_CONTAINER_VECTORS.some(v => v.class === klass && v.container === kind)
    ).length
  ]));
  const expectedSeparators = SEPARATOR_VARIANTS.length;
  const expectedContainers = CONTAINER_KINDS.length;
  return {
    expectedSeparators,
    expectedContainers,
    classCoverage,
    containerCoverage,
    totalMalicious: DLP_MALICIOUS_VECTORS.length,
    totalSafe: DLP_SAFE_CONTROL_VECTORS.length,
    isComplete:
      CLASS_NAMES.every(klass => classCoverage[klass] === expectedSeparators) &&
      CLASS_NAMES.every(klass => containerCoverage[klass] === expectedContainers) &&
      DLP_MALICIOUS_VECTORS.length >= CLASS_NAMES.length * expectedSeparators + CLASS_NAMES.length * expectedContainers &&
      DLP_SAFE_CONTROL_VECTORS.length >= 5
  };
}
