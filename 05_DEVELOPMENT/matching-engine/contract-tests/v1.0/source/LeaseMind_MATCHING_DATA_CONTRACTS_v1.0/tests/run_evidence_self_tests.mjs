import assert from 'node:assert/strict';
import {resolveCtEvidence} from './evidence_matrix.mjs';

const pass = (id,evidence={}) => ({id, status:'PASS',evidence});
const fail = id => ({id, status:'FAIL'});
const results = [];
const test = (id, name, fn) => {
  fn();
  results.push({id,status:'PASS',level:'runner_self_test',name});
};

test('EV-001','missing dependency produces NOT_RUN',()=>{
  const [result]=resolveCtEvidence([pass('LOCAL')],[],{'CT-X':['LOCAL','PG-X']});
  assert.equal(result.status,'NOT_RUN');
  assert.deepEqual(result.missing,['PG-X']);
});
test('EV-002','renamed dependency produces NOT_RUN',()=>{
  const [result]=resolveCtEvidence([pass('LOCAL')],[pass('PG-RENAMED')],{'CT-X':['LOCAL','PG-X']});
  assert.equal(result.status,'NOT_RUN');
});
test('EV-003','failed dependency produces BLOCKED',()=>{
  const [result]=resolveCtEvidence([pass('LOCAL')],[fail('PG-X')],{'CT-X':['LOCAL','PG-X']});
  assert.equal(result.status,'BLOCKED');
  assert.deepEqual(result.non_pass,['PG-X']);
});
test('EV-004','all exact dependencies are required for PASS',()=>{
  const [result]=resolveCtEvidence([pass('LOCAL')],[pass('PG-X')],{'CT-X':['LOCAL','PG-X']});
  assert.equal(result.status,'PASS');
  assert.equal(result.evidence.length,2);
});
test('EV-005','missing required evidence counter produces BLOCKED',()=>{
  const [result]=resolveCtEvidence(
    [pass('LOCAL')],
    [pass('PG-X')],
    {'CT-X':['LOCAL','PG-X']},
    {'CT-X':[{dependency:'PG-X',path:'counter',equals:1}]}
  );
  assert.equal(result.status,'BLOCKED');
  assert.equal(result.semantic_gaps.length,1);
});
test('EV-006','counter below machine minimum produces BLOCKED',()=>{
  const [result]=resolveCtEvidence(
    [pass('LOCAL')],
    [pass('PG-X',{counter:4})],
    {'CT-X':['LOCAL','PG-X']},
    {'CT-X':[{dependency:'PG-X',path:'counter',minimum:5}]}
  );
  assert.equal(result.status,'BLOCKED');
});
test('EV-007','exact evidence schema and count produce PASS',()=>{
  const [result]=resolveCtEvidence(
    [pass('LOCAL')],
    [pass('PG-X',{counter:5,dimensions:['a','b']})],
    {'CT-X':['LOCAL','PG-X']},
    {'CT-X':[
      {dependency:'PG-X',path:'counter',minimum:5},
      {dependency:'PG-X',path:'dimensions',equals:['a','b']}
    ]}
  );
  assert.equal(result.status,'PASS');
  assert.equal(result.semantic_checks.length,2);
});

process.stdout.write(`${JSON.stringify({status:'PASS',results},null,2)}\n`);
