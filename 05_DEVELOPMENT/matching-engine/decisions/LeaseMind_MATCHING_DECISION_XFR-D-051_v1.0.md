# LeaseMind Matching Decision Record — XFR-D-051

**Decision ID:** `XFR-D-051`

**Название:** Risk missing/conflicting/stale operational-semantics governance boundary

**Версия:** 1.0

**Дата решения:** 2026-09-14

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED QUALITATIVE PRESERVATION OF DISTINCT ARCHITECTURE §32 MISSING/CONFLICTING/STALE BEHAVIORS — EXACT RISK STATES, MAPPINGS, BLOCKED UNIT, CASCADE, ROUTE, PRECEDENCE, RETRY, TTL, REVIEWER/RBAC, SCHEMA, CARRIER AND RUNTIME REMAIN OPEN`

**Decision authority:** human project-governance confirmation on 2026-09-14

**Repository baseline:** `ac1191324dc88149764679583e434eeac7bc9281`

**Canonical identity:** `MRP-06 → XFR-D-051`, `PRIMARY_STANDALONE` (Inventory §4.3). Canonical mapping and Inventory counts remain unchanged at 102 source keys / 90 canonical IDs.

**Scope:** qualitative Risk-specific preservation of the three distinct Architecture §32 source behaviors for missing/unknown, conflicting and stale material. It does not define a universal Risk state, Qualification route, cascade, TTL, reviewer workflow or runtime carrier.

**Governance owner:** `AI + DEVELOPMENT` — human-approved assignment derived from Risk Policy §13 row 6; it is not claimed as `SOURCE_NORMATIVE`.

**Risk Policy artifact owner:** `Chief AI Architect + LEGAL` — source-normative under Architecture §52 and separate from decision-specific governance.

**Mandatory approvers:** `Chief AI Architect + PRODUCT + LEGAL`.

**Evidence/technical-procedure owner:** `AI + DEVELOPMENT`; this role may prepare operational candidates/evidence but has no unilateral authority to define route, reviewer consequence, policy/runtime/production/implementation or a gate.

**Depends on and preserves:** Architecture §32; `XFR-D-033` Qualification precedence, `XFR-D-038` orthogonal Match `STALE`, `XFR-D-040` multi-cause preservation, `XFR-D-047` representation, `XFR-D-048` multi-component/non-compensation, `XFR-D-049` evidence sufficiency, `XFR-D-052` reason reference, `XFR-D-053` reviewer authority, `XFR-D-055` Risk→Qualification interface and `XFR-D-M2` trigger boundary remain independent.

---

## 1. Вопрос

Какие qualitative Risk-specific operational boundaries preserve Architecture §32 when source/evidence is missing/unknown, conflicting or stale?

## 2. Source/status discipline

1. Inventory indexes `MRP-06 → XFR-D-051`, `PRIMARY_STANDALONE`; indexing is not approval.
2. Architecture §32 is source-normative and states three distinct behaviors: missing data → `NEEDS_VERIFICATION`, unknown is not negative; conflicts → versions preserved, Confidence reduced, human review when critical; stale profile → Match becomes `STALE` and disclosure is prohibited.
3. Architecture does not define a Risk-specific runtime enum, universal route, blocked-unit granularity, cascade, TTL or retry behavior for this decision.
4. Risk Policy is a Proposal and may not convert its candidate mappings into runtime behavior.

## 3. Решение

### 3.1. Authority split

1. Governance owner is `AI + DEVELOPMENT`, candidate-derived and not `SOURCE_NORMATIVE`.
2. Mandatory approvers are `Chief AI Architect + PRODUCT + LEGAL`.
3. Risk Policy artifact owner remains `Chief AI Architect + LEGAL`.
4. Evidence/technical-procedure owner is `AI + DEVELOPMENT`, without unilateral authority.
5. Future exact content requires all five functions to approve the same immutable version/hash and evidence package.

### 3.2. Missing/unknown behavior preserved

1. Missing/unknown material follows Architecture §32: `NEEDS_VERIFICATION`; unknown is not a negative fact.
2. It does not become clean/low/zero/default Risk, a violation, failed factor, rejection or automatic `INELIGIBLE`.
3. `NEEDS_VERIFICATION` here preserves the source behavior; this record does not define a universal Risk→Qualification mapping or route.
4. Exact affected factor/use, blocking granularity, status carrier and recovery remain `OPEN`.

### 3.3. Conflicting behavior preserved

1. Conflicting source versions remain preserved and separately attributable; no version is overwritten or selected automatically.
2. Confidence is reduced as required by Architecture §32, without inventing a numeric decrement, formula or threshold.
3. Human review applies only when criticality is independently established by an approved rule; this record classifies no factor/category/conflict as critical.
4. Conflict does not automatically become negative fact, Risk severity, Qualification route, rejection, `INELIGIBLE` or legal conclusion.

### 3.4. Stale behavior preserved without weakening

1. Where the Architecture §32 stale-profile rule applies, the whole affected Match becomes `STALE` and disclosure is prohibited.
2. A narrower affected-factor/use fail-closed formulation must never weaken, localize away or bypass this whole-affected-Match no-disclosure rule.
3. `STALE` is an orthogonal Match state under `XFR-D-038`, not a fifth Qualification result.
4. `STALE` does not automatically assign Qualification `NEEDS_VERIFICATION` or any other Qualification route.
5. Exact TTL, freshness trigger, invalidation, retry, recovery and re-evaluation remain `OPEN`.

### 3.5. No collapse, default or universal route

1. Missing/unknown, conflicting and stale remain three distinct source behaviors; they are not collapsed into one Risk state or flag.
2. None supplies a default Risk value, severity, score or universal routing outcome.
3. Risk alone never creates `QUALIFIED_HYPOTHESIS` or `REJECTED_BY_MATCHING` under `XFR-D-055`.
4. Exact Risk→Qualification mapping/trigger remains separately `OPEN` under `XFR-D-055`/`XFR-D-M2`.
5. `XFR-D-033` precedence and `XFR-D-040` multi-cause preservation are not reopened or rewritten.

### 3.6. Fail-closed and no adverse inference

Unavailable, conflicting, stale or incompatible material blocks only the affected governed progression except where Architecture explicitly requires the broader stale-Match/no-disclosure effect. It creates no guessed clean/low/negative Risk, violation, route, reason, rejection, `INELIGIBLE`, legal conclusion or automatic policy/runtime change.

Exact blocked unit, cascade and operational behavior remain `OPEN`.

### 3.7. Partial, never full resolution

`XFR-D-051` receives `PARTIALLY_RESOLVED_BOUNDARY`: role separation, exact preservation and non-collapse of Architecture §32 behaviors, conditional-critical conflict review, whole-affected-Match stale/no-disclosure protection, orthogonal `STALE`, no default/universal route and fail-closed/no-adverse-inference safeguards are approved qualitatively.

All exact Risk states, mappings, blocked unit, cascade, route, precedence, retry, TTL, reviewer/RBAC, schema, carrier, runtime and implementation contents remain `OPEN`.

## 4. Layer and authority table

| Layer | Preserved authority | Approved here | Remains `OPEN` |
|---|---|---|---|
| Canonical identity | Inventory §4.3 | `MRP-06 → XFR-D-051`, `PRIMARY_STANDALONE` | Future status overlay |
| Governance | `AI + DEVELOPMENT`; approvers `Chief AI Architect + PRODUCT + LEGAL` | Qualitative boundary | Exact operational verdicts |
| Risk Policy artifact | `Chief AI Architect + LEGAL` | No artifact approval | Policy approval |
| Source behavior | Architecture §32 | Three behaviors preserved | Risk-specific mapping/carrier |
| Match `STALE` | Architecture §32, `XFR-D-038` | Whole affected Match/no disclosure preserved | TTL/recovery/re-evaluation |
| Qualification | `XFR-D-033`/`038`/`040`/`055`/`M2` | No automatic route | Exact trigger/mapping/precedence operation |
| Evidence/reviewer | `XFR-D-049`/`053` | Conditional critical-review boundary preserved | Criticality/RBAC/workflow |
| Runtime/production/gates | Separate authorities | No authorization | Schema/carrier/implementation/release |

## 5. Обязательные non-conflations

1. Missing/unknown ≠ negative fact.
2. Conflicting ≠ automatically critical or adverse.
3. Stale ≠ missing/unknown or conflict.
4. Match `STALE` ≠ fifth Qualification result.
5. Architecture `NEEDS_VERIFICATION` behavior ≠ approved universal Qualification route.
6. Reduced Confidence ≠ numeric decrement or Risk score.
7. Risk behavior ≠ `QUALIFIED_HYPOTHESIS`/`REJECTED_BY_MATCHING` authority.
8. Affected-use fail-closed ≠ weakening the whole-affected-Match stale/no-disclosure rule.

## 6. Что остаётся `OPEN`

- exact Risk states/enums and per-category mappings;
- exact affected factor/use/Match blocked unit and cascade granularity;
- Risk→Qualification trigger, mapping, route and precedence operationalization;
- conflict criticality and human-review criteria;
- numeric Confidence/Risk effect, formula or threshold;
- freshness TTL, invalidation, retry, recovery and re-evaluation;
- reviewer appointment/RBAC/quorum/queue/SLA;
- reason mappings, schema/API/event/DB/storage/carrier/runtime behavior;
- data/evidence/policy/production/implementation and gates.

## 7. Rationale

Architecture deliberately assigns different safe outcomes to missing, conflict and stale conditions. Preserving those distinctions avoids both adverse inference and an unsafe weakening of stale Match disclosure protection while deferring all operational mapping to evidence-backed decisions.

## 8. Adversarial cases

1. **Missing evidence becomes low Risk.** Rejected: unknown is not negative or clean.
2. **One conflicting version overwrites another.** Rejected: versions remain preserved.
3. **Every conflict triggers human review.** Rejected: source rule requires independently established criticality.
4. **Staleness blocks only one component while the Match is disclosed.** Rejected: applicable stale profile makes the whole affected Match `STALE`; no disclosure.
5. **`STALE` becomes a fifth Qualification result.** Rejected.
6. **`NEEDS_VERIFICATION` is automatically written as Qualification route.** Rejected: exact interface remains open.
7. **Risk alone rejects or qualifies a pair.** Rejected under `XFR-D-055`.

## 9. Затронутые артефакты — future separate sync only

- Risk Policy and Inventory may later receive a status overlay preserving exact operational contents `OPEN`.
- No Proposal, Policy, Data Contract, dataset, Evaluation Plan, manifest, sibling record, runtime or code is changed here.

No sync is performed by this record. Risk Policy, Inventory, other Policies, manifests, Data Contracts, sibling records, runtime and application code remain untouched.

## 10. Change control

Any change to this qualitative boundary requires a new versioned `XFR-D-051` record with `supersedes`, approved by all five functions on the same immutable version/hash: `AI + DEVELOPMENT` and `Chief AI Architect + PRODUCT + LEGAL`.

## 11. Gate impact

`NONE`.

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**.
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**.
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**.

This record approves no Proposal, Policy, Data Contract, dataset, Evaluation Plan/run/result, production-data use, manifest, runtime, implementation or release.

## 12. Acceptance criteria

1. Canonical identity is `MRP-06 → XFR-D-051`, `PRIMARY_STANDALONE`; counts remain 102/90.
2. Roles match the header and evidence ownership is non-unilateral.
3. Missing/unknown → `NEEDS_VERIFICATION` and never negative/default.
4. Conflicts preserve versions, reduce Confidence without invented number, and require human review only if independently critical.
5. Applicable stale profile makes the whole affected Match `STALE` and prohibits disclosure.
6. Affected-use-only language never weakens the stale whole-Match rule.
7. `STALE` is orthogonal, not a fifth Qualification result or automatic Qualification `NEEDS_VERIFICATION`.
8. Risk alone creates neither `QUALIFIED_HYPOTHESIS` nor `REJECTED_BY_MATCHING`.
9. Exact states/mappings/cascade/route/TTL/reviewer/carrier/runtime remain `OPEN`; all gates remain `BLOCKED`.

## 13. Итог

`XFR-D-051 PARTIALLY_RESOLVED_BOUNDARY — ARCHITECTURE §32 MISSING/UNKNOWN, CONFLICTING AND STALE BEHAVIORS REMAIN DISTINCT: UNKNOWN IS NOT NEGATIVE; CONFLICTING VERSIONS ARE PRESERVED WITH NON-NUMERIC CONFIDENCE REDUCTION AND REVIEW ONLY WHEN INDEPENDENTLY CRITICAL; APPLICABLE STALE PROFILE MAKES THE WHOLE AFFECTED MATCH STALE AND PROHIBITS DISCLOSURE; STALE IS ORTHOGONAL, NOT A QUALIFICATION RESULT; NO DEFAULT RISK OR UNIVERSAL ROUTE IS APPROVED; ALL EXACT OPERATIONAL CONTENT REMAINS OPEN`
