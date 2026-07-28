export const CT_EVIDENCE_MATRIX = Object.freeze({
  'CT-001': ['CT-001'],
  'CT-002': ['CT-002', 'PG-019'],
  'CT-003': ['CT-003'],
  'CT-004': ['CT-004'],
  'CT-005': ['CT-005'],
  'CT-006': ['CT-006'],
  'CT-007': ['CT-007', 'PG-010'],
  'CT-008': ['CT-008', 'PG-007'],
  'CT-009': ['CT-009', 'PG-014'],
  'CT-010': ['CT-010', 'PG-015'],
  'CT-011': ['CT-011', 'PG-016'],
  'CT-012': ['CT-012', 'PG-016'],
  'CT-013': ['CT-013', 'PG-024'],
  'CT-014': ['CT-014', 'PG-005'],
  'CT-015': ['CT-015', 'PG-017'],
  'CT-016': ['CT-016', 'PG-025'],
  'CT-017': ['CT-017', 'PG-018'],
  'CT-018': ['CT-018'],
  'CT-019': ['CT-019'],
  'CT-020': ['CT-020'],
  'CT-021': ['CT-021', 'PG-019'],
  'CT-022': ['PG-009', 'PG-022'],
  'CT-023': ['CT-023', 'PG-020', 'PG-026'],
  'CT-024': ['CT-024'],
  'CT-025': ['CT-025'],
  'CT-026': ['CT-026', 'PG-030'],
  'CT-027': ['CT-027'],
  'CT-028': ['CT-028'],
  'CT-029': ['CT-029'],
  'CT-030': ['PG-027'],
  'CT-031': ['PG-028'],
  'CT-032': ['PG-022'],
  'CT-033': ['PG-029']
});

export const CT_EVIDENCE_REQUIREMENTS = Object.freeze({
  'CT-002': [
    {dependency:'PG-019',path:'negative_payload_mutations',minimum:232},
    {dependency:'PG-019',path:'rollback_absence_checks',minimum:232},
    {dependency:'PG-019',path:'independent_regression_probes.invalid_calendar_timestamp',equals:1}
  ],
  'CT-009': [
    {dependency:'PG-014',path:'provider_operation_duplicate_rejected',equals:1},
    {dependency:'PG-014',path:'receipt_duplicate_rejected',equals:1},
    {dependency:'PG-014',path:'credit_application_duplicate_rejected',equals:1},
    {dependency:'PG-014',path:'event_inbox_duplicate_insert_rejected',equals:1},
    {dependency:'PG-014',path:'event_inbox_unique_key',equals:['consumer_id','event_id']}
  ],
  'CT-018': [
    {dependency:'CT-018',path:'individual_fields_rejected',equals:11},
    {dependency:'CT-018',path:'side_effects_before_rejection',
      equals:{token_lookup:0,attempt_created:0,bytes_issued:0}}
  ],
  'CT-021': [
    {dependency:'PG-019',path:'valid_event_payloads',equals:33},
    {dependency:'PG-019',path:'negative_payload_mutations',minimum:232},
    {dependency:'PG-019',path:'independent_regression_probes.identity_authority_version_below_minimum',equals:1},
    {dependency:'PG-019',path:'independent_regression_probes.purpose_code_above_maxLength',equals:1},
    {dependency:'PG-019',path:'independent_regression_probes.policy_version_below_minLength',equals:1}
  ],
  'CT-023': [
    {dependency:'PG-026',path:'classifier_version',equals:'DLP_EVENT_CONTENT_V1'},
    {dependency:'PG-026',path:'normalized_phone_probes',minimum:6},
    {dependency:'PG-026',path:'normalized_passport_probes',minimum:3},
    {dependency:'PG-026',path:'rollback_absence_checks',minimum:15},
    {dependency:'PG-026',path:'unsafe_value_echoes',equals:0}
  ],
  'CT-024': [
    {dependency:'CT-024',path:'allowed_tombstone_fields',
      equals:['deleted_at','deletion_act_hash','deletion_category','policy_version','unlink_operation_id']},
    {dependency:'CT-024',path:'prohibited_source_fields_absent',minimum:8},
    {dependency:'CT-024',path:'stable_source_hashes_absent',minimum:2},
    {dependency:'CT-024',path:'deletion_act_hash_preserved',equals:1}
  ],
  'CT-026': [
    {dependency:'CT-026',path:'persisted_attempt',equals:1},
    {dependency:'CT-026',path:'crash_after_commit_replayed_same_attempt',equals:1},
    {dependency:'PG-030',path:'immutable_attempt_created_atomically',equals:1},
    {dependency:'PG-030',path:'server_calculated_result_hash',equals:1},
    {dependency:'PG-030',path:'caller_supplied_result_fields',equals:0},
    {dependency:'PG-030',path:'failure_rollbacks_verified',minimum:2},
    {dependency:'PG-030',path:'concurrent_connections',minimum:2},
    {dependency:'PG-030',path:'concurrent_attempt_rows',equals:1}
  ],
  'CT-028': [
    {dependency:'CT-028',path:'explicit_routing_rows',equals:33},
    {dependency:'CT-028',path:'owner_consumer_bindings',equals:33},
    {dependency:'CT-028',path:'consumer_operations_checked',equals:33},
    {dependency:'CT-028',path:'valid_exact_bindings',equals:33},
    {dependency:'CT-028',path:'ordered_mismatch_probes',equals:264},
    {dependency:'CT-028',path:'accepted_mismatches',equals:0},
    {dependency:'CT-028',path:'structurally_indistinguishable_pairs',equals:0},
    {dependency:'CT-028',path:'swap_self_test_blocked',equals:1},
    // SEVENTH-B05: the 33 immutable (event_type, consumer_operation, channel,
    // message, payload_schema) tuples CT-028 resolves from the routing table
    // must equal this exact, hand-verified-against-asyncapi.yaml canonical
    // list -- sorted deterministically by event_type. A deep JSON equality
    // check against this fixed literal is, in one assertion, a duplicate
    // check (a duplicate or missing/extra event_type changes the array),
    // an exact-match-with-routing-table check, and a sort-stability check.
    {dependency:'CT-028',path:'bindings',equals:[
      {event_type:'ADVANCE_DEBIT_CONFIRMED',consumer_operation:'consumeFinancialFact',channel:'financial',message:'financialFact',payload_schema:'FinancialEventEnvelope'},
      {event_type:'ADVANCE_RECEIPT_FISCALIZED',consumer_operation:'consumeFinancialFact',channel:'financial',message:'financialFact',payload_schema:'FinancialEventEnvelope'},
      {event_type:'ADVANCE_SETTLED_AND_FISCALIZED',consumer_operation:'consumeFinancialFact',channel:'financial',message:'financialFact',payload_schema:'FinancialEventEnvelope'},
      {event_type:'CREDIT_APPLIED',consumer_operation:'consumeFinancialFact',channel:'financial',message:'financialFact',payload_schema:'FinancialEventEnvelope'},
      {event_type:'CREDIT_REVERSED',consumer_operation:'consumeFinancialFact',channel:'financial',message:'financialFact',payload_schema:'FinancialEventEnvelope'},
      {event_type:'DELIVERY_CONFIRMED_BY_DECISION',consumer_operation:'consumeDecisionRecorded',channel:'decisions',message:'decisionRecorded',payload_schema:'DecisionEventEnvelope'},
      {event_type:'DISCLOSURE_CHALLENGED',consumer_operation:'consumeRecordTransitioned',channel:'introductionRecord',message:'recordTransitioned',payload_schema:'RecordEventEnvelope'},
      {event_type:'DISPUTE_REJECTED',consumer_operation:'consumeDecisionRecorded',channel:'decisions',message:'decisionRecorded',payload_schema:'DecisionEventEnvelope'},
      {event_type:'DISPUTE_UPHELD',consumer_operation:'consumeDecisionRecorded',channel:'decisions',message:'decisionRecorded',payload_schema:'DecisionEventEnvelope'},
      {event_type:'FINAL_SETTLEMENT_FISCALIZED',consumer_operation:'consumeFinancialFact',channel:'financial',message:'financialFact',payload_schema:'FinancialEventEnvelope'},
      {event_type:'FINANCIAL_READINESS_INVALIDATED',consumer_operation:'consumeFinancialFact',channel:'financial',message:'financialFact',payload_schema:'FinancialEventEnvelope'},
      {event_type:'FISCAL_CORRECTION_CONFIRMED',consumer_operation:'consumeFinancialFact',channel:'financial',message:'financialFact',payload_schema:'FinancialEventEnvelope'},
      {event_type:'IDENTITY_AUTHORITY_INVALIDATED',consumer_operation:'consumeIdentityAuthorityChanged',channel:'identityAuthority',message:'identityAuthorityChanged',payload_schema:'IdentityAuthorityEventEnvelope'},
      {event_type:'LAWFUL_BASIS_INVALIDATED',consumer_operation:'consumeLawfulBasisChanged',channel:'lawfulBasis',message:'lawfulBasisChanged',payload_schema:'LawfulBasisEventEnvelope'},
      {event_type:'LAWFUL_BASIS_REVOKED',consumer_operation:'consumeLawfulBasisChanged',channel:'lawfulBasis',message:'lawfulBasisChanged',payload_schema:'LawfulBasisEventEnvelope'},
      {event_type:'NO_DELIVERY_CONFIRMED_BY_DECISION',consumer_operation:'consumeDecisionRecorded',channel:'decisions',message:'decisionRecorded',payload_schema:'DecisionEventEnvelope'},
      {event_type:'PARTICIPATION_ACCEPTED',consumer_operation:'consumeAcceptanceChanged',channel:'participation',message:'acceptanceChanged',payload_schema:'ParticipationEventEnvelope'},
      {event_type:'PARTICIPATION_INVALIDATED',consumer_operation:'consumeAcceptanceChanged',channel:'participation',message:'acceptanceChanged',payload_schema:'ParticipationEventEnvelope'},
      {event_type:'PAYER_ASSIGNED',consumer_operation:'consumePayerAssigned',channel:'payerResolution',message:'payerAssigned',payload_schema:'PayerEventEnvelope'},
      {event_type:'PAYER_RESOLUTION_REQUIRED',consumer_operation:'consumePayerAssigned',channel:'payerResolution',message:'payerAssigned',payload_schema:'PayerEventEnvelope'},
      {event_type:'PAYMENT_AUTHORIZATION_RELEASED',consumer_operation:'consumeFinancialFact',channel:'financial',message:'financialFact',payload_schema:'FinancialEventEnvelope'},
      {event_type:'PAYMENT_AUTHORIZED',consumer_operation:'consumeFinancialFact',channel:'financial',message:'financialFact',payload_schema:'FinancialEventEnvelope'},
      {event_type:'PREVIOUS_CONTACT_DECISION_CHANGED',consumer_operation:'consumePreviousContactChanged',channel:'previousContact',message:'previousContactChanged',payload_schema:'PreviousContactEventEnvelope'},
      {event_type:'PRE_REVEAL_VOIDED',consumer_operation:'consumeRecordTransitioned',channel:'introductionRecord',message:'recordTransitioned',payload_schema:'RecordEventEnvelope'},
      {event_type:'PROTECTION_END_REACHED',consumer_operation:'consumeRecordTransitioned',channel:'introductionRecord',message:'recordTransitioned',payload_schema:'RecordEventEnvelope'},
      {event_type:'RECORD_PRE_REVEAL_LOCKED',consumer_operation:'consumeRecordTransitioned',channel:'introductionRecord',message:'recordTransitioned',payload_schema:'RecordEventEnvelope'},
      {event_type:'REFUND_CONFIRMED',consumer_operation:'consumeFinancialFact',channel:'financial',message:'financialFact',payload_schema:'FinancialEventEnvelope'},
      {event_type:'REVEAL_COMMITTED',consumer_operation:'consumeRecordTransitioned',channel:'introductionRecord',message:'recordTransitioned',payload_schema:'RecordEventEnvelope'},
      {event_type:'REVEAL_DELIVERY_CONFIRMED',consumer_operation:'consumeRecordTransitioned',channel:'introductionRecord',message:'recordTransitioned',payload_schema:'RecordEventEnvelope'},
      {event_type:'REVEAL_DELIVERY_EVIDENCE_SUBMITTED',consumer_operation:'consumeEvidenceSubmitted',channel:'revealEvidence',message:'evidenceSubmitted',payload_schema:'EvidenceEventEnvelope'},
      {event_type:'REVEAL_DELIVERY_UNCERTAIN',consumer_operation:'consumeRecordTransitioned',channel:'introductionRecord',message:'recordTransitioned',payload_schema:'RecordEventEnvelope'},
      {event_type:'SECOND_PARTY_FINANCIAL_EXPOSURE_CLEARED',consumer_operation:'consumeFinancialFact',channel:'financial',message:'financialFact',payload_schema:'FinancialEventEnvelope'},
      {event_type:'SECOND_PARTY_REFUND_AND_FISCAL_CORRECTION_CONFIRMED',consumer_operation:'consumeFinancialFact',channel:'financial',message:'financialFact',payload_schema:'FinancialEventEnvelope'}
    ]}
  ],
  'CT-030': [
    {dependency:'PG-027',path:'mismatch_rejections',equals:5},
    {dependency:'PG-027',path:'rollback_absence_checks',equals:5},
    {dependency:'PG-027',path:'exact_composite_acceptances',equals:1},
    {dependency:'PG-027',path:'mismatch_dimensions',
      equals:['introduction_record_id','encounter_id','reveal_gate_snapshot_id',
        'recipient_party_id','manifest_hash']}
  ]
});

const valueAtPath=(value,path)=>path.split('.').reduce((current,key)=>
  current && Object.prototype.hasOwnProperty.call(current,key) ? current[key] : undefined,value);
const sameValue=(left,right)=>JSON.stringify(left)===JSON.stringify(right);

export function resolveCtEvidence(
  contractResults,
  postgresResults,
  matrix = CT_EVIDENCE_MATRIX,
  requirements = CT_EVIDENCE_REQUIREMENTS
) {
  const all = new Map([...contractResults, ...postgresResults].map(item => [item.id, item]));
  return Object.entries(matrix).map(([id, dependencies]) => {
    const missing = dependencies.filter(dependency => !all.has(dependency));
    const nonPass = dependencies.filter(dependency =>
      all.has(dependency) && all.get(dependency).status !== 'PASS');
    const semanticChecks=(requirements[id]??[]).map(requirement=>{
      const dependency=all.get(requirement.dependency);
      const actual=dependency
        ? valueAtPath(dependency.evidence ?? {},requirement.path)
        : undefined;
      const passed=requirement.equals!==undefined
        ? sameValue(actual,requirement.equals)
        : typeof actual==='number' && actual>=requirement.minimum;
      return {...requirement,actual,status:passed?'PASS':'FAIL'};
    });
    const semanticGaps=semanticChecks.filter(check=>check.status!=='PASS');
    const status = missing.length ? 'NOT_RUN'
      : nonPass.length || semanticGaps.length ? 'BLOCKED'
      : 'PASS';
    return {
      id,
      status,
      dependencies,
      evidence: dependencies.filter(dependency => all.has(dependency)).map(dependency => ({
        id: dependency,
        status: all.get(dependency).status,
        level: all.get(dependency).level ?? 'database_behavior'
      })),
      missing,
      non_pass: nonPass,
      semantic_checks:semanticChecks,
      semantic_gaps:semanticGaps
    };
  });
}
