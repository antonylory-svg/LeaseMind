import {createHash, randomUUID} from 'node:crypto';

export const canonicalJson = value => {
  const normalize = current => {
    if (Array.isArray(current)) return current.map(normalize);
    if (current && typeof current === 'object') {
      return Object.fromEntries(Object.keys(current).sort()
        .map(key => [key, normalize(current[key])]));
    }
    return current;
  };
  return JSON.stringify(normalize(value));
};
export const sha256 = value => createHash('sha256').update(value).digest('hex');

export function classifySchemaChange(before, after) {
  const beforeRequired = new Set(before.required ?? []);
  const afterRequired = new Set(after.required ?? []);
  const requiredAdded = [...afterRequired].some(key => !beforeRequired.has(key));
  const enumRemoved = Object.entries(before.properties ?? {}).some(([key, schema]) => {
    if (!schema.enum) return false;
    const next = after.properties?.[key]?.enum ?? [];
    return schema.enum.some(value => !next.includes(value));
  });
  if (requiredAdded || enumRemoved) return 'MAJOR_REQUIRED';
  const added = Object.keys(after.properties ?? {}).filter(key => !(key in (before.properties ?? {})));
  return added.every(key => !afterRequired.has(key)) ? 'MINOR_COMPATIBLE' : 'MAJOR_REQUIRED';
}

export class IdempotencyStore {
  #rows = new Map();
  execute(key, payload, responseFactory) {
    const hash = sha256(canonicalJson(payload));
    const current = this.#rows.get(key);
    if (current) {
      if (current.requestHash !== hash) throw new Error('LM-IDEMPOTENCY-PAYLOAD-CONFLICT');
      return structuredClone(current.response);
    }
    const response = responseFactory();
    this.#rows.set(key, Object.freeze({requestHash: hash, response: structuredClone(response)}));
    return structuredClone(response);
  }
}

export function validateFinancialIntent(value) {
  if (value.total_amount_minor !== 1_000_000) throw new Error('LM-PAYMENT-AMOUNT-INVALID');
  if (value.credit_amount_minor + value.debit_amount_minor !== value.total_amount_minor) {
    throw new Error('LM-PAYMENT-COMPOSITION-INVALID');
  }
  const valid = {
    DEBIT: value.credit_amount_minor === 0 && value.debit_amount_minor === 1_000_000,
    CREDIT: value.debit_amount_minor === 0 && value.credit_amount_minor === 1_000_000,
    MIXED: value.credit_amount_minor > 0 && value.debit_amount_minor > 0
  };
  if (!valid[value.payment_path]) throw new Error('LM-PAYMENT-COMPOSITION-INVALID');
  return true;
}

export function validateLeaseSet(leases, sourceVersions, now) {
  const required = [
    'PARTICIPATION_SERVICE', 'PAYER_RESOLUTION', 'PREVIOUS_CONTACT_DECISION',
    'PAYMENT_FISCAL_LEDGER', 'IDENTITY_AUTHORITY_REGISTRY',
    'LAWFUL_BASIS_CONSENT_REGISTRY'
  ];
  if (leases.length !== required.length || new Set(leases.map(x => x.source_system)).size !== 6) {
    throw new Error('LM-GATE-LEASE-SET-INCOMPLETE');
  }
  for (const source of required) {
    const lease = leases.find(item => item.source_system === source);
    if (!lease || lease.state !== 'ACTIVE' || lease.expires_at <= now
        || lease.source_version !== sourceVersions[source]) {
      throw new Error('LM-GATE-LEASE-INVALID');
    }
  }
  return true;
}

export class RevealGuardModel {
  constructor(epoch = 1) { this.epoch = epoch; this.leases = new Map(); }
  acquire(source, version, expiresAt) {
    const lease = {lease_id: randomUUID(), source, version, epoch: this.epoch,
      expires_at: expiresAt, state: 'ACTIVE'};
    this.leases.set(source, lease);
    return structuredClone(lease);
  }
  invalidate(source, nextVersion) {
    const lease = this.leases.get(source);
    if (lease) lease.state = 'REVOKED';
    this.epoch += 1;
    return {source_version: nextVersion, guard_epoch: this.epoch};
  }
  assertToken(token, now) {
    if (token.guard_epoch !== this.epoch) throw new Error('LM-GATE-EPOCH-STALE');
    if (token.expires_at <= now) throw new Error('LM-REVEAL-TOKEN-EXPIRED');
    return true;
  }
}

const transitions = new Map([
  ['DRAFT:RECORD_PRE_REVEAL_LOCKED', 'PRE_REVEAL_LOCKED'],
  ['DRAFT:PRE_REVEAL_VOIDED', 'VOID_PRE_REVEAL'],
  ['PRE_REVEAL_LOCKED:PRE_REVEAL_VOIDED', 'VOID_PRE_REVEAL'],
  ['PRE_REVEAL_LOCKED:REVEAL_COMMITTED', 'REVEAL_COMMITTED'],
  ['REVEAL_COMMITTED:REVEAL_DELIVERY_CONFIRMED', 'REVEALED_ACTIVE'],
  ['REVEAL_COMMITTED:REVEAL_DELIVERY_UNCERTAIN', 'DISCLOSURE_DISPUTED'],
  ['REVEAL_COMMITTED:TIMEOUT', 'DISCLOSURE_DISPUTED'],
  ['DISCLOSURE_DISPUTED:DELIVERY_CONFIRMED_BY_DECISION', 'REVEALED_ACTIVE'],
  ['DISCLOSURE_DISPUTED:NO_DELIVERY_CONFIRMED_BY_DECISION', 'VOID_PRE_REVEAL'],
  ['REVEALED_ACTIVE:PROTECTION_END_REACHED', 'EXPIRED'],
  ['REVEALED_ACTIVE:DISCLOSURE_CHALLENGED', 'DISPUTED'],
  ['DISPUTED:DISPUTE_REJECTED', 'REVEALED_ACTIVE'],
  ['DISPUTED:DISPUTE_UPHELD', 'INVALIDATED_BY_DECISION']
]);

export function transitionRecord(state, event, evidence = {}) {
  const target = transitions.get(`${state}:${event}`);
  if (!target) throw new Error('LM-RECORD-TRANSITION-FORBIDDEN');
  if (event === 'REVEAL_DELIVERY_CONFIRMED' && !evidence.established_delivery_at) {
    throw new Error('LM-DELIVERY-EVIDENCE-INSUFFICIENT');
  }
  return target;
}

export class RevealTokenStore {
  #tokens = new Map();
  #results = new Map();
  #attempts = new Map();
  issue(context) {
    const credential = `opaque-${randomUUID()}`;
    this.#tokens.set(sha256(credential), {
      ...context,
      reveal_token_id: context.reveal_token_id ?? randomUUID(),
      redeemed_at: null
    });
    return credential;
  }
  redeem(credential, idempotencyKey, requestPayload, context, now, hooks = {}) {
    if (!credential) throw new Error('LM-REVEAL-TOKEN-INVALID');
    const token = this.#tokens.get(sha256(credential));
    if (!token) throw new Error('LM-REVEAL-TOKEN-INVALID');
    const requestHash = sha256(canonicalJson(requestPayload));
    const prior = this.#results.get(idempotencyKey);
    if (prior) {
      if (prior.request_hash !== requestHash) throw new Error('LM-IDEMPOTENCY-PAYLOAD-CONFLICT');
      return structuredClone(prior.result);
    }
    for (const key of ['recipient_party_id','snapshot_hash','manifest_hash','guard_epoch']) {
      if (token[key] !== context[key]) throw new Error('LM-REVEAL-TOKEN-BINDING-MISMATCH');
    }
    if (token.expires_at <= now) throw new Error('LM-REVEAL-TOKEN-EXPIRED');
    if (token.redeemed_at) throw new Error('LM-REVEAL-TOKEN-USED');
    hooks.beforeAttemptInsert?.();
    const attempt = Object.freeze({
      reveal_attempt_id: randomUUID(),
      reveal_token_id: token.reveal_token_id,
      introduction_record_id: token.introduction_record_id,
      encounter_id: token.encounter_id,
      reveal_gate_snapshot_id: token.reveal_gate_snapshot_id,
      recipient_party_id: token.recipient_party_id,
      manifest_hash: token.manifest_hash,
      operation_state: 'SUCCEEDED',
      attempted_at: now
    });
    hooks.afterAttemptInsert?.(structuredClone(attempt));
    const result = Object.freeze({
      status:'REDEEMED',
      redeemed_at:now,
      reveal_attempt_id:attempt.reveal_attempt_id
    });
    const resultHash = sha256(canonicalJson(result));
    hooks.beforeTokenUpdate?.({result:structuredClone(result),result_hash:resultHash});

    // Commit the immutable Attempt, token state and idempotent result as one modelled unit.
    // Hooks before the commit must leave all stores unchanged when they throw.
    this.#attempts.set(attempt.reveal_attempt_id,attempt);
    token.redeemed_at = now;
    token.redemption_idempotency_key = idempotencyKey;
    token.redemption_request_hash = requestHash;
    token.redemption_result_hash = resultHash;
    this.#results.set(idempotencyKey,Object.freeze({
      request_hash:requestHash,
      result,
      result_hash:resultHash,
      reveal_attempt_id:attempt.reveal_attempt_id
    }));
    hooks.afterTokenUpdate?.();
    return structuredClone(result);
  }
  attempt(attemptId) {
    const attempt = this.#attempts.get(attemptId);
    return attempt ? structuredClone(attempt) : null;
  }
  tokenState(credential) {
    const token = this.#tokens.get(sha256(credential));
    return token ? structuredClone(token) : null;
  }
}

// SEVENTH-B06: fixed domain separator for the deletion-act hash preimage.
// A trusted constant, never caller input, so the hash cannot collide with a
// hash computed under any other domain (event, result, another deletion act).
export const DELETION_ACT_DOMAIN_TAG = 'LEASEMIND_DELETION_ACT_V1';

export function cryptoUnlink(record) {
  const unlink_operation_id = randomUUID();
  const deletion_category = record.deletion_category;
  const policy_version = record.policy_version;
  const deleted_at = record.now;
  // record.deletion_act_hash is intentionally never read: the hash is always
  // derived server-side from server-owned/already-disclosed fields only.
  const deletion_act_hash = sha256(
    `${DELETION_ACT_DOMAIN_TAG}\0${canonicalJson({
      unlink_operation_id, deletion_category, policy_version, deleted_at
    })}`
  );
  return {
    unlink_operation_id,
    deletion_category,
    policy_version,
    deleted_at,
    deletion_act_hash
  };
}

export const FORBIDDEN_REVEAL_CONTEXT_FIELDS = Object.freeze([
  'encounter_id','introduction_record_id','recipient_party_id',
  'reveal_gate_snapshot_id','snapshot_hash','manifest_hash',
  'source_versions','source_leases','lease_ids','fencing_tokens','guard_epoch'
]);
export const ALLOWED_REVEAL_REDEMPTION_INPUT_FIELDS = Object.freeze([
  'opaque_credential','idempotency_key','authenticated_session_context'
]);

export function resolveTrustedRevealContext(command, authContext, tokenState, snapshotState) {
  const supplied = Object.keys(command).filter(field =>
    !ALLOWED_REVEAL_REDEMPTION_INPUT_FIELDS.includes(field));
  if (supplied.length) throw new Error('LM-REVEAL-CONTEXT-UNTRUSTED');
  return {
    encounter_id: tokenState.encounter_id,
    introduction_record_id: tokenState.introduction_record_id,
    recipient_party_id: authContext.recipient_party_id,
    reveal_gate_snapshot_id: tokenState.reveal_gate_snapshot_id,
    snapshot_hash: snapshotState.snapshot_hash,
    manifest_hash: tokenState.manifest_hash,
    source_leases: snapshotState.source_leases,
    guard_epoch: snapshotState.guard_epoch
  };
}

const DIRECT_IDENTIFIER_PATTERNS = [
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /(?:\+7[\s()-]*|8[\s(]+)\d{3}[\s()-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/,
  /(?:^|\D)[78]\d{10}(?:\D|$)/,
  /\b\d{4}\s+\d{6}\b/,
  /(?:^|\D)\d{10}(?:\D|$)/,
  /(?:^|\D)(?:\d{4}[ -]){3}\d{4}(?:\D|$)/,
  /(?:^|\D)\d{16,19}(?:\D|$)/,
  /(?:^|[^\p{L}])(?:улица|ул\.|проспект|дом|квартира|street|address)(?:[^\p{L}]|$)/iu
];
const FORBIDDEN_KEYS = /(?:email|phone|passport|bank|card|address|contact|full_name)/i;

// Canonical DLP scalar normalization, shared in intent with
// leasemind_security.normalize_dlp_scalar(text) in the PostgreSQL migration:
// Unicode NFKC, then strip everything except ASCII digits 0-9. This fail-closed
// \D-strip semantics must never be weakened — it is what makes every non-decimal
// separator (dots, underscores, slashes, NBSP, zero-width characters, mixed
// combinations) irrelevant to phone/passport/card detection.
export function normalizeDlpScalar(value) {
  return String(value).normalize('NFKC').replace(/\D/g, '');
}

export function containsDirectIdentifier(value) {
  const visit = current => {
    if (typeof current === 'string' || typeof current === 'number') {
      const asString = String(current);
      const compactDigits = normalizeDlpScalar(asString);
      if (/^[78]\d{10}$/.test(compactDigits) || /^\d{10}$/.test(compactDigits)
          || /^\d{16,19}$/.test(compactDigits)) return true;
      return DIRECT_IDENTIFIER_PATTERNS.some(pattern => pattern.test(asString));
    }
    if (Array.isArray(current)) return current.some(visit);
    if (current && typeof current === 'object') {
      return Object.entries(current).some(([key,nested]) => FORBIDDEN_KEYS.test(key) || visit(nested));
    }
    return false;
  };
  return visit(value);
}
