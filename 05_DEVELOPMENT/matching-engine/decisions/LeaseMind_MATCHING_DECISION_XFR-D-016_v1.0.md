# LeaseMind Matching Decision Record — XFR-D-016

**Decision ID:** `XFR-D-016`

**Название:** Lawful Basis/Consent Registry → Matching Engine integration contract — source-ownership and read-only consumption boundary

**Версия:** 1.0

**Дата решения:** 2026-09-09

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED MECHANISM-GOVERNANCE BOUNDARY FOR THE LAWFUL BASIS/CONSENT REGISTRY → MATCHING ENGINE INTEGRATION CONTRACT — LAWFUL BASIS/CONSENT REGISTRY REMAINS THE SOLE WRITER OF lawful_basis_id, PURPOSE, VERSION, VALIDITY, REVOCATION AND TERMINATION; MATCHING ENGINE MAY LATER CONSUME ONLY A PURPOSE-BOUND, SCOPE-COMPATIBLE, VERSIONED, READ-ONLY PROJECTION/REF AND APPLICABLE SOURCE-OWNED INVALIDATION AND CANNOT CREATE, EXTEND, RESTORE, REPLACE, AMEND OR REINTERPRET LAWFUL BASIS; MISSING/UNKNOWN/STALE/EXPIRED/REVOKED/TERMINATED/SUSPENDED/UNDER-REVIEW/INVALIDATED/VERSION-OR-PURPOSE-MISMATCHED PROJECTION FAILS CLOSED ONLY FOR THE AFFECTED GOVERNED USE WITHOUT NEGATIVE COERCION, AUTOMATIC INELIGIBLE, REJECTION, ROUTE OR UNRELATED BLOCK; EXISTING DATA CONTRACTS LAWFUL-BASIS FIELDS/EVENTS FOR REVEAL/PARTICIPATION DO NOT AUTOMATICALLY CONSTITUTE OR APPROVE THE MATCHING ENGINE INTEGRATION CONTRACT AND MUST NOT BE IMPORTED BY ANALOGY; THE SOURCE-NORMATIVE SIX-VALUE lawful_basis_status ENUM REMAINS UNCHANGED, WHILE EXACT PROJECTION, CONTRACT REPRESENTATION/MAPPING, API/EVENT/SCHEMA/CARRIER, VERSION/HASH/SIGNATURE, TTL/CACHE/REFRESH/INVALIDATION DELIVERY, RBAC/APPOINTMENT, RETRY/RECOVERY AND OPERATIONAL CONSEQUENCES REMAIN OPEN; ALL THREE GATES BLOCKED`

**Decision authority:** explicit human project-governance confirmation on 2026-09-09.

**Repository baseline:** `c4eae936f57b223bfe78df3c3ed8262f8de68aef`

**Scope:** availability to the Matching Engine of a purpose-bound, scope-compatible, versioned, read-only Lawful Basis/Consent Registry projection/ref with applicable source-owned invalidation — a governance/architecture-boundary decision only, corresponding to open decision №19 of the Matching Feature Schema Proposal (§10). Resolves only the qualitative boundary that lawful basis is source-owned exclusively by the Lawful Basis/Consent Registry and that any future Matching Engine consumption is a purpose-bound, scope-compatible, versioned, read-only projection/ref with applicable source-owned invalidation that fails closed for the affected governed use. Does not create or approve the Feature Schema Proposal or any of its content, an exact projection or contract representation/mapping of the source-normative `lawful_basis_status` enum, a new or altered status enum, an API/event/schema/carrier, a version/hash/signature, a TTL/cache/refresh/invalidation-delivery mechanism, an RBAC/appointment assignment, a retry/recovery procedure, an operational consequence, a lawful-basis determination for any feature/use, a protected/proxy classification, a Policy/Data Contract/manifest approval, a dataset, a production run, a runtime, an implementation or any gate transition.

**Canonical identity:** `FS-19 → XFR-D-016`, `PRIMARY_STANDALONE` (`LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` §4.1, row `FS-19`). This record does not change that mapping or the Inventory counts of 102 source keys / 90 canonical IDs.

**Governance owner:** `Chief AI Architect + DEVELOPMENT + LEGAL` — human-approved decision-specific assignment consistent with the owner listed for open decision №19 in Feature Schema Proposal §10 (row №19). Neither Architecture nor the Feature Schema Proposal assigns this exact decision owner as a norm; the Proposal row remains a candidate assignment until separately approved and is not substantive authority by itself.

**Mandatory approvers:** `PRODUCT + AI`.

**Evidence/technical-procedure owner:** `AI + DEVELOPMENT`; this role may prepare and verify evidence and candidate technical procedures only and has no unilateral authority to approve any content this record leaves `OPEN`.

**Depends on/preserves:** Architecture §§11, 21.3 and 40.1 (lawful-basis processing fields and canonical `lawful_basis_status` enum; external source discipline and Lawful Basis/Consent Registry projection/invalidation semantics — an external source status is not a Matching decision, score, risk or hard constraint); Feature Schema Proposal §3.3/§10/§11 (candidate `FeatureValue` envelope lawful-basis fields and the open integration-contract row recorded in §10). `XFR-D-004 v1.0` (identity/authority source-ownership and read-only gate-only consumption boundary), `XFR-D-007 v1.0` (v0.1 exclusion of `business_stage_signal`), `XFR-D-014 v1.0` (no final LEGAL verdict for the 20 Hard Constraint candidates; protected/proxy classification and lawful-basis determination remain open), `XFR-D-054` (Risk Policy §13 open decision №9 — protected/proxy classification catalog and lawful basis per otherwise admissible non-protected feature/use) and `XFR-D-080` (Safe Presentation audience/purpose model governance boundary) remain independent; this record is mechanism governance, not a lawful-basis determination for any feature/use, and none of these records is reopened, absorbed, approved or superseded here. Every dependency remains independently governed.

---

## 1. Вопрос

Open decision №19 of the Matching Feature Schema Proposal (§10) reads (verbatim): «Интеграционный контракт (API/событие), которым purpose-bound Lawful Basis/Consent Registry projection/invalidation (Architecture §11, §21.3, §40.1) передаётся Matching Engine (§3.3)».

Feature Schema §3.3 candidate `FeatureValue` envelope carries the lawful-basis fields — `lawful_basis_id`, `processing_purpose`, `lawful_basis_source`, `lawful_basis_version`, `lawful_basis_validity`, `lawful_basis_status`, `lawful_basis_termination_ref`, `record_version`, `change_reason` — and derives candidate `processing_eligibility` fail-closed from `lawful_basis_status`/`processing_purpose`/`lawful_basis_validity` without replacing storage of those fields. Architecture §11/§21.3/§40.1 anchor the Lawful Basis/Consent Registry single-writer and projection/invalidation discipline that this record governs. This record resolves only the qualitative source-ownership, read-only-consumption, fail-closed and governance boundary of that future integration contract; the exact contract remains `OPEN`.

## 2. Source/status discipline

The canonical identity is Inventory mapping `FS-19 → XFR-D-016`, `PRIMARY_STANDALONE`, "Lawful Basis Registry → Matching Engine integration contract". Before this record, Feature Schema §10 decision row №19 remained `OPEN`; its `Chief AI Architect + DEVELOPMENT + LEGAL` owner wording is a candidate assignment — the Proposal row does not normatively appoint that owner and is not substantive authority by itself.

Binding and contextual boundaries are:

- Architecture §11 defines the lawful-basis processing fields and the canonical `lawful_basis_status` enum (`ACTIVE | EXPIRED | REVOKED | TERMINATED | SUSPENDED | UNDER_REVIEW`) that Feature Schema §3.3 reuses without additions; the Lawful Basis/Consent Registry remains the sole writer of those facts;
- Architecture §40.1 (with §21.3 context) governs source-owned projection/invalidation delivery to downstream consumers; an external source status is not a Matching decision, score, risk or hard constraint;
- Feature Schema §3.3/§10/§11 record the candidate envelope and the open integration-contract row; they are Proposal context, not an approved runtime contract. Feature Schema §7.1 governs the separate identity/authority `GATE_ONLY_CANDIDATE` question and is not imported as lawful-basis contract authority;
- current `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` lawful-basis fields/events for Reveal/Participation (for example Reveal lawful-basis reference fields and lawful-basis invalidation/revocation events) form the existing executable-contract boundary between the Lawful Basis/Consent Registry and Reveal/Participation; they do not constitute or approve the Matching Engine integration contract governed here and must not be imported by analogy;
- the Inventory is a canonical index/status overlay, not substantive approval; this record does not require or perform any Inventory overlay.

## 3. Approved qualitative boundary

### 3.1. Lawful Basis/Consent Registry remains the sole writer

The Lawful Basis/Consent Registry remains the sole writer of `lawful_basis_id`, purpose, version, validity, revocation and termination. No Matching Engine component, projection store, cache, API/event/schema/carrier, Data Contract consumer, policy, code, CI, commit, merge, sync or deployment may create, extend, restore, replace, amend or reinterpret lawful basis, and none may accept a caller-supplied lawful-basis value as authoritative. Canonical `lawful_basis_status` values and `lawful_basis_termination_ref` remain source-owned and unchanged by this record.

### 3.2. Purpose-bound, scope-compatible, versioned, read-only consumption

The Matching Engine may later consume only a purpose-bound, scope-compatible, versioned, read-only projection/ref of that source-owned lawful basis, together with applicable source-owned invalidation. Consumption is never a registry write, a finality decision, an echo or an override; it cannot extend a purpose, widen a scope, revive an expired/terminated basis, alter a version/hash, repair a revocation or reinterpret a processing purpose.

### 3.3. Affected-use fail-closed handling

A missing/unknown/stale/expired/revoked/terminated/suspended/under-review/invalidated/version-or-purpose-mismatched projection fails closed only for the affected governed use. It creates no negative coercion, automatic `INELIGIBLE`, rejection, route, reason, display or unrelated block, and it never authorizes a fallback, guessed status, inferred purpose, invented default or silent secondary use.

### 3.4. Data Contracts are not imported by analogy

Existing Data Contracts lawful-basis fields/events for Reveal/Participation do not automatically constitute or approve the Matching Engine integration contract and must not be imported by analogy. Their presence, names, enums, event types, owner roles or consumer operations carry no automatic authority over the future Matching Engine integration contract.

### 3.5. Governance roles and mechanism-only scope

Governance owner is `Chief AI Architect + DEVELOPMENT + LEGAL`; mandatory approvers are `PRODUCT + AI`; evidence/technical-procedure owner is `AI + DEVELOPMENT` without unilateral authority. This record is mechanism governance, not a lawful-basis determination for any feature/use.

## 4. Explicitly not approved / OPEN

The following remain `OPEN` and are not approved, chosen or created by this record:

1. exact projection content and contract representation/mapping of the source-normative six-value `lawful_basis_status` enum; no new or altered enum is approved;
2. API/event/schema/carrier and contract mechanics;
3. version/hash/signature scheme;
4. TTL/cache/refresh/invalidation delivery;
5. RBAC/appointment and operational roles;
6. retry/recovery and operational consequences;
7. any Data Contract extension or new event/carrier;
8. any lawful-basis determination, protected/proxy classification, purpose, version/hash binding or evidence for a feature/use.

None of the above may be introduced by silent edit, policy sync, Inventory overlay, code, CI, commit, merge, Feature Schema sync or deployment.

## 5. Non-conflation

1. This record is mechanism governance — not a lawful-basis determination for any feature/use; that determination remains an `OPEN` canonical question under `XFR-D-054`/Risk Policy §13 open decision №9 and the related Feature Schema rows №9/№17.
2. Lawful Basis/Consent Registry write authority ≠ Matching Engine integration-contract approval.
3. Read-only projection/ref consumption ≠ registry finality, Matching decision, score, risk, Hard Constraint or eligibility result.
4. Existing Data Contracts lawful-basis fields/events for Reveal/Participation ≠ Matching Engine integration contract; no import by analogy.
5. Inventory indexing `FS-19 → XFR-D-016` ≠ substantive approval.
6. Governance owner ≠ mandatory approver ≠ evidence/technical-procedure owner ≠ data authority or gate authority.
7. Commit/merge/CI/Inventory/hash presence ≠ gate approval.

## 6. Preservation of independent decisions

`XFR-D-004 v1.0` (identity/authority source-ownership and read-only gate-only consumption boundary), `XFR-D-007 v1.0` (`business_stage_signal` v0.1 exclusion), `XFR-D-014 v1.0` (no final LEGAL verdict for the 20 Hard Constraint candidates; all 20 remain `ELIGIBILITY_HARD_CONSTRAINT_CANDIDATE`), `XFR-D-054` (protected/proxy classification catalog and lawful-basis authority) and `XFR-D-080` (Safe Presentation audience/purpose model governance boundary) remain independent, preserved and untouched. This record does not reopen, extend, narrow, absorb, approve or supersede any of them and does not change their canonical identity or Inventory counts.

## 7. Adversarial cases

1. **Matching Engine writes lawful basis.** A schema, projection, cache or handler creates/extends/restores/replaces/amends/reinterprets `lawful_basis_id`, purpose, version, validity, revocation or termination. Prohibited by §3.1.
2. **Projection used outside its purpose/scope/version.** A purpose-bound projection is consumed for an incompatible purpose/scope, or an outdated version/hash remains authoritative after source-owned invalidation. Prohibited by §3.2.
3. **Unusable projection treated as a negative fact.** A missing/unknown/stale/expired/revoked/terminated/suspended/under-review/invalidated/version-or-purpose-mismatched projection triggers automatic `INELIGIBLE`, rejection, route, reason, unrelated block or guessed/inferred status. Prohibited by §3.3 — the affected governed use fails closed only.
4. **Reveal/Participation Data Contract lawful-basis fields/events cited as the Matching Engine integration contract.** Prohibited by §3.4 — no automatic constitution or approval and no import by analogy.
5. **Projection presence read as a lawful-basis determination.** A consumed projection/ref or event is cited as approving a purpose or lawful basis for a feature/use. Prohibited — that determination remains an `OPEN` canonical question under `XFR-D-054`/Risk Policy §13 open decision №9 and is not made by this record.
6. **Exact contract items treated as approved.** Any exact projection, contract representation/mapping, new or altered status enum, API/event/schema/carrier, version/hash/signature, TTL/cache/refresh/invalidation delivery, RBAC/appointment, retry/recovery or operational consequence is cited as approved by this record. Prohibited by §4; the existing source-normative six-value enum remains unchanged.
7. **Record cited for approvals it does not grant.** This record is cited to approve Feature Schema content, a Policy, a Data Contract, a dataset, production/runtime/implementation or a gate transition. Prohibited by §11.
8. **Role authority inflation.** Evidence/technical preparation, commit/merge/CI or Inventory overlay is treated as owner/approver/data/gate authority. Prohibited by §3.5.

## 8. Resolution status and future exact resolution

This record remains `PARTIALLY_RESOLVED_BOUNDARY`: only the qualitative mechanism-governance boundary in §3 is approved; every exact item in §4 remains `OPEN`. Any future exact resolution requires separate evidence-backed authority approved by the full owner/approver set on the same version/hash, cannot rely on this record as that authority, and cannot be introduced by silent edit, policy sync, Inventory overlay, code, CI, commit, merge, Feature Schema sync or deployment.

## 9. Rationale

Lawful-basis facts are external, source-owned, rights-affecting finality data; the Matching Engine is a compute consumer with no authority over them. Purpose-bound, scope-compatible, versioned, read-only projection consumption with applicable source-owned invalidation preserves the single writer and prevents silent reinterpretation through schema, carrier or cache. Affected-use fail-closed handling stops an unavailable or unusable projection from becoming an invented negative, automatic exclusion, rejection, route or unrelated block. Exact contract mechanics are deferred because they require evidence-backed cross-functional design and approval rather than governance-by-implication.

## 10. Change control

Any change to the sole-writer boundary, the purpose-bound/scope-compatible/versioned read-only consumption rule, the affected-use fail-closed handling, the Data Contract non-importation rule, the governance owner, the mandatory approvers, the evidence role or the non-conflation boundary requires a new versioned `XFR-D-016` record with `supersedes`, approved on the same version/hash by `Chief AI Architect + DEVELOPMENT + LEGAL` (owner) and `PRODUCT + AI` (mandatory approvers).

Exact projection and contract representation/mapping of the source-normative status enum, any new or altered enum, API/event/schema/carrier, version/hash/signature, TTL/cache/refresh/invalidation delivery, RBAC/appointment, retry/recovery, operational content, Data Contract extension, lawful-basis determination, runtime, implementation and gate decisions require their own evidence-backed authority and cannot be introduced by silent edit, policy sync, Inventory overlay, code, CI, commit, merge or deployment.

## 11. Gate impact

`NONE`.

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**

This record does not approve the Feature Schema Proposal, a Policy, a Data Contract, a dataset, production use, a Controlled Artifact Manifest entry, an acceptance report, a runtime, an implementation or a release.

## 12. Acceptance criteria

1. **Given** canonical identity, **when** checked, **then** it remains `FS-19 → XFR-D-016`, `PRIMARY_STANDALONE`, without Inventory count change.
2. **Given** governance roles, **when** checked, **then** owner is `Chief AI Architect + DEVELOPMENT + LEGAL`, mandatory approvers are `PRODUCT + AI`, and `AI + DEVELOPMENT` evidence/technical-procedure ownership has no unilateral approval authority.
3. **Given** `lawful_basis_id`, purpose, version, validity, revocation or termination, **when** a Matching Engine component writes/extends/restores/replaces/amends/reinterprets it, **then** the action is rejected.
4. **Given** a Lawful Basis/Consent Registry projection/ref, **when** Matching Engine consumes it, **then** consumption is purpose-bound, scope-compatible, versioned, read-only and uses only applicable source-owned invalidation.
5. **Given** a purpose/scope/version-incompatible projection, **when** consumption is attempted, **then** it is not authorized by this record.
6. **Given** missing/unknown/stale/expired/revoked/terminated/suspended/under-review/invalidated/version-or-purpose-mismatched projection, **when** the affected governed use is evaluated, **then** it fails closed only for that use, without negative coercion, automatic `INELIGIBLE`, rejection, route or unrelated block.
7. **Given** existing Data Contracts lawful-basis fields/events for Reveal/Participation, **when** they are cited as the Matching Engine integration contract or imported by analogy, **then** the citation is rejected.
8. **Given** this record, **when** a lawful-basis determination or protected/proxy classification for any feature/use is requested, **then** none is made; the canonical `XFR-D-054`/Risk Policy §13 open decision №9 question remains `OPEN`.
9. **Given** `XFR-D-004`, `XFR-D-007`, `XFR-D-014`, `XFR-D-054` and `XFR-D-080`, **when** this record is applied, **then** each remains independent, preserved and untouched.
10. **Given** Feature Schema §10 row №19/§11 status, **when** `READY`/resolved status is claimed from this record, **then** the claim is rejected.
11. **Given** exact projection/contract representation or mapping, any new or altered status enum, API/event/schema/carrier, version/hash/signature, TTL/cache/refresh/invalidation delivery, RBAC/appointment, retry/recovery or operational consequence, **when** approval is requested from this record, **then** none is approved; the Architecture §11 source-normative six-value enum remains unchanged.
12. **Given** all gates, **when** status is checked, **then** `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` remain `BLOCKED`.

## 13. Итог

`XFR-D-016 PARTIALLY_RESOLVED_BOUNDARY — LAWFUL BASIS/CONSENT REGISTRY REMAINS THE SOLE WRITER OF lawful_basis_id, PURPOSE, VERSION, VALIDITY, REVOCATION AND TERMINATION; MATCHING ENGINE MAY LATER CONSUME ONLY A PURPOSE-BOUND, SCOPE-COMPATIBLE, VERSIONED, READ-ONLY PROJECTION/REF AND APPLICABLE SOURCE-OWNED INVALIDATION AND CANNOT CREATE, EXTEND, RESTORE, REPLACE, AMEND OR REINTERPRET LAWFUL BASIS; MISSING/UNKNOWN/STALE/EXPIRED/REVOKED/TERMINATED/SUSPENDED/UNDER-REVIEW/INVALIDATED/VERSION-OR-PURPOSE-MISMATCHED PROJECTION FAILS CLOSED ONLY FOR THE AFFECTED GOVERNED USE WITHOUT NEGATIVE COERCION, AUTOMATIC INELIGIBLE, REJECTION, ROUTE OR UNRELATED BLOCK; EXISTING DATA CONTRACTS LAWFUL-BASIS FIELDS/EVENTS FOR REVEAL/PARTICIPATION DO NOT AUTOMATICALLY CONSTITUTE OR APPROVE THE MATCHING ENGINE INTEGRATION CONTRACT AND MUST NOT BE IMPORTED BY ANALOGY; GOVERNANCE OWNER CHIEF AI ARCHITECT + DEVELOPMENT + LEGAL, MANDATORY APPROVERS PRODUCT + AI, EVIDENCE/TECHNICAL-PROCEDURE OWNER AI + DEVELOPMENT WITHOUT UNILATERAL AUTHORITY; XFR-D-004, XFR-D-007, XFR-D-014, XFR-D-054 AND XFR-D-080 REMAIN INDEPENDENT; THE ARCHITECTURE §11 SOURCE-NORMATIVE SIX-VALUE lawful_basis_status ENUM REMAINS UNCHANGED, WHILE EXACT PROJECTION, CONTRACT REPRESENTATION/MAPPING, API/EVENT/SCHEMA/CARRIER, VERSION/HASH/SIGNATURE, TTL/CACHE/REFRESH/INVALIDATION DELIVERY, RBAC/APPOINTMENT, RETRY/RECOVERY AND OPERATIONAL CONSEQUENCES REMAIN OPEN; ALL THREE GATES BLOCKED`
