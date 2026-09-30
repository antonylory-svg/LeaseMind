# G36 Synthetic Weight-Policy Qualitative Governance Reference

**Status:** `DOCUMENTATION_ONLY_AUTHORIZED`

**Code phase:** `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`

**Baseline:** `432ac50b166180ae6be474e613ca51ab53f06c17`

**Branch:** `development/sprint-7-matching-g36-synthetic-weight-policy-qualitative-governance-reference`

**Source:** `XFR-D-M5 v1.0` — `PARTIALLY_RESOLVED_BOUNDARY`

**Canonical merged identity:** `MSP-02 + MSP-03 → XFR-D-M5`; both keys are `PRIMARY_MERGED_MEMBER`

## Purpose

G36 reserves a manual, isolated, static, development-only reference for the qualitative weight-policy governance and evidence boundary. It separates weight and threshold parameter families, preserves global-baseline versus segment-override authority, requires explicit lawful segment membership, protects Hard Constraint precedence, makes affected-use fail-closed and evidence safeguards visible, preserves historical results and permits no automatic action.

It does not select or approve any weight, ratio, sign, scale, formula, normalization, threshold, segment, membership rule, lawful basis, dataset, metric, statistic, Policy, production use, schema, carrier, API, DB, event, runtime or implementation.

## Present contents

Exactly three documentation artifacts are present:

1. `05_DEVELOPMENT/matching-engine/decisions/LeaseMind_MATCHING_G36_SYNTHETIC_WEIGHT_POLICY_QUALITATIVE_GOVERNANCE_REFERENCE_AUTHORIZATION_v1.0.md`
2. `05_DEVELOPMENT/matching-engine/synthetic-weight-policy-qualitative-governance-reference/README.md`
3. `05_DEVELOPMENT/matching-engine/synthetic-weight-policy-qualitative-governance-reference/G36_FILE_ALLOWLIST_v1.0.json`

The allowlist reserves exactly six additional `planned` code, test and verification paths. None is created in this phase.

## Closed file allowlist

The authoritative allowlist is `G36_FILE_ALLOWLIST_v1.0.json`, raw SHA-256 `ac7976506d2fd239394a9a954dfed748ba1a1f60255f4b4048aba9853e5d8b65`. It is closed, contains exactly nine paths and intentionally omits its own hash. Any later edit invalidates this binding and requires a new review.

## Governance and artifact-owner boundary

- Substantive governance owner: `AI + PRODUCT` — `SOURCE_NORMATIVE`, Architecture §37 question №3.
- Scoring Policy artifact owner: `Chief AI Architect + PRODUCT` — separately `SOURCE_NORMATIVE`, Architecture §52.
- Mandatory approvers: `Chief AI Architect + LEGAL + DEVELOPMENT`.
- Evidence/technical-procedure owner: `AI + DEVELOPMENT`, without unilateral authority.

The merged decision does not merge these roles or the separate parameter families. No role may self-approve a value, evidence-sufficiency verdict, Policy, production use, runtime, implementation or gate.

## Qualitative boundary

- `MSP-02` and `MSP-03` remain `PRIMARY_MERGED_MEMBER` of `XFR-D-M5`.
- Global/starting weights, segment weights, segment minimum thresholds, other minimum thresholds and Reciprocal Fit ↔ Deal Feasibility weights remain separate parameter families.
- A separately approved global baseline is sole Scoring authority absent a separately approved evidence-supported version/hash-bound lawful applicable override.
- Segment membership must be explicit and source-authoritative; it cannot be inferred, guessed, proxy-imputed or defaulted.
- A confirmed approved Hard Constraint is handled before scoring and cannot be softened or compensated.
- Missing or incompatible material blocks affected progression without a zero/equal/neutral/previous/nearest/heuristic/AI default or negative business fact.
- Immutable frozen preregistered evidence is prerequisite only and approves no exact content.
- Historical results remain bound to their actual Policy version/hash and are never silently recalculated or relabeled.
- Synthetic, evaluation or technical success creates no production claim or automatic Policy/runtime/gate action.

## What remains `OPEN`

All global, starting, per-feature, per-dimension, per-side, per-segment and per-intersection weights; Reciprocal Fit ↔ Deal Feasibility ratio/formula/normalization/arithmetic; all threshold values and semantics; segment universe, membership and lawful basis; global baseline and override contents; Mutual Aggregate, criterion-class weighting, Confidence calibration, Qualification and ranking contents; numeric representation and replay mechanics; datasets, labels, metrics, uncertainty, statistics, results and verdicts; evidence package and production-data authority; all controlled Policy and manifest approvals; schema, carrier, API, DB, events, RBAC, runtime, monitoring, rollback, migration, implementation and every gate transition remain `OPEN`.

The `0.5/0.5` neutral evaluation baseline, pilot cap `100 Campaign`, Campaign → Qualified `40%` target and `25%` stop level are prohibited surrogates.

## Future code phase

A separate approval may authorize only the six `planned` paths. The page must be manual, static and development-only; render the six ordered regions and twelve frozen matrix rows from the allowlist; display exact role, parameter-family, global-baseline, segment-override, Hard Constraint, fail-closed, evidence, historical and open-content boundaries; terminate with the frozen token and non-decision line; contain no network, persistence, telemetry, controls, mutable state or real person, organization, property, UUID or business-record data; and pass a focused deterministic test plus typecheck.

## Acceptance checklist

- [ ] `XFR-D-M5 v1.0` remains `PARTIALLY_RESOLVED_BOUNDARY`.
- [ ] `MSP-02` and `MSP-03` remain `PRIMARY_MERGED_MEMBER`.
- [ ] Substantive owner, artifact owner, approvers and evidence owner remain exact and separate.
- [ ] All parameter families remain distinct and separately attributable.
- [ ] No global baseline or segment override is silently approved.
- [ ] Segment membership cannot be inferred or defaulted.
- [ ] Confirmed Hard Constraints retain pre-scoring precedence and non-compensation.
- [ ] No hidden default, negative fact or automatic action is created.
- [ ] Twelve frozen rows and six page regions retain exact order.
- [ ] No weight, threshold, formula, segment, data, Policy or runtime use is selected.
- [ ] Allowlist hash matches this README and the authorization record.
- [ ] Exactly three documentation files are present; six code paths remain `planned`.
- [ ] Gate impact is `NONE`; all three governance gates remain `BLOCKED`.

## Gate impact

`IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` remain `BLOCKED`. G36 gate impact is `NONE`.

## Outcome

This phase authorizes documentation only. It approves no Policy, data, evaluation verdict, production use, runtime or implementation. Code creation remains blocked pending independent audit and separate human confirmation.
