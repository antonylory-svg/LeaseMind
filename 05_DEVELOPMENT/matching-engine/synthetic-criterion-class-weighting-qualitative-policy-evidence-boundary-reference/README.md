# G34 Synthetic Criterion-Class Weighting Qualitative Policy Evidence Boundary Reference

**Status:** `DOCUMENTATION_ONLY_AUTHORIZED`

**Code phase:** `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`

**Baseline:** `816dcb8fc1e34b855dc7154bd7eb36c0c9d6ca15`

**Branch:** `development/sprint-7-matching-g34-synthetic-criterion-class-weighting-qualitative-policy-evidence-boundary-reference`

**Source:** `XFR-D-025 v1.0` — `PARTIALLY_RESOLVED_BOUNDARY`

**Canonical identity:** `MSP-13 → XFR-D-025`, `PRIMARY_STANDALONE`

## Purpose

G34 reserves a manual, isolated, static, development-only reference for the qualitative criterion-class weighting policy and evidence boundary. It preserves mandatory, desirable, negotiable and informational semantics, keeps confirmed Hard Constraints ahead of scoring, prevents class labels from silently creating eligibility or rejection, separates global and segment-specific authority, and makes fail-closed, frozen-evidence, non-compensation and no-automatic-action rules visible.

It does not select or approve any class assignment, hierarchy, participation rule, weight, ratio, sign, scale, formula, normalization, numerator, denominator, threshold, segment override, precision, dataset, metric, statistic, result, policy, manifest, production use, schema, carrier, runtime or implementation.

## Present contents

Exactly three documentation artifacts are present:

1. `05_DEVELOPMENT/matching-engine/decisions/LeaseMind_MATCHING_G34_SYNTHETIC_CRITERION_CLASS_WEIGHTING_QUALITATIVE_POLICY_EVIDENCE_BOUNDARY_REFERENCE_AUTHORIZATION_v1.0.md`
2. `05_DEVELOPMENT/matching-engine/synthetic-criterion-class-weighting-qualitative-policy-evidence-boundary-reference/README.md`
3. `05_DEVELOPMENT/matching-engine/synthetic-criterion-class-weighting-qualitative-policy-evidence-boundary-reference/G34_FILE_ALLOWLIST_v1.0.json`

The allowlist reserves exactly six additional `planned` code, test and verification paths. None is created in this phase.

## Closed file allowlist

The authoritative allowlist is `G34_FILE_ALLOWLIST_v1.0.json`, raw SHA-256 `6d5d5c82b0ca24ca378257e84858f45123af6fd48b12742ac9089eed2dbbe28d`. It is closed, contains exactly nine paths and intentionally omits its own hash. Any later edit invalidates this binding and requires a new review.

## Governance boundary

- Governance owner: `AI + PRODUCT` — human-approved candidate-derived and not `SOURCE_NORMATIVE` for standalone `XFR-D-025`.
- Scoring artifact owner: `Chief AI Architect + PRODUCT`.
- Mandatory approvers: `Chief AI Architect + LEGAL + DEVELOPMENT`.
- Evidence/technical-procedure owner: `AI + DEVELOPMENT`, without unilateral authority.
- `XFR-D-M5` remains independent and retains source-normative `AI + PRODUCT` authority for Architecture §37 question №3.

G34 creates no new owner and grants no unilateral authority.

## Qualitative boundary

- Mandatory, desirable, negotiable and informational meanings remain distinct and create no numeric or ordinal hierarchy.
- Criterion class is not Feature Weight/Fit, Hard Constraint/Eligibility, evidence/Evidence Confidence, overall Confidence, Risk, Qualification, Priority Score, ranking or presentation.
- A confirmed, independently approved and evidenced Hard Constraint violation is handled before scoring and cannot be softened or compensated.
- A `mandatory` label alone creates no Hard Constraint, `INELIGIBLE`, rejection or Qualification route.
- Desirable absence creates no automatic rejection.
- Negotiable content remains scenario-only until human confirmation.
- Informational identity is preserved; exact weighting/applicability remains `OPEN`.
- Missing, stale, conflicting, incompatible, revoked or unauthorized state blocks only the affected use without defaults, negative coercion or invented runtime state.
- Global and segment-specific weighting remain separate; segment membership cannot be guessed or proxy-imputed.
- Immutable frozen evidence, separate reporting and non-compensation are prerequisites, not approval.
- Synthetic evidence creates no production claim and no result creates automatic action.

## What remains `OPEN`

All exact assignments, hierarchy, participation/applicability, weights, ratios, signs, scales, bounds, defaults, thresholds, formulas, normalization, numerator/denominator, active-weight and missing-value arithmetic, double-counting treatment, per-layer/per-side/per-segment/per-intersection weighting, segment universe and lawful membership, precision and replay mechanics, datasets, labels, metrics, targets, statistics, results, verdicts, policies, manifests, production-data authority, schemas, carriers, RBAC, runtime, monitoring, rollback, implementation and every gate transition remain `OPEN`.

The neutral `0.5/0.5` baseline, pilot cap `100 Campaign`, Campaign → Qualified `40%`/`25%`, synthetic outputs, library defaults and current implementation behavior are prohibited surrogates.

## Future code phase

A separate approval may authorize only the six `planned` paths. The page must be manual, static and development-only; render the six ordered regions and twelve frozen matrix rows from the allowlist; expose all open content and role separation; end with the frozen terminal token and non-decision line; contain no network, persistence, telemetry, controls, mutable state or real person, organization, property, UUID or business-record data; and pass a focused deterministic test plus typecheck.

## Acceptance checklist

- [ ] `XFR-D-025 v1.0` remains `PARTIALLY_RESOLVED_BOUNDARY`.
- [ ] `MSP-13 → XFR-D-025`, `PRIMARY_STANDALONE`, remains unchanged.
- [ ] Exact governance, artifact, approver and evidence roles are preserved without unilateral authority.
- [ ] `XFR-D-M5` remains independent.
- [ ] Twelve frozen rows and six page regions retain exact order.
- [ ] No assignment, value, formula, threshold, segment override or runtime use is selected.
- [ ] Allowlist hash matches this README and the authorization record.
- [ ] Exactly three documentation files are present; the six code paths remain `planned`.
- [ ] Gate impact is `NONE`; all three governance gates remain `BLOCKED`.

## Gate impact

`IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` remain `BLOCKED`. G34 gate impact is `NONE`.

## Outcome

This phase authorizes documentation only. It approves no Scoring Policy, data, evaluation verdict, production use, runtime or implementation. Code creation remains blocked pending independent audit and separate human confirmation.
