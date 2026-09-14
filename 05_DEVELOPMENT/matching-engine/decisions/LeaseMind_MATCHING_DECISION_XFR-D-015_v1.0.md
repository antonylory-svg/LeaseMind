# LeaseMind Matching Decision Record — XFR-D-015

**Decision ID:** `XFR-D-015`

**Название:** Feature state-axis separation and runtime-enum governance boundary

**Версия:** 1.0

**Дата решения:** 2026-09-10

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED QUALITATIVE DESIGN-TIME/RUNTIME-AXIS SEPARATION BOUNDARY — FULL VALUE_STATE/PROCESSING_ELIGIBILITY ENUMS, MAPPINGS, TRANSITIONS, CASCADE, GRANULARITY, SCHEMA, CARRIER, RECOVERY, RUNTIME AND IMPLEMENTATION REMAIN OPEN`

**Decision authority:** human project-governance confirmation on 2026-09-10

**Repository baseline:** `84e858a4839f46d02c4ce9b151f9247b4acdef4d`

**Canonical identity:** `FS-18 → XFR-D-015`, `PRIMARY_STANDALONE` (`LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` §4.1). Canonical mapping and Inventory counts remain unchanged at 102 source keys / 90 canonical IDs.

**Scope:** qualitative separation of Feature Schema design-time readiness from three independent candidate/runtime-relevant axes, with preservation of Architecture source-normative evidence and lawful-basis enums. No full/public runtime enum, mapping, transition, cascade, carrier, Data Contract, runtime or implementation is approved.

**Governance owner:** `Chief AI Architect + DEVELOPMENT + AI` — human-approved assignment derived from Feature Schema §10 row 18; it is not claimed as `SOURCE_NORMATIVE`.

**Feature Schema artifact owner:** `PRODUCT + LEGAL + AI`; artifact ownership remains separate from decision-specific governance.

**Mandatory approvers:** `PRODUCT + LEGAL`.

**Evidence/technical-procedure owner:** `AI + DEVELOPMENT`; this role may prepare candidate state models, compatibility analysis and evidence only and has no unilateral authority to approve an enum, mapping, runtime/production/implementation or gate.

**Depends on and preserves:** `XFR-D-012`, `XFR-D-013`, `XFR-D-016`, `XFR-D-020`, `XFR-D-032`, `XFR-D-033`, `XFR-D-038`, `XFR-D-M1` and `XFR-D-M6` remain independent. Existing Data Contracts are not imported into Matching Feature state representation.

---

## 1. Вопрос

Как отделить design-time `registry_readiness` от runtime-relevant `value_state`, `evidence_status` and `processing_eligibility`, пока полный runtime state contract остаётся неутверждённым?

## 2. Source/status discipline

1. Inventory §4.1 indexes `FS-18 → XFR-D-015`, `PRIMARY_STANDALONE`; indexing is not substantive approval.
2. Feature Schema §3.1 defines `registry_readiness` as design-time only with exactly four draft values: `READY_FOR_DRAFT`, `READY_AS_CANDIDATE_ONLY`, `BLOCKED_PENDING_DECISION`, `EXCLUDED_FROM_V0_1`.
3. Feature Schema §3.2 uses only a minimal internal candidate set for `value_state`: `PRESENT`, `NOT_APPLICABLE`, `UNKNOWN`; it explicitly does not claim a complete or public runtime enum.
4. Feature Schema §3.2 uses `ALLOWED` and `DATA_PROCESSING_BLOCKED` as an internal candidate `processing_eligibility` pair and does not claim a complete/public API or event enum.
5. Architecture §13 source-normatively defines exactly seven `evidence_status` values: `UNVERIFIED`, `SOURCE_CONFIRMED`, `CONTENT_VERIFIED`, `CONFLICTING`, `STALE`, `REJECTED`, `HUMAN_REVIEW_REQUIRED`.
6. Architecture §11 source-normatively defines exactly six `lawful_basis_status` values: `ACTIVE`, `EXPIRED`, `REVOKED`, `TERMINATED`, `SUSPENDED`, `UNDER_REVIEW`.
7. Feature Schema is a Proposal; its internal candidate names and examples do not create an executable contract.

## 3. Решение

### 3.1. Authority split

1. Governance owner is `Chief AI Architect + DEVELOPMENT + AI`, human-approved from the candidate assignment and not `SOURCE_NORMATIVE`.
2. Mandatory approvers are `PRODUCT + LEGAL`.
3. Feature Schema artifact owner remains `PRODUCT + LEGAL + AI`.
4. Evidence/technical-procedure owner is `AI + DEVELOPMENT`, without unilateral authority.
5. Any future exact state contract requires all five functions to approve the same immutable version/hash and evidence package.

### 3.2. Design-time readiness remains design-time only

1. `registry_readiness` describes the readiness of a feature definition or rule in the Feature Schema review process, never the state of a runtime value.
2. Its four existing draft values remain exactly `READY_FOR_DRAFT`, `READY_AS_CANDIDATE_ONLY`, `BLOCKED_PENDING_DECISION`, `EXCLUDED_FROM_V0_1`.
3. None of these values may be assigned to, mapped by default into or interpreted as `value_state`, `evidence_status`, `processing_eligibility`, Qualification, Risk, score or route.
4. This record does not promote the four values into an API/event/database/runtime enum.

### 3.3. Independent axes

The following axes remain semantically independent and may not be collapsed:

1. `value_state` — whether/how a value is present or applicable;
2. `evidence_status` — the source-normative seven-value Architecture §13 evidence state;
3. `processing_eligibility` — whether the affected processing use is permitted under applicable lawful-basis/purpose conditions;
4. `registry_readiness` — design-time readiness only, outside runtime state.

A value may be present but unverified; evidence may be stale without creating a negative source fact; processing may be blocked independently of content/evidence state. No axis substitutes for another.

### 3.4. Exact enums preserved without expansion

1. The exact Architecture §13 seven-value `evidence_status` enum remains unchanged: `UNVERIFIED`, `SOURCE_CONFIRMED`, `CONTENT_VERIFIED`, `CONFLICTING`, `STALE`, `REJECTED`, `HUMAN_REVIEW_REQUIRED`.
2. The exact Architecture §11 six-value `lawful_basis_status` enum remains unchanged: `ACTIVE`, `EXPIRED`, `REVOKED`, `TERMINATED`, `SUSPENDED`, `UNDER_REVIEW`.
3. No new value, hierarchy, equivalence, ordering or automatic mapping is introduced for either enum.
4. Feature Schema draft tokens `PRESENT`, `NOT_APPLICABLE`, `UNKNOWN`, `ALLOWED` and `DATA_PROCESSING_BLOCKED` remain internal candidates, not complete/public runtime enums.

### 3.5. No coercion or silent cascade

Missing, `UNKNOWN`, `NOT_APPLICABLE`, `DATA_PROCESSING_BLOCKED`, `STALE` and all other states remain distinct. None is silently coerced into:

1. another state axis or enum value;
2. numeric zero, neutral/default or negative value;
3. `PASS`, `FAIL`, incompatibility or automatic `INELIGIBLE`;
4. Qualification result, Risk, Confidence, score, route, rejection, reason or display;
5. a global block when only an affected governed use is implicated.

Exact mapping, transition, cascade and granularity behavior remains `OPEN`.

### 3.6. Data Contracts and runtime non-import

1. Existing Reveal, Participation or other Data Contracts do not define the Matching Feature state contract and are not imported by analogy.
2. Reusing a field name, enum token, JSON shape, database type or event name from another contract is not approval.
3. No schema/API/event/database/storage/carrier, persistence, recovery or runtime behavior is established here.

### 3.7. Partial, never full resolution

`XFR-D-015` receives `PARTIALLY_RESOLVED_BOUNDARY`: design-time/runtime separation, independent axes, exact preservation of the two Architecture enums, non-promotion of candidate tokens and no-coercion/no-silent-cascade safeguards are approved qualitatively.

The full/public `value_state` and `processing_eligibility` enums and every mapping, transition, cascade, granularity, schema, carrier, recovery, runtime and implementation detail remain `OPEN`. This record cannot be cited as full resolution of Feature Schema §10 row 18.

### 3.8. Independent boundaries preserved

1. `XFR-D-012` wildcard/land applicability distinctions remain independent and do not define the full `value_state` enum.
2. `XFR-D-013` OPEX mismatch `UNKNOWN` boundary remains independent and does not define a universal transition.
3. `XFR-D-016` Lawful Basis Registry projection/fail-closed boundary remains independent; this record neither creates nor expands its contract.
4. `XFR-D-020` numeric representation remains independent and cannot map states to numbers.
5. `XFR-D-032`, `XFR-D-033` and `XFR-D-038` retain Qualification missing/reason/review authority; Feature states do not select a Qualification route.
6. `XFR-D-M1` preserves required-evidence governance and `XFR-D-M6` preserves Feature Fit/Evidence Confidence separation; neither is absorbed.

## 4. Layer and authority table

| Layer | Preserved authority | Approved here | Remains `OPEN` |
|---|---|---|---|
| Canonical identity | Inventory §4.1 | `FS-18 → XFR-D-015`, `PRIMARY_STANDALONE`, unchanged | Future Inventory status overlay |
| Governance | `Chief AI Architect + DEVELOPMENT + AI`; approvers `PRODUCT + LEGAL` | Role split and qualitative boundary | Actual future content verdict |
| Feature artifact | `PRODUCT + LEGAL + AI` | No artifact approval | Proposal/policy approval |
| `registry_readiness` | Feature Schema design-time review | Four draft values preserved as design-time only | Future schema status overlay |
| `evidence_status` | Architecture §13 | Exact seven values preserved | No mapping/hierarchy approved |
| `lawful_basis_status` | Architecture §11 | Exact six values preserved | No Mapping/contract approved |
| Candidate runtime axes | Future jointly approved contract | Independence/no-coercion only | Full enums, mappings, transitions and cascade |
| Evidence/technical procedure | `AI + DEVELOPMENT` | Preparation role, no unilateral authority | Exact evidence and sufficiency verdict |
| Runtime/production/gates | Separate controlled authorities | No authorization | Carrier, implementation, release and gates |

## 5. Обязательные non-conflations

1. Design-time `registry_readiness` ≠ runtime `value_state`.
2. `value_state` ≠ `evidence_status` ≠ `processing_eligibility`.
3. `lawful_basis_status` ≠ `processing_eligibility`; the latter is a candidate derived axis, not source registry state.
4. `PRESENT` ≠ verified evidence or allowed processing.
5. `NOT_APPLICABLE` ≠ `UNKNOWN`, `PASS` or `FAIL`.
6. `STALE` ≠ negative business fact or automatic rejection.
7. `DATA_PROCESSING_BLOCKED` ≠ automatic `INELIGIBLE` or universal/global block.
8. Existing Data Contract token/shape ≠ Matching Feature runtime contract.
9. Evidence/technical ownership ≠ unilateral approval.

## 6. Что остаётся `OPEN`

- full and public `value_state` enum;
- full and public `processing_eligibility` enum;
- exact mappings between source facts, lawful-basis state, evidence state and candidate runtime state;
- transition/state-machine rules, precedence, cascade and affected-use granularity;
- conflict, missing, unknown, not-applicable, stale, blocked, invalidation and recovery behavior beyond approved qualitative safeguards;
- error/status/reason taxonomy, retry, escalation and observability;
- schema/API/event/DB/storage/transport/runtime carrier and persistence;
- exact compatibility/migration/versioning mechanics;
- exact dataset, tests, metrics, evidence procedure and sufficiency verdict;
- Feature Schema/Policy/Data Contracts/manifest/production/runtime/implementation approval and every gate transition.

## 7. Rationale

Collapsing readiness, value availability, evidence quality and lawful processing into one status would turn distinct facts into hidden business outcomes. Preserving the Architecture enums exactly while keeping the Feature Schema tokens explicitly candidate-only allows future design without pretending that a complete runtime state machine or Data Contract already exists.

## 8. Adversarial cases

1. **`BLOCKED_PENDING_DECISION` is emitted as a runtime `value_state`.** Rejected: it is design-time `registry_readiness` only.
2. **`PRESENT` is treated as `CONTENT_VERIFIED`.** Rejected: value and evidence axes are independent.
3. **`STALE` is treated as `FAIL` or negative fact.** Rejected: no such coercion is approved.
4. **`DATA_PROCESSING_BLOCKED` makes the pair automatically `INELIGIBLE`.** Rejected: exact Qualification consequence remains separate/open.
5. **`UNKNOWN` and `NOT_APPLICABLE` are merged.** Rejected: they preserve different meanings and exact full enum remains open.
6. **A Reveal/Participation Data Contract enum is copied into Matching.** Rejected: existing contracts are not imported.
7. **A numeric layer maps missing/blocked states to zero.** Rejected: `XFR-D-020` cannot override state semantics.
8. **An evidence owner approves a runtime enum.** Rejected: evidence preparation has no unilateral authority.

## 9. Затронутые артефакты — future separate sync only

- `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md` may later receive a status overlay preserving all exact/runtime content `OPEN`.
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` may later record `PARTIALLY_RESOLVED_BOUNDARY` without changing canonical identity or counts.
- No Proposal, Policy, Data Contract, dataset, evaluation artifact, manifest, sibling record, runtime or code is changed here.

No sync is performed by this record. Feature Schema, Inventory, Policies, manifests, Data Contracts, sibling records, runtime and application code remain untouched.

## 10. Change control

Any change to design-time/runtime separation, axis independence, exact source enum preservation, candidate-token status, no-coercion/no-silent-cascade safeguards or role split requires a new versioned `XFR-D-015` record with `supersedes`, approved by all five functions on the same immutable version/hash: `Chief AI Architect + DEVELOPMENT + AI` and `PRODUCT + LEGAL`.

## 11. Gate impact

`NONE`.

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**.
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**.
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**.

This record does not approve any Proposal, Feature Schema, Policy, Data Contract, dataset, evaluation run, production-data use, manifest, runtime, implementation or release.

## 12. Acceptance criteria

1. Canonical identity remains `FS-18 → XFR-D-015`, `PRIMARY_STANDALONE`, with counts 102/90 unchanged.
2. Owner is `Chief AI Architect + DEVELOPMENT + AI`, candidate-derived and not `SOURCE_NORMATIVE`; approvers are `PRODUCT + LEGAL`; evidence/technical ownership has no unilateral authority.
3. `registry_readiness` remains design-time only with exactly its four existing draft values.
4. `value_state`, `evidence_status` and `processing_eligibility` remain independent.
5. Architecture seven-value `evidence_status` and six-value `lawful_basis_status` remain exact and unchanged.
6. `PRESENT`/`NOT_APPLICABLE`/`UNKNOWN` and `ALLOWED`/`DATA_PROCESSING_BLOCKED` remain internal candidates, not full/public runtime enums.
7. No missing/unknown/not-applicable/blocked/stale state is coerced into another axis, zero, negative, `PASS`, `FAIL`, `INELIGIBLE`, Qualification result or route.
8. Exact enums/mappings/transitions/cascade/granularity/schema/carrier/recovery/runtime remain `OPEN`.
9. Existing Data Contracts are not imported; named sibling decisions remain independent.
10. All three governance gates remain `BLOCKED`.

## 13. Итог

`XFR-D-015 PARTIALLY_RESOLVED_BOUNDARY — REGISTRY_READINESS REMAINS A FOUR-VALUE DESIGN-TIME AXIS; VALUE_STATE, EXACT SEVEN-VALUE EVIDENCE_STATUS AND PROCESSING_ELIGIBILITY REMAIN INDEPENDENT; THE EXACT SIX-VALUE LAWFUL_BASIS_STATUS IS PRESERVED; DRAFT VALUE/PROCESSING TOKENS ARE NOT FULL OR PUBLIC RUNTIME ENUMS; NO STATE COERCION, NUMERIC DEFAULT, PASS/FAIL, INELIGIBLE, QUALIFICATION RESULT OR ROUTE IS APPROVED; ALL FULL ENUM, MAPPING, TRANSITION, CASCADE, GRANULARITY, CONTRACT, CARRIER, RECOVERY, RUNTIME AND IMPLEMENTATION CONTENT REMAINS OPEN`
