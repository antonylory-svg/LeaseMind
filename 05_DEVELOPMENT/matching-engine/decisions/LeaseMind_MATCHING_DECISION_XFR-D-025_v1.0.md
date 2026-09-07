# LeaseMind Matching Decision Record — XFR-D-025

**Decision ID:** `XFR-D-025`

**Название:** Criterion-class weighting qualitative governance and evidence-prerequisite boundary

**Версия:** 1.0

**Дата решения:** 2026-09-07

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED QUALITATIVE GOVERNANCE AND EVIDENCE-PREREQUISITE BOUNDARY — ALL EXACT CLASS ASSIGNMENTS, PARTICIPATION RULES, WEIGHTS, RATIOS, FORMULAS, NORMALIZATION, DATA, METRICS, STATISTICS, RUNTIME AND IMPLEMENTATION CONTENTS REMAIN OPEN`

**Decision authority:** human project-governance confirmation on 2026-09-07.

**Repository baseline:** `f6a6f7b5dfc43dccf8249b0c8f126457d90fad59`

**Canonical identity:** `MSP-13 → XFR-D-025`, `PRIMARY_STANDALONE` — «Weighting among mandatory/desirable/negotiable criterion classes».

**Scope:** qualitative governance, semantic separation, fail-closed handling and evidence prerequisites for any future weighting among criterion classes. This record does not approve exact assignments, hierarchy, participation or applicability rules, numeric weights or ratios, formulas, normalization, numerator/denominator treatment, double-counting treatment, segment overrides, precision, replay tolerance, dataset, metric, target, statistical procedure/result, Scoring/Feature/Evaluation/Risk/Qualification Policy, production applicability, schema/carrier/runtime, monitoring, rollback or implementation.

**Governance owner:** `AI + PRODUCT` — human-approved candidate-derived assignment for this standalone `XFR-D-025`; no source directly assigns an owner to this exact standalone decision, so this assignment is not claimed as `SOURCE_NORMATIVE`.

**Scoring Policy artifact owner:** `Chief AI Architect + PRODUCT` — source-owned artifact owner under Architecture §52. Artifact ownership remains separate from decision-specific governance.

**Mandatory approvers:** `Chief AI Architect + LEGAL + DEVELOPMENT`.

**Evidence/technical-procedure owner:** `AI + DEVELOPMENT`; this role prepares candidate specifications, evidence and reproducibility procedure, but has no unilateral authority to approve semantics, assignments, participation, values, evidence sufficiency, policy, production use, runtime, implementation or a governance gate.

**Preserved source-owned authority:** `XFR-D-M5` retains the `AI + PRODUCT` source-normative decision-owner authority of Architecture §37 question №3 for starting/segment weights and minimum thresholds. This record neither absorbs nor resolves `XFR-D-M5`.

**Depends on and preserves:** `XFR-D-017`–`XFR-D-024`, `XFR-D-026`–`XFR-D-028`, `XFR-D-057`–`XFR-D-071`, the Scoring Policy, Feature Schema, Evaluation Plan, Risk Policy, Qualification Policy and Controlled Artifact Manifest retain their independent scope, status and authority. None is absorbed, reopened, superseded or approved by this record.

---

## 1. Вопрос

Какая qualitative governance и evidence-prerequisite boundary должна действовать до утверждения weighting между mandatory, desirable и negotiable criterion classes, пока exact class assignments, participation rules, weights, formulas, datasets and runtime contents остаются `OPEN`?

---

## 2. Source/status discipline

1. Architecture §11 source-normatively называет четыре класса критерия: обязательный, желательный, переговорный и информационный.
2. Architecture §§12.1–12.3 source-normatively определяет различия между mandatory, desirable и negotiable semantics, но не задаёт weights между ними.
3. Architecture §12.4 и §15.4 запрещают превращать unknown/missing в zero или violation: missing исключается из numerator/denominator и отдельно учитывается в Confidence Score.
4. Architecture §14 и §15.4 требуют обрабатывать confirmed approved Hard Constraint до scoring. Architecture §24 сохраняет приоритет Hard Constraint над rank.
5. Architecture §37 question №3 source-normatively назначает `AI + PRODUCT` owner'ом starting weights and minimum segment thresholds; Inventory канонически объединяет эту грань в `XFR-D-M5`, а не в `XFR-D-025`.
6. Architecture §52 source-normatively назначает `Chief AI Architect + PRODUCT` owner'ом `MATCHING_SCORING_POLICY` artifact. Это ownership артефакта, не решение exact standalone `XFR-D-025`.
7. Scoring Policy §12 row 13 и Inventory фиксируют `MSP-13 → XFR-D-025`, `PRIMARY_STANDALONE`; они индексируют open question и candidate assignment, но сами не создают substantive approval.
8. Feature Schema сохраняет four-class design-time candidate, но прямо не владеет Feature Weight и не утверждает class weighting, runtime carrier or policy.
9. Все Proposal-документы остаются Proposal. Их merge, reference или успешная evaluation не превращает candidate content в source-normative policy.

---

## 3. Решение

### 3.1. Decision-specific authority split

1. Governance owner `XFR-D-025` — `AI + PRODUCT`, human-approved candidate-derived assignment, не `SOURCE_NORMATIVE` для standalone decision.
2. Scoring Policy artifact owner — `Chief AI Architect + PRODUCT`, source-normative по Architecture §52.
3. Mandatory approvers — `Chief AI Architect + LEGAL + DEVELOPMENT`.
4. Evidence/technical-procedure owner — `AI + DEVELOPMENT`, без unilateral semantic, assignment, participation, weight, evidence-sufficiency, policy, production, runtime or implementation authority.
5. `XFR-D-M5` source-normative `AI + PRODUCT` authority для Architecture §37 question №3 остаётся отдельной. Совпадение role pair не объединяет canonical decisions и не переносит их approval.
6. Governance owner, artifact owner, mandatory approvers, evidence owner, runtime writer and reviewer are distinct roles. Ни один role не может единолично утверждать future exact content.

### 3.2. Exact criterion-class semantics are preserved

1. **Mandatory criterion:** нарушение подтверждённого обязательного критерия исключает пару из обычного ranking только в соответствии с separately approved Hard Constraint boundary and applicable source/evidence rules.
2. **Desirable criterion:** влияет на Match Score, но допускает компромисс; его отсутствие не означает automatic rejection.
3. **Negotiable criterion:** используется только для scenario analysis; Matching Engine не может считать цену, бюджет, срок, location or another condition изменённым без human confirmation.
4. **Informational criterion:** отдельный source-normative class из Architecture §11. Этот record сохраняет его identity, но не решает, участвует ли он в weighting/scoring, с каким applicability или weight.
5. Эти meanings не образуют numeric or ordinal hierarchy. Термины `mandatory`, `desirable`, `negotiable`, `informational` сами по себе не задают weight, ratio, sign, scale, priority, denominator participation or runtime representation.

### 3.3. Criterion class is not another scoring, evidence or routing layer

Criterion class remains distinct from:

- Feature Weight and Feature Fit;
- confirmed Hard Constraint and Eligibility result;
- `evidence_status`, `required_evidence_level` and feature/value-level Evidence Confidence;
- overall Confidence Score;
- Risk Score/category;
- Qualification result or route;
- Priority Score, rank and diversification;
- user-facing explanation or disclosure permission.

No equality of label, token, wording, numeric value or carrier may create mapping, equivalence, alias or authority between these layers.

### 3.4. Hard Constraint precedence and non-softening

1. A separately approved, applicable and evidence-supported confirmed Hard Constraint violation is handled before scoring and cannot be softened, averaged, normalized or compensated by criterion-class weights, another class, high score, confidence, rank or aggregate evidence.
2. The label `mandatory` alone does not create a Hard Constraint, `INELIGIBLE`, rejection or Qualification route. Creation and application of a Hard Constraint require the separately governed definition, authority and evidence conditions of Architecture §§12.1 and 14 and their approved decision records.
3. A `desirable` class or a large future weight cannot create automatic exclusion, rejection or a Hard Constraint.
4. A `negotiable` criterion remains scenario-only until human confirmation and cannot silently mutate the underlying profile, agreed term or evidence.
5. This record does not decide whether or how one factor may appear across Eligibility, scoring, Confidence, Risk or Qualification; exact anti-double-counting treatment remains `OPEN`. Any future design must expose and evaluate the separate contributions rather than hide compensation.

### 3.5. Fail-closed affected-use handling

If the applicable criterion class, source, evidence, version/hash, freshness, lawful basis, class-to-weight specification or participation rule is missing, unknown, stale, conflicting, ambiguous, incompatible, expired, revoked or unauthorized, the affected weighting/scoring use fails closed:

1. no invented/default/equal/average/nearest weight, ratio, class or participation rule is assigned;
2. the condition is not coerced to zero, neutral, negative, failed, violated or confirmed;
3. no Hard Constraint, `INELIGIBLE`, rejection, Qualification route, Risk conclusion, rank, safe reason or display permission is inferred;
4. no AI inference, heuristic, proxy, model confidence or technical parse success may repair the missing authority;
5. only the affected use is blocked unless an independently approved rule requires a broader outcome; no new runtime status or whole-pair outcome is created by this record.

### 3.6. Global and segment-specific weighting remain separate

1. Global class weighting, segment-specific class weighting and per-feature weighting are distinct future decisions.
2. A segment override requires separately approved global baseline, segment universe, lawful explicit membership, applicability and evidence. `XFR-D-018` remains the controlling qualitative governance boundary for Scoring segment overrides.
3. Missing/unknown/unclassified/ambiguous/stale/conflicting segment membership cannot be guessed, AI-inferred, heuristic-derived or proxy-imputed and cannot activate a segment-specific rule.
4. Aggregate, majority, another segment or apparently favorable overall evidence cannot compensate for insufficient/adverse evidence in an applicable segment or intersection.
5. No segment weight or minimum threshold is approved here; Architecture §37 question №3 remains `OPEN` under `XFR-D-M5` and related independent records.

### 3.7. Minimum evidence prerequisites for any future exact approval

Before any exact class-weighting content may be proposed for approval, the evidence package must be immutable and version/hash-bound and must identify at least:

1. canonical candidate specification, all criterion classes, affected features/dimensions and participation assumptions;
2. exact source, evidence, lawful-purpose and class-assignment lineage, with unresolved/conflicting cases reported separately;
3. frozen component-atomic allocation of related pairs/entities/history so the same component cannot cross tuning/final or comparison arms;
4. explicit no-reroll, no leakage, no post-result relabeling and no cherry-picking controls;
5. baseline measured before candidate search, with candidate-search history and rejected candidates preserved;
6. strict tuning/final isolation and an untouched final set;
7. preregistered metrics, targets, comparison direction, uncertainty method, segments/intersections and stop/fail rules;
8. compatible like-for-like comparison with all other formula, data, preprocessing and policy inputs frozen or differences disclosed;
9. separate full reporting for mandatory, desirable, negotiable and informational cases, each applicable segment/intersection, missing/unknown/conflicting evidence, false exclusion and false eligibility counter-evidence;
10. non-compensation: aggregate or favorable evidence cannot hide adverse/insufficient evidence for a class, segment, intersection, Hard Constraint boundary or other independent safeguard;
11. deterministic/exact replay evidence separated from semantic correctness, fairness, calibration and production suitability;
12. explicit synthetic-versus-production applicability statement and production-data authority/provenance where a production claim is sought;
13. version/hash-bound reviewer record by the complete owner/approver set and reproducibility verification by DEVELOPMENT.

These are evidence categories, not an approved dataset, metric, target, method, result or sufficiency verdict.

### 3.8. Replay, synthetic evidence and historical integrity

1. Exact replay proves only reproducibility for a frozen version/hash/input bundle. It does not prove semantic correctness, fairness, calibration, production readiness or approval.
2. Synthetic-only evidence may support a separately authorized synthetic/development comparison, but cannot establish production weighting, production calibration, production-data validity, readiness or launch.
3. Future approved changes are prospective and versioned. Historical calculations retain their original class assignments, weights, formulas, inputs, evidence and policy/version/hash bundle; they are not silently recalculated or relabeled.
4. A new candidate or successful result never automatically changes a Hard Constraint, criterion class, Feature Weight, formula, ranking, policy, model, manifest, release, runtime or gate.

### 3.9. Independent decision boundaries remain independent

1. `XFR-D-M5` — starting/segment weights and minimum thresholds — remains separate and `OPEN` in exact content.
2. `XFR-D-017` Mutual Aggregate function and anti-masking governance remain separate.
3. `XFR-D-018` segment-override governance and lawful membership remain separate.
4. `XFR-D-019` evidence-status → Evidence Confidence mapping and `XFR-D-M6` joint calibration remain separate.
5. `XFR-D-020` numeric representation, precision, rounding, serialization and exact replay mechanics remain separate.
6. `XFR-D-021` ranking/diversification algorithm governance remains separate.
7. `XFR-D-022` sensitivity/calibration dataset and targets remain separate.
8. `XFR-D-023` prospective change/version compatibility and historical immutability remain separate.
9. `XFR-D-024 v1.1` Priority Score input/order boundary remains separate.
10. `XFR-D-026` synthetic-only versus production calibration boundary and `XFR-D-027` operational/evidence role boundary remain separate.
11. `XFR-D-028` internal Dimension Score explanation ownership and external Safe Presentation boundary remain separate.
12. `XFR-D-057`–`XFR-D-071`, especially dataset/evaluation governance `XFR-D-062`, metric-family governance `XFR-D-063`, segment/fairness evidence `XFR-D-064`/`XFR-D-068`, threshold evidence `XFR-D-070` and post-freeze correction governance `XFR-D-071`, remain prerequisites where applicable and are not approved or replaced here.

### 3.10. Partial, never fully resolved

`XFR-D-025` is `PARTIALLY_RESOLVED_BOUNDARY`: it resolves only qualitative semantics, authority separation, fail-closed/non-compensation rules and evidence prerequisites. It does not resolve any exact assignment, participation, value, formula, dataset, evidence result, policy, production, carrier, runtime or implementation question.

---

## 4. Layer and authority table

| Layer | Authority preserved | Approved by this record | Remains `OPEN` |
| --- | --- | --- | --- |
| Criterion-class semantics | Architecture §§11–12 | Exact qualitative distinctions and non-conflations | Exact assignments, hierarchy, participation/applicability |
| `XFR-D-025` governance | `AI + PRODUCT`, human-approved candidate-derived | Role split and required approval path | Any exact substantive content |
| Scoring Policy artifact | `Chief AI Architect + PRODUCT` | No artifact approval | Policy version/content/manifest entry |
| Architecture §37 №3 / `XFR-D-M5` | `AI + PRODUCT`, source-normative | Authority preserved only | Starting/segment weights and minimum thresholds |
| Evidence procedure | `AI + DEVELOPMENT` | Preparation responsibility without unilateral authority | Exact dataset, method, execution and sufficiency verdict |
| Hard Constraint / Eligibility | Separate Architecture and decision authority | Pre-scoring precedence and non-softening preserved | Exact lawful set, classification and runtime application |
| Runtime/implementation | Separately approved technical owners | Nothing | Schema, carrier, API, DB, events, code, rollout, monitoring |

---

## 5. Что остаётся `OPEN`

- exact assignment of any criterion, feature or fact to mandatory/desirable/negotiable/informational;
- whether, when and how each class participates in any Dimension Score, Match Score, ranking or other calculation;
- hierarchy, precedence beyond already source-normative Hard Constraint handling, applicability and tie-breaking;
- every numeric weight, ratio, sign, scale, bound, default, minimum, maximum and threshold;
- formula, normalization, numerator, denominator, active-weight treatment, missing-value arithmetic and double-counting treatment;
- global, per-dimension, per-feature, per-class, per-side, per-segment and per-intersection weighting;
- exact segment universe, intersections, membership source, protected/proxy classification and lawful-basis determination;
- Feature Fit, Evidence Confidence, overall Confidence, Risk, Qualification, Priority Score, ranking and Mutual Aggregate mappings or formulas;
- decimal/fixed/float representation, precision, rounding, equality, tolerance, serialization and replay mechanics;
- dataset, sample, split, seed, labels/adjudication, metric, target, baseline value, confidence interval, aggregation window, statistical test and result;
- actual evidence package, evaluation run, acceptance verdict, calibration or production-data applicability;
- Scoring Policy, Feature Schema, Evaluation Plan, Risk Policy, Qualification Policy or Controlled Artifact Manifest approval;
- schema/API/DB/event carrier, reason codes, runtime states, RBAC/appointments, monitoring/rollback mechanics and implementation;
- any gate transition, synthetic acceptance, production readiness, release or launch.

No value from the `0.5/0.5` neutral evaluation baseline, pilot cap `100` Campaign, Campaign → Qualified targets `40%`/`25%`, or any unrelated metric may be used as a surrogate for an `OPEN` class weight, ratio, threshold or acceptance target.

---

## 6. Rationale

Criterion-class semantics express how a requirement is treated; weights express numeric influence. Conflating them would allow a confirmed Hard Constraint to be averaged away, a desirable preference to become an automatic rejection, or an unconfirmed negotiable condition to become a fact. The approved boundary therefore preserves source semantics, separates authority and requires reproducible, non-compensating evidence before any exact content can be considered, without pre-approving that content.

---

## 7. Adversarial cases

1. **Small mandatory weight softens a confirmed Hard Constraint.** Rejected: confirmed approved Hard Constraint is handled before scoring and cannot be compensated.
2. **A `mandatory` label alone creates `INELIGIBLE`.** Rejected: class label is not an approved Hard Constraint definition or verified violation.
3. **A large desirable weight becomes automatic rejection.** Rejected: desirable semantics expressly allow compromise.
4. **Negotiable scenario is written back as agreed fact.** Rejected until explicit human confirmation under the separately governed source record.
5. **Informational is silently dropped or merged into negotiable.** Rejected: its source identity is preserved; exact applicability remains `OPEN`.
6. **Unknown class defaults to desirable, equal, average or zero.** Rejected by affected-use fail-closed handling.
7. **The same factor is silently penalized in Eligibility, class weighting, Confidence and Risk.** Rejected: layers and contributions require separate disclosure and exact double-counting treatment remains `OPEN`.
8. **Segment membership is inferred from a proxy.** Rejected: explicit lawful membership and independent `XFR-D-018`/fairness governance are required.
9. **Aggregate improvement hides adverse class/segment/intersection evidence.** Rejected by separate reporting and non-compensation.
10. **`0.5/0.5`, `100` Campaign or `40%`/`25%` is reused as a class-weight surrogate.** Rejected: unrelated baseline/cap/business metrics do not approve Scoring values.
11. **Synthetic candidate wins and is activated in production.** Rejected: synthetic evidence cannot establish production calibration/readiness.
12. **Evidence team self-approves.** Rejected: `AI + DEVELOPMENT` has no unilateral substantive or gate authority.
13. **Exact replay is treated as proof of correct semantics.** Rejected: reproducibility is distinct from correctness, fairness and calibration.
14. **A successful evaluation changes policy or a gate automatically.** Rejected: a separate versioned human approval and controlled release are mandatory.

---

## 8. Затронутые артефакты — future separate sync only

После отдельной проверки этот status overlay может быть синхронизирован только отдельным controlled change в:

- `LeaseMind_MATCHING_SCORING_POLICY_v0.1.md`;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md`.

Этот record не изменяет и не утверждает эти документы, Evaluation Plan, Feature Schema, Risk Policy, Qualification Policy, Data Contracts, manifest or implementation artifacts.

---

## 9. Change control

Любое изменение approved qualitative boundary требует нового versioned decision record и явного согласования `AI + PRODUCT` с mandatory approval `Chief AI Architect + LEGAL + DEVELOPMENT`. `AI + DEVELOPMENT` may prepare evidence/technical material but cannot approve the change unilaterally. Exact values, formulas, policies, production use, carrier/runtime and implementation require their own separately approved records and controlled artifacts.

---

## 10. Gate impact

`NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` remain `BLOCKED`.

---

## 11. Acceptance criteria

1. **Given** `MSP-13`, **when** canonical identity is checked, **then** it remains `MSP-13 → XFR-D-025`, `PRIMARY_STANDALONE`.
2. **Given** the record, **when** resolution is checked, **then** it is always `PARTIALLY_RESOLVED_BOUNDARY`, never fully resolved.
3. **Given** decision authority, **when** roles are checked, **then** governance owner is `AI + PRODUCT` candidate-derived/non-source-normative, artifact owner is `Chief AI Architect + PRODUCT`, mandatory approvers are `Chief AI Architect + LEGAL + DEVELOPMENT`, and evidence owner is `AI + DEVELOPMENT` without unilateral authority.
4. **Given** Architecture §37 question №3, **when** ownership is checked, **then** `XFR-D-M5` retains source-normative `AI + PRODUCT` authority and remains independent.
5. **Given** mandatory/desirable/negotiable/informational classes, **when** semantics are applied, **then** all four identities are preserved without invented numeric hierarchy or weighting.
6. **Given** a confirmed approved Hard Constraint violation, **when** weighting occurs, **then** it is handled before scoring and cannot be softened or compensated.
7. **Given** only a `mandatory` label, **when** eligibility is evaluated, **then** no Hard Constraint, `INELIGIBLE` or rejection is created without independent approval and evidence.
8. **Given** desirable or negotiable content, **when** it is evaluated, **then** desirable absence is not automatic rejection and negotiable conditions remain scenario-only until human confirmation.
9. **Given** missing/unknown/stale/conflicting/unauthorized class or evidence, **when** affected use is attempted, **then** it fails closed without zero/default/negative/rejection or invented runtime state.
10. **Given** a segment-specific candidate, **when** membership/applicability is checked, **then** it is not inferred or proxy-imputed and independent `XFR-D-018` and fairness governance remain mandatory.
11. **Given** an evidence package, **when** sufficiency is reviewed, **then** frozen version/hash, component-atomic allocation, baseline-first, tuning/final isolation, preregistration, compatible comparison, separate reporting, uncertainty and non-compensation are required but do not themselves approve exact content.
12. **Given** an exact replay result, **when** semantic or production claims are made, **then** replay alone proves neither correctness, fairness, calibration nor readiness.
13. **Given** synthetic-only evidence, **when** production applicability is assessed, **then** no production weighting, calibration, readiness or launch claim is created.
14. **Given** every exact assignment, participation rule, weight, ratio, formula, normalization, denominator, double-counting, segment, precision, dataset, metric, target, statistic, policy, carrier, runtime and implementation item, **when** this record is applied, **then** each remains `OPEN`.
15. **Given** an evaluation result, **when** policy/model/runtime/manifest/release/gate status is checked, **then** no automatic change occurs.
16. **Given** the governed artifacts and gates, **when** this record is applied, **then** no Proposal, policy, dataset, evidence verdict, production-data use, runtime or implementation is approved and all three gates remain `BLOCKED`.

---

## 12. Итог

`XFR-D-025` утверждает только qualitative criterion-class weighting governance and evidence-prerequisite boundary. Он сохраняет точные source semantics mandatory/desirable/negotiable/informational, отделяет их от Hard Constraint, Feature Weight, evidence, Confidence, Risk and Qualification, запрещает compensation/default inference/automatic action и требует frozen non-compensating evidence discipline. Любые exact assignments, participation rules, numeric weights, formulas, normalization, datasets, metrics, statistics, policies, production use, runtime and implementation остаются `OPEN`; `XFR-D-M5` и все sibling decisions сохраняют самостоятельность; все три governance gates остаются `BLOCKED`.
