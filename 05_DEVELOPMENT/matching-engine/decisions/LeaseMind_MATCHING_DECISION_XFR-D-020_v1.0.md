# LeaseMind Matching Decision Record — XFR-D-020

**Decision ID:** `XFR-D-020`

**Название:** Scoring numeric representation and deterministic-replay governance/evidence boundary

**Версия:** 1.0

**Дата решения:** 2026-09-06

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED QUALITATIVE GOVERNANCE AND EVIDENCE-PREREQUISITE BOUNDARY — EXACT DECIMAL/FLOAT REPRESENTATION, PRECISION, ROUNDING, CANONICAL SERIALIZATION, CARRIER, RUNTIME AND IMPLEMENTATION REMAIN OPEN`

**Decision authority:** human project-governance confirmation on 2026-09-06

**Repository baseline:** `562991cddba2cd0f3414932629c5f25b38693d78`

**Canonical identity:** `MSP-07 → XFR-D-020`, `PRIMARY_STANDALONE` — «Decimal representation/precision/serialization».

**Scope:** qualitative governance, semantic-preservation, fail-closed and evidence-prerequisite boundary for a future scoring numeric-representation contract. This record does not select decimal/fixed-point or floating-point arithmetic, JSON or CBOR, scale, precision, rounding mode/checkpoint, canonical number encoding, equality/tolerance rule, conversion or edge behavior, runtime/API/DB/schema/event/storage carrier, migration, Scoring Policy version, production applicability or implementation.

**Governance owner:** `DEVELOPMENT + AI` — human-approved assignment derived from the Scoring Policy §12 row 7 candidate. Architecture §49 does not directly assign an owner for this representation decision; this role is not claimed as `SOURCE_NORMATIVE`.

**Scoring Policy artifact owner:** `Chief AI Architect + PRODUCT` — source-owned artifact owner under Architecture §52. Artifact ownership remains separate from decision-specific technical governance.

**Mandatory approvers:** `Chief AI Architect + PRODUCT + LEGAL`.

**Evidence/technical-procedure owner:** `DEVELOPMENT + AI`; this role prepares candidate contracts, compatibility analysis and replay evidence, but has no unilateral authority to select a representation, approve semantics/evidence sufficiency/policy/production use/runtime or pass a governance gate.

**Depends on and preserves:** `XFR-D-003`, `XFR-D-017`, `XFR-D-018`, `XFR-D-021`, `XFR-D-023`, `XFR-D-024 v1.1`, `XFR-D-026`, `XFR-D-027`, `XFR-D-M4`, all source Score/Risk/Qualification semantics, the Scoring Policy, Evaluation Plan, Data Contracts, Feature Schema, Risk Policy, Qualification Policy and Controlled Artifact Manifest retain their independent authority and status.

---

## 1. Вопрос

Какая qualitative governance и evidence-prerequisite boundary должна действовать до утверждения точного decimal representation, intermediate precision, rounding algorithm и canonical serialization для scoring-компонент?

## 2. Source/status discipline

1. Inventory canonical crosswalk фиксирует `MSP-07 → XFR-D-020`, `PRIMARY_STANDALONE`. Inventory индексирует вопрос, но не создаёт substantive approval.
2. Architecture §15.4 задаёт source-normative арифметическую структуру Dimension Score, однако не определяет decimal/floating representation, precision или rounding.
3. Architecture §§33 и 49 требуют auditable version/hash binding и deterministic exact replay для детерминированного пути. Architecture §49 называет canonical JSON/CBOR profile, но не выбирает JSON или CBOR и не задаёт полный scoring numeric contract.
4. Architecture §49 требует идентичности входных hashes, component scores, ranking, reasons и final package hash при exact replay; mismatch является severity-1 defect для соответствующей rule version. Это требование воспроизводимости не выбирает representation и не доказывает semantic correctness, calibration, fairness или production readiness.
5. Scoring Policy §§4 и 9 прямо сохраняет exact decimal/float representation, precision и rounding как `OPEN_BLOCKED_PENDING_DECISION`. Упомянутые fixed-point/round-half-to-even и floating-point/fixed-precision, RFC 8785-like JSON и canonical CBOR являются только `DECISION_CANDIDATE_FOR_REVIEW`.
6. Scoring Policy §12 row 7 содержит `DEVELOPMENT + AI — candidate assignment`; Architecture §49 не содержит прямого source-owner assignment для `XFR-D-020`. Поэтому owner в этом record является human-approved governance assignment, не source-normative атрибутом.
7. Architecture §52 отдельно сохраняет `Chief AI Architect + PRODUCT` как owner controlled artifact `MATCHING_SCORING_POLICY`. Technical decision owner, artifact owner и mandatory approvers не сливаются.
8. Data Contracts v1.0 не содержит scoring-specific representation contract. Его transport/event, validation, hashing или infrastructure-canonicalization правила нельзя импортировать как approval numeric representation, serialization или runtime carrier для scoring.
9. `XFR-D-M4` отдельно объединяет bounded replay tolerance для вероятностных компонентов. Exact deterministic equality и bounded probabilistic replay остаются различными governance questions.
10. Proposal, candidate, example, technical feasibility, library behavior, existing database type, Inventory entry, commit, merge, CI result or deployment не равны representation, policy, runtime, production or gate approval.

## 3. Решение

### 3.1. Authority split

1. Governance owner `XFR-D-020` — `DEVELOPMENT + AI`, утверждённый человеком из candidate assignment Scoring Policy §12 row 7.
2. Scoring Policy artifact owner остаётся `Chief AI Architect + PRODUCT` по Architecture §52.
3. Mandatory approvers — `Chief AI Architect + PRODUCT + LEGAL`.
4. Evidence/technical-procedure owner — `DEVELOPMENT + AI`, без unilateral authority.
5. Будущее утверждение точного representation contract требует согласования полного набора `DEVELOPMENT + AI + Chief AI Architect + PRODUCT + LEGAL` на одной immutable candidate policy/contract version/hash и её evidence package.
6. Ни technical ownership, ни artifact ownership, ни подготовка replay evidence не разрешают единолично выбирать representation, объявлять evidence достаточным, утверждать policy/runtime/production use или менять gate.

### 3.2. Semantic-preservation boundary

1. Numeric representation является техническим carrier вычислительной семантики, а не источником новой business semantics.
2. Будущий contract обязан сохранять отдельно определённые source/policy значения и компоненты, включая применимые `Feature Fit`, `Feature Weight`, `Evidence Confidence`, `Tenant Fit`, `Owner Fit`, `Deal Feasibility`, Match/Reciprocal/Dimension outputs и их provenance.
3. Representation, serialization или conversion не могут silently изменить значение, знак, направление, unit, range, ordering semantics, missing/unknown state, applicability или source authority.
4. Missing/unknown не могут быть преобразованы в numeric zero, neutral/default value, negative fact, failed fit, rejection или inferred value.
5. Representation не меняет приоритет Hard Constraints/Eligibility и не объединяет Match, Confidence, Risk, Qualification, Priority Score, ranking/diversification или Safe Presentation.
6. Выбор encoding или numeric type не выбирает формулу, функцию, weight, threshold, normalization, ranking rule, Qualification/Risk rule или presentation wording.

### 3.3. Closed, explicit and deterministic candidate discipline

Любой future candidate representation contract должен быть:

1. closed и explicit для всех затронутых scoring inputs, intermediate operations/checkpoints и outputs;
2. versioned и hash-bound к exact Scoring Policy/code/configuration/toolchain assumptions, которые он реально использует;
3. deterministic и replayable для детерминированного пути без locale-, platform-, language-, compiler-, library-, database- или deployment-default behavior;
4. explicit в отношении conversions между calculation, serialization, persistence, transport and replay boundaries, не утверждая сами carriers этим record'ом;
5. auditable: исходные компоненты, transformations, errors and version/hash bindings остаются attributable;
6. сопровождаем evidence для range/domain, conversion, overflow/underflow, compatibility и replay behavior, без утверждения точного механизма здесь.

Соответствие этим qualitative требованиям является prerequisite для будущего review, но не approval candidate contract.

### 3.4. Candidate non-selection

1. Decimal/fixed-point и floating-point остаются невыбранными candidates; ни один не получает default, preferred или fallback status.
2. RFC 8785-like JSON и canonical CBOR остаются невыбранными candidates; ни один не становится runtime/API/storage contract.
3. Упоминание round-half-to-even в Scoring Policy остаётся candidate example, а не approved rounding mode.
4. Canonical serialization и arithmetic representation — два связанных, но разных слоя: выбор одного не выбирает другой.
5. Existing programming-language number type, database column, wire encoding, serializer, library default или implementation convenience не являются governance approval.
6. Bit-for-bit identity нельзя заявлять до полного утверждения applicable representation contract и успешной проверки exact replay evidence на той же version/hash-bound конфигурации.

### 3.5. Fail-closed boundary

Missing, incomplete, ambiguous, incompatible, stale, unauthorized или non-reproducible representation/serialization/version binding:

1. не выбирает decimal, float, JSON, CBOR, previous-version behavior или platform/library default;
2. не заменяется zero, neutral, rounded, truncated, saturated, inferred или otherwise coerced value;
3. не создаёт negative business fact, Hard Constraint result, rejection, score, rank, Confidence, Risk, Qualification, route, reason or presentation;
4. блокирует затронутый calculation/replay/approval progression, пока отдельно approved rule не определит более широкий эффект;
5. не компенсируется aggregate score, business outcome, apparent closeness, tolerance, majority of matching components, technical convenience or synthetic-only evidence;
6. оставляет exact error, retry, recovery, escalation, cascade granularity, status/enum, observability and runtime behavior `OPEN`.

Fail closed здесь — governance prerequisite, не бизнес-вердикт и не implementation specification.

### 3.6. Reproducibility evidence boundary

До будущего утверждения точного representation contract требуется immutable evidence package, включающий как минимум:

1. exact candidate contract/policy/configuration version and hash;
2. полный перечень покрытых input, intermediate and output numeric fields/checkpoints без hidden carrier or transformation;
3. test vectors для boundary/domain/conversion/ordering/serialization cases, не утверждённые этим record'ом как конкретный dataset;
4. cross-runtime/platform/toolchain compatibility evidence для заявленного scope либо явное ограничение scope;
5. exact deterministic replay evidence по Architecture §§33/49 с полным separate reporting mismatches;
6. explicit treatment and tests for missing/unknown and applicable numeric edge classes без назначения их точной семантики этим record'ом;
7. prospective version/change and historical-result preservation evidence under `XFR-D-023`;
8. distinction between deterministic exact replay and any future probabilistic bounded replay under `XFR-D-M4`;
9. explicit synthetic-only versus production-data applicability statement under `XFR-D-026`;
10. limitations, unresolved dependencies and non-authorization statement;
11. documented review/approval of the same immutable candidate and evidence package by the full owner/approver set.

Эти пункты — evidence categories, не утверждение exact values, vectors, algorithms, tolerance, carrier, dataset or result. Missing applicable category blocks approval fail closed.

### 3.7. Exact replay is not broader approval

1. Successful exact replay доказывает только заявленную reproducibility в проверенном scope.
2. Он не доказывает semantic correctness, formula choice, calibration, fairness, absence of proxy/discrimination, data sufficiency, production applicability or readiness.
3. Replay mismatch не может быть скрыт tolerance, rounding, reserialization, selective component reporting или post-hoc configuration change.
4. Любая bounded tolerance для probabilistic component остаётся отдельным `XFR-D-M4`; этот record не задаёт и не разрешает tolerance для deterministic mismatch.
5. Replay result не может автоматически менять formula, weights, thresholds, policy, model, routing, release, runtime, rollback или gate state.

### 3.8. Prospective-only version/change boundary

1. `XFR-D-023` сохраняется: новый representation contract или его version не переписывает, не мутирует и не переинтерпретирует ранее сохранённые Match Results.
2. Historical result остаётся связан с фактически использованными policy/representation/code/configuration versions/hashes.
3. Совместимость, migration, dual-read/write, re-computation, re-ranking and supersession mechanics остаются `OPEN`.
4. Representation change не получает автоматически `major`/`minor`/`patch` classification; точная semantic-versioning rule остаётся отдельно `OPEN` под `XFR-D-023`.

### 3.9. Independent boundaries preserved

1. `XFR-D-003` rent-rate Feature Fit decimal precision/rounding остаётся отдельным feature-specific вопросом и не подменяет scoring-wide `XFR-D-020`.
2. `XFR-D-017` сохраняет harmonic/geometric selection, exact function, edge behavior, precision and rounding `OPEN`; `XFR-D-020` не выбирает Mutual Aggregate.
3. `XFR-D-018`, `XFR-D-021` и `XFR-D-024 v1.1` сохраняют segment override, ranking/diversification and Priority Score boundaries; representation не создаёт их substantive policy.
4. `XFR-D-023` сохраняет version/change authority; этот record не завершает full version-bundle, semantic-versioning or migration design.
5. `XFR-D-026` synthetic-to-production boundary и `XFR-D-027` evidence-process roles остаются неизменными.
6. `XFR-D-M4` bounded replay tolerance остаётся независимо `OPEN` и не может быть выведен из exact deterministic replay.
7. Scoring, Risk and Qualification formulae, weights, thresholds, status/routing semantics and approvals сохраняют собственных owners and decisions.
8. Data Contracts, API/DB/schema/events/storage, Controlled Artifact Manifest, runtime and implementation остаются отдельными artifacts/approvals.

### 3.10. Partial, never fully resolved

`XFR-D-020` получает `PARTIALLY_RESOLVED_BOUNDARY`: roles, semantic preservation, closed/explicit/versioned/hash-bound candidate discipline, candidate non-selection, fail-closed handling, minimum evidence categories, exact-replay separation, prospective historical preservation and non-conflation утверждены qualitatively.

Exact representation contract и все numeric, serialization, conversion, edge, tolerance, schema, carrier, migration, runtime, production and implementation contents остаются `OPEN`. Этот record нельзя цитировать как полное решение Scoring Policy §12 row 7 или как утверждение bit-exact runtime implementation.

## 4. Layer and authority table

| Layer | Preserved authority | Approved here | Remains `OPEN` |
|---|---|---|---|
| `XFR-D-020` technical governance | Human-approved `DEVELOPMENT + AI` | Qualitative governance/evidence boundary | Exact representation contract |
| Scoring Policy artifact | Architecture §52: `Chief AI Architect + PRODUCT` | No artifact approval | Exact policy version/hash and approval |
| Mandatory approval | `Chief AI Architect + PRODUCT + LEGAL` | Required participation | Actual future approval verdict |
| Evidence/technical procedure | `DEVELOPMENT + AI` | Preparation responsibility, no unilateral authority | Exact tests, vectors, tools, evidence and sufficiency |
| Deterministic replay | Architecture §§33/49 | Exact-replay discipline preserved | Full implementable representation details |
| Probabilistic replay | `XFR-D-M4` | Explicitly separate | Every bounded tolerance and invariant |
| Data Contracts/carrier | Separate artifact authority | No extension or carrier approved | API/DB/schema/event/storage/transport |
| Runtime/production | Separate controlled artifacts and gates | No authorization | Migration, implementation, deployment and production use |

## 5. Обязательные non-conflations

1. Scoring-wide representation `XFR-D-020` ≠ rent-rate Feature Fit precision `XFR-D-003`.
2. Canonical serialization ≠ arithmetic representation.
3. Canonical serialization ≠ Data Contracts or runtime carrier approval.
4. Exact deterministic equality ≠ bounded probabilistic replay tolerance `XFR-D-M4`.
5. Bit-exact replay ≠ semantic correctness, calibration, fairness or production readiness.
6. Governance owner `DEVELOPMENT + AI` ≠ Scoring Policy artifact owner `Chief AI Architect + PRODUCT`.
7. Evidence/technical owner `DEVELOPMENT + AI` ≠ unilateral representation/policy approver.
8. Numeric representation ≠ formula/function/weight/threshold/normalization/ranking/routing authority.
9. Missing/incompatible representation ≠ zero, neutral value, negative business fact or rejection.
10. Existing implementation/library/database behavior ≠ approved contract.
11. Successful tests, commit, merge, CI or deployment ≠ policy, production or gate approval.

## 6. Что остаётся `OPEN`

- decimal/fixed-point versus floating-point selection;
- exact scale, precision and intermediate precision;
- rounding mode and every rounding checkpoint;
- canonical JSON versus canonical CBOR and exact profile;
- canonical ordering and textual/binary number encoding;
- conversion, quantization, normalization and comparison rules;
- equality semantics and every tolerance;
- `sqrt`, division and other algorithmic implementation details;
- zero/near-zero, negative zero, overflow, underflow, subnormal, `NaN`, infinity and domain behavior;
- null/missing/unknown encoding and exact affected-scope behavior;
- error/status/enum/retry/recovery/escalation/observability behavior;
- cross-language/platform/runtime compatibility scope;
- API/DB/schema/event/storage/transport carrier and Data Contracts extension;
- persistence types, migrations, historical compatibility and recomputation;
- exact test vectors, dataset, metrics, statistics, evidence and sufficiency verdict;
- bounded probabilistic replay tolerance `XFR-D-M4`;
- formula/function selection, weights, thresholds, ranking and routing semantics;
- Scoring Policy and Controlled Artifact Manifest approval;
- production-data use, production applicability, runtime and implementation.

## 7. Rationale

Sources require deterministic replay but deliberately leave the representation contract undefined. Selecting a convenient number type, serializer or database encoding would therefore create architecture by implementation accident. The narrow safe step is to approve who governs the future choice and which semantic-preservation, evidence, fail-closed and non-conflation constraints every candidate must satisfy, while leaving every concrete numeric and runtime choice open.

This also prevents two opposite errors: treating reproducibility requirements as if they had already selected an implementation, or treating the lack of an implementation choice as permission to rely on hidden defaults. Exact replay can become a meaningful claim only after the complete applicable contract is explicitly approved and bound to its evidence.

## 8. Adversarial cases

1. **Developer uses the language's default `number` type.** Rejected: implementation convenience is not approval.
2. **Database rounds a component silently on persistence.** Rejected: hidden conversion violates semantic preservation and replay attribution.
3. **JSON is selected because Architecture §49 mentions canonical JSON first.** Rejected: JSON and CBOR remain unselected alternatives.
4. **Round-half-to-even is treated as approved.** Rejected: it is only a Scoring Policy candidate example.
5. **Missing value becomes `0.0` to simplify arithmetic.** Rejected: missing/unknown cannot become numeric or business meaning.
6. **Replay mismatch is accepted because final rank did not change.** Rejected: aggregate/output coincidence cannot compensate exact deterministic mismatch.
7. **Small epsilon is introduced from `XFR-D-M4`.** Rejected: bounded probabilistic tolerance is separate and supplies no deterministic tolerance.
8. **A bit-identical output is presented as proof of fairness or production readiness.** Rejected: reproducibility is not semantic/evidence/gate approval.
9. **A new representation version is used to reinterpret historical Match Results.** Rejected: `XFR-D-023` prospective-only preservation applies.
10. **Data Contracts infrastructure rules are cited as scoring carrier approval.** Rejected: no scoring-specific representation extension is approved.

## 9. Затронутые артефакты (future separate sync, не выполняется этим record'ом)

- `LeaseMind_MATCHING_SCORING_POLICY_v0.1.md` — metadata, §§4/9, §12 row 7 and readiness summary may receive this qualitative owner/governance/evidence overlay without selecting representation;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — may receive a separate owner-review overlay for `MSP-07 → XFR-D-020` without rewriting historical checkpoints or crosswalk identity;
- no Architecture, Data Contracts, Feature Schema, Evaluation Plan, Risk Policy, Qualification Policy, manifest, runtime or implementation change is authorized by this record.

No future sync may interpret this record as an approved decimal/float type, precision, rounding, serialization, tolerance, carrier, migration, Scoring Policy, dataset, production use or implementation.

## 10. Change control

Изменение role allocation, semantic-preservation rule, candidate non-selection, fail-closed boundary, evidence prerequisites, exact-vs-bounded replay separation, prospective-only historical preservation или non-conflation matrix требует нового versioned `XFR-D-020` record с `supersedes`, согласованного `DEVELOPMENT + AI + Chief AI Architect + PRODUCT + LEGAL`.

## 11. Gate impact

`NONE`.

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**

## 12. Acceptance criteria

1. **Given** governance roles, **when** checked, **then** owner is human-approved `DEVELOPMENT + AI`, Scoring Policy artifact owner remains `Chief AI Architect + PRODUCT`, mandatory approvers are `Chief AI Architect + PRODUCT + LEGAL`, and evidence/technical owner `DEVELOPMENT + AI` has no unilateral authority.
2. **Given** decimal/fixed-point, floating-point, JSON, CBOR or a rounding mode, **when** cited as selected, **then** the claim is rejected; every exact choice remains `OPEN`.
3. **Given** representation or conversion, **when** it changes meaning, missing/unknown state, attribution, range, ordering or independently governed layer semantics, **then** it is inadmissible.
4. **Given** missing/incompatible/non-reproducible representation evidence, **when** evaluated, **then** it blocks the affected progression without becoming zero, neutral, negative fact, rejection, score, rank, route, reason or presentation.
5. **Given** exact replay, **when** claimed, **then** it is bound to the complete approved contract and exact versions/hashes; no hidden platform/library/database default is accepted.
6. **Given** successful bit-exact replay, **when** calibration, fairness, production applicability or readiness is claimed, **then** the claim is rejected as out of scope.
7. **Given** `XFR-D-M4`, **when** used to introduce deterministic epsilon/tolerance, **then** the claim is rejected; bounded probabilistic replay remains separate and `OPEN`.
8. **Given** an old Match Result, **when** representation changes, **then** the historical result remains immutable and bound to the actual prior version/hash under `XFR-D-023`.
9. **Given** `XFR-D-003`, `XFR-D-017`, `XFR-D-018`, `XFR-D-021`, `XFR-D-023`, `XFR-D-024 v1.1`, `XFR-D-026`, `XFR-D-027`, `XFR-D-M4` and source Score/Risk/Qualification semantics, **when** this record is applied, **then** none is reopened, absorbed, selected or approved.
10. **Given** Data Contracts, API/DB/schema/event/storage, migration or runtime, **when** this record is cited as authority, **then** no extension, carrier or implementation approval exists.
11. **Given** this record, **when** Scoring Policy, dataset, evidence result, production-data use, deployment or governance gates are checked, **then** none is approved and all three gates remain `BLOCKED`.

## 13. Итог

`XFR-D-020 SCORING NUMERIC-REPRESENTATION GOVERNANCE/EVIDENCE BOUNDARY APPROVED — EXACT REPRESENTATION, PRECISION, ROUNDING, SERIALIZATION, TOLERANCE, CARRIER, RUNTIME, PRODUCTION AND IMPLEMENTATION REMAIN OPEN/BLOCKED`
