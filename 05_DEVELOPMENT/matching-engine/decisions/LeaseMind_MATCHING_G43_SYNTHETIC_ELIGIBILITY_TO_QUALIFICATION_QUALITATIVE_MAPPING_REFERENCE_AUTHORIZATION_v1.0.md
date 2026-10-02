# LeaseMind Matching G43 Authorization — Synthetic Eligibility-to-Qualification Qualitative-Mapping Reference

**Version:** 1.0

**Authorization date:** 2026-10-02

**Status:** `DOCUMENTATION_ONLY_AUTHORIZED`

**Code phase:** `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`

**Baseline:** `7f46c3049ec643b1bf26faa4f91ae126a09dbbbb`

**Branch:** `development/sprint-7-matching-g43-synthetic-eligibility-to-qualification-qualitative-mapping-reference`

**Source decision:** `LeaseMind_MATCHING_DECISION_XFR-D-032_v1.0.md`

**Canonical identity:** `MQP-03 → XFR-D-032`, `PRIMARY_STANDALONE`

## 1. Authorization scope

G43 authorizes documentation only for a future isolated, static, manual development reference that demonstrates the approved one-way qualitative mapping from Eligibility Filter results to Matching Qualification Gate results without selecting or approving numeric thresholds or an exact runtime representation.

Exactly three documentation artifacts are authorized in this phase: this authorization record, the package `README.md`, and the closed `G43_FILE_ALLOWLIST_v1.0.json`. No page, TypeScript source, test, verification record, configuration, index, router, Data Contract, Policy, runtime or production artifact is authorized or created in this phase.

The substantive boundary comes only from `XFR-D-032 v1.0`, its dependencies `XFR-D-030 v1.0` and `XFR-D-031 v1.0`, Architecture §14, the related Qualification Policy and Decision Inventory crosswalk/status overlay. G42 is used only as a structural example and supplies no substantive G43 authority.

## 2. Source and status boundary

`XFR-D-032 v1.0` remains `APPROVED QUALITATIVE MAPPING — runtime representation and numeric thresholds remain OPEN`. Canonical identity remains `MQP-03 → XFR-D-032`, `PRIMARY_STANDALONE`. Inventory counts remain 102 source keys / 90 canonical IDs, and the Qualification register remains 20 rows.

The approved boundary defines policy-semantic mapping only. Eligibility Filter and Matching Qualification Gate remain different stages and different namespaces. Identical label text does not merge values into one runtime enum, field or transport carrier. Exact representation remains governed by `XFR-D-031` and a separate downstream design.

## 3. Approved one-way qualitative mapping

- Eligibility `INELIGIBLE` maps to Qualification `REJECTED_BY_MATCHING` only when all six Architecture §14 conditions for automatic `INELIGIBLE` are proven and preserved.
- Eligibility `ELIGIBLE` permits continued calculation but never automatically means `QUALIFIED_HYPOTHESIS` and never bypasses the remaining Qualification Gate conditions.
- Eligibility `NEEDS_VERIFICATION` maps to Qualification `NEEDS_VERIFICATION` unless a separate critical reason requires `HUMAN_REVIEW_REQUIRED`; `NEEDS_VERIFICATION` alone never creates rejection.
- Eligibility-stage `HUMAN_REVIEW_REQUIRED`, when returned through source fallback, maps to Qualification `HUMAN_REVIEW_REQUIRED`.

The six cumulative conditions for automatic `INELIGIBLE` are preserved exactly in substance:

1. the criterion was pre-approved as a Hard Constraint in a versioned policy;
2. the criterion was explicitly stated by the relevant party or directly mandated, rather than inferred by a model;
3. the incompatible value is confirmed by a current permitted source;
4. the criterion is not a protected personal attribute, hidden proxy or discriminatory restriction;
5. there is no unknown, source conflict or need for legal interpretation;
6. the result contains a reason code, rule version and evidence reference and is available for human review.

All six conditions are required together. G43 does not define their runtime carrier, reason-code catalog or numeric content.

## 4. Frozen qualitative-mapping matrix

The future reference must render these twelve boundaries in this exact order:

1. `PRIMARY_STANDALONE_IDENTITY_AND_APPROVED_QUALITATIVE_MAPPING_PRESERVED_WITH_RUNTIME_REPRESENTATION_AND_NUMERIC_THRESHOLDS_OPEN`.
2. `ELIGIBILITY_FILTER_AND_MATCHING_QUALIFICATION_GATE_REMAIN_DISTINCT_STAGES_AND_NAMESPACES`.
3. `ELIGIBILITY_INELIGIBLE_MAPS_TO_QUALIFICATION_REJECTED_BY_MATCHING_ONLY_WHEN_ALL_SIX_ARCHITECTURE_SECTION_14_CONDITIONS_ARE_PROVEN_AND_PRESERVED`.
4. `MISSING_ANY_AUTOMATIC_INELIGIBLE_CONDITION_PROHIBITS_MAPPING_TO_REJECTED_BY_MATCHING`.
5. `ELIGIBILITY_ELIGIBLE_PERMITS_CONTINUED_CALCULATION_BUT_NEVER_AUTOMATICALLY_MEANS_QUALIFIED_HYPOTHESIS`.
6. `ELIGIBILITY_NEEDS_VERIFICATION_MAPS_TO_QUALIFICATION_NEEDS_VERIFICATION_UNLESS_A_SEPARATE_CRITICAL_REASON_REQUIRES_HUMAN_REVIEW_REQUIRED`.
7. `NEEDS_VERIFICATION_BY_ITSELF_NEVER_CREATES_REJECTION`.
8. `ELIGIBILITY_STAGE_HUMAN_REVIEW_REQUIRED_WHEN_RETURNED_BY_SOURCE_FALLBACK_MAPS_TO_QUALIFICATION_HUMAN_REVIEW_REQUIRED`.
9. `MISSING_OR_UNKNOWN_IS_NOT_A_NEGATIVE_FACT_AND_CANNOT_BE_COERCED_TO_REJECTION`.
10. `RISK_SCORE_MODEL_INFERENCE_CORRELATION_OR_DATA_ABSENCE_ALONE_CANNOT_CREATE_REJECTION`.
11. `IDENTICAL_LABEL_TEXT_DOES_NOT_MERGE_NAMESPACES_OR_APPROVE_A_SHARED_ENUM_FIELD_CARRIER_REASON_CODE_OR_NUMERIC_THRESHOLD`.
12. `GATE_IMPACT_NONE_AND_IMPLEMENTATION_READINESS_SYNTHETIC_ACCEPTANCE_AND_PRODUCTION_LAUNCH_REMAIN_BLOCKED`.

The machine-readable `frozen` values in `G43_FILE_ALLOWLIST_v1.0.json` govern any later separately authorized code phase.

## 5. Fail-closed and non-conflation boundary

| Input or condition | Approved qualitative treatment | Not authorized by G43 |
| --- | --- | --- |
| Proven Eligibility `INELIGIBLE` | May map to Qualification `REJECTED_BY_MATCHING` only with all six cumulative Architecture §14 conditions | Partial proof, inferred rejection or a runtime carrier |
| Eligibility `ELIGIBLE` | Allows calculation to continue | Automatic `QUALIFIED_HYPOTHESIS`, gate bypass or production routing |
| Eligibility `NEEDS_VERIFICATION` | Maps to Qualification `NEEDS_VERIFICATION` unless a separate critical reason requires human review | Rejection, negative coercion or guessed failure |
| Source-fallback `HUMAN_REVIEW_REQUIRED` | Maps to Qualification `HUMAN_REVIEW_REQUIRED` | Automatic rejection or an approved queue implementation |
| Missing or unknown evidence | Prevents unsupported rejection | Negative fact, failure, default rejection or exclusion |
| Risk/model/correlation/data absence | Cannot independently create rejection | Threshold, score substitution or automatic exclusion |
| Same textual label in both stages | Preserves its stage-specific semantic scope | Shared enum, field, namespace, carrier or schema approval |

`XFR-D-030` artifact ownership, `XFR-D-031` runtime-representation responsibility, `XFR-D-033` precedence, `XFR-D-038` orthogonal `STALE`, `XFR-D-039 v1.1` reason/result crosswalk governance, `XFR-D-040` multi-cause preservation, `XFR-D-041` review-request/queue boundary, `XFR-D-043` compatibility/supersession, `XFR-D-044` Safe Presentation consumption and `XFR-D-055` Risk interface remain independent. G43 neither reopens nor resolves their exact contents.

## 6. OPEN exact content

The following remain `OPEN` and are not selected or implied:

- numeric thresholds, calibration and measurement procedures;
- exact runtime enum, field, namespace, identifiers, codes and values;
- carrier shape, cardinality, requiredness, optionality, nullability and lifecycle;
- serialization, validation, error, unknown, fallback and malformed-input behavior;
- API, DB, event, topic, message, payload and transport representation;
- reason-code catalog and exact reason-to-result crosswalk;
- schema versioning, compatibility, migration, supersession and rollback;
- evidence-reference carrier, provenance, replay, audit, monitoring, TTL, expiry and recalculation;
- Policy/Data Contracts approval, manifest, dataset/evidence, production applicability, runtime, implementation, release and gates.

Missing or unapproved content cannot be guessed from labels, filenames, neighboring decisions or implementation convenience. It creates no new result, threshold, default route, negative fact, rejection, Policy approval, production-readiness claim or implementation permission.

## 7. Future reference surface

Only after independent audit and separate human confirmation may the six `planned` artifacts be created. The future static manual development-only reference must render six ordered regions: `SOURCE AND STATUS BOUNDARY`; `QUALITATIVE MAPPING MATRIX`; `STAGE AND NAMESPACE SEPARATION`; `FAIL-CLOSED AND NON-REJECTION BOUNDARY`; `OPEN EXACT CONTENT`; `NON-DECISION RESULT`.

It must always show:

- `SYNTHETIC ELIGIBILITY-TO-QUALIFICATION QUALITATIVE-MAPPING REFERENCE — NOT PRODUCTION APPROVED`;
- `MANUAL DEV-ONLY REFERENCE — QUALITATIVE MAPPING IS NOT RUNTIME REPRESENTATION OR POLICY APPROVAL`;
- `NO NUMERIC THRESHOLD, ENUM, FIELD, CARRIER, REASON CODE, POLICY OR RUNTIME USE SELECTED`.

It must terminate with `G43_SYNTHETIC_NO_NUMERIC_THRESHOLD_ENUM_FIELD_CARRIER_REASON_CODE_POLICY_RUNTIME_OR_IMPLEMENTATION_AUTHORITY_ESTABLISHED` followed by `NO NUMERIC THRESHOLD, ENUM, FIELD, CARRIER, REASON CODE, POLICY, PRODUCTION, RUNTIME OR IMPLEMENTATION ACTION OCCURRED`.

## 8. Gate impact

| Item | Status |
| --- | --- |
| `IMPLEMENTATION_READINESS_GATE` | `BLOCKED` |
| `SYNTHETIC_ACCEPTANCE_GATE` | `BLOCKED` |
| `PRODUCTION_LAUNCH_GATE` | `BLOCKED` |
| Gate impact of G43 | `NONE` |

## 9. Non-authorization statement

This package approves no threshold, calibration, runtime enum, field, namespace, carrier, reason-code catalog, serializer, validator, API, DB, event, schema, queue, Qualification Policy, Data Contracts change, manifest, dataset, evidence result, production-data use, runtime, monitoring, implementation, release or gate. It creates no production-readiness claim and changes no independent sibling decision.

## 10. Closed allowlist and hash binding

The closed allowlist is `05_DEVELOPMENT/matching-engine/synthetic-eligibility-to-qualification-qualitative-mapping-reference/G43_FILE_ALLOWLIST_v1.0.json`, raw SHA-256 `98c1878ab75c4525c0c6d7f2cb4884dd58ded2b772ec50b4ccd56247239f1941`. It contains exactly nine paths: three documentation artifacts as `present` and six future artifacts as `planned`. No path outside those nine may be created, modified, imported or emitted by G43. The allowlist intentionally omits its own SHA-256; this record and the `README.md` bind to the hash above.

No staging, commit, push or PR mutation is performed by this authorization.

```
COMMIT CREATED: NO
PUSH PERFORMED: NO
PR MUTATION PERFORMED: NO
```
