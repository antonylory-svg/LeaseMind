export const SYNTHETIC_LAWFUL_BASIS_PROJECTION_TITLE =
  'SYNTHETIC LAWFUL-BASIS PROJECTION BOUNDARY REFERENCE — NOT PRODUCTION APPROVED' as const;

export const SYNTHETIC_LAWFUL_BASIS_PROJECTION_DISCLAIMER =
  'MANUAL DEV-ONLY REFERENCE — QUALITATIVE MECHANISM GOVERNANCE ONLY' as const;

export const SYNTHETIC_LAWFUL_BASIS_PROJECTION_SCOPE_LINE =
  'NO MATCHING CONTRACT, LAWFUL-BASIS DETERMINATION OR RUNTIME ACTION EXECUTED' as const;

export const SYNTHETIC_LAWFUL_BASIS_PROJECTION_REGIONS_IN_ORDER = [
  'SOURCE AND STATUS BOUNDARY',
  'SOLE-WRITER AND READ-ONLY CONSUMPTION MATRIX',
  'EXACT SOURCE ENUM — PRESERVED WITHOUT CONTRACT MAPPING',
  'AFFECTED-USE FAIL-CLOSED — NO ADVERSE INFERENCE',
  'OPEN MATCHING CONTRACT CONTENT',
  'NON-DECISION RESULT'
] as const;

export const SYNTHETIC_LAWFUL_BASIS_PROJECTION_SOURCE_BOUNDARY = [
  'SOURCE: XFR-D-016 v1.0 — APPROVED PARTIALLY_RESOLVED_BOUNDARY',
  'CANONICAL IDENTITY: FS-19 → XFR-D-016 — PRIMARY_STANDALONE',
  'LAWFUL BASIS/CONSENT REGISTRY REMAINS THE SOLE WRITER',
  'FUTURE MATCHING CONSUMPTION MAY ONLY BE PURPOSE-BOUND, SCOPE-COMPATIBLE, VERSIONED AND READ-ONLY',
  'EXISTING REVEAL/PARTICIPATION CONTRACTS ARE CONTEXT ONLY — NO IMPORT BY ANALOGY',
  'ALL THREE GOVERNANCE GATES REMAIN BLOCKED'
] as const;

export type SyntheticLawfulBasisProjectionMatrixRow = {
  readonly boundary: string;
  readonly sourceAuthority: string;
  readonly permittedFuturePosture: string;
  readonly explicitProhibition: string;
};

export const SYNTHETIC_LAWFUL_BASIS_PROJECTION_MATRIX: readonly SyntheticLawfulBasisProjectionMatrixRow[] = [
  {
    boundary: 'Source ownership',
    sourceAuthority: 'Lawful Basis/Consent Registry',
    permittedFuturePosture: 'Read-only projection/ref only',
    explicitProhibition: 'No create, extend, restore, replace, amend or reinterpret'
  },
  {
    boundary: 'Purpose and scope',
    sourceAuthority: 'Source-owned purpose and validity',
    permittedFuturePosture: 'Purpose-bound and scope-compatible consumption only',
    explicitProhibition: 'No inferred purpose, widened scope or silent secondary use'
  },
  {
    boundary: 'Version',
    sourceAuthority: 'Source-owned version',
    permittedFuturePosture: 'Version-bound read-only consumption',
    explicitProhibition: 'No stale or version-mismatched authority; no hash/signature scheme approved here'
  },
  {
    boundary: 'Invalidation',
    sourceAuthority: 'Source-owned invalidation',
    permittedFuturePosture: 'Affected-use-only fail-closed posture',
    explicitProhibition: 'No consumer repair, fallback, echo, override or silent continued use'
  },
  {
    boundary: 'Existing contracts',
    sourceAuthority: 'Reveal/Participation contract boundary',
    permittedFuturePosture: 'Context only',
    explicitProhibition: 'No import into Matching by analogy'
  },
  {
    boundary: 'Decision meaning',
    sourceAuthority: 'Independent governance authorities',
    permittedFuturePosture: 'Qualitative mechanism-boundary display only',
    explicitProhibition: 'No lawful-basis determination, score, Risk, Hard Constraint, eligibility result or route'
  }
] as const;

export const SYNTHETIC_LAWFUL_BASIS_STATUS_VALUES = [
  'ACTIVE',
  'EXPIRED',
  'REVOKED',
  'TERMINATED',
  'SUSPENDED',
  'UNDER_REVIEW'
] as const;

export const SYNTHETIC_LAWFUL_BASIS_ENUM_BOUNDARY = [
  'SOURCE AUTHORITY: ARCHITECTURE §11 — EXACT SIX-VALUE lawful_basis_status ENUM',
  'NO CONTRACT MAPPING, ORDERING, EQUIVALENCE, SEVERITY, TRANSITION OR STATE MACHINE',
  'ACTIVE DOES NOT APPROVE A FEATURE, USE, MATCHING CONTRACT OR RUNTIME',
  'NON-ACTIVE DOES NOT CREATE A NEGATIVE BUSINESS FACT OR AUTOMATIC INELIGIBLE'
] as const;

export const SYNTHETIC_LAWFUL_BASIS_FAIL_CLOSED_BOUNDARY = [
  'MISSING, UNKNOWN, STALE, EXPIRED, REVOKED, TERMINATED, SUSPENDED, UNDER-REVIEW, INVALIDATED, VERSION-MISMATCHED OR PURPOSE-MISMATCHED PROJECTION',
  'FAILS CLOSED ONLY FOR THE AFFECTED GOVERNED USE',
  'NO NEGATIVE FACT, ZERO, DEFAULT, AUTOMATIC INELIGIBLE, REJECTION, ROUTE, REASON, DISPLAY OR UNRELATED/GLOBAL BLOCK',
  'NO GUESSED STATUS, INFERRED PURPOSE, FALLBACK, CONSUMER REPAIR OR SILENT SECONDARY USE',
  'PROJECTION PRESENCE IS NOT A LAWFUL-BASIS DETERMINATION OR PURPOSE EVIDENCE'
] as const;

export const SYNTHETIC_LAWFUL_BASIS_OPEN_CONTENT = [
  'EXACT PROJECTION CONTENT AND CONTRACT REPRESENTATION',
  'MAPPING OF THE SIX-VALUE SOURCE ENUM',
  'API, EVENT, SCHEMA, DATABASE, STORAGE, TRANSPORT AND RUNTIME CARRIER',
  'VERSION, HASH AND SIGNATURE SCHEME',
  'TTL, CACHE, REFRESH AND INVALIDATION DELIVERY',
  'RBAC, APPOINTMENT AND OPERATIONAL ROLES',
  'RETRY, RECOVERY AND OPERATIONAL CONSEQUENCES',
  'ERROR, REASON, ESCALATION AND OBSERVABILITY TAXONOMY',
  'DATA CONTRACT EXTENSION OR NEW MATCHING EVENT',
  'LAWFUL-BASIS DETERMINATION, PURPOSE EVIDENCE AND PROTECTED/PROXY CLASSIFICATION PER USE',
  'COMPATIBILITY, MIGRATION, DATASET, TESTS AND EVIDENCE SUFFICIENCY',
  'FEATURE SCHEMA, POLICY, MANIFEST, PRODUCTION, RUNTIME, IMPLEMENTATION AND GATES'
] as const;

export const SYNTHETIC_LAWFUL_BASIS_TERMINAL_TOKEN =
  'G25_SYNTHETIC_NO_MATCHING_CONTRACT_OR_LAWFUL_BASIS_ACTION_EXECUTED' as const;

export const SYNTHETIC_LAWFUL_BASIS_TERMINAL_LINE =
  'NO REGISTRY WRITE, CONTRACT MAPPING, PURPOSE INFERENCE, STATUS TRANSITION, LAWFUL-BASIS DETERMINATION, NEGATIVE FACT, INELIGIBLE, REJECTION, SCORE, RISK, RANKING, RECOMMENDATION OR ROUTING OCCURRED' as const;
