# LeaseMind Matching Decision Record — XFR-D-004

**Decision ID:** `XFR-D-004`

**Название:** Identity/authority verification availability at scoring

**Версия:** 1.0

**Дата решения:** 2026-09-09

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED IDENTITY/AUTHORITY SOURCE-OWNERSHIP AND READ-ONLY GATE-ONLY CONSUMPTION BOUNDARY — EXACT STATUS ENUM, PROJECTION, API/EVENT/SCHEMA/CARRIER, FRESHNESS/TTL, EVIDENCE, APPOINTMENT/RBAC AND OPERATIONAL CONSEQUENCES REMAIN OPEN`

**Decision authority:** explicit human project-governance confirmation on 2026-09-09.

**Repository baseline:** `c4eae936f57b223bfe78df3c3ed8262f8de68aef`

**Scope:** availability of `identity_authority_verification_status` to the Matching Engine at scoring — a governance/architecture-boundary decision only, corresponding to open decision №5 of the Matching Feature Schema Proposal (§10). Resolves only the qualitative boundary that identity/authority is source-owned exclusively by the Identity/Authority Registry and that any future Matching Engine consumption is a purpose/scope-compatible, immutable, versioned, read-only, gate-only input. Does not create or approve the Feature Schema Proposal or any of its content, a projection, a status enum, an API/event/schema/carrier, a freshness/TTL mechanism, an evidence procedure, an appointment/RBAC assignment, an operational consequence, a Policy/Data Contract/manifest approval, a dataset, a production run, a runtime, an implementation or any gate transition.

**Canonical identity:** `FS-05 → XFR-D-004`, `PRIMARY_STANDALONE` (`LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` §4.1, row `FS-05`). This record does not change that mapping or the Inventory counts of 102 source keys / 90 canonical IDs.

**Governance owner:** `Chief AI Architect + LEGAL` — human-approved decision-specific assignment consistent with the owner listed for open decision №5 in Feature Schema Proposal §10 (row №5). Neither Architecture nor the Feature Schema Proposal assigns this exact decision owner as a norm; the Proposal row remains a candidate assignment until separately approved and is not substantive authority by itself.

**Mandatory approvers:** `PRODUCT + AI + DEVELOPMENT`.

**Evidence/technical-procedure owner:** `AI + DEVELOPMENT`; this role may prepare and verify evidence and candidate technical procedures only and has no unilateral authority to approve any content this record leaves `OPEN`.

**Depends on:** Architecture §§15.2, 18.3, 21.3, 31 and 40 (Owner Fit criteria list; Participation Gate; Identity/Authority Registry single-writer and Lawful Basis/Consent projection discipline; external gate status is not a Matching decision, score, risk or hard constraint). The Feature Schema Proposal §7.1/§8/§10/§11 records the open classification; `XFR-D-M3` (re-identification risk boundary) and `XFR-D-044 v1.0` (safe-presentation read-only consumption boundary) remain independent. Every dependency remains independently governed and none is reopened, absorbed or fully resolved here.

---

## 1. Вопрос

Open decision №5 of the Matching Feature Schema Proposal (§10) reads (verbatim): «Доступность `identity_authority_verification_status` для Matching Engine на этапе scoring (§7.1 напряжение §15.2 vs §18.3/§31)».

Feature Schema §7.1 classifies `identity_authority_verification_status` as `GATE_ONLY_CANDIDATE` — не `ELIGIBILITY_HARD_CONSTRAINT_CANDIDATE`, scoring feature, soft-fit или ranking input — and states that a versioned external status/ref may become a `GATE_ONLY_CANDIDATE` only through a separate cross-functional decision, while raw evidence never enters the registry and the fact is never a numeric Owner Fit input. This record is that separate decision, limited to the qualitative governance/architecture boundary below; it does not approve any Feature Schema content.

## 2. Source/status discipline

1. The Matching Feature Schema document carries the status `Proposal for cross-functional review — does not authorize implementation`. Its §7.1/§8/§10/§11 are proposal content until separately approved; §10 is an open-decision register whose rows record candidate owners, not norms.
2. Inventory §4.1 indexes the question as canonical mapping `FS-05 → XFR-D-004`, `PRIMARY_STANDALONE`, «Identity/authority verification availability at scoring». Inventory indexes and routes; it is not the source of the substantive decision, does not approve the Proposal and does not pass a gate.
3. The tension named by §7.1 — Architecture §15.2 (Owner Fit criteria list that mentions identity/authority) versus §18.3/§31 (external verified-gate fact, not a Matching scoring decision) — is resolved by this record only to the narrow extent stated in §3. The Architecture sections themselves are not amended and remain applicable.
4. Feature Schema §8 row «Identity/authority — 5. external gate status (candidate)» remains `BLOCKED_PENDING_DECISION`, and §11 readiness rows remain untouched. This record does not change those rows; only a future separately approved Feature Schema sync may reference this boundary.
5. The `FS-05 → XFR-D-004` mapping existed before this record; this record is the substantive resolution of that indexed question, not its creation.

## 3. Решение

### 3.1. Governance roles и разделение authority

1. Governance owner of the identity/authority verification availability boundary — `Chief AI Architect + LEGAL`.
2. Mandatory approvers — `PRODUCT + AI + DEVELOPMENT`.
3. Evidence/technical-procedure owner — `AI + DEVELOPMENT`; эта роль готовит/проверяет evidence и candidate technical procedures, но не получает unilateral approval authority над любым `OPEN`-содержимым ниже.
4. Source ownership, governance ownership, evidence preparation, data authority, policy approval и gate decision — разные authority layers; ни один слой не заменяет другой.

### 3.2. Source ownership: single-writer Identity/Authority Registry

1. Identity/authority facts are source-owned exclusively by the Identity/Authority Registry (single writer, Architecture §21.3/§40 write-ownership discipline). Matching Engine, AI Manager, Participation, Introduction Record Service and any other consumer never confirm, verify, correct or amend identity/authority facts.
2. No Matching Engine component performs identity/authority verification, in whole or in part. «Verification status» is a fact produced outside Matching and never re-derived inside it.

### 3.3. Единственный allowed Matching Engine input: immutable versioned read-only gate-only projection

1. Matching Engine may later consume only a purpose/scope-compatible, immutable, versioned, read-only status/ref (projection) as a gate-only input.
2. The projection is version-bound: after an applicable source-owned status/version/invalidation/revocation event, the previously consumed value cannot be treated as current for the affected governed use. This record does not define cache, refresh, TTL or invalidation-delivery mechanics; they remain `OPEN`.
3. Matching Engine never receives raw documents or raw identity/authority payloads.
4. Matching Engine never uses this fact as numeric Owner Fit, Match Score, Risk, ranking или Hard Constraint result. It is `GATE_ONLY_CANDIDATE` (§7.1), не `ELIGIBILITY_HARD_CONSTRAINT_CANDIDATE`, scoring feature, soft-fit, ranking-only или numeric input; никакая формула/условие Scoring/Risk/Qualification policy не ссылается на него в силу этого record'а.

### 3.4. Fail-closed affected-use-only boundary

1. Missing/unknown/stale/expired/revoked/invalidated/version-mismatched projection fails closed only for the affected governed use.
2. Fail-closed не является negative fact: нет coercion, нет guessed failure, нет invented fallback/default, нет synthetic `value_state`, нет automatic `INELIGIBLE`, нет automatic rejection и нет unrelated access/processing/Campaign block.
3. Fail-closed не создаёт новый result, route, reason или display; никакая другая cause не теряется; затронутый governed use не подменяется другим input.
4. Exact cascade/recovery/retry/escalation/observability behavior остаётся `OPEN` и не проектируется этим record'ом.

### 3.5. Approved qualitative boundary only — не content approval

`XFR-D-004` получает `PARTIALLY_RESOLVED_BOUNDARY`. Human-approved здесь: source ownership (single writer); read-only immutable versioned gate-only consumption; the never-actions of §3.2/§3.3; fail-closed affected-use-only semantics; governance/approver/evidence-role separation. Exact status enum, projection, API/event/schema/carrier, freshness/TTL, evidence, appointment/RBAC и operational consequences остаются `OPEN`, как перечислено в §6.

### 3.6. Preservation of independent dependencies

Этот record не переоткрывает, не поглощает, не подменяет и не fully resolves:

1. Architecture §15.2 Owner Fit criteria list and §18.3 Participation Gate content beyond the narrow read-only gate-only resolution of §3.3;
2. `XFR-D-M3` re-identification risk boundary and its exact method/cohort/quasi-ID/adversary/linkage/statistics/evidence content;
3. `XFR-D-044 v1.0` safe-presentation read-only consumption boundary;
4. Feature Schema open decisions №4 and №6 and all §8/§11 rows not resolved here;
5. Data Contracts extension, carrier, runtime, implementation, release и каждый gate decision.

## 4. Layer/authority table

| Layer | Authority | Resolved by this record | Remains `OPEN` |
|---|---|---|---|
| Canonical identity | Inventory §4.1 | `FS-05 → XFR-D-004`, `PRIMARY_STANDALONE`, preserved | Inventory future status overlay |
| Governance ownership | `Chief AI Architect + LEGAL`; approvers `PRODUCT + AI + DEVELOPMENT` | Role split and qualitative boundary | Named identities/RBAC if ever required operationally |
| Source ownership | Identity/Authority Registry, Architecture §21.3/§40 | Single-writer preserved; Matching never verifies | Registry/projection content owned separately |
| Evidence/technical procedure | `AI + DEVELOPMENT` | Non-unilateral evidence role | Exact enum/projection/carrier/freshness/evidence content |
| Matching consumption | `GATE_ONLY_CANDIDATE`, Feature Schema §7.1 | Read-only immutable versioned gate-only input confirmed; numeric/score/risk/ranking/hard-constraint use prohibited | API/event/schema/carrier, runtime mapping, operational consequences |
| Policies/Data Contracts/runtime/release | Downstream controlled artifacts and gates | No automatic effect | All content |
| Gate decisions | Architecture | No gate effect | Every gate transition and acceptance report |

## 5. Обязательные non-conflations

1. Read-only gate-only consumption ≠ identity/authority verification by Matching Engine.
2. `identity_authority_verification_status` ≠ numeric Owner Fit, Match Score, Risk, ranking или Hard Constraint input.
3. Status/ref availability ≠ raw document or raw payload delivery.
4. Versioned projection ≠ cached, editable or reinterpretable fact.
5. Fail-closed for the affected use ≠ automatic `INELIGIBLE`, rejection, guessed failure или invented fallback.
6. Missing/unknown/stale/expired/revoked/invalidated projection ≠ negative business/legal fact.
7. `XFR-D-004` ≠ approval of the Feature Schema Proposal or any Policy/Data Contract/dataset/manifest entry.
8. Inventory indexing `FS-05 → XFR-D-004` ≠ substantive approval.
9. Gate-only verification-status input ≠ evidence for other gates, reasons or unrelated uses.
10. Identity/authority registry fact ≠ Lawful Basis/Consent projection integration decision (Feature Schema §10 row №19).
11. Governance owner ≠ mandatory approver ≠ evidence/technical-procedure owner ≠ data authority or gate authority.
12. Commit/merge/CI/Inventory/hash presence ≠ gate approval.

## 6. Что остаётся `OPEN`

- exact status enum and semantics;
- projection content, versioning and mutation/invalidation contract;
- API/event/schema/carrier by which the projection reaches Matching Engine;
- freshness/TTL (Feature Schema §8 class-5 row candidate remains `BLOCKED_PENDING_DECISION`);
- exact evidence package and evidence procedure; the approved `AI + DEVELOPMENT` preparation role remains unchanged and non-unilateral;
- appointment/RBAC and operational consequences;
- Feature Schema §7.1/§8/§10/§11 overlay and Inventory future status overlay;
- open decisions №4 and №6 and all other §10 rows not resolved here;
- Data Contracts extension, runtime, implementation, release и каждый gate transition.

## 7. Rationale

Architecture deliberately keeps identity/authority verification outside Matching as an externally produced gate fact (§18.3/§31), while §15.2 lists identity/authority among Owner Fit criteria. Feature Schema §7.1 reflects this tension honestly: it classifies the field as `GATE_ONLY_CANDIDATE`, refuses numeric Owner Fit use, and requires a separate cross-functional decision before any versioned external status/ref may become a gate input. Because the Feature Schema remains a Proposal and raw identity/authority material is the most legally sensitive input class in the domain, a narrow human decision is required now to fix the qualitative boundary — read-only immutable versioned gate-only consumption with affected-use-only fail-closed semantics — without pretending that an enum, projection, carrier, TTL, evidence procedure or runtime already exists.

The role split keeps governance with `Chief AI Architect + LEGAL` (the functions already listed as owner of the Feature Schema §10 row №5), makes `PRODUCT + AI + DEVELOPMENT` mandatory approvers, and leaves evidence/technical preparation to `AI + DEVELOPMENT` without unilateral authority. This preserves the repository-wide separation between governance decision authority, evidence execution and gate decisions.

## 8. Adversarial cases

1. **`identity_authority_verification_status` is used as numeric Owner Fit or in any Scoring/Risk/Qualification formula.** Rejected: it is a gate-only input; numeric/score/risk/ranking/hard-constraint use is prohibited.
2. **Matching Engine re-verifies or re-derives identity/authority from raw material.** Rejected: Matching never verifies and never receives raw documents/payloads; source ownership stays with the Identity/Authority Registry.
3. **Missing/unknown/stale/expired/revoked/invalidated projection blocks the whole tenant request, listing or Campaign.** Rejected: it fails closed only for the affected governed use.
4. **Missing projection is treated as a negative fact, automatic `INELIGIBLE` or rejection.** Rejected: fail-closed is not a negative result, route or display.
5. **An implementation reuses a projection as current after an applicable source-owned status/version/invalidation/revocation event.** Rejected: the previous value cannot be treated as current for the affected use; exact cache, refresh, TTL and invalidation-delivery mechanics remain `OPEN`.
6. **Consumption is expanded to a purpose/scope incompatible with the source registry grant.** Rejected: only purpose/scope-compatible read-only use is permitted; expansion needs separate approval.
7. **Raw identity/authority documents or raw verification evidence are written into a Data Contract, dataset, Match snapshot or presentation output.** Rejected. A possible future carrier for the approved versioned status/ref remains separately `OPEN`; this record neither prohibits nor approves its exact design.
8. **Feature Schema §8 class-5 row or §11 readiness is claimed `READY` because of this record.** Rejected: both remain `BLOCKED_PENDING_DECISION`/candidate pending separate sync and approvals.
9. **The Inventory status overlay is read as substantive approval.** Rejected: indexing is not approval; only this record resolves the boundary.
10. **A commit, merge, CI PASS, policy prose or manifest hash is cited as gate authority.** Rejected: none is a gate decision or authorization.

## 9. Затронутые артефакты — future separate sync only

- `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md` — §7.1 classification, §8 class-5 row and §10 row №5 may receive a future overlay referencing this boundary while preserving every exact/content dependency `OPEN` and all gates `BLOCKED`.
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — a future status overlay may record `FS-05 → XFR-D-004` as `PARTIALLY_RESOLVED_BOUNDARY` without changing canonical identity or the counts (102 source keys / 90 canonical IDs).
- No Scoring/Risk/Qualification Policy, Data Contract, manifest, sibling decision, runtime or application code is touched.

No sync is performed by this record. Feature Schema, Inventory, Policies, manifests, Data Contracts, sibling decisions, runtime and application code remain untouched.

## 10. Change control

Any change to source ownership, the read-only gate-only consumption boundary, the never-actions of §3.2/§3.3, the fail-closed rule, governance owner, mandatory approvers, evidence role or non-conflation boundary requires a new versioned `XFR-D-004` record with `supersedes`, approved by all five functions on the same version/hash — `Chief AI Architect + LEGAL` (owner) and `PRODUCT + AI + DEVELOPMENT` (mandatory approvers).

Exact enum, projection, API/event/schema/carrier, freshness/TTL, evidence, appointment/RBAC, operational content, Data Contract extension, runtime, implementation and gate decisions require their own evidence-backed authority and cannot be introduced by silent edit, policy sync, Inventory overlay, code, CI, commit, merge or deployment.

## 11. Gate impact

`NONE`.

- `ARCHITECTURE_APPROVAL_GATE`: not granted by this record and remains not established as passed.
- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**.
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**.
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**.

This record does not approve the Feature Schema Proposal, a Policy, a Data Contract, a dataset, production use, a Controlled Artifact Manifest entry, an acceptance report, a runtime, an implementation or a release.

## 12. Acceptance criteria

1. **Given** canonical identity, **when** checked, **then** it remains `FS-05 → XFR-D-004`, `PRIMARY_STANDALONE`, without Inventory count change.
2. **Given** governance roles, **when** checked, **then** owner is `Chief AI Architect + LEGAL`, mandatory approvers are `PRODUCT + AI + DEVELOPMENT`, and `AI + DEVELOPMENT` evidence/technical-procedure ownership has no unilateral approval authority.
3. **Given** `identity_authority_verification_status`, **when** Matching Engine consumes it, **then** consumption is a purpose/scope-compatible immutable versioned read-only gate-only input only.
4. **Given** the same fact, **when** numeric Owner Fit, Match Score, Risk, ranking or Hard Constraint use is attempted, **then** it is rejected.
5. **Given** the same fact, **when** Matching Engine verifies identity/authority or receives raw documents/payloads, **then** the action is rejected.
6. **Given** missing/unknown/stale/expired/revoked/invalidated/version-mismatched projection, **when** the affected governed use is evaluated, **then** it fails closed without coercion, guessed failure, automatic `INELIGIBLE`, rejection, invented fallback or unrelated block.
7. **Given** a status/version/revocation event, **when** an earlier projection value is used, **then** it is invalidated.
8. **Given** purpose/scope-incompatible use, **when** consumption is attempted, **then** it is not authorized by this record.
9. **Given** Feature Schema §8/§11 status, **when** `READY`/readiness is claimed from this record, **then** the claim is rejected.
10. **Given** the Inventory, **when** a status overlay is read as substantive approval, **then** the reading is rejected.
11. **Given** exact enum, projection, carrier, TTL, evidence, appointment/RBAC or operational consequence, **when** approval is requested from this record, **then** none is approved.
12. **Given** all gates, **when** status is checked, **then** Architecture approval is not granted here and `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` remain `BLOCKED`.

## 13. Итог

`XFR-D-004 PARTIALLY_RESOLVED_BOUNDARY — IDENTITY/AUTHORITY IS SOURCE-OWNED ONLY BY THE IDENTITY/AUTHORITY REGISTRY; MATCHING ENGINE MAY CONSUME ONLY A PURPOSE/SCOPE-COMPATIBLE IMMUTABLE VERSIONED READ-ONLY STATUS/REF AS GATE-ONLY INPUT AND NEVER VERIFIES IDENTITY/AUTHORITY, RECEIVES RAW DOCUMENTS OR USES THIS FACT AS NUMERIC OWNER FIT, MATCH SCORE, RISK, RANKING OR HARD CONSTRAINT RESULT; MISSING/UNKNOWN/STALE/EXPIRED/REVOKED/INVALIDATED/VERSION-MISMATCHED PROJECTION FAILS CLOSED ONLY FOR THE AFFECTED GOVERNED USE; EXACT STATUS ENUM, PROJECTION, CARRIER, FRESHNESS/TTL, EVIDENCE, APPOINTMENT/RBAC AND OPERATIONAL CONSEQUENCES REMAIN OPEN`
