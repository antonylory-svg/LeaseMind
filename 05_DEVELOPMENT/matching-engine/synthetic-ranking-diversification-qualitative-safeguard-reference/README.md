# G30 Synthetic Ranking/Diversification Qualitative-Safeguard Reference

**Package:** `G30 Synthetic Ranking/Diversification Qualitative-Safeguard Reference`

**Package ID:** `G30`

**Version:** 1.0

**Date:** 2026-09-29

**Branch:** `development/sprint-7-matching-g30-synthetic-ranking-diversification-qualitative-safeguard-reference`

**Repository baseline:** `4170b24a7723e41c35f07d46d1b51721a2b37609`

**Source decision:** `XFR-D-021 v1.0` — `APPROVED` / `PARTIALLY_RESOLVED_BOUNDARY`

**Canonical identity:** `MSP-08 → XFR-D-021`, `PRIMARY_STANDALONE`

**Authorization status:** `DOCUMENTATION_ONLY_AUTHORIZED`

**Code phase status:** `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`

**Phase:** documentation only

## Purpose

This package is a documentation-only boundary for one future isolated, manually opened, development-only static reference derived from `XFR-D-021 v1.0`. Its future surface may display only the approved qualitative ranking/diversification governance, qualitative-safeguard, source-preservation, fail-closed and evidence-prerequisite boundary. It must not choose or approve an exact ranking algorithm, ordering, tie-break, candidate-set rule, `K`, metric, formula, weight, threshold, minimum-quality rule or value, diversity/distance/similarity definition, target, tolerance, statistic, segment, dataset, evaluation run, result, verdict, production applicability, schema/carrier/runtime, implementation or policy.

`XFR-D-021 v1.0` remains `APPROVED` with resolution status `PARTIALLY_RESOLVED_BOUNDARY`, never fully resolved. Architecture §24 is source-normative for the separate ranking inputs (Match Score, Confidence Score, Risk Score, Qualification status, freshness, readiness for the next check, number and value of negotiation gaps, absence of duplicates and diversity hypotheses over object/commercial parameters) and for the constraints: Hard Constraint precedence; no promotion of a high Match Score with low Confidence to the first Qualified option without verification; no hiding of high Risk inside the final percentage; diversification only among options that have passed minimum quality; internal ranking never becomes a user catalog; one-at-a-time disclosure; and rank never changing payer, legal status or disclosure right. Architecture §24 fixes no exact algorithm, ordering, tie-break, candidate-set rule, metric or value. Architecture §30.3 requires frozen sample, label-quality check, offline evaluation, discrimination/proxy review, calibration check, Chief AI Architect review, agreement of affected PRODUCT/LEGAL rules, controlled release, monitoring and rollback, and prohibits automatic productive retraining, automatic Hard Constraint changes and automatic global-weight changes. Architecture §34.2 names Precision@K, Recall@K, NDCG@K, Confidence/Risk calibration, rank stability under unchanged inputs, top-list diversification quality, confirmed human-review flag share and missed critical-risk share as quality metrics, and states that exact thresholds are fixed only after a labelled test set exists. Architecture §49 requires exact deterministic replay identity (`component scores`, `ranking`, `reasons`, `final package hash`) and treats any mismatch as a severity-1 defect. Architecture §52 assigns the `MATCHING_SCORING_POLICY` artifact owner.

`LeaseMind_MATCHING_SCORING_POLICY_v0.1.md` is «Proposal for cross-functional review — does not authorize implementation»; its §12 row 8 records ranking/diversification governance as `PARTIALLY_RESOLVED_BOUNDARY — XFR-D-021 v1.0`, and its readiness/acceptance text keeps `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` `BLOCKED`. The Inventory canonical crosswalk fixes `MSP-08 → XFR-D-021`, `PRIMARY_STANDALONE`, «Ranking/diversification algorithm and metric»; this package creates no XFR ID and changes no canonical count (102 source keys / 90 canonical IDs) or register row (Scoring 18 rows; Evaluation 17 rows). `XFR-D-024`, `XFR-D-063`, `XFR-D-018`, `XFR-D-042`, `XFR-D-068`, `XFR-D-070` and the applicable `XFR-D-023`, `XFR-D-026`, `XFR-D-027` and `XFR-D-057`–`XFR-D-071`, together with all Match/Confidence/Risk/Qualification semantics and the Scoring Policy, Evaluation Plan, Feature Schema, Risk Policy, Qualification Policy, Safe Presentation Policy, Data Contracts and Controlled Artifact Manifest, retain their independent authority and status: none is reopened, absorbed, superseded, selected or approved by this package.

The role split remains exact: governance owner `Chief AI Architect + PRODUCT`; mandatory approvers `LEGAL + DEVELOPMENT`; consulted domain function `AI`; evidence/technical-procedure owner `AI + DEVELOPMENT` without unilateral semantic, policy, value, production, release, implementation or gate authority. Evidence ownership does not replace governance ownership or mandatory approval.

## Contents

| File | Status | Role |
| --- | --- | --- |
| `README.md` | present | Package overview and closed boundary |
| `G30_FILE_ALLOWLIST_v1.0.json` | present | Closed file allowlist and frozen reference block |
| `05_DEVELOPMENT/matching-engine/decisions/LeaseMind_MATCHING_G30_SYNTHETIC_RANKING_DIVERSIFICATION_QUALITATIVE_SAFEGUARD_REFERENCE_AUTHORIZATION_v1.0.md` | present | Documentation authorization |

The allowlist additionally reserves six planned, not-yet-created artifacts: the page HTML, the scenario module, the reference component, a minimal entry wrapper, the unit test and the verification JSON. No code, test, verification, configuration or index file has been created or modified in this phase.

## Closed file allowlist

**Path:** `05_DEVELOPMENT/matching-engine/synthetic-ranking-diversification-qualitative-safeguard-reference/G30_FILE_ALLOWLIST_v1.0.json`

**Raw SHA-256:** `acdc15195f914dfa8c35d25541597ede2243118a3b4144de1067ccdc8be2175b`

The allowlist is closed and contains exactly nine paths: the three documentation artifacts present after this phase (this `README.md`, the allowlist itself and the authorization record) and six reserved planned artifacts — the page HTML `apps/web/synthetic-ranking-diversification-qualitative-safeguard-reference.html`, the scenario module `apps/web/src/synthetic/syntheticRankingDiversificationQualitativeSafeguardReferenceScenario.ts`, the component `apps/web/src/synthetic/SyntheticRankingDiversificationQualitativeSafeguardReference.tsx`, the entry `apps/web/src/synthetic/syntheticRankingDiversificationQualitativeSafeguardReferenceEntry.tsx`, the test `apps/web/tests/syntheticRankingDiversificationQualitativeSafeguardReference.test.ts` and the verification artifact `05_DEVELOPMENT/matching-engine/synthetic-ranking-diversification-qualitative-safeguard-reference/G30_RANKING_DIVERSIFICATION_QUALITATIVE_SAFEGUARD_REFERENCE_VERIFICATION.json`. No path outside the nine may be created, modified, imported or emitted as a package artifact; documentary citations to approved source material are allowed. The allowlist intentionally omits its own hash and records no field inside itself carrying that hash; the hash is bound here and in the authorization record instead.

## Required reference surface (not created)

The future isolated, manually opened, development-only static reference keeps three lines always visible, in this order:

1. `SYNTHETIC RANKING/DIVERSIFICATION QUALITATIVE-SAFEGUARD REFERENCE — NOT PRODUCTION APPROVED`
2. `MANUAL DEV-ONLY REFERENCE — QUALITATIVE RANKING/DIVERSIFICATION GOVERNANCE AND EVIDENCE BOUNDARY ONLY`
3. `NO RANKING/DIVERSIFICATION ALGORITHM, ORDERING, TIE-BREAK, CANDIDATE SET, K, METRIC, FORMULA, WEIGHT, THRESHOLD OR MINIMUM-QUALITY ACTION EXECUTED`

The page contains exactly six semantic regions in this order:

1. `SOURCE AND STATUS BOUNDARY`
2. `RANKING/DIVERSIFICATION GOVERNANCE MATRIX`
3. `ROLE AND APPROVAL SEPARATION`
4. `EVIDENCE PREREQUISITES AND NON-COMPENSATION`
5. `OPEN EXACT CONTENT`
6. `NON-DECISION RESULT`

The local development URL, reachable only by manual entry, is `http://127.0.0.1:5173/synthetic-ranking-diversification-qualitative-safeguard-reference.html`.

## Frozen qualitative safeguard matrix

The future surface displays one semantic ten-row table, in this exact order. The `frozen` values in `G30_FILE_ALLOWLIST_v1.0.json` are the exact machine-readable strings for the later code phase and must be reproduced verbatim; the prose below is a human-readable explanation and cannot override or shorten those frozen strings:

1. `INPUT_SEPARATION_AND_SEMANTIC_PRESERVATION` — Match Score, Confidence Score, Risk Score, Qualification status, freshness, readiness, number and value of negotiation gaps, deduplication state and diversity objective/attributes remain separately attributable; none is silently derived, collapsed, substituted or reweighted; no formula, order, weight, diversity, distance or similarity definition is inferred; internal ranking never conflates Match, Confidence, Risk, Qualification, Priority or Safe Presentation.
2. `HARD_CONSTRAINT_PRECEDENCE_AND_NON_COMPENSATION` — Hard Constraint has priority over rank; no rank or diversity result overrides, hides or compensates a Hard Constraint failure, a low Confidence, a high Risk or failure of a separately approved minimum-quality condition; no compensation across independent failures; no diversity may return an excluded or failed candidate to the candidate set.
3. `LOW_CONFIDENCE_NON_PROMOTION_AND_RISK_NON_MASKING` — a high Match Score with low Confidence does not become the first Qualified option without verification; a high Risk is not hidden inside an aggregate percent or rank; rank and diversity never raise Confidence, lower Risk or substitute for verification.
4. `DIVERSIFICATION_ONLY_AFTER_SEPARATELY_APPROVED_MINIMUM_QUALITY` — diversification applies only among candidates that have passed a separately approved minimum-quality rule; no minimum-quality rule, value, comparator or scope is set here; no diversity objective may reintroduce a failed or excluded candidate or weaken the minimum-quality condition.
5. `CANDIDATE_NON_SELECTION_AND_NO_DEFAULT_AUTHORITY` — exact ranking and diversification algorithm, ordering, tie-break, candidate-set rule, `K`, metric, formula, weight, threshold, minimum-quality rule and value, diversity/distance/similarity definition, target and tolerance remain unselected candidates with no default, preferred or fallback status; an existing implementation, library, SDK, framework, default, business intuition or example is not governance approval.
6. `INTERNAL_RANKING_CREATES_NO_CATALOG_OR_DISCLOSURE_AUTHORITY` — internal ranking of several hypotheses does not produce a catalog or disclosure to the user; one-at-a-time disclosure remains intact; rank never changes payer, legal status, Qualification or disclosure right; rank and diversity grant no Reveal or Safe Presentation authority.
7. `AFFECTED_RANKING_FAIL_CLOSED_WITHOUT_UNRELATED_BLOCK` — missing, unknown, stale, conflicting, incompatible, incomplete, ambiguous, unauthorized or non-reproducible policy, input, evidence, applicability or version/hash state blocks the affected ranking/diversification use fail closed unless a separately approved compatible fallback or policy applies; it creates no default score or rank, inferred eligibility, benign or safe state, negative fact, rejection, Qualification or Risk result, route, primary reason or display text; unrelated processing is not blocked unless an independently applicable approved rule requires it; exact error, status, retry, recovery, escalation, observability, fallback, carrier and cascade mechanics remain `OPEN`.
8. `VERSION_HASH_BINDING_AND_PROSPECTIVE_HISTORICAL_IMMUTABILITY_UNDER_XFR_D_023` — any future ranking/diversification policy must be closed, explicit, versioned and hash-bound to the exact Scoring/Risk/Qualification policy, code, configuration and toolchain it actually uses; deterministic and replayable without locale, platform, language, library, database or deployment default behavior; `XFR-D-023` is preserved; a new ranking version never rewrites, mutates or reinterprets previously stored Match Results; historical results remain bound to the versions and hashes actually used.
9. `MINIMUM_RANKING_EVIDENCE_PREREQUISITES_AND_SEPARATE_REPORTING` — no ranking or diversification policy selection may be approved without an immutable, versioned, hash-bound evidence package containing every applicable category; a missing applicable category blocks approval fail closed; the categories approve no exact algorithm, value, metric, formula, weight, threshold, dataset, segment, run, result or verdict; all positive, adverse, null, incompatible, unevaluable and insufficient results are reported separately with counter-evidence, and tuning and final are isolated and only compatible comparisons are used.
10. `NO_AUTOMATIC_ACTION` — no successful evaluation, test, commit, merge, CI or deployment automatically changes ranking/diversification algorithm, order, weight, threshold, minimum quality, policy, model, routing, release, runtime, rollback or gate state; a separate controlled human approval and release is required.

## Evidence prerequisites (prerequisite only, none approves exact content)

1. Exact candidate policy version/hash and compatible affected input, policy and model versions/hashes.
2. Frozen dataset allocation, manifest and lineage, plus eligible label, adjudication, grouping and correction-history evidence under `XFR-D-057`–`XFR-D-062`.
3. Pre-registered candidate, hypotheses, metrics and comparison procedure under `XFR-D-063` and `XFR-D-070`.
4. Strict tuning versus untouched-final isolation; final evidence is never reused to select, rewrite or rescue the candidate.
5. Semantic/data/version-compatible-only comparison, or explicit `INCOMPATIBLE`/unevaluable reporting without winner inference.
6. Complete positive, adverse, null, incompatible, unevaluable and insufficient reporting without selective omission.
7. Separate results for ranking/retrieval, Confidence, Risk, Qualification, segment/fairness, false exclusion, deduplication and diversification, without cross-family compensation.
8. Deterministic replay evidence bound to exact inputs, versions and hashes, with identical component scores, ranking, reasons and final package hash under Architecture §49.
9. Applicable segment-coverage, fairness, proxy and legal review under `XFR-D-064` and `XFR-D-068`, without inferred segment membership or unapproved standards.
10. Explicit synthetic-only versus production-data applicability; synthetic-only evidence creates no production applicability, calibration or readiness claim.
11. Documented DEVELOPMENT reproducibility/control verification and full owner/approver review.

## Permanent non-decision lines and terminal result

The future reference must always display the three lines in the "Required reference surface" section above. It must end with the terminal token `G30_SYNTHETIC_NO_RANKING_DIVERSIFICATION_ALGORITHM_ORDER_TIEBREAK_METRIC_WEIGHT_THRESHOLD_OR_MINIMUM_QUALITY_ACTION_EXECUTED` and the terminal line `NO RANKING/DIVERSIFICATION, ALGORITHM, ORDERING, TIE-BREAK, CANDIDATE SET, K, METRIC, FORMULA, WEIGHT, THRESHOLD, MINIMUM-QUALITY, DIVERSITY OR RANK ACTION OCCURRED`.

`NON-DECISION RESULT: NO RANKING/DIVERSIFICATION ALGORITHM, ORDERING, TIE-BREAK, CANDIDATE-SET RULE, K, METRIC, FORMULA, WEIGHT, THRESHOLD, MINIMUM-QUALITY RULE OR VALUE, DIVERSITY/DISTANCE/SIMILARITY DEFINITION, TARGET, SEGMENT, DATASET, EVALUATION RUN, RESULT, VERDICT, CARRIER, RUNTIME, IMPLEMENTATION OR POLICY SELECTION, AND NO DATASET, METRIC, STATISTIC, EVIDENCE OR GATE APPROVAL. HARD CONSTRAINT PRECEDENCE, ONE-AT-A-TIME DISCLOSURE AND SOURCE INPUT SEPARATION REMAIN AS SOURCED UNDER ARCHITECTURE SECTION 24 AND SECTION 49. EXACT ALGORITHM, ORDER, TIE-BREAK, CANDIDATE SET, K, METRIC, FORMULA, WEIGHT, THRESHOLD, MINIMUM QUALITY, DIVERSITY DEFINITION, TARGET, TOLERANCE, STATISTIC, SEGMENT, DATA, PRODUCTION, RUNTIME AND IMPLEMENTATION AUTHORITY REMAIN OPEN. XFR-D-021 REMAINS PARTIALLY_RESOLVED_BOUNDARY AND THE SCORING POLICY, EVALUATION PLAN, FEATURE SCHEMA, RISK POLICY, QUALIFICATION POLICY, SAFE PRESENTATION POLICY AND CONTROLLED ARTIFACT MANIFEST REMAIN PROPOSED/FOR REVIEW ONLY. INTERNAL RANKING CREATES NO CATALOG OR DISCLOSURE AUTHORITY AND RANK CHANGES NO PAYER, LEGAL, QUALIFICATION, REVEAL OR DISCLOSURE RIGHT. A FUTURE EXACT RANKING/DIVERSIFICATION POLICY REQUIRES CHIEF AI ARCHITECT, PRODUCT, LEGAL AND DEVELOPMENT APPROVAL ON ONE IMMUTABLE VERSION/HASH AND A SUFFICIENT EVIDENCE PACKAGE, WITH AI CONSULTED. THIS REFERENCE AUTHORIZES NO RANKING, DIVERSIFICATION, PRODUCTION, CODE, TEST OR GATE ACTION.`

## Acceptance checklist for the later code phase

- `INPUT_SEPARATION_AND_SEMANTIC_PRESERVATION`: must verify every ranking input remains separately attributable, with no inference.
- `HARD_CONSTRAINT_PRECEDENCE_AND_NON_COMPENSATION`: must verify Hard Constraint precedence and non-compensation remain intact.
- `LOW_CONFIDENCE_NON_PROMOTION_AND_RISK_NON_MASKING`: must verify no low-Confidence promotion and no Risk masking.
- `DIVERSIFICATION_ONLY_AFTER_SEPARATELY_APPROVED_MINIMUM_QUALITY`: must verify no minimum-quality rule is selected and no premature diversification occurs.
- `CANDIDATE_NON_SELECTION_AND_NO_DEFAULT_AUTHORITY`: must verify no candidate is preferred and no default authority is introduced.
- `INTERNAL_RANKING_CREATES_NO_CATALOG_OR_DISCLOSURE_AUTHORITY`: must verify no catalog/disclosure authority is introduced and one-at-a-time disclosure remains intact.
- `AFFECTED_RANKING_FAIL_CLOSED_WITHOUT_UNRELATED_BLOCK`: must verify the affected scope fails closed while unrelated processing remains governed independently.
- `VERSION_HASH_BINDING_AND_PROSPECTIVE_HISTORICAL_IMMUTABILITY_UNDER_XFR_D_023`: must verify immutable version/hash binding and historical immutability are preserved.
- `MINIMUM_RANKING_EVIDENCE_PREREQUISITES_AND_SEPARATE_REPORTING`: must verify all evidence prerequisites and separate reporting are preserved.
- `NO_AUTOMATIC_ACTION`: must verify no automatic action occurs.
- Static source scanning, presence and order of the title, three permanent lines, six regions, ten governance rows and the terminal token/line.
- Isolation and path confinement to the nine allowlisted paths; LF/UTF-8-no-BOM; no `any` TypeScript; dependency scan; existing synthetic-package regression.

## Distinct layers and prohibited surrogates

Match Score, Confidence Score, Risk Score, Qualification status, freshness, readiness for the next check, number and value of negotiation gaps, deduplication state, diversity objective/attributes, Hard Constraint/Eligibility, Priority Score/internal ranking, payer assignment, legal status, disclosure right/Reveal and Safe Presentation remain distinct. This package neither creates nor changes any value or authority in those layers, and internal ranking is not formula, function, weight, threshold, minimum-quality, diversity, normalization or routing authority.

No algorithm, order, tie-break, candidate-set rule, `K`, metric, formula, weight, threshold, minimum-quality value, diversity definition, distance/similarity, target, tolerance, dataset, statistic or computed example may be introduced as a ranking, diversification or surrogate evidence, and no aggregate or output coincidence may stand in for a missing applicable evidence category.

## What remains `OPEN`

- exact ranking algorithm; exact ordering; exact tie-break; exact candidate-set rule; exact `K`;
- exact metric; exact formula; exact weight; exact threshold; exact minimum-quality rule and value;
- exact diversity definition; exact distance definition; exact similarity definition; exact target; exact tolerance; exact statistic; exact segment;
- exact dataset; exact evaluation run; exact result; exact verdict;
- production applicability; schema, carrier and runtime; implementation;
- Scoring Policy, Evaluation Plan, Feature Schema, Risk Policy, Qualification Policy, Safe Presentation Policy and Controlled Artifact Manifest approval.

## Future verification (not performed in this phase)

A later, separately approved code phase will introduce the reserved page, scenario, component, entry, test and verification artifacts and run the checks listed in the acceptance checklist. In this documentation phase, the expected future verification result label is `G30_SYNTHETIC_RANKING_DIVERSIFICATION_QUALITATIVE_SAFEGUARD_REFERENCE_VERIFIED`; no verification has been executed and no verification artifact exists.

## Present scope

This phase created exactly three documentation artifacts — this `README.md`, `G30_FILE_ALLOWLIST_v1.0.json` and the authorization record — and modified no code, test, verification, configuration, page, scenario, component, entry or index file. The six reserved artifacts remain `planned`. The artifact is manual, development-only, static, isolated, offline-capable, deterministic, fail-closed and synthetic, with no network, API, database, event, storage, transport, persistence, cookies, cache, logging, diagnostics, telemetry, menu or default production build exposure, and no production entry, router, config, manifest or lockfile change. No production applicability is established and no implementation is authorized.

## Gate impact

| Item | Status |
| --- | --- |
| `IMPLEMENTATION_READINESS_GATE` | `BLOCKED` |
| `SYNTHETIC_ACCEPTANCE_GATE` | `BLOCKED` |
| `PRODUCTION_LAUNCH_GATE` | `BLOCKED` |
| Gate impact of this package | `NONE` |

## Outcome

This documentation package is `DOCUMENTATION_ONLY_AUTHORIZED`: it freezes the qualitative ranking/diversification governance, safeguard, source-preservation, fail-closed and evidence-prerequisite boundary derived from `XFR-D-021 v1.0` plus the allowed Architecture, Scoring Policy and Inventory source regions named in the authorization record, and nothing else. It authorizes no exact algorithm, ordering, tie-break, candidate-set rule, `K`, metric, formula, weight, threshold, minimum-quality rule or value, diversity/distance/similarity definition, target, tolerance, statistic, segment, dataset, evaluation run, result, verdict, production applicability, schema, carrier, runtime, implementation or policy, and no code, test or gate action.

```
COMMIT CREATED: NO
PUSH PERFORMED: NO
PR MUTATION PERFORMED: NO

No ranking or diversification action occurred.
```
