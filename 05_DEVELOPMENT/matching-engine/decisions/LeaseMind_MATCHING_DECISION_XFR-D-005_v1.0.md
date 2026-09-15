# LeaseMind Matching Decision Record — XFR-D-005

**Decision ID:** `XFR-D-005`

**Название:** Time-bound feature TTL governance and evidence boundary

**Версия:** 1.0

**Дата решения:** 2026-09-15

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED SOURCE-AUTHORITY, FRESHNESS-CLASS-SEPARATION, EVIDENCE AND FAIL-CLOSED BOUNDARY — FEATURE APPLICABILITY, CLOCK, NUMERIC TTL, TRANSITIONS, DATA, POLICY, PRODUCTION, CARRIER, RUNTIME AND IMPLEMENTATION REMAIN OPEN`

**Decision authority:** explicit human project-governance confirmation on 2026-09-15.

**Repository baseline:** `ac2f02738c5949e0c234c81bcaefa4693504314f`

**Scope:** governance and qualitative evidence boundary for future numeric TTLs of per-value class-3 time-bound Matching features only. This record does not decide which fields are class 3, select any clock/start event, unit or value, import another lifecycle's TTL, approve an Evaluation/Feature/Risk Policy, or authorize production/runtime implementation.

**Canonical identity:** `FS-06 → XFR-D-005`, `PRIMARY_STANDALONE`; `MRP-14 → XFR-D-005`, `SECONDARY_BOUNDARY_REFERENCE` (`LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` §4.1/§4.3). The crosswalk and Inventory counts (102 source keys / 90 canonical IDs) remain unchanged.

**Governance owner:** `PRODUCT + LEGAL + AI` — preserved from Architecture §37 question №11, `SOURCE_NORMATIVE`, for the broader freshness-period question covering key premises, demand, authority and readiness signs. This record narrows its substantive scope to class-3 feature TTL and does not narrow or transfer that source authority.

**Mandatory approvers:** `Chief AI Architect + DEVELOPMENT`.

**Decision/evidence preparation:** Feature Schema row 6 candidate `PRODUCT + AI, via MATCHING_EVALUATION_PLAN` is preserved exactly as preparation responsibility, not promoted to a different source-normative owner. `DEVELOPMENT` may provide technical feasibility and reproducibility evidence only. Preparation and technical execution provide no unilateral approval authority.

**Depends on:** the five freshness classes in Feature Schema §8; `XFR-D-004`, `XFR-D-016`, `XFR-D-038`, `XFR-D-043`, `XFR-D-045`, `XFR-D-065`, `XFR-D-081`, `XFR-D-082`, and source-owned registry/invalidation lifecycles remain independent. No other TTL, expiry, cache or lease mechanism is absorbed or approved here.

---

## 1. Вопрос

Кто владеет будущими numeric TTL decisions для class-3 time-bound Matching features и какие source, evidence, freshness-class separation, non-compensation and fail-closed boundaries обязательны до выбора applicable fields, clock semantics and values?

## 2. Source/status discipline

1. Architecture §37 question №11 asks which freshness periods apply to key premises, demand, authority and readiness signs and assigns `PRODUCT + LEGAL + AI`; the question remains a calculation/launch blocker and contains no values.
2. Feature Schema §8 defines five candidate freshness classes. Only class 3 is time-bound (`observed_at`/`verified_at` plus TTL); §8 explicitly states that no numeric days/hours/minutes TTL exists in Architecture or PRODUCT sources. Feature Schema §10 row 6 assigns candidate preparation to `PRODUCT + AI, via MATCHING_EVALUATION_PLAN`.
3. Feature Schema class 1 revision-bound, class 2 event-invalidated, class 4 immutable evidence and class 5 external gate status have different authorities and semantics. Their invalidation or applicability rules cannot be converted to class-3 TTL by analogy.
4. Risk Policy `MRP-14` is a secondary reference and defers to Architecture §37 №11 and Feature Schema. It does not create a Risk-specific value or authority transfer.
5. Inventory indexes `FS-06` and `MRP-14` to canonical `XFR-D-005`; it does not approve content.

This record resolves only roles and qualitative governance/evidence safeguards. Numeric TTL and every exact mechanism remain `OPEN`.

## 3. Решение

### 3.1. Authority and approval split

1. Governance owner remains `PRODUCT + LEGAL + AI`, directly preserving Architecture §37 №11.
2. Mandatory approvers are `Chief AI Architect + DEVELOPMENT`.
3. `PRODUCT + AI` prepares the candidate decision/evidence through a future separately approved Evaluation procedure; `DEVELOPMENT` verifies technical feasibility and reproducibility.
4. Neither preparation role, artifact owner nor technical implementation may approve an actual TTL alone.
5. Every actual TTL requires all five functions on the same compatible version/hash, a new versioned `XFR-D-005` record and immutable evidence references.

### 3.2. Exact five-class separation

- **Class 1 — revision-bound:** source revision change invalidates the derived value; no separate TTL is invented here.
- **Class 2 — event-invalidated:** applicability ends on a separately governed domain event/status change; elapsed time is not substituted.
- **Class 3 — time-bound:** only this class is in scope for a future numeric TTL.
- **Class 4 — immutable evidence:** evidence history is not physically expired by a class-3 TTL, though separately governed applicability/status may change.
- **Class 5 — external gate status:** remains a current read-only source-owned projection, not a scoring feature or class-3 value.

This record neither assigns a field to a class nor changes any existing classification.

### 3.3. No imported or surrogate TTL

Reveal token/lease expiry, Introduction Record expiry, Safe Presentation cache TTL (`XFR-D-081`), carrier cache fields (`XFR-D-082`), Identity/Authority projection freshness (`XFR-D-004`), Lawful Basis invalidation (`XFR-D-016`), profile revision, event retention, Campaign duration, provider policy or operational timeout cannot be reused as class-3 feature TTL by analogy.

An observed update frequency, data age distribution, conventional duration, vendor default, prior system value or implementation convenience is not an approved TTL.

### 3.4. Evidence prerequisites without numeric approval

Before any actual value, the future candidate package must separately document at least:

1. feature/value identity, proposed freshness class, governed use and purpose;
2. source authority and why time-bound rather than revision/event/immutable/external-gate semantics applies;
3. candidate clock source, start event and measurement semantics;
4. source update/verification behavior and invalidation dependencies;
5. baseline observed before candidate search;
6. immutable frozen manifest and tuning/untouched-final isolation;
7. uncertainty, stale-versus-current error costs, false-eligibility and false-exclusion counter-evidence;
8. applicable segment/intersection and LEGAL review;
9. explicit synthetic-only versus production applicability statement;
10. version/hash compatibility, reproducibility and complete owner/approver verdict.

These are required categories only. No field, definition, metric, dataset, statistic, value or production verdict is approved.

### 3.5. Non-compensation

High Match/Confidence/Priority Score, low Risk, Qualification, ranking quality, recent cache generation, successful source read, business urgency, aggregate performance or synthetic test cannot compensate for missing, expired, stale, conflicting, unapproved or incompatible class-3 freshness material.

Evidence for one feature, use, purpose, segment or time period cannot silently authorize another. A longer/shorter TTL elsewhere is not evidence for this decision.

### 3.6. Fail-closed handling

Missing, unknown, unapproved, stale, expired, revoked, invalidated, conflicting or version-incompatible classification/TTL/evidence blocks only the affected governed use that requires current time-bound evidence. It does not become a negative fact, guessed failure, zero score, failed Hard Constraint, automatic `INELIGIBLE`, rejection, route, Risk result or unrelated processing block.

Whether the affected future behavior blocks a value, calculation, Qualification progression or another explicitly governed scope remains `OPEN`; this record does not select cascade granularity.

### 3.7. Historical and version integrity

Expiry never rewrites historical values, source events, evidence or previously recorded calculations. Historical record remains bound to the original versions/hashes and timestamps. Current actionability requires a separately approved compatible current bundle; `XFR-D-038`/`XFR-D-043` remain independent.

### 3.8. No automatic action

Evaluation result, data refresh, expiry, code, CI, documentation, commit or merge cannot automatically select/change a TTL, reclassify a field, promote a source, change policy/model/routing/runtime, establish production applicability or advance a gate.

### 3.9. Partial, never fully resolved

`XFR-D-005` receives only `PARTIALLY_RESOLVED_BOUNDARY`: source authority, approval split, five-class separation, no-import/no-surrogate rule, evidence categories, non-compensation, affected-use fail closed, historical integrity and no-automatic-action are approved. Feature applicability, clock and every numeric/mechanical downstream detail remain `OPEN`.

## 4. Layer/authority table

| Layer | Authority | Resolved here | Remains `OPEN` |
|---|---|---|---|
| Broad freshness question | Architecture §37 №11 | `PRODUCT + LEGAL + AI` preserved | Exact periods/mechanics |
| Canonical identity | Inventory | `FS-06` primary; `MRP-14` secondary, unchanged | Future overlay only |
| Candidate preparation | Feature Schema row 6 | `PRODUCT + AI` via Evaluation preserved as candidate responsibility | Exact procedure/evidence |
| Five freshness classes | Feature Schema §8 | Separation preserved | Field assignments and operational semantics |
| Class-3 TTL | Future `XFR-D-005` version | No value selected | Field/use, clock, unit, value, transition, cascade |
| External registries/cache/reveal | Their source/sibling authorities | Explicitly not imported | Their own OPEN mechanics |
| Policy/production/runtime | Controlled artifacts and gates | No authorization | All exact contents |

## 5. Что остаётся `OPEN`

- feature/value universe and class-3 applicability by source, use, purpose, segment and lifecycle;
- time source, clock, start event (`observed_at`, `verified_at` or other), stop/pause/reset behavior and time-zone/clock-skew handling;
- unit, numeric value, range, minimum/maximum, precision, rounding, tolerance, grace and equality boundary;
- global/per-field/per-source/per-purpose/per-segment rules and precedence;
- refresh, revalidation, extension, expiry, invalidation, revocation, conflict and recovery semantics;
- stale/expired state representation and cascade granularity;
- metric definitions, numerator/denominator/counting unit, baseline/target, sample/split, confidence interval, window, statistical test and uncertainty method;
- dataset, evaluation procedure/run, evidence package, results, verdict and production-data applicability;
- policy/manifest approval, appointments/RBAC/quorum/appeal;
- API/event/DB/schema/carrier/cache, monitoring, rollout, runtime and implementation.

## 6. Rationale

The source intentionally assigns cross-functional authority while leaving every duration open. Preserving the five classes prevents an operational cache or token expiry from becoming a feature-validity rule. Evidence and affected-use fail closed allow later safe measurement without turning missing governance into a guessed negative or permissive default.

## 7. Adversarial cases

1. A cache TTL or Reveal token expiry is copied into Feature Schema — rejected as a different lifecycle.
2. Revision-bound or event-invalidated data receives a time TTL by convenience — rejected without explicit class assignment.
3. Immutable evidence is deleted or treated false after elapsed time — rejected; history and applicability are separate.
4. External gate status is treated as a cached scoring feature — rejected.
5. A conventional duration or update frequency becomes the value — rejected as surrogate.
6. Missing TTL becomes zero, negative fact, automatic rejection or permissive unlimited validity — rejected.
7. Aggregate performance compensates for stale affected evidence — rejected.
8. PRODUCT+AI preparation or DEVELOPMENT implementation approves the value alone — rejected without full authority.

## 8. Future separate sync only

- Feature Schema may later receive only the approved role/status/class-separation overlay for row 6.
- Risk Policy may preserve `MRP-14` as a secondary deferral to the same canonical decision.
- Evaluation Plan may later define an evidence procedure only through a separate approval.
- Inventory may later record provenance without changing identity/counts.

No sync is performed by this record. Feature Schema, Risk/Evaluation/Qualification/Scoring/Safe Presentation Policies, Inventory, Data Contracts, manifests, sibling records, runtime and code remain untouched.

## 9. Change control

Any change to authority, approval roles, class separation, no-import/no-surrogate, evidence categories, non-compensation, fail-closed handling, historical integrity, dependencies or no-automatic-action requires a new versioned record with `supersedes`, approved by `Chief AI Architect + PRODUCT + LEGAL + AI + DEVELOPMENT` on the same version/hash. Exact TTL/data/policy/runtime decisions require separate evidence-backed approval.

## 10. Gate impact

`NONE`.

`IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` remain `BLOCKED`.

No Proposal, Policy, Data Contract, dataset/run/result, production-data use, manifest, runtime, release or implementation is approved.

## 11. Acceptance criteria

1. Governance owner remains source-normative `PRODUCT + LEGAL + AI`; mandatory approvers are `Chief AI Architect + DEVELOPMENT`; preparation `PRODUCT + AI` via Evaluation and DEVELOPMENT technical work grant no unilateral approval.
2. `FS-06 → XFR-D-005` remains primary, `MRP-14 → XFR-D-005` remains secondary, and 102/90 counts remain unchanged.
3. Five freshness classes remain distinct; only class 3 is within future numeric TTL scope.
4. No field applicability, clock, unit, numeric value, tolerance, metric, dataset, statistic or mechanism is approved.
5. No cache, Reveal, registry, profile-revision, operational or vendor TTL is imported or used as surrogate.
6. Missing/incompatible material blocks only affected use without negative coercion, guessed route or permissive unlimited validity.
7. Named sibling decisions and source lifecycles remain independent.
8. Evidence cannot automatically change policy, production, runtime or gates.
9. All three governance gates remain `BLOCKED`.

## 12. Итог

`XFR-D-005 PARTIALLY_RESOLVED_BOUNDARY — SOURCE AUTHORITY, APPROVAL SPLIT, FIVE-CLASS SEPARATION, EVIDENCE PREREQUISITES, NO-IMPORT/NO-SURROGATE, NON-COMPENSATION, AFFECTED-USE FAIL-CLOSED, HISTORY AND NO-AUTOMATIC-ACTION APPROVED; FEATURE APPLICABILITY, CLOCK, NUMERIC TTL, TRANSITIONS, DATA, POLICY, PRODUCTION, CARRIER, RUNTIME AND IMPLEMENTATION REMAIN OPEN/BLOCKED`
