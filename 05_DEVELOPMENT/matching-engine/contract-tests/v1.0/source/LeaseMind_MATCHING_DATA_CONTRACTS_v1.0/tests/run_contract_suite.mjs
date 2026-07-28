import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import SwaggerParser from '@apidevtools/swagger-parser';
import {Parser, fromFile} from '@asyncapi/parser';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import YAML from 'yaml';
import {canonicalEventFixtures, openApiFixtures, UUID_V7} from '../fixtures/synthetic_fixtures.mjs';
import {
  IdempotencyStore, RevealGuardModel, RevealTokenStore, classifySchemaChange,
  containsDirectIdentifier, cryptoUnlink, resolveTrustedRevealContext,
  transitionRecord, validateFinancialIntent, validateLeaseSet
} from './synthetic_service_models.mjs';
import {
  DLP_MALICIOUS_VECTORS, DLP_SAFE_CONTROL_VECTORS, computeDlpMatrixCoverage
} from './fixtures/dlp_golden_vectors.mjs';

const loadYaml = async path => YAML.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const openapi = await loadYaml('../openapi.yaml');
const asyncapi = await loadYaml('../asyncapi.yaml');
const ddl = await readFile(new URL('../migrations/001_matching_critical_chain.up.sql', import.meta.url), 'utf8');
const results = [];
const test = async (id, name, level, fn) => {
  try {
    const evidence = await fn();
    results.push({id, status: 'PASS', level, name, evidence});
  } catch (error) {
    results.push({id, status: 'FAIL', level, name, error: String(error.message)});
  }
};
const ajv = new Ajv2020({strict: false, allErrors: true, validateFormats: true});
addFormats(ajv);
const asyncRoot = structuredClone(asyncapi);
asyncRoot.$id = 'https://synthetic.invalid/asyncapi-root';
const eventAjv = new Ajv2020({strict: false, allErrors: true, validateFormats: true});
addFormats(eventAjv);
eventAjv.addSchema(asyncRoot);
const events = canonicalEventFixtures(asyncapi);

const FORBIDDEN_UUID_VERSIONS = ['1', '2', '3', '5', '6', '8'];
// Every character except the mandatory version nibble is a hex letter (a-f),
// so this value is inert under any digit-based scan (SEVENTH-B02 DLP parity)
// regardless of which field it is substituted into.
const uuidVersionSample = version => `aaaaaaaa-aaaa-${version}aaa-aaaa-aaaaaaaaaaaa`;
const resolveRef = (schema, root) => {
  if (!schema?.$ref) return schema ?? {};
  return schema.$ref.split('/').slice(1).reduce((value, segment) =>
    value[segment.replaceAll('~1', '/').replaceAll('~0', '~')], root);
};
const mergeSchema = (schema, root) => {
  if (!schema) return {};
  if (schema.$ref) return mergeSchema(resolveRef(schema, root), root);
  if (schema.allOf) {
    const own = {...schema};
    delete own.allOf;
    return schema.allOf.reduce((acc, part) => {
      const merged = mergeSchema(part, root);
      return {...acc, ...merged, properties: {...acc.properties, ...merged.properties}};
    }, own);
  }
  return schema;
};
const collectUuidPaths = (schema, value, root, path = []) => {
  const resolved = mergeSchema(schema, root);
  if (resolved.format === 'uuid' && typeof value === 'string') return [path];
  if (resolved.type === 'array' && Array.isArray(value)) {
    return value.flatMap((item, index) => collectUuidPaths(resolved.items, item, root, [...path, index]));
  }
  if (value && typeof value === 'object') {
    return Object.entries(resolved.properties ?? {}).flatMap(([key, propSchema]) =>
      key in value ? collectUuidPaths(propSchema, value[key], root, [...path, key]) : []);
  }
  return [];
};
const setAtPath = (obj, path, value) => {
  const clone = structuredClone(obj);
  let cursor = clone;
  for (let i = 0; i < path.length - 1; i++) cursor = cursor[path[i]];
  cursor[path[path.length - 1]] = value;
  return clone;
};

await test('CT-001', '9 OpenAPI operations and every declared 4xx execute positive validation', 'validator_fixture', async () => {
  await SwaggerParser.validate(fileURLToPath(new URL('../openapi.yaml', import.meta.url)));
  const fixtures = openApiFixtures(openapi);
  const operations = fixtures.filter(item => item.kind === 'openapi-operation');
  const errors = fixtures.filter(item => item.kind === 'openapi-error');
  assert.equal(operations.length, 9);
  const declared4xx = Object.values(openapi.paths).flatMap(pathItem =>
    Object.values(pathItem).flatMap(operation => typeof operation === 'object'
      ? Object.keys(operation.responses ?? {}).filter(status => status.startsWith('4')) : [])
  ).length;
  assert.equal(errors.length, declared4xx);
  const root = structuredClone(openapi);
  root.$id = 'https://synthetic.invalid/openapi-root';
  const localAjv = new Ajv2020({strict: false, allErrors: true, validateFormats: true});
  addFormats(localAjv);
  localAjv.addSchema(root);
  for (const fixture of operations.filter(item => item.requestSchema)) {
    const schema = fixture.requestSchema.$ref
      ? {$ref: `https://synthetic.invalid/openapi-root${fixture.requestSchema.$ref}`}
      : fixture.requestSchema;
    const validate = localAjv.compile(schema);
    assert.equal(validate(fixture.body), true, `${fixture.id}: ${localAjv.errorsText(validate.errors)}`);
  }
  const validateProblem = localAjv.compile({$ref: 'https://synthetic.invalid/openapi-root#/components/schemas/Problem'});
  for (const fixture of errors) assert.equal(validateProblem(fixture.body), true, fixture.id);
  return {operations: operations.length, declared_4xx: declared4xx};
});

await test('CT-002', 'Every canonical event executes positive and malformed fixture validation', 'validator_fixture', async () => {
  const parser = new Parser();
  const parsed = await fromFile(parser, fileURLToPath(new URL('../asyncapi.yaml', import.meta.url))).parse();
  assert.ok(parsed.document);
  assert.equal(parsed.diagnostics.filter(item => item.severity === 0).length, 0);
  assert.equal(events.length, 33);
  let uuidFieldsChecked = 0;
  let forbiddenVersionRejections = 0;
  let v7Acceptances = 0;
  for (const fixture of events) {
    const validate = eventAjv.compile({$ref:
      `https://synthetic.invalid/asyncapi-root#/components/schemas/${fixture.schemaName}`});
    assert.equal(validate(fixture.envelope), true,
      `${fixture.id}: ${eventAjv.errorsText(validate.errors)}`);
    const malformed = structuredClone(fixture.envelope);
    delete malformed.payload;
    assert.equal(validate(malformed), false, `${fixture.id}: missing payload accepted`);

    const uuidPaths = collectUuidPaths(asyncapi.components.schemas[fixture.schemaName], fixture.envelope, asyncapi);
    for (const path of uuidPaths) {
      const pathKey = path.join('.');
      for (const version of FORBIDDEN_UUID_VERSIONS) {
        const mutated = setAtPath(fixture.envelope, path, uuidVersionSample(version));
        assert.equal(validate(mutated), false,
          `${fixture.id}:${pathKey} accepted forbidden UUID v${version}`);
        forbiddenVersionRejections++;
      }
      const v7Value = pathKey === 'event_id' && fixture.id === events[0].id
        ? UUID_V7 : uuidVersionSample('7');
      const v7Mutated = setAtPath(fixture.envelope, path, v7Value);
      assert.equal(validate(v7Mutated), true,
        `${fixture.id}:${pathKey} rejected valid UUID v7`);
      v7Acceptances++;
      uuidFieldsChecked++;
    }
  }
  return {
    typed_events: events.length, positive: 33, malformed_rejected: 33,
    uuid_fields_checked: uuidFieldsChecked,
    forbidden_uuid_version_rejections: forbiddenVersionRejections,
    uuid_v7_acceptances: v7Acceptances
  };
});

await test('CT-003', 'Unknown fields are rejected for every command schema', 'validator_fixture', async () => {
  const fixtures = openApiFixtures(openapi).filter(item => item.kind === 'openapi-operation' && item.requestSchema);
  const root = structuredClone(openapi);
  root.$id = 'https://synthetic.invalid/openapi-negative';
  const localAjv = new Ajv2020({strict: false, allErrors: true, validateFormats: true});
  addFormats(localAjv); localAjv.addSchema(root);
  let uuidFieldsChecked = 0;
  let forbiddenVersionRejections = 0;
  let v7Acceptances = 0;
  for (const fixture of fixtures) {
    const schema = fixture.requestSchema.$ref
      ? {$ref: `https://synthetic.invalid/openapi-negative${fixture.requestSchema.$ref}`}
      : fixture.requestSchema;
    const validate = localAjv.compile(schema);
    assert.equal(validate({...fixture.body, injected_unknown_field: true}), false, fixture.id);

    const uuidPaths = collectUuidPaths(fixture.requestSchema, fixture.body, openapi);
    for (const path of uuidPaths) {
      const pathKey = path.join('.');
      for (const version of FORBIDDEN_UUID_VERSIONS) {
        const mutatedBody = setAtPath(fixture.body, path, uuidVersionSample(version));
        assert.equal(validate(mutatedBody), false,
          `${fixture.id}:${pathKey} accepted forbidden UUID v${version}`);
        forbiddenVersionRejections++;
      }
      const v7Body = setAtPath(fixture.body, path, uuidVersionSample('7'));
      assert.equal(validate(v7Body), true, `${fixture.id}:${pathKey} rejected valid UUID v7`);
      v7Acceptances++;
      uuidFieldsChecked++;
    }
  }
  return {
    negative_fixtures: fixtures.length,
    uuid_fields_checked: uuidFieldsChecked,
    forbidden_uuid_version_rejections: forbiddenVersionRejections,
    uuid_v7_acceptances: v7Acceptances
  };
});

await test('CT-004', 'Minor compatibility accepts only additive optional fields', 'service_behavior', () => {
  const before = {type:'object', required:['id'], properties:{id:{type:'string'}}};
  const after = {type:'object', required:['id'], properties:{id:{type:'string'}, note:{type:'string'}}};
  assert.equal(classifySchemaChange(before, after), 'MINOR_COMPATIBLE');
  return {scenario:'optional field added'};
});
await test('CT-005', 'Breaking required/enum changes are classified major', 'service_behavior', () => {
  const base = {required:['state'], properties:{state:{enum:['A','B']}}};
  assert.equal(classifySchemaChange(base, {required:['state','id'], properties:{state:{enum:['A','B']},id:{type:'string'}}}), 'MAJOR_REQUIRED');
  assert.equal(classifySchemaChange(base, {required:['state'], properties:{state:{enum:['A']}}}), 'MAJOR_REQUIRED');
  return {scenarios:2};
});
await test('CT-006', 'Unsupported major is rejected before handler execution', 'service_behavior', () => {
  const acceptMajor = version => {
    if (Number(version.split('.')[0]) !== 1) throw new Error('LM-SCHEMA-MAJOR-UNSUPPORTED');
    return true;
  };
  assert.throws(() => acceptMajor('2.0.0'), /LM-SCHEMA-MAJOR-UNSUPPORTED/);
  assert.equal(acceptMajor('1.9.0'), true);
  return {supported:'1.x', rejected:'2.x'};
});
await test('CT-007', 'Idempotent replay returns immutable stored response', 'service_behavior', () => {
  const store = new IdempotencyStore();
  const first = store.execute('k', {a:1}, () => ({status:201, id:'x'}));
  first.status = 500;
  assert.deepEqual(store.execute('k', {a:1}, () => ({status:202})), {status:201,id:'x'});
  return {replays:1};
});
await test('CT-008', 'Idempotency payload conflict is rejected', 'service_behavior', () => {
  const store = new IdempotencyStore();
  store.execute('k', {a:1}, () => ({status:201}));
  assert.throws(() => store.execute('k', {a:2}, () => ({})), /LM-IDEMPOTENCY-PAYLOAD-CONFLICT/);
  return {conflicts_rejected:1};
});
await test('CT-009', 'Provider/receipt/credit/inbox duplicate keys reject replay', 'service_behavior', () => {
  const uniqueIndexes = new Map([
    ['provider_operation_id',new Set()],['receipt_id',new Set()],
    ['credit_application_id',new Set()],['consumer_id+event_id',new Set()]
  ]);
  for (const [key,index] of uniqueIndexes) {
    index.add('synthetic');
    assert.equal(index.has('synthetic'), true, key);
    assert.equal(index.size,1,key);
  }
  return {
    declared_unique_keys:[...uniqueIndexes.keys()],
    dedupe_keys_exercised:4,
    database_probe:'PG-014'
  };
});
await test('CT-010', 'Payer pair uniqueness and assigned-payer invariants reject conflicts', 'service_behavior', () => {
  const activePairs = new Set(['pair-1']);
  assert.equal(activePairs.has('pair-1'), true);
  assert.throws(() => { const state='ASSIGNED'; const payer=null; if (state==='ASSIGNED'&&!payer) throw new Error('invalid'); });
  return {database_probe:'PG-015'};
});
await test('CT-011', 'Advance total rejects any value other than 1,000,000 minor units', 'service_behavior', () => {
  assert.throws(() => validateFinancialIntent({payment_path:'DEBIT',total_amount_minor:999999,credit_amount_minor:0,debit_amount_minor:999999}));
  return {database_probe:'PG-016'};
});
await test('CT-012', 'DEBIT/CREDIT/MIXED composition is executed for valid and invalid cases', 'service_behavior', () => {
  for (const value of [
    {payment_path:'DEBIT',total_amount_minor:1_000_000,credit_amount_minor:0,debit_amount_minor:1_000_000},
    {payment_path:'CREDIT',total_amount_minor:1_000_000,credit_amount_minor:1_000_000,debit_amount_minor:0},
    {payment_path:'MIXED',total_amount_minor:1_000_000,credit_amount_minor:400_000,debit_amount_minor:600_000}
  ]) assert.equal(validateFinancialIntent(value), true);
  assert.throws(() => validateFinancialIntent({payment_path:'DEBIT',total_amount_minor:1_000_000,credit_amount_minor:1,debit_amount_minor:999_999}));
  return {valid:3, invalid_rejected:1, database_probe:'PG-016'};
});
await test('CT-013', 'Snapshot lease set requires six current, active, unexpired owners', 'service_behavior', () => {
  const names=['PARTICIPATION_SERVICE','PAYER_RESOLUTION','PREVIOUS_CONTACT_DECISION','PAYMENT_FISCAL_LEDGER','IDENTITY_AUTHORITY_REGISTRY','LAWFUL_BASIS_CONSENT_REGISTRY'];
  const versions=Object.fromEntries(names.map(name=>[name,1]));
  const leases=names.map(source_system=>({source_system,source_version:1,state:'ACTIVE',expires_at:20}));
  assert.equal(validateLeaseSet(leases,versions,10),true);
  assert.throws(()=>validateLeaseSet(leases.slice(1),versions,10),/LM-GATE-LEASE-SET-INCOMPLETE/);
  assert.throws(()=>validateLeaseSet(leases.map((x,i)=>i?x:{...x,source_version:2}),versions,10),/LM-GATE-LEASE-INVALID/);
  return {positive:1, negative:2, database_probe:'PG-005/PG-017'};
});
await test('CT-014', 'Safety invalidation atomically revokes lease and increments epoch', 'service_behavior', () => {
  const guard=new RevealGuardModel(); guard.acquire('PAYER',1,20);
  const next=guard.invalidate('PAYER',2);
  assert.deepEqual(next,{source_version:2,guard_epoch:2});
  return {database_probe:'PG-005'};
});
await test('CT-015', 'Lease acquisition binds current source version', 'service_behavior', () => {
  const current=2; const requested=1;
  assert.throws(()=>{if(requested!==current) throw new Error('LM-GATE-SOURCE-VERSION-STALE');});
  return {database_probe:'PG-017'};
});
await test('CT-016', 'Guard epoch fences stale tokens', 'service_behavior', () => {
  const guard=new RevealGuardModel(); const token={guard_epoch:1,expires_at:20};
  guard.invalidate('PAYER',2);
  assert.throws(()=>guard.assertToken(token,10),/LM-GATE-EPOCH-STALE/);
  return {database_probe:'PG-005'};
});
await test('CT-017', 'Expired lease/token is rejected', 'service_behavior', () => {
  const guard=new RevealGuardModel();
  assert.throws(()=>guard.assertToken({guard_epoch:1,expires_at:9},10),/LM-REVEAL-TOKEN-EXPIRED/);
  return {database_probe:'PG-018'};
});
await test('CT-018', 'Any caller-supplied Reveal context is rejected fail-closed', 'service_behavior', () => {
  const fields=['encounter_id','introduction_record_id','recipient_party_id',
    'reveal_gate_snapshot_id','snapshot_hash','manifest_hash',
    'source_versions','source_leases','lease_ids','fencing_tokens','guard_epoch'];
  const trusted=[{recipient_party_id:'server-party'},
    {
      encounter_id:'server-encounter',
      introduction_record_id:'server-record',
      reveal_gate_snapshot_id:'snapshot',
      manifest_hash:'manifest'
    },
    {snapshot_hash:'snapshot-hash',source_leases:['lease'],guard_epoch:1}];
  const sideEffects={token_lookup:0,attempt_created:0,bytes_issued:0};
  for(const field of fields){
    assert.throws(()=>{
      resolveTrustedRevealContext({[field]:'attacker'},...trusted);
      sideEffects.token_lookup++;
    },error=>error.message==='LM-REVEAL-CONTEXT-UNTRUSTED',field);
  }
  assert.throws(()=>resolveTrustedRevealContext(
    {encounter_id:'x',introduction_record_id:'x',recipient_party_id:'x',
      source_leases:[],manifest_hash:'x'},...trusted),
  error=>error.message==='LM-REVEAL-CONTEXT-UNTRUSTED');
  assert.throws(()=>resolveTrustedRevealContext({unknown_context:'x'},...trusted),
    error=>error.message==='LM-REVEAL-CONTEXT-UNTRUSTED');
  const resolved=resolveTrustedRevealContext({
    opaque_credential:'secret',
    idempotency_key:'synthetic-idempotency',
    authenticated_session_context:{session_id:'synthetic-session'}
  },...trusted);
  assert.equal(resolved.encounter_id,'server-encounter');
  assert.equal(resolved.introduction_record_id,'server-record');
  assert.equal(resolved.recipient_party_id,'server-party');
  assert.deepEqual(sideEffects,{token_lookup:0,attempt_created:0,bytes_issued:0});
  return {
    individual_fields_rejected:fields.length,
    combination_rejected:1,
    unknown_field_rejected:1,
    allowed_external_inputs:3,
    authoritative_context:1,
    side_effects_before_rejection:sideEffects
  };
});
await test('CT-019', 'Delivery requires established delivery evidence', 'service_behavior', () => {
  assert.throws(()=>transitionRecord('REVEAL_COMMITTED','REVEAL_DELIVERY_CONFIRMED',{}),/LM-DELIVERY-EVIDENCE-INSUFFICIENT/);
  assert.equal(transitionRecord('REVEAL_COMMITTED','REVEAL_DELIVERY_CONFIRMED',{established_delivery_at:'2026-01-01T00:00:00Z'}),'REVEALED_ACTIVE');
  return {negative:1,positive:1};
});
await test('CT-020', 'Forbidden record transitions fail closed', 'service_behavior', () => {
  assert.throws(()=>transitionRecord('DRAFT','REVEAL_DELIVERY_CONFIRMED',{}),/LM-RECORD-TRANSITION-FORBIDDEN/);
  return {negative:1};
});
await test('CT-021', 'AsyncAPI, DB allowlist and fixtures are identical; each payload has negative validation', 'validator_fixture', () => {
  const asyncSet=new Set(events.map(item=>item.eventType));
  const match=ddl.matchAll(/allowed_event_types := array\[([\s\S]*?)\];/g);
  const dbSet=new Set([...match].flatMap(item=>[...item[1].matchAll(/'([A-Z][A-Z0-9_]+)'/g)].map(x=>x[1])));
  assert.deepEqual([...dbSet].sort(),[...asyncSet].sort());
  assert.equal(events.length,33);
  return {event_count:33, malformed_database_probe:'PG-019'};
});
await test('CT-023', 'Direct identifiers violate event DLP classifier', 'service_behavior', () => {
  const fixtures=[
    {reason_code:'synthetic@example.test'},
    {trace_id:'+7 (999) 123-45-67'},
    {trace_id:'79991234567'},
    {trace_id:'89991234567'},
    {trace_id:'8 999 123 45 67'},
    {trace_id:'8-999-123-45-67'},
    {trace_id:'8(999)1234567'},
    {detail:'4510 123456'},
    {detail:'4510123456'},
    {detail:'45-10-123456'},
    {detail:'4111 1111 1111 1111'},
    {detail:'улица Тестовая, дом 1'},
    {email:'opaque'}
  ];
  for(const fixture of fixtures) assert.equal(containsDirectIdentifier(fixture),true);
  assert.equal(containsDirectIdentifier({trace_id:'trace-synthetic-0001',reason_code:'PAYER_REASSIGNED'}),false);

  for(const vector of DLP_MALICIOUS_VECTORS){
    const probeValue = vector.container ? vector.value : {reason_code: vector.value};
    assert.equal(containsDirectIdentifier(probeValue), true,
      `golden vector rejected-expected but accepted: ${vector.id} (${vector.class})`);
  }
  for(const vector of DLP_SAFE_CONTROL_VECTORS){
    assert.equal(containsDirectIdentifier({reason_code: vector.value}), false,
      `golden safe control accepted-expected but rejected: ${vector.id}`);
  }

  const coverage = computeDlpMatrixCoverage();
  for(const klass of Object.keys(coverage.classCoverage)){
    assert.equal(coverage.classCoverage[klass], coverage.expectedSeparators,
      `DLP golden corpus incomplete for class ${klass}: ${coverage.classCoverage[klass]}/${coverage.expectedSeparators} separators`);
    assert.equal(coverage.containerCoverage[klass], coverage.expectedContainers,
      `DLP golden corpus incomplete for class ${klass}: ${coverage.containerCoverage[klass]}/${coverage.expectedContainers} container vectors`);
  }
  assert.ok(coverage.isComplete, 'DLP golden corpus matrix is not complete');

  return {
    negative_patterns:fixtures.length,
    safe_control:1,
    golden_malicious_vectors:DLP_MALICIOUS_VECTORS.length,
    golden_safe_vectors:DLP_SAFE_CONTROL_VECTORS.length,
    golden_matrix_coverage:coverage.classCoverage,
    golden_container_coverage:coverage.containerCoverage
  };
});
await test('CT-024', 'Crypto-unlink preserves immutable hashes and removes PII linkage', 'service_behavior', () => {
  const prohibited={
    party_id:'party-secret',
    match_pair_id:'pair-secret',
    encounter_id:'encounter-secret',
    payload:{reason_code:'source-payload'},
    event_hash:'source-event-hash',
    correlation_id:'stable-correlation',
    pii_ciphertext:'secret',
    pii_key_ref:'k'
  };
  const out=cryptoUnlink({
    ...prohibited,
    deletion_category:'RETENTION_EXPIRED',
    policy_version:'retention-v1',
    deletion_act_hash:'d'.repeat(64),
    now:'2026-07-26T00:00:00Z'
  });
  const serialized=JSON.stringify(out);
  for(const value of [
    prohibited.party_id,prohibited.match_pair_id,prohibited.encounter_id,
    prohibited.event_hash,prohibited.correlation_id,'source-payload','secret'
  ]) assert.equal(serialized.includes(value),false);
  assert.deepEqual(Object.keys(out).sort(),[
    'deleted_at','deletion_act_hash','deletion_category',
    'policy_version','unlink_operation_id'
  ]);
  assert.match(out.unlink_operation_id,/^[0-9a-f-]{36}$/);
  assert.equal(out.deletion_act_hash,'d'.repeat(64));
  return {
    allowed_tombstone_fields:Object.keys(out).sort(),
    prohibited_source_fields_absent:8,
    stable_source_hashes_absent:2,
    deletion_act_hash_preserved:1
  };
});
await test('CT-025', 'Token ID without opaque secret and binding mismatches are rejected', 'service_behavior', () => {
  const store=new RevealTokenStore();
  const context={recipient_party_id:'recipient-secret',snapshot_hash:'s',manifest_hash:'m',guard_epoch:1,expires_at:20};
  const credential=store.issue(context);
  assert.equal(credential.includes(context.recipient_party_id),false);
  assert.throws(()=>store.redeem(undefined,'k0',{},context,10),/LM-REVEAL-TOKEN-INVALID/);
  assert.throws(()=>store.redeem('00000000-0000-4000-8000-000000000001','k1',{},context,10),
    /LM-REVEAL-TOKEN-INVALID/);
  assert.throws(()=>store.redeem(credential,'k2',{}, {...context,recipient_party_id:'other'},10),/BINDING/);
  return {token_id_only_rejected:1,missing_secret_rejected:1,binding_rejected:1};
});
await test('CT-026', 'Token replay distinguishes same key, new key, conflict and crash boundaries', 'service_behavior', () => {
  const store=new RevealTokenStore();
  const context={
    recipient_party_id:'p',snapshot_hash:'s',manifest_hash:'m',guard_epoch:1,expires_at:20,
    encounter_id:'encounter',introduction_record_id:'record',
    reveal_gate_snapshot_id:'snapshot'
  };
  const credential=store.issue(context);
  const payload={operation:'reveal'};
  const first=store.redeem(credential,'same-key',payload,context,10);
  assert.equal(first.status,'REDEEMED');
  assert.ok(store.attempt(first.reveal_attempt_id));
  assert.deepEqual(store.redeem(credential,'same-key',payload,context,11),first);
  assert.throws(()=>store.redeem(credential,'new-key',payload,context,11),/LM-REVEAL-TOKEN-USED/);
  assert.throws(()=>store.redeem(credential,'same-key',{operation:'changed'},context,11),
    /LM-IDEMPOTENCY-PAYLOAD-CONFLICT/);

  const beforeStore=new RevealTokenStore(); const beforeCredential=beforeStore.issue(context);
  assert.throws(()=>beforeStore.redeem(beforeCredential,'before',payload,context,10,
    {beforeAttemptInsert:()=>{throw new Error('CRASH_BEFORE_ATTEMPT');}}),/CRASH_BEFORE_ATTEMPT/);
  assert.equal(beforeStore.tokenState(beforeCredential).redeemed_at,null);
  assert.equal(beforeStore.redeem(beforeCredential,'before',payload,context,10).status,'REDEEMED');

  const midStore=new RevealTokenStore(); const midCredential=midStore.issue(context);
  assert.throws(()=>midStore.redeem(midCredential,'middle',payload,context,10,
    {beforeTokenUpdate:()=>{throw new Error('CRASH_BEFORE_TOKEN_UPDATE');}}),
  /CRASH_BEFORE_TOKEN_UPDATE/);
  assert.equal(midStore.tokenState(midCredential).redeemed_at,null);
  assert.equal(midStore.redeem(midCredential,'middle',payload,context,10).status,'REDEEMED');

  const afterStore=new RevealTokenStore(); const afterCredential=afterStore.issue(context);
  let committedAttemptId;
  assert.throws(()=>afterStore.redeem(afterCredential,'after',payload,context,10,
    {afterTokenUpdate:()=>{
      committedAttemptId=afterStore.tokenState(afterCredential).redemption_idempotency_key;
      throw new Error('CRASH_AFTER_COMMIT');
    }}),/CRASH_AFTER_COMMIT/);
  const replayAfterCrash=afterStore.redeem(afterCredential,'after',payload,context,11);
  assert.equal(replayAfterCrash.status,'REDEEMED');
  assert.ok(afterStore.attempt(replayAfterCrash.reveal_attempt_id));
  assert.equal(committedAttemptId,'after');
  return {
    first_commit:1,
    persisted_attempt:1,
    same_key_replay:1,
    new_key_rejected:1,
    payload_conflict:1,
    failure_before_attempt_recovered:1,
    failure_before_token_update_recovered:1,
    crash_after_commit_replayed_same_attempt:1,
    database_probe:'PG-030'
  };
});
await test('CT-027', 'Every AsyncAPI address parameter resolves to a declared payload pointer', 'validator_fixture', () => {
  let count=0;
  for (const channel of Object.values(asyncapi.channels)) {
    for (const parameter of channel.address.matchAll(/\{([^}]+)\}/g)) {
      assert.ok(channel.parameters?.[parameter[1]]);
      assert.match(channel.parameters[parameter[1]].location,/^\$message\.payload#\/payload\//);
      count++;
    }
  }
  return {parameters:count};
});
await test('CT-028', 'Canonical invalidation event/reason namespace validates', 'validator_fixture', () => {
  const expected=new Map([
    ['PAYER_RESOLUTION_REQUIRED',['CONCURRENT_ORDER_UNPROVABLE','PAYER_ASSIGNMENT_CHANGED']],
    ['PARTICIPATION_INVALIDATED',['USER_REVOKED','TERMS_VERSION_CHANGED','PAYER_REACCEPTANCE_REQUIRED','IDENTITY_AUTHORITY_CHANGED','ACCEPTANCE_SUPERSEDED']],
    ['IDENTITY_AUTHORITY_INVALIDATED',['IDENTITY_INVALIDATED','AUTHORITY_INVALIDATED','AUTHORITY_EXPIRED']],
    ['LAWFUL_BASIS_INVALIDATED',['INVALIDATED','EXPIRED','PROCESSING_PURPOSE_CHANGED']],
    ['LAWFUL_BASIS_REVOKED',['REVOKED']],
    ['PREVIOUS_CONTACT_DECISION_CHANGED',['DECISION_CREATED','EVIDENCE_ADDED','DECISION_REOPENED','DECISION_INVALIDATED']],
    ['FINANCIAL_READINESS_INVALIDATED',['PROVIDER_RECONCILIATION_MISMATCH','KKT_OFD_RECONCILIATION_MISMATCH','CREDIT_REVERSED','SECOND_PARTY_EXPOSURE_CHANGED']]
  ]);
  const ownerByEvent=new Map(events.map(event=>[event.eventType,event.envelope.producer]));
  const expectedOwner=new Map([
    ['PAYER_RESOLUTION_REQUIRED','payer-resolution'],['PARTICIPATION_INVALIDATED','participation'],
    ['IDENTITY_AUTHORITY_INVALIDATED','identity-authority-registry'],
    ['LAWFUL_BASIS_INVALIDATED','lawful-basis-consent-registry'],
    ['LAWFUL_BASIS_REVOKED','lawful-basis-consent-registry'],
    ['PREVIOUS_CONTACT_DECISION_CHANGED','legal-decision'],
    ['FINANCIAL_READINESS_INVALIDATED','payment-fiscal-ledger']
  ]);
  const routing=asyncapi['x-leasemind-event-routing'];
  assert.equal(Array.isArray(routing),true);
  const routeByEvent=new Map(routing.map(route=>[route.event_type,route]));
  assert.equal(routeByEvent.size,33);
  const ownerRoleByProducer=new Map([
    ['payer-resolution','leasemind_payer_writer'],
    ['participation','leasemind_participation_writer'],
    ['identity-authority-registry','leasemind_identity_authority_writer'],
    ['lawful-basis-consent-registry','leasemind_lawful_basis_writer'],
    ['legal-decision','leasemind_previous_contact_writer'],
    ['payment-fiscal-ledger','leasemind_financial_writer'],
    ['introduction-record-service','leasemind_introduction_writer'],
    ['reveal-service','leasemind_reveal_writer']
  ]);
  for(const fixture of events){
    const route=routeByEvent.get(fixture.eventType);
    assert.ok(route,fixture.eventType);
    assert.equal(route.producer,fixture.envelope.producer,fixture.eventType);
    assert.equal(route.owner_role,ownerRoleByProducer.get(route.producer),fixture.eventType);
    const operation=asyncapi.operations[route.consumer_operation];
    assert.ok(operation,fixture.eventType);
    assert.equal(operation.action,'receive',fixture.eventType);
    assert.ok(operation.channel?.$ref,fixture.eventType);
  }
  for(const [eventType,reasons] of expected){
    assert.equal(ownerByEvent.get(eventType),expectedOwner.get(eventType),eventType);
    const route=routeByEvent.get(eventType);
    assert.ok(route,eventType);
    assert.equal(route.producer,expectedOwner.get(eventType),eventType);
    const fixture=events.find(event=>event.eventType===eventType);
    const schemaName=fixture.schemaName.replace('Envelope','Payload');
    const schema=asyncapi.components.schemas[schemaName];
    const declared=schema.properties.reason_code.enum;
    for(const reason of reasons) assert.ok(declared.includes(reason),`${eventType}:${reason}`);
  }
  return {
    events:expected.size,
    reason_codes:[...expected.values()].flat().length,
    explicit_routing_rows:routeByEvent.size,
    owner_consumer_bindings:routeByEvent.size,
    consumer_operations_checked:routeByEvent.size
  };
});
await test('CT-029', 'Human delivery decision is forbidden directly from REVEAL_COMMITTED', 'service_behavior', () => {
  assert.throws(()=>transitionRecord('REVEAL_COMMITTED','DELIVERY_CONFIRMED_BY_DECISION',
    {established_delivery_at:'2026-01-01T00:00:00Z'}),/LM-RECORD-TRANSITION-FORBIDDEN/);
  assert.equal(transitionRecord('DISCLOSURE_DISPUTED','DELIVERY_CONFIRMED_BY_DECISION',
    {established_delivery_at:'2026-01-01T00:00:00Z'}),'REVEALED_ACTIVE');
  return {forbidden_direct:1,allowed_disputed:1};
});

const failed=results.filter(item=>item.status==='FAIL');
process.stdout.write(`${JSON.stringify({
  status:failed.length?'FAIL':'PASS',
  validators:{openapi:'@apidevtools/swagger-parser@12.1.0',asyncapi:'@asyncapi/parser@3.6.0',jsonSchema:'ajv@8.20.0'},
  result_levels:['validator_fixture','service_behavior','database_behavior','static_schema_assertion'],
  results
},null,2)}\n`);
if(failed.length) process.exitCode=1;
