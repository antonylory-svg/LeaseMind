# G44 Synthetic Qualification Qualitative-Precedence Reference

**Status:** `DOCUMENTATION_ONLY_AUTHORIZED`

**Code phase:** `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`

**Baseline:** `2318227ea25f4671dfc2dbb79b206d02da2ebf0d`

**Branch:** `development/sprint-7-matching-g44-synthetic-qualification-qualitative-precedence-reference`

**Source:** `XFR-D-033 v1.0` — `APPROVED QUALITATIVE PRECEDENCE — numeric thresholds and reason catalog remain OPEN`

**Canonical identity:** `MQP-04 → XFR-D-033` — `PRIMARY_STANDALONE`

## Purpose

G44 reserves a manual, isolated, static, development-only reference for the approved deterministic fail-closed qualitative precedence among simultaneously applicable Qualification causes. It demonstrates route selection, non-compensation and multi-cause preservation without selecting or approving numeric severity, reason-catalog order or a runtime algorithm.

It does not approve any threshold, severity value, weight, aggregation, catalog entry/order, primary-reason representation, enum, field, carrier, serializer, API, event, schema, Policy, Data Contracts change, dataset, manifest, production use, runtime or implementation.

## Present contents

Exactly three documentation artifacts are present:

1. `05_DEVELOPMENT/matching-engine/decisions/LeaseMind_MATCHING_G44_SYNTHETIC_QUALIFICATION_QUALITATIVE_PRECEDENCE_REFERENCE_AUTHORIZATION_v1.0.md`
2. `05_DEVELOPMENT/matching-engine/synthetic-qualification-qualitative-precedence-reference/README.md`
3. `05_DEVELOPMENT/matching-engine/synthetic-qualification-qualitative-precedence-reference/G44_FILE_ALLOWLIST_v1.0.json`

The allowlist reserves exactly six additional `planned` code, test and verification paths. None is created in this phase.

## Closed file allowlist

The authoritative allowlist is `G44_FILE_ALLOWLIST_v1.0.json`, raw SHA-256 `f3c2a97512f1562c8f8587aeadb67fdf2518c020620a5bcdab2693d4a8ec0155`. It is closed, contains exactly nine paths and intentionally omits its own hash. Any later edit invalidates this binding and requires a new review.

## Exact qualitative precedence

1. Confirmed Eligibility `INELIGIBLE` with complete six-part evidence has highest precedence and maps to `REJECTED_BY_MATCHING`.
2. A mandatory human-review cause maps to `HUMAN_REVIEW_REQUIRED` only when no confirmed `INELIGIBLE` exists.
3. An unresolved verification need, missing/unknown information or insufficient evidence maps to `NEEDS_VERIFICATION` only when no higher class exists.
4. `QUALIFIED_HYPOTHESIS` is permitted only when all three higher classes are absent and all qualitative Architecture §18.1 conditions are met.
5. `STALE` remains orthogonal under `XFR-D-038`; it is not a routing result or fifth precedence level.

## Non-compensation and multi-cause boundary

- Score, rank, Confidence or another favorable signal cannot compensate for a higher-precedence cause.
- Precedence selects the final route but never deletes other applicable causes or evidence references.
- Primary reason remains a summary from the route-determining class under `XFR-D-040`.
- Same-class semantic order and primary-reason representation remain `OPEN`.
- Identifier, file, storage, manifest, crosswalk, discovery, SQL, mapping order or multiplicity has no semantic priority.

## What remains OPEN

Numeric thresholds/cutoffs/comparators/calibration; ordinal severity registry/values/weights/aggregation; reason-catalog identifiers/codes/values/membership/order; same-class semantic order and primary-reason representation; runtime algorithm/data structures/tie handling; enum/field/carrier/schema/API/DB/event/transport; versioning/compatibility/migration/supersession/rollback; evidence/provenance/replay/audit/monitoring/TTL/recalculation; Policy/Data Contracts approval, manifest, dataset/evidence, production applicability, runtime, implementation, release and gates remain `OPEN`.

The approved hierarchy cannot supply a guessed threshold, severity, reason order, primary reason, runtime algorithm, Policy approval, production-readiness claim or implementation permission.

## Future code phase

A separate approval may authorize only the six `planned` paths. The page must be manual, static and development-only; render the exact title, three permanent lines, six ordered regions and twelve frozen matrix rows from the allowlist; preserve the four-level hierarchy, `STALE` orthogonality, non-compensation, all-cause preservation and primary-reason separation; terminate with the frozen token and non-decision line; contain no controls, network, persistence, telemetry, mutable state or real person, organization, property, UUID or business-record data; and pass a focused deterministic test plus typecheck.

## Acceptance checklist

- [ ] `XFR-D-033 v1.0` remains `APPROVED QUALITATIVE PRECEDENCE — numeric thresholds and reason catalog remain OPEN`.
- [ ] `MQP-04 → XFR-D-033` remains `PRIMARY_STANDALONE`.
- [ ] The four route-determining precedence levels retain exact order.
- [ ] Confirmed `INELIGIBLE` requires complete six-part evidence.
- [ ] `QUALIFIED_HYPOTHESIS` requires absence of all higher classes and all §18.1 qualitative conditions.
- [ ] `STALE` remains orthogonal and does not become a fifth result.
- [ ] Favorable score/rank/Confidence never compensates for a higher class.
- [ ] Every applicable cause and evidence reference remains preserved.
- [ ] Primary-reason authority remains with `XFR-D-040`.
- [ ] Incidental technical order creates no semantic priority.
- [ ] Numeric thresholds, severity registry, catalog order and runtime algorithm remain `OPEN`.
- [ ] Sibling Qualification decisions remain independent.
- [ ] No Policy, Data Contracts, dataset, production, runtime or implementation is approved.
- [ ] Twelve frozen rows and six page regions retain exact order.
- [ ] Allowlist hash matches this README and the authorization record.
- [ ] Exactly three documentation files are present; six code paths remain `planned`.
- [ ] Gate impact is `NONE`; all three governance gates remain `BLOCKED`.

## Outcome

This phase authorizes documentation only. It approves no numeric threshold, severity registry, reason-catalog order, runtime algorithm, Qualification Policy, Data Contracts change, production use, runtime or implementation. Code creation remains blocked pending independent audit and separate human confirmation.
