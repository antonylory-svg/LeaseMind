# LeaseMind Matching Decision Record — XFR-D-049

**Decision ID:** `XFR-D-049`

**Название:** Per-factor Risk evidence-sufficiency governance boundary

**Версия:** 1.0

**Дата решения:** 2026-09-14

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED QUALITATIVE PER-FACTOR EVIDENCE-SUFFICIENCY BOUNDARY — EXACT CATALOGS, LEVELS, MAPPINGS, CRITICALITY, REVIEWER/RBAC, NUMERIC, DATASET, CARRIER, RUNTIME AND IMPLEMENTATION CONTENT REMAIN OPEN`

**Decision authority:** human project-governance confirmation on 2026-09-14

**Repository baseline:** `ac1191324dc88149764679583e434eeac7bc9281`

**Canonical identity:** `MRP-03 → XFR-D-049`, `PRIMARY_STANDALONE` (Inventory §4.3). Canonical mapping and Inventory counts remain unchanged at 102 source keys / 90 canonical IDs.

**Scope:** qualitative governance boundary for assessing evidence sufficiency separately per Risk factor/category/source/use/purpose/version. It does not approve a sufficiency catalog, hierarchy, numeric score, category criticality, reviewer mapping, dataset or runtime carrier.

**Governance owner:** `AI + LEGAL` — human-approved assignment derived from Risk Policy §13 row 3; it is not claimed as `SOURCE_NORMATIVE`.

**Risk Policy artifact owner:** `Chief AI Architect + LEGAL` — source-normative under Architecture §52 and separate from decision-specific governance.

**Mandatory approvers:** `Chief AI Architect + PRODUCT + DEVELOPMENT`.

**Evidence/technical-procedure owner:** `AI + DEVELOPMENT`; this role may prepare evidence candidates and tests but has no unilateral authority to set sufficiency, criticality, reviewer consequences, policy/runtime/production/implementation or a gate.

**Depends on and preserves:** Architecture §13 exact evidence-status enum; `XFR-D-048` multi-component/conditional non-compensation; `XFR-D-047`, `XFR-D-050`–`XFR-D-055`, `XFR-D-M1`, `XFR-D-M2` and `XFR-D-M4` remain independent. `XFR-D-M1` feature required-evidence governance is not imported into Risk by analogy.

---

## 1. Вопрос

Какая evidence sufficiency требуется отдельно для каждого Risk factor/category, automatic signal и случая обязательного human confirmation?

## 2. Source/status discipline

1. Inventory indexes `MRP-03 → XFR-D-049`, `PRIMARY_STANDALONE`; indexing is not approval.
2. Architecture §13 defines exactly seven evidence statuses: `UNVERIFIED`, `SOURCE_CONFIRMED`, `CONTENT_VERIFIED`, `CONFLICTING`, `STALE`, `REJECTED`, `HUMAN_REVIEW_REQUIRED`.
3. The seven values are categorical source semantics, not an ordered ladder, numeric scale, sufficiency score or universal mapping.
4. Architecture requires facts, assumptions/inferences, conclusions/signals and Risk to remain separately attributable; Risk or AI output does not become a confirmed fact.
5. Risk Policy is a Proposal. Its ten-category table and examples do not approve per-factor sufficiency.

## 3. Решение

### 3.1. Authority split

1. Governance owner is `AI + LEGAL`, candidate-derived and not `SOURCE_NORMATIVE`.
2. Mandatory approvers are `Chief AI Architect + PRODUCT + DEVELOPMENT`.
3. Risk Policy artifact owner remains `Chief AI Architect + LEGAL`.
4. Evidence/technical-procedure owner is `AI + DEVELOPMENT`, without unilateral authority.
5. Future exact content requires all five functions to approve the same immutable version/hash and evidence package.

### 3.2. Per-context sufficiency only

Evidence sufficiency must be decided separately for the exact combination of:

1. Risk factor/category;
2. source and source authority;
3. governed use and processing purpose;
4. applicable rule/policy version and hash;
5. current compatible provenance and evidence state.

Sufficiency in one factor, category, source, purpose or version does not transfer to another by similarity, shared field, reuse, aggregation or precedent.

### 3.3. Provenance/current/compatible prerequisite

Evidence considered for a future Risk use must be attributable, current for that use, scope/purpose-compatible and bound to identifiable source/evidence/rule versions. Missing provenance, stale or conflicting material, a mismatched version/hash or unauthorized purpose cannot be repaired by AI inference, confidence, aggregate Risk or a convenient fallback.

These are prerequisites for future review, not an approval of exact evidence contents or sufficiency levels.

### 3.4. Exact evidence enum preserved without ordering

1. The exact Architecture §13 values remain unchanged: `UNVERIFIED`, `SOURCE_CONFIRMED`, `CONTENT_VERIFIED`, `CONFLICTING`, `STALE`, `REJECTED`, `HUMAN_REVIEW_REQUIRED`.
2. No value is assigned an ordinal rank, numeric weight or universal stronger/weaker relationship here.
3. No automatic mapping from validation, parser success, AI confidence, source name or one status to another is introduced.
4. `SOURCE_CONFIRMED` and `CONTENT_VERIFIED` remain distinct; neither is inferred from the other.

### 3.5. Fact/inference/signal/human-decision separation

1. Source fact, inference, Risk signal/factor and human/legal decision remain distinct attributable layers.
2. AI or heuristic output never confirms its own input fact or supplies human/legal authority.
3. A Risk signal does not become evidence of violation, dishonesty, protected/proxy classification or a legal conclusion.
4. A human decision cannot be fabricated from a status, threshold, signal or model output.

### 3.6. Self-report boundary

Self-reported evidence is not universally insufficient. It may remain eligible where the exact approved factor/source/use/purpose rule permits it. It is insufficient only where separately approved authority requires independent verification, source confirmation or human/legal decision for that exact use.

This record does not decide which category or factor requires those higher procedures.

### 3.7. Fail-closed affected-factor/use-only boundary

Missing, insufficient, unauthorized, stale, conflicting, unprovenanced or version/scope/purpose-incompatible evidence:

1. blocks only the affected Risk factor/use pending an approved compatible rule;
2. is not converted into clean/low/zero/neutral Risk;
3. creates no negative fact, violation, rejection, automatic `INELIGIBLE`, route or legal conclusion;
4. does not erase other factors/evidence or transfer insufficiency globally;
5. leaves exact status/mapping/cascade/reviewer/recovery behavior `OPEN`.

### 3.8. No critical/review classification

This record classifies no category/factor as critical, non-critical, automatic, review-required or exempt. `XFR-D-048` conditional non-compensation therefore remains conditional on a separate approved criticality decision. Exact reviewer authority and routing remain separately governed.

### 3.9. Partial, never full resolution

`XFR-D-049` receives `PARTIALLY_RESOLVED_BOUNDARY`: roles, per-context sufficiency discipline, provenance/current/compatible prerequisites, exact enum preservation, layer separation, self-report nuance, affected-use fail-closed handling and no-criticality/no-review-default are approved qualitatively.

All exact catalogs, levels, mappings, criticality, reviewer/RBAC, numeric, dataset, carrier, runtime and implementation contents remain `OPEN`.

## 4. Layer and authority table

| Layer | Preserved authority | Approved here | Remains `OPEN` |
|---|---|---|---|
| Canonical identity | Inventory §4.3 | `MRP-03 → XFR-D-049`, `PRIMARY_STANDALONE` | Future status overlay |
| Governance | `AI + LEGAL`; approvers `Chief AI Architect + PRODUCT + DEVELOPMENT` | Qualitative boundary | Exact sufficiency verdicts |
| Risk Policy artifact | `Chief AI Architect + LEGAL` | No artifact approval | Policy approval |
| Evidence statuses | Architecture §13 | Exact seven values unchanged | Order/levels/mappings |
| Risk components | `XFR-D-048` | Separate per-factor treatment | Criticality and aggregation contents |
| Feature evidence | `XFR-D-M1` | No import | Its separate exact contents |
| Evidence/technical procedure | `AI + DEVELOPMENT` | Preparation role only | Procedure/data/sufficiency verdict |
| Runtime/production/gates | Separate authorities | No authorization | Carrier/implementation/release |

## 5. Обязательные non-conflations

1. Evidence status ≠ sufficiency for every use.
2. Seven-value enum ≠ ordered/numeric scale.
3. Fact ≠ inference ≠ Risk signal ≠ human/legal decision.
4. Self-report ≠ universally insufficient evidence.
5. Insufficient evidence ≠ negative fact, violation or low/clean Risk.
6. Per-factor sufficiency ≠ criticality or mandatory-review classification.
7. Risk evidence governance ≠ `XFR-D-M1` Feature required-evidence mapping.
8. Evidence owner ≠ unilateral policy/reviewer/gate authority.

## 6. Что остаётся `OPEN`

- exact factor/category/source/use/purpose evidence catalogs;
- sufficiency levels, status mappings, hierarchy/order and defaults;
- criticality classifications and automatic-signal boundaries;
- exact reviewer/appointing authority, RBAC, quorum and escalation;
- numeric confidence/score/threshold/tolerance or aggregation;
- dataset, labels, adjudication, sampling, metrics, statistics and verdict;
- schema/API/event/DB/storage/transport carrier and version compatibility;
- Risk/Qualification Policy, manifest, production, runtime, implementation and gates.

## 7. Rationale

A universal evidence ladder would erase differences between factors, sources, purposes and legal authority. The approved boundary keeps evidence contextual and attributable while preventing missing or insufficient evidence from becoming an adverse finding.

## 8. Adversarial cases

1. **`CONTENT_VERIFIED` is assigned a numeric value above `SOURCE_CONFIRMED`.** Rejected: no ordering or numeric scale is approved.
2. **Self-report is rejected for every category.** Rejected: insufficiency depends on the exact approved use.
3. **AI confidence upgrades evidence status.** Rejected.
4. **Insufficient evidence becomes high Risk or `INELIGIBLE`.** Rejected: only the affected use blocks.
5. **One category's evidence rule is copied to another.** Rejected: sufficiency is per exact context.
6. **A factor is marked critical because it needs review.** Rejected: no criticality/review classification is made.
7. **`XFR-D-M1` is imported as the Risk mapping.** Rejected: Feature and Risk evidence decisions remain separate.

## 9. Затронутые артефакты — future separate sync only

- Risk Policy and Inventory may later receive a status overlay preserving exact contents `OPEN`.
- No Proposal, Policy, Data Contract, dataset, Evaluation Plan, manifest, sibling record, runtime or code is changed here.

No sync is performed by this record. Risk Policy, Inventory, other Policies, manifests, Data Contracts, sibling records, runtime and application code remain untouched.

## 10. Change control

Any change to this qualitative boundary requires a new versioned `XFR-D-049` record with `supersedes`, approved by all five functions on the same immutable version/hash: `AI + LEGAL` and `Chief AI Architect + PRODUCT + DEVELOPMENT`.

## 11. Gate impact

`NONE`.

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**.
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**.
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**.

This record approves no Proposal, Policy, Data Contract, dataset, Evaluation Plan/run/result, production-data use, manifest, runtime, implementation or release.

## 12. Acceptance criteria

1. Canonical identity is `MRP-03 → XFR-D-049`, `PRIMARY_STANDALONE`; counts remain 102/90.
2. Roles match the header; evidence ownership is non-unilateral.
3. Sufficiency is separately governed per factor/category/source/use/purpose/version.
4. Evidence must be attributable, current and compatible for the exact use.
5. The exact seven-value Architecture enum remains unchanged and unordered/non-numeric.
6. Fact/inference/signal/human decision remain distinct.
7. Self-report is not universally insufficient.
8. Insufficient evidence blocks affected use only without clean/low/negative/violation/`INELIGIBLE`/route/legal inference.
9. No category is classified critical or review-required here.
10. All exact catalogs/mappings/reviewer/data/carrier/runtime contents remain `OPEN`; all gates remain `BLOCKED`.

## 13. Итог

`XFR-D-049 PARTIALLY_RESOLVED_BOUNDARY — EVIDENCE SUFFICIENCY IS SEPARATE PER FACTOR/CATEGORY/SOURCE/USE/PURPOSE/VERSION AND REQUIRES ATTRIBUTABLE CURRENT COMPATIBLE PROVENANCE; THE EXACT SEVEN-VALUE EVIDENCE ENUM REMAINS UNCHANGED AND NON-ORDERED; FACT, INFERENCE, SIGNAL AND HUMAN DECISION REMAIN DISTINCT; SELF-REPORT IS NOT UNIVERSALLY INSUFFICIENT; MISSING/INSUFFICIENT/UNAUTHORIZED/STALE/CONFLICTING/INCOMPATIBLE EVIDENCE BLOCKS ONLY THE AFFECTED USE WITHOUT ADVERSE INFERENCE; ALL EXACT CONTENT REMAINS OPEN`
