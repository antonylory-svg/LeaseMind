# G48 Synthetic Critical Conflicting-Evidence Qualitative-Criticality Reference

**Status:** `DOCUMENTATION_ONLY_AUTHORIZED`

**Code phase:** `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`

**Baseline:** `e2045b7fc010c82f6d06656ae143fe316e304595`

**Branch:** `development/sprint-7-matching-g48-synthetic-critical-conflicting-evidence-qualitative-criticality-reference`

**Source:** `XFR-D-037 v1.0` — `RESOLVED_QUALITATIVE_BOUNDARY`

**Canonical identity:** `MQP-10 → XFR-D-037` — `PRIMARY_STANDALONE`

## Purpose

G48 reserves a manual, isolated, static, development-only reference for the approved outcome-sensitive qualitative definition of critical conflicting evidence, `XFR-D-033` human-review precedence, complete preservation of versions/evidence, Confidence reduction, non-negative treatment and no automatic rejection.

It approves no numeric threshold, exhaustive critical-field catalog, severity scale, runtime classifier, reviewer verdict, Policy, production use, runtime or implementation.

## Present contents

Exactly three documentation artifacts are present:

1. `05_DEVELOPMENT/matching-engine/decisions/LeaseMind_MATCHING_G48_SYNTHETIC_CRITICAL_CONFLICTING_EVIDENCE_QUALITATIVE_CRITICALITY_REFERENCE_AUTHORIZATION_v1.0.md`
2. `05_DEVELOPMENT/matching-engine/synthetic-critical-conflicting-evidence-qualitative-criticality-reference/README.md`
3. `05_DEVELOPMENT/matching-engine/synthetic-critical-conflicting-evidence-qualitative-criticality-reference/G48_FILE_ALLOWLIST_v1.0.json`

The allowlist reserves exactly six additional `planned` paths. None is created now.

## Closed allowlist

`G48_FILE_ALLOWLIST_v1.0.json` has raw SHA-256 `9f0a60b95cfdbf4bbfe50ef4e0cca188015e27907ff1700e84ee3e87e92c68b5`, contains exactly nine paths and intentionally omits its own hash.

## Approved qualitative boundary

A conflict is critical only under the approved outcome-sensitive definition: selecting any preserved version can change Eligibility, one of four Qualification results, a Hard Constraint or mandatory §18.1 condition, a protected/proxy/lawful-basis/authority/legal-rights boundary, or Safe Presentation/disclosure admissibility.

Critical conflict requires `HUMAN_REVIEW_REQUIRED` subject to `XFR-D-033` precedence. Noncritical conflict preserves all versions and evidence references, reduces Confidence, is not a negative fact and creates no automatic rejection.

## Governance

- Qualification owner: `Chief AI Architect + PRODUCT`.
- Mandatory approvers: `LEGAL + DEVELOPMENT`.
- `AI`: consulted, without unilateral authority.
- Change control: `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT` on a new versioned record.

## What remains OPEN

Numeric threshold/severity scale; critical-field catalog; conflict comparison/classification; outcome-change proof and uncertainty; aggregation/order/ties/cascade; Confidence reduction formula; reviewer workflow/RBAC; data/evaluation; Policy/Data Contracts/manifest; schema/carrier; production/runtime/implementation remain `OPEN`.

No severity score, field importance, completeness threshold, evidence status, Confidence cutoff, source priority, UI label or implementation default may act as a surrogate.

## Future code phase

A separate approval may authorize only the six `planned` paths. The future page must be manual, static and development-only; reproduce the exact title, three permanent lines, six ordered regions, twelve-row matrix and terminal fields from the allowlist; contain no controls, network, persistence, telemetry, mutable state or private data; and pass a focused deterministic test plus typecheck.

## Acceptance checklist

- [ ] `XFR-D-037` remains `RESOLVED_QUALITATIVE_BOUNDARY` and `MQP-10` remains primary.
- [ ] The five outcome-change classes remain exact.
- [ ] `XFR-D-033` precedence remains authoritative.
- [ ] Noncritical conflict preserves versions/evidence and remains non-negative.
- [ ] No numeric threshold, exhaustive catalog, severity scale or classifier is selected.
- [ ] OPEN content and sibling boundaries remain independent.
- [ ] Twelve frozen rows and six regions retain exact order.
- [ ] Allowlist hash matches both documentation bindings.
- [ ] Exactly three docs are present and six code paths remain `planned`.
- [ ] Gate impact is `NONE`; all three gates remain `BLOCKED`.

## Outcome

This phase authorizes documentation only. Code creation remains blocked pending independent audit and separate human confirmation.
