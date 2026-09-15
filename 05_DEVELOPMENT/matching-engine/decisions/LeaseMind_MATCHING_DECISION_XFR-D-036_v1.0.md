# LeaseMind Matching Decision Record — XFR-D-036

**Decision ID:** `XFR-D-036`

**Название:** Critical-data completeness threshold/rule governance boundary

**Версия:** 1.0

**Дата решения:** 2026-09-15

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED GOVERNANCE, AUTHORITY, EVIDENCE-PREREQUISITE AND FAIL-CLOSED BOUNDARY — CRITICAL-DATA SET, COMPLETENESS DEFINITION, THRESHOLD/RULE, DATA, POLICY, PRODUCTION, RUNTIME AND IMPLEMENTATION REMAIN OPEN`

**Decision authority:** explicit human project-governance confirmation on 2026-09-15.

**Repository baseline:** `ac2f02738c5949e0c234c81bcaefa4693504314f`

**Scope:** governance ownership and qualitative evidence boundary for a future minimum critical-data completeness threshold/rule used only by the Matching Qualification Gate. This record does not select the critical-data set, define completeness, choose numeric or deterministic rule form, or approve any value, formula, dataset, evaluation result, policy, production use, runtime carrier, or implementation.

**Canonical identity:** `MQP-07 → XFR-D-036`, `PRIMARY_STANDALONE` (`LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` §4.4). This record does not change the crosswalk or Inventory counts (102 source keys / 90 canonical IDs).

**Governance owner:** `Chief AI Architect + PRODUCT` — human-approved decision-specific assignment derived from the approved Qualification Policy artifact-owner boundary, not `SOURCE_NORMATIVE` for the numeric or exact completeness decision.

**Mandatory approvers:** `LEGAL + AI + DEVELOPMENT`.

**Evidence/technical-procedure owner:** `AI + DEVELOPMENT` under a future separately approved `MATCHING_EVALUATION_PLAN` procedure. Evidence preparation and technical verification grant no unilateral authority to approve the critical-data set, completeness definition, threshold/rule, policy, production applicability, or implementation.

**Depends on:** `XFR-D-045 v1.0` and the documented `XFR-F1` gap; `XFR-D-057 v1.0`, active `XFR-D-058 v1.1`, active `XFR-D-059 v1.1`, `XFR-D-060 v1.0`, and applicable `XFR-D-062 v1.0`–`XFR-D-071 v1.0` remain independently applicable evidence prerequisites. `XFR-D-034`, `XFR-D-035`, `XFR-D-M1`, `XFR-D-M2`, `XFR-D-033`, `XFR-D-038`, `XFR-D-042`, `XFR-D-045`, and `XFR-D-046` remain independent and are not reopened, absorbed, or completed here.

---

## 1. Вопрос

Кто владеет будущим решением о minimum critical-data completeness threshold/rule для Matching Qualification Gate, и какие qualitative governance, evidence, non-compensation и fail-closed границы обязательны до появления отдельно утверждённых critical-data set, completeness definition, evidence package и exact rule?

## 2. Source/status discipline

1. Architecture §18.1 устанавливает только качественное условие Qualification Gate: минимальная полнота critical data должна быть достаточной. Источник не определяет critical-data set, completeness formula, numerator, denominator, counting unit, threshold или rule.
2. `LeaseMind_MATCHING_QUALIFICATION_POLICY_v0.1.md` §6 row 4 сохраняет это условие как `SOURCE_NORMATIVE`, а численный threshold/rule — как `OPEN`; §10 разводит completeness от Match Score, Confidence Score и Risk Score; §15 row 7 сохраняет вопрос как candidate assignment без owner.
3. Qualification Policy §15 row 19 и `XFR-D-045 v1.0` подтверждают `XFR-F1`: текущий Evaluation Plan не содержит Qualification-specific metric family для mutual-fit, Confidence cutoff и completeness. `XFR-D-045` утверждает только owner/evidence-prerequisite boundary будущего общего evidence package и не закрывает `XFR-D-036`.
4. Inventory §4.4 индексирует `MQP-07 → XFR-D-036`, `PRIMARY_STANDALONE`; Inventory не является источником substantive approval.
5. Feature Schema `required_evidence_level`, Architecture exact `evidence_status`, per-value freshness, dataset label eligibility, Evaluation segment coverage и Qualification completeness — разные понятия. Ни одно не создаёт definition или numeric value для другого по сходству названия.

Этот record разрешает только decision-specific роли и qualitative governance/evidence boundary. Всё exact и numeric содержание остаётся `OPEN`.

## 3. Решение

### 3.1. Governance owner и approval-разделение

1. Governance owner будущего completeness threshold/rule — `Chief AI Architect + PRODUCT`.
2. Mandatory approvers — `LEGAL + AI + DEVELOPMENT`.
3. Evidence/technical-procedure owner — `AI + DEVELOPMENT`; он готовит evidence и проверяет воспроизводимость, но не утверждает решение единолично.
4. Любой actual completeness threshold/rule требует полного owner/approver set, нового versioned decision record и immutable evidence references на одном version/hash bundle.
5. Artifact ownership `MATCHING_QUALIFICATION_POLICY` и decision-specific ownership этой записи не утверждают сам Proposal и не передают authority Evaluation Plan, Feature Schema или runtime-компонентам.

### 3.2. Qualitative meaning без exact definition

Будущий completeness object может оценивать только отдельно утверждённый critical-data set для конкретного Qualification use и purpose. Он не может молча означать «процент заполненных полей», «наличие любого evidence», «отсутствие null», «достаточный Confidence», «полное покрытие dataset» или «готовность профиля».

Выбор между numeric threshold, all-required deterministic rule, typed composite rule или иной exact representation этим record'ом не сделан. Ни один вариант не считается предпочтённым, исключённым или approved.

### 3.3. Раздельность и non-compensation

Completeness остаётся отдельной Qualification evidence family наряду с mutual-fit и Confidence cutoff по `XFR-D-045`. Высокие Match Score, mutual fit, Confidence, низкий Risk, хорошая ranking quality, aggregate dataset performance, достаточность другого сегмента или бизнес-срочность не компенсируют отсутствующую или недостаточную completeness evidence.

Внутри будущей completeness procedure агрегат по некритическим полям, большинству строк, пользователям, Campaign, сегментам или временным окнам не может компенсировать отсутствие отдельно утверждённого critical input или обязательного evidence, если только такой exact aggregation не будет отдельно утверждён полным owner/approver set. Этот record такую aggregation не утверждает.

### 3.4. Evidence prerequisites

До exact decision будущий evidence package обязан как минимум раздельно зафиксировать:

1. candidate critical-data set, applicability, use и purpose;
2. source authority, allowed evidence state и required-evidence dependency для каждого candidate input;
3. candidate completeness definition, counting unit и treatment каждого missing/unknown/stale/conflicting/incompatible state;
4. baseline, измеренный до candidate-rule search;
5. immutable frozen manifest и раздельные tuning/untouched-final evidence;
6. label eligibility, adjudication, grouping/isolation, allocation и correction-history provenance;
7. uncertainty, false-eligibility и false-exclusion counter-evidence;
8. applicable segment/intersection sufficiency и LEGAL/fairness review;
9. synthetic-only versus production applicability statement;
10. version/hash binding, reproducibility report и полный owner/approver verdict.

Эти пункты утверждают только обязательные categories будущего package, не их exact content, values, dataset, metric, statistics или verdict.

### 3.5. Baseline-first и tuning/final isolation

Baseline измеряется до поиска candidate threshold/rule. Candidate definition, critical-data set, missing-state treatment и version bundle замораживаются до final evaluation. Tuning evidence не переиспользуется как untouched final evidence, а несовместимые версии не объединяются.

### 3.6. Fail-closed boundary

Если applicable critical-data set, completeness definition, threshold/rule, evidence package, policy version/hash или compatibility отсутствует, не утверждён, ambiguous, stale, conflicting, incomplete или incompatible, блокируется только affected Qualification progression, зависящая от этого решения.

Такое состояние не превращается в нулевую completeness, negative fact, failed Hard Constraint, automatic `INELIGIBLE`, `REJECTED_BY_MATCHING`, `HUMAN_REVIEW_REQUIRED`, `QUALIFIED_HYPOTHESIS`, Risk result или иной угаданный route и не блокирует unrelated processing.

### 3.7. Independence of adjacent decisions

1. `XFR-D-034` mutual-fit threshold и `XFR-D-035` Confidence cutoff остаются отдельными decisions и evidence families.
2. `XFR-D-M1` required-evidence governance и exact per-feature `required_evidence_level` не определяют completeness threshold/rule.
3. `XFR-D-033` определяет qualitative precedence, но не выбирает completeness value, formula или route при отсутствии decision.
4. `XFR-D-038` `STALE` сохраняется как отдельное freshness/actionability state и не становится completeness result.
5. `XFR-D-042` segment-specific Qualification governance не создаёт global или segment completeness threshold.
6. `XFR-D-045` governs future evidence package, но не утверждает actual threshold/rule; `XFR-D-046` запрещает production claim из synthetic-only evidence.
7. `XFR-D-061` Hard-Filter false exclusion, `XFR-D-063` ranking/calibration targets и `XFR-D-064` segment diagnostic coverage не являются Qualification completeness.

### 3.8. No automatic action

Evidence, CI, documentation, merge или future evaluation result не изменяет автоматически Qualification/Scoring/Risk/Feature/Evaluation Policy, critical-data membership, required-evidence levels, model, routing, release, runtime или gate status. Отдельные controlled-artifact approvals и release gates обязательны.

### 3.9. Partial, never fully resolved

`XFR-D-036` получает только `PARTIALLY_RESOLVED_BOUNDARY`: роли, approval separation, qualitative meaning boundary, evidence categories, baseline-first/tuning-final discipline, non-compensation, fail-closed handling, non-conflation и no-automatic-action rule утверждены.

Critical-data set, exact completeness definition, metric/rule form, threshold/value, evidence package, policy, production applicability, carrier, runtime и implementation остаются `OPEN`.

## 4. Layer/authority table

| Layer | Authority | Resolved by this record | Remains `OPEN` |
|---|---|---|---|
| Qualitative Qualification condition | Architecture §18.1 | Preserved without reinterpretation | Exact operationalization |
| Canonical identity | Inventory §4.4 | `MQP-07 → XFR-D-036`, `PRIMARY_STANDALONE`, unchanged | Future overlay only |
| Decision governance | Human confirmation | Owner/approvers/evidence role | Named appointments/RBAC/process details |
| Critical-data set | Future Qualification Policy decision | No selection | Fields, sources, applicability, purpose, segments |
| Completeness object | Future versioned decision | Qualitative separation only | Definition, formula, counting unit, missing treatment |
| Threshold/rule | Future evidence-backed decision | No value or form selected | Comparator, value, unit, range, tolerance, precision |
| Evidence | `XFR-D-045`, Evaluation cluster | Prerequisite categories only | `XFR-F1` content, dataset, metrics, statistics, results, verdict |
| Policy/manifest | Controlled artifacts | No approval | Exact entries and versions |
| Runtime/production | Separate release gates | No authorization | Carrier, API/DB/schema/event, rollout, implementation |

## 5. Обязательные non-conflations

1. Critical-data completeness ≠ generic profile completeness or filled-field ratio.
2. Critical-data completeness ≠ Feature Schema `required_evidence_level` or Architecture `evidence_status`.
3. Qualification completeness ≠ dataset-label completeness, allocation completeness, segment coverage or statistical power.
4. Completeness threshold/rule ≠ mutual-fit threshold (`XFR-D-034`) or Confidence cutoff (`XFR-D-035`).
5. Missing/stale/conflicting input ≠ automatic zero, failure, negative fact or route.
6. High score, low Risk, Confidence or aggregate performance ≠ compensation for completeness insufficiency.
7. Evidence-procedure ownership ≠ governance approval authority.
8. Synthetic evidence ≠ production applicability or readiness.
9. Documentation, CI, commit or merge ≠ Policy, manifest, runtime or implementation approval.

## 6. Что остаётся `OPEN`

- critical-data universe, field membership, applicability, requiredness, source authority and purpose;
- completeness definition, numerator, denominator, counting unit, formula, aggregation and weighting;
- numeric or non-numeric rule form, comparator, value, unit, range, scale, precision, rounding and tolerance;
- treatment and cascade granularity for missing, unknown, null, stale, expired, revoked, conflicting, disputed, inconclusive or incompatible inputs;
- global, segment, intersection, Campaign, user, temporal and other applicability;
- `XFR-F1` metric-family content, baseline, target, sample size, split, confidence interval, aggregation window, statistical test and uncertainty method;
- dataset, labels, evaluation run, evidence package, result, verdict and production-data applicability;
- exact relationship to required-evidence values, Confidence calibration and policy versions;
- named appointments, RBAC, quorum, review workflow and appeal;
- Qualification/Evaluation/Feature/Scoring/Risk Policy and Controlled Artifact Manifest approval;
- API, DB, schema, event, carrier, caching, observability, runtime, rollout and implementation.

## 7. Rationale

Architecture requires minimum critical-data completeness qualitatively but supplies no operational definition. Inventing a percentage, treating every field equally, or declaring every required field critical would silently create product and legal policy. Assigning the full cross-functional role split and evidence discipline allows the future decision to be prepared reproducibly while preserving the honest `XFR-F1` gap and preventing a technical default from becoming a business outcome.

## 8. Adversarial cases

1. **A conventional percentage value is inserted because the source has none.** Rejected: no value is approved.
2. **Completeness is computed as non-null fields divided by all fields.** Rejected: neither critical-data membership nor formula is approved.
3. **A high Match Score or Confidence compensates for a missing critical input.** Rejected by non-compensation.
4. **A missing decision becomes completeness zero and automatic rejection.** Rejected by affected-progression-only fail closed.
5. **`required_evidence_level` is reused as the completeness rule.** Rejected: it is a separate per-feature governance object.
6. **Dataset segment coverage is cited as proof of per-Match completeness.** Rejected: diagnostic coverage and runtime Qualification input are distinct.
7. **Synthetic-only results are used for production threshold approval.** Rejected under `XFR-D-046` preservation.
8. **The evidence team or a runtime implementation chooses the value.** Rejected without the complete owner/approver set and versioned record.
9. **A merge, successful CI or policy prose activates the rule.** Rejected: no automatic action or implementation authority exists.

## 9. Затронутые артефакты — future separate sync only

- `LeaseMind_MATCHING_QUALIFICATION_POLICY_v0.1.md` may later receive only the approved status/role/qualitative-boundary overlay for §15 row 7;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` may later record decision provenance without changing `MQP-07 → XFR-D-036` or counts;
- a future separately approved `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` revision may create the missing `XFR-F1` content, but this record does not.

No sync is performed by this record. Qualification Policy, Evaluation Plan, Inventory, Feature Schema, Scoring/Risk/Safe Presentation policies, Data Contracts, manifests, sibling records, runtime and code remain untouched.

## 10. Change control

Any change to governance owner, mandatory approvers, evidence role, qualitative completeness boundary, evidence categories, non-compensation, fail-closed semantics, dependencies or no-automatic-action rule requires a new versioned `XFR-D-036` record with `supersedes`, approved by `Chief AI Architect + PRODUCT + LEGAL + AI + DEVELOPMENT` on the same version/hash.

Every exact critical-data set, completeness definition, threshold/rule, metric, dataset, evidence package, policy, production, carrier, runtime or implementation decision requires its own evidence-backed approval and cannot be introduced by silent edit, conventional default, sync, code, CI, commit, merge or deployment.

## 11. Gate impact

`NONE`.

`IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` remain `BLOCKED`.

This record approves no Proposal, Policy, Data Contract, dataset, evaluation run/result, production-data use, manifest entry, runtime, release or implementation.

## 12. Acceptance criteria

1. **Given** governance roles, **when** checked, **then** owner is `Chief AI Architect + PRODUCT`, mandatory approvers are `LEGAL + AI + DEVELOPMENT`, and evidence owner `AI + DEVELOPMENT` has no unilateral authority.
2. **Given** canonical identity, **when** checked, **then** `MQP-07 → XFR-D-036`, `PRIMARY_STANDALONE`, and 102/90 counts remain unchanged.
3. **Given** this record, **when** searched for an approved critical-data set, formula, numerator, denominator, counting unit, comparator, numeric value, tolerance or statistical method, **then** none exists.
4. **Given** completeness, **when** compared with mutual-fit, Confidence, Risk, required-evidence, freshness, dataset completeness or segment coverage, **then** no conflation or compensation is permitted.
5. **Given** missing/unapproved/ambiguous/stale/conflicting/incompatible threshold or evidence, **when** Qualification progression depends on it, **then** only that progression blocks fail closed without guessed value, adverse fact, automatic `INELIGIBLE`, rejection or route.
6. **Given** future evidence, **when** prepared, **then** baseline-first, immutable frozen manifest, tuning/final isolation, eligible provenance, uncertainty, segment/fairness/legal review and counter-evidence are required without this record approving exact contents.
7. **Given** `XFR-D-034`, `XFR-D-035`, `XFR-D-M1`, `XFR-D-M2`, `XFR-D-033`, `XFR-D-038`, `XFR-D-042`, `XFR-D-045`, `XFR-D-046` or `XFR-D-057`–`071`, **when** this record is applied, **then** none is reopened, absorbed, substituted or fully resolved.
8. **Given** synthetic-only evidence, **when** production applicability is claimed, **then** the claim is rejected.
9. **Given** documentation, CI, commit, merge or runtime code, **when** cited as approval, **then** no policy, threshold/rule, production or implementation authority is created.
10. **Given** all three governance gates, **when** checked, **then** all remain `BLOCKED`.

## 13. Итог

`XFR-D-036 PARTIALLY_RESOLVED_BOUNDARY — GOVERNANCE OWNER, MANDATORY APPROVERS, EVIDENCE ROLE, QUALITATIVE COMPLETENESS SEPARATION, EVIDENCE PREREQUISITES, NON-COMPENSATION, BASELINE-FIRST/TUNING-FINAL, FAIL-CLOSED AND NO-AUTOMATIC-ACTION BOUNDARIES APPROVED; CRITICAL-DATA SET, COMPLETENESS DEFINITION, THRESHOLD/RULE, XFR-F1 CONTENT, DATASET, EVIDENCE, POLICY, PRODUCTION, RUNTIME AND IMPLEMENTATION REMAIN OPEN/BLOCKED`
