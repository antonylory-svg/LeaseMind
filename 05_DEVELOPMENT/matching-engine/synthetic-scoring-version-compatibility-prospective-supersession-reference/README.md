# G32 Synthetic Scoring Version-Compatibility and Prospective-Supersession Reference

**Status:** `DOCUMENTATION_ONLY_AUTHORIZED`

**Code phase:** `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`

**Baseline:** `aacd6445d4115b38451f195224b664c9db111188`

**Branch:** `development/sprint-7-matching-g32-synthetic-scoring-version-compatibility-prospective-supersession-reference`

**Source:** `XFR-D-023 v1.0` — `RESOLVED_QUALITATIVE_BOUNDARY`

**Canonical identity:** `MSP-10 → XFR-D-023`, `PRIMARY_STANDALONE`

## Purpose

G32 reserves a manual, isolated, static, development-only reference for the qualitative scoring version-compatibility and prospective-supersession boundary approved by `XFR-D-023`. It will explain what version-change discipline a future Scoring Policy change would require; it will not select, calculate or approve any function, dimension, weight, threshold, numeric value, semantic-versioning scheme, tolerance, serialization, runtime representation, policy, production use or implementation.

## Present contents

Exactly three documentation artifacts are present:

1. `05_DEVELOPMENT/matching-engine/decisions/LeaseMind_MATCHING_G32_SYNTHETIC_SCORING_VERSION_COMPATIBILITY_PROSPECTIVE_SUPERSESSION_REFERENCE_AUTHORIZATION_v1.0.md`
2. `05_DEVELOPMENT/matching-engine/synthetic-scoring-version-compatibility-prospective-supersession-reference/README.md`
3. `05_DEVELOPMENT/matching-engine/synthetic-scoring-version-compatibility-prospective-supersession-reference/G32_FILE_ALLOWLIST_v1.0.json`

The allowlist additionally reserves six `planned` code, test and verification paths. None is created in this phase.

## Closed file allowlist

The authoritative allowlist is `G32_FILE_ALLOWLIST_v1.0.json`, raw SHA-256 `fc444155fdea210d6d92f23ef01e1edae2a482be7066d71e421c28f89397b45e`. It is closed, contains exactly nine paths and intentionally omits its own hash. Any later edit invalidates this binding and requires a new review.

## Governance boundary

- Governance owner: `Chief AI Architect + PRODUCT`.
- Scoring artifact owner: `Chief AI Architect + PRODUCT`.
- Mandatory approvers: `LEGAL + DEVELOPMENT`.
- Consulted domain function: `AI`.
- Technical schema/versioning steward: `DEVELOPMENT`, with no unilateral authority.

These are the roles recorded by `XFR-D-023 v1.0`; this package assigns no new owner. Architecture §37 authority over the Mutual Aggregate function and starting/segment weights remains `AI + PRODUCT`, `SOURCE_NORMATIVE`, and numeric in-scope metric-target governance remains independently under `XFR-D-063 v1.0`.

The future reference may present only the ten qualitative rows frozen in the allowlist: prospective-only supersession and immutable history; non-exhaustive breaking baseline; fail-closed classification of all other changes; breaking requires a new `scoring_policy_version` and a consistent bundle snapshot; unchanged component versions remain independent; inactive candidates are potentially additive only with explicit review; no function/dimension/weight/threshold/value/semver/tolerance/serialization/runtime representation selected; independently open boundaries preserved; independent decisions preserved; and resolved qualitative boundary with exact content still open and no automatic action.

## Prospective supersession and immutable history

A new `scoring_policy_version` never rewrites, reinterprets or mutates an already computed and saved Match Result. Supersession applies forward only to new computations, and a historical result stays bound to its own `scoring_policy_version`; producing a new output requires a new computation on the current version. This is consistent with Architecture §33 (deterministic replay) and §49 (severity-1 on exact replay mismatch).

## Non-exhaustive breaking baseline and fail-closed classification

The minimal identified breaking baseline is: an active Mutual Aggregate function change; an active measurement dimension add or remove; and a change of a weight already affecting active arithmetic. The list is non-exhaustive and does not close the taxonomy. Any other change affecting active scoring arithmetic or the interpretation of an already computed Match Result requires explicit governance classification and otherwise defaults fail-closed to breaking. Every breaking change requires a new `scoring_policy_version` and an internally consistent reproducibility-bundle snapshot reflecting the actual versions and hashes used. Unchanged Feature Schema, Risk Policy and Qualification Policy component versions remain independent and are not force-incremented; each component version reflects only what actually changed in that component.

## Potentially additive candidates

A new inactive comparison candidate may be classified potentially additive only while it cannot affect active computation, output or routing. It always requires explicit review before activation; additive classification alone never authorizes activation, and silent activation is prohibited.

## Prohibited surrogates and defaults

- Conventional semver conventions, major/minor/patch defaults and any presumed versioning scheme are not governance approval.
- Common tolerance values, library defaults and current code behavior have no governance authority.
- Architecture §33 deterministic replay and §49 severity-1 mismatch rules remain separate, inviolable and non-substitutable.
- Synthetic-only evidence never creates production calibration, production applicability or readiness.
- No result automatically changes function, weight, threshold, model, policy, ranking, routing, release, runtime, monitoring, rollback or gate.

## What remains `OPEN`

The exact semantic-versioning scheme (major/minor/patch or other); bounded replay tolerance value, range, unit, error metric, direction and comparator; decimal/fixed-point versus floating-point representation, precision, intermediate operations and rounding; canonical serialization ordering, number encoding and transport/storage; exact runtime version-bundle representation, schema, API, database, event and carrier; Mutual Aggregate function, dimension set and inactive candidate set; starting/segment weight values, thresholds and numeric content; any future Match Score combination rule and its governance classification; any classification taxonomy beyond the non-exhaustive baseline; dataset/evidence/run/result/sufficiency verdict; and every policy, production-data, runtime, implementation and gate approval.

`XFR-D-017`, `XFR-D-020`, `XFR-D-021`, `XFR-D-022`, `XFR-D-024 v1.1`, `XFR-D-M4`, `XFR-D-026`, `XFR-D-027`, `XFR-D-028`, `XFR-D-063` and all other named sibling decisions retain their independent identity and authority.

## Future static reference requirements

The later page, if separately authorized, must be static and all-at-once, contain exactly six ordered regions, the ten-row matrix, complete `OPEN` content, and a final non-decision result. It must contain no controls, links, live regions, mutable state, network access, persistence, logging, telemetry, timers, randomness, person data, property data, UUIDs or business records.

Always-visible statements:

1. `SYNTHETIC SCORING VERSION-COMPATIBILITY AND PROSPECTIVE-SUPERSESSION REFERENCE — NOT PRODUCTION APPROVED`
2. `MANUAL DEV-ONLY REFERENCE — QUALITATIVE SCORING VERSION-COMPATIBILITY AND PROSPECTIVE-SUPERSESSION BOUNDARY ONLY`
3. `NO FUNCTION, DIMENSION, WEIGHT, THRESHOLD, NUMERIC VALUE, SEMVER SCHEME, TOLERANCE, SERIALIZATION OR RUNTIME REPRESENTATION SELECTED`

Manual dev URL: `http://127.0.0.1:5173/synthetic-scoring-version-compatibility-prospective-supersession-reference.html`.

## Acceptance checklist for a separately authorized code phase

- Render the three permanent statements exactly once.
- Render six regions in the frozen order and ten matrix rows in the frozen order.
- Preserve `XFR-D-023` as `RESOLVED_QUALITATIVE_BOUNDARY` with canonical identity `MSP-10 → XFR-D-023`, `PRIMARY_STANDALONE`.
- Preserve prospective-only supersession and immutable historical Match Results.
- Preserve the non-exhaustive breaking baseline and fail-closed classification of everything else.
- Preserve unchanged-component version independence and no forced cross-policy version increment.
- Bind source, scenario, test and verification data to the frozen allowlist hash.
- Assert the complete `OPEN` categories and that no function/dimension/weight/threshold/value/semver/tolerance/serialization/runtime representation is selected.
- Assert no controls, links, state, network, persistence, timers, randomness or automatic action.
- Assert exactly nine allowlisted paths: three `present`, six `planned` before code phase.
- Assert gate impact `NONE` and all three gates `BLOCKED`.
- Assert the terminal token and non-decision line appear exactly once and last.

## Gate impact

`IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` remain `BLOCKED`. Package gate impact is `NONE`.

## Outcome

This phase authorizes documentation only. It does not approve or execute a function, dimension, weight, threshold, numeric value, semantic-versioning scheme, tolerance, serialization, runtime representation, dataset, evaluation run, result, policy, production-data use, runtime or implementation. `XFR-D-023` remains `RESOLVED_QUALITATIVE_BOUNDARY`, canonical identity `MSP-10 → XFR-D-023`, `PRIMARY_STANDALONE`; Inventory counts, crosswalk and registers remain unchanged and neither the Inventory nor the Scoring Policy is edited. Code phase remains blocked pending an independent audit and separate human confirmation.
