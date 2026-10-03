# LeaseMind Matching G44 Authorization — Synthetic Qualification Qualitative-Precedence Reference

**Version:** 1.0

**Authorization date:** 2026-10-03

**Status:** `DOCUMENTATION_ONLY_AUTHORIZED`

**Code phase:** `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`

**Baseline:** `2318227ea25f4671dfc2dbb79b206d02da2ebf0d`

**Branch:** `development/sprint-7-matching-g44-synthetic-qualification-qualitative-precedence-reference`

**Source decision:** `LeaseMind_MATCHING_DECISION_XFR-D-033_v1.0.md`

**Canonical identity:** `MQP-04 → XFR-D-033`, `PRIMARY_STANDALONE`

## 1. Authorization scope

G44 authorizes documentation only for a future isolated, static, manual development reference that demonstrates the approved deterministic fail-closed qualitative precedence among simultaneously applicable Qualification causes without selecting or approving numeric thresholds, an ordinal severity registry, reason-catalog order or a runtime algorithm.

Exactly three documentation artifacts are authorized in this phase: this authorization record, the package `README.md`, and the closed `G44_FILE_ALLOWLIST_v1.0.json`. No page, TypeScript source, test, verification record, configuration, index, router, Data Contract, Policy, runtime or production artifact is authorized or created in this phase.

The substantive boundary comes only from `XFR-D-033 v1.0`, its dependencies `XFR-D-030 v1.0` and `XFR-D-032 v1.0`, Architecture §§14 and 18.1, the related Qualification Policy and Decision Inventory crosswalk/status overlay. G43 is used only as a structural example and supplies no substantive G44 authority.

## 2. Source, status and governance boundary

`XFR-D-033 v1.0` remains `APPROVED QUALITATIVE PRECEDENCE — numeric thresholds and reason catalog remain OPEN`. Canonical identity remains `MQP-04 → XFR-D-033`, `PRIMARY_STANDALONE`. Inventory counts remain 102 source keys / 90 canonical IDs, and the Qualification register remains 20 rows.

Qualification semantic owner remains `Chief AI Architect + PRODUCT`, inherited from `XFR-D-030`. Mandatory approvers remain `LEGAL + DEVELOPMENT`; `AI` remains a consulted domain function, not a separate Policy owner. A change to qualitative precedence or non-compensation requires a new versioned record agreed by `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT` and linked through `supersedes`.

The approved boundary selects a qualitative route-determining hierarchy only. It does not select numeric severity, same-class reason order, primary-reason representation, runtime data structures or an implementation algorithm.

## 3. Approved qualitative precedence

The future reference must preserve this exact order:

1. Confirmed Eligibility `INELIGIBLE` with the complete six-part Architecture §14 evidence maps to `REJECTED_BY_MATCHING` and has highest precedence.
2. Any mandatory human-review cause — a critical conflict, critical unresolved risk, or legal/rights ambiguity — maps to `HUMAN_REVIEW_REQUIRED` only when no confirmed `INELIGIBLE` exists.
3. Any unresolved verification need, missing/unknown information, or insufficient evidence maps to `NEEDS_VERIFICATION` only when no higher-precedence class exists.
4. `QUALIFIED_HYPOTHESIS` is permitted only when all three preceding classes are absent and every qualitative Architecture §18.1 condition is satisfied.
5. `STALE` is not a routing result or fifth precedence level; its orthogonal semantics remain governed by `XFR-D-038`.

## 4. Frozen qualitative-precedence matrix

The future reference must render these twelve boundaries in this exact order:

1. `PRIMARY_STANDALONE_IDENTITY_AND_APPROVED_QUALITATIVE_PRECEDENCE_PRESERVED_WITH_NUMERIC_THRESHOLDS_AND_REASON_CATALOG_OPEN`.
2. `CONFIRMED_ELIGIBILITY_INELIGIBLE_WITH_COMPLETE_SIX_PART_EVIDENCE_HAS_HIGHEST_PRECEDENCE_AND_ROUTES_TO_REJECTED_BY_MATCHING`.
3. `MANDATORY_HUMAN_REVIEW_CAUSE_ROUTES_TO_HUMAN_REVIEW_REQUIRED_ONLY_WHEN_NO_CONFIRMED_INELIGIBLE_EXISTS`.
4. `UNRESOLVED_VERIFICATION_NEED_MISSING_UNKNOWN_OR_INSUFFICIENT_EVIDENCE_ROUTES_TO_NEEDS_VERIFICATION_ONLY_WHEN_NO_HIGHER_CLASS_EXISTS`.
5. `QUALIFIED_HYPOTHESIS_IS_PERMITTED_ONLY_WHEN_ALL_THREE_HIGHER_CLASSES_ARE_ABSENT_AND_ALL_ARCHITECTURE_SECTION_18_1_QUALITATIVE_CONDITIONS_ARE_MET`.
6. `STALE_IS_ORTHOGONAL_UNDER_XFR_D_038_AND_IS_NOT_A_ROUTING_RESULT_OR_FIFTH_PRECEDENCE_LEVEL`.
7. `SCORE_RANK_CONFIDENCE_OR_OTHER_FAVORABLE_SIGNAL_CANNOT_COMPENSATE_FOR_A_HIGHER_PRECEDENCE_CLASS`.
8. `PRECEDENCE_SELECTS_THE_FINAL_ROUTE_BUT_NEVER_DELETES_OTHER_APPLICABLE_CAUSES_OR_EVIDENCE_REFERENCES`.
9. `PRIMARY_REASON_REMAINS_A_SUMMARY_FROM_THE_ROUTE_DETERMINING_CLASS_UNDER_XFR_D_040`.
10. `INCIDENTAL_IDENTIFIER_FILE_STORAGE_MANIFEST_CROSSWALK_DISCOVERY_SQL_MAPPING_ORDER_OR_MULTIPLICITY_HAS_NO_SEMANTIC_PRIORITY`.
11. `NUMERIC_THRESHOLDS_ORDINAL_SEVERITY_REGISTRY_EXACT_REASON_CATALOG_ORDER_PRIMARY_REASON_REPRESENTATION_AND_RUNTIME_ALGORITHM_REMAIN_OPEN`.
12. `GATE_IMPACT_NONE_AND_IMPLEMENTATION_READINESS_SYNTHETIC_ACCEPTANCE_AND_PRODUCTION_LAUNCH_REMAIN_BLOCKED`.

The machine-readable `frozen` values in `G44_FILE_ALLOWLIST_v1.0.json` govern any later separately authorized code phase.

## 5. Non-compensation and multi-cause separation

| Boundary | Approved qualitative treatment | Not authorized by G44 |
| --- | --- | --- |
| Higher-precedence class | Determines the final Qualification route | Numeric severity, weighting or score aggregation |
| Score, rank, Confidence or other favorable signal | Cannot compensate for confirmed hard-constraint failure, mandatory human review or unresolved required verification | Override, offset, downgrade or route promotion |
| Multiple applicable causes | Every cause and evidence reference remains preserved | Dropping lower-tier causes after route selection |
| Primary reason | Remains a summary from the route-determining precedence class under `XFR-D-040` | Exact same-class order, catalog value or runtime representation |
| Incidental technical order | Has no semantic priority | Priority inferred from identifier, file, storage, manifest, crosswalk, discovery, SQL, mapping order or multiplicity |
| `STALE` | Remains orthogonal under `XFR-D-038` and independently blocks actionability/disclosure where applicable | Fifth Qualification result or precedence tier |

`XFR-D-032` mapping, `XFR-D-038` `STALE`, `XFR-D-039 v1.1` catalog/crosswalk topology, `XFR-D-040` all-cause/primary-reason authority, `XFR-D-041` review request, `XFR-D-043` compatibility, `XFR-D-044` Safe Presentation consumption, `XFR-D-055` Risk interface and merged `XFR-D-M2` remain independent. G44 neither reopens nor resolves their exact contents.

## 6. OPEN exact content

The following remain `OPEN` and are not selected or implied:

- numeric thresholds, cutoffs, comparators and calibration;
- ordinal severity registry, values, weights and aggregation;
- reason-catalog identifiers, codes, values, membership and exact order;
- same-class semantic order and primary-reason representation;
- runtime precedence algorithm, data structures and tie handling;
- enum, field, carrier, schema, API, DB, event and transport representation;
- versioning, compatibility, migration, supersession and rollback;
- evidence, provenance, replay, audit, monitoring, TTL, expiry and recalculation;
- Policy/Data Contracts approval, manifest, dataset/evidence, production applicability, runtime, implementation, release and gates.

Missing or unapproved content cannot be guessed from cause count, string equality, source order, identifiers, filenames, storage order or implementation convenience. It creates no new route, priority, threshold, primary reason, Policy approval, production-readiness claim or implementation permission.

## 7. Future reference surface

Only after independent audit and separate human confirmation may the six `planned` artifacts be created. The future static manual development-only reference must render six ordered regions: `SOURCE AND STATUS BOUNDARY`; `QUALITATIVE PRECEDENCE HIERARCHY`; `NON-COMPENSATION BOUNDARY`; `MULTI-CAUSE AND PRIMARY-REASON SEPARATION`; `OPEN EXACT CONTENT`; `NON-DECISION RESULT`.

It must always show:

- `SYNTHETIC QUALIFICATION QUALITATIVE-PRECEDENCE REFERENCE — NOT PRODUCTION APPROVED`;
- `MANUAL DEV-ONLY REFERENCE — QUALITATIVE PRECEDENCE IS NOT NUMERIC SEVERITY, REASON-CATALOG ORDER OR RUNTIME ALGORITHM APPROVAL`;
- `NO NUMERIC THRESHOLD, SEVERITY REGISTRY, REASON-CATALOG ORDER, RUNTIME ALGORITHM, POLICY OR RUNTIME USE SELECTED`.

It must terminate with `G44_SYNTHETIC_NO_NUMERIC_THRESHOLD_SEVERITY_REGISTRY_REASON_CATALOG_ORDER_RUNTIME_ALGORITHM_POLICY_OR_IMPLEMENTATION_AUTHORITY_ESTABLISHED` followed by `NO NUMERIC THRESHOLD, SEVERITY REGISTRY, REASON-CATALOG ORDER, RUNTIME ALGORITHM, POLICY, PRODUCTION, RUNTIME OR IMPLEMENTATION ACTION OCCURRED`.

## 8. Gate impact

| Item | Status |
| --- | --- |
| `IMPLEMENTATION_READINESS_GATE` | `BLOCKED` |
| `SYNTHETIC_ACCEPTANCE_GATE` | `BLOCKED` |
| `PRODUCTION_LAUNCH_GATE` | `BLOCKED` |
| Gate impact of G44 | `NONE` |

## 9. Non-authorization statement

This package approves no threshold, cutoff, severity value, weight, aggregation, reason-catalog entry or order, primary-reason representation, runtime algorithm, enum, field, carrier, serializer, API, DB, event, queue, Qualification Policy, Data Contracts change, manifest, dataset, evidence result, production-data use, runtime, monitoring, implementation, release or gate. It creates no production-readiness claim and changes no independent sibling decision.

## 10. Closed allowlist and hash binding

The closed allowlist is `05_DEVELOPMENT/matching-engine/synthetic-qualification-qualitative-precedence-reference/G44_FILE_ALLOWLIST_v1.0.json`, raw SHA-256 `f3c2a97512f1562c8f8587aeadb67fdf2518c020620a5bcdab2693d4a8ec0155`. It contains exactly nine paths: three documentation artifacts as `present` and six future artifacts as `planned`. No path outside those nine may be created, modified, imported or emitted by G44. The allowlist intentionally omits its own SHA-256; this record and the `README.md` bind to the hash above.

No staging, commit, push or PR mutation is performed by this authorization.

```
COMMIT CREATED: NO
PUSH PERFORMED: NO
PR MUTATION PERFORMED: NO
```
