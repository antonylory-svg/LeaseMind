# LeaseMind Matching Decision Record — XFR-D-007

**Decision ID:** `XFR-D-007`

**Название:** `business_stage_signal` fit-factor legitimacy

**Версия:** 1.0

**Дата решения:** 2026-09-09

**Decision status:** `APPROVED`

**Resolution status:** `RESOLVED_V0_1_SCOPE_BOUNDARY`

**Статус:** `APPROVED V0.1 SCOPE BOUNDARY — business_stage_signal EXCLUDED FROM ALL V0.1 MATCHING ENGINE USE (FIT/SCORING, RISK, FILTERING, HARD CONSTRAINT, ELIGIBILITY, CONFIDENCE, QUALIFICATION, RANKING AND PROXY INFERENCE); RAW request_business_stage UNCHANGED IN ITS SOURCE SNAPSHOT; FUTURE RE-ENTRY REQUIRES A SEPARATE VERSIONED LEGAL + PRODUCT DECISION WITH APPROVED PROTECTED/PROXY CLASSIFICATION, LAWFUL BASIS, PURPOSE AND EVIDENCE; NO RUNTIME/POLICY/DATA/IMPLEMENTATION APPROVAL; ALL THREE GATES REMAIN BLOCKED`

**Decision authority:** explicit human project-governance confirmation on 2026-09-09.

**Repository baseline:** `c4eae936f57b223bfe78df3c3ed8262f8de68aef`

**Scope:** `RESOLVED_V0_1_SCOPE_BOUNDARY` for `business_stage_signal` in the v0.1 Matching Engine — a governance scope-boundary decision only, corresponding to open decision №9 of the Matching Feature Schema Proposal (§10). Resolves only the qualitative boundary that `business_stage_signal` is excluded from all v0.1 Matching Engine use — no fit/scoring, Risk, filtering, Hard Constraint, eligibility, Confidence, Qualification or ranking use and no proxy inference — while raw `request_business_stage` remains unchanged in its source snapshot. Does not create or approve the Feature Schema Proposal or any of its content, a protected/proxy classification of any `request_business_stage` code point, a lawful basis, a purpose, an evidence procedure, a Scoring/Risk/Qualification formula, a Policy/Data Contract/manifest approval, a dataset, a production run, a runtime, an implementation or any gate transition.

**Canonical identity:** `FS-09 → XFR-D-007`, `PRIMARY_STANDALONE` (`LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` §4.1, row `FS-09`). This record does not change that mapping or the Inventory counts of 102 source keys / 90 canonical IDs.

**Governance owner:** `LEGAL + PRODUCT` — human-approved decision-specific assignment consistent with the owner listed for open decision №9 in Feature Schema Proposal §10 (row №9). Neither Architecture nor the Feature Schema Proposal assigns this exact decision owner as a norm; the Proposal row remains a candidate assignment until separately approved and is not substantive authority by itself.

**Mandatory approvers:** `Chief AI Architect + AI + DEVELOPMENT`.

**Evidence/technical-procedure owner:** `AI + DEVELOPMENT`; this role may prepare and verify evidence and candidate technical procedures only and has no unilateral authority to approve any content this record leaves `OPEN`.

**Depends on:** Feature Schema Proposal §6.4 (diagnostic-only/blocked/excluded soft-candidates row for `business_stage_signal`), §10 (open decision row №9) and §11.1 (readiness matrix `EXCLUDED_FROM_V0_1`). The Feature Schema §6.4 row names Architecture §14.3 условие 4 and §30.2 and the intersection with the Risk Score §17 «операционная несовместимость» as the proxy-risk context requiring a LEGAL + PRODUCT decision before any inclusion; raw `request_business_stage` maps to `subject_snapshot.business_stage` in `02_PRODUCT/CAMPAIGN_TECHNICAL_ASSIGNMENT.md` (enum, data classification `commercial_data`). Risk Policy §13 open decision №9 / canonical `MRP-09 → XFR-D-054` retains authority over the future protected/proxy classification catalog and lawful basis per otherwise admissible non-protected feature/use. `XFR-D-009 v1.0` (unsupported derived location/occupancy signals excluded from v0.1) remains an independent `RESOLVED_V0_1_SCOPE_BOUNDARY` precedent and is not merged, reopened or absorbed here. Every dependency remains independently governed.

---

## 1. Вопрос

Open decision №9 of the Matching Feature Schema Proposal (§10) reads (verbatim): «Правомерность `business_stage_signal` как fit-фактора (не Risk-фактора и не запрещённого proxy)».

Feature Schema §6.4 classifies `business_stage_signal` as `EXCLUDED_FROM_V0_1`, noting that `request_business_stage` is a `subject_snapshot` fact (не `soft_preferences`) and that the risk of the signal functioning as a proxy of operational risk/creditworthiness (intersection with the Risk Score §17 «операционная несовместимость» in the Architecture) requires a LEGAL + PRODUCT decision before inclusion (§14.3 условие 4, §30.2). This record is that LEGAL + PRODUCT decision, limited to the v0.1 scope boundary below; it does not approve any Feature Schema content.

## 2. Source/status discipline

1. The Matching Feature Schema document carries the status `Proposal for cross-functional review — does not authorize implementation`. Its §6.4/§10/§11 are proposal content until separately approved; §10 is an open-decision register whose rows record candidate owners, not norms.
2. Inventory §4.1 indexes the question as canonical mapping `FS-09 → XFR-D-007`, `PRIMARY_STANDALONE`, «`business_stage_signal` fit-factor legitimacy». Inventory indexes and routes; it is not the source of the substantive decision, does not approve the Proposal and does not pass a gate.
3. `02_PRODUCT/CAMPAIGN_TECHNICAL_ASSIGNMENT.md` is the field-level bootstrap source: `request_business_stage` (enum, `commercial_data`) is collected and mapped to `subject_snapshot.business_stage` in the analysis snapshot. The CTA does not create `business_stage_signal`; the candidate soft signal and its `EXCLUDED_FROM_V0_1` classification are Feature Schema Proposal content.
4. Feature Schema §11.1 readiness row `EXCLUDED_FROM_V0_1` lists `business_stage_signal` as fit-factor; §10 row №9 remains an open decision row owned `LEGAL + PRODUCT`. This record is the substantive resolution of that indexed question, not its creation, and does not by itself rewrite any Proposal row.
5. The proxy-risk concern named in §6.4 — operational risk/creditworthiness proxy intersection, §14.3 условие 4 and §30.2 — is the rationale for the exclusion boundary; it is not a protected/proxy classification verdict and does not determine lawful basis, purpose or evidence.

## 3. Решение

### 3.1. Governance roles и разделение authority

1. Governance owner of the `business_stage_signal` v0.1 scope boundary — `LEGAL + PRODUCT`.
2. Mandatory approvers — `Chief AI Architect + AI + DEVELOPMENT`.
3. Evidence/technical-procedure owner — `AI + DEVELOPMENT`; эта роль готовит/проверяет evidence и candidate technical procedures, но не получает unilateral approval authority над любым `OPEN`-содержимым ниже.
4. Source ownership, governance ownership, evidence preparation, data authority, policy approval и gate decision — разные authority layers; ни один слой не заменяет другой.

### 3.2. `business_stage_signal` excluded from all v0.1 Matching Engine use

1. `business_stage_signal` is `EXCLUDED_FROM_V0_1` and is not part of the v0.1 Matching Engine composition in any role: no fit/scoring, no Risk, no filtering, no Hard Constraint, no eligibility, no Confidence, no Qualification, no ranking and no proxy inference.
2. No Scoring/Risk/Qualification/feature formula or condition references `business_stage_signal` in consequence of this record; no active FeatureValue for it is produced in v0.1.
3. The exclusion covers fit-factor, Risk-factor and any other proxy use: no v0.1 Matching Engine component infers operational risk, creditworthiness or an analogous status from `request_business_stage`.
4. This record does not classify `business_stage_signal` or any `request_business_stage` code point as a protected/proxy category; that classification remains `OPEN` and separately governed.

### 3.3. Raw-input preservation boundary

Excluded is the signal/candidate use, не исходный пользовательский факт:

1. raw `request_business_stage` remains unchanged in its source snapshot: it continues to be collected, validated and stored in the existing `subject_snapshot.business_stage` Technical Assignment mapping, without modification by this record;
2. the raw fact is not removed, ignored, renamed, reclassified or re-mapped by this record;
3. the exclusion does not produce `PASS`/`FAIL`/`UNKNOWN`, score, routing result, automatic `INELIGIBLE`, rejection or any other Matching Engine outcome.

### 3.4. Approved v0.1 scope boundary only — не content/classification approval

`XFR-D-007` получает `RESOLVED_V0_1_SCOPE_BOUNDARY`. Human-approved here: exclusion of `business_stage_signal` from all v0.1 Matching Engine use (§3.2); raw-input preservation (§3.3); governance/approver/evidence-role separation (§3.1). Как `RESOLVED_V0_1_SCOPE_BOUNDARY`, текущий состав v0.1 определён однозначно; возможное будущее возвращение сигнала является отдельным downstream-вопросом, а не незавершённостью этой v0.1-границы. Protected/proxy classification, lawful basis, purpose, evidence, exact future fit/risk mechanism и все exact/content/operational элементы остаются `OPEN`, как перечислено в §6.

### 3.5. Future re-entry

Returning `business_stage_signal` to any v0.1+ Matching Engine use requires a separate versioned `LEGAL + PRODUCT` governance decision that consumes the then-applicable approved `XFR-D-054` protected/proxy classification and lawful-basis boundary for the affected code points/use, plus an approved purpose and evidence package, and passes the applicable reviews; it receives no implementation authorization automatically from this record. This dependency does not pre-approve or predetermine `XFR-D-054`.

### 3.6. Preservation of independent dependencies

Этот record не переоткрывает, не поглощает, не подменяет и не fully resolves:

1. Feature Schema open decision rows other than №9 and all §8/§11 content not resolved here, including §11.1 readiness rows that remain candidate/blocked content pending separate sync;
2. `XFR-D-009 v1.0` (unsupported derived location/occupancy signals exclusion) — independent precedent with its own raw-input preservation and re-entry boundaries;
3. Risk Policy and Risk Score content beyond the §6.4-named rationale, including Risk Policy §13 open decision №9 / `XFR-D-054` protected/proxy classification catalog and lawful-basis work;
4. Data Contracts extension, carrier, runtime, implementation, release и каждый gate decision.

## 4. Layer/authority table

| Layer | Authority | Resolved by this record | Remains `OPEN` |
|---|---|---|---|
| Canonical identity | Inventory §4.1 | `FS-09 → XFR-D-007`, `PRIMARY_STANDALONE`, preserved | Inventory future status overlay |
| Governance ownership | `LEGAL + PRODUCT`; approvers `Chief AI Architect + AI + DEVELOPMENT` | Role split and v0.1 scope boundary | Named identities/RBAC if ever required operationally |
| Source ownership | CTA field-level mapping (`request_business_stage` → `subject_snapshot.business_stage`) | Raw fact preserved unchanged; no re-mapping/removal | Any future code-point/classification change |
| Evidence/technical procedure | `AI + DEVELOPMENT` | Non-unilateral evidence role | Exact evidence package/procedure for any future re-entry |
| Matching consumption | `EXCLUDED_FROM_V0_1`, Feature Schema §6.4/§11.1 | All v0.1 use excluded; proxy inference prohibited | Any future fit/risk mechanism and exact semantics; applicable `XFR-D-054` classification/lawful-basis decision |
| Policies/Data Contracts/runtime/release | Downstream controlled artifacts and gates | No automatic effect | All content |
| Gate decisions | Architecture | No gate effect | Every gate transition and acceptance report |

## 5. Обязательные non-conflations

1. Exclusion of `business_stage_signal` from v0.1 Matching Engine use ≠ removal, renaming, ignoring или re-mapping of raw `request_business_stage`.
2. `business_stage_signal` ≠ fit/scoring, Risk, filtering, Hard Constraint, eligibility, Confidence, Qualification или ranking input in v0.1.
3. `EXCLUDED_FROM_V0_1` (design-time registry readiness) ≠ runtime `value_state`, `PASS`/`FAIL`, score, routing или automatic `INELIGIBLE`.
4. Proxy-risk rationale ≠ protected/proxy classification verdict, lawful basis, purpose или evidence approval.
5. No proxy inference ≠ negative fact, guessed failure или invented fallback.
6. `XFR-D-007` ≠ approval of the Feature Schema Proposal or any Policy/Data Contract/dataset/manifest entry.
7. Inventory indexing `FS-09 → XFR-D-007` ≠ substantive approval.
8. Governance owner ≠ mandatory approver ≠ evidence/technical-procedure owner ≠ data authority or gate authority.
9. `RESOLVED_V0_1_SCOPE_BOUNDARY` ≠ feature `READY` or future re-entry pre-approval.
10. `XFR-D-009 v1.0` precedent ≠ this record; each exclusion question is governed separately.
11. `XFR-D-007` v0.1 exclusion ≠ `XFR-D-054` protected/proxy catalog or lawful-basis decision; neither substitutes for the other.
12. Commit/merge/CI/Inventory/hash presence ≠ gate approval.

## 6. Что остаётся `OPEN`

- protected/proxy classification of `business_stage_signal` and of any `request_business_stage` code point/use under Risk Policy §13 open decision №9 / `XFR-D-054`;
- lawful basis under `XFR-D-054`, plus purpose and evidence for any future inclusion;
- any future fit direction/form, Risk cross-link, eligibility/Confidence/Qualification/ranking mechanism and exact semantics if re-entry is ever approved;
- enum value definitions, expansion or re-classification of `request_business_stage`;
- Feature Schema §6.4/§8/§10/§11 overlay and Inventory future status overlay;
- open decision rows other than №9 and all other §10 content not resolved here;
- Data Contracts extension, runtime, implementation, release и каждый gate transition.

## 7. Rationale

`request_business_stage` is a CTA-mandated `commercial_data` fact collected for the Campaign, not a Matching-specific soft preference. Feature Schema §6.4 records the risk that transforming it into a `business_stage_signal` used as a fit factor could function as a proxy of operational risk/creditworthiness (intersection with the Risk Score §17 «операционная несовместимость») and makes inclusion conditional on a LEGAL + PRODUCT decision under §14.3 условие 4 and §30.2. The source does not classify the raw field itself as protected/proxy or otherwise «legally sensitive by nature». The narrow v0.1 boundary — exclusion of the derived signal from all Matching use, raw-source preservation, and a defined re-entry path through `XFR-D-054` plus a separate use-specific decision — avoids inventing that classification while evidence and lawful-basis work remain open.

## 8. Adversarial cases

1. **`business_stage_signal` is used in a v0.1 Scoring/Risk/Qualification formula, filter, Hard Constraint, eligibility, Confidence or ranking step.** Rejected: it is excluded from all v0.1 Matching Engine use.
2. **A component infers operational risk, creditworthiness or an analogous status from `request_business_stage`.** Rejected: no proxy inference is permitted.
3. **The exclusion is implemented by dropping, ignoring or renaming raw `request_business_stage`.** Rejected: the raw fact remains unchanged in its existing `subject_snapshot.business_stage` mapping.
4. **This record is cited as an approved protected/proxy classification, lawful basis, purpose or evidence for a future use.** Rejected: all remain `OPEN`; classification/lawful basis stay under `XFR-D-054`, and re-entry additionally requires a separate versioned use-specific `LEGAL + PRODUCT` decision.
5. **Absence of the signal is treated as a negative fact, automatic `INELIGIBLE`, rejection or invented fallback.** Rejected: exclusion produces no Matching Engine outcome.
6. **Feature Schema §10 row №9 or §11 readiness is claimed resolved/`READY` from this record.** Rejected: the Proposal row and readiness content change only through a future separate sync; this record is the substantive boundary decision, not a row edit.
7. **The Inventory status overlay is read as substantive approval.** Rejected: indexing is not approval.
8. **`XFR-D-009 v1.0` exclusion semantics are imported as authority for `business_stage_signal`.** Rejected: that record governs location/occupancy signals only; this record governs `business_stage_signal`.
9. **A commit, merge, CI PASS, policy prose or manifest hash is cited as gate authority or re-entry approval.** Rejected: none is a gate decision or authorization.

## 9. Затронутые артефакты — future separate sync only

- `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md` — §6.4 `business_stage_signal` row, §10 row №9 and §11 readiness/acceptance content may receive a future overlay referencing this boundary as `RESOLVED_V0_1_SCOPE_BOUNDARY` while preserving every exact/content dependency `OPEN` and all gates `BLOCKED`.
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — a future status overlay may record `FS-09 → XFR-D-007` as `RESOLVED_V0_1_SCOPE_BOUNDARY` without changing canonical identity or the counts (102 source keys / 90 canonical IDs).
- No Scoring/Risk/Qualification Policy, Data Contract, manifest, sibling decision, runtime or application code is touched. `XFR-D-004` is preserved and untouched.

No sync is performed by this record. Feature Schema, Inventory, Policies, manifests, Data Contracts, sibling decisions, runtime and application code remain untouched.

## 10. Change control

Any change to the v0.1 exclusion boundary, the raw-input preservation rule, the no-proxy-inference rule, governance owner, mandatory approvers, evidence role or non-conflation boundary requires a new versioned `XFR-D-007` record with `supersedes`, approved by all five functions on the same version/hash — `LEGAL + PRODUCT` (owner) and `Chief AI Architect + AI + DEVELOPMENT` (mandatory approvers).

Protected/proxy classification and lawful basis under `XFR-D-054`, purpose, evidence, exact future fit/risk mechanism, Data Contract extension, runtime, implementation and gate decisions require their own evidence-backed authority and cannot be introduced by silent edit, policy sync, Inventory overlay, code, CI, commit, merge or deployment.

## 11. Gate impact

`NONE`.

- `ARCHITECTURE_APPROVAL_GATE`: not granted by this record and remains not established as passed.
- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**.
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**.
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**.

This record does not approve the Feature Schema Proposal, a Policy, a Data Contract, a dataset, production use, a Controlled Artifact Manifest entry, an acceptance report, a runtime, an implementation or a release.

## 12. Acceptance criteria

1. **Given** canonical identity, **when** checked, **then** it remains `FS-09 → XFR-D-007`, `PRIMARY_STANDALONE`, without Inventory count change.
2. **Given** governance roles, **when** checked, **then** owner is `LEGAL + PRODUCT`, mandatory approvers are `Chief AI Architect + AI + DEVELOPMENT`, and `AI + DEVELOPMENT` evidence/technical-procedure ownership has no unilateral approval authority.
3. **Given** `business_stage_signal`, **when** v0.1 fit/scoring, Risk, filtering, Hard Constraint, eligibility, Confidence, Qualification or ranking use is attempted, **then** the use is rejected.
4. **Given** `request_business_stage`, **when** proxy inference of operational risk, creditworthiness or an analogous status is attempted, **then** the inference is rejected.
5. **Given** raw `request_business_stage`, **when** the source snapshot is checked, **then** it remains unchanged in its existing `subject_snapshot.business_stage` mapping.
6. **Given** the exclusion, **when** a runtime outcome is requested, **then** no `PASS`/`FAIL`/`UNKNOWN`, score, routing result or automatic `INELIGIBLE` is produced.
7. **Given** a proposed future re-entry, **when** approval is requested, **then** it requires a separate versioned `LEGAL + PRODUCT` decision with approved protected/proxy classification, lawful basis, purpose and evidence.
8. **Given** Feature Schema §10 row №9/§11 status, **when** `READY`/resolved status is claimed from this record, **then** the claim is rejected.
9. **Given** the Inventory, **when** a status overlay is read as substantive approval, **then** the reading is rejected.
10. **Given** protected/proxy classification, lawful basis, purpose, evidence, runtime/policy/data/implementation content, **when** approval is requested from this record, **then** none is approved.
11. **Given** all gates, **when** status is checked, **then** Architecture approval is not granted here and `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` remain `BLOCKED`.

## 13. Итог

`XFR-D-007 RESOLVED_V0_1_SCOPE_BOUNDARY — business_stage_signal EXCLUDED FROM ALL V0.1 MATCHING ENGINE USE (FIT/SCORING, RISK, FILTERING, HARD CONSTRAINT, ELIGIBILITY, CONFIDENCE, QUALIFICATION, RANKING AND PROXY INFERENCE); RAW request_business_stage UNCHANGED IN ITS SOURCE SNAPSHOT; FUTURE RE-ENTRY REQUIRES A SEPARATE VERSIONED LEGAL + PRODUCT DECISION WITH APPROVED PROTECTED/PROXY CLASSIFICATION, LAWFUL BASIS, PURPOSE AND EVIDENCE; NO RUNTIME/POLICY/DATA/IMPLEMENTATION APPROVAL`
