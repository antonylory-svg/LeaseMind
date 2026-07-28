const UUID = '00000000-0000-4000-8000-000000000001';
const UUID2 = '00000000-0000-4000-8000-000000000002';
export const UUID_V7 = '00000000-0000-7000-8000-000000000001';
const TIME = '2026-07-24T10:00:00Z';
const HASH = 'a'.repeat(64);

export function sampleFromSchema(schema, root, seen = new Set()) {
  if (!schema) return {};
  if (schema.$ref) {
    if (seen.has(schema.$ref)) return {};
    const target = schema.$ref.split('/').slice(1)
      .reduce((value, segment) => value[segment.replaceAll('~1', '/').replaceAll('~0', '~')], root);
    return sampleFromSchema(target, root, new Set([...seen, schema.$ref]));
  }
  if (schema.const !== undefined) return schema.const;
  if (schema.enum) return schema.enum[0];
  if (schema.allOf) {
    const own = {...schema};
    delete own.allOf;
    return Object.assign(
      sampleFromSchema(own, root, seen),
      ...schema.allOf.map(item => sampleFromSchema(item, root, seen))
    );
  }
  if (schema.oneOf) return sampleFromSchema(schema.oneOf[0], root, seen);
  if (schema.type === 'array') {
    const count = schema.minItems ?? 1;
    return Array.from({length: count}, (_, index) => {
      const value = sampleFromSchema(schema.items, root, seen);
      if (typeof value === 'string' && value === UUID && index === 1) return UUID2;
      return value;
    });
  }
  if (schema.type === 'object' || schema.properties) {
    const value = {};
    for (const key of schema.required ?? []) {
      value[key] = sampleFromSchema(schema.properties?.[key], root, seen);
    }
    return value;
  }
  if (schema.format === 'uuid') return UUID;
  if (schema.format === 'date-time') return TIME;
  if (schema.format === 'uri') return 'https://synthetic.invalid/problem';
  if (schema.type === 'integer' || schema.type === 'number') return schema.minimum ?? 1;
  if (schema.type === 'boolean') return false;
  if (schema.pattern === '^[a-f0-9]{64}$') return HASH;
  if (schema.type === 'string') return schema.minLength && schema.minLength > 1
    ? 'synthetic'.padEnd(schema.minLength, 'x')
    : 'synthetic';
  return {};
}

export function openApiFixtures(openapi) {
  const fixtures = [];
  for (const [path, pathItem] of Object.entries(openapi.paths)) {
    for (const method of ['post', 'put', 'patch', 'delete', 'get']) {
      const operation = pathItem[method];
      if (!operation) continue;
      const requestSchema = operation.requestBody?.content?.['application/json']?.schema;
      const body = requestSchema ? sampleFromSchema(requestSchema, openapi) : undefined;
      if (operation.operationId === 'submitDeliveryEvidence') {
        body.evidence_classification = 'SUFFICIENT';
        body.established_delivery_at = TIME;
      }
      if (operation.operationId === 'recordDisputeDecision') {
        body.decision_type = 'DELIVERY_CONFIRMED_BY_DECISION';
        body.established_delivery_at = TIME;
      }
      if (operation.operationId === 'commitRevealSnapshot' && body.parties) {
        body.parties[0].party_role = 'OWNER';
        body.parties[1].party_role = 'TENANT';
        body.parties[1].party_id = UUID2;
        body.parties[1].acceptance_record_id = UUID2;
        body.parties[1].lawful_basis_id = UUID2;
        const sources = [
          'PARTICIPATION_SERVICE', 'PAYER_RESOLUTION', 'PREVIOUS_CONTACT_DECISION',
          'PAYMENT_FISCAL_LEDGER', 'IDENTITY_AUTHORITY_REGISTRY',
          'LAWFUL_BASIS_CONSENT_REGISTRY'
        ];
        body.source_leases.forEach((lease, index) => {
          lease.source_system = sources[index];
          lease.lease_id = `00000000-0000-4000-8000-${String(index + 10).padStart(12, '0')}`;
          lease.aggregate_id = `00000000-0000-4000-8000-${String(index + 20).padStart(12, '0')}`;
        });
      }
      fixtures.push({
        id: `operation:${operation.operationId}`,
        kind: 'openapi-operation',
        path,
        method,
        operationId: operation.operationId,
        requestSchema,
        body
      });
      for (const [status, response] of Object.entries(operation.responses ?? {})) {
        if (!status.startsWith('4')) continue;
        fixtures.push({
          id: `error:${operation.operationId}:${status}`,
          kind: 'openapi-error',
          operationId: operation.operationId,
          status,
          response,
          body: {
            type: 'https://synthetic.invalid/problem',
            title: 'Synthetic rejection',
            status: Number(status),
            code: 'LM-SYNTHETIC-REJECTION',
            correlation_id: UUID,
            retryable: false
          }
        });
      }
    }
  }
  return fixtures;
}

export function canonicalEventFixtures(asyncapi) {
  const schemas = asyncapi.components.schemas;
  const groups = [
    ['PayerEventEnvelope', ['PAYER_ASSIGNED', 'PAYER_RESOLUTION_REQUIRED']],
    ['ParticipationEventEnvelope', ['PARTICIPATION_ACCEPTED', 'PARTICIPATION_INVALIDATED']],
    ['IdentityAuthorityEventEnvelope', ['IDENTITY_AUTHORITY_INVALIDATED']],
    ['LawfulBasisEventEnvelope', ['LAWFUL_BASIS_INVALIDATED', 'LAWFUL_BASIS_REVOKED']],
    ['PreviousContactEventEnvelope', ['PREVIOUS_CONTACT_DECISION_CHANGED']],
    ['FinancialEventEnvelope', [
      'PAYMENT_AUTHORIZED', 'PAYMENT_AUTHORIZATION_RELEASED', 'ADVANCE_DEBIT_CONFIRMED',
      'CREDIT_APPLIED', 'CREDIT_REVERSED', 'ADVANCE_RECEIPT_FISCALIZED',
      'ADVANCE_SETTLED_AND_FISCALIZED', 'REFUND_CONFIRMED', 'FISCAL_CORRECTION_CONFIRMED',
      'SECOND_PARTY_REFUND_AND_FISCAL_CORRECTION_CONFIRMED',
      'SECOND_PARTY_FINANCIAL_EXPOSURE_CLEARED', 'FINANCIAL_READINESS_INVALIDATED',
      'FINAL_SETTLEMENT_FISCALIZED'
    ]],
    ['RecordEventEnvelope', [
      'RECORD_PRE_REVEAL_LOCKED', 'PRE_REVEAL_VOIDED', 'REVEAL_COMMITTED',
      'REVEAL_DELIVERY_CONFIRMED', 'REVEAL_DELIVERY_UNCERTAIN',
      'DISCLOSURE_CHALLENGED', 'PROTECTION_END_REACHED'
    ]],
    ['EvidenceEventEnvelope', ['REVEAL_DELIVERY_EVIDENCE_SUBMITTED']],
    ['DecisionEventEnvelope', [
      'DELIVERY_CONFIRMED_BY_DECISION', 'NO_DELIVERY_CONFIRMED_BY_DECISION',
      'DISPUTE_REJECTED', 'DISPUTE_UPHELD'
    ]]
  ];
  return groups.flatMap(([schemaName, eventTypes]) => eventTypes.map(eventType => {
    const envelope = sampleFromSchema(schemas[schemaName], asyncapi);
    envelope.event_type = eventType;
    envelope.schema_version = '1.0.0';
    envelope.event_id = UUID;
    envelope.aggregate_id = UUID;
    envelope.correlation_id = UUID;
    envelope.causation_id = UUID;
    envelope.occurred_at = TIME;
    envelope.payload_hash = HASH;
    envelope.producer = {
      PayerEventEnvelope: 'payer-resolution',
      ParticipationEventEnvelope: 'participation',
      IdentityAuthorityEventEnvelope: 'identity-authority-registry',
      LawfulBasisEventEnvelope: 'lawful-basis-consent-registry',
      PreviousContactEventEnvelope: 'legal-decision',
      FinancialEventEnvelope: 'payment-fiscal-ledger',
      RecordEventEnvelope: 'introduction-record-service',
      EvidenceEventEnvelope: 'reveal-service',
      DecisionEventEnvelope: 'legal-decision'
    }[schemaName];
    if (eventType === 'PAYER_RESOLUTION_REQUIRED') {
      envelope.payload.resolution_state = 'PAYER_RESOLUTION_REQUIRED';
    }
    if (eventType === 'PARTICIPATION_INVALIDATED') {
      envelope.payload.acceptance_status = 'INVALIDATED';
    }
    if (eventType === 'LAWFUL_BASIS_REVOKED') {
      envelope.payload.reason_code = 'REVOKED';
    }
    if (schemaName === 'RecordEventEnvelope') {
      envelope.payload = sampleFromSchema(schemas.RecordEventPayload, asyncapi);
      const transitions = {
        RECORD_PRE_REVEAL_LOCKED: ['DRAFT', 'PRE_REVEAL_LOCKED'],
        PRE_REVEAL_VOIDED: ['PRE_REVEAL_LOCKED', 'VOID_PRE_REVEAL'],
        REVEAL_COMMITTED: ['PRE_REVEAL_LOCKED', 'REVEAL_COMMITTED'],
        REVEAL_DELIVERY_CONFIRMED: ['REVEAL_COMMITTED', 'REVEALED_ACTIVE'],
        REVEAL_DELIVERY_UNCERTAIN: ['REVEAL_COMMITTED', 'DISCLOSURE_DISPUTED'],
        DISCLOSURE_CHALLENGED: ['REVEALED_ACTIVE', 'DISPUTED'],
        PROTECTION_END_REACHED: ['REVEALED_ACTIVE', 'EXPIRED']
      };
      [envelope.payload.from_state, envelope.payload.to_state] = transitions[eventType];
    }
    if (envelope.payload && eventType === 'REVEAL_DELIVERY_CONFIRMED') {
      envelope.payload.from_state = 'REVEAL_COMMITTED';
      envelope.payload.to_state = 'REVEALED_ACTIVE';
      envelope.payload.established_delivery_at = TIME;
      envelope.payload.protection_starts_at = TIME;
      envelope.payload.protection_ends_at = '2027-07-24T10:00:00Z';
    }
    if (envelope.payload && schemaName === 'DecisionEventEnvelope') {
      envelope.payload.decision_type = eventType;
      if (eventType === 'DELIVERY_CONFIRMED_BY_DECISION') {
        envelope.payload.established_delivery_at = TIME;
      } else {
        delete envelope.payload.established_delivery_at;
      }
    }
    if (envelope.payload && eventType === 'REVEAL_DELIVERY_EVIDENCE_SUBMITTED'
        && envelope.payload.evidence_classification === 'SUFFICIENT') {
      envelope.payload.established_delivery_at = TIME;
    }
    return {id: `event:${eventType}`, schemaName, eventType, envelope};
  }));
}
