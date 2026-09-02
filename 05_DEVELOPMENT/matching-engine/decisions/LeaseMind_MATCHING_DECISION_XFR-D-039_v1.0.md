# LeaseMind Matching Decision Record — XFR-D-039

**Decision ID:** `XFR-D-039`

**Название:** Architecture §25.1 → Qualification reason-mapping governance boundary

**Версия:** 1.0

**Дата решения:** 2026-09-02

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED QUALITATIVE REASON-MAPPING GOVERNANCE BOUNDARY — EXACT MAPPING, CATALOG, ORDER, COMPATIBILITY, CARRIER AND IMPLEMENTATION REMAIN OPEN`

**Decision authority:** human project-governance confirmation in the 2026-09-02 working session

**Repository baseline:** `2b2928b4858c2b04038d2a4848047fd75c55a520`

**Scope:** governance authority, namespace separation, separately approved mapping prerequisite, fail-closed handling and preservation of existing Qualification precedence/multi-cause rules for canonical `MQP-12 → XFR-D-039` only. This record does not approve a mapping row, catalog, code, alias, ordering, wording, compatibility rule, schema, carrier, dataset, Policy, manifest, runtime design or implementation.

**Governance owner:** `Chief AI Architect + PRODUCT` — preserves the Qualification semantic/artifact authority established by `XFR-D-030` and `XFR-D-031`.

**Mandatory approvers:** `LEGAL + DEVELOPMENT + AI`.

**Evidence/technical-procedure owner:** `AI + DEVELOPMENT`; this role prepares mapping candidates and evidence and checks technical feasibility, but has no unilateral authority to approve Qualification semantics, namespace content, catalog values, mapping, routing, Policy, carrier, runtime or implementation.

**Depends on:** `XFR-D-031 v1.0` (Qualification semantic-owner/runtime-carrier boundary), `XFR-D-033 v1.0` (Qualification precedence), `XFR-D-038 v1.0` (orthogonal `STALE` semantics), `XFR-D-040 v1.0` (multi-cause preservation and primary-reason rule), `XFR-D-043 v1.0` (Qualification compatibility/supersession boundary), `XFR-D-055 v1.0` (Risk→Qualification interface) and `XFR-D-077 v1.0` (user-facing safe reason/explanation catalog boundary). `XFR-D-010`, `XFR-D-052` and `XFR-D-M2` remain independent `OPEN` decisions. None is reopened or superseded here.

---

## 1. Source/status discipline

The canonical identity is Inventory mapping `MQP-12 → XFR-D-039`, `PRIMARY_STANDALONE`, “§25.1 ↔ Qualification reason mapping and catalog owner”. Before this record, Qualification Policy §15 row 12 was an unassigned candidate requiring coordination with the owner of §25.1 compatibility.

Binding source boundaries are:

- Architecture §25 defines three distinct reason families and does not map them to one another;
- Architecture §25.1 defines exactly twelve internal algorithmic reasons produced in Matching Engine context;
- Architecture §25.2 defines process reasons received from AI Manager or an external service and expressly forbids automatic conversion of a process reason into a negative compatibility label;
- Architecture §25.3 defines human reasons and requires source, author, time, evidence and training-use admissibility for every reason;
- Architecture §33 requires preservation of reasons, evidence and rule/policy versions for audit and reproducibility;
- Architecture §40 keeps Matching Engine as writer of its calculated scores, reasons and rule versions, but writer authority does not itself approve a cross-namespace mapping or catalog;
- `XFR-D-031` preserves `Chief AI Architect + PRODUCT` as Qualification semantic authority and `DEVELOPMENT` as technical schema/carrier steward while exact runtime representation remains `OPEN`;
- `XFR-D-033` and `XFR-D-040` already govern route-determining precedence, preservation of all causes/evidence references and primary-reason selection; this record cannot recalculate or replace those outcomes;
- `XFR-D-077` keeps the user-facing safe reason/explanation catalog separate from internal §25.1, Hard Constraint, Risk and Qualification namespaces.

`LeaseMind_MATCHING_QUALIFICATION_POLICY_v0.1.md`, `LeaseMind_MATCHING_RISK_POLICY_v0.1.md` and `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md` remain Proposals. Their candidate catalog/mapping language is context, not source authority. Inventory is a canonical index/status overlay, not approval. Current Data Contracts do not supply an approved Qualification reason-mapping carrier.

---

## 2. Вопрос

Какая минимальная governance boundary применяется к будущему mapping между Architecture §25.1 internal algorithmic reasons и Qualification reasons/results, если exact mapping, namespace, catalog, ordering, compatibility, carrier and runtime implementation ещё не утверждены?

---

## 3. Решение

### 3.1. Authority boundary

1. Governance owner — `Chief AI Architect + PRODUCT`.
2. Mandatory approvers — `LEGAL + DEVELOPMENT + AI`.
3. Evidence/technical-procedure owner — `AI + DEVELOPMENT`, без unilateral approval.
4. `DEVELOPMENT` remains technical schema/carrier steward under `XFR-D-031`, not unilateral Qualification semantic owner.
5. Approval of roles or evidence procedure is not approval of an actual mapping, catalog, Policy, carrier or implementation.

### 3.2. Three Architecture reason families remain distinct

Architecture §25.1 internal algorithmic reasons are exactly:

1. `HARD_CONSTRAINT_MISMATCH`;
2. `USE_INCOMPATIBLE`;
3. `BUDGET_OUTSIDE_CONFIRMED_LIMIT`;
4. `LOCATION_OUTSIDE_CONFIRMED_LIMIT`;
5. `TIMING_INCOMPATIBLE`;
6. `TECHNICAL_REQUIREMENT_MISSING`;
7. `DUPLICATE_ENTITY_CONFIRMED`;
8. `CRITICAL_DATA_UNVERIFIABLE`;
9. `CONFIDENCE_BELOW_POLICY`;
10. `CRITICAL_RISK_REQUIRES_REVIEW`;
11. `PROFILE_STALE`;
12. `SUPERSEDED_BY_NEW_PROFILE_VERSION`.

These twelve values are source inputs from one internal Architecture family. They are not by existence alone:

- the four Qualification results;
- an exhaustive future Qualification reason catalog;
- Hard Constraint catalog values under `XFR-D-010`;
- Risk reason-reference values under `XFR-D-052`;
- user-facing safe reason or wording under `XFR-D-077`;
- runtime/public enum values or authorization for direct display.

Architecture §25.2 process reasons and §25.3 human reasons remain separate from §25.1 and from one another. A process or human reason is not promoted into the §25.1 family, a Qualification result or a negative compatibility fact by this record.

### 3.3. No mapping by string or wording

1. String equality, shared token, similar wording, common prefix/suffix or apparent semantic similarity does not create mapping, aliasing or equivalence between reason families, Qualification results or catalogs.
2. An internal reason name cannot be reused directly as a Qualification mapping output, public code or user-facing text without a separately approved applicable mapping/catalog entry.
3. The words `MISMATCH`, `INCOMPATIBLE`, `MISSING`, `UNVERIFIABLE`, `STALE`, `SUPERSEDED`, `RISK` or `REVIEW` do not select a Qualification result or precedence class by themselves.
4. `PROFILE_STALE` and `SUPERSEDED_BY_NEW_PROFILE_VERSION` do not alter the orthogonal `STALE` boundary of `XFR-D-038` or the version compatibility boundary of `XFR-D-043`.

### 3.4. Separately approved mapping prerequisite

1. A §25.1 reason may be consumed by Qualification mapping only through a separately approved, applicable, version/hash-bound mapping entry.
2. The mapping entry must refer to an eligible source reason and identifiable source/evidence/rule versions. Exact eligibility and evidence contents remain `OPEN`.
3. Mapping approval must be explicit for the applicable direction, scope, version and context; presence of a source reason or a similarly named result is insufficient.
4. Individually approved source and target artifacts do not prove that their combination or mapping is approved or compatible.
5. A mapping or reference is a prerequisite for governed consumption, not independent authorization of a Qualification result, routing action, presentation, disclosure, release or gate.

### 3.5. Fail-closed handling

If a mapping/reference is missing, unmapped, unknown, ambiguous, conflicting, stale, version-incompatible, hash-mismatched, scope-inapplicable or otherwise unverified:

1. no mapping, alias, route, result or public wording is guessed by AI, operator, heuristic, string comparison, default, fallback inheritance or carrier behavior;
2. the condition is not converted into a negative fact, confirmed mismatch, violation, user rejection or evidence against a person/property/Match;
3. no Qualification result is created, changed, promoted or demoted by implication;
4. the internal source reason and all audit evidence remain preserved under their own source authority;
5. the unverified mapping output cannot be used for routing action, presentation, disclosure, production use or another downstream authorization;
6. exact blocking status, whether a specific downstream step or a wider package is blocked, retry/review behavior and runtime cascade remain `OPEN`.

Fail-closed treatment does not erase an independently valid route already determined under approved Qualification rules, does not invent a replacement route and does not authorize serving an unmapped explanation.

### 3.6. Preserve precedence, all causes and primary-reason authority

1. `XFR-D-033` remains the authority for route-determining precedence.
2. `XFR-D-040` remains the authority requiring preservation of all simultaneous causes and evidence references.
3. A future approved mapping may represent an already governed reason relationship; it cannot recalculate routing, discard causes, switch precedence class or choose a different primary cause.
4. Primary reason remains a deterministic summary from the route-determining precedence class under `XFR-D-033`/`XFR-D-040`.
5. Same-class ordering, actual reason catalog values and catalog order remain `OPEN`. This record introduces no ordering or tie-break rule.

### 3.7. Evidence is prerequisite, not authorization

1. Mapping evidence must be bound to exact source/target versions and hashes, procedure version, source/evidence references and review record; exact evidence package remains `OPEN`.
2. Synthetic-only evidence does not establish production mapping compatibility, production-safe wording or production readiness.
3. Replay equality, tests, schema validation, commit, merge, CI, hash presence or manifest-shaped data do not approve mapping semantics, catalog content, Policy, runtime or release.
4. Evaluation or monitoring output cannot automatically change mapping, routing, catalog, Policy, manifest or runtime behavior.

### 3.8. Partial, never fully resolved

`XFR-D-039` remains `PARTIALLY_RESOLVED_BOUNDARY`: only authority roles, namespace separation, no-string-mapping rule, separately approved mapping prerequisite, fail-closed handling, preservation of `XFR-D-033`/`XFR-D-040` and prerequisite-not-authorization semantics are approved.

All exact contents in §5 remain `OPEN`. A future exact resolution requires a new versioned `XFR-D-039` record with an explicit `supersedes` reference; it cannot be introduced by Policy sync, catalog edit, schema/carrier default, manifest entry or implementation.

---

## 4. Layer/boundary table

| Layer | Authority | Approved here | Remains `OPEN` |
|---|---|---|---|
| Architecture §25.1 | Architecture (`SOURCE_NORMATIVE`) | Exact twelve-value internal source family preserved | Relationship/cardinality to Qualification |
| Architecture §25.2/§25.3 | Architecture (`SOURCE_NORMATIVE`) | Remain separate process/human families | Any future cross-family mapping |
| Qualification semantics | `XFR-D-030`/`XFR-D-031` | Owner authority preserved | Actual reason namespace/results mapping |
| XFR-D-039 governance | `Chief AI Architect + PRODUCT`; approvers `LEGAL + DEVELOPMENT + AI` | Roles, namespace/non-inference/fail-closed boundary | Exact mapping/catalog/order/compatibility |
| Evidence/technical procedure | `AI + DEVELOPMENT` | Candidate/evidence preparation only | Actual evidence package and verdict |
| Qualification precedence/multi-cause | `XFR-D-033`/`XFR-D-040` | Preserved, not recalculated | Same-class/catalog ordering |
| Hard Constraint catalog | `XFR-D-010` | Independent and untouched | Namespace, values, mapping |
| Risk reason references | `XFR-D-052`; interface `XFR-D-055` | Independent and untouched | Namespace, values, process, mapping |
| User-facing explanation | `XFR-D-077` | Internal reason cannot be displayed directly | Safe catalog values, wording, locale, audience |
| Runtime carrier | `DEVELOPMENT` steward under `XFR-D-031` | Nothing new | Field, enum, schema, API, DB, event, serialization |

---

## 5. Что остаётся `OPEN`

- which source reason families and individual reasons are eligible for any mapping;
- mapping direction, cardinality, coverage, applicability and completeness;
- Qualification reason namespace/name, catalog codes and values;
- relationship between reasons and the four Qualification results;
- same-class ordering, catalog ordering, tie-break and primary-reason representation;
- severity, criticality and route-affecting classification;
- exact source/evidence eligibility, provenance and review contract;
- version/hash compatibility, supersession and change-classification process;
- missing/unmapped/ambiguous/conflicting/stale/incompatible fallback, retry, review and blocking granularity;
- any mapping to `XFR-D-010` Hard Constraint codes;
- `XFR-D-052` Risk reason-reference namespace, values and compatibility process;
- `XFR-D-077` user-facing catalog namespace, values, wording, templates, localization, audience/purpose and applicability;
- exact runtime carrier: field, enum, schema, API, DB, event, serialization, transport and storage;
- concurrency, ordering, idempotency, cache, TTL, invalidation and migration mechanics;
- evidence dataset/manifest, evaluation method, tests, runs, metrics and verdict;
- named appointments, RBAC, signatures, quorum, exception and waiver procedure;
- actual Qualification/Risk/Feature/Safe Presentation Policy approval, approval record or Controlled Artifact Manifest entry;
- numeric thresholds, including independently open `XFR-D-M2`;
- production-data use, runtime monitoring, deployment, release and implementation.

None of these contents is implied by the qualitative rules in §3.

---

## 6. Explicit non-conflations

1. `XFR-D-039` Qualification mapping/catalog governance ≠ `XFR-D-010` Hard Constraint reason-code catalog.
2. `XFR-D-039` ≠ `XFR-D-052` Risk reason-reference namespace/values/process.
3. `XFR-D-039` ≠ `XFR-D-077` user-facing safe reason/explanation catalog or wording.
4. Architecture §25.1 internal values ≠ four Qualification results.
5. Internal reason value ≠ runtime/public code or safe user-facing text.
6. Mapping ≠ route-determining precedence under `XFR-D-033`.
7. Mapping/catalog order ≠ multi-cause preservation or primary-cause authority under `XFR-D-040`.
8. Reason `PROFILE_STALE`/`SUPERSEDED_BY_NEW_PROFILE_VERSION` ≠ automatic mutation of `XFR-D-038` freshness or `XFR-D-043` compatibility semantics.
9. Risk reason/reference or `XFR-D-055` interface ≠ `XFR-D-M2` threshold or automatic Qualification route.
10. Technical schema/carrier stewardship ≠ semantic policy ownership or mapping approval.
11. Mapping evidence ≠ Policy, catalog, runtime, production or gate approval.
12. Missing mapping ≠ negative user/business fact or permission to guess a route, alias or wording.

---

## 7. Rationale

Architecture deliberately preserves different sources and kinds of reasons for audit, while Qualification has four distinct routing results and Safe Presentation has a separately governed user-facing catalog. A narrow governance boundary prevents a convenient string match or carrier design from silently collapsing these layers.

Keeping exact mapping contents open preserves existing authority: `XFR-D-033` determines route precedence; `XFR-D-040` preserves all causes and constrains primary-reason selection; `XFR-D-010` and `XFR-D-052` remain independent `OPEN` decisions, while `XFR-D-077` remains an independent `PARTIALLY_RESOLVED_BOUNDARY` whose exact catalog namespace, values, wording, mapping, order, compatibility, carrier and operational contents remain `OPEN`. The approved role split permits controlled preparation without turning technical feasibility or evidence into unilateral semantic approval.

---

## 8. Adversarial cases

1. **Direct enum reuse.** `HARD_CONSTRAINT_MISMATCH` is emitted as a Qualification/public reason because the string already exists. Prohibited: no approved mapping or carrier exists.
2. **Substring routing.** Any value containing `RISK` or `REVIEW` is mapped to `HUMAN_REVIEW_REQUIRED`. Prohibited: wording similarity is not mapping.
3. **Missing mapping guessed.** AI selects the “closest” Qualification reason. Prohibited: fail closed without guessed route, alias or wording.
4. **Process reason becomes negative label.** `PARTICIPATION_DECLINED` is treated as poor compatibility. Prohibited by Architecture §25.2 and this namespace boundary.
5. **User-facing leak.** An internal §25.1 code is shown directly as an explanation. Prohibited without an approved `XFR-D-077` catalog entry/mapping.
6. **Risk namespace absorbed.** A future `XFR-D-052` value is added to Qualification mapping by implication. Prohibited: separate decision and approval are required.
7. **Catalog changes routing.** Catalog order selects a different precedence class or drops secondary causes. Prohibited by `XFR-D-033`/`XFR-D-040` preservation.
8. **Unverified mapping erases route.** Missing mapping mutates an independently valid historical/result record. Prohibited: source reason/evidence and governed result remain preserved; exact downstream block stays `OPEN`.
9. **STALE conflation.** `PROFILE_STALE` creates a fifth Qualification result or bypasses `XFR-D-038`. Prohibited.
10. **Carrier becomes authority.** A schema enum or event list is treated as approval of mapping semantics. Prohibited under `XFR-D-031`.
11. **Synthetic promotion.** Passing synthetic tests is cited as production mapping approval. Prohibited.
12. **CI promotion.** Merge or green checks activate a catalog/mapping automatically. Prohibited: controlled human approval remains required.

---

## 9. Затронутые артефакты (future separate sync)

- `LeaseMind_MATCHING_QUALIFICATION_POLICY_v0.1.md` — §11/§14, §15 row 12, acceptance/readiness may receive this partial boundary while all exact mapping/catalog/runtime contents remain `OPEN`;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — may receive a current-status overlay for canonical `MQP-12 → XFR-D-039` without rewriting historical checkpoints or canonical mapping;
- future approved Qualification/Data Contracts/catalog design — must reference this record and separately decide exact mapping, compatibility and carrier contents.

No Policy, Inventory, manifest, Data Contracts or sibling decision record is changed or approved in this pass.

---

## 10. Change control

Any change to the authority split, namespace separation, no-string-mapping rule, separately approved mapping prerequisite, fail-closed behavior, preservation of `XFR-D-033`/`XFR-D-040`, or explicit non-conflations requires a new versioned decision record with an explicit `supersedes` reference and approval by `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT + AI`.

Policy edits, catalog values, evidence, technical implementation, schema/carrier changes or manifest updates cannot silently supersede this record.

---

## 11. Gate impact

`NONE`.

- `IMPLEMENTATION_READINESS_GATE` remains `BLOCKED`;
- `SYNTHETIC_ACCEPTANCE_GATE` remains `BLOCKED`;
- `PRODUCTION_LAUNCH_GATE` remains `BLOCKED`.

This record approves no Policy, controlled artifact, catalog entry, mapping value, dataset, evidence package, evaluation run, runtime carrier, production-data use, release, deployment or implementation.

---

## 12. Acceptance criteria

1. Resolution status remains exactly `PARTIALLY_RESOLVED_BOUNDARY`, never fully resolved.
2. Governance owner is `Chief AI Architect + PRODUCT`.
3. Mandatory approvers are `LEGAL + DEVELOPMENT + AI`.
4. Evidence/technical-procedure owner is `AI + DEVELOPMENT` without unilateral approval authority.
5. Architecture §25.1, §25.2 and §25.3 remain distinct reason families.
6. The exact twelve §25.1 values remain internal source inputs, not Qualification results, an exhaustive future catalog or user-facing wording.
7. String equality or similar wording never creates a mapping, alias, route or display authorization.
8. Only a separately approved applicable version/hash-bound mapping may consume an eligible source reason.
9. Missing/unmapped/unknown/ambiguous/conflicting/stale/incompatible mapping fails closed without a guessed route, negative fact or display.
10. Fail-closed behavior neither mutates an independently governed result nor selects exact blocking granularity.
11. `XFR-D-033` precedence and `XFR-D-040` all-cause preservation/primary-reason authority remain binding; no same-class/catalog order is introduced.
12. `XFR-D-010` and `XFR-D-052` remain independent `OPEN` decisions; `XFR-D-077` remains an independent `PARTIALLY_RESOLVED_BOUNDARY`, with exact catalog namespace, values, wording, mapping, order, compatibility, carrier and operational contents still `OPEN`.
13. `XFR-D-031`, `XFR-D-038`, `XFR-D-043`, `XFR-D-055` and `XFR-D-M2` are preserved and not reopened.
14. Exact mapping/cardinality/catalog/codes/order/fallback/compatibility/schema/carrier/data/evidence/RBAC/policy/manifest/runtime/implementation remain `OPEN`.
15. No numeric threshold, runtime enum, field, event, API, DB table, TTL or default is introduced.
16. Synthetic evidence, test, replay, commit, merge, CI, hash or manifest-shaped data never creates mapping, Policy or production approval.
17. No Policy, dataset, evaluation, production-data, runtime or implementation approval is introduced.
18. All three governance gates remain `BLOCKED`.

---

## 13. Итог

`XFR-D-039 PARTIALLY RESOLVED — QUALITATIVE REASON-MAPPING GOVERNANCE, NAMESPACE-SEPARATION AND FAIL-CLOSED BOUNDARY APPROVED; EXACT MAPPING, CATALOG, ORDER, COMPATIBILITY, CARRIER, POLICY AND IMPLEMENTATION REMAIN OPEN`
