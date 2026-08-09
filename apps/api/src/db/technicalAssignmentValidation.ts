// Technical Assignment field/cross-field validation. Strictly implements
// 02_PRODUCT/CAMPAIGN_TECHNICAL_ASSIGNMENT.md v1.0 sections 5-8 -- no
// invented fields, bounds or rules. See
// 03_ARCHITECTURE/decisions/ADR-0008-technical-assignment-implementation.md.

import {
  PROPERTY_TYPES,
  PROPERTY_CONDITIONS,
  BUSINESS_CATEGORIES,
  BUSINESS_STAGES,
  ENTRANCE_TYPES,
  ENTRANCE_REQUIREMENTS,
  PROPERTY_FEATURES,
  LOCATION_PRIORITIES,
  ACCESS_MODES,
  LOADING_ACCESS_OPTIONS,
  FLOOR_OPTIONS,
  DEAL_PRIORITIES
} from './technicalAssignmentEnums.js';

export type FieldErrorCode =
  | 'TECHNICAL_ASSIGNMENT_REQUIRED_FIELD_MISSING'
  | 'TECHNICAL_ASSIGNMENT_FIELD_TYPE_INVALID'
  | 'TECHNICAL_ASSIGNMENT_FIELD_VALUE_INVALID'
  | 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT'
  | 'TECHNICAL_ASSIGNMENT_PERSONAL_DATA_FORBIDDEN'
  | 'TECHNICAL_ASSIGNMENT_SECRET_FORBIDDEN';

export interface FieldError {
  field_id: string;
  code: FieldErrorCode;
}

// ---------------------------------------------------------------------------
// DLP heuristic (doc section 12.1, 12.4). Synthetic-only pattern matching --
// a real DLP engine is an explicit Launch blocker (delta-review), not built
// here. Rejects the whole field value; the raw value is never echoed back
// or logged (callers must only ever surface field_id + code).
// ---------------------------------------------------------------------------

const DLP_PATTERNS: RegExp[] = [
  /\+?\d[\d\s().-]{7,}\d/, // phone-shaped digit sequences
  /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, // email
  /@[a-z0-9_]{3,}/i, // messenger handle (@handle)
  /\b(t\.me|wa\.me|vk\.com|instagram\.com|facebook\.com|whatsapp|telegram|viber)\b/i, // messenger/social links
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // card-number-shaped
  /\b(пароль|password|api[_-]?key|token)\b/i // secrets
];

export function containsForbiddenFreeTextData(value: string): boolean {
  return DLP_PATTERNS.some(pattern => pattern.test(value));
}

// Rejects ASCII control characters (tab/newline/carriage-return allowed in
// free text) and HTML-tag-shaped content -- doc section 5.2.4 ("control
// characters, HTML and executable code are forbidden"). Implemented via
// character-code comparison rather than a control-character regex literal.
function hasForbiddenControlCharsOrHtml(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    const isAllowedWhitespace = code === 9 || code === 10 || code === 13; // tab, LF, CR
    if (!isAllowedWhitespace && code < 32) return true;
    if (code === 127) return true;
  }
  return /<[^>]*>/.test(value);
}

// ---------------------------------------------------------------------------
// Generic per-field validation
// ---------------------------------------------------------------------------

export type FieldSpec =
  | { fieldId: string; kind: 'enum'; options: readonly string[] }
  | { fieldId: string; kind: 'enum_array'; options: readonly string[]; min: number; max: number }
  | { fieldId: string; kind: 'string'; minLen: number; maxLen: number }
  | { fieldId: string; kind: 'string_array'; minLen: number; maxLen: number; minCount: number; maxCount: number }
  | { fieldId: string; kind: 'integer'; min: number; max: number }
  | { fieldId: string; kind: 'decimal'; min: number; max: number; decimals: number }
  | { fieldId: string; kind: 'boolean' }
  | { fieldId: string; kind: 'date'; minOffsetDays?: number; maxOffsetDays?: number }
  | { fieldId: string; kind: 'free_text'; maxLen: number };

export type NormalizedValue = string | number | boolean | string[] | null;

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

function todayUtcDateOnly(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/**
 * Validates and normalizes one field's raw value against its spec.
 * `dateFreshnessApplies` gates the "not before today / not beyond +730
 * days" input-time-only checks (doc section 7.4.9 / 8.4.7: a value that
 * was valid when saved and later becomes stale by the passage of time
 * must not retroactively invalidate the stored payload) -- callers pass
 * false when revalidating a value that is unchanged from what is already
 * stored.
 */
export function validateField(
  spec: FieldSpec,
  rawValue: unknown,
  dateFreshnessApplies = true
): { value: NormalizedValue; error?: FieldError } {
  if (isEmpty(rawValue) || (typeof rawValue === 'string' && rawValue.trim().length === 0)) {
    // Absent array-kind fields normalize to [] (matching the NOT NULL
    // DEFAULT '{}' array columns), never null -- keeps the DB write, the
    // read-back, and this same response payload consistent.
    return { value: spec.kind === 'enum_array' || spec.kind === 'string_array' ? [] : null };
  }
  if (Array.isArray(rawValue) && rawValue.length === 0) {
    return { value: spec.kind === 'enum_array' || spec.kind === 'string_array' ? [] : null };
  }

  const invalidType = (): { value: NormalizedValue; error: FieldError } => ({
    value: null,
    error: { field_id: spec.fieldId, code: 'TECHNICAL_ASSIGNMENT_FIELD_TYPE_INVALID' }
  });
  const invalidValue = (): { value: NormalizedValue; error: FieldError } => ({
    value: null,
    error: { field_id: spec.fieldId, code: 'TECHNICAL_ASSIGNMENT_FIELD_VALUE_INVALID' }
  });
  const forbidden = (): { value: NormalizedValue; error: FieldError } => ({
    value: null,
    error: { field_id: spec.fieldId, code: 'TECHNICAL_ASSIGNMENT_PERSONAL_DATA_FORBIDDEN' }
  });

  switch (spec.kind) {
    case 'enum': {
      if (typeof rawValue !== 'string') return invalidType();
      if (!spec.options.includes(rawValue)) return invalidValue();
      return { value: rawValue };
    }
    case 'enum_array': {
      if (!Array.isArray(rawValue) || rawValue.some(v => typeof v !== 'string')) return invalidType();
      const arr = rawValue as string[];
      if (arr.length < spec.min || arr.length > spec.max) return invalidValue();
      if (new Set(arr).size !== arr.length) return invalidValue();
      if (arr.some(v => !spec.options.includes(v))) return invalidValue();
      return { value: arr };
    }
    case 'string': {
      if (typeof rawValue !== 'string') return invalidType();
      const trimmed = rawValue.trim();
      if (trimmed.length < spec.minLen || trimmed.length > spec.maxLen) return invalidValue();
      if (hasForbiddenControlCharsOrHtml(trimmed)) return invalidValue();
      return { value: trimmed };
    }
    case 'string_array': {
      if (!Array.isArray(rawValue) || rawValue.some(v => typeof v !== 'string')) return invalidType();
      const arr = (rawValue as string[]).map(v => v.trim());
      if (arr.length < spec.minCount || arr.length > spec.maxCount) return invalidValue();
      if (new Set(arr).size !== arr.length) return invalidValue();
      if (arr.some(v => v.length < spec.minLen || v.length > spec.maxLen || hasForbiddenControlCharsOrHtml(v))) {
        return invalidValue();
      }
      return { value: arr };
    }
    case 'integer': {
      if (typeof rawValue !== 'number' || !Number.isInteger(rawValue)) return invalidType();
      if (rawValue < spec.min || rawValue > spec.max) return invalidValue();
      return { value: rawValue };
    }
    case 'decimal': {
      if (typeof rawValue !== 'number' || !Number.isFinite(rawValue)) return invalidType();
      if (rawValue < spec.min || rawValue > spec.max) return invalidValue();
      const rounded = Math.round(rawValue * 10 ** spec.decimals) / 10 ** spec.decimals;
      if (Math.abs(rounded - rawValue) > Number.EPSILON * 10) return invalidValue();
      return { value: rounded };
    }
    case 'boolean': {
      if (typeof rawValue !== 'boolean') return invalidType();
      return { value: rawValue };
    }
    case 'date': {
      if (typeof rawValue !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) return invalidType();
      const parsed = new Date(`${rawValue}T00:00:00.000Z`);
      if (Number.isNaN(parsed.getTime())) return invalidValue();
      if (dateFreshnessApplies) {
        const today = todayUtcDateOnly();
        if (spec.minOffsetDays !== undefined) {
          const minDate = new Date(today);
          minDate.setUTCDate(minDate.getUTCDate() + spec.minOffsetDays);
          if (parsed.getTime() < minDate.getTime()) return invalidValue();
        }
        if (spec.maxOffsetDays !== undefined) {
          const maxDate = new Date(today);
          maxDate.setUTCDate(maxDate.getUTCDate() + spec.maxOffsetDays);
          if (parsed.getTime() > maxDate.getTime()) return invalidValue();
        }
      }
      return { value: rawValue };
    }
    case 'free_text': {
      if (typeof rawValue !== 'string') return invalidType();
      const trimmed = rawValue.trim();
      if (trimmed.length > spec.maxLen) return invalidValue();
      if (hasForbiddenControlCharsOrHtml(trimmed)) return invalidValue();
      if (containsForbiddenFreeTextData(trimmed)) return forbidden();
      return { value: trimmed };
    }
    default:
      return invalidType();
  }
}

// ---------------------------------------------------------------------------
// Property (need_tenant) -- exactly 30 fields, doc section 7.2
// ---------------------------------------------------------------------------

export const PROPERTY_FIELD_SPECS: readonly FieldSpec[] = [
  { fieldId: 'property_type', kind: 'enum', options: PROPERTY_TYPES },
  { fieldId: 'property_type_other', kind: 'string', minLen: 2, maxLen: 100 },
  { fieldId: 'property_country_code', kind: 'enum', options: ['RU'] },
  { fieldId: 'property_region', kind: 'string', minLen: 2, maxLen: 100 },
  { fieldId: 'property_city', kind: 'string', minLen: 2, maxLen: 100 },
  { fieldId: 'property_districts', kind: 'string_array', minLen: 2, maxLen: 100, minCount: 0, maxCount: 5 },
  { fieldId: 'property_exact_address', kind: 'string', minLen: 5, maxLen: 300 },
  { fieldId: 'property_area_sqm', kind: 'decimal', min: 5, max: 100000, decimals: 2 },
  { fieldId: 'property_floor', kind: 'integer', min: -5, max: 200 },
  { fieldId: 'property_total_floors', kind: 'integer', min: 1, max: 200 },
  { fieldId: 'property_entrance_type', kind: 'enum', options: ENTRANCE_TYPES },
  { fieldId: 'property_condition', kind: 'enum', options: PROPERTY_CONDITIONS },
  { fieldId: 'property_available_from', kind: 'date', minOffsetDays: 0, maxOffsetDays: 730 },
  { fieldId: 'property_monthly_rent_rub', kind: 'integer', min: 1000, max: 100000000 },
  { fieldId: 'property_operating_expenses_included', kind: 'boolean' },
  { fieldId: 'property_utilities_included', kind: 'boolean' },
  { fieldId: 'property_security_deposit_rub', kind: 'integer', min: 0, max: 100000000 },
  { fieldId: 'property_min_lease_months', kind: 'integer', min: 1, max: 240 },
  { fieldId: 'property_allowed_business_categories', kind: 'enum_array', options: BUSINESS_CATEGORIES, min: 1, max: 8 },
  { fieldId: 'property_excluded_business_categories', kind: 'enum_array', options: BUSINESS_CATEGORIES, min: 0, max: 8 },
  { fieldId: 'property_target_tenant_categories', kind: 'enum_array', options: BUSINESS_CATEGORIES, min: 0, max: 5 },
  { fieldId: 'property_business_category_other', kind: 'string', minLen: 2, maxLen: 200 },
  { fieldId: 'property_power_kw', kind: 'decimal', min: 0, max: 10000, decimals: 2 },
  { fieldId: 'property_ceiling_height_m', kind: 'decimal', min: 1.8, max: 30, decimals: 2 },
  { fieldId: 'property_features', kind: 'enum_array', options: PROPERTY_FEATURES, min: 0, max: 14 },
  { fieldId: 'property_parking_spaces', kind: 'integer', min: 0, max: 10000 },
  { fieldId: 'property_loading_access', kind: 'enum', options: LOADING_ACCESS_OPTIONS },
  { fieldId: 'property_access_mode', kind: 'enum', options: ACCESS_MODES },
  { fieldId: 'property_deal_priority', kind: 'enum', options: DEAL_PRIORITIES },
  { fieldId: 'property_additional_requirements', kind: 'free_text', maxLen: 2000 }
] as const;

if (PROPERTY_FIELD_SPECS.length !== 30) {
  throw new Error(`PROPERTY_FIELD_SPECS must have exactly 30 fields, has ${PROPERTY_FIELD_SPECS.length}`);
}

export const PROPERTY_REQUIRED_FIELDS: readonly string[] = [
  'property_type',
  'property_country_code',
  'property_region',
  'property_city',
  'property_area_sqm',
  'property_condition',
  'property_available_from',
  'property_monthly_rent_rub',
  'property_operating_expenses_included',
  'property_utilities_included',
  'property_allowed_business_categories',
  'property_deal_priority'
] as const;

export type PropertyPayload = Record<string, NormalizedValue>;

/** doc section 7.4 cross-field rules. Returns [] when none violated.
 *
 * Note (2026-08-03, PRODUCT-directed fix): the `property_target_tenant_categories`
 * subset check and the `any_legal_business` exclusivity check now treat the
 * wildcard as covering every specific target category, so `target` may be
 * non-empty alongside `any_legal_business` without also duplicating it into
 * `allowed`. Doc 7.4.3's literal text ("excluded и target при этом должны
 * быть пустыми") has not been edited to match yet -- this function is now
 * the source of truth for this specific interaction; excluded still must be
 * empty whenever any_legal_business is used, per that same section. */
export function validatePropertyCrossFieldRules(payload: PropertyPayload): FieldError[] {
  const errors: FieldError[] = [];
  const allowed = (payload.property_allowed_business_categories as string[] | null) ?? [];
  const excluded = (payload.property_excluded_business_categories as string[] | null) ?? [];
  const target = (payload.property_target_tenant_categories as string[] | null) ?? [];
  // `any_legal_business` in allowed is a wildcard covering every specific
  // category (doc 6.3): a preferred category doesn't need to also be listed
  // explicitly in allowed when the wildcard is present. An explicit
  // exclusion still wins regardless of the wildcard -- either the category
  // is also literally in `allowed` (caught by the overlap check right
  // below), or `excluded` is non-empty at all, which the any_legal_business
  // exclusivity check below still rejects on its own.
  const allowsAnyLegalBusiness = allowed.includes('any_legal_business');

  if (allowed.some(c => excluded.includes(c))) {
    errors.push({ field_id: 'property_excluded_business_categories', code: 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT' });
  }
  if (target.some(c => !allowsAnyLegalBusiness && !allowed.includes(c))) {
    errors.push({ field_id: 'property_target_tenant_categories', code: 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT' });
  }
  if (allowsAnyLegalBusiness && (allowed.length > 1 || excluded.length > 0)) {
    errors.push({ field_id: 'property_allowed_business_categories', code: 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT' });
  }
  const otherCategoryUsed = [...allowed, ...excluded, ...target].includes('other');
  if (otherCategoryUsed && isEmpty(payload.property_business_category_other)) {
    errors.push({ field_id: 'property_business_category_other', code: 'TECHNICAL_ASSIGNMENT_REQUIRED_FIELD_MISSING' });
  }
  if (!otherCategoryUsed && !isEmpty(payload.property_business_category_other)) {
    errors.push({ field_id: 'property_business_category_other', code: 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT' });
  }
  if (payload.property_type === 'other' && isEmpty(payload.property_type_other)) {
    errors.push({ field_id: 'property_type_other', code: 'TECHNICAL_ASSIGNMENT_REQUIRED_FIELD_MISSING' });
  }
  if (payload.property_type !== 'other' && !isEmpty(payload.property_type_other)) {
    errors.push({ field_id: 'property_type_other', code: 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT' });
  }
  if (payload.property_type === 'land') {
    for (const fieldId of ['property_floor', 'property_total_floors', 'property_ceiling_height_m', 'property_entrance_type']) {
      if (!isEmpty(payload[fieldId])) {
        errors.push({ field_id: fieldId, code: 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT' });
      }
    }
  }
  const floor = payload.property_floor as number | null;
  const totalFloors = payload.property_total_floors as number | null;
  if (floor !== null && totalFloors !== null && floor > 0 && floor > totalFloors) {
    errors.push({ field_id: 'property_floor', code: 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT' });
  }
  const features = (payload.property_features as string[] | null) ?? [];
  if (features.includes('parking') && payload.property_parking_spaces === 0) {
    errors.push({ field_id: 'property_features', code: 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT' });
  }
  if (features.includes('loading_zone') && payload.property_loading_access === 'none') {
    errors.push({ field_id: 'property_features', code: 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT' });
  }
  return errors;
}

// ---------------------------------------------------------------------------
// TenantRequest (need_property) -- exactly 30 fields, doc section 8.2
// ---------------------------------------------------------------------------

export const TENANT_REQUEST_FIELD_SPECS: readonly FieldSpec[] = [
  { fieldId: 'request_business_category', kind: 'enum', options: BUSINESS_CATEGORIES },
  { fieldId: 'request_business_category_other', kind: 'string', minLen: 2, maxLen: 200 },
  { fieldId: 'request_business_stage', kind: 'enum', options: BUSINESS_STAGES },
  { fieldId: 'request_expected_occupancy_people', kind: 'integer', min: 1, max: 10000 },
  { fieldId: 'request_country_code', kind: 'enum', options: ['RU'] },
  { fieldId: 'request_region', kind: 'string', minLen: 2, maxLen: 100 },
  { fieldId: 'request_cities', kind: 'string_array', minLen: 2, maxLen: 100, minCount: 1, maxCount: 5 },
  { fieldId: 'request_districts', kind: 'string_array', minLen: 2, maxLen: 100, minCount: 0, maxCount: 20 },
  { fieldId: 'request_location_priorities', kind: 'enum_array', options: LOCATION_PRIORITIES, min: 0, max: 5 },
  { fieldId: 'request_property_types', kind: 'enum_array', options: PROPERTY_TYPES, min: 1, max: 8 },
  { fieldId: 'request_property_type_other', kind: 'string', minLen: 2, maxLen: 100 },
  { fieldId: 'request_area_min_sqm', kind: 'decimal', min: 5, max: 100000, decimals: 2 },
  { fieldId: 'request_area_max_sqm', kind: 'decimal', min: 5, max: 100000, decimals: 2 },
  { fieldId: 'request_monthly_budget_max_rub', kind: 'integer', min: 1000, max: 100000000 },
  { fieldId: 'request_monthly_rent_rate_max_rub_per_sqm', kind: 'decimal', min: 1, max: 100000000, decimals: 2 },
  { fieldId: 'request_budget_includes_operating_expenses', kind: 'boolean' },
  { fieldId: 'request_condition_options', kind: 'enum_array', options: PROPERTY_CONDITIONS, min: 1, max: 4 },
  { fieldId: 'request_move_in_by', kind: 'date', minOffsetDays: 0, maxOffsetDays: 730 },
  { fieldId: 'request_min_lease_months', kind: 'integer', min: 1, max: 240 },
  { fieldId: 'request_power_min_kw', kind: 'decimal', min: 0, max: 10000, decimals: 2 },
  { fieldId: 'request_ceiling_height_min_m', kind: 'decimal', min: 1.8, max: 30, decimals: 2 },
  { fieldId: 'request_entrance_requirement', kind: 'enum', options: ENTRANCE_REQUIREMENTS },
  { fieldId: 'request_floor_options', kind: 'enum_array', options: FLOOR_OPTIONS, min: 0, max: 5 },
  { fieldId: 'request_parking_min_spaces', kind: 'integer', min: 0, max: 10000 },
  { fieldId: 'request_loading_access_required', kind: 'boolean' },
  { fieldId: 'request_access_mode', kind: 'enum', options: ACCESS_MODES },
  { fieldId: 'request_required_features', kind: 'enum_array', options: PROPERTY_FEATURES, min: 0, max: 10 },
  { fieldId: 'request_excluded_features', kind: 'enum_array', options: PROPERTY_FEATURES, min: 0, max: 10 },
  { fieldId: 'request_deal_priority', kind: 'enum', options: DEAL_PRIORITIES },
  { fieldId: 'request_additional_requirements', kind: 'free_text', maxLen: 2000 }
] as const;

if (TENANT_REQUEST_FIELD_SPECS.length !== 30) {
  throw new Error(`TENANT_REQUEST_FIELD_SPECS must have exactly 30 fields, has ${TENANT_REQUEST_FIELD_SPECS.length}`);
}

export const TENANT_REQUEST_REQUIRED_FIELDS: readonly string[] = [
  'request_business_category',
  'request_business_stage',
  'request_country_code',
  'request_region',
  'request_cities',
  'request_property_types',
  'request_area_min_sqm',
  'request_area_max_sqm',
  'request_monthly_budget_max_rub',
  'request_budget_includes_operating_expenses',
  'request_condition_options',
  'request_move_in_by',
  'request_deal_priority'
] as const;

export type TenantRequestPayload = Record<string, NormalizedValue>;

/** doc section 8.4 cross-field rules. Returns [] when none violated. */
export function validateTenantRequestCrossFieldRules(payload: TenantRequestPayload): FieldError[] {
  const errors: FieldError[] = [];
  const areaMin = payload.request_area_min_sqm as number | null;
  const areaMax = payload.request_area_max_sqm as number | null;
  if (areaMin !== null && areaMax !== null && areaMin > areaMax) {
    errors.push({ field_id: 'request_area_min_sqm', code: 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT' });
  }
  const required = (payload.request_required_features as string[] | null) ?? [];
  const excluded = (payload.request_excluded_features as string[] | null) ?? [];
  if (required.some(f => excluded.includes(f))) {
    errors.push({ field_id: 'request_excluded_features', code: 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT' });
  }
  const floorOptions = (payload.request_floor_options as string[] | null) ?? [];
  if (floorOptions.includes('any') && floorOptions.length > 1) {
    errors.push({ field_id: 'request_floor_options', code: 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT' });
  }
  if (payload.request_business_category === 'any_legal_business') {
    errors.push({ field_id: 'request_business_category', code: 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT' });
  }
  if (payload.request_business_category === 'other' && isEmpty(payload.request_business_category_other)) {
    errors.push({ field_id: 'request_business_category_other', code: 'TECHNICAL_ASSIGNMENT_REQUIRED_FIELD_MISSING' });
  }
  if (payload.request_business_category !== 'other' && !isEmpty(payload.request_business_category_other)) {
    errors.push({ field_id: 'request_business_category_other', code: 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT' });
  }
  const propertyTypes = (payload.request_property_types as string[] | null) ?? [];
  const otherTypeUsed = propertyTypes.includes('other');
  if (otherTypeUsed && isEmpty(payload.request_property_type_other)) {
    errors.push({ field_id: 'request_property_type_other', code: 'TECHNICAL_ASSIGNMENT_REQUIRED_FIELD_MISSING' });
  }
  if (!otherTypeUsed && !isEmpty(payload.request_property_type_other)) {
    errors.push({ field_id: 'request_property_type_other', code: 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT' });
  }
  return errors;
}

export function missingRequiredFields(payload: Record<string, NormalizedValue>, required: readonly string[]): string[] {
  return required.filter(fieldId => {
    const value = payload[fieldId];
    return isEmpty(value) || (Array.isArray(value) && value.length === 0);
  });
}
