// Technical Assignment enums, verbatim from
// 02_PRODUCT/CAMPAIGN_TECHNICAL_ASSIGNMENT.md v1.0 §6. No additions,
// renames or removals -- PRODUCT-owned values (ADR-0008).

export const PROPERTY_TYPES = [
  'retail_unit',
  'office',
  'warehouse',
  'light_industrial',
  'free_purpose',
  'standalone_building',
  'land',
  'other'
] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const PROPERTY_CONDITIONS = [
  'shell_and_core',
  'requires_full_renovation',
  'cosmetic_renovation',
  'ready_to_use'
] as const;
export type PropertyCondition = (typeof PROPERTY_CONDITIONS)[number];

export const BUSINESS_CATEGORIES = [
  'cafe',
  'restaurant',
  'grocery',
  'non_food_retail',
  'pharmacy',
  'medical',
  'beauty',
  'fitness',
  'education',
  'office',
  'warehouse',
  'light_production',
  'services',
  'showroom',
  'entertainment',
  'other',
  'any_legal_business'
] as const;
export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];

export const BUSINESS_STAGES = ['new_business', 'operating', 'expansion', 'relocation', 'additional_location'] as const;
export type BusinessStage = (typeof BUSINESS_STAGES)[number];

export const ENTRANCE_TYPES = ['separate_street', 'separate_yard', 'shared', 'loading_only', 'none'] as const;
export type EntranceType = (typeof ENTRANCE_TYPES)[number];

export const ENTRANCE_REQUIREMENTS = ['separate_required', 'separate_preferred', 'shared_allowed', 'no_preference'] as const;
export type EntranceRequirement = (typeof ENTRANCE_REQUIREMENTS)[number];

export const PROPERTY_FEATURES = [
  'separate_entrance',
  'display_windows',
  'ventilation',
  'air_conditioning',
  'heating',
  'water_supply',
  'sewerage',
  'signage_space',
  'parking',
  'loading_zone',
  'access_24_7',
  'security',
  'elevator',
  'freight_elevator'
] as const;
export type PropertyFeature = (typeof PROPERTY_FEATURES)[number];

export const LOCATION_PRIORITIES = [
  'near_home',
  'near_customers',
  'city_center',
  'near_metro',
  'near_shopping_center',
  'near_business_center',
  'first_line',
  'high_visibility',
  'parking',
  'loading_access'
] as const;
export type LocationPriority = (typeof LOCATION_PRIORITIES)[number];

export const ACCESS_MODES = ['business_hours', 'extended_hours', 'access_24_7', 'by_agreement'] as const;
export type AccessMode = (typeof ACCESS_MODES)[number];

export const LOADING_ACCESS_OPTIONS = ['none', 'small_vehicle', 'truck', 'loading_dock'] as const;
export type LoadingAccessOption = (typeof LOADING_ACCESS_OPTIONS)[number];

export const FLOOR_OPTIONS = ['basement', 'semi_basement', 'ground', 'first', 'upper', 'any'] as const;
export type FloorOption = (typeof FLOOR_OPTIONS)[number];

export const DEAL_PRIORITIES = ['fastest_deal', 'balanced', 'maximum_economics', 'counterparty_reliability'] as const;
export type DealPriority = (typeof DEAL_PRIORITIES)[number];
