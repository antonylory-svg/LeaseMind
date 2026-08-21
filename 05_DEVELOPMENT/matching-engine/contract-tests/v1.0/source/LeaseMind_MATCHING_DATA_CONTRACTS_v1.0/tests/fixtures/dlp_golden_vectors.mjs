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

// --- SEVENTH-B02 corrective pass: forbidden-KEY parity corpus, V2 ----------
// Distinct from the VALUE corpus above: these vectors exercise whether an
// object *key name* (not its value) is correctly classified as a forbidden
// direct-identifier field, by both containsDirectIdentifier (JS) and
// leasemind_security.scan_dlp_scalar (PostgreSQL, via is_forbidden_dlp_key).
//
// V1 used exact-key matching, which was fail-open: composite/prefixed/
// suffixed keys such as customer_email or contact_email never equal a bare
// forbidden token exactly, so they were silently accepted. V2 matches a
// forbidden token as a SUBSTRING of the normalized key, gated by a closed,
// exact, normative allowlist of the four real required schema field names
// that would otherwise be false-positively blocked (derived by exhaustively
// checking every properties key in openapi.yaml/asyncapi.yaml against all 8
// tokens -- see tests/synthetic_service_models.mjs DLP_NORMATIVE_KEY_ALLOWLIST
// for the full derivation note). V1's five artificial "safe" keys
// (cardinality_note, bankside_reference_code, addressable_range_flag,
// phoneme_count, emailable_status) were never real schema fields and are
// REMOVED from the safe corpus below -- under V2 they are correctly
// classified as forbidden (each contains a real token as a substring) and
// keeping them as "safe" would have masked identifier payloads.
//
// Cross-product of 8 canonical forbidden tokens x 14 case/evasion variants,
// generated the same way as the value corpus above (not a hand-maintained
// per-token list).
const FORBIDDEN_KEY_TOKENS = ['email', 'phone', 'passport', 'bank', 'card', 'address', 'contact', 'full_name'];

const insertAfterFirstChar = (word, separator) => `${word.charAt(0)}${separator}${word.slice(1)}`;
const toFullwidth = word => [...word].map(ch => {
  const code = ch.charCodeAt(0);
  return code >= 97 && code <= 122 ? String.fromCharCode(code + 65248) : ch;
}).join('');

const KEY_EVASION_VARIANTS = [
  {key: 'lowercase', apply: token => token},
  {key: 'uppercase', apply: token => token.toUpperCase()},
  {key: 'capitalized', apply: token => token.charAt(0).toUpperCase() + token.slice(1)},
  {key: 'hyphen-inserted', apply: token => insertAfterFirstChar(token, '-')},
  {key: 'dot-inserted', apply: token => insertAfterFirstChar(token, '.')},
  {key: 'underscore-inserted', apply: token => insertAfterFirstChar(token, '_')},
  {key: 'slash-inserted', apply: token => insertAfterFirstChar(token, '/')},
  {key: 'space-inserted', apply: token => insertAfterFirstChar(token, ' ')},
  {key: 'nbsp-inserted', apply: token => insertAfterFirstChar(token, NBSP)},
  {key: 'narrow-nbsp-inserted', apply: token => insertAfterFirstChar(token, NARROW_NBSP)},
  {key: 'zero-width-space-inserted', apply: token => insertAfterFirstChar(token, ZWSP)},
  {key: 'zero-width-non-joiner-inserted', apply: token => insertAfterFirstChar(token, ZWNJ)},
  {key: 'zero-width-joiner-inserted', apply: token => insertAfterFirstChar(token, ZWJ)},
  {key: 'nfkc-fullwidth', apply: token => toFullwidth(token)}
];

export const DLP_FORBIDDEN_KEY_VECTORS = FORBIDDEN_KEY_TOKENS.flatMap(token =>
  KEY_EVASION_VARIANTS.map(variant => ({
    id: `key-${token}-${variant.key}`,
    token,
    variant: variant.key,
    key: variant.apply(token)
  }))
);

// Exactly the four real, required, contractual field names that appear
// anywhere in openapi.yaml/asyncapi.yaml and contain a forbidden token as a
// substring (exhaustively verified against all 128 distinct schema field
// names, not hand-picked) -- these MUST be accepted by both layers via the
// closed DLP_NORMATIVE_KEY_ALLOWLIST exception, never by weakening the
// substring match itself.
export const DLP_SAFE_KEY_CONTROL_VECTORS = [
  {id: 'safe-key-previous-contact-decision-id', key: 'previous_contact_decision_id'},
  {id: 'safe-key-previous-contact-decision-version', key: 'previous_contact_decision_version'},
  {id: 'safe-key-previous-contact-policy-hash', key: 'previous_contact_policy_hash'},
  {id: 'safe-key-previous-contact-policy-version', key: 'previous_contact_policy_version'}
];

// A handful of ordinary real schema field names that contain NO forbidden
// substring at all, proving the substring scan does not over-trigger on the
// common (non-exception) case.
export const DLP_SAFE_ORDINARY_KEY_VECTORS = [
  {id: 'safe-key-encounter-id', key: 'encounter_id'},
  {id: 'safe-key-payment-intent-id', key: 'payment_intent_id'},
  {id: 'safe-key-reason-code', key: 'reason_code'},
  {id: 'safe-key-schema-version', key: 'schema_version'}
];

// Composite/prefixed/suffixed identifier keys -- the exact class V1's
// exact-match strategy missed. None of these equal a bare forbidden token,
// but every one contains one (or, for contact_email, two) as a substring
// and MUST be rejected by both layers under V2.
export const DLP_FORBIDDEN_COMPOSITE_KEY_VECTORS = [
  {id: 'composite-customer-email', key: 'customer_email', token: 'email'},
  {id: 'composite-contact-email', key: 'contact_email', token: 'email'},
  {id: 'composite-user-phone', key: 'user_phone', token: 'phone'},
  {id: 'composite-passport-data', key: 'passport_data', token: 'passport'},
  {id: 'composite-bank-account', key: 'bank_account', token: 'bank'},
  {id: 'composite-payment-card', key: 'payment_card', token: 'card'},
  {id: 'composite-delivery-address', key: 'delivery_address', token: 'address'},
  {id: 'composite-full-name-value', key: 'full_name_value', token: 'full_name'}
];

// The same composite keys nested one level inside an object and inside an
// array, mirroring the nested-object/array VALUE container vectors above --
// proves the recursive object-key scan (not just the top level) still
// catches composite forbidden keys under V2.
export const DLP_FORBIDDEN_COMPOSITE_CONTAINER_VECTORS = [
  {
    id: 'composite-container-customer-email-nested-object',
    container: 'nested-object',
    value: {level1: {level2: {customer_email: 'synthetic-marker-value'}}}
  },
  {
    id: 'composite-container-delivery-address-array',
    container: 'array',
    value: {items: ['synthetic-control', {delivery_address: 'synthetic-marker-value'}, 'other-synthetic']}
  }
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
  const keyCoverage = Object.fromEntries(FORBIDDEN_KEY_TOKENS.map(token => [
    token,
    new Set(DLP_FORBIDDEN_KEY_VECTORS.filter(v => v.token === token).map(v => v.variant)).size
  ]));
  const expectedKeyVariants = KEY_EVASION_VARIANTS.length;
  const compositeCoverage = Object.fromEntries(
    DLP_FORBIDDEN_COMPOSITE_KEY_VECTORS.map(v => [v.id, true])
  );
  const compositeContainerCoverage = Object.fromEntries(
    CONTAINER_KINDS.map(kind => [
      kind,
      DLP_FORBIDDEN_COMPOSITE_CONTAINER_VECTORS.some(v => v.container === kind)
    ])
  );
  return {
    expectedSeparators,
    expectedContainers,
    classCoverage,
    containerCoverage,
    totalMalicious: DLP_MALICIOUS_VECTORS.length,
    totalSafe: DLP_SAFE_CONTROL_VECTORS.length,
    expectedKeyVariants,
    keyCoverage,
    totalForbiddenKeyVectors: DLP_FORBIDDEN_KEY_VECTORS.length,
    totalSafeKeyVectors: DLP_SAFE_KEY_CONTROL_VECTORS.length,
    totalSafeOrdinaryKeyVectors: DLP_SAFE_ORDINARY_KEY_VECTORS.length,
    totalCompositeKeyVectors: DLP_FORBIDDEN_COMPOSITE_KEY_VECTORS.length,
    compositeCoverage,
    compositeContainerCoverage,
    isComplete:
      CLASS_NAMES.every(klass => classCoverage[klass] === expectedSeparators) &&
      CLASS_NAMES.every(klass => containerCoverage[klass] === expectedContainers) &&
      DLP_MALICIOUS_VECTORS.length >= CLASS_NAMES.length * expectedSeparators + CLASS_NAMES.length * expectedContainers &&
      DLP_SAFE_CONTROL_VECTORS.length >= 5 &&
      FORBIDDEN_KEY_TOKENS.every(token => keyCoverage[token] === expectedKeyVariants) &&
      DLP_FORBIDDEN_KEY_VECTORS.length === FORBIDDEN_KEY_TOKENS.length * expectedKeyVariants &&
      DLP_SAFE_KEY_CONTROL_VECTORS.length === 4 &&
      DLP_SAFE_ORDINARY_KEY_VECTORS.length >= 4 &&
      DLP_FORBIDDEN_COMPOSITE_KEY_VECTORS.length === 8 &&
      Object.values(compositeCoverage).every(Boolean) &&
      CONTAINER_KINDS.every(kind => compositeContainerCoverage[kind])
  };
}
