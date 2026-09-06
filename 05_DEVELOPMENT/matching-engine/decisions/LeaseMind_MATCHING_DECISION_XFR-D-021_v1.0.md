# LeaseMind Matching Decision Record — XFR-D-021

**Decision ID:** `XFR-D-021`

**Название:** Ranking/diversification policy governance and qualitative safeguard boundary

**Версия:** 1.0

**Дата решения:** 2026-09-06

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED GOVERNANCE AND QUALITATIVE SAFEGUARD BOUNDARY — EXACT RANKING/DIVERSIFICATION ALGORITHM, METRICS, TARGETS, EVIDENCE, PRODUCTION AND IMPLEMENTATION REMAIN OPEN`

**Decision authority:** explicit human project-governance confirmation in the 2026-09-06 working session

**Repository baseline:** `1ced1ed72e8b705c07a0b7b17c5c11a5e6060041`

**Canonical identity:** `MSP-08 → XFR-D-021`, `PRIMARY_STANDALONE`.

**Scope:** governance ownership, source-preserving ranking/diversification safeguards, evidence prerequisites and non-authorization boundary for a future separately approved ranking/diversification policy only. This record does not select an algorithm, ordering, tie-break, candidate-set rule, `K`, metric, formula, weight, threshold, diversity definition, target, statistical procedure/value, segment, dataset, evaluation run, result, verdict, production applicability, runtime/API/DB/schema/event carrier or implementation.

**Governance owner (для будущей ranking/diversification policy):** `Chief AI Architect + PRODUCT`.

**Mandatory approvers:** `LEGAL + DEVELOPMENT`.

**Consulted domain function:** `AI`.

**Evidence/technical-procedure owner:** `AI + DEVELOPMENT`, без unilateral semantic, policy, value, production, release or implementation authority.

**Depends on:** `XFR-D-024 v1.0` (optional Priority Score governance-owner-only boundary), `XFR-D-063 v1.0` (numeric metric-target governance/evidence boundary), `XFR-D-018 v1.0` (Scoring segment-override governance/evidence boundary), `XFR-D-042 v1.0` (Qualification segment-policy boundary), `XFR-D-068 v1.0` (fairness diagnostic/legal-standard boundary) и `XFR-D-070 v1.0` (threshold-search statistical-comparison boundary) remain independently applicable and are not absorbed, reopened or completed here. Applicable `XFR-D-023`, `XFR-D-026`, `XFR-D-027`, `XFR-D-057`–`XFR-D-071` safeguards also retain their exact current status and `OPEN` contents.

---

## 1. Вопрос

Кто владеет будущей ranking/diversification policy и какие qualitative safeguards/evidence prerequisites обязательны до её отдельного approval, если Architecture §24 задаёт факторы и ограничения ranking, но не задаёт exact algorithm, ordering, tie-break, candidate-set rule, metric или value?

## 2. Source/status discipline

Architecture §24 нормативно перечисляет отдельные ranking inputs/considerations: Match Score, Confidence Score, Risk Score, Qualification status, freshness, readiness к следующей проверке, число и значение negotiation gaps, отсутствие duplicates и diversity гипотез по object/commercial parameters. Она также нормативно требует Hard Constraint precedence, запрещает превращать высокий Match Score с низкой Confidence в первый Qualified option без проверки и скрывать высокий Risk внутри итогового процента, допускает diversification только среди вариантов, прошедших minimum quality, отделяет internal ranking от user catalog/disclosure, сохраняет one-at-a-time disclosure и запрещает rank менять payer, legal status или disclosure right.

Architecture §30.3 требует frozen sample, label-quality check, offline evaluation, discrimination/proxy review, calibration check, Chief AI Architect review, согласование затронутых PRODUCT/LEGAL rules, controlled release, monitoring и rollback; automatic productive retraining, Hard Constraint changes и global-weight changes запрещены. Architecture §34.2 требует baseline-first для ranking/diversification metrics и не разрешает arbitrary exact targets до labeled test sample. Architecture §49 требует version/hash-bound deterministic replay, включая identical component scores, ranking, reasons и final package hash; external probabilistic component остаётся advisory до human-confirmed deterministic rule. Architecture §52 требует versioned, hashed, approved controlled artifacts and fail-closed gates.

`LeaseMind_MATCHING_SCORING_POLICY_v0.1.md` §12 row №8 (`MSP-08`) является Proposal/candidate: «Ranking/diversification exact algorithm и diversity metric». Inventory только индексирует `MSP-08 → XFR-D-021`, `PRIMARY_STANDALONE`; он не является policy authority. Sibling records используются только как independently applicable boundaries, не как источник конкретного algorithm или value.

Этот record разрешает только явно human-approved governance/evidence/safeguard boundary. Architecture/Proposal/Inventory сами по себе не назначают этот exact governance owner и не утверждают content.

## 3. Решение

### 3.1. Decision-specific authority split

1. Governance owner будущей ranking/diversification policy — `Chief AI Architect + PRODUCT`.
2. Mandatory approvers — `LEGAL + DEVELOPMENT`.
3. `AI` — consulted domain function.
4. Evidence/technical-procedure owner — `AI + DEVELOPMENT`; он готовит/проверяет evidence и reproducibility, но не получает unilateral semantic, policy, value, production, release or implementation authority.
5. Любое future approval требует agreement `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT` на одной explicitly identified candidate policy/version/hash и её immutable evidence package; `AI` остаётся consulted и участвует через evidence/technical role.
6. Governance owner, approver, consulted function, evidence owner и runtime writer не conflated. Ни один role не может единолично выбрать algorithm/value, утвердить Scoring Policy, разрешить production or implementation или снять gate.

### 3.2. Separate source inputs remain separate

Future ranking/diversification policy обязана сохранять как separate, independently attributable inputs/considerations:

1. Match Score;
2. Confidence Score;
3. Risk Score;
4. Qualification status;
5. freshness;
6. readiness к следующей проверке;
7. number and value of negotiation gaps;
8. deduplication/absence-of-duplicates state;
9. diversity objective/attributes.

Этот перечень сохраняет Architecture §24 semantics, но не утверждает field names, schema, availability, ordering, formula, sign, weight, normalization, aggregation, dominance, tie-break or candidate-set rule. Ни один input не может быть silently derived from, collapsed into, rewritten by or substituted for another.

### 3.3. Non-negotiable Architecture safeguards

Любая future candidate policy обязана доказуемо сохранять:

1. Hard Constraint precedence над rank; ranking не возвращает в candidate set вариант, который отдельно applicable Hard Constraint исключил;
2. высокий Match Score при low Confidence не становится первым Qualified option без отдельно required verification;
3. высокий Risk не скрывается внутри aggregate percentage, Priority Score, rank or diversification result;
4. diversification применяется только среди candidates, прошедших separately approved minimum-quality rule; этот record не определяет это rule или threshold;
5. internal ranking нескольких hypotheses не создаёт user catalog, disclosure authorization или право раскрыть более одного варианта одновременно;
6. one-at-a-time disclosure сохраняется;
7. rank/diversification не меняет payer, legal status, Qualification authority, disclosure right, Reveal decision or source-owned fact;
8. scoring/ranking quality не компенсирует Hard Constraint, insufficient Confidence, Risk, Qualification, freshness, readiness, negotiation-gap, deduplication, fairness or independently required evidence failure.

Эти safeguards не создают new route, reason code, negative fact, rejection, display text or runtime behavior. Exact precedence/cascade beyond the literal source boundary remains `OPEN`.

### 3.4. Version/hash-bound reproducibility and evidence prerequisites

Ни одна future ranking/diversification policy не может считаться approved без immutable, versioned evidence package, включающего как минимум:

1. exact candidate policy/version/hash and compatible affected input/policy/model versions/hashes;
2. frozen dataset/allocation/manifest/lineage and eligible label/adjudication/grouping/correction-history evidence under applicable `XFR-D-057`–`XFR-D-062` boundaries;
3. pre-registered candidate, hypotheses, metrics and comparison procedure under applicable `XFR-D-063`/`XFR-D-070` boundaries;
4. strict tuning-versus-untouched-final isolation; final evidence is not reused to select, rewrite or rescue the candidate it evaluates;
5. comparison only between semantically/data/version compatible candidates, or explicit `INCOMPATIBLE`/unevaluable reporting without winner inference;
6. complete reporting of positive, adverse, null, incompatible, unevaluable and insufficient results without selective omission;
7. separate results for applicable ranking/retrieval, Confidence, Risk, Qualification, segment/fairness, false-exclusion, deduplication and diversification concerns without cross-family compensation;
8. deterministic replay evidence bound to exact inputs/versions/hashes, with identical component scores, ranking, reasons and final package hash where Architecture §49 requires exact replay;
9. applicable segment-coverage/fairness/proxy/legal review under `XFR-D-064`/`XFR-D-068`, without inferring segment membership or inventing unapproved standards;
10. explicit synthetic-only versus production-data applicability statement; synthetic-only evidence creates no production applicability, calibration or readiness claim;
11. documented DEVELOPMENT reproducibility/control verification and full owner/approver review.

These are evidence categories only. This record approves no exact dataset, allocation, sample, split, metric, formula, target, test, statistic, tolerance, result, verdict, carrier or procedure implementation. Missing, stale, conflicting, incomplete, incompatible, non-reproducible or unauthorized required evidence blocks affected approval fail closed.

### 3.5. Determinism and fail-closed handling

1. Approved policy/version/hash and compatible input/policy/model versions/hashes are prerequisites to an authoritative ranking.
2. Deterministic replay mismatch is not accepted, averaged, normalized or hidden; Architecture §49 severity-1/blocking boundary remains applicable.
3. Missing/unknown/stale/conflicting/incompatible policy, input, evidence or applicability state does not become default score/rank, inferred eligibility, benign/safe state, negative fact, rejection, Qualification/Risk result, route, primary reason or display text.
4. No guessed algorithm, ordering, tie-break, candidate-set membership, metric, weight, threshold, diversity definition or fallback is permitted.
5. The affected ranking/diversification use remains blocked unless a separately approved compatible fallback/policy applies; unrelated processing is not blocked unless an independently applicable approved rule requires it.
6. Exact error/status codes, retry/recovery/escalation, observability, fallback, carrier and cascade mechanics remain `OPEN`.

Fail closed is a prerequisite boundary, not a business verdict, policy approval or implementation specification.

### 3.6. No automatic action

No metric, evidence result, statistical signal, fairness diagnostic, segment result, candidate configuration, replay result or approval prerequisite may automatically:

1. choose/change algorithm, order, tie-break, candidate set, `K`, metric, formula, weight, threshold, diversity definition, target, model or policy version;
2. change Hard Constraints, Eligibility, Qualification, Risk, routing, rejection, primary reason, payer/legal state or disclosure authorization;
3. activate/deactivate an override, retrain/release a model, deploy runtime behavior, authorize production data/use or modify a manifest;
4. create Safe Presentation wording/output or pass any governance gate.

Every actual policy/value/model/release/runtime decision remains separately governed, version/hash-bound and subject to its own authority and controlled release path.

### 3.7. Independent boundaries are preserved

1. `XFR-D-024` resolves only owner of a future optional Priority Score policy. Priority Score formula, weights, activation and content remain `OPEN`; Priority Score is not synonymous with ranking/diversification and does not supply `XFR-D-021` content.
2. `XFR-D-063` retains governance owner `Chief AI Architect + AI`, mandatory approvers `PRODUCT + LEGAL + DEVELOPMENT` and `AI + DEVELOPMENT` evidence role for its narrow numeric target bundle. `XFR-D-021` policy governance owner `Chief AI Architect + PRODUCT` does not replace that distinct numeric-target authority.
3. `XFR-D-018` remains the independent Scoring segment-override boundary; no ranking or diversification result activates a segment-specific override or infers membership.
4. `XFR-D-042` remains the independent Qualification segment-policy boundary; rank does not set Qualification result, membership or threshold.
5. `XFR-D-068` remains the independent fairness diagnostic/legal-standard boundary; ranking evidence is not a legal fairness, non-discrimination or lawful-basis verdict.
6. `XFR-D-070` remains the independent statistical-comparison boundary; a statistical result is not a winner, policy, release, production or gate verdict.
7. Applicable `XFR-D-023` version/change, `XFR-D-026` synthetic-production, `XFR-D-027` evidence-procedure, and `XFR-D-057`–`XFR-D-071` evaluation boundaries retain their exact current status and independently `OPEN` contents.
8. Scoring Policy, Evaluation Plan, Feature Schema, Risk Policy, Qualification Policy, Safe Presentation Policy and Controlled Artifact Manifest preserve their own status/authority. No Proposal, dataset, run, production use, artifact or manifest entry is approved here.

### 3.8. Partial, never fully resolved

`XFR-D-021` receives `PARTIALLY_RESOLVED_BOUNDARY`: the role split, separate-input preservation, Architecture safeguards, version/hash-bound reproducibility, frozen-evidence/tuning-final/compatible-comparison/full-reporting discipline, non-compensation, fail-closed and no-automatic-action qualitative boundaries are approved.

All exact algorithmic, numeric, metric, statistical, segment, data, result, policy, production, schema, carrier, runtime and implementation contents remain `OPEN`. This record cannot be cited as approval of ranking/diversification content, Scoring Policy or any gate.

## 4. Layer and authority table

| Layer | Preserved authority | Approved here | Remains `OPEN` |
|---|---|---|---|
| Ranking/diversification policy governance | `Chief AI Architect + PRODUCT`; approvers `LEGAL + DEVELOPMENT`; `AI` consulted | Roles and qualitative safeguards only | Actual candidate policy/content/approval |
| Evidence/technical procedure | `AI + DEVELOPMENT` | Preparation/reproducibility responsibility without unilateral authority | Exact procedure, dataset, execution and sufficiency verdict |
| Numeric metric targets | `XFR-D-063`: `Chief AI Architect + AI`; approvers `PRODUCT + LEGAL + DEVELOPMENT` | No target or target-owner change | Values, `K`, definitions, denominators, statistics and evidence |
| Priority Score | `XFR-D-024` | No change; remains optional | Formula, weights, activation, ranking use and runtime representation |
| Segment/fairness/statistics | `XFR-D-018`/`042`/`068`/`070` and applicable siblings | Preserved, not absorbed | Independently open contents |
| Runtime/production | Separate controlled artifacts, approvals and gates | No authorization | API/DB/schema/events/carrier/monitoring/rollback/implementation |

## 5. Обязательные non-conflations

1. Ranking/diversification policy governance ≠ numeric metric-target governance.
2. `XFR-D-021` ≠ `XFR-D-024` Priority Score policy.
3. Input presence in Architecture §24 ≠ approved formula, order, weight, dominance or runtime field.
4. Diversification objective/result ≠ minimum-quality eligibility, Qualification, fairness or disclosure authorization.
5. Internal rank ≠ user catalog, Safe Presentation, Reveal or one-at-a-time disclosure decision.
6. Metric/evaluation success ≠ algorithm/policy/value/model/release/production/gate approval.
7. Deterministic replay/compatibility ≠ semantic applicability, policy approval or production readiness.
8. Fairness diagnostic ≠ legal verdict; segment coverage ≠ segment-policy membership.
9. Evidence owner ≠ governance owner or unilateral approver.
10. Missing/unknown/incompatible state ≠ negative fact, default candidate/rank, rejection, route, reason or display text.
11. Proposal, Inventory index, candidate, evidence package, code, merge, manifest reference or deployment ≠ policy approval.

## 6. Что остаётся `OPEN`

- exact algorithm, ordering, precedence beyond source-normative safeguards, tie-breaks and candidate-set construction/filtering;
- exact `K`, ranking/retrieval/diversification metric definitions, relevance/label contract, numerator/denominator/counting unit, aggregation, tie/empty-result treatment;
- every formula, weight, threshold, minimum-quality rule/value, distance/similarity/diversity definition, target and tolerance;
- Priority Score formula/weights/activation and its relationship to ranking (`XFR-D-024`);
- exact segment universe/intersections/membership/lawful basis and segment-specific applicability (`XFR-D-018`/`XFR-D-042`);
- exact fairness doctrine/classification/comparator/metric/threshold/statistics and legal verdict (`XFR-D-068`);
- exact hypothesis/test/estimator/model/significance/confidence/power/effect-size/precision/multiplicity/sequential/stopping contents (`XFR-D-070`);
- all numeric metric targets and `K`, calibration/diversification methods, uncertainty and target evidence (`XFR-D-063`);
- dataset size/allocation/splits/seed, labels/adjudication/grouping/corrections, manifest/lineage, tuning/final evidence, actual run/results/report/verdict;
- production-data authority, lawful basis, privacy/security approvals, production calibration/applicability/readiness and named appointments/RBAC;
- Scoring/Evaluation/Feature/Risk/Qualification/Safe Presentation Policy and Controlled Artifact Manifest approvals;
- API/DB/schema/events/carrier, statuses/enums/error codes, retry/recovery/escalation/observability, fallback, runtime, monitoring, rollback and implementation;
- every governance-gate approval.

## 7. Adversarial cases

1. **Priority Score owner is treated as approval of a ranking algorithm.** Invalid: `XFR-D-024` resolves owner only; `XFR-D-021` approves no content.
2. **Numeric target owner is replaced by ranking policy owner.** Invalid: `XFR-D-063` retains `Chief AI Architect + AI`; scopes and approval sets remain distinct.
3. **High Match Score masks low Confidence or high Risk.** Forbidden by Architecture §24; no aggregation, ranking or diversification result waives verification or hides Risk.
4. **Diversification is applied before minimum quality.** Forbidden; applicability requires a separately approved minimum-quality rule that this record does not define.
5. **Ranking output is presented as a user catalog or multiple options are disclosed.** Forbidden; internal ranking creates no disclosure right and one-at-a-time disclosure remains unchanged.
6. **Ranking changes payer, legal status, Qualification or Reveal authority.** Forbidden; rank has no such authority.
7. **Final evidence is used to tune and then validate the same candidate.** Ineligible; tuning/final isolation requires a new versioned cycle.
8. **Good aggregate metric compensates a failed Confidence/Risk/fairness/false-exclusion/segment result.** Forbidden by family separation and non-compensation.
9. **Incompatible candidates are compared and a winner is inferred.** Forbidden; incompatibility must be reported without winner/policy inference.
10. **Synthetic-only success is described as production readiness.** Forbidden; no production applicability or gate claim follows.
11. **Missing policy/hash/input becomes a default rank or rejection.** Forbidden; affected use fails closed without guessed business outcome.
12. **A successful evaluation automatically changes runtime/model/policy.** Forbidden; separate version/hash-bound approval and controlled release remain required.

## 8. Затронутые артефакты — future separate sync only

- `LeaseMind_MATCHING_SCORING_POLICY_v0.1.md` — §12 row №8 and directly related governance/readiness/acceptance wording may be synchronized in a separately authorized pass;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — `MSP-08 → XFR-D-021` status overlay/provenance may be synchronized in a separately authorized pass;
- any Evaluation Plan, policy, manifest, runtime or implementation artifact — separate scope and approval required.

No Policy, Inventory, Architecture, manifest, index, sibling record, runtime or implementation edit is authorized or performed by this record-creation pass.

## 9. Change control

Any change to the approved governance owner, mandatory approvers, consulted/evidence roles, input-separation safeguards, Architecture constraints, reproducibility/evidence discipline, non-compensation, fail-closed or no-automatic-action boundary requires a new versioned `XFR-D-021` decision record with an explicit `supersedes` reference and agreement of `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`; `AI` remains consulted and participates in the evidence/technical-procedure role.

Exact future algorithm/value/evidence/policy/production/runtime approvals require their separately governed records and cannot be added through silent edit of this record.

## 10. Gate impact

`NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` remain `BLOCKED`.

## 11. Acceptance criteria

1. **Given** this record, **when** governance roles are checked, **then** owner is `Chief AI Architect + PRODUCT`, mandatory approvers are `LEGAL + DEVELOPMENT`, `AI` is consulted, and `AI + DEVELOPMENT` evidence/technical ownership creates no unilateral authority.
2. **Given** the Architecture §24 inputs, **when** a candidate policy is proposed, **then** Match/Confidence/Risk/Qualification/freshness/readiness/negotiation-gap/deduplication/diversity concerns remain separately attributable and no formula/order/weight is inferred.
3. **Given** Hard Constraint failure, low Confidence, high Risk or failure of a separately approved minimum-quality condition, **when** ranking/diversification is evaluated, **then** rank/diversity cannot override, hide or compensate the condition.
4. **Given** an internal ranked list, **when** user presentation/disclosure is considered, **then** no catalog/disclosure authority is created, one-at-a-time disclosure remains intact, and payer/legal/disclosure rights are unchanged.
5. **Given** a future candidate, **when** evidence is reviewed, **then** candidate and dependencies are version/hash-bound, evidence is frozen, tuning/final are isolated, only compatible comparisons are used, and all positive/adverse/null/incompatible/unevaluable/insufficient results are reported without compensation.
6. **Given** exact replay is required, **when** identical inputs/versions are replayed, **then** component scores, ranking, reasons and final package hash must match; mismatch remains blocking under Architecture §49.
7. **Given** `XFR-D-063`, **when** numeric targets are governed, **then** its owner remains `Chief AI Architect + AI` with approvers `PRODUCT + LEGAL + DEVELOPMENT`; `XFR-D-021` does not replace it.
8. **Given** `XFR-D-024`, `XFR-D-018`, `XFR-D-042`, `XFR-D-068` or `XFR-D-070`, **when** this record is applied, **then** each retains its independent scope/status/open contents and supplies no inferred ranking content.
9. **Given** an algorithm, order, tie-break, candidate set, `K`, metric, formula, weight, threshold, diversity definition, target, statistic, segment, dataset, run, result, verdict or production/runtime detail, **when** approval is requested, **then** it remains `OPEN` and absent from this record.
10. **Given** evidence or evaluation success, **when** model/policy/routing/release/runtime/gate state is checked, **then** no automatic change occurs and all three gates remain `BLOCKED`.
11. **Given** missing/stale/conflicting/incompatible state, **when** affected ranking is attempted, **then** affected use fails closed without guessed rank, negative fact, rejection, route, reason or display text and without automatically blocking unrelated processing.

## 12. Итог

`XFR-D-021 PARTIALLY_RESOLVED_BOUNDARY APPROVED — GOVERNANCE, SOURCE SAFEGUARDS AND EVIDENCE DISCIPLINE ONLY; EXACT ALGORITHM, METRICS, TARGETS, DATA, PRODUCTION, RUNTIME AND IMPLEMENTATION REMAIN OPEN`
