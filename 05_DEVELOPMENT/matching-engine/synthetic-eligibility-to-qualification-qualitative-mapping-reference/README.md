# G43 Synthetic Eligibility-to-Qualification Qualitative-Mapping Reference

**Status:** `DOCUMENTATION_ONLY_AUTHORIZED`

**Code phase:** `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`

**Baseline:** `7f46c3049ec643b1bf26faa4f91ae126a09dbbbb`

**Branch:** `development/sprint-7-matching-g43-synthetic-eligibility-to-qualification-qualitative-mapping-reference`

**Source:** `XFR-D-032 v1.0` — `APPROVED QUALITATIVE MAPPING — runtime representation and numeric thresholds remain OPEN`

**Canonical identity:** `MQP-03 → XFR-D-032` — `PRIMARY_STANDALONE`

## Purpose

G43 reserves a manual, isolated, static, development-only reference for the approved one-way qualitative mapping from Eligibility Filter results to Matching Qualification Gate results. It preserves stage and namespace separation and the complete fail-closed boundary without selecting or approving numeric thresholds or an exact runtime representation.

It does not approve any threshold, enum, field, namespace, carrier, reason-code catalog, serializer, API, event, schema, Policy, Data Contracts change, dataset, manifest, production use, runtime or implementation.

## Present contents

Exactly three documentation artifacts are present:

1. `05_DEVELOPMENT/matching-engine/decisions/LeaseMind_MATCHING_G43_SYNTHETIC_ELIGIBILITY_TO_QUALIFICATION_QUALITATIVE_MAPPING_REFERENCE_AUTHORIZATION_v1.0.md`
2. `05_DEVELOPMENT/matching-engine/synthetic-eligibility-to-qualification-qualitative-mapping-reference/README.md`
3. `05_DEVELOPMENT/matching-engine/synthetic-eligibility-to-qualification-qualitative-mapping-reference/G43_FILE_ALLOWLIST_v1.0.json`

The allowlist reserves exactly six additional `planned` code, test and verification paths. None is created in this phase.

## Closed file allowlist

The authoritative allowlist is `G43_FILE_ALLOWLIST_v1.0.json`, raw SHA-256 `98c1878ab75c4525c0c6d7f2cb4884dd58ded2b772ec50b4ccd56247239f1941`. It is closed, contains exactly nine paths and intentionally omits its own hash. Any later edit invalidates this binding and requires a new review.

## Exact qualitative mapping

- Eligibility `INELIGIBLE` maps to Qualification `REJECTED_BY_MATCHING` only when all six Architecture §14 conditions are proven and preserved together.
- Eligibility `ELIGIBLE` only permits continued calculation; it never automatically means `QUALIFIED_HYPOTHESIS` or bypasses remaining Qualification conditions.
- Eligibility `NEEDS_VERIFICATION` maps to Qualification `NEEDS_VERIFICATION` unless a separate critical reason requires `HUMAN_REVIEW_REQUIRED`; it never creates rejection by itself.
- Source-fallback Eligibility `HUMAN_REVIEW_REQUIRED` maps to Qualification `HUMAN_REVIEW_REQUIRED`.
- Missing or unknown information is not a negative fact.
- Risk Score, model inference, correlation or absence of data alone cannot create rejection.
- Eligibility and Qualification remain distinct stages and namespaces even where labels have identical text.

## Six-condition fail-closed rule

Automatic Eligibility `INELIGIBLE` requires all six: a pre-approved versioned Hard Constraint; explicit party input or a directly mandatory rule rather than model inference; a current permitted source confirming incompatibility; no protected attribute, hidden proxy or discriminatory restriction; no unknown, source conflict or required legal interpretation; and a result carrying reason code, rule version and evidence reference with human review available.

If any condition is missing, the mapping to `REJECTED_BY_MATCHING` is prohibited.

## What remains OPEN

Numeric thresholds/calibration; exact runtime enum/field/namespace/identifiers/codes/values; carrier shape/cardinality/requiredness/nullability/lifecycle; serialization/validation/error/unknown/fallback behavior; API/DB/event/topic/message/payload representation; reason-code catalog and reason/result crosswalk; schema versioning/compatibility/migration/supersession/rollback; evidence-reference carrier/provenance/replay/audit/monitoring/TTL/recalculation; Policy/Data Contracts approval, manifest, dataset/evidence, production applicability, runtime, implementation, release and gates remain `OPEN`.

The approved mapping cannot supply a guessed threshold, shared enum, alias, field, carrier, negative fact, rejection, Policy approval, production-readiness claim or implementation permission.

## Future code phase

A separate approval may authorize only the six `planned` paths. The page must be manual, static and development-only; render the exact title, three permanent lines, six ordered regions and twelve frozen matrix rows from the allowlist; preserve the complete six-condition rule and every namespace/non-rejection/open-content boundary; terminate with the frozen token and non-decision line; contain no controls, network, persistence, telemetry, mutable state or real person, organization, property, UUID or business-record data; and pass a focused deterministic test plus typecheck.

## Acceptance checklist

- [ ] `XFR-D-032 v1.0` remains `APPROVED QUALITATIVE MAPPING — runtime representation and numeric thresholds remain OPEN`.
- [ ] `MQP-03 → XFR-D-032` remains `PRIMARY_STANDALONE`.
- [ ] Eligibility and Qualification remain distinct stages and namespaces.
- [ ] All six automatic-`INELIGIBLE` conditions remain cumulative and exact.
- [ ] `ELIGIBLE` never automatically means `QUALIFIED_HYPOTHESIS`.
- [ ] `NEEDS_VERIFICATION` never creates rejection by itself.
- [ ] Missing/unknown is never coerced into a negative fact or rejection.
- [ ] Risk/model/correlation/data absence alone never creates rejection.
- [ ] Identical labels do not approve a shared enum, field or carrier.
- [ ] Numeric thresholds, runtime representation and reason codes remain `OPEN`.
- [ ] Sibling Qualification decisions remain independent.
- [ ] No Policy, Data Contracts, dataset, production, runtime or implementation is approved.
- [ ] Twelve frozen rows and six page regions retain exact order.
- [ ] Allowlist hash matches this README and the authorization record.
- [ ] Exactly three documentation files are present; six code paths remain `planned`.
- [ ] Gate impact is `NONE`; all three governance gates remain `BLOCKED`.

## Outcome

This phase authorizes documentation only. It approves no numeric threshold, runtime representation, Qualification Policy, Data Contracts change, production use, runtime or implementation. Code creation remains blocked pending independent audit and separate human confirmation.
