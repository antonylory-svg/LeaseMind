# G33 Synthetic Priority Score Qualitative Policy Evidence Boundary Reference

**Status:** `DOCUMENTATION_ONLY_AUTHORIZED`

**Code phase:** `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`

**Baseline:** `29a82756a3dbaf70f9fc7fe52346f715211e8933`

**Branch:** `development/sprint-7-matching-g33-synthetic-priority-score-qualitative-policy-evidence-boundary-reference`

**Source:** `XFR-D-024 v1.1` — `PARTIALLY_RESOLVED_BOUNDARY`

**Canonical identity:** `MSP-11 → XFR-D-024`, `PRIMARY_STANDALONE`

## Purpose

G33 reserves a manual, isolated, static, development-only reference for the qualitative Priority Score policy and evidence boundary approved as `PARTIALLY_RESOLVED_BOUNDARY` by `XFR-D-024 v1.1`. It will explain that a future Priority Score remains optional and internal-ordering-only; that only separately authoritative Match Score, Confidence Score and Risk Score may feed it; that each source input keeps its own semantics, source authority, version/hash, provenance and audit representation; that aggregation cannot hide insufficient Confidence or high Risk; and that the signal acquires no eligibility, Qualification, legal, business, presentation or release authority.

It will not select, calculate or approve any formula, functional form, coefficient, sign/direction, weight, scale, normalization, clipping, rounding, threshold, activation/deactivation, fallback/cascade, ranking use, algorithm, order, tie-break, candidate set, `K`, metric, target, statistic, dataset, result, verdict, policy, manifest, production, schema, carrier, runtime or implementation.

## Present contents

Exactly three documentation artifacts are present:

1. `05_DEVELOPMENT/matching-engine/decisions/LeaseMind_MATCHING_G33_SYNTHETIC_PRIORITY_SCORE_QUALITATIVE_POLICY_EVIDENCE_BOUNDARY_REFERENCE_AUTHORIZATION_v1.0.md`
2. `05_DEVELOPMENT/matching-engine/synthetic-priority-score-qualitative-policy-evidence-boundary-reference/README.md`
3. `05_DEVELOPMENT/matching-engine/synthetic-priority-score-qualitative-policy-evidence-boundary-reference/G33_FILE_ALLOWLIST_v1.0.json`

The allowlist additionally reserves six `planned` code, test and verification paths. None is created in this phase.

## Closed file allowlist

The authoritative allowlist is `G33_FILE_ALLOWLIST_v1.0.json`, raw SHA-256 `92a8e111f277be8bb35f2f67944306e20365ef65d17544e55c073a9b0ffbbdd1`. It is closed, contains exactly nine paths and intentionally omits its own hash. Any later edit invalidates this binding and requires a new review.

## Governance boundary

- Governance owner: `Chief AI Architect + PRODUCT`.
- Scoring artifact owner: `Chief AI Architect + PRODUCT`.
- Mandatory approvers: `LEGAL + DEVELOPMENT`.
- Consulted domain function: `AI`.
- Evidence/technical-procedure owner: `AI + DEVELOPMENT`, without unilateral authority.

These are the roles recorded by `XFR-D-024 v1.1`; this package assigns no new owner, widens no authority and permits no unilateral approval. Architecture §15.6 and §24 remain `SOURCE_NORMATIVE`; the broader ranking/diversification governance remains independently under `XFR-D-021 v1.0`, and numeric in-scope metric-target governance remains independently under `XFR-D-063 v1.0`.

## Optional internal-ordering and input-separation boundary

Priority Score remains **optional**. This package requires no computation, activation, fallback or user presentation. If ever separately approved, it is only an internal ordering signal for future ranking use; it is not Match Score, Confidence Score, Risk Score, Qualification result, Eligibility result, Hard Constraint result, legal/business conclusion, user-facing score or presentation authorization.

Only three separately calculated, source-authoritative inputs are allowed: `Match Score`, `Confidence Score` and `Risk Score`. Each keeps its own semantics, source authority, version/hash, provenance and audit representation. Priority Score never recomputes, corrects, relabels, hiddenly normalizes, substitutes or writes back any source input; no input is derived from or substituted by another. Qualification, freshness, readiness, negotiation gaps, deduplication, diversity and segment/fairness state remain separate ranking-policy inputs and constraints under `XFR-D-021` and are not imported into Priority Score without a new human-approved versioned decision.

The approved boundary is only: optional internal-ordering; the exact Match Score / Confidence Score / Risk Score input allowlist with separate authority, version, hash, provenance and audit visibility; no derivation, substitution or rewrite; non-compensation; authority preservation; affected-use fail-closed behavior without defaults or negative facts; immutable evidence and reproducibility prerequisites; `XFR-D-021` independence; and no automatic action. Every exact formula, functional form, coefficient, sign/direction, weight, scale, normalization, clipping, rounding, threshold, activation/deactivation, fallback/cascade, ranking use, algorithm, order, tie-break, candidate set, `K`, metric, target, statistic, dataset, result, verdict, policy, manifest, production, schema, carrier, runtime and implementation content remains `OPEN` and is neither selected nor approved here.

## Non-compensation and authority preservation

A high Match Score never compensates insufficient or low Confidence and never turns an unverified option into the first Qualified option without separately required verification. A high Match Score or Confidence never hides or compensates source-defined high Risk. Priority Score never hides high Risk inside an aggregate percentage, rank or presentation and never replaces separate Risk visibility.

Priority Score cannot bypass, weaken or compensate a Hard Constraint, Eligibility, Qualification, freshness, readiness, negotiation-gap, deduplication, fairness, lawful-basis, evidence or disclosure failure, and creates no routing, legal, business or presentation authority. A good result never compensates failed or insufficient ranking, calibration, false-exclusion, segment, fairness, risk, safety or reproducibility evidence; no aggregate, average, threshold, majority, segment or synthetic result creates a waiver for a separately failed prerequisite.

## Fail-closed behavior and evidence prerequisites

Authoritative use requires a separately approved Priority Score policy/version/hash and compatible authoritative versions/hashes of all three inputs. Missing, unknown, stale, conflicting, revoked, invalidated, unmapped or version/hash-incompatible policy/input/evidence/applicability state is never replaced by zero, neutral, average, worst, best, majority, heuristic, AI-inferred, proxy-imputed or conventional default, and never becomes a negative business fact, rejection, eligibility/Qualification/Risk result, route, primary reason, display text or Safe Presentation decision. Affected Priority Score use blocks fail closed absent a separately approved compatible fallback; unrelated processing is not blocked.

No future Priority Score content policy can be considered approved without an immutable, versioned evidence package including the exact candidate policy/version/hash, compatible source versions/hashes and separate audit outputs, a frozen dataset/allocation/manifest/lineage, pre-registered hypotheses and metric families, isolated tuning and final evidence, complete separate reporting, deterministic replay, and independent segment/fairness/risk/safety review. These are prerequisites, not approvals.

## Prohibited surrogates and defaults

- A conventional weighted sum, average, product or any presumed functional form is not governance approval; formula, functional form, coefficients, signs/directions, weights, scale and normalization remain `OPEN`.
- Zero, neutral, average, worst, best, majority, heuristic, AI-inferred or proxy-imputed substitutes for a missing, stale, conflicting or incompatible input are prohibited.
- The current baseline, a synthetic result or any library default is never an activation threshold or a value approval.
- Good aggregate performance never compensates fairness, false-exclusion, risk or segment failure; evidence families do not compensate each other.
- Final evidence is never used to tune and then validate the same candidate; tuning and untouched final evidence stay isolated.
- Synthetic-only evidence never creates production calibration, production applicability or readiness.
- No result automatically changes formula, weight, threshold, model, policy, ranking, routing, release, runtime, monitoring, rollback or gate.

## What remains `OPEN`

Whether/when Priority Score is activated for any use, segment, environment or candidate set; the exact formula, functional form, coefficients, signs/directions, weights, scale, range, normalization, clipping and rounding; thresholds, activation/deactivation, applicability, fallback and cascade rules; the ranking/diversification algorithm, ordering, tie-breaks, candidate-set construction and filtering, `K`, minimum-quality and diversity rules (`XFR-D-021`); the exact ranking/retrieval/calibration/diversification metrics, targets, denominators, aggregation and statistics (`XFR-D-063`/`XFR-D-070`); the segment universe, intersections, membership, lawful basis and overrides (`XFR-D-018`/`XFR-D-042`); the exact fairness doctrine, classification, comparator, metric, threshold, statistics and legal verdict (`XFR-D-068`); the Risk formula, human-review thresholds, Qualification routing and critical-risk handling; dataset size/allocation/splits/seed, labels/adjudication/grouping/corrections, actual baseline, manifest, evaluation run, results and verdict; production-data authority, lawful basis, privacy/security approvals, production calibration/applicability/readiness and named appointments/RBAC; the Scoring/Evaluation/Feature/Risk/Qualification/Safe Presentation Policy and Controlled Artifact Manifest approvals; API/DB/schema/events/carrier, statuses/enums/error codes, retry/recovery/escalation/observability, monitoring, rollback and implementation; and every governance-gate approval.

`XFR-D-021`, `XFR-D-063`, `XFR-D-018`, `XFR-D-042`, `XFR-D-068`, `XFR-D-070`, the applicable `XFR-D-023`, `XFR-D-026`, `XFR-D-027`, `XFR-D-048`, `XFR-D-055` and `XFR-D-057`–`XFR-D-071`, `XFR-D-078` and all other named sibling decisions retain their independent identity and authority and are neither reopened, absorbed, superseded, selected nor approved here.

## Future static reference requirements

The later page, if separately authorized, must be static and all-at-once, contain exactly six ordered regions, the twelve-row qualitative matrix, complete `OPEN` content and a final non-decision result. It must contain no controls, links, live regions, mutable state, network access, persistence, logging, telemetry, timers, randomness, person data, property data, UUIDs or business records.

Regions in the frozen order:

1. `SOURCE AND STATUS BOUNDARY`
2. `PRIORITY SCORE QUALITATIVE POLICY MATRIX`
3. `ROLE AND APPROVAL SEPARATION`
4. `OPTIONAL INTERNAL-ORDERING, INPUT-SEPARATION AND NON-COMPENSATION BOUNDARY`
5. `OPEN EXACT CONTENT`
6. `NON-DECISION RESULT`

Always-visible statements:

1. `SYNTHETIC PRIORITY SCORE QUALITATIVE POLICY EVIDENCE BOUNDARY REFERENCE — NOT PRODUCTION APPROVED`
2. `MANUAL DEV-ONLY REFERENCE — QUALITATIVE PRIORITY SCORE POLICY AND EVIDENCE BOUNDARY ONLY`
3. `NO FORMULA, WEIGHT, SIGN/DIRECTION, SCALE, NORMALIZATION, THRESHOLD, ACTIVATION, FALLBACK OR RANKING USE SELECTED`

The page must terminate with `G33_SYNTHETIC_NO_PRIORITY_SCORE_FORMULA_WEIGHT_DIRECTION_SCALE_NORMALIZATION_THRESHOLD_ACTIVATION_FALLBACK_OR_RANKING_USE_SELECTED` and the non-decision statement `NO FORMULA, WEIGHT, SIGN/DIRECTION, SCALE, NORMALIZATION, THRESHOLD, ACTIVATION, FALLBACK, RANKING USE, DATA, PRODUCTION, RUNTIME OR IMPLEMENTATION ACTION OCCURRED`.

Manual dev URL: `http://127.0.0.1:5173/synthetic-priority-score-qualitative-policy-evidence-boundary-reference.html`.

## Acceptance checklist for a separately authorized code phase

- Render the three permanent statements exactly once.
- Render six regions in the frozen order and twelve matrix rows in the frozen order.
- Preserve `XFR-D-024 v1.1` as `PARTIALLY_RESOLVED_BOUNDARY` with canonical identity `MSP-11 → XFR-D-024`, `PRIMARY_STANDALONE`.
- Preserve optional internal-ordering-only purpose and the exact Match/Confidence/Risk input allowlist with separate authority, version, hash, provenance and audit visibility.
- Preserve no derivation/substitution/rewrite, non-compensation, authority preservation and affected-use fail-closed behavior without defaults or negative facts.
- Preserve immutable evidence/reproducibility prerequisites, `XFR-D-021` independence and no automatic action.
- Bind source, scenario, test and verification data to the frozen allowlist hash.
- Assert the complete `OPEN` categories and that no formula, weight, sign/direction, scale, normalization, threshold, activation, fallback or ranking use is selected.
- Assert no controls, links, state, network, persistence, timers, randomness or automatic action.
- Assert exactly nine allowlisted paths: three `present`, six `planned` before code phase.
- Assert gate impact `NONE` and all three gates `BLOCKED`.
- Assert the terminal token and the non-decision line appear exactly once and last.
- Preserve Inventory counts 102 source keys / 90 canonical IDs, Scoring register 18 rows and Evaluation register 17 rows, and edit neither the Inventory nor the Scoring Policy.

## Gate impact

`IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` remain `BLOCKED`. Package gate impact is `NONE`.

## Outcome

This phase authorizes documentation only. It does not approve or execute a formula, functional form, coefficient, sign/direction, weight, scale, normalization, clipping, rounding, threshold, activation/deactivation, fallback/cascade, ranking use, algorithm, order, tie-break, candidate set, `K`, metric, target, statistic, dataset, evaluation run, result, verdict, policy, manifest, production-data use, runtime or implementation. `XFR-D-024 v1.1` remains `PARTIALLY_RESOLVED_BOUNDARY`, canonical identity `MSP-11 → XFR-D-024`, `PRIMARY_STANDALONE`; Inventory counts, crosswalk and registers remain unchanged and neither the Inventory nor the Scoring Policy is edited. Code phase remains blocked pending an independent audit and separate human confirmation.
