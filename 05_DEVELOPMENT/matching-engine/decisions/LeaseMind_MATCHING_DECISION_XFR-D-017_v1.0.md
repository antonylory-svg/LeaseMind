# LeaseMind Matching Decision Record — XFR-D-017

**Decision ID:** `XFR-D-017`

**Название:** Mutual Aggregate qualitative governance and evidence-prerequisite boundary

**Версия:** 1.0

**Дата решения:** 2026-09-06

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED QUALITATIVE GOVERNANCE AND EVIDENCE-PREREQUISITE BOUNDARY — HARMONIC VS GEOMETRIC SELECTION AND ALL EXACT DATA, METRIC, STATISTICAL, RUNTIME, PRODUCTION AND IMPLEMENTATION CONTENTS REMAIN OPEN`

**Decision authority:** human project-governance confirmation on 2026-09-06

**Repository baseline:** `e03ad6e58d158b0bada5836d7e982eec2cb01167`

**Canonical identity:** `MSP-01 → XFR-D-017`, `PRIMARY_STANDALONE` — «Mutual Aggregate function».

**Scope:** qualitative governance, anti-masking semantics and evidence prerequisites for a future choice of Mutual Aggregate. This record does not select harmonic or geometric mean, declare the current pair permanently exhaustive for every future policy version, approve an exact formula representation or edge-case rule, set a weight, scale, threshold, metric, numerator, denominator, statistical method/value, dataset, evaluation result, Scoring Policy version, production applicability, runtime/API/DB/schema/event carrier, monitoring/rollback mechanism or implementation.

**Substantive governance owner:** `AI + PRODUCT` — the source-owned decision owner for Architecture §37 question №2.

**Scoring Policy artifact owner:** `Chief AI Architect + PRODUCT` — the source-owned artifact owner in Architecture §52. Artifact ownership does not replace the substantive decision owner or permit unilateral approval.

**Mandatory approvers:** `Chief AI Architect + LEGAL + DEVELOPMENT`.

**Evidence/technical-procedure owner:** `AI + DEVELOPMENT`; this role prepares candidate evidence and technical procedure, but has no unilateral authority to select a function or approve semantics, values, policy, evidence sufficiency, production use, release, runtime or implementation.

**Depends on and preserves:** `XFR-D-018`, `XFR-D-021`, `XFR-D-022`, `XFR-D-023`, `XFR-D-024 v1.1`, `XFR-D-026`, `XFR-D-027`, `XFR-D-057`–`XFR-D-071`, the Scoring Policy, Evaluation Plan, Feature Schema, Risk Policy and Qualification Policy retain their independent scope, status and authority. None is absorbed, reopened, superseded or approved by this record.

---

## 1. Вопрос

Какая qualitative governance, anti-masking и evidence-prerequisite boundary должна быть выполнена до возможного будущего выбора harmonic или geometric Mutual Aggregate, пока Architecture §37 вопрос №2 остаётся `OPEN`?

## 2. Source/status discipline

1. Inventory canonical crosswalk фиксирует `MSP-01 → XFR-D-017`, `PRIMARY_STANDALONE`, «Mutual Aggregate function». Inventory индексирует вопрос; он не создаёт substantive approval.
2. Architecture §15.5 задаёт source-normative структуру `Reciprocal Fit = Mutual Aggregate(Tenant Fit, Owner Fit)` и qualitative invariant: Mutual Aggregate должен штрафовать одностороннее совпадение; высокий Tenant Fit не может скрыть критически низкий Owner Fit и наоборот.
3. Та же Architecture §15.5 называет harmonic и geometric возможными функциями и требует зафиксировать конкретную функцию в versioned Scoring Policy после pilot-data evaluation. Architecture §37 question №2 сохраняет сам выбор `OPEN`, назначает owner `AI + PRODUCT` и называет его implementation/Launch blocker.
4. Architecture §52 отдельно назначает `Chief AI Architect + PRODUCT` owner'ом controlled artifact `MATCHING_SCORING_POLICY`. Decision owner и artifact owner не сливаются.
5. Scoring Policy §5 является `Proposal for cross-functional review — does not authorize implementation`. Его harmonic recommendation имеет статус только `DECISION_CANDIDATE_FOR_REVIEW`; harmonic и geometric симметрично остаются невыбранными candidates. Иллюстративные вычисления §5.1 не являются pilot evidence, calibration или approval.
6. Evaluation Plan §6.3 не определяет и не калибрует reciprocal formula: evaluation object допускается только после соответствующего Scoring Policy approval. §9 устанавливает tuning/final separation и no-automatic-action boundary, но не выбирает функцию.
7. Architecture §30.3 требует frozen sample, label-quality check, offline evaluation, proxy/discrimination and calibration review, Chief AI Architect review, PRODUCT/LEGAL agreement, controlled release, monitoring and rollback; automatic production retraining and automatic global-weight changes запрещены. Этот process не является self-approval.
8. Architecture §§33 и 49 требуют auditability, version/hash binding and deterministic replay. Reproducibility не доказывает semantic correctness, evidence sufficiency или production readiness.
9. `XFR-D-026` запрещает считать synthetic-only evidence production calibration/readiness для Mutual Aggregate. `XFR-D-027` назначает operational/evidence owner, но не substantive approver. `XFR-D-023` задаёт prospective version/change boundary, но не выбирает функцию.
10. Proposal, candidate, formula illustration, crosswalk/index entry, owner assignment, evidence package, technical feasibility, commit, merge, CI result or deployment не равны function, policy, production, release or gate approval.

## 3. Решение

### 3.1. Decision-specific authority split

1. Substantive governance owner этого decision — `AI + PRODUCT`, напрямую сохраняя Architecture §37 question №2.
2. Scoring Policy artifact owner остаётся `Chief AI Architect + PRODUCT` по Architecture §52. Artifact owner не заменяет substantive owner и не получает unilateral approval.
3. Mandatory approvers — `Chief AI Architect + LEGAL + DEVELOPMENT`.
4. Evidence/technical-procedure owner — `AI + DEVELOPMENT`, без unilateral semantic, function-selection, value, policy, evidence-sufficiency, production, release or implementation authority.
5. Любое future approval одной функции требует участия полного набора `AI + PRODUCT + Chief AI Architect + LEGAL + DEVELOPMENT` на одной explicitly identified candidate Scoring Policy version/hash и её immutable evidence package.
6. Ни один owner, approver, reviewer или evidence-preparation role не может единолично выбрать функцию, утвердить policy, объявить evidence достаточным или активировать runtime behavior.

### 3.2. Preserved source structure and anti-masking invariant

1. `Reciprocal Fit = Mutual Aggregate(Tenant Fit, Owner Fit)` сохраняется как source-normative структура.
2. Tenant Fit и Owner Fit остаются двумя отдельными, attributable inputs. Один input не может быть выведен из другого, заменён им, silently dropped или превращён в default numeric value.
3. Mutual Aggregate обязан штрафовать одностороннее совпадение: очень высокий Tenant Fit не может скрыть критически низкий Owner Fit, и наоборот.
4. Этот invariant не задаёт numeric definition слова «критически», порог, tolerance, functional form, zero/near-zero rule, missing-input behavior, precision or rounding.
5. Deal Feasibility, Match Score, Confidence Score, Risk Score, Qualification, Priority Score, ranking/diversification and Safe Presentation остаются distinct layers. Mutual Aggregate не создаёт их значения, authority or approval.
6. Hard Constraints and Eligibility retain precedence. Высокий Reciprocal Fit или иной aggregate не восстанавливает candidate, исключённый independently applicable Hard Constraint.

### 3.3. Candidate-set and selection discipline

1. Harmonic и geometric сохраняются как две source-named candidates для текущего вопроса Architecture §37 №2; ни одна не выбрана, не отклонена окончательно и не получает default/fallback status.
2. Scoring Policy §5 harmonic recommendation остаётся только `DECISION_CANDIDATE_FOR_REVIEW`. Математическое свойство, implementation convenience or lower replay complexity не являются approval.
3. Этот record не утверждает, что две named candidates являются permanently exhaustive для любой будущей policy version. Добавление, удаление или изменение candidate требует отдельного source/governance change, version/hash and review; hidden third candidate or library default недопустимы.
4. Equal-weight baseline, arithmetic mean, library default, previous version, implementation availability, fastest runtime or technically reproducible output не становятся Mutual Aggregate candidate or winner без отдельного governed decision.
5. Pilot cap `100 Campaign` and Campaign→Qualified `40%/25%` are not function-selection metrics, thresholds or surrogate evidence.

### 3.4. Minimum evidence categories before any future function approval

Ни одна candidate function не может считаться approved без immutable, versioned evidence package, включающего как минимум следующие categories:

1. exact identified candidate Scoring Policy version/hash and candidate formula/configuration representation, presented for review without approval by this record;
2. exact eligible evaluation object, input provenance and label eligibility/adjudication evidence under applicable `XFR-D-057`/`XFR-D-058` boundaries;
3. grouping/entity isolation and correction-history evidence under applicable `XFR-D-059`/`XFR-D-060` boundaries;
4. relevant false-exclusion/false-eligibility metric families and counter-evidence without cross-family substitution under applicable `XFR-D-061`/`XFR-D-063` boundaries;
5. frozen dataset allocation, split, manifest, seed and lineage evidence under `XFR-D-062`, with strict tuning-versus-untouched-final isolation;
6. same-population, same-input, same-policy and same-lineage compatible comparison of the governed candidates; incompatible runs receive no delta, winner, pass or equivalence claim;
7. proposed metrics, numerator/denominator/counting unit, aggregation, uncertainty and exact statistical procedure under `XFR-D-063`/`XFR-D-070`, without approving them here;
8. complete separate reporting of favorable, adverse, null, incompatible, unevaluable and insufficient results, including applicable segments/intersections, without aggregate compensation;
9. applicable segment coverage, protected/proxy and fairness evidence under `XFR-D-064`/`XFR-D-068`, without converting diagnostics into legal or production verdicts;
10. applicable drift and post-freeze correction evidence/limitations under `XFR-D-065`/`XFR-D-071`;
11. deterministic replay evidence bound to exact inputs, code/tool/configuration and policy versions/hashes, while precision/rounding/serialization contents remain separately `OPEN`;
12. explicit synthetic-only versus production-data applicability statement under `XFR-D-026`; synthetic-only evidence cannot establish production calibration or readiness;
13. explicit limitations, unresolved dependencies and non-authorization statement;
14. documented verification and approval by the full decision-owner/approver set on the same immutable candidate and evidence package.

These are categories only. This record approves no exact formula, edge behavior, metric, statistic, dataset, sample, test, result, winner, schema or carrier. Missing or unresolved applicable category blocks function approval fail closed.

### 3.5. Non-compensation and complete reporting

1. Strong aggregate/business performance cannot compensate or hide one-sided-fit failure, Hard Constraint/Eligibility failure, low Confidence, elevated/unknown Risk, failed/unknown Qualification, insufficient segment/intersection evidence, fairness/proxy concern, leakage, replay mismatch or missing evidence.
2. One favorable metric family cannot replace an adverse, null, incompatible, unevaluable or insufficient result in another family.
3. Aggregate, majority-segment or selected favorable results cannot suppress adverse/insufficient results for an applicable segment or intersection.
4. Absence of detected difference does not prove equivalence, no harm, fairness, calibration, production suitability or readiness.
5. This boundary introduces no numeric tolerance, legal fairness doctrine, statistical test or remediation rule.

### 3.6. Fail-closed handling is affected-approval only

Missing, unknown, stale, conflicting, incompatible, leakage-contaminated, improperly corrected, incomplete, unauthorized or non-reproducible candidate/evidence/binding:

1. does not select harmonic, geometric, a third function, previous-version behavior or a library/default fallback;
2. does not become a numeric zero, negative fit fact, pass/fail result, winner, rejection, Qualification/Risk result, route, reason or user-facing text;
3. blocks only the affected function-approval progression unless an independently applicable approved rule requires broader blocking;
4. cannot be omitted, rewritten or compensated by another metric, segment, business outcome, technical feasibility or synthetic-only result;
5. leaves exact recovery, retry, escalation, observability, error code, carrier and runtime behavior `OPEN`.

Fail closed is an approval prerequisite, not a business verdict or implementation specification.

### 3.7. No automatic action

No evaluation result, statistical signal, candidate recommendation, evidence completeness claim, deterministic replay or technical implementation may automatically:

1. select or activate a Mutual Aggregate function;
2. change a formula, weight, threshold, Feature/Scoring/Risk/Qualification policy or model;
3. change Eligibility, Hard Constraints, score, rank, Confidence, Risk, Qualification, routing, reason or presentation;
4. authorize production data, production calibration/applicability, release, deployment or a governance gate.

Every actual selection and release remains a separate human, version/hash-bound controlled-artifact decision.

### 3.8. Independent boundaries are preserved

1. `XFR-D-018` segment-override governance and `XFR-D-M5` actual starting/segment weights remain independent; no weight, threshold or segment policy is selected here.
2. `XFR-D-021` ranking/diversification and `XFR-D-024 v1.1` Priority Score remain separate downstream/internal-ordering decisions.
3. `XFR-D-022` sensitivity/calibration dataset and targets remain independently `OPEN`; this record defines categories, not their content.
4. `XFR-D-023` version/change rules, `XFR-D-026` synthetic-to-production boundary and `XFR-D-027` evidence-process roles remain unchanged and do not choose the function.
5. `XFR-D-057`–`XFR-D-065`, `XFR-D-068`, `XFR-D-070` and `XFR-D-071` retain their current resolutions and independently `OPEN` exact contents. This record consumes only applicable future outputs.
6. `XFR-D-063` metric-family governance and `XFR-D-070` statistical discipline do not select a winner or approve a policy.
7. Scoring Policy, Evaluation Plan, Feature Schema, Risk Policy, Qualification Policy and Controlled Artifact Manifest preserve their own status and authority. No Proposal, evidence package or manifest entry is approved here.

### 3.9. Partial, never fully resolved

`XFR-D-017` receives `PARTIALLY_RESOLVED_BOUNDARY`: decision-specific roles, source structure, qualitative anti-masking/input-separation/non-compensation semantics, candidate discipline, minimum evidence categories, affected-approval fail-closed handling and no-automatic-action boundary are approved.

Harmonic-versus-geometric selection and every exact formula, edge behavior, numeric, data, metric, statistical, policy, schema, carrier, runtime, production and implementation content remain `OPEN`. This record cannot be cited as complete resolution of Architecture §37 question №2.

## 4. Layer and authority table

| Layer | Preserved authority | Approved here | Remains `OPEN` |
|---|---|---|---|
| Mutual Aggregate substantive decision | `AI + PRODUCT`, Architecture §37 №2 | Qualitative governance/anti-masking/evidence boundary | Harmonic vs geometric selection and exact contents |
| Scoring Policy artifact | `Chief AI Architect + PRODUCT`, Architecture §52 | No artifact approval | Candidate policy/version/hash and approval |
| Evidence/technical procedure | `AI + DEVELOPMENT` | Preparation responsibility without unilateral authority | Exact procedure, evidence and sufficiency verdict |
| Evaluation/statistics | Applicable `XFR-D-057`–`XFR-D-071` boundaries | Dependencies preserved | Exact data, metrics, statistics, results and verdict |
| Weights/ranking/Priority Score | `XFR-D-M5`, `XFR-D-018`, `XFR-D-021`, `XFR-D-024 v1.1` | No change | All independent exact contents |
| Runtime/production | Separate controlled artifacts, approvals and gates | No authorization | API/DB/schema/events/runtime/monitoring/rollback/implementation |

## 5. Обязательные non-conflations

1. Mutual Aggregate ≠ Match Score, Qualification threshold/result, Priority Score or ranking/diversification.
2. Decision owner `AI + PRODUCT` ≠ Scoring Policy artifact owner `Chief AI Architect + PRODUCT`.
3. Evidence owner `AI + DEVELOPMENT` ≠ unilateral function or policy approver.
4. Harmonic recommendation/candidate ≠ approved, selected, pilot-calibrated or production-ready function.
5. Formula illustration or mathematical property ≠ pilot evidence or policy approval.
6. Deterministic replay ≠ semantic correctness, fairness, calibration or production readiness.
7. Evaluation/statistical result ≠ automatic winner, policy, release or gate verdict.
8. Synthetic-only evidence ≠ production calibration, applicability or readiness.
9. Campaign→Qualified `40%/25%` and pilot cap `100 Campaign` ≠ Mutual Aggregate evidence, target or threshold.
10. Missing/incompatible evidence ≠ numeric default, negative fact, rejection, route, reason or presentation.
11. Proposal, Inventory entry, manifest reference, code, merge, CI or deployment ≠ policy/function/gate approval.

## 6. Что остаётся `OPEN`

- harmonic versus geometric selection and whether this pair remains exhaustive for a future policy version;
- exact formula representation, zero/near-zero, missing-input, overflow/underflow and other edge behavior;
- scale, precision, decimal/floating representation, intermediate operations, rounding and serialization;
- every weight, threshold, tolerance, candidate search rule and selection criterion;
- metric definitions, targets, numerator/denominator/counting unit, aggregation, weighting and uncertainty;
- hypotheses, tests, estimators, intervals, significance/confidence/power/effect-size values, multiplicity, sequential/stopping and equivalence/non-inferiority rules;
- label/adjudication/grouping/correction contents, dataset size/allocation/split/seed, manifest and lineage;
- segment universe/membership/lawful basis, protected/proxy classification and legal fairness standard;
- actual run, results, report, evidence sufficiency, comparison verdict and winner;
- weights, Match Score composition, Qualification, ranking/diversification and Priority Score implications;
- production-data authority, calibration, applicability/readiness, privacy/security approval and named appointments/RBAC;
- Scoring Policy, Evaluation Plan and Controlled Artifact Manifest approval;
- API/DB/schema/event carrier, statuses/enums/error codes, retry/recovery/escalation/observability, monitoring, rollback, runtime and implementation;
- every governance-gate approval.

## 7. Adversarial cases

1. **Recommendation becomes approval.** Scoring Policy §5.2 harmonic recommendation is called approved or selected. Rejected by §2 and §3.3.
2. **Implementation convenience chooses the winner.** Avoiding `sqrt`, library availability or faster replay is treated as sufficient evidence. Rejected by §3.3–§3.4.
3. **One-sided fit is masked.** Very high Tenant Fit compensates critically low Owner Fit, or vice versa. Rejected by §3.2 and §3.5.
4. **Business KPI substitutes for evaluation.** `40%/25%`, pilot cap `100 Campaign` or overall conversion is used to choose the function. Rejected by §3.3 and §5.
5. **Synthetic-only result authorizes production.** Synthetic comparison is cited as production calibration/readiness. Rejected by §3.4 and §5.
6. **Evidence team self-approves.** `AI + DEVELOPMENT` selects the function without the full owner/approver set. Rejected by §3.1.
7. **Incomplete evidence becomes winner.** Missing segment, adverse, null, incompatible or unevaluable results are omitted. Rejected by §3.4–§3.6.
8. **Replay equals correctness.** Deterministic output is cited as proof of semantic/fairness/production suitability. Rejected by §2 and §5.
9. **Aggregate restores an ineligible candidate.** High Reciprocal Fit overrides a Hard Constraint, Risk or Qualification failure. Rejected by §3.2 and §3.5.
10. **Evaluation changes runtime automatically.** A favorable comparison modifies policy/configuration/model/routing/release. Rejected by §3.7.
11. **Hidden third/default function.** Implementation silently uses arithmetic mean, previous-version behavior or library default. Rejected by §3.3 and §3.6.
12. **Record cited as implementation authorization.** This record is used to approve policy, dataset, production data, schema, runtime or a gate. Rejected by Scope, §3.7 and §10.

## 8. Затронутые артефакты — future separate sync only

- `LeaseMind_MATCHING_SCORING_POLICY_v0.1.md` — §5, §10, §12 row №1 and readiness/acceptance summaries may later receive a historical-preserving cross-reference to this qualitative boundary while function selection and all exact contents remain `OPEN`;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — a later overlay may record `MSP-01 → XFR-D-017` status and provenance;
- Evaluation Plan and future exact Scoring/evidence artifacts — only in separately scoped, separately approved work after their own dependencies are resolved.

No sync is performed by this record. Architecture, Scoring Policy, Evaluation Plan, Inventory, Feature Schema, Risk Policy, Qualification Policy, manifests, sibling records, schema, code and runtime remain untouched.

## 9. Change control

Any change to the authority split, source structure, anti-masking/input-separation/non-compensation, candidate discipline, minimum evidence-category, affected-approval fail-closed or no-automatic-action boundaries approved here requires a new versioned `XFR-D-017` record with a `supersedes` reference to this version and agreement by the full set `AI + PRODUCT + Chief AI Architect + LEGAL + DEVELOPMENT`.

Open exact contents cannot be introduced through silent edit, policy/inventory sync, manifest entry, configuration, library default, implementation choice or post-hoc evidence interpretation.

## 10. Gate impact

`NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` remain `BLOCKED`.

This record approves no function, policy, manifest, dataset, evaluation result, production applicability, runtime, implementation, automatic rejection/routing/presentation or gate.

## 11. Acceptance criteria

1. **Given** `MSP-01`, **when** canonical identity is checked, **then** it maps to `XFR-D-017` as `PRIMARY_STANDALONE` and Inventory is not treated as approval authority.
2. **Given** this record, **when** roles are checked, **then** substantive owner is `AI + PRODUCT`, artifact owner is separately `Chief AI Architect + PRODUCT`, mandatory approvers are `Chief AI Architect + LEGAL + DEVELOPMENT`, and `AI + DEVELOPMENT` evidence ownership has no unilateral approval.
3. **Given** Tenant Fit and Owner Fit, **when** Mutual Aggregate governance is checked, **then** both remain separate inputs and one-sided fit cannot hide critically low opposing fit.
4. **Given** harmonic and geometric candidates, **when** selection status is requested, **then** neither is selected, approved, rejected finally, defaulted or production-calibrated by this record.
5. **Given** a future candidate, **when** evidence readiness is checked, **then** every applicable §3.4 category is present, immutable and bound to the same candidate version/hash; otherwise approval is blocked fail closed.
6. **Given** adverse/null/incompatible/unevaluable/insufficient evidence, **when** favorable aggregate or business evidence exists, **then** it cannot compensate or suppress that evidence.
7. **Given** synthetic-only evidence, **when** production calibration/applicability/readiness is claimed, **then** the claim is prohibited.
8. **Given** deterministic replay, **when** semantic, fairness or production correctness is claimed, **then** replay alone is insufficient.
9. **Given** an Evaluation result, **when** automatic function/policy/model/weight/threshold/routing/release/gate action is requested, **then** no action is authorized.
10. **Given** `XFR-D-018`, `XFR-D-021`–`XFR-D-024`, `XFR-D-026`, `XFR-D-027` or applicable `XFR-D-057`–`XFR-D-071`, **when** status is checked, **then** each retains its independent authority and unresolved exact contents.
11. **Given** exact formula, numeric, data, statistical, schema, runtime, production or implementation content, **when** this record is cited as approval, **then** the claim is rejected and the content remains `OPEN`.
12. **Given** a boundary change, **when** change control is checked, **then** a new versioned `XFR-D-017` with `supersedes` and agreement by `AI + PRODUCT + Chief AI Architect + LEGAL + DEVELOPMENT` is required.
13. **Given** policy/manifest/gate status, **when** this record is applied, **then** no artifact or gate is approved and all three gates remain `BLOCKED`.

## 12. Итог

`XFR-D-017 MUTUAL AGGREGATE QUALITATIVE GOVERNANCE, ANTI-MASKING AND EVIDENCE-PREREQUISITE BOUNDARY APPROVED — FUNCTION SELECTION AND ALL EXACT FORMULA, DATA, METRIC, STATISTICAL, POLICY, RUNTIME, PRODUCTION AND IMPLEMENTATION CONTENTS REMAIN OPEN`
