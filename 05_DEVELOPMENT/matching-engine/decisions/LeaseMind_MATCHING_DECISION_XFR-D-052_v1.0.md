# LeaseMind Matching Decision Record — XFR-D-052

**Decision ID:** `XFR-D-052`

**Название:** Risk reason-reference namespace governance boundary

**Версия:** 1.0

**Дата решения:** 2026-09-02

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED QUALITATIVE RISK REASON-REFERENCE GOVERNANCE, SEPARATION, PROVENANCE AND FAIL-CLOSED BOUNDARY — EXACT NAMESPACE, VALUES, MAPPINGS, COMPATIBILITY, CARRIER AND IMPLEMENTATION REMAIN OPEN`

**Decision authority:** human project-governance confirmation in the 2026-09-02 working session

**Repository baseline:** `d30af1ce266d7a002eb041d96feb977f737c97db`

**Scope:** governance authority, internal namespace separation, future approval prerequisites, provenance/version binding, immutable-history discipline, fail-closed handling and preservation of existing Risk non-compensation for canonical `MRP-07 → XFR-D-052` only. This record does not approve a namespace name, code, value, enum, catalog, mapping, alias, ordering, severity, compatibility matrix, schema, carrier, dataset, Policy, manifest, runtime design or implementation.

**Governance owner:** `Chief AI Architect + AI` — human-approved decision-specific assignment preserving the candidate in `LeaseMind_MATCHING_RISK_POLICY_v0.1.md` §13 row 7. Architecture does not assign an owner to this exact sub-question directly.

**Mandatory approvers:** `PRODUCT + LEGAL + DEVELOPMENT`.

**Evidence/technical-procedure owner:** `AI + DEVELOPMENT`; this role prepares candidate references and evidence and checks technical feasibility, but has no unilateral authority to approve Risk semantics, namespace contents, values, mappings, compatibility, Policy, carrier, runtime or implementation.

**Preserved authorities:** artifact owner `MATCHING_RISK_POLICY` remains `Chief AI Architect + LEGAL`; Qualification semantic/artifact owner remains `Chief AI Architect + PRODUCT`; `XFR-D-055` keeps its independently approved interface roles; exact Risk→routing trigger `XFR-D-M2` remains owned by `AI + LEGAL`. This record transfers, merges or widens none of those authorities.

**Depends on:** `XFR-D-048 v1.0` (Risk multi-component representation and conditional non-compensation), `XFR-D-039 v1.0` (Architecture §25.1 → Qualification mapping governance), `XFR-D-040 v1.0` (Qualification multi-cause preservation and primary-reason rule), `XFR-D-055 v1.0` (Risk output → Qualification interface) and `XFR-D-077 v1.0` (user-facing safe reason/explanation catalog governance). `XFR-D-010`, `XFR-D-047`, `XFR-D-049`, `XFR-D-051`, `XFR-D-053`, `XFR-D-M2` and all exact operational contents remain independent `OPEN` dependencies.

---

## 1. Source/status discipline

The canonical identity is Inventory mapping `MRP-07 → XFR-D-052`, `PRIMARY_STANDALONE`, “Risk reason-reference namespace/values/process”. Before this record, `LeaseMind_MATCHING_RISK_POLICY_v0.1.md` §11 described stable machine-readable reason reference, Risk Policy version/hash and evidence reference only as `DECISION_CANDIDATE_FOR_REVIEW`; §13 row 7 left exact namespace, values, compatibility/change process and owner `OPEN_BLOCKED_PENDING_DECISION` with a candidate owner assignment.

Binding and approved neighboring boundaries are limited to the following:

- Architecture §25.1, §25.2 and §25.3 define three distinct internal reason families; they do not define a Risk reason-reference namespace or a mapping to it;
- Architecture §33 requires audit preservation of criteria, reasons, evidence states, policy versions, input/result hashes and related calculation context;
- Architecture §40 makes Matching Engine the single writer of Match calculation and forbids other services from rewriting scores, reasons or rule versions;
- Architecture §49 requires version/hash-bound reproducibility and immutable historical replay behavior; a replay creates a new audit event and does not mutate the historical Match Result;
- Architecture §52 keeps `MATCHING_RISK_POLICY` a controlled artifact with owner `Chief AI Architect + LEGAL`; missing or mismatched approved artifacts keep applicable gates blocked;
- `XFR-D-048` preserves multi-component Risk semantics and conditional non-compensation for separately classified critical categories;
- `XFR-D-039`, `XFR-D-040`, `XFR-D-055` and `XFR-D-077` govern separate Qualification mapping, primary-reason, interface and user-facing presentation questions and do not supply a Risk namespace or its values.

`LeaseMind_MATCHING_RISK_POLICY_v0.1.md` remains a Proposal. Its candidate wording is context for this human-approved narrow boundary, not an already approved exact namespace or artifact. Existing Data Contracts `reason_code` fields belong to structurally different post-Match owner-specific event namespaces and are not authority for a Risk reason-reference namespace or carrier.

## 2. Вопрос

Какая минимальная qualitative governance boundary применяется к будущим Risk reason references, если exact namespace, values, mapping, compatibility/change process, runtime representation and carrier ещё не утверждены?

## 3. Решение

### 3.1. Authority boundary

1. Governance owner этого decision-specific qualitative boundary — `Chief AI Architect + AI`.
2. Mandatory approvers — `PRODUCT + LEGAL + DEVELOPMENT`.
3. Evidence/technical-procedure owner — `AI + DEVELOPMENT`, без unilateral approval.
4. Governance owner не заменяет artifact owner `MATCHING_RISK_POLICY` (`Chief AI Architect + LEGAL`) и не приобретает единоличное право утвердить Risk Policy.
5. Qualification owner `Chief AI Architect + PRODUCT`, independently approved roles `XFR-D-055` и owner `AI + LEGAL` для `XFR-D-M2` не изменяются.
6. Reviewer, AI, DEVELOPMENT, transport producer или consumer не создаёт новое значение, mapping или policy rule в ходе отдельного кейса.

### 3.2. Internal opaque reference and namespace separation

1. Будущая Risk reason reference является internal opaque reference к отдельно approved Risk reason meaning and provenance. Она не является автоматически category, severity, score, threshold, verdict, route, public label или user-facing text.
2. Risk reason reference остаётся distinct от:
   - Risk category/severity language Architecture §17 и Risk Policy;
   - Architecture §25.1 algorithmic, §25.2 process and §25.3 human reason families;
   - Hard Constraint reason-code catalog under `XFR-D-010`;
   - Qualification reasons/results and mapping under `XFR-D-039`;
   - motivated reviewer/legal outcome and Decision Record under `XFR-D-053`;
   - user-facing reason/explanation catalog and wording under `XFR-D-077`.
3. Equality of strings, tokens, prefixes, suffixes, labels or similar wording does not create identity, alias, mapping, compatibility or display authorization between these namespaces.
4. Existing post-Match Data Contracts `reason_code` values are not imported, reused or treated as Risk reason-reference values by implication.
5. A Risk reference never authorizes Qualification routing, a legal conclusion, presentation, disclosure, production use or a governance-gate transition by its existence alone.

### 3.3. Separately approved, version/hash-bound future use

1. A future Risk reason reference may be used only when its meaning and applicability have been separately approved for the applicable Risk Policy version.
2. Any future usable reference must remain bound to identifiable Risk Policy version/hash, source/evidence references and original calculation/result provenance.
3. Presence of a string, hash-shaped value, schema-valid field, successful transport, prior approval of another version or semantic similarity does not prove current compatibility.
4. Historical Risk result and its original reason/evidence/policy/calculation bundle remain immutable. A new meaning, changed scope or changed policy interpretation requires a new approved version and a new calculation; an old reference is never silently reinterpreted or rewritten.
5. These are qualitative requirements only. Exact fields, hash composition, serialization, compatibility matrix, versioning scheme, change classification, supersession and migration remain `OPEN`.

### 3.4. Fail-closed reference eligibility

A missing, unknown, unmapped, ambiguous, conflicting, stale, version-incompatible, hash-incompatible or scope-incompatible Risk reason reference:

1. is not a valid approved reason reference for downstream use;
2. is not guessed, generated, coerced, aliased or replaced by the “closest” value;
3. is not treated as clean, zero-risk, low-risk or benign evidence;
4. does not become a negative fact, confirmed violation, sanction, legal conclusion or reviewer outcome;
5. does not create or select a Qualification result or route and is not displayed as user-facing wording;
6. does not mutate, delete or relabel the underlying historical Risk result, component evidence or audit causes;
7. cannot authorize presentation, disclosure, production use, Policy change or runtime change;
8. requires future approved handling under `XFR-D-051` and `XFR-D-055`; exact blocked unit, route, retry, review, fallback and cascade granularity remain `OPEN`.

Fail closed here means only that an invalid or unapproved reference cannot be consumed as a valid reference or authorization. It does not invent a replacement Risk value, runtime status, fifth Qualification result or blanket outcome.

### 3.5. Multi-component preservation and non-compensation

1. `XFR-D-048` remains binding: all applicable Risk components and evidence remain visible and separately classified critical components are not hidden or compensated by benign components.
2. A single reason reference, summary, score or transport state cannot erase, average, replace or obscure underlying Risk components and evidence.
3. Other valid references, benign components, a high Match/Confidence/Priority value, successful schema validation, replay, CI, prior routing or synthetic evidence cannot compensate for an invalid/unapproved required Risk reason reference.
4. This record does not classify a component as critical and does not approve aggregation, weighting, thresholds, evidence sufficiency or numeric non-compensation rules.

### 3.6. Evidence is prerequisite, not authorization

1. Evidence eligibility, provenance, reproducibility and technical feasibility are prerequisites for a future exact namespace/value decision, not substitutes for governance approval.
2. Synthetic-only evidence does not establish a production namespace, production-safe mapping or production readiness.
3. Successful test, replay, CI, merge, commit, schema validation or transport does not approve a namespace, value, mapping, Policy, carrier or production use.
4. Evaluation output does not update reason values, Risk Policy, Qualification Policy, mapping or runtime rules automatically.
5. Any exact namespace/value/compatibility resolution requires a new versioned human decision with immutable evidence references and the complete owner/approver set.

### 3.7. Partial, never fully resolved

`XFR-D-052` remains `PARTIALLY_RESOLVED_BOUNDARY`: only authority roles, namespace separation, opaque-reference discipline, separately approved version/hash/provenance-bound use, immutable-history/new-version-new-calculation discipline, fail-closed reference eligibility, preservation of `XFR-D-048` and prerequisite-not-authorization semantics are approved.

All exact contents in §5 remain `OPEN`. A future exact resolution requires a new versioned `XFR-D-052` record with an explicit `supersedes` reference; it cannot be introduced by Policy sync, catalog edit, schema/carrier default, manifest entry or implementation.

## 4. Layer/boundary table

| Layer | Authority | Approved here | Remains `OPEN` |
|---|---|---|---|
| Architecture §25 families | Architecture (`SOURCE_NORMATIVE`) | Three families remain distinct; no implicit alias | Any explicit relationship to Risk references |
| Risk artifact | `Chief AI Architect + LEGAL` | Existing authority preserved | Actual Risk Policy approval and contents |
| XFR-D-052 governance | `Chief AI Architect + AI`; approvers `PRODUCT + LEGAL + DEVELOPMENT` | Roles, separation, provenance and fail-closed boundary | Exact namespace, values, mappings and compatibility |
| Evidence/technical procedure | `AI + DEVELOPMENT` | Candidate/evidence preparation only | Evidence package and verdict |
| Risk aggregation/components | `XFR-D-048` | Multi-component/non-compensation preserved | Exact classifications, formula and runtime representation |
| Risk output representation | `XFR-D-047` | No representation chosen | Fields, enum, schema and carrier |
| Evidence sufficiency | `XFR-D-049` | No evidence threshold chosen | Per-factor rules and actual evidence |
| Missing/conflicting/stale operations | `XFR-D-051` | Invalid reference is not usable or authorization | Exact status, block/retry/review/cascade behavior |
| Reviewer/Decision Record | `XFR-D-053`; Legal/Decision Service writer | No reason reference becomes legal outcome | Queue, authority link, appointments and carrier |
| Qualification mapping | `XFR-D-039`; interface `XFR-D-055` | No implicit mapping/route | Mapping values/cardinality and exact route behavior |
| Risk→routing trigger | `XFR-D-M2`, owner `AI + LEGAL` | Authority preserved | Qualitative/numeric trigger and threshold |
| Hard Constraint catalog | `XFR-D-010` | Independent and untouched | Namespace, values and mapping |
| Qualification multi-cause/primary reason | `XFR-D-040` | All causes preserved; no replacement | Same-class/catalog ordering |
| User-facing explanation | `XFR-D-077` | Direct Risk-reference display prohibited without separate approved mapping/catalog entry | Namespace, values, wording, locale and audience |
| Runtime/Data Contracts | Separate downstream approval | Existing post-Match codes are not imported | Schema, API, DB, events, topology and deployment |

## 5. Что остаётся `OPEN`

- namespace name, prefix and identifier format;
- codes, values, enum, catalog and exhaustiveness;
- Risk factor/category coverage, granularity and mapping cardinality;
- ordering, priority, severity and criticality classification;
- aliases and every mapping to Architecture §25.1/§25.2/§25.3, `XFR-D-010`, `XFR-D-039`, Qualification results/routes or `XFR-D-077`;
- versioning scheme, compatibility matrix, change classification, deprecation, supersession, migration and rollback;
- fallback behavior, retry/review flow, TTL, freshness/invalidation and cascade granularity;
- exact version/hash fields, hash composition, signature and serialization mechanics;
- `XFR-D-047` Risk output representation, identifiers, fields and enums;
- `XFR-D-049` per-factor evidence sufficiency and critical-category classification;
- `XFR-D-051` exact Risk-specific missing/conflicting/stale operational behavior;
- `XFR-D-053` reviewer authority, queue, appointment and Decision Record linkage per Risk class;
- `XFR-D-055` exact Risk→Qualification input bundle, mapping and route choice;
- `XFR-D-M2` qualitative/numeric trigger or threshold;
- schema, carrier, API, DB, event, storage, producer/consumer topology and error catalog;
- datasets, evidence manifests, evaluation procedure, tests, runs, results, statistics and verdicts;
- named appointments, RBAC, signatures and approval carrier;
- actual approval of Risk Policy, Qualification Policy, Safe Presentation Policy, Data Contracts extension, Controlled Artifact Manifest entry or any other controlled artifact;
- production-data use, monitoring, model/policy release, deployment, runtime and implementation.

None of these open contents is implied by the qualitative requirements in §3.

## 6. Explicit non-conflations

1. `XFR-D-052` Risk reason reference ≠ Architecture §25.1, §25.2 or §25.3 reason family.
2. `XFR-D-052` ≠ Architecture §17 Risk category, severity, score, band or threshold.
3. `XFR-D-052` ≠ `XFR-D-010` Hard Constraint reason-code catalog.
4. `XFR-D-052` ≠ `XFR-D-039` Qualification mapping, reason or result.
5. `XFR-D-052` ≠ `XFR-D-040` multi-cause preservation or primary-reason ordering.
6. `XFR-D-052` ≠ `XFR-D-047` runtime Risk representation or carrier.
7. `XFR-D-052` ≠ `XFR-D-049` evidence sufficiency.
8. `XFR-D-052` ≠ `XFR-D-051` exact missing/conflicting/stale operational mechanics.
9. `XFR-D-052` ≠ `XFR-D-053` reviewer authority, queue or motivated legal Decision Record.
10. `XFR-D-052` ≠ `XFR-D-055` Risk→Qualification interface, route or trigger.
11. `XFR-D-052` ≠ `XFR-D-077` user-facing safe reason/explanation catalog or wording.
12. `XFR-D-052` does not reopen or weaken `XFR-D-048` multi-component/non-compensation semantics.
13. Existing Data Contracts post-Match `reason_code` enums ≠ approved Risk reason-reference namespace or values.

## 7. Rationale

Risk Policy needs stable provenance for explainability, but repository sources deliberately leave the namespace, values and compatibility process open. Approving concrete identifiers now would invent content without evidence and could silently collapse Risk components, Qualification routes, Hard Constraint codes, legal outcomes and user-facing text into one ambiguous namespace.

The narrow boundary permits controlled owner review while preserving source authority: Risk references may later point to approved meanings, but they cannot create those meanings, routes or presentation permissions. Version/hash binding and immutable history prevent semantic drift; fail-closed handling prevents guessed aliases and benign defaults; `XFR-D-048` prevents a summary reference from hiding component-level risk evidence.

## 8. Adversarial cases

1. **Post-Match Data Contracts code imported.** An existing owner-specific invalidation `reason_code` is reused as a Risk value. Prohibited: different namespace and authority.
2. **Architecture §25 token collision.** A future Risk value equals a §25.1 token and is treated as identical. Prohibited: equality does not create identity or mapping.
3. **Similar wording becomes alias.** Operator or AI maps two labels because they “mean the same”. Prohibited without separately approved mapping.
4. **Qualitative phrase becomes enum.** “High” or “critical” is treated as an approved Risk code, severity or threshold. Prohibited: exact values and classification remain `OPEN`.
5. **Missing reference defaults to low.** Consumer treats absence as clean/benign. Prohibited: invalid reference is not authorization.
6. **Historical meaning mutates.** Catalog text changes while an old reference is reinterpreted under the new meaning. Prohibited: original bundle remains immutable; changed meaning requires new version and calculation.
7. **One summary erases components.** A reason reference replaces several component reasons/evidence. Prohibited by `XFR-D-048` preservation.
8. **Direct user display.** Internal Risk reference is rendered as explanation. Prohibited without separately approved `XFR-D-077` mapping/catalog entry.
9. **Transport success proves compatibility.** Schema validation or delivery is treated as semantic approval. Prohibited: exact compatibility and carrier remain `OPEN`.
10. **AI/operator invents fallback code.** Unknown reference is replaced with generated free text or nearest value. Prohibited by fail-closed separation.
11. **Synthetic pass enables production.** Synthetic evidence is cited as approval for production namespace or mapping. Prohibited: evidence is prerequisite, not authorization.
12. **Risk reference writes Qualification route.** Presence of a reference directly selects `HUMAN_REVIEW_REQUIRED`, `NEEDS_VERIFICATION` or another result. Prohibited: `XFR-D-055` and `XFR-D-M2` remain independent.
13. **Risk reference becomes legal verdict.** Reference is treated as confirmed violation or motivated Decision Record. Prohibited: `XFR-D-053` and Legal/Decision Service authority remain separate.
14. **Benign evidence compensates invalid reference.** High Match/Confidence or other benign components allow use of an invalid required reference. Prohibited: no compensation or authorization by unrelated success.

## 9. Затронутые артефакты (future separate sync)

- `LeaseMind_MATCHING_RISK_POLICY_v0.1.md` — §11, §13 row 7, readiness/acceptance may receive this partial governance boundary while all exact namespace/value/mapping/runtime contents remain `OPEN`;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — a later separate overlay may record `MRP-07 → XFR-D-052` without rewriting historical Wave 2E checkpoints; the known §7 historical-status hygiene must be corrected only in that separately authorized sync;
- future Risk/Qualification/Safe Presentation/Data Contracts/evidence/runtime artifacts — separate decisions and approval passes.

No future sync may interpret this record as an approved namespace, prefix, code, value, enum, severity, mapping, alias, order, compatibility matrix, carrier, Risk/Qualification/Safe Presentation Policy approval, dataset, evidence verdict, production-data sufficiency, runtime design or implementation authorization.

## 10. Change control

Any change to the authority split, namespace separation, opaque-reference discipline, version/hash/provenance binding, immutable-history rule, fail-closed behavior, `XFR-D-048` preservation or explicit non-conflations requires a new versioned `XFR-D-052` decision record, agreed by `Chief AI Architect + AI + PRODUCT + LEGAL + DEVELOPMENT`, with an explicit `supersedes` reference.

Exact namespace/value/mapping/compatibility contents require their own future approved decision and cannot be introduced as an unversioned edit to this record.

## 11. Gate impact

`NONE`.

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**

This record does not approve Risk Policy, Qualification Policy, Safe Presentation Policy, Data Contracts, any dataset/evaluation run, production data, runtime or implementation.

## 12. Acceptance criteria

1. **Given** canonical identity, **when** the record is indexed, **then** it remains `MRP-07 → XFR-D-052`, `PRIMARY_STANDALONE`.
2. **Given** governance roles, **when** authority is checked, **then** owner is `Chief AI Architect + AI`, mandatory approvers are `PRODUCT + LEGAL + DEVELOPMENT`, and `AI + DEVELOPMENT` evidence/technical role has no unilateral approval.
3. **Given** artifact and neighboring authorities, **when** this record is applied, **then** Risk owner `Chief AI Architect + LEGAL`, Qualification owner `Chief AI Architect + PRODUCT`, `XFR-D-055` roles and `XFR-D-M2` owner `AI + LEGAL` remain unchanged.
4. **Given** Risk reference, **when** compared with Risk category/severity, §25.1/§25.2/§25.3, Hard Constraint, Qualification, reviewer/legal or user-facing namespaces, **then** every namespace remains distinct.
5. **Given** equal or similar strings/prefixes/wording, **when** mapping is requested, **then** no identity, alias, mapping, compatibility or display authorization is inferred.
6. **Given** a future usable reference, **when** eligibility is checked, **then** separate approval and binding to Risk Policy version/hash, source/evidence and original calculation/result provenance are required.
7. **Given** a historical result, **when** meaning or scope changes, **then** history is not rewritten; a new approved version and new calculation are required.
8. **Given** missing, unknown, unmapped, ambiguous, conflicting, stale, version/hash/scope-incompatible reference, **when** consumed, **then** it fails closed without clean/low default, guessed value, negative/legal fact, Qualification route, display or history mutation; exact operational behavior remains `OPEN` under `XFR-D-051`/`XFR-D-055`.
9. **Given** multiple Risk components, **when** reason references are recorded, **then** `XFR-D-048` preserves all components and separately classified critical evidence without compensation or erasure.
10. **Given** high Match/Confidence/Priority, valid unrelated evidence, schema/replay/CI success or synthetic evidence, **when** a required reference is invalid or unapproved, **then** none compensates for it or authorizes downstream use.
11. **Given** existing Data Contracts reason codes, **when** Risk namespace is considered, **then** no code, value, schema or carrier is imported by implication.
12. **Given** `XFR-D-010`, `XFR-D-039`, `XFR-D-040`, `XFR-D-047`–`XFR-D-051`, `XFR-D-053`, `XFR-D-055`, `XFR-D-M2` and `XFR-D-077`, **when** this record is applied, **then** none is reopened, absorbed or resolved by implication.
13. **Given** an exact namespace, code, value, mapping, ordering, severity, compatibility, TTL, hash field, schema, carrier, dataset, evidence verdict, RBAC, Policy, manifest, runtime or implementation, **when** approval is requested, **then** it remains `OPEN`.
14. **Given** this record, **when** Risk/Qualification/Safe Presentation/Data Contracts, production data, model/policy release or implementation status is checked, **then** none is approved or authorized.
15. **Given** the three governance gates, **when** their status is checked, **then** `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` all remain `BLOCKED`.

## 13. Итог

`XFR-D-052 PARTIALLY RESOLVED — QUALITATIVE RISK REASON-REFERENCE GOVERNANCE, NAMESPACE-SEPARATION, PROVENANCE AND FAIL-CLOSED BOUNDARY APPROVED; EXACT NAMESPACE, CODES, VALUES, MAPPINGS, ORDER, SEVERITY, COMPATIBILITY, CARRIER, POLICY, RUNTIME AND IMPLEMENTATION REMAIN OPEN/BLOCKED`
