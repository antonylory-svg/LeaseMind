# G38 Synthetic Scoring Production-Calibration Evidence Boundary Reference

**Status:** `DOCUMENTATION_ONLY_AUTHORIZED`

**Code phase:** `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`

**Baseline:** `65eb5349fec387f3eda357f441b396fb9005aee3`

**Branch:** `development/sprint-7-matching-g38-synthetic-scoring-production-calibration-evidence-boundary-reference`

**Source:** `XFR-D-026 v1.0` — `RESOLVED_EVIDENCE_BOUNDARY`

**Canonical identity:** `MSP-15 → XFR-D-026` — `PRIMARY_STANDALONE`

## Purpose

G38 reserves a manual, isolated, static, development-only reference for the Scoring synthetic-only versus production-calibration evidentiary boundary. It makes visible that synthetic dataset categories 1–4, successful synthetic runs and synthetic robustness/calibration metrics cannot by themselves establish production calibration, readiness, launch readiness or Scoring candidate approval.

It does not select or approve any dataset, metric, calibration procedure, acceptance threshold, production-readiness criterion, Mutual Aggregate function, weight, value, Policy, production use, schema, carrier, runtime or implementation.

## Present contents

Exactly three documentation artifacts are present:

1. `05_DEVELOPMENT/matching-engine/decisions/LeaseMind_MATCHING_G38_SYNTHETIC_SCORING_PRODUCTION_CALIBRATION_EVIDENCE_BOUNDARY_REFERENCE_AUTHORIZATION_v1.0.md`
2. `05_DEVELOPMENT/matching-engine/synthetic-scoring-production-calibration-evidence-boundary-reference/README.md`
3. `05_DEVELOPMENT/matching-engine/synthetic-scoring-production-calibration-evidence-boundary-reference/G38_FILE_ALLOWLIST_v1.0.json`

The allowlist reserves exactly six additional `planned` code, test and verification paths. None is created in this phase.

## Closed file allowlist

The authoritative allowlist is `G38_FILE_ALLOWLIST_v1.0.json`, raw SHA-256 `c12b1f9a51e9a5bfdc69de26f9fd592ae765e98db86dee7f52e4d3cd4a1f6875`. It is closed, contains exactly nine paths and intentionally omits its own hash. Any later edit invalidates this binding and requires a new review.

## Governance boundary

- Governance owner: `Chief AI Architect + PRODUCT`.
- Mandatory approvers: `LEGAL + DEVELOPMENT`.
- Consulted domain function: `AI`.
- Evidence-procedure owner: `AI + DEVELOPMENT` under the Evaluation Plan, without governance co-ownership or unilateral authority.

Evidence preparation or execution is not candidate, Policy, production, runtime, implementation, release or gate approval.

## Resolved evidence boundary

- `MSP-15 → XFR-D-026` remains `PRIMARY_STANDALONE` and `RESOLVED_EVIDENCE_BOUNDARY`.
- Synthetic dataset categories 1–4 do not by themselves establish production calibration, production readiness or launch readiness.
- Successful synthetic evaluation, robustness or calibration metrics create no automatic Scoring approval.
- The Scoring rule mirrors `MRP-C-013` and `MQP-C-019` without superseding or modifying them.
- Evaluation evidence ownership and Scoring governance ownership remain separate.
- Production evidence or any evaluation result alone creates no automatic Policy, runtime, release or gate action.
- Architecture §37 questions №2 and №3 remain `OPEN`.
- All three governance gates remain `BLOCKED`; G38 gate impact is `NONE`.

## What remains OPEN

Dataset size, composition, allocation and split; labels, adjudication, correction, lineage and manifest; metric definition, target, aggregation, uncertainty and statistics; calibration candidate, procedure and comparison; acceptance threshold, tolerance, interval, test and verdict; production-readiness criterion and production-data authority; Mutual Aggregate function; all weights, ratios and values; controlled Policy, Evaluation Plan and manifest approval; schema, carrier, API, DB, events, RBAC, runtime, monitoring, rollback, migration, implementation, release and every gate transition remain `OPEN`.

## Future code phase

A separate approval may authorize only the six `planned` paths. The page must be manual, static and development-only; render the six ordered regions and twelve frozen matrix rows from the allowlist; display the exact authority split, synthetic-only limitation, mirrored-precedent boundary, open contents and no-automatic-approval rule; terminate with the frozen token and non-decision line; contain no controls, network, persistence, telemetry, mutable state or real person, organization, property, UUID or business-record data; and pass a focused deterministic test plus typecheck.

## Acceptance checklist

- [ ] `XFR-D-026 v1.0` remains `RESOLVED_EVIDENCE_BOUNDARY`.
- [ ] `MSP-15 → XFR-D-026` remains `PRIMARY_STANDALONE`.
- [ ] Governance owner, approvers, consulted AI and evidence-procedure owner remain exact and separate.
- [ ] Synthetic-only evidence creates no production calibration or readiness claim.
- [ ] Mirrored Risk/Qualification precedents are not superseded or modified.
- [ ] No dataset, metric, calibration procedure, threshold, readiness criterion, function or weight is approved.
- [ ] Architecture §37 questions №2 and №3 remain `OPEN`.
- [ ] Twelve frozen rows and six page regions retain exact order.
- [ ] Allowlist hash matches this README and the authorization record.
- [ ] Exactly three documentation files are present; six code paths remain `planned`.
- [ ] Gate impact is `NONE`; all three governance gates remain `BLOCKED`.

## Outcome

This phase authorizes documentation only. It approves no evidence result, Policy, production use, runtime or implementation. Code creation remains blocked pending independent audit and separate human confirmation.
