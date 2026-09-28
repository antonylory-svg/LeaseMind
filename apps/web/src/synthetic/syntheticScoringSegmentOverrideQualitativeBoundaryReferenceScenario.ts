export const SYNTHETIC_SCORING_SEGMENT_OVERRIDE_TITLE =
  'SYNTHETIC SCORING SEGMENT-OVERRIDE QUALITATIVE BOUNDARY REFERENCE — NOT PRODUCTION APPROVED' as const;

export const SYNTHETIC_SCORING_SEGMENT_OVERRIDE_DISCLAIMER =
  'MANUAL DEV-ONLY REFERENCE — QUALITATIVE SEGMENT-OVERRIDE GOVERNANCE AND EVIDENCE BOUNDARY ONLY' as const;

export const SYNTHETIC_SCORING_SEGMENT_OVERRIDE_SCOPE_LINE =
  'NO SEGMENT, MEMBERSHIP, LAWFUL BASIS, OVERRIDE, WEIGHT, THRESHOLD OR SCORE ACTION EXECUTED' as const;

export const SYNTHETIC_SCORING_SEGMENT_OVERRIDE_REGIONS_IN_ORDER = [
  'SOURCE AND STATUS BOUNDARY',
  'SEGMENT-OVERRIDE GOVERNANCE MATRIX',
  'ROLE AND APPROVAL SEPARATION',
  'EVIDENCE PREREQUISITES AND NON-COMPENSATION',
  'OPEN EXACT CONTENT',
  'NON-DECISION RESULT'
] as const;

export const SYNTHETIC_SCORING_SEGMENT_OVERRIDE_SOURCE_BOUNDARY = [
  'SOURCE: XFR-D-018 v1.0 — APPROVED PARTIALLY_RESOLVED_BOUNDARY',
  'CANONICAL IDENTITY: MSP-04 → XFR-D-018 — PRIMARY_STANDALONE',
  'NO XFR ID CREATED; NO CANONICAL COUNT, CROSSWALK OR SCORING REGISTER ROW CHANGED',
  'ARCHITECTURE §37 QUESTION №3 REMAINS OPEN — SUBSTANTIVE DECISION OWNER: AI + PRODUCT',
  'SCORING POLICY PROPOSAL IS FOR CROSS-FUNCTIONAL REVIEW AND DOES NOT AUTHORIZE IMPLEMENTATION',
  'INVENTORY COUNTS: 102 SOURCE KEYS / 90 CANONICAL IDS — UNCHANGED',
  'SCORING REGISTER ROWS: 18 — UNCHANGED',
  'CODE PHASE WAS HUMAN-AUTHORIZED FOR THIS ISOLATED PACKAGE — PACKAGE VERIFICATION OPENS NO GOVERNANCE GATE',
  'ALL EXACT SEGMENT, MEMBERSHIP, LAWFUL BASIS, BASELINE/OVERRIDE, WEIGHT, THRESHOLD, DATA, STATISTICAL, RUNTIME AND IMPLEMENTATION CONTENTS REMAIN OPEN',
  'ALL THREE GOVERNANCE GATES REMAIN BLOCKED'
] as const;

export type SyntheticScoringSegmentOverrideGovernanceRow = {
  readonly governanceRow: string;
  readonly frozenBoundary: string;
};

export const SYNTHETIC_SCORING_SEGMENT_OVERRIDE_GOVERNANCE_MATRIX: readonly SyntheticScoringSegmentOverrideGovernanceRow[] = [
  {
    governanceRow: 'SEGMENT_OVERRIDE_SCOPE',
    frozenBoundary:
      'Only the qualitative governance and evidence-prerequisite boundary is frozen; the exact segment universe, intersections, scope, exhaustiveness and unknown handling remain OPEN; no segment universe, intersection, membership or lawful-basis classification is selected'
  },
  {
    governanceRow: 'GLOBAL_BASELINE_SOLE_AUTHORITY',
    frozenBoundary:
      'A separately approved global Scoring baseline is the sole authority for each applicable Match absent a separately approved, evidence-supported, version/hash-bound applicable override; the current Scoring Policy Proposal approves neither baseline nor override'
  },
  {
    governanceRow: 'EXPLICIT_LAWFUL_MEMBERSHIP_NO_INFERENCE',
    frozenBoundary:
      'Segment membership must be explicit, source-authoritative, lawful and applicable; it is never guessed, AI-inferred, heuristic-derived, proxy-imputed or carried over from another user, household, Campaign, Match, purpose or policy version; protected/proxy classification and lawful basis remain OPEN'
  },
  {
    governanceRow: 'NON_WEAKENING_NON_DISCRIMINATION_NON_COMPENSATION',
    frozenBoundary:
      'No override may weaken treatment, discriminate, silently raise or lower weight, threshold, eligibility, rank or scoring influence, use a protected/proxy attribute or unavailable lawful basis as a shortcut, or use aggregate, majority-segment or other-segment success to compensate or mask adverse, insufficient, unknown or unavailable segment evidence'
  },
  {
    governanceRow: 'MINIMUM_EVIDENCE_CATEGORIES',
    frozenBoundary:
      'No override may be approved without an immutable, versioned evidence package containing every applicable category bound to exact candidate versions and hashes; categories only approve no exact content, and a missing applicable category blocks future override approval fail closed'
  },
  {
    governanceRow: 'AFFECTED_USE_FAIL_CLOSED',
    frozenBoundary:
      'Missing, unknown, stale, conflicting, expired, revoked, incompatible, incomplete, out-of-scope or unauthorized segment membership, source, classification, lawful basis, binding or evidence blocks only the affected governed use, applying only an approved compatible global baseline; unrelated processing is not blocked and no guessed, zero, default, adverse or negative outcome is produced'
  },
  {
    governanceRow: 'NO_AUTOMATIC_ACTION',
    frozenBoundary:
      'No evidence result, statistical signal, segment classification, candidate configuration or approval prerequisite automatically changes weights, thresholds, formula, model, policy, override, retraining, release, eligibility, Qualification, Risk, routing, display, production or gate'
  },
  {
    governanceRow: 'DECISION_MEANING',
    frozenBoundary:
      'This qualitative boundary is not a segment universe, intersection, membership, lawful basis, baseline, override, weight, threshold, formula, metric, statistic, evidence verdict, policy or gate approval'
  }
];

export const SYNTHETIC_SCORING_SEGMENT_OVERRIDE_MATRIX_SHARED_RULES =
  'Every row carries the same frozen discipline: a separately approved global Scoring baseline is the sole authority absent a separately approved, evidence-supported, version/hash-bound applicable override; segment membership must be explicit, source-authoritative, lawful and applicable, and is never guessed, inferred or carried over; no override may weaken treatment, discriminate, silently shift weight, threshold, eligibility, rank or influence, use a protected/proxy attribute or unavailable lawful basis, or compensate missing, adverse or insufficient evidence with aggregate or other-segment success; a missing applicable evidence category blocks future override approval fail closed' as const;

export const SYNTHETIC_SCORING_SEGMENT_OVERRIDE_ROLE_SEPARATION = [
  'XFR-D-018 SUBSTANTIVE GOVERNANCE OWNER: AI + PRODUCT',
  'SCORING POLICY ARTIFACT OWNER — SEPARATE: Chief AI Architect + PRODUCT',
  'XFR-D-018 MANDATORY APPROVERS: Chief AI Architect + LEGAL + DEVELOPMENT',
  'EVIDENCE AND TECHNICAL-PROCEDURE OWNER: AI + DEVELOPMENT — NO UNILATERAL SEGMENT, MEMBERSHIP, LAWFUL-BASIS, VALUE, EVIDENCE-SUFFICIENCY, POLICY, PRODUCTION, RUNTIME, RELEASE OR IMPLEMENTATION AUTHORITY',
  'G27 PACKAGE GOVERNANCE OWNER: Chief AI Architect + DEVELOPMENT + AI',
  'G27 PACKAGE MANDATORY APPROVERS: PRODUCT + LEGAL',
  'ANY EVENTUAL SEGMENT-SPECIFIC OVERRIDE APPROVAL REQUIRES THE FULL SET AI + PRODUCT + Chief AI Architect + LEGAL + DEVELOPMENT ON ONE EXPLICITLY IDENTIFIED CANDIDATE VERSION/HASH AND A SEPARATELY SUFFICIENT EVIDENCE PACKAGE',
  'PACKAGE AUTHORITY DOES NOT REPLACE SOURCE-DECISION OR ARTIFACT AUTHORITY'
] as const;

export const SYNTHETIC_SCORING_SEGMENT_OVERRIDE_EVIDENCE_PREREQUISITES = [
  'PROPOSED SEGMENT UNIVERSE, INTERSECTIONS, SCOPE AND EXPLICIT EXHAUSTIVENESS/UNKNOWN-HANDLING STATEMENT',
  'PROPOSED MEMBERSHIP SOURCE, DETERMINATION METHOD, PROVENANCE, FRESHNESS AND PURPOSE/APPLICABILITY BOUNDARY',
  'PROTECTED/PROXY CLASSIFICATION PER SEGMENT DIMENSION AND APPLICABLE LAWFUL-BASIS EVIDENCE',
  'EXACT PROPOSED GLOBAL-BASELINE POLICY VERSION/HASH AND EXACT PROPOSED OVERRIDE VERSION/HASH',
  'EXPLICIT OVERRIDE DELTA AND SCOPE RELATIVE TO THE NAMED GLOBAL BASELINE WITHOUT APPROVING WEIGHTS, THRESHOLDS OR FORMULA EFFECTS',
  'APPLICABLE DATASET SEGMENT-COVERAGE EVIDENCE AND EXPLICIT UNKNOWN/UNCLASSIFIED/INSUFFICIENT REPORTING',
  'LABEL ELIGIBILITY, ADJUDICATION, GROUPING AND CORRECTION-HISTORY EVIDENCE',
  'PROPOSED METRICS, NUMERATOR/DENOMINATOR/COUNTING UNIT, AGGREGATION, UNCERTAINTY AND TARGET/TOLERANCE CONTENTS',
  'FROZEN DATASET/ALLOCATION/MANIFEST/LINEAGE EVIDENCE WITH CLEAR TUNING-VERSUS-UNTOUCHED-FINAL SEPARATION',
  'PROPOSED EXACT STATISTICAL COMPARISON PROCEDURE AND COMPLETE ADVERSE, NULL, INCOMPATIBLE, UNEVALUABLE AND INSUFFICIENT REPORTING',
  'NON-WEAKENING, NON-DISCRIMINATION, PROTECTED/PROXY AND NON-COMPENSATION ANALYSIS',
  'APPLICABLE DRIFT AND POST-FREEZE CORRECTION EVIDENCE AND LIMITATIONS',
  'EXPLICIT SYNTHETIC-ONLY VERSUS PRODUCTION-DATA APPLICABILITY STATEMENT — SYNTHETIC-ONLY EVIDENCE CANNOT ESTABLISH PRODUCTION APPLICABILITY OR READINESS',
  'REPRODUCIBLE CANDIDATE CONFIGURATION, CODE/TOOL VERSIONS, IMMUTABLE REFERENCES/HASHES AND VERIFICATION BY THE FULL OWNER/APPROVER SET'
] as const;

export const SYNTHETIC_SCORING_SEGMENT_OVERRIDE_EVIDENCE_BOUNDARY = [
  'PREREQUISITES ONLY — THEY APPROVE NO EXACT CONTENT, SAMPLE, PROCEDURE, METRIC, TEST, RESULT, WINNER OR POLICY',
  'ONE EVIDENCE FAMILY, A FAVORABLE AGGREGATE RESULT OR A BUSINESS OUTCOME CANNOT COMPENSATE FOR ANOTHER MISSING, ADVERSE, INCOMPATIBLE, UNEVALUABLE OR INSUFFICIENT FAMILY OR SEGMENT/INTERSECTION RESULT',
  'MISSING, UNKNOWN, STALE, CONFLICTING, INCOMPATIBLE, INCOMPLETE, OUT-OF-SCOPE OR UNAUTHORIZED CANDIDATE, EVIDENCE OR BINDING BLOCKS ONLY THE AFFECTED SEGMENT-OVERRIDE APPROVAL PROGRESSION',
  'ONLY AN APPROVED COMPATIBLE GLOBAL BASELINE MAY APPLY TO THE AFFECTED GOVERNED USE; UNRELATED PROCESSING IS NOT BLOCKED',
  'NEVER BECOMES NUMERIC ZERO, A NEGATIVE FACT, A DEFAULT, PASS, FAIL, EXCLUSION, REJECTION, QUALIFICATION RESULT, RISK RESULT, ROUTE, PRIMARY REASON OR DISPLAY, AND NEVER ACTIVATES A FALLBACK'
] as const;

export const SYNTHETIC_SCORING_SEGMENT_OVERRIDE_OPEN_CONTENT = [
  'EVERY EXACT SEGMENT, INTERSECTION, MEMBERSHIP AND LAWFUL-BASIS CLASSIFICATION',
  'BASELINE AND OVERRIDE POLICY, VERSION, HASH, PRIORITY AND OVERLAP',
  'EVERY WEIGHT, THRESHOLD, FORMULA, DELTA AND TOLERANCE',
  'EVERY METRIC, TARGET, COUNTING UNIT, AGGREGATION AND UNCERTAINTY DEFINITION',
  'THE STATISTICAL METHOD',
  'DATASET, MANIFEST, LINEAGE, RUN, RESULT AND VERDICT',
  'PRODUCTION AUTHORITY AND APPLICABILITY',
  'SCHEMA, API, DATABASE, EVENT, CARRIER, RBAC, RUNTIME, MONITORING, ROLLBACK AND IMPLEMENTATION',
  'EVERY GOVERNANCE GATE'
] as const;

export const SYNTHETIC_SCORING_SEGMENT_OVERRIDE_PROHIBITED_SURROGATES = [
  'PILOT CAP 100 CAMPAIGN',
  'CAMPAIGN TO QUALIFIED 40 PERCENT',
  'CAMPAIGN TO QUALIFIED 25 PERCENT'
] as const;

export const SYNTHETIC_SCORING_SEGMENT_OVERRIDE_DISTINCT_LAYERS = [
  'HARD CONSTRAINT AND ELIGIBILITY',
  'RECIPROCAL FIT',
  'MATCH SCORE',
  'CONFIDENCE SCORE',
  'RISK SCORE',
  'QUALIFICATION',
  'PRIORITY SCORE',
  'RANKING AND DIVERSIFICATION'
] as const;

export const SYNTHETIC_SCORING_SEGMENT_OVERRIDE_TERMINAL_TOKEN =
  'G27_SYNTHETIC_NO_SEGMENT_OVERRIDE_MEMBERSHIP_LAWFUL_BASIS_WEIGHT_THRESHOLD_OR_SCORE_ACTION_EXECUTED' as const;

export const SYNTHETIC_SCORING_SEGMENT_OVERRIDE_TERMINAL_LINE =
  'NO SEGMENT UNIVERSE, MEMBERSHIP, LAWFUL BASIS, GLOBAL BASELINE, OVERRIDE, WEIGHT, THRESHOLD, FORMULA, COMPUTATION, SCORE, PASS, FAIL, REJECTION, QUALIFICATION, RISK, ROUTING, DISPLAY OR PRODUCTION ACTION OCCURRED' as const;
