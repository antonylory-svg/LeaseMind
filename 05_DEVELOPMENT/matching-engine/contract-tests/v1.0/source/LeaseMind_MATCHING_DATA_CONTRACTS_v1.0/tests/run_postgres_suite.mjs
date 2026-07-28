import assert from 'node:assert/strict';
import {readFile, rm} from 'node:fs/promises';
import {writeSync} from 'node:fs';
import EmbeddedPostgres from 'embedded-postgres';
import pgModule from 'pg';
import YAML from 'yaml';
import {canonicalEventFixtures, UUID_V7} from '../fixtures/synthetic_fixtures.mjs';
import {containsDirectIdentifier} from './synthetic_service_models.mjs';
import {
  DLP_MALICIOUS_VECTORS, DLP_SAFE_CONTROL_VECTORS, computeDlpMatrixCoverage
} from './fixtures/dlp_golden_vectors.mjs';

const root = new URL('../', import.meta.url);
const runId = `${process.pid}-${Date.now()}`;
const databaseDir = process.env.LM_PG_DATA_DIR ?? `/tmp/leasemind-postgres-${runId}`;
const port = 55432 + (process.pid % 500);
const password = 'synthetic-contract-test-only';
const embedded = !process.env.DATABASE_URL;
const rawDatabaseUrl = process.env.DATABASE_URL ?? '';
const scrubSecrets = text => {
  let scrubbed = String(text ?? '');
  if (rawDatabaseUrl) {
    scrubbed = scrubbed.split(rawDatabaseUrl).join('[DATABASE_URL redacted]');
  }
  return scrubbed.replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, '[connection string redacted]');
};
const pg = embedded ? new EmbeddedPostgres({
  databaseDir,
  user: 'postgres',
  password,
  port,
  persistent: false,
  postgresFlags: ['-c', 'unix_socket_directories='],
  onLog: message => process.stderr.write(`[postgres] ${String(message)}`),
  onError: message => process.stderr.write(`[postgres] ${String(message)}\n`)
}) : null;

const results = [];
const pass = (id, detail, evidence = {}) => {
  results.push({id, status: 'PASS', detail, evidence});
  process.stderr.write(`${id} PASS — ${detail}\n`);
};
const stripPsql = sql => sql.replace(/^\\set.*$/gm, '');

async function expectRejected(client, id, sql, params, pattern) {
  try {
    await client.query(sql, params);
    throw new Error(`${id}: statement unexpectedly succeeded`);
  } catch (error) {
    if (String(error.message).includes('unexpectedly succeeded')) throw error;
    if (pattern) assert.match(String(error.message), pattern);
    pass(id, `rejected as required: ${error.code ?? 'domain error'}`);
  }
}

async function assertRejected(client, sql, params, pattern) {
  try {
    await client.query(sql, params);
    throw new Error('statement unexpectedly succeeded');
  } catch (error) {
    if (String(error.message).includes('unexpectedly succeeded')) throw error;
    if (pattern) assert.match(String(error.message), pattern);
  }
}

function eventUuid(counter, namespace = '5', version = '4') {
  const hex = counter.toString(16).padStart(4, '0');
  return `00000000-${hex}-${version}${namespace}00-8000-${String(counter).padStart(12, '0')}`;
}

const FORBIDDEN_UUID_VERSIONS = ['1', '2', '3', '5', '6', '8'];
// Every character except the mandatory version nibble is a hex letter (a-f),
// so the fully digit-stripped DLP normalization (SEVENTH-B02) always sees
// exactly one digit for this value -- never 10, 11, or 16-19 -- regardless
// of which field or event it is substituted into. No counter is needed:
// the value only ever appears in a rejected mutation or an already-unique
// row, never as a uniqueness key itself.
const uuidVersionSample = version => `aaaaaaaa-aaaa-${version}aaa-aaaa-aaaaaaaaaaaa`;

function conditionalMutation(eventType, payload) {
  const value = structuredClone(payload);
  if (eventType === 'PAYER_ASSIGNED') value.resolution_state = 'PAYER_RESOLUTION_REQUIRED';
  else if (eventType === 'PAYER_RESOLUTION_REQUIRED') value.resolution_state = 'ASSIGNED';
  else if (eventType === 'PARTICIPATION_ACCEPTED') value.acceptance_status = 'INVALIDATED';
  else if (eventType === 'PARTICIPATION_INVALIDATED') value.acceptance_status = 'ACCEPTED';
  else if (eventType === 'REVEAL_DELIVERY_EVIDENCE_SUBMITTED') {
    value.evidence_classification = 'PARTIAL';
    value.established_delivery_at = '2026-07-24T10:00:00Z';
  } else if ([
    'DELIVERY_CONFIRMED_BY_DECISION','NO_DELIVERY_CONFIRMED_BY_DECISION',
    'DISPUTE_REJECTED','DISPUTE_UPHELD'
  ].includes(eventType)) {
    value.decision_type = eventType === 'DISPUTE_UPHELD' ? 'DISPUTE_REJECTED' : 'DISPUTE_UPHELD';
  } else if ('from_state' in value) {
    value.from_state = 'DRAFT';
    value.to_state = 'EXPIRED';
  } else {
    value.reason_code = 'PAYER_ASSIGNMENT_CHANGED';
  }
  return value;
}

function resolveSchema(schema, root) {
  if (!schema?.$ref) return schema ?? {};
  return schema.$ref.split('/').slice(1).reduce((value, segment) =>
    value[segment.replaceAll('~1','/').replaceAll('~0','~')],root);
}

function invalidTypeValue(schema) {
  const type=resolveSchema(schema, schema);
  if (type.type === 'integer' || type.type === 'number') return {synthetic:true};
  if (type.type === 'string' || type.enum || type.const !== undefined) return {synthetic:true};
  return 'wrong-type';
}

function payloadMutations(eventType, payload, rawSchema, asyncapi) {
  const schema=resolveSchema(rawSchema,asyncapi);
  const mutations=[];
  const add=(name,field,value,remove=false)=>{
    const mutated=structuredClone(payload);
    if(remove) delete mutated[field];
    else mutated[field]=value;
    mutations.push([`${name}:${field}`,mutated]);
  };

  for(const field of schema.required ?? []){
    add('missing-required',field,undefined,true);
    add('null-required',field,null);
  }

  for(const [field,rawFieldSchema] of Object.entries(schema.properties ?? {})){
    const fieldSchema=resolveSchema(rawFieldSchema,asyncapi);
    add('wrong-type',field,invalidTypeValue(fieldSchema));
    if(fieldSchema.format==='uuid') {
      add('invalid-uuid',field,'not-a-uuid');
      for (const version of FORBIDDEN_UUID_VERSIONS) {
        add(`invalid-uuid-v${version}`,field,uuidVersionSample(version));
      }
    }
    if(fieldSchema.format==='date-time') {
      add('invalid-rfc3339-calendar',field,'2026-99-99T99:99:99Z');
      add('invalid-rfc3339-day',field,'2026-02-30T10:00:00Z');
    }
    if(fieldSchema.pattern) add('pattern',field,'INVALID');
    if(fieldSchema.enum) add('enum',field,'UNKNOWN_ENUM');
    if(fieldSchema.const!==undefined) add('const',field,'INVALID_CONST');
    if(fieldSchema.minimum!==undefined) add('minimum',field,fieldSchema.minimum-1);
    if(fieldSchema.maximum!==undefined) add('maximum',field,fieldSchema.maximum+1);
    if(fieldSchema.minLength!==undefined) {
      add('minLength',field,'x'.repeat(Math.max(0,fieldSchema.minLength-1)));
    }
    if(fieldSchema.maxLength!==undefined) {
      add('maxLength',field,'x'.repeat(fieldSchema.maxLength+1));
    }
  }

  mutations.push([
    'unknown-field:synthetic_extra_field',
    {...structuredClone(payload),synthetic_extra_field:'synthetic'}
  ]);
  mutations.push(['conditional:event-specific',conditionalMutation(eventType,payload)]);
  return mutations;
}

let client;
let primaryError;
try {
  if (embedded) {
    await pg.initialise();
    await pg.start();
    client = pg.getPgClient();
  } else {
    client = new pgModule.Client({connectionString: process.env.DATABASE_URL});
  }
  await client.connect();

  const up = await readFile(new URL('../migrations/001_matching_critical_chain.up.sql', import.meta.url), 'utf8');
  await client.query(up);
  pass('PG-001', 'exact up migration executed');

  const catalog = stripPsql(await readFile(new URL('./postgres_catalog_assertions.sql', import.meta.url), 'utf8'));
  await client.query(catalog);
  pass('PG-002', 'catalog, grants, RLS and immutable-trigger assertions executed');
  const versionResult = await client.query('show server_version_num');
  const serverVersionNum = Number(versionResult.rows[0].server_version_num);
  assert.ok(serverVersionNum >= 150000, `PostgreSQL 15+ required, got ${serverVersionNum}`);

  const ids = {
    encounter: '00000000-0000-4000-8000-000000000101',
    payerAggregate: '00000000-0000-4000-8000-000000000102',
    matchPair: '00000000-0000-4000-8000-000000000103',
    match: '00000000-0000-4000-8000-000000000104',
    payer: '00000000-0000-4000-8000-000000000105',
    campaign: '00000000-0000-4000-8000-000000000106',
    aggregate: '00000000-0000-4000-8000-000000000107',
    lease: '00000000-0000-4000-8000-000000000108',
    event: '00000000-0000-4000-8000-000000000109',
    correlation: '00000000-0000-4000-8000-000000000110'
  };
  const now = '2026-07-24T10:00:00Z';
  const later = '2026-07-24T10:05:00Z';
  const hash = 'a'.repeat(64);
  // SEVENTH-B03: redeem_reveal_token now uses real clock_timestamp(), which
  // is not the fixed 2026-07-24 literals used elsewhere in this file -- any
  // value actually compared against server time inside that function must
  // be anchored to the live database clock instead.
  const dbNowRow = await client.query('select clock_timestamp() as now');
  const dbNow = dbNowRow.rows[0].now;
  const dbPlusMinutes = minutes => new Date(dbNow.getTime() + minutes * 60000).toISOString();
  const dbMinusMinutes = minutes => new Date(dbNow.getTime() - minutes * 60000).toISOString();
  const payerInvalidationPayload = {
    encounter_id: ids.encounter,
    match_pair_id: ids.matchPair,
    resolution_state: 'PAYER_RESOLUTION_REQUIRED',
    payer_assignment_version: 2,
    reason_code: 'PAYER_ASSIGNMENT_CHANGED'
  };
  const asyncapi = YAML.parse(await readFile(new URL('../asyncapi.yaml', import.meta.url),'utf8'));
  const eventFixtures = canonicalEventFixtures(asyncapi);
  const payloadByEvent = new Map(eventFixtures.map(item => [item.eventType, item.envelope.payload]));

  await client.query(`insert into payer_resolution_aggregate(
    payer_resolution_aggregate_id, encounter_id, match_pair_id,
    payer_party_id, payer_campaign_id, payer_assignment_version,
    resolution_state, aggregate_version, updated_at
  ) values ($1,$2,$3,$4,$5,1,'ASSIGNED',1,$6)`,
  [ids.payerAggregate, ids.encounter, ids.matchPair, ids.payer, ids.campaign, now]);
  const guard = await client.query(
    `select guard_epoch from leasemind_security.reveal_guard where encounter_id=$1`,
    [ids.encounter]
  );
  assert.equal(guard.rows[0].guard_epoch, '1');
  pass('PG-003', 'encounter trigger initialized guard idempotently at epoch 1');

  await client.query(`insert into source_reveal_lease(
    lease_id, source_system, aggregate_id, encounter_id, source_version,
    fencing_token, source_owner_role, issued_at, expires_at, lease_state
  ) values ($1,'PAYER_RESOLUTION',$2,$3,1,1,'leasemind_payer_writer',$4,$5,'ACTIVE')`,
  [ids.lease, ids.aggregate, ids.encounter, now, '2026-07-24T11:00:00Z']);
  pass('PG-004', 'source lease initialized source state through guarded trigger');

  const epoch = await client.query(
    `select leasemind_security.apply_safety_critical_invalidation(
      'PAYER_RESOLUTION',$1,$2,1,2,$3,'PAYER_REASSIGNED',$4,
      'PAYER_RESOLUTION_REQUIRED','payer-resolution',$5,$5,'trace-synthetic-00',
      'idem-synthetic-000',$6::jsonb,$7
    ) as epoch`,
    [ids.aggregate, ids.encounter, later, ids.event, ids.correlation,
      JSON.stringify(payerInvalidationPayload), hash]
  );
  assert.equal(epoch.rows[0].epoch, '2');
  const lifecycle = await client.query(
    `select
      (select source_version from reveal_source_state where aggregate_id=$1) as source_version,
      (select lease_state from source_reveal_lease where lease_id=$2) as lease_state,
      (select guard_epoch from leasemind_security.reveal_guard where encounter_id=$3) as guard_epoch,
      (select count(*) from event_outbox where event_id=$4)::int as outbox_count`,
    [ids.aggregate, ids.lease, ids.encounter, ids.event]
  );
  assert.deepEqual(lifecycle.rows[0], {
    source_version: '2', lease_state: 'REVOKED', guard_epoch: '2', outbox_count: 1
  });
  pass('PG-005', 'source version, lease revocation, epoch bump and outbox write committed atomically');

  const replay = await client.query(
    `select leasemind_security.apply_safety_critical_invalidation(
      'PAYER_RESOLUTION',$1,$2,1,2,$3,'PAYER_REASSIGNED',$4,
      'PAYER_RESOLUTION_REQUIRED','payer-resolution',$5,$5,'trace-synthetic-00',
      'idem-synthetic-000',$6::jsonb,$7
    ) as epoch`,
    [ids.aggregate, ids.encounter, later, ids.event, ids.correlation,
      JSON.stringify(payerInvalidationPayload), hash]
  );
  assert.equal(replay.rows[0].epoch, '2');
  pass('PG-006', 'same event and payload replay is idempotent');

  await expectRejected(client, 'PG-007',
    `select leasemind_security.apply_safety_critical_invalidation(
      'PAYER_RESOLUTION',$1,$2,1,2,$3,'PAYER_REASSIGNED',$4,
      'PAYER_ASSIGNMENT_INVALIDATED','payer-resolution',$5,null,'trace-synthetic-00',
      'idem-synthetic-000',$6::jsonb,$7
    )`,
    [ids.aggregate, ids.encounter, later, ids.event, ids.correlation,
      JSON.stringify({...payerInvalidationPayload, reason_code:'CONCURRENT_ORDER_UNPROVABLE'}), 'b'.repeat(64)],
    /LM-IDEMPOTENCY-PAYLOAD-CONFLICT/);

  await expectRejected(client, 'PG-008',
    `insert into event_outbox(
      event_id,domain_owner_role,event_type,schema_version,aggregate_id,aggregate_version,
      occurred_at,producer,correlation_id,trace_id,idempotency_key,data_classification,
      payload,payload_hash,created_at
    ) values ('00000000-0000-4000-8000-000000000120','leasemind_participation_writer',
      'ADVANCE_SETTLED_AND_FISCALIZED','1.0.0',$1,1,$2,'payment-fiscal-ledger',$3,
      'trace-cross','idem-cross','PSEUDONYMIZED_PERSONAL_DATA_NO_DIRECT_IDENTIFIERS',
      '{}'::jsonb,$4,$2)`,
    [ids.aggregate, now, ids.correlation, hash], /LM-OUTBOX-DOMAIN-MISMATCH/);

  const domains = [
    ['leasemind_payer_writer', 'payer-resolution', 'PAYER_ASSIGNED'],
    ['leasemind_participation_writer', 'participation', 'PARTICIPATION_ACCEPTED'],
    ['leasemind_previous_contact_writer', 'legal-decision', 'DISPUTE_REJECTED'],
    ['leasemind_financial_writer', 'payment-fiscal-ledger', 'PAYMENT_AUTHORIZED'],
    ['leasemind_identity_authority_writer', 'identity-authority-registry', 'IDENTITY_AUTHORITY_INVALIDATED'],
    ['leasemind_lawful_basis_writer', 'lawful-basis-consent-registry', 'LAWFUL_BASIS_INVALIDATED'],
    ['leasemind_introduction_writer', 'introduction-record-service', 'REVEAL_COMMITTED'],
    ['leasemind_reveal_writer', 'reveal-service', 'REVEAL_DELIVERY_EVIDENCE_SUBMITTED']
  ];
  let crossDomainProbes = 0;
  for (let sourceIndex = 0; sourceIndex < domains.length; sourceIndex++) {
    for (let targetIndex = 0; targetIndex < domains.length; targetIndex++) {
      if (sourceIndex === targetIndex) continue;
      const [sourceRole] = domains[sourceIndex];
      const [targetRole, targetService, targetEvent] = domains[targetIndex];
      await client.query(`set role ${sourceRole}`);
      try {
        const eventId = `00000000-0000-4000-8${String(sourceIndex).padStart(3, '0')}-${String(targetIndex + 200).padStart(12, '0')}`;
        await assertRejected(client, `insert into event_outbox(
          event_id,domain_owner_role,event_type,schema_version,aggregate_id,aggregate_version,
          occurred_at,producer,correlation_id,causation_id,trace_id,idempotency_key,
          data_classification,payload,payload_hash,created_at
        ) values ($1,$2,$3,'1.0.0',$4,1,$5,$6,$7,$7,'trace-cross-pair',
          'idem-cross-pair','PSEUDONYMIZED_PERSONAL_DATA_NO_DIRECT_IDENTIFIERS',
          $8::jsonb,$9,$5)`,
        [eventId, targetRole, targetEvent, ids.aggregate, now, targetService, ids.correlation,
          JSON.stringify(payloadByEvent.get(targetEvent)), hash],
        /row-level security|permission denied/i);
        await assertRejected(client, `insert into command_idempotency_result(
          service_id,owner_role,idempotency_key,command_name,request_payload_hash,
          response_status,response_schema_version,response_payload,response_payload_hash,
          created_at,expires_at
        ) values ($1,$2,$3,'Synthetic',$4,200,'1.0.0','{}'::jsonb,$4,$5,'2026-07-25T10:00:00Z')`,
        [targetService, targetRole, `pair-${sourceIndex}-${targetIndex}`, hash, now],
        /row-level security|permission denied/i);
        crossDomainProbes += 2;
      } finally {
        await client.query('reset role');
      }
    }
  }
  assert.equal(crossDomainProbes, 112);
  pass('PG-009', 'all 56 ordered cross-domain role pairs rejected for outbox and idempotency');

  await client.query(`insert into command_idempotency_result(
    service_id,owner_role,idempotency_key,command_name,request_payload_hash,response_status,
    response_schema_version,response_payload,response_payload_hash,created_at,expires_at
  ) values ('payer-resolution','leasemind_payer_writer','idem-result','AssignPayer',$1,
    200,'1.0.0','{}'::jsonb,$1,$2,'2026-07-25T10:00:00Z')`, [hash, now]);
  await expectRejected(client, 'PG-010',
    `update command_idempotency_result set response_status=201
      where service_id='payer-resolution' and idempotency_key='idem-result'`,
    [], /immutable|permission denied/i);

  const acceptance = '00000000-0000-4000-8000-000000000130';
  const acceptedParty = '00000000-0000-4000-8000-000000000131';
  const otherParty = '00000000-0000-4000-8000-000000000132';
  await client.query(`insert into participation_acceptance(
    acceptance_record_id,encounter_id,match_id,party_id,party_role,payer_party_id,
    payer_campaign_id,aggregate_version,identity_version,identity_method,
    identity_evidence_ref,authority_version,authority_status,authority_evidence_ref,
    terms_version,terms_hash,consent_version,consent_hash,payer_notice_version,
    confirmed_account_id,signature_operation_id,signed_action,
    signature_verification_result,signature_evidence_ref,accepted_at
  ) values ($1,$2,$3,$4,'PAYER',$5,$6,1,1,'SYNTHETIC',$7,1,'VERIFIED',$7,
    '1.0',$8,'1.0',$8,'1.0',$7,$7,'SYNTHETIC_ACCEPT','VERIFIED',$7,$9)`,
  [acceptance, ids.encounter, ids.match, acceptedParty, ids.payer, ids.campaign,
    ids.correlation, hash, now]);
  await client.query('begin');
  try {
    await client.query(`insert into introduction_record(
      introduction_record_id,encounter_id,match_pair_id,match_id,campaign_ids,
      object_id,record_state,aggregate_version,match_rule_version,
      previous_contact_decision_id,previous_contact_policy_version,
      previous_contact_policy_hash,created_at,updated_at
    ) values ('00000000-0000-4000-8000-000000000133',$1,$2,$3,array[$4]::uuid[],
      '00000000-0000-4000-8000-000000000134','DRAFT',1,'synthetic-v1',$5,
      'synthetic-v1',$6,$7,$7)`,
    [ids.encounter, ids.matchPair, ids.match, ids.campaign, ids.correlation, hash, now]);
    await assertRejected(client, `insert into introduction_record_party(
      introduction_record_id,encounter_id,party_id,party_role,acceptance_record_id,
      acceptance_aggregate_version,terms_hash,lawful_basis_id,identity_authority_version
    ) values ('00000000-0000-4000-8000-000000000133',$1,$2,'OWNER_SIDE',$3,1,$4,$5,1)`,
    [ids.encounter, otherParty, acceptance, hash, ids.correlation], /foreign key/i);
  } finally {
    await client.query('rollback');
  }
  pass('PG-011', 'Acceptance from another party/encounter/version cannot bind to Introduction Record');

  const financialIntent = '00000000-0000-4000-8000-000000000140';
  await client.query(`insert into financial_intent(
    payment_intent_id,encounter_id,payer_party_id,payer_assignment_version,payment_path,
    total_amount_minor,credit_amount_minor,debit_amount_minor,currency,fencing_token,created_at
  ) values($1,'00000000-0000-4000-8000-000000000141',$2,1,'DEBIT',
    1000000,0,1000000,'RUB',1,$3)`, [financialIntent,ids.payer,now]);
  const baseFinancial = `insert into financial_ledger_event(
    financial_event_id,payment_intent_id,event_type,amount_minor,provider_id,
    provider_operation_id,fiscal_provider_id,receipt_id,credit_application_id,
    causation_id,payload_hash,occurred_at
  ) values($1,$2,'ADVANCE_DEBIT_CONFIRMED',1000000,'synthetic-provider',$3,
    'synthetic-fiscal',$4,$5,$6,$7,$8)`;
  await client.query(baseFinancial, [
    '00000000-0000-4000-8000-000000000142',financialIntent,'provider-op-1',
    'receipt-1','00000000-0000-4000-8000-000000000143',ids.correlation,hash,now
  ]);
  await assertRejected(client, baseFinancial, [
    '00000000-0000-4000-8000-000000000144',financialIntent,'provider-op-1',
    'receipt-2','00000000-0000-4000-8000-000000000145',ids.correlation,hash,now
  ], /duplicate key/i);
  await assertRejected(client, baseFinancial, [
    '00000000-0000-4000-8000-000000000146',financialIntent,'provider-op-2',
    'receipt-1','00000000-0000-4000-8000-000000000147',ids.correlation,hash,now
  ], /duplicate key/i);
  await assertRejected(client, baseFinancial, [
    '00000000-0000-4000-8000-000000000148',financialIntent,'provider-op-3',
    'receipt-3','00000000-0000-4000-8000-000000000143',ids.correlation,hash,now
  ], /duplicate key/i);
  const inboxEvent='00000000-0000-4000-8000-000000000149';
  await client.query(`insert into event_inbox(
    consumer_id,event_id,payload_hash,result_hash,processed_at
  ) values('synthetic-consumer',$1,$2,$2,$3)`,[inboxEvent,hash,now]);
  await assertRejected(client,`insert into event_inbox(
    consumer_id,event_id,payload_hash,result_hash,processed_at
  ) values('synthetic-consumer',$1,$2,$2,$3)`,[inboxEvent,hash,now],/duplicate key/i);
  pass(
    'PG-014',
    'provider operation, receipt, credit application and transactional event_inbox duplicates rejected',
    {
      provider_operation_duplicate_rejected:1,
      receipt_duplicate_rejected:1,
      credit_application_duplicate_rejected:1,
      event_inbox_duplicate_insert_rejected:1,
      event_inbox_unique_key:['consumer_id','event_id']
    }
  );

  await assertRejected(client, `insert into payer_resolution_aggregate(
    payer_resolution_aggregate_id,encounter_id,match_pair_id,resolution_state,
    aggregate_version,updated_at
  ) values('00000000-0000-4000-8000-000000000150',
    '00000000-0000-4000-8000-000000000151',$1,'ASSIGNED',1,$2)`,
  [ids.matchPair,now], /check constraint|duplicate key/i);
  pass('PG-015', 'payer assignment and active pair invariants reject invalid aggregate');

  await assertRejected(client, `insert into financial_intent(
    payment_intent_id,encounter_id,payer_party_id,payer_assignment_version,payment_path,
    total_amount_minor,credit_amount_minor,debit_amount_minor,currency,fencing_token,created_at
  ) values('00000000-0000-4000-8000-000000000152',
    '00000000-0000-4000-8000-000000000153',$1,1,'DEBIT',
    999999,1,999998,'RUB',1,$2)`, [ids.payer,now], /check constraint/i);
  pass('PG-016', 'invalid amount and DEBIT composition rejected by database');

  await assertRejected(client, `insert into source_reveal_lease(
    lease_id,source_system,source_owner_role,aggregate_id,encounter_id,source_version,
    fencing_token,issued_at,expires_at,lease_state
  ) values('00000000-0000-4000-8000-000000000154','PAYER_RESOLUTION',
    'leasemind_payer_writer',$1,$2,1,2,$3,'2026-07-24T12:00:00Z','ACTIVE')`,
  [ids.aggregate,ids.encounter,now], /LM-GATE-(SOURCE-VERSION|SNAPSHOT)-STALE|duplicate key/i);
  pass('PG-017', 'stale or duplicate source lease acquisition rejected');

  const expiringLease = '00000000-0000-4000-8000-000000000155';
  await client.query(`insert into source_reveal_lease(
    lease_id,source_system,source_owner_role,aggregate_id,encounter_id,source_version,
    fencing_token,issued_at,expires_at,lease_state
  ) values($1,'PARTICIPATION_SERVICE','leasemind_participation_writer',
    '00000000-0000-4000-8000-000000000156',$2,1,1,$3,'2026-07-24T10:01:00Z','ACTIVE')`,
  [expiringLease,ids.encounter,now]);
  await client.query(`select leasemind_security.transition_source_reveal_lease($1,'EXPIRED',$2)`,
    [expiringLease,'2026-07-24T10:02:00Z']);
  const expired = await client.query('select lease_state from source_reveal_lease where lease_id=$1',[expiringLease]);
  assert.equal(expired.rows[0].lease_state,'EXPIRED');
  pass('PG-018', 'lease expires only through guarded transition after expires_at');

  const eventDomains = new Map([
    ['PAYER_ASSIGNED',['leasemind_payer_writer','payer-resolution']],
    ['PAYER_RESOLUTION_REQUIRED',['leasemind_payer_writer','payer-resolution']],
    ['PARTICIPATION_ACCEPTED',['leasemind_participation_writer','participation']],
    ['PARTICIPATION_INVALIDATED',['leasemind_participation_writer','participation']],
    ['IDENTITY_AUTHORITY_INVALIDATED',['leasemind_identity_authority_writer','identity-authority-registry']],
    ['LAWFUL_BASIS_INVALIDATED',['leasemind_lawful_basis_writer','lawful-basis-consent-registry']],
    ['LAWFUL_BASIS_REVOKED',['leasemind_lawful_basis_writer','lawful-basis-consent-registry']],
    ['PREVIOUS_CONTACT_DECISION_CHANGED',['leasemind_previous_contact_writer','legal-decision']],
    ['REVEAL_DELIVERY_EVIDENCE_SUBMITTED',['leasemind_reveal_writer','reveal-service']]
  ]);
  for (const type of [
    'PAYMENT_AUTHORIZED','PAYMENT_AUTHORIZATION_RELEASED','ADVANCE_DEBIT_CONFIRMED',
    'CREDIT_APPLIED','CREDIT_REVERSED','ADVANCE_RECEIPT_FISCALIZED',
    'ADVANCE_SETTLED_AND_FISCALIZED','REFUND_CONFIRMED','FISCAL_CORRECTION_CONFIRMED',
    'SECOND_PARTY_REFUND_AND_FISCAL_CORRECTION_CONFIRMED',
    'SECOND_PARTY_FINANCIAL_EXPOSURE_CLEARED','FINANCIAL_READINESS_INVALIDATED',
    'FINAL_SETTLEMENT_FISCALIZED'
  ]) eventDomains.set(type,['leasemind_financial_writer','payment-fiscal-ledger']);
  for (const type of [
    'RECORD_PRE_REVEAL_LOCKED','PRE_REVEAL_VOIDED','REVEAL_COMMITTED',
    'REVEAL_DELIVERY_CONFIRMED','REVEAL_DELIVERY_UNCERTAIN',
    'DISCLOSURE_CHALLENGED','PROTECTION_END_REACHED'
  ]) eventDomains.set(type,['leasemind_introduction_writer','introduction-record-service']);
  for (const type of [
    'DELIVERY_CONFIRMED_BY_DECISION','NO_DELIVERY_CONFIRMED_BY_DECISION',
    'DISPUTE_REJECTED','DISPUTE_UPHELD'
  ]) eventDomains.set(type,['leasemind_previous_contact_writer','legal-decision']);

  let payloadProbes=0;
  let positiveV7Probes=0;
  const mutationEvidence=[];
  let mutationCounter=1000;
  for (let index=0; index<eventFixtures.length; index++) {
    const fixture=eventFixtures[index];
    const [role,producer]=eventDomains.get(fixture.eventType);
    const insert=`insert into event_outbox(
      event_id,domain_owner_role,event_type,schema_version,aggregate_id,aggregate_version,
      occurred_at,producer,correlation_id,causation_id,trace_id,idempotency_key,
      data_classification,payload,payload_hash,created_at
    ) values($1,$2,$3,'1.0.0',$4,1,$5,$6,$7,$7,'trace-synthetic-event',
      $8,'PSEUDONYMIZED_PERSONAL_DATA_NO_DIRECT_IDENTIFIERS',$9::jsonb,$10,$5)`;
    const eventId=eventUuid(mutationCounter++, '5');
    await client.query(insert,[eventId,role,fixture.eventType,eventUuid(mutationCounter++, '6'),now,producer,
      ids.correlation,`event-positive-${index}`,JSON.stringify(fixture.envelope.payload),hash]);
    payloadProbes += 1;

    const payloadSchemaName=fixture.schemaName.replace('Envelope','Payload');
    const payloadSchema=asyncapi.components.schemas[payloadSchemaName];
    assert.ok(payloadSchema,`${fixture.eventType}: payload schema missing`);

    const resolvedPayloadSchema=resolveSchema(payloadSchema,asyncapi);
    const uuidPayloadFields=Object.entries(resolvedPayloadSchema.properties ?? {})
      .filter(([,rawFieldSchema])=>resolveSchema(rawFieldSchema,asyncapi).format==='uuid')
      .map(([field])=>field);
    const v7Payload=structuredClone(fixture.envelope.payload);
    for (const field of uuidPayloadFields) {
      v7Payload[field]=index===0 ? UUID_V7 : uuidVersionSample('7');
    }
    const v7EventId=index===0 ? UUID_V7 : eventUuid(mutationCounter++, '5', '7');
    await client.query(insert,[v7EventId,role,fixture.eventType,
      eventUuid(mutationCounter++, '6', '7'),now,producer,ids.correlation,
      `event-positive-v7-${index}`,JSON.stringify(v7Payload),hash]);
    positiveV7Probes += 1;

    for (const [mutationName, mutatedPayload] of payloadMutations(
      fixture.eventType,
      fixture.envelope.payload,
      payloadSchema,
      asyncapi
    )) {
      const mutationEventId=eventUuid(mutationCounter++, '7');
      await assertRejected(client,insert,[mutationEventId,role,fixture.eventType,
        eventUuid(mutationCounter++, '8'),now,producer,ids.correlation,
        `event-${mutationName}-${index}`,JSON.stringify(mutatedPayload),hash],
        /LM-OUTBOX-PAYLOAD-/);
      const absent=await client.query(
        'select count(*)::int as count from event_outbox where event_id=$1',
        [mutationEventId]
      );
      assert.equal(absent.rows[0].count,0,`${fixture.eventType}/${mutationName} committed`);
      mutationEvidence.push({event_type:fixture.eventType,mutation:mutationName,status:'PASS'});
      payloadProbes += 1;
    }
  }
  const mutationKinds=new Map();
  for(const item of mutationEvidence){
    const kind=item.mutation.split(':',1)[0];
    mutationKinds.set(kind,(mutationKinds.get(kind)??0)+1);
  }
  for(const requiredKind of [
    'missing-required','null-required','wrong-type','invalid-uuid',
    'invalid-uuid-v1','invalid-uuid-v2','invalid-uuid-v3',
    'invalid-uuid-v5','invalid-uuid-v6','invalid-uuid-v8',
    'invalid-rfc3339-calendar','invalid-rfc3339-day','pattern','enum','const',
    'minimum','maximum','minLength','maxLength','unknown-field','conditional'
  ]) assert.ok((mutationKinds.get(requiredKind)??0)>0,`mutation kind not executed: ${requiredKind}`);
  const forbiddenUuidVersionMutations=mutationEvidence.filter(item=>
    item.mutation.startsWith('invalid-uuid-v')).length;
  assert.ok(forbiddenUuidVersionMutations>0);
  assert.ok(positiveV7Probes>=33);
  assert.equal(mutationEvidence.some(item=>
    item.event_type==='IDENTITY_AUTHORITY_INVALIDATED'
    && item.mutation==='minimum:identity_authority_version'),true);
  assert.equal(mutationEvidence.some(item=>
    item.event_type==='LAWFUL_BASIS_INVALIDATED'
    && item.mutation==='maxLength:purpose_code'),true);
  assert.equal(mutationEvidence.some(item=>
    item.event_type==='PREVIOUS_CONTACT_DECISION_CHANGED'
    && item.mutation==='minLength:policy_version'),true);
  assert.ok(mutationEvidence.length>231);
  pass(
    'PG-019',
    `33 valid event payloads (plus ${positiveV7Probes} UUID v7 positive probes) and ${mutationEvidence.length} per-constrained-field negative mutations executed; every rejection rolled back`,
    {
      valid_event_payloads:33,
      positive_uuid_v7_probes:positiveV7Probes,
      negative_payload_mutations:mutationEvidence.length,
      forbidden_uuid_version_mutations:forbiddenUuidVersionMutations,
      mutation_kinds:Object.fromEntries(mutationKinds),
      rollback_absence_checks:mutationEvidence.length,
      independent_regression_probes:{
        invalid_calendar_timestamp:1,
        identity_authority_version_below_minimum:1,
        purpose_code_above_maxLength:1,
        policy_version_below_minLength:1
      }
    }
  );

  await assertRejected(client, `insert into event_outbox(
    event_id,domain_owner_role,event_type,schema_version,aggregate_id,aggregate_version,
    occurred_at,producer,correlation_id,causation_id,trace_id,idempotency_key,
    data_classification,payload,payload_hash,created_at
  ) values('00000000-0000-4000-8000-000000000160','leasemind_payer_writer',
    'PAYER_ASSIGNED','1.0.0','00000000-0000-4000-8000-000000000161',1,$1,
    'payer-resolution',$2,$2,'trace-dlp','idem-dlp','DIRECT_IDENTIFIERS',
    $4::jsonb,$3,$1)`,[now,ids.correlation,hash,
      JSON.stringify(payloadByEvent.get('PAYER_ASSIGNED'))],/check constraint/i);
  pass('PG-020','event outbox rejects non-pseudonymized classification');

  const dlpInsert=`insert into event_outbox(
    event_id,domain_owner_role,event_type,schema_version,aggregate_id,aggregate_version,
    occurred_at,producer,correlation_id,causation_id,trace_id,idempotency_key,
    data_classification,payload,payload_hash,created_at
  ) values($1,'leasemind_payer_writer','PAYER_ASSIGNED','1.0.0',$2,1,$3,
    'payer-resolution',$4,$4,$5,$6,'PSEUDONYMIZED_PERSONAL_DATA_NO_DIRECT_IDENTIFIERS',
    $7::jsonb,$8,$3)`;
  const dlpProbes=[
    ['payload-email',{...payloadByEvent.get('PAYER_ASSIGNED'),reason_code:'alice@example.test'},'trace-safe-value','dlp-safe-idempotency'],
    ['trace-email',payloadByEvent.get('PAYER_ASSIGNED'),'alice@example.test','dlp-safe-idempotency'],
    ['payload-phone-plus7',{...payloadByEvent.get('PAYER_ASSIGNED'),reason_code:'+7 (999) 123-45-67'},'trace-safe-value','dlp-safe-idempotency'],
    ['payload-phone-7-contiguous',{...payloadByEvent.get('PAYER_ASSIGNED'),reason_code:'79991234567'},'trace-safe-value','dlp-safe-idempotency'],
    ['trace-phone-8-contiguous',payloadByEvent.get('PAYER_ASSIGNED'),'89991234567','dlp-safe-idempotency'],
    ['trace-phone-spaces',payloadByEvent.get('PAYER_ASSIGNED'),'8 999 123 45 67','dlp-safe-idempotency'],
    ['trace-phone-hyphens',payloadByEvent.get('PAYER_ASSIGNED'),'8-999-123-45-67','dlp-safe-idempotency'],
    ['trace-phone-parentheses',payloadByEvent.get('PAYER_ASSIGNED'),'8(999)1234567','dlp-safe-idempotency'],
    ['payload-passport-spaced',{...payloadByEvent.get('PAYER_ASSIGNED'),reason_code:'4500 123456'},'trace-safe-value','dlp-safe-idempotency'],
    ['payload-passport-contiguous',{...payloadByEvent.get('PAYER_ASSIGNED'),reason_code:'4510123456'},'trace-safe-value','dlp-safe-idempotency'],
    ['payload-passport-hyphenated',{...payloadByEvent.get('PAYER_ASSIGNED'),reason_code:'45-10-123456'},'trace-safe-value','dlp-safe-idempotency'],
    ['payload-card',{...payloadByEvent.get('PAYER_ASSIGNED'),reason_code:'4111 1111 1111 1111'},'trace-safe-value','dlp-safe-idempotency'],
    ['payload-address',{...payloadByEvent.get('PAYER_ASSIGNED'),reason_code:'улица Тестовая дом 1'},'trace-safe-value','dlp-safe-idempotency'],
    ['forbidden-key',{...payloadByEvent.get('PAYER_ASSIGNED'),email:'synthetic-at-example'},'trace-safe-value','dlp-safe-idempotency'],
    ['metadata-idempotency-phone',payloadByEvent.get('PAYER_ASSIGNED'),'trace-safe-value','meta-79991234567']
  ];
  let dlpCounter=2000;
  for(const [probe,payload,trace,idempotencyKey] of dlpProbes){
    const dlpEventId=eventUuid(dlpCounter++,'9');
    try{
      await client.query(dlpInsert,[dlpEventId,eventUuid(dlpCounter++,'a'),now,
        ids.correlation,trace,idempotencyKey,JSON.stringify(payload),hash]);
      throw new Error(`${probe}: DLP probe unexpectedly succeeded`);
    }catch(error){
      if(String(error.message).includes('unexpectedly succeeded')) throw error;
      assert.equal(String(error.message),'LM-DATA-CLASSIFICATION-VIOLATION',probe);
      assert.ok(!String(error.message).includes('alice@example.test'));
      assert.ok(!String(error.message).includes('+7 (999) 123-45-67'));
      assert.ok(!String(error.message).includes('4500 123456'));
      assert.ok(!String(error.message).includes('4510123456'));
      assert.ok(!String(error.message).includes('4111 1111 1111 1111'));
    }
    const absent=await client.query(
      'select count(*)::int as count from event_outbox where event_id=$1',[dlpEventId]);
    assert.equal(absent.rows[0].count,0,`${probe}: DLP rejection committed`);
  }

  const parityMismatchIds=[];
  let goldenMaliciousRejected=0;
  for(const vector of DLP_MALICIOUS_VECTORS){
    const probePayload={...payloadByEvent.get('PAYER_ASSIGNED'),reason_code:vector.value};
    const serviceVerdict=containsDirectIdentifier(probePayload);
    const goldenEventId=eventUuid(dlpCounter++,'9');
    let dbRejected=false;
    let dbErrorMessage='';
    try{
      await client.query(dlpInsert,[goldenEventId,eventUuid(dlpCounter++,'a'),now,
        ids.correlation,'trace-safe-value','dlp-golden-idempotency',
        JSON.stringify(probePayload),hash]);
    }catch(error){
      dbRejected=true;
      dbErrorMessage=String(error.message);
    }
    if(dbRejected){
      assert.equal(dbErrorMessage,'LM-DATA-CLASSIFICATION-VIOLATION',`golden:${vector.id}`);
      const goldenAbsent=await client.query(
        'select count(*)::int as count from event_outbox where event_id=$1',[goldenEventId]);
      assert.equal(goldenAbsent.rows[0].count,0,`golden:${vector.id} rejection committed`);
      goldenMaliciousRejected+=1;
    }
    if(serviceVerdict!==true || !dbRejected){
      parityMismatchIds.push(`${vector.id}(${vector.class}):service=${serviceVerdict},db_rejected=${dbRejected}`);
    }
  }

  let goldenSafeAccepted=0;
  for(const vector of DLP_SAFE_CONTROL_VECTORS){
    const safePayload=payloadByEvent.get('PAYER_ASSIGNED');
    const serviceVerdict=containsDirectIdentifier({trace_id:vector.value});
    const safeEventId=eventUuid(dlpCounter++,'9');
    await client.query(dlpInsert,[safeEventId,eventUuid(dlpCounter++,'a'),now,
      ids.correlation,vector.value,`dlp-golden-safe-${vector.id}`,
      JSON.stringify(safePayload),hash]);
    const present=await client.query(
      'select count(*)::int as count from event_outbox where event_id=$1',[safeEventId]);
    assert.equal(present.rows[0].count,1,`golden safe:${vector.id} was not committed`);
    goldenSafeAccepted+=1;
    if(serviceVerdict!==false){
      parityMismatchIds.push(`${vector.id}(safe):service=${serviceVerdict},db_rejected=false`);
    }
  }

  assert.equal(parityMismatchIds.length,0,
    `service/DB DLP parity mismatch on: ${parityMismatchIds.join(', ')}`);
  assert.equal(goldenMaliciousRejected,DLP_MALICIOUS_VECTORS.length);
  assert.equal(goldenSafeAccepted,DLP_SAFE_CONTROL_VECTORS.length);

  const coverage=computeDlpMatrixCoverage();
  for(const klass of Object.keys(coverage.classCoverage)){
    assert.equal(coverage.classCoverage[klass],coverage.expectedSeparators,
      `DLP golden corpus incomplete for class ${klass}: ${coverage.classCoverage[klass]}/${coverage.expectedSeparators} separators`);
    assert.equal(coverage.containerCoverage[klass],coverage.expectedContainers,
      `DLP golden corpus incomplete for class ${klass}: ${coverage.containerCoverage[klass]}/${coverage.expectedContainers} container vectors`);
  }
  assert.ok(coverage.isComplete,'DLP golden corpus matrix is not complete');

  pass(
    'PG-026',
    `versioned content DLP rejected ${dlpProbes.length} formatted/normalized identifiers plus ${goldenMaliciousRejected} golden malicious vectors (full ${coverage.expectedSeparators}x${Object.keys(coverage.classCoverage).length} separator matrix + nested/array) across payload, trace and metadata; accepted ${goldenSafeAccepted} golden safe controls; service/DB parity mismatches: ${parityMismatchIds.length}`,
    {
      classifier_version:'DLP_EVENT_CONTENT_V1',
      probes:dlpProbes.length,
      payload_probes:9,
      trace_probes:5,
      metadata_probes:1,
      normalized_phone_probes:6,
      normalized_passport_probes:3,
      rollback_absence_checks:dlpProbes.length+goldenMaliciousRejected,
      unsafe_value_echoes:0,
      golden_malicious_vectors:DLP_MALICIOUS_VECTORS.length,
      golden_malicious_rejected:goldenMaliciousRejected,
      golden_safe_vectors:DLP_SAFE_CONTROL_VECTORS.length,
      golden_safe_accepted:goldenSafeAccepted,
      golden_matrix_coverage:coverage.classCoverage,
      golden_container_coverage:coverage.containerCoverage,
      service_db_parity_mismatches:parityMismatchIds.length
    }
  );

  const immutableTriggerCount=await client.query(`select count(*)::int as count
    from pg_trigger
   where tgname in (
     'immutable_reveal_gate_snapshot','immutable_reveal_gate_snapshot_source',
     'immutable_reveal_gate_snapshot_party','immutable_reveal_attempt',
     'immutable_reveal_delivery_evidence','immutable_decision_record'
   ) and not tgisinternal`);
  assert.equal(immutableTriggerCount.rows[0].count,6);
  await expectRejected(client,'PG-021',
    `update command_idempotency_result set response_status=202
      where service_id='payer-resolution' and idempotency_key='idem-result'`,
    [],/immutable|permission denied/i);

  const sourceRoles=[
    ['leasemind_participation_writer','PARTICIPATION_SERVICE'],
    ['leasemind_payer_writer','PAYER_RESOLUTION'],
    ['leasemind_previous_contact_writer','PREVIOUS_CONTACT_DECISION'],
    ['leasemind_financial_writer','PAYMENT_FISCAL_LEDGER'],
    ['leasemind_identity_authority_writer','IDENTITY_AUTHORITY_REGISTRY'],
    ['leasemind_lawful_basis_writer','LAWFUL_BASIS_CONSENT_REGISTRY']
  ];
  for(let index=0;index<sourceRoles.length;index++){
    const [role,source]=sourceRoles[index];
    const aggregate=`00000000-0000-4000-d${String(index).padStart(3,'0')}-${String(index+400).padStart(12,'0')}`;
    await client.query(`insert into source_reveal_lease(
      lease_id,source_system,source_owner_role,aggregate_id,encounter_id,source_version,
      fencing_token,issued_at,expires_at,lease_state
    ) values($1,$2,$3,$4,$5,1,1,$6,$7,'ACTIVE')`,[
      `00000000-0000-4000-e${String(index).padStart(3,'0')}-${String(index+400).padStart(12,'0')}`,
      source,role,aggregate,ids.encounter,now,dbPlusMinutes(180)
    ]);
  }
  let rlsProbes=0;
  for(let sourceIndex=0;sourceIndex<sourceRoles.length;sourceIndex++){
    const [sourceRole]=sourceRoles[sourceIndex];
    await client.query(`set role ${sourceRole}`);
    try{
      for(let targetIndex=0;targetIndex<sourceRoles.length;targetIndex++){
        if(sourceIndex===targetIndex) continue;
        const [,targetSource]=sourceRoles[targetIndex];
        const visible=await client.query(
          'select count(*)::int as count from source_reveal_lease where source_system=$1',
          [targetSource]);
        assert.equal(visible.rows[0].count,0,`${sourceRole} read ${targetSource}`);
        try {
          const changed=await client.query(
            `update source_reveal_lease set revocation_reason='forbidden'
              where source_system=$1 returning lease_id`,[targetSource]);
          assert.equal(changed.rowCount,0,`${sourceRole} updated ${targetSource}`);
        } catch(error) {
          assert.match(String(error.message),/permission denied|row-level security/i);
        }
        rlsProbes+=2;
      }
    } finally { await client.query('reset role'); }
  }
  assert.equal(rlsProbes,60);
  pass('PG-022','all 30 ordered cross-source SELECT and UPDATE pairs isolated');

  const unsafeDefiners=await client.query(`select count(*)::int as count
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where p.prosecdef and n.nspname in ('public','leasemind_security')
     and coalesce(array_to_string(p.proconfig,','),'') not like '%search_path=pg_catalog%'`);
  assert.equal(unsafeDefiners.rows[0].count,0);
  pass('PG-023','all contract SECURITY DEFINER functions use pg_catalog search_path');

  const critical={
    secondAcceptance:eventUuid(3000,'a'),
    secondParty:eventUuid(3001,'a'),
    record:eventUuid(3002,'a'),
    object:eventUuid(3003,'a'),
    previousContact:eventUuid(3004,'a'),
    ownerLawfulBasis:eventUuid(3005,'a'),
    tenantLawfulBasis:eventUuid(3006,'a'),
    incompleteSnapshot:eventUuid(3007,'a'),
    snapshot:eventUuid(3008,'a'),
    token:eventUuid(3009,'a'),
    attempt:eventUuid(3010,'a'),
    compositeToken:eventUuid(3020,'a'),
    compositeAttempt:eventUuid(3021,'a'),
    evidence:eventUuid(3011,'a'),
    decision:eventUuid(3012,'a'),
    dispute:eventUuid(3013,'a')
  };

  await client.query(`insert into participation_acceptance(
    acceptance_record_id,encounter_id,match_id,party_id,party_role,payer_party_id,
    payer_campaign_id,aggregate_version,identity_version,identity_method,
    identity_evidence_ref,authority_version,authority_status,authority_evidence_ref,
    terms_version,terms_hash,consent_version,consent_hash,payer_notice_version,
    confirmed_account_id,signature_operation_id,signed_action,
    signature_verification_result,signature_evidence_ref,accepted_at
  ) values($1,$2,$3,$4,'NON_PAYER',$5,$6,1,1,'SYNTHETIC',$7,1,'VERIFIED',$7,
    '1.0',$8,'1.0',$8,'1.0',$7,$7,'SYNTHETIC_ACCEPT','VERIFIED',$7,$9)`,[
    critical.secondAcceptance,ids.encounter,ids.match,critical.secondParty,ids.payer,
    ids.campaign,ids.correlation,hash,now
  ]);
  await client.query('begin');
  try{
    await client.query(`insert into introduction_record(
      introduction_record_id,encounter_id,match_pair_id,match_id,campaign_ids,
      object_id,record_state,aggregate_version,match_rule_version,
      previous_contact_decision_id,previous_contact_policy_version,
      previous_contact_policy_hash,created_at,updated_at
    ) values($1,$2,$3,$4,array[$5]::uuid[],$6,'DRAFT',1,'synthetic-v1',$7,
      'synthetic-v1',$8,$9,$9)`,[
      critical.record,ids.encounter,ids.matchPair,ids.match,ids.campaign,
      critical.object,critical.previousContact,hash,now
    ]);
    await client.query(`insert into introduction_record_party(
      introduction_record_id,encounter_id,party_id,party_role,acceptance_record_id,
      acceptance_aggregate_version,terms_hash,lawful_basis_id,identity_authority_version
    ) values
      ($1,$2,$3,'OWNER_SIDE',$4,1,$5,$6,1),
      ($1,$2,$7,'TENANT_SIDE',$8,1,$5,$9,1)`,[
      critical.record,ids.encounter,acceptedParty,acceptance,hash,
      critical.ownerLawfulBasis,critical.secondParty,critical.secondAcceptance,
      critical.tenantLawfulBasis
    ]);
    await client.query('commit');
  }catch(error){
    await client.query('rollback');
    throw error;
  }

  const activeLeases=(await client.query(`select lease_id,source_system,source_version,fencing_token
    from source_reveal_lease
   where encounter_id=$1 and lease_state='ACTIVE'
   order by source_system`,[ids.encounter])).rows;
  assert.equal(activeLeases.length,6);
  const insertSnapshot=`insert into reveal_gate_snapshot(
    reveal_gate_snapshot_id,introduction_record_id,encounter_id,match_pair_id,match_id,
    campaign_ids,campaign_versions,payer_party_id,payer_assignment_version,
    previous_contact_decision_id,previous_contact_decision_version,
    previous_contact_policy_version,previous_contact_policy_hash,advance_ledger_version,
    advance_receipt_id,financial_exposure_version,delivery_policy_version,
    delivery_policy_hash,manifest_hash,record_version,snapshot_hash,fencing_token,
    reveal_guard_epoch,valid_until,created_at
  ) values($1,$2,$3,$4,$5,array[$6]::uuid[],array[1]::bigint[],$7,1,$8,1,
    'synthetic-v1',$9,1,'advance-synthetic',1,'synthetic-v1',$9,$9,1,$9,1,2,
    '2026-07-24T10:30:00Z',$10)`;
  const insertSnapshotParties=async snapshotId => client.query(`insert into reveal_gate_snapshot_party(
    reveal_gate_snapshot_id,introduction_record_id,encounter_id,party_id,party_role,
    acceptance_record_id,acceptance_aggregate_version,terms_hash,lawful_basis_id,
    lawful_basis_version,identity_authority_version
  ) values
    ($1,$2,$3,$4,'OWNER_SIDE',$5,1,$6,$7,1,1),
    ($1,$2,$3,$8,'TENANT_SIDE',$9,1,$6,$10,1,1)`,[
    snapshotId,critical.record,ids.encounter,acceptedParty,acceptance,hash,
    critical.ownerLawfulBasis,critical.secondParty,critical.secondAcceptance,
    critical.tenantLawfulBasis
  ]);
  const insertSnapshotSources=async(snapshotId,leases)=>{
    for(const lease of leases){
      await client.query(`insert into reveal_gate_snapshot_source(
        reveal_gate_snapshot_id,encounter_id,source_system,source_lease_id,
        source_version,fencing_token
      ) values($1,$2,$3,$4,$5,$6)`,[
        snapshotId,ids.encounter,lease.source_system,lease.lease_id,
        lease.source_version,lease.fencing_token
      ]);
    }
  };
  const snapshotParams=snapshotId=>[
    snapshotId,critical.record,ids.encounter,ids.matchPair,ids.match,ids.campaign,
    ids.payer,critical.previousContact,hash,now
  ];

  await client.query('begin');
  try{
    await client.query(insertSnapshot,snapshotParams(critical.incompleteSnapshot));
    await insertSnapshotParties(critical.incompleteSnapshot);
    await insertSnapshotSources(critical.incompleteSnapshot,activeLeases.slice(0,5));
    await assertRejected(client,'set constraints all immediate',[],/LM-GATE-LEASE-SET-INCOMPLETE/);
  }finally{
    await client.query('rollback');
  }
  pass('PG-024','snapshot with five of six authoritative source leases rejected at deferred commit boundary');

  await client.query('begin');
  try{
    await client.query(insertSnapshot,snapshotParams(critical.snapshot));
    await insertSnapshotParties(critical.snapshot);
    await insertSnapshotSources(critical.snapshot,activeLeases);
    await client.query('commit');
  }catch(error){
    await client.query('rollback');
    throw error;
  }

  const insertToken=`insert into reveal_token(
    reveal_token_id,token_hash,introduction_record_id,encounter_id,
    reveal_gate_snapshot_id,recipient_party_id,manifest_hash,issued_at,expires_at,
    operation_state
  ) values($1,$2,$3,$4,$5,$6,$7,$8,$9,'PENDING')`;
  await client.query(insertToken,[
    critical.token,'b'.repeat(64),critical.record,ids.encounter,critical.snapshot,
    acceptedParty,hash,now,dbPlusMinutes(20)
  ]);
  const redeemSql=`select leasemind_security.redeem_reveal_token(
    $1,$2,$3,$4
  ) as result`;
  const redeemParams=[
    critical.token,'b'.repeat(64),'redeem-key-primary-0001','e'.repeat(64)
  ];
  await client.query('begin');
  await client.query(redeemSql,redeemParams);
  await client.query('rollback');
  const rolledBack=await client.query(
    'select redeemed_at from reveal_token where reveal_token_id=$1',[critical.token]);
  assert.equal(rolledBack.rows[0].redeemed_at,null);
  const rolledBackAttempts=await client.query(
    'select count(*)::int as count from reveal_attempt where reveal_token_id=$1',[critical.token]);
  assert.equal(rolledBackAttempts.rows[0].count,0);

  const raceA=embedded ? pg.getPgClient() : new pgModule.Client({connectionString:process.env.DATABASE_URL});
  const raceB=embedded ? pg.getPgClient() : new pgModule.Client({connectionString:process.env.DATABASE_URL});
  await Promise.all([raceA.connect(),raceB.connect()]);
  const raceParams=[
    [critical.token,'b'.repeat(64),'concurrent-redeem-key-a','e'.repeat(64)],
    [critical.token,'b'.repeat(64),'concurrent-redeem-key-b','e'.repeat(64)]
  ];
  let raceResults;
  try{
    raceResults=await Promise.allSettled([
      raceA.query(redeemSql,raceParams[0]),
      raceB.query(redeemSql,raceParams[1])
    ]);
  }finally{
    await Promise.all([raceA.end(),raceB.end()]);
  }
  assert.equal(raceResults.filter(item=>item.status==='fulfilled').length,1);
  assert.equal(raceResults.filter(item=>
    item.status==='rejected' && /LM-REVEAL-TOKEN-USED/.test(String(item.reason?.message))
  ).length,1);
  const winnerIndex=raceResults.findIndex(item=>item.status==='fulfilled');
  const firstRedeem=raceResults[winnerIndex].value;
  const winnerParams=raceParams[winnerIndex];
  const sameKeyReplay=await client.query(redeemSql,winnerParams);
  assert.deepEqual(firstRedeem.rows[0].result,sameKeyReplay.rows[0].result);
  critical.attempt=firstRedeem.rows[0].result.reveal_attempt_id;
  const atomicState=await client.query(`select
    token.redeem_result_hash,
    encode(sha256(convert_to(token.redeem_result::text,'UTF8')),'hex') as calculated_hash,
    attempt.reveal_attempt_id,
    attempt.reveal_token_id
   from reveal_token token
   join reveal_attempt attempt on attempt.reveal_token_id=token.reveal_token_id
  where token.reveal_token_id=$1`,[critical.token]);
  assert.equal(atomicState.rowCount,1);
  assert.equal(atomicState.rows[0].reveal_attempt_id,critical.attempt);
  assert.equal(atomicState.rows[0].redeem_result_hash.trim(),atomicState.rows[0].calculated_hash);

  await assertRejected(client,redeemSql,[
    critical.token,'b'.repeat(64),'redeem-key-secondary-0002','e'.repeat(64)
  ],/LM-REVEAL-TOKEN-USED/);
  await assertRejected(client,redeemSql,[
    critical.token,'b'.repeat(64),winnerParams[2],'0'.repeat(64)
  ],/LM-IDEMPOTENCY-PAYLOAD-CONFLICT/);

  const failureBeforeToken=eventUuid(3030,'a');
  await client.query(insertToken,[
    failureBeforeToken,'c'.repeat(64),critical.record,ids.encounter,critical.snapshot,
    acceptedParty,hash,now,dbPlusMinutes(20)
  ]);
  await client.query(`create function public.synthetic_fail_attempt_before()
    returns trigger language plpgsql as $$
    begin raise exception 'SYNTHETIC-FAIL-BEFORE-ATTEMPT'; end; $$`);
  await client.query(`create trigger synthetic_fail_attempt_before
    before insert on reveal_attempt for each row
    execute function public.synthetic_fail_attempt_before()`);
  await assertRejected(client,redeemSql,[
    failureBeforeToken,'c'.repeat(64),'failure-before-attempt-01','1'.repeat(64)
  ],/SYNTHETIC-FAIL-BEFORE-ATTEMPT/);
  await client.query('drop trigger synthetic_fail_attempt_before on reveal_attempt');
  await client.query('drop function public.synthetic_fail_attempt_before()');
  const beforeFailureState=await client.query(`select
    (select count(*)::int from reveal_attempt where reveal_token_id=$1) as attempts,
    (select redeemed_at is null from reveal_token where reveal_token_id=$1) as token_pending`,
  [failureBeforeToken]);
  assert.deepEqual(beforeFailureState.rows[0],{attempts:0,token_pending:true});

  const failureAfterToken=eventUuid(3031,'a');
  await client.query(insertToken,[
    failureAfterToken,'d'.repeat(64),critical.record,ids.encounter,critical.snapshot,
    critical.secondParty,hash,now,dbPlusMinutes(20)
  ]);
  await client.query(`create function public.synthetic_fail_token_after()
    returns trigger language plpgsql as $$
    begin raise exception 'SYNTHETIC-FAIL-AFTER-TOKEN-UPDATE'; end; $$`);
  await client.query(`create trigger synthetic_fail_token_after
    after update on reveal_token for each row
    execute function public.synthetic_fail_token_after()`);
  await assertRejected(client,redeemSql,[
    failureAfterToken,'d'.repeat(64),'failure-after-token-0002','2'.repeat(64)
  ],/SYNTHETIC-FAIL-AFTER-TOKEN-UPDATE/);
  await client.query('drop trigger synthetic_fail_token_after on reveal_token');
  await client.query('drop function public.synthetic_fail_token_after()');
  const afterFailureState=await client.query(`select
    (select count(*)::int from reveal_attempt where reveal_token_id=$1) as attempts,
    (select redeemed_at is null from reveal_token where reveal_token_id=$1) as token_pending`,
  [failureAfterToken]);
  assert.deepEqual(afterFailureState.rows[0],{attempts:0,token_pending:true});

  const raceAttempts=await client.query(
    'select count(*)::int as count from reveal_attempt where reveal_token_id=$1',[critical.token]);
  assert.equal(raceAttempts.rows[0].count,1);

  // SEVENTH-B03: the old 5-argument call must no longer exist at all -- this
  // is also the "caller cannot pass a backdated time" proof, since there is
  // no time parameter left to backdate.
  await assertRejected(client,
    `select leasemind_security.redeem_reveal_token($1,$2,$3,$4,$5) as result`,
    [critical.token,'b'.repeat(64),'backdate-attempt-key-001','7'.repeat(64),dbMinusMinutes(600)],
    /does not exist/i);

  const redeemSignature=await client.query(`select count(*)::int as count,
      array_agg(pg_get_function_identity_arguments(p.oid)) as signatures
     from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='leasemind_security' and p.proname='redeem_reveal_token'`);
  assert.equal(redeemSignature.rows[0].count,1);
  assert.equal(redeemSignature.rows[0].signatures[0],
    'p_reveal_token_id uuid, p_token_hash character, p_idempotency_key text, p_request_hash character');

  const expiredToken=eventUuid(3092,'a');
  await client.query(insertToken,[
    expiredToken,'5'.repeat(64),critical.record,ids.encounter,critical.snapshot,
    acceptedParty,hash,now,dbMinusMinutes(5)
  ]);
  await assertRejected(client,redeemSql,[
    expiredToken,'5'.repeat(64),'expired-token-key-0000001','6'.repeat(64)
  ],/LM-REVEAL-TOKEN-EXPIRED/);

  // source_reveal_lease rows can back at most one snapshot each (source_lease_id
  // is globally unique in reveal_gate_snapshot_source), so this dedicated
  // snapshot needs its own fresh lease set rather than reusing activeLeases.
  for(let index=0;index<sourceRoles.length;index++){
    const [role,source]=sourceRoles[index];
    await client.query(`insert into source_reveal_lease(
      lease_id,source_system,source_owner_role,aggregate_id,encounter_id,source_version,
      fencing_token,issued_at,expires_at,lease_state
    ) values($1,$2,$3,$4,$5,1,1,$6,$7,'ACTIVE')`,[
      eventUuid(3095+index,'a'),source,role,eventUuid(3101+index,'a'),ids.encounter,
      now,dbPlusMinutes(180)
    ]);
  }
  const futureIssuedLeases=(await client.query(`select lease_id,source_system,source_version,fencing_token
    from source_reveal_lease
   where encounter_id=$1 and lease_state='ACTIVE' and lease_id=any($2::uuid[])
   order by source_system`,
    [ids.encounter,Array.from({length:6},(_,index)=>eventUuid(3095+index,'a'))])).rows;
  assert.equal(futureIssuedLeases.length,6);

  const futureIssuedSnapshot=eventUuid(3090,'a');
  await client.query('begin');
  try{
    await client.query(`insert into reveal_gate_snapshot(
        reveal_gate_snapshot_id,introduction_record_id,encounter_id,match_pair_id,match_id,
        campaign_ids,campaign_versions,payer_party_id,payer_assignment_version,
        previous_contact_decision_id,previous_contact_decision_version,
        previous_contact_policy_version,previous_contact_policy_hash,advance_ledger_version,
        advance_receipt_id,financial_exposure_version,delivery_policy_version,
        delivery_policy_hash,manifest_hash,record_version,snapshot_hash,fencing_token,
        reveal_guard_epoch,valid_until,created_at
      ) values($1,$2,$3,$4,$5,array[$6]::uuid[],array[1]::bigint[],$7,1,$8,1,
        'synthetic-v1',$9,1,'advance-synthetic',1,'synthetic-v1',$9,$9,1,$9,2,2,
        $10,$11)`,
      [...snapshotParams(futureIssuedSnapshot).slice(0,9),dbPlusMinutes(120),now]);
    await insertSnapshotParties(futureIssuedSnapshot);
    await insertSnapshotSources(futureIssuedSnapshot,futureIssuedLeases);
    await client.query('commit');
  }catch(error){
    await client.query('rollback');
    throw error;
  }
  const futureIssuedToken=eventUuid(3091,'a');
  await client.query(insertToken,[
    futureIssuedToken,'3'.repeat(64),critical.record,ids.encounter,futureIssuedSnapshot,
    acceptedParty,hash,dbPlusMinutes(30),dbPlusMinutes(60)
  ]);
  await assertRejected(client,redeemSql,[
    futureIssuedToken,'3'.repeat(64),'future-issued-key-0000001','4'.repeat(64)
  ],/LM-REVEAL-TOKEN-NOT-YET-VALID/);

  // SEVENTH-B04: fully isolated encounter/lease/snapshot/token fixtures so
  // the two race probes below cannot disturb the shared ids.encounter guard
  // epoch history (already at 2, about to be bumped to exactly 3 for PG-025).
  const buildRaceFixture=async(seedBase,tokenHash)=>{
    const encounterId=eventUuid(seedBase,'a');
    const payerAggId=eventUuid(seedBase+1,'a');
    const matchPairId=eventUuid(seedBase+2,'a');
    const matchId=eventUuid(seedBase+3,'a');
    const recordId=eventUuid(seedBase+4,'a');
    const objectId=eventUuid(seedBase+5,'a');
    const previousContactId=eventUuid(seedBase+6,'a');
    const ownerParty=eventUuid(seedBase+7,'a');
    const tenantParty=eventUuid(seedBase+8,'a');
    const ownerAcceptance=eventUuid(seedBase+9,'a');
    const tenantAcceptance=eventUuid(seedBase+10,'a');
    const ownerLawfulBasis=eventUuid(seedBase+11,'a');
    const tenantLawfulBasis=eventUuid(seedBase+12,'a');
    const snapshotId=eventUuid(seedBase+13,'a');
    const tokenId=eventUuid(seedBase+14,'a');

    await client.query(`insert into payer_resolution_aggregate(
      payer_resolution_aggregate_id,encounter_id,match_pair_id,
      payer_party_id,payer_campaign_id,payer_assignment_version,
      resolution_state,aggregate_version,updated_at
    ) values($1,$2,$3,$4,$5,1,'ASSIGNED',1,$6)`,
    [payerAggId,encounterId,matchPairId,ids.payer,ids.campaign,now]);

    const leaseAggregateIds={};
    for(let i=0;i<sourceRoles.length;i++){
      const [role,source]=sourceRoles[i];
      const leaseId=eventUuid(seedBase+20+i,'a');
      const aggId=eventUuid(seedBase+30+i,'a');
      leaseAggregateIds[source]=aggId;
      await client.query(`insert into source_reveal_lease(
        lease_id,source_system,source_owner_role,aggregate_id,encounter_id,source_version,
        fencing_token,issued_at,expires_at,lease_state
      ) values($1,$2,$3,$4,$5,1,1,$6,$7,'ACTIVE')`,
      [leaseId,source,role,aggId,encounterId,now,dbPlusMinutes(180)]);
    }
    const leases=(await client.query(`select lease_id,source_system,source_version,fencing_token
      from source_reveal_lease where encounter_id=$1 and lease_state='ACTIVE' order by source_system`,
      [encounterId])).rows;
    assert.equal(leases.length,6);

    const acceptanceColumns=`acceptance_record_id,encounter_id,match_id,party_id,party_role,
        payer_party_id,payer_campaign_id,aggregate_version,identity_version,identity_method,
        identity_evidence_ref,authority_version,authority_status,authority_evidence_ref,
        terms_version,terms_hash,consent_version,consent_hash,payer_notice_version,
        confirmed_account_id,signature_operation_id,signed_action,
        signature_verification_result,signature_evidence_ref,accepted_at`;
    await client.query(`insert into participation_acceptance(${acceptanceColumns})
      values($1,$2,$3,$4,'PAYER',$5,$6,1,1,'SYNTHETIC',$7,1,'VERIFIED',$7,
        '1.0',$8,'1.0',$8,'1.0',$7,$7,'SYNTHETIC_ACCEPT','VERIFIED',$7,$9)`,
      [ownerAcceptance,encounterId,matchId,ownerParty,ids.payer,ids.campaign,ids.correlation,hash,now]);
    await client.query(`insert into participation_acceptance(${acceptanceColumns})
      values($1,$2,$3,$4,'NON_PAYER',$5,$6,1,1,'SYNTHETIC',$7,1,'VERIFIED',$7,
        '1.0',$8,'1.0',$8,'1.0',$7,$7,'SYNTHETIC_ACCEPT','VERIFIED',$7,$9)`,
      [tenantAcceptance,encounterId,matchId,tenantParty,ids.payer,ids.campaign,ids.correlation,hash,now]);

    await client.query('begin');
    try{
      await client.query(`insert into introduction_record(
        introduction_record_id,encounter_id,match_pair_id,match_id,campaign_ids,
        object_id,record_state,aggregate_version,match_rule_version,
        previous_contact_decision_id,previous_contact_policy_version,
        previous_contact_policy_hash,created_at,updated_at
      ) values($1,$2,$3,$4,array[$5]::uuid[],$6,'DRAFT',1,'synthetic-v1',$7,
        'synthetic-v1',$8,$9,$9)`,
      [recordId,encounterId,matchPairId,matchId,ids.campaign,objectId,previousContactId,hash,now]);
      await client.query(`insert into introduction_record_party(
        introduction_record_id,encounter_id,party_id,party_role,acceptance_record_id,
        acceptance_aggregate_version,terms_hash,lawful_basis_id,identity_authority_version
      ) values
        ($1,$2,$3,'OWNER_SIDE',$4,1,$5,$6,1),
        ($1,$2,$7,'TENANT_SIDE',$8,1,$5,$9,1)`,
      [recordId,encounterId,ownerParty,ownerAcceptance,hash,
        ownerLawfulBasis,tenantParty,tenantAcceptance,tenantLawfulBasis]);
      await client.query('commit');
    }catch(error){
      await client.query('rollback');
      throw error;
    }

    await client.query('begin');
    try{
      await client.query(`insert into reveal_gate_snapshot(
          reveal_gate_snapshot_id,introduction_record_id,encounter_id,match_pair_id,match_id,
          campaign_ids,campaign_versions,payer_party_id,payer_assignment_version,
          previous_contact_decision_id,previous_contact_decision_version,
          previous_contact_policy_version,previous_contact_policy_hash,advance_ledger_version,
          advance_receipt_id,financial_exposure_version,delivery_policy_version,
          delivery_policy_hash,manifest_hash,record_version,snapshot_hash,fencing_token,
          reveal_guard_epoch,valid_until,created_at
        ) values($1,$2,$3,$4,$5,array[$6]::uuid[],array[1]::bigint[],$7,1,$8,1,
          'synthetic-v1',$9,1,'advance-synthetic',1,'synthetic-v1',$9,$9,1,$9,1,1,
          $10,$11)`,
        [snapshotId,recordId,encounterId,matchPairId,matchId,ids.campaign,
          ids.payer,previousContactId,hash,dbPlusMinutes(120),now]);
      await client.query(`insert into reveal_gate_snapshot_party(
          reveal_gate_snapshot_id,introduction_record_id,encounter_id,party_id,party_role,
          acceptance_record_id,acceptance_aggregate_version,terms_hash,lawful_basis_id,
          lawful_basis_version,identity_authority_version
        ) values
          ($1,$2,$3,$4,'OWNER_SIDE',$5,1,$6,$7,1,1),
          ($1,$2,$3,$8,'TENANT_SIDE',$9,1,$6,$10,1,1)`,
        [snapshotId,recordId,encounterId,ownerParty,ownerAcceptance,hash,
          ownerLawfulBasis,tenantParty,tenantAcceptance,tenantLawfulBasis]);
      for(const lease of leases){
        await client.query(`insert into reveal_gate_snapshot_source(
            reveal_gate_snapshot_id,encounter_id,source_system,source_lease_id,
            source_version,fencing_token
          ) values($1,$2,$3,$4,$5,$6)`,
          [snapshotId,encounterId,lease.source_system,lease.lease_id,
            lease.source_version,lease.fencing_token]);
      }
      await client.query('commit');
    }catch(error){
      await client.query('rollback');
      throw error;
    }

    await client.query(insertToken,[
      tokenId,tokenHash,recordId,encounterId,snapshotId,ownerParty,hash,now,dbPlusMinutes(20)
    ]);

    return {encounterId,snapshotId,tokenId,leaseAggregateIds};
  };

  // pid must be fetched from the target connection BEFORE it starts running
  // the blocking query -- pg serializes queries per connection, so fetching
  // it afterward would queue behind the very query we are waiting to block.
  const waitUntilBlocked=async(observerClient,pid,timeoutMs=5000)=>{
    const deadline=Date.now()+timeoutMs;
    while(Date.now()<deadline){
      const waiting=await observerClient.query(
        'select wait_event_type from pg_stat_activity where pid=$1',[pid]);
      if(waiting.rows[0]?.wait_event_type==='Lock') return true;
      await new Promise(resolve=>setTimeout(resolve,20));
    }
    throw new Error('LM-TEST-LOCK-WAIT-TIMEOUT: expected connection to be blocked on a row lock');
  };

  const invalidationPayload=encounterId=>JSON.stringify({
    encounter_id:encounterId,match_pair_id:ids.matchPair,
    resolution_state:'PAYER_RESOLUTION_REQUIRED',payer_assignment_version:2,
    reason_code:'PAYER_ASSIGNMENT_CHANGED'
  });

  // Invalidation-first: invalidation acquires lease+guard locks first and
  // holds them uncommitted; redemption must block, then be rejected once
  // invalidation commits (stale epoch or incomplete lease set).
  const fixtureInv=await buildRaceFixture(3800,'8'.repeat(64));
  const connInvalidation=embedded?pg.getPgClient():new pgModule.Client({connectionString:process.env.DATABASE_URL});
  const connRedemption=embedded?pg.getPgClient():new pgModule.Client({connectionString:process.env.DATABASE_URL});
  await Promise.all([connInvalidation.connect(),connRedemption.connect()]);
  try{
    const redemptionPid=(await connRedemption.query('select pg_backend_pid() as pid')).rows[0].pid;
    await connInvalidation.query('begin');
    await connInvalidation.query(
      `select leasemind_security.apply_safety_critical_invalidation(
        'PAYER_RESOLUTION',$1,$2,1,2,$3,'PAYER_REASSIGNED',$4,
        'PAYER_RESOLUTION_REQUIRED','payer-resolution',$5,$5,'trace-race-invalidation-first',
        'idem-race-invalidation-first',$6::jsonb,$7
      ) as epoch`,
      [fixtureInv.leaseAggregateIds.PAYER_RESOLUTION,fixtureInv.encounterId,now,
        eventUuid(3840,'a'),ids.correlation,invalidationPayload(fixtureInv.encounterId),hash]);

    const redemptionPromise=connRedemption.query(redeemSql,[
      fixtureInv.tokenId,'8'.repeat(64),'race-invalidation-first-key01','f'.repeat(64)
    ]);
    await waitUntilBlocked(client,redemptionPid);
    await connInvalidation.query('commit');
    await assert.rejects(redemptionPromise,/LM-GATE-GUARD-EPOCH-STALE|LM-GATE-LEASE-SET-INCOMPLETE/);
    const invRaceState=await client.query(
      'select redeemed_at from reveal_token where reveal_token_id=$1',[fixtureInv.tokenId]);
    assert.equal(invRaceState.rows[0].redeemed_at,null);
  }finally{
    await connInvalidation.end();
    await connRedemption.end();
  }

  // Redemption-first: redemption acquires the same locks first (within its
  // own transaction) and holds them; concurrent invalidation must block,
  // then may proceed after redemption commits, without undoing the result.
  const fixtureRed=await buildRaceFixture(3900,'9'.repeat(64));
  const connRedemptionFirst=embedded?pg.getPgClient():new pgModule.Client({connectionString:process.env.DATABASE_URL});
  const connInvalidationSecond=embedded?pg.getPgClient():new pgModule.Client({connectionString:process.env.DATABASE_URL});
  await Promise.all([connRedemptionFirst.connect(),connInvalidationSecond.connect()]);
  try{
    const invalidationPid=(await connInvalidationSecond.query('select pg_backend_pid() as pid')).rows[0].pid;
    await connRedemptionFirst.query('begin');
    await connRedemptionFirst.query(
      `select 1 from public.reveal_gate_snapshot_source snapshot_source
         join public.source_reveal_lease lease
           on lease.lease_id=snapshot_source.source_lease_id
        where snapshot_source.reveal_gate_snapshot_id=$1
        order by lease.lease_id
          for update of lease`,
      [fixtureRed.snapshotId]);
    await connRedemptionFirst.query(
      `select guard_epoch from leasemind_security.reveal_guard where encounter_id=$1 for update`,
      [fixtureRed.encounterId]);

    const invalidationPromise=connInvalidationSecond.query(
      `select leasemind_security.apply_safety_critical_invalidation(
        'PAYER_RESOLUTION',$1,$2,1,2,$3,'PAYER_REASSIGNED',$4,
        'PAYER_RESOLUTION_REQUIRED','payer-resolution',$5,$5,'trace-race-redemption-first',
        'idem-race-redemption-first',$6::jsonb,$7
      ) as epoch`,
      [fixtureRed.leaseAggregateIds.PAYER_RESOLUTION,fixtureRed.encounterId,now,
        eventUuid(3940,'a'),ids.correlation,invalidationPayload(fixtureRed.encounterId),hash]);
    await waitUntilBlocked(client,invalidationPid);

    const redemptionResult=await connRedemptionFirst.query(redeemSql,[
      fixtureRed.tokenId,'9'.repeat(64),'race-redemption-first-key01','f'.repeat(64)
    ]);
    assert.equal(redemptionResult.rows[0].result.status,'REDEEMED');
    await connRedemptionFirst.query('commit');

    const invalidationOutcome=await invalidationPromise;
    assert.equal(invalidationOutcome.rows[0].epoch,'2');
    const redRaceState=await client.query(
      'select redeemed_at,redeem_result from reveal_token where reveal_token_id=$1',[fixtureRed.tokenId]);
    assert.ok(redRaceState.rows[0].redeemed_at!==null);
    assert.deepEqual(redRaceState.rows[0].redeem_result,redemptionResult.rows[0].result);
  }finally{
    await connRedemptionFirst.end();
    await connInvalidationSecond.end();
  }

  pass(
    'PG-030',
    'one server-owned transaction creates immutable attempt, calculates result hash, redeems token and persists replay result; rollback, replay, two-connection race, expired/future-issued/backdated rejection and invalidation/redemption lock-order races proven',
    {
      rollback_before_commit:{token_pending:1,attempt_rows:0},
      same_key_same_request_same_attempt:1,
      new_key_rejected:1,
      same_key_different_request_rejected:1,
      server_calculated_result_hash:1,
      caller_supplied_result_fields:0,
      server_owned_time:1,
      old_five_arg_signature_present:0,
      backdated_call_rejected:1,
      expired_token_rejected:1,
      future_issued_token_rejected:1,
      immutable_attempt_created_atomically:1,
      failure_injection_points:{
        before_attempt_insert:1,
        after_token_update:1
      },
      failure_rollbacks_verified:2,
      concurrent_connections:2,
      concurrent_successes:1,
      concurrent_used_rejections:1,
      concurrent_attempt_rows:1,
      invalidation_first_race_rejected:1,
      redemption_first_race_completed:1
    }
  );

  await client.query(insertToken,[
    critical.compositeToken,'f'.repeat(64),critical.record,ids.encounter,critical.snapshot,
    critical.secondParty,hash,now,dbPlusMinutes(20)
  ]);

  const bumped=await client.query(
    `select leasemind_security.bump_reveal_guard($1,2,$2) as epoch`,[
      ids.encounter,'2026-07-24T10:06:00Z'
    ]);
  assert.equal(bumped.rows[0].epoch,'3');
  await expectRejected(client,'PG-025',insertToken,[
    eventUuid(3014,'a'),'c'.repeat(64),critical.record,ids.encounter,critical.snapshot,
    acceptedParty,hash,'2026-07-24T10:07:00Z',dbPlusMinutes(20)
  ],/LM-GATE-GUARD-EPOCH-STALE/);

  const insertAttempt=`insert into reveal_attempt(
    reveal_attempt_id,reveal_token_id,introduction_record_id,encounter_id,
    reveal_gate_snapshot_id,recipient_party_id,manifest_hash,operation_state,attempted_at
  ) values($1,$2,$3,$4,$5,$6,$7,'SUCCEEDED',$8)`;
  const compositeDimensions=[
    ['introduction_record_id',2,eventUuid(3040,'a')],
    ['encounter_id',3,eventUuid(3041,'a')],
    ['reveal_gate_snapshot_id',4,eventUuid(3042,'a')],
    ['recipient_party_id',5,eventUuid(3044,'a')],
    ['manifest_hash',6,'0'.repeat(64)]
  ];
  for(const [dimension,paramIndex,badValue] of compositeDimensions){
    const params=[
      eventUuid(3043+paramIndex,'a'),critical.compositeToken,critical.record,
      ids.encounter,critical.snapshot,critical.secondParty,hash,'2026-07-24T10:08:00Z'
    ];
    params[paramIndex]=badValue;
    await assertRejected(client,insertAttempt,params,/foreign key/i);
    const absent=await client.query(
      'select count(*)::int as count from reveal_attempt where reveal_attempt_id=$1',
      [params[0]]
    );
    assert.equal(absent.rows[0].count,0,`${dimension} mismatch committed`);
  }
  await client.query(insertAttempt,[
    critical.compositeAttempt,critical.compositeToken,critical.record,ids.encounter,critical.snapshot,
    critical.secondParty,hash,'2026-07-24T10:08:00Z'
  ]);
  pass(
    'PG-027',
    'five independent Token to Attempt composite binding mismatches rejected and exact composite accepted',
    {
      mismatch_dimensions:compositeDimensions.map(([dimension])=>dimension),
      mismatch_rejections:5,
      rollback_absence_checks:5,
      exact_composite_acceptances:1
    }
  );

  await client.query(`insert into reveal_delivery_evidence(
    reveal_delivery_evidence_id,reveal_attempt_id,evidence_manifest_hash,
    evidence_classification,delivery_policy_version,delivery_policy_hash,
    established_delivery_at,submitted_at
  ) values($1,$2,$3,'SUFFICIENT','synthetic-v1',$3,$4,$4)`,[
    critical.evidence,critical.attempt,'d'.repeat(64),'2026-07-24T10:08:00Z'
  ]);
  await client.query(`insert into decision_record(
    decision_id,dispute_id,introduction_record_id,decision_type,reviewer_id,
    reviewer_role,appointment_id,conflict_check_id,policy_version,policy_hash,
    evidence_bundle_hash,established_delivery_at,decision_order,decided_at
  ) values($1,$2,$3,'DELIVERY_CONFIRMED_BY_DECISION',$4,'SYNTHETIC_REVIEWER',
    $5,$6,'synthetic-v1',$7,$7,$8,1,$8)`,[
    critical.decision,critical.dispute,critical.record,eventUuid(3016,'a'),
    eventUuid(3017,'a'),eventUuid(3018,'a'),hash,'2026-07-24T10:09:00Z'
  ]);
  const immutableCases=[
    ['reveal_gate_snapshot','reveal_gate_snapshot_id',critical.snapshot],
    ['reveal_gate_snapshot_source','reveal_gate_snapshot_id',critical.snapshot],
    ['reveal_gate_snapshot_party','reveal_gate_snapshot_id',critical.snapshot],
    ['reveal_attempt','reveal_attempt_id',critical.attempt],
    ['reveal_delivery_evidence','reveal_delivery_evidence_id',critical.evidence],
    ['decision_record','decision_id',critical.decision]
  ];
  let immutableOperations=0;
  for(const [table,key,value] of immutableCases){
    await assertRejected(client,`update ${table} set ${key}=${key} where ${key}=$1`,[
      value
    ],/LM-IMMUTABLE-ARTIFACT/);
    await assertRejected(client,`delete from ${table} where ${key}=$1`,[
      value
    ],/LM-IMMUTABLE-ARTIFACT/);
    immutableOperations+=2;
  }
  assert.equal(immutableOperations,12);
  pass('PG-028','UPDATE and DELETE rejected for each of six mandatory immutable artifact classes');

  await client.query('create table public.reveal_guard(encounter_id uuid primary key, guard_epoch bigint)');
  await client.query('insert into public.reveal_guard values($1,999)',[ids.encounter]);
  const shadowBump=await client.query(
    `select leasemind_security.bump_reveal_guard($1,3,$2) as epoch`,[
      ids.encounter,'2026-07-24T10:10:00Z'
    ]);
  const shadowState=await client.query(`select
    (select guard_epoch from leasemind_security.reveal_guard where encounter_id=$1) as protected_epoch,
    (select guard_epoch from public.reveal_guard where encounter_id=$1) as shadow_epoch`,[
      ids.encounter
    ]);
  assert.equal(shadowBump.rows[0].epoch,'4');
  assert.deepEqual(shadowState.rows[0],{protected_epoch:'4',shadow_epoch:'999'});
  await client.query('drop table public.reveal_guard');
  pass('PG-029','schema-qualified SECURITY DEFINER function ignored hostile public shadow object');

  const down = await readFile(new URL('../migrations/001_matching_critical_chain.down.sql', import.meta.url), 'utf8');
  await client.query(down);
  pass('PG-012', 'exact down migration executed');
  const postDown = stripPsql(await readFile(new URL('./post_down_assertions.sql', import.meta.url), 'utf8'));
  await client.query(postDown);
  pass('PG-013', 'post-down catalog is empty for all contract objects, types, schema and roles');
} catch (error) {
  primaryError = error;
} finally {
  if (client) {
    try { await client.end(); } catch {}
  }
  if (embedded) {
    try { await pg.stop(); } catch {}
    await rm(databaseDir, {recursive: true, force: true});
  }
}

if (primaryError) {
  writeSync(2, scrubSecrets(`${primaryError.stack ?? primaryError}\n`));
  process.exitCode = 1;
  process.exit();
} else {
  process.stdout.write(`${JSON.stringify({status:'PASS', results}, null, 2)}\n`);
}
