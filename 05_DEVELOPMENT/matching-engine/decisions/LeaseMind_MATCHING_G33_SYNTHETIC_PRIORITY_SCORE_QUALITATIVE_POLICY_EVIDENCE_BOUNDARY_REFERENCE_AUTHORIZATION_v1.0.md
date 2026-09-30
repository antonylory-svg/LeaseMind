# LeaseMind — MATCHING G33 Synthetic Priority Score Qualitative Policy Evidence Boundary Reference Authorization v1.0

**Artifact:** `LeaseMind_MATCHING_G33_SYNTHETIC_PRIORITY_SCORE_QUALITATIVE_POLICY_EVIDENCE_BOUNDARY_REFERENCE_AUTHORIZATION_v1.0.md`

**Package:** `G33 Synthetic Priority Score Qualitative Policy Evidence Boundary Reference`

**Package ID:** `G33`

**Version:** 1.0

**Date:** 2026-09-30

**Branch:** `development/sprint-7-matching-g33-synthetic-priority-score-qualitative-policy-evidence-boundary-reference`

**Repository baseline:** `29a82756a3dbaf70f9fc7fe52346f715211e8933`

**Authorization status:** `DOCUMENTATION_ONLY_AUTHORIZED`

**Code phase status:** `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`

## 1. Metadata and baseline

This record authorizes a documentation-only package consisting of this authorization record, one `README.md` and one closed `G33_FILE_ALLOWLIST_v1.0.json`. Six additional code, test and verification paths are reserved as `planned` but remain absent. No code, test, HTML page, scenario, component, entry, verification record, configuration, index, router or production artifact is authorized or created in this phase.

The package derives its substantive boundary only from `LeaseMind_MATCHING_DECISION_XFR-D-024_v1.1.md`, the `XFR-D-024` / `MSP-11` and Priority Score portions of `LeaseMind_MATCHING_SCORING_POLICY_v0.1.md` and `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md`. G32 is used only as a structural precedent. This record creates no new governance fact and edits neither the Inventory nor the Scoring Policy.

## 2. Source and status boundary

`XFR-D-024 v1.1` remains `PARTIALLY_RESOLVED_BOUNDARY`; canonical identity remains `MSP-11 → XFR-D-024`, `PRIMARY_STANDALONE`, «Priority Score qualitative policy and evidence boundary». Counts remain 102 source keys / 90 canonical IDs, the Scoring register remains 18 rows and the Evaluation register remains 17 rows. Neither the Inventory nor the Scoring Policy is modified by this package.

The approved qualitative boundary is: Priority Score is optional and internal-ordering-only; only separately calculated, source-authoritative Match Score, Confidence Score and Risk Score may feed it, each keeping its own semantics, source authority, version/hash, provenance and audit representation; no source input may be derived, substituted, rewritten, relabeled or hiddenly normalized; separate input visibility is mandatory; non-compensation and authority preservation hold; affected use fails closed without defaults or negative facts; immutable evidence and reproducibility remain prerequisites; `XFR-D-021` ranking/diversification governance remains independent; and no result triggers automatic action.

Every exact formula, functional form, coefficient, sign/direction, weight, scale, normalization, clipping, rounding, threshold, activation/deactivation, fallback/cascade, ranking use, algorithm, order, tie-break, candidate set, `K`, metric, target, statistic, dataset, evaluation run, result, verdict, policy, manifest, production, runtime and implementation content remains `OPEN`.

## 3. Governance and approval separation

- Governance owner: `Chief AI Architect + PRODUCT`.
- Scoring artifact owner: `Chief AI Architect + PRODUCT`.
- Mandatory approvers: `LEGAL + DEVELOPMENT`.
- Consulted domain function: `AI`.
- Evidence/technical-procedure owner: `AI + DEVELOPMENT`, without unilateral authority.

These are the roles recorded by `XFR-D-024 v1.1`; this package assigns no new owner, widens no authority and permits no unilateral approval. Architecture §15.6 and §24 remain `SOURCE_NORMATIVE`. The broader ranking/diversification governance remains independently under `XFR-D-021 v1.0`, and numeric in-scope metric-target governance remains independently under `XFR-D-063 v1.0`. Governance owner, approver, consulted function, evidence owner and any runtime writer are never conflated, and no role may unilaterally approve a formula/value, Scoring Policy, production use, release, implementation or gate.

## 4. Frozen qualitative Priority Score policy matrix

The future reference must render the following twelve rows in this exact order. Each row is a boundary, not an approval:

1. `OPTIONAL_INTERNAL_ORDERING_ONLY_NO_REQUIREMENT_ACTIVATION_FALLBACK_OR_PRESENTATION` — Priority Score remains optional and is only an internal ordering signal for future ranking use; it requires no computation, activation, fallback or user presentation and is not a Match/Confidence/Risk score, Qualification, Eligibility, Hard Constraint, legal/business conclusion, user-facing score or presentation authorization.
2. `EXACT_QUALITATIVE_INPUT_ALLOWLIST_MATCH_CONFIDENCE_RISK_ONLY` — only Match Score, Confidence Score and Risk Score are admitted; no other input is allowed.
3. `SEPARATE_SOURCE_AUTHORITY_VERSION_HASH_PROVENANCE_AND_AUDIT_VISIBILITY` — each input keeps its own semantics, source authority, version/hash, provenance and audit representation; all three remain separately visible for audit.
4. `NO_DERIVATION_SUBSTITUTION_REWRITE_RELABEL_OR_HIDDEN_NORMALIZATION` — no source input is recomputed, corrected, relabeled, hiddenly normalized, substituted or written back, and no input is derived from or substituted by another.
5. `NO_SILENT_IMPORT_OF_BROADER_RANKING_CONSIDERATIONS_XFR_D_021_INDEPENDENT` — Qualification, freshness, readiness, negotiation gaps, deduplication, diversity and segment/fairness state remain separate ranking-policy inputs under `XFR-D-021` and are not silently imported.
6. `NON_COMPENSATION_OF_INSUFFICIENT_CONFIDENCE_OR_HIGH_RISK` — a high Match Score never compensates insufficient/low Confidence or source-defined high Risk, and Priority Score never hides high Risk inside an aggregate percentage, rank or presentation.
7. `AUTHORITY_PRESERVATION_NO_OVERRIDE_OF_PREREQUISITES` — Priority Score cannot bypass, weaken or compensate a Hard Constraint, Eligibility, Qualification, freshness, readiness, negotiation-gap, deduplication, fairness, lawful-basis, evidence or disclosure failure and creates no routing, legal, business or presentation authority.
8. `AFFECTED_USE_FAIL_CLOSED_WITHOUT_DEFAULTS_OR_NEGATIVE_FACTS` — missing/unknown/stale/conflicting/revoked/invalidated/unmapped/version-hash-incompatible state is never replaced by a default and affected use blocks fail closed absent a separately approved compatible fallback, without becoming a negative business fact, rejection, route, reason or display text; unrelated processing is not blocked.
9. `IMMUTABLE_EVIDENCE_AND_REPRODUCIBILITY_PREREQUISITES` — an immutable, versioned evidence package with frozen data, compatible source versions/hashes, separate audit outputs, isolated tuning/final evidence, deterministic replay and independent review is a prerequisite, not an approval.
10. `SYNTHETIC_ONLY_EVIDENCE_CREATES_NO_PRODUCTION_CLAIM` — synthetic-only evidence never creates production calibration, applicability or readiness, and no aggregate or coincidence substitutes a missing applicable evidence category.
11. `NO_AUTOMATIC_ACTION_REQUIRES_SEPARATE_CONTROLLED_APPROVAL` — no metric, result, evidence success or evaluation automatically changes formula, weight, threshold, policy, model, ranking, routing, release, runtime, monitoring, rollback or gate; a separate version/hash-bound approval and controlled release remain required.
12. `PARTIALLY_RESOLVED_BOUNDARY_EXACT_CONTENT_OPEN_AND_NO_FULL_RESOLUTION` — `XFR-D-024 v1.1` remains `PARTIALLY_RESOLVED_BOUNDARY` with canonical identity `MSP-11 → XFR-D-024`, `PRIMARY_STANDALONE`; exact content remains `OPEN` and the package cannot be cited as full resolution or as approval of any policy, production, runtime or implementation item.

The machine-readable `frozen` values in `G33_FILE_ALLOWLIST_v1.0.json` govern the later code phase and must be reproduced verbatim.

## 5. Layer boundary — Priority Score policy vs Architecture §§15.6/24 vs `XFR-D-021`/`XFR-D-063`

| Layer | Regulates | Owner/authority | Affected here? |
|---|---|---|---|
| Architecture §15.6 Priority Score norm | Priority Score is optional; it considers Match Score, Confidence Score and Risk Score; all source indicators stay separately visible for audit; Match Score includes no hidden legal decision, payment status, circumvention conclusion, sanction or refund | Architecture (`SOURCE_NORMATIVE`) | No — the general norm is not reopened or over-read |
| Architecture §24 ranking/diversification policy | Qualification status, freshness, readiness, negotiation gaps, deduplication and diversity, plus Hard Constraint, verification, risk-visibility, minimum-quality, no-catalog, one-at-a-time disclosure and no-authority safeguards | Architecture (`SOURCE_NORMATIVE`) | No — not absorbed into Priority Score |
| **Priority Score qualitative policy/evidence boundary (this decision)** | Optional internal-ordering, exact Match/Confidence/Risk input allowlist, separate source authority/audit visibility, non-compensation, fail-closed, evidence prerequisites and no-automatic-action | `Chief AI Architect + PRODUCT` | **Yes — the only resolved layer** |
| Ranking/diversification algorithm, order, tie-break, candidate set, `K`, metric | Exact ranking mechanics and values | `XFR-D-021 v1.0` | No — remains independently `OPEN` |
| Numeric metric-target governance/evidence | Exact metric definitions, targets, denominators, statistics and evidence | `XFR-D-063 v1.0` | No — remains independently `OPEN` |
| Exact Priority Score formula/values/activation/runtime | The exact arithmetic, activation, fallback and runtime representation | Not assigned by any source | No — remains `OPEN` |

## 6. Adversarial cases

1. **Priority Score is treated as mandatory because the record describes it.** Invalid — it remains optional and no activation is approved.
2. **Qualification, freshness, readiness or diversity is silently added to the Priority Score formula.** Invalid — the input allowlist is Match/Confidence/Risk only; broader ranking considerations remain separate under `XFR-D-021`.
3. **A high Match Score hides low Confidence or high Risk.** Forbidden by non-compensation and separate visibility.
4. **A missing Risk Score is replaced with zero, neutral or an AI estimate.** Forbidden — affected use fails closed without a separately approved compatible fallback.
5. **Priority Score reorders candidates that failed a Hard Constraint or Qualification prerequisite.** Forbidden — the signal creates no eligibility or override authority.
6. **Priority Score is displayed to users or used to disclose several options.** Forbidden — it creates no Safe Presentation, catalog or Reveal authority.
7. **A conventional weighted sum is implemented because no numbers were specified.** Forbidden — functional form, weights, signs, scale and normalization remain `OPEN`.
8. **The current baseline or synthetic result becomes an activation threshold.** Forbidden — baseline/evidence is not a value approval or production claim.
9. **Good aggregate performance compensates fairness, false-exclusion, risk or segment failure.** Forbidden — evidence families do not compensate each other.
10. **Final evidence is used to tune and then validate the same candidate.** Ineligible — a new versioned cycle is required.
11. **`AI + DEVELOPMENT` prepared reproducible evidence and therefore approve the policy.** Invalid — evidence ownership is not governance approval.
12. **A successful evaluation automatically changes runtime.** Forbidden — separate version/hash-bound approval and controlled release remain required.

## 7. Open exact content and prohibited surrogates

The exact contents listed in the allowlist remain `OPEN`, including whether/when Priority Score is activated; the exact formula, functional form, coefficients, signs/directions, weights, scale, range, normalization, clipping and rounding; thresholds, activation/deactivation, applicability, fallback and cascade rules; the ranking/diversification algorithm, ordering, tie-breaks, candidate-set rules, `K`, minimum-quality and diversity rules; the exact ranking/retrieval/calibration/diversification metrics, targets, denominators, aggregation and statistics; segment universe, intersections, membership, lawful basis and overrides; the exact fairness doctrine/classification/comparator/metric/threshold/statistics and legal verdict; the Risk formula, human-review thresholds, Qualification routing and critical-risk handling; dataset/evidence/run/result/verdict; production-data authority and readiness; policy/manifest approvals; and all runtime, schema, carrier, implementation and gate approvals.

A conventional weighted sum, average, product or any presumed functional form; zero, neutral, average, worst, best, majority, heuristic, AI-inferred or proxy-imputed substitutes; the current baseline, a synthetic result or any library default; and current implementation behavior are never governance approval. Architecture §30.3 prohibitions on automatic productive retraining, automatic Hard Constraint changes and automatic global-weight changes, and the §49 deterministic-replay/severity-1 rules, remain separate and inviolable.

## 8. Future reference surface

If separately authorized after an independent audit, the future static manual dev-only page will expose six regions in order: `SOURCE AND STATUS BOUNDARY`; `PRIORITY SCORE QUALITATIVE POLICY MATRIX`; `ROLE AND APPROVAL SEPARATION`; `OPTIONAL INTERNAL-ORDERING, INPUT-SEPARATION AND NON-COMPENSATION BOUNDARY`; `OPEN EXACT CONTENT`; `NON-DECISION RESULT`.

It must always display:

- `SYNTHETIC PRIORITY SCORE QUALITATIVE POLICY EVIDENCE BOUNDARY REFERENCE — NOT PRODUCTION APPROVED`;
- `MANUAL DEV-ONLY REFERENCE — QUALITATIVE PRIORITY SCORE POLICY AND EVIDENCE BOUNDARY ONLY`;
- `NO FORMULA, WEIGHT, SIGN/DIRECTION, SCALE, NORMALIZATION, THRESHOLD, ACTIVATION, FALLBACK OR RANKING USE SELECTED`.

It must terminate with `G33_SYNTHETIC_NO_PRIORITY_SCORE_FORMULA_WEIGHT_DIRECTION_SCALE_NORMALIZATION_THRESHOLD_ACTIVATION_FALLBACK_OR_RANKING_USE_SELECTED` and the non-decision statement `NO FORMULA, WEIGHT, SIGN/DIRECTION, SCALE, NORMALIZATION, THRESHOLD, ACTIVATION, FALLBACK, RANKING USE, DATA, PRODUCTION, RUNTIME OR IMPLEMENTATION ACTION OCCURRED`. It contains no controls, links, live regions, mutable state, network, persistence, telemetry, person, organization, property, UUID or business-record data.

## 9. Gate impact

| Item | Status |
| --- | --- |
| `IMPLEMENTATION_READINESS_GATE` | `BLOCKED` |
| `SYNTHETIC_ACCEPTANCE_GATE` | `BLOCKED` |
| `PRODUCTION_LAUNCH_GATE` | `BLOCKED` |
| Gate impact of this package | `NONE` |

## 10. Non-authorization statement

This documentation package approves no Scoring Policy, Evaluation Plan, Feature Schema, Risk Policy, Qualification Policy, Controlled Artifact Manifest, dataset, evaluation run, production data, formula, functional form, coefficient, sign/direction, weight, scale, normalization, clipping, rounding, threshold, activation/deactivation, fallback/cascade, ranking use, algorithm, order, tie-break, candidate set, `K`, metric, target, statistic, runtime representation, schema, carrier, runtime or implementation. It creates no production-readiness claim and permits no automatic action. Synthetic evidence creates no production claim. The six reserved artifacts remain blocked pending an independent audit and separate human confirmation.

## 11. Closed allowlist and hash binding

The closed allowlist is `05_DEVELOPMENT/matching-engine/synthetic-priority-score-qualitative-policy-evidence-boundary-reference/G33_FILE_ALLOWLIST_v1.0.json`, raw SHA-256 `92a8e111f277be8bb35f2f67944306e20365ef65d17544e55c073a9b0ffbbdd1`. It contains exactly nine paths: these three documentation artifacts as `present` and six future artifacts as `planned`. No path outside those nine may be created, modified, imported or emitted by G33. The allowlist intentionally omits its own SHA-256, and the `README.md` and this authorization record are both bound to the raw SHA-256 above.

No staging, commit, push or PR mutation is performed by this authorization.

```
COMMIT CREATED: NO
PUSH PERFORMED: NO
PR MUTATION PERFORMED: NO
```
