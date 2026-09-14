# LeaseMind Matching Decision Record — XFR-D-054

**Decision ID:** `XFR-D-054`

**Название:** Protected/proxy classification and lawful-basis two-stage governance boundary

**Версия:** 1.0

**Дата решения:** 2026-09-14

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED QUALITATIVE TWO-STAGE PROTECTED/PROXY CLASSIFICATION THEN LAWFUL-SOURCE/BASIS GOVERNANCE BOUNDARY — ALL TAXONOMY, CLASSIFICATION, PROXY METHOD, LAWFUL CATALOG/DETERMINATION, PURPOSE, EVIDENCE, REVIEWER/RBAC, DATA, CONTRACT, CARRIER, RISK→QUALIFICATION, RUNTIME AND IMPLEMENTATION CONTENT REMAIN OPEN`

**Decision authority:** human project-governance confirmation on 2026-09-14

**Repository baseline:** `ac1191324dc88149764679583e434eeac7bc9281`

**Canonical identity:** `MRP-09 → XFR-D-054`, `PRIMARY_STANDALONE` (Inventory §4.3). Canonical mapping and Inventory counts remain unchanged at 102 source keys / 90 canonical IDs.

**Scope:** qualitative authority/order/fail-closed boundary for protected/proxy classification and the separate lawful-source/lawful-basis determination for an exact feature/source/use/purpose. No taxonomy, actual classification, proxy detector, lawful-source catalog, lawful-basis determination, purpose, evidence package, contract, carrier, Risk/Qualification rule, runtime or implementation is approved.

**Governance owner:** `LEGAL + PRODUCT` — human-approved assignment derived from Risk Policy §13 row 9; it is not claimed as `SOURCE_NORMATIVE` for this entire decision.

**Source-normative lawful authority:** `LEGAL` separately remains the source-normative owner for lawful-source/lawful-basis decisions under Architecture §37 question 7. This authority is not replaced or diluted by the candidate-derived governance-owner pair.

**Risk Policy artifact owner:** `Chief AI Architect + LEGAL` — source-normative under Architecture §52 and separate from decision-specific governance and lawful determination.

**Mandatory approvers:** `Chief AI Architect + AI + DEVELOPMENT`.

**Evidence/technical-procedure owner:** `AI + DEVELOPMENT`; this role may prepare classification/detection/evidence candidates but has no unilateral legal, product, policy, data, runtime, implementation or gate authority.

**Depends on and preserves:** Architecture §17 unconditional protected/proxy prohibition; `XFR-D-014` no-final-LEGAL-verdict boundary; `XFR-D-016` Lawful Basis Registry mechanism; `XFR-D-047`–`XFR-D-051`, `XFR-D-055`, `XFR-D-M2`, `XFR-D-M3`, `XFR-D-064`, `XFR-D-067` and `XFR-D-068` remain independent. No classification or lawful determination is inherited from them.

---

## 1. Вопрос

Какая protected/proxy classification catalog и lawful-basis governance boundary применяется к допустимому non-protected feature в Risk?

## 2. Source/status discipline

1. Inventory indexes `MRP-09 → XFR-D-054`, `PRIMARY_STANDALONE`; indexing is not approval.
2. Architecture §17 source-normatively prohibits Risk Score from using protected attributes or proxies without exception.
3. Architecture §37 question 7 source-normatively assigns lawful-source/lawful-basis authority to `LEGAL`; it does not supply a classification catalog or determinations.
4. Risk Policy §8 proposes the correct two-stage separation but is itself a Proposal; §13 row 9 remains an open candidate assignment until this narrow record.
5. Architecture lawful-basis registry status and projection mechanics describe source state/consumption, not a legal determination that a feature/use is non-protected or lawful.

## 3. Решение

### 3.1. Authority split

1. Governance owner is `LEGAL + PRODUCT`, candidate-derived and not `SOURCE_NORMATIVE` for the entire decision.
2. `LEGAL` separately retains source-normative lawful-source/lawful-basis authority.
3. Mandatory approvers are `Chief AI Architect + AI + DEVELOPMENT`.
4. Risk Policy artifact owner remains `Chief AI Architect + LEGAL`.
5. Evidence/technical-procedure owner is `AI + DEVELOPMENT`, without unilateral authority.
6. Future exact content requires all five functions to approve the same immutable version/hash and evidence package, without transferring the final legal determination away from `LEGAL`.

### 3.2. Mandatory two-stage order

For each exact feature/source/use/purpose/version:

1. Stage 1: separately authorized protected/proxy classification is completed first.
2. Only a positively confirmed non-protected/non-proxy candidate may proceed.
3. Stage 2: `LEGAL` makes a separate lawful-source/lawful-basis determination for that exact feature/source/use/purpose.
4. Passing one stage never implies, waives or supplies the other.
5. A determination for one version, source, use, purpose, segment or context does not transfer to another.

The order/authority boundary is approved; all actual classifications and lawful determinations remain `OPEN`.

### 3.3. Unconditional exclusion

1. A feature confirmed as protected or proxy is excluded unconditionally from the affected Risk use.
2. Lawful basis, consent, business need, predictive value, model performance, fairness diagnostic or human convenience cannot override Architecture §17.
3. Exclusion does not itself create a negative fact, violation, sanction, rejection, `INELIGIBLE`, Qualification route or legal conclusion about a party.
4. Exact broader effects, retention and remediation remain separately governed.

### 3.4. Fail-closed affected-use-only boundary

Missing, unknown, unclassified, ambiguous, stale, conflicting or version/scope/purpose-incompatible classification or lawful material:

1. blocks the affected feature/source/use/purpose from proceeding;
2. is not guessed, defaulted or inferred as protected, non-protected, lawful or unlawful;
3. creates no negative fact, failure, rejection, automatic `INELIGIBLE`, Risk value, Qualification route or legal outcome;
4. does not automatically block unrelated features/uses or erase available provenance;
5. leaves exact status, cascade, recovery, reviewer and operational behavior `OPEN`.

### 3.5. No automated or diagnostic legal authority

None of the following determines protected/proxy classification or lawful source/basis:

1. AI/LLM inference, heuristic or similarity;
2. proxy detector, anomaly/deduplication/re-identification signal or Risk output;
3. fairness/segment diagnostic or statistical result;
4. model performance, feature importance or correlation;
5. CI, code, conventional taxonomy or implementation default;
6. an `ACTIVE` Lawful Basis Registry projection alone.

`ACTIVE` means only that the source registry reports its status for the represented scope/version/purpose. It does not establish that a feature is non-protected, that the source/use is legally permissible, or that the projection is applicable to a different context.

### 3.6. Independent mechanism and diagnostic boundaries

1. `XFR-D-016` governs only Lawful Basis Registry source/projection mechanism and cannot make a lawful-basis determination under this record.
2. `XFR-D-014` issues no final classification/verdict for any of the 20 Feature Hard Constraint candidates.
3. `XFR-D-M3` re-identification method/threshold is a privacy-risk question, not this classification or lawful-basis catalog.
4. `XFR-D-064` segment coverage is evidence sufficiency, not legal classification.
5. `XFR-D-068` fairness diagnostics/legal-standard governance does not determine this two-stage verdict.
6. `XFR-D-067` or any data-eligibility authority does not replace named determination, appointment or RBAC.
7. Risk→Qualification mappings remain independent under `XFR-D-055`/`XFR-D-M2`.

### 3.7. Partial, never full resolution

`XFR-D-054` receives `PARTIALLY_RESOLVED_BOUNDARY`: authority separation, mandatory two-stage order, positive non-protected prerequisite, unconditional protected/proxy exclusion, no lawful-basis override, affected-use fail-closed handling and no automated/diagnostic legal authority are approved qualitatively.

All taxonomy/catalog, actual classifications, proxy methods, lawful-source catalog/determinations, purposes, evidence, reviewer/RBAC, data, contract, carrier, Risk→Qualification, runtime and implementation contents remain `OPEN`.

## 4. Layer and authority table

| Layer | Preserved authority | Approved here | Remains `OPEN` |
|---|---|---|---|
| Canonical identity | Inventory §4.3 | `MRP-09 → XFR-D-054`, `PRIMARY_STANDALONE` | Future status overlay |
| Governance | `LEGAL + PRODUCT`; approvers `Chief AI Architect + AI + DEVELOPMENT` | Role/order boundary | Exact content verdicts |
| Lawful-source/basis determination | `LEGAL`, source-normative | Authority preserved | Actual per-use determinations/catalog |
| Risk Policy artifact | `Chief AI Architect + LEGAL` | No artifact approval | Policy approval |
| Protected/proxy ban | Architecture §17 | Unconditional, no waiver | Taxonomy and classifications |
| Registry mechanism | `XFR-D-016` | No conflation | Exact projection/contract contents |
| Diagnostics/data | `XFR-D-M3`/`064`/`067`/`068` | No legal-authority transfer | Exact methods/evidence/appointments |
| Runtime/production/gates | Separate authorities | No authorization | Carrier/implementation/release |

## 5. Обязательные non-conflations

1. Protected/proxy classification ≠ lawful-source/lawful-basis determination.
2. Confirmed non-protected ≠ automatically lawful for use.
3. Lawful basis ≠ waiver of protected/proxy prohibition.
4. `ACTIVE` registry status ≠ legal applicability determination.
5. AI/heuristic/proxy detector/fairness diagnostic ≠ legal classification or verdict.
6. Exclusion of a feature ≠ adverse conclusion about a party.
7. Governance owner ≠ Risk artifact owner ≠ source-normative `LEGAL` authority ≠ evidence owner.
8. Data eligibility/coverage ≠ classification, lawful basis or runtime permission.

## 6. Что остаётся `OPEN`

- protected/proxy taxonomy and classification catalog;
- actual classification of every feature/source/use/purpose/version;
- proxy detection methods, candidates, thresholds and evidence sufficiency;
- lawful-source/lawful-basis catalogs and every actual determination;
- processing purposes, scope/version compatibility and mapping;
- evidence package, reviewer/appointing authority, RBAC, quorum, appeal and correction;
- dataset/segment/fairness/privacy/re-identification content;
- Data Contract, schema/API/event/DB/storage/transport carrier;
- Risk→Qualification mapping/route and reason references;
- policy/manifest/production/runtime/implementation and gates.

## 7. Rationale

Classification and lawful basis answer different questions. Requiring positive non-protected classification before a separate lawful determination prevents an `ACTIVE` registry status or favorable diagnostic from becoming an unsafe waiver of Architecture's absolute protected/proxy prohibition.

## 8. Adversarial cases

1. **An `ACTIVE` projection is treated as proof the feature is allowed.** Rejected: it is only source status for its recorded scope.
2. **Lawful basis overrides a confirmed proxy classification.** Rejected: exclusion is unconditional.
3. **AI infers “non-protected” from a field name.** Rejected: no automated determination authority exists.
4. **A fairness diagnostic supplies the legal classification.** Rejected.
5. **Missing classification defaults to protected or non-protected.** Rejected: the affected use blocks without adverse inference.
6. **A decision for one purpose is reused for another.** Rejected: each exact feature/source/use/purpose/version is separate.
7. **Feature exclusion automatically rejects the party.** Rejected: no negative/legal/Qualification consequence follows.

## 9. Затронутые артефакты — future separate sync only

- Risk Policy and Inventory may later receive a status overlay preserving all actual classification/lawful contents `OPEN`.
- No Proposal, Policy, Data Contract, dataset, Evaluation Plan, manifest, sibling record, runtime or code is changed here.

No sync is performed by this record. Risk Policy, Inventory, other Policies, manifests, Data Contracts, sibling records, runtime and application code remain untouched.

## 10. Change control

Any change to this qualitative boundary requires a new versioned `XFR-D-054` record with `supersedes`, approved by all five functions on the same immutable version/hash: `LEGAL + PRODUCT` and `Chief AI Architect + AI + DEVELOPMENT`. The separate source-normative `LEGAL` lawful-source/lawful-basis authority remains mandatory.

## 11. Gate impact

`NONE`.

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**.
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**.
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**.

This record approves no Proposal, Policy, Data Contract, dataset, Evaluation Plan/run/result, production-data use, manifest, runtime, implementation or release.

## 12. Acceptance criteria

1. Canonical identity is `MRP-09 → XFR-D-054`, `PRIMARY_STANDALONE`; counts remain 102/90.
2. Governance owner/approvers/evidence role match the header; `LEGAL` separately retains source-normative lawful authority.
3. Protected/proxy classification occurs first; only positively confirmed non-protected candidates proceed to separate lawful determination.
4. Confirmed protected/proxy means unconditional affected-use exclusion; lawful basis cannot override.
5. Missing/unknown/unclassified/ambiguous/stale/conflicting material blocks affected use without negative/rejection/`INELIGIBLE` inference.
6. AI/heuristic/proxy detector/fairness diagnostic/`ACTIVE` registry status makes neither legal determination.
7. All taxonomy/classification/method/lawful catalog/determination/purpose/evidence/reviewer/data/contract/carrier/runtime content remains `OPEN`.
8. Named dependencies remain independent; no policy/data/runtime approval is introduced.
9. All three gates remain `BLOCKED`.

## 13. Итог

`XFR-D-054 PARTIALLY_RESOLVED_BOUNDARY — PROTECTED/PROXY CLASSIFICATION OCCURS FIRST; ONLY POSITIVELY CONFIRMED NON-PROTECTED CANDIDATES MAY PROCEED TO A SEPARATE LEGAL LAWFUL-SOURCE/BASIS DETERMINATION FOR THE EXACT FEATURE/SOURCE/USE/PURPOSE; CONFIRMED PROTECTED/PROXY MEANS UNCONDITIONAL EXCLUSION AND LAWFUL BASIS CANNOT OVERRIDE; MISSING/UNKNOWN/UNCLASSIFIED/AMBIGUOUS/STALE/CONFLICTING MATERIAL BLOCKS THE AFFECTED USE WITHOUT ADVERSE INFERENCE; AI/HEURISTICS/DIAGNOSTICS/ACTIVE REGISTRY STATUS CREATE NO LEGAL DETERMINATION; ALL EXACT CONTENT REMAINS OPEN`
