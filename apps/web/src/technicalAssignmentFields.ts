// Field metadata for the Technical Assignment forms. Mirrors
// apps/api/src/db/technicalAssignmentValidation.ts field lists (field_id,
// required-ness, decimal bounds) and apps/api/src/db/technicalAssignmentEnums.ts
// exactly -- 30 Property fields, 30 TenantRequest fields, no additions, no
// renames of field_id, no new limits invented here.
//
// `label` and `group` are presentation-only (02_PRODUCT/CAMPAIGN_TECHNICAL_ASSIGNMENT.md
// section 7.2/8.2 "Смысл" column, condensed to UI copy) -- they carry no
// meaning to the API and are never sent in a request. `optionLabels` maps
// each raw enum value to its Russian display text (see ruLabels.ts, the
// single source of truth for that mapping) -- the raw value in `options` is
// still what actually gets submitted; only its on-screen text changes.

import {
  PROPERTY_TYPE_LABELS,
  PROPERTY_CONDITION_LABELS,
  BUSINESS_CATEGORY_LABELS,
  BUSINESS_STAGE_LABELS,
  ENTRANCE_TYPE_LABELS,
  ENTRANCE_REQUIREMENT_LABELS,
  PROPERTY_FEATURE_LABELS,
  LOCATION_PRIORITY_LABELS,
  ACCESS_MODE_LABELS,
  LOADING_ACCESS_LABELS,
  FLOOR_OPTION_LABELS,
  DEAL_PRIORITY_LABELS,
  COUNTRY_CODE_LABELS
} from './ruLabels';

export type TAFieldKind = 'enum' | 'enum_array' | 'string' | 'string_array' | 'integer' | 'decimal' | 'boolean' | 'date' | 'free_text';

// Mirrors the 'decimal' kind bounds in PROPERTY_FIELD_SPECS / TENANT_REQUEST_FIELD_SPECS
// (apps/api/src/db/technicalAssignmentValidation.ts) -- the only source of
// truth for these numbers. Never widen or narrow independently of the backend.
export interface TADecimalLimits {
  min: number;
  max: number;
  decimals: number;
}

export interface TAFieldDef {
  fieldId: string;
  kind: TAFieldKind;
  label: string;
  group: string;
  required: boolean;
  options?: readonly string[];
  optionLabels?: Record<string, string>;
  decimalLimits?: TADecimalLimits;
  decimalErrorHint?: string;
}

export const FIELD_GROUPS = [
  'Основные сведения',
  'Расположение',
  'Площадь и характеристики',
  'Арендные условия',
  'Разрешённые виды деятельности',
  'Оснащение и доступ'
] as const;

const PROPERTY_TYPES = ['retail_unit', 'office', 'warehouse', 'light_industrial', 'free_purpose', 'standalone_building', 'land', 'other'];
const PROPERTY_CONDITIONS = ['shell_and_core', 'requires_full_renovation', 'cosmetic_renovation', 'ready_to_use'];
const BUSINESS_CATEGORIES = [
  'cafe', 'restaurant', 'grocery', 'non_food_retail', 'pharmacy', 'medical', 'beauty', 'fitness', 'education',
  'office', 'warehouse', 'light_production', 'services', 'showroom', 'entertainment', 'other', 'any_legal_business'
];
const BUSINESS_STAGES = ['new_business', 'operating', 'expansion', 'relocation', 'additional_location'];
const ENTRANCE_TYPES = ['separate_street', 'separate_yard', 'shared', 'loading_only', 'none'];
const ENTRANCE_REQUIREMENTS = ['separate_required', 'separate_preferred', 'shared_allowed', 'no_preference'];
const PROPERTY_FEATURES = [
  'separate_entrance', 'display_windows', 'ventilation', 'air_conditioning', 'heating', 'water_supply', 'sewerage',
  'signage_space', 'parking', 'loading_zone', 'access_24_7', 'security', 'elevator', 'freight_elevator'
];
const LOCATION_PRIORITIES = [
  'near_home', 'near_customers', 'city_center', 'near_metro', 'near_shopping_center', 'near_business_center',
  'first_line', 'high_visibility', 'parking', 'loading_access'
];
const ACCESS_MODES = ['business_hours', 'extended_hours', 'access_24_7', 'by_agreement'];
const LOADING_ACCESS_OPTIONS = ['none', 'small_vehicle', 'truck', 'loading_dock'];
const FLOOR_OPTIONS = ['basement', 'semi_basement', 'ground', 'first', 'upper', 'any'];
const DEAL_PRIORITIES = ['fastest_deal', 'balanced', 'maximum_economics', 'counterparty_reliability'];

export const PROPERTY_FIELDS: readonly TAFieldDef[] = [
  { fieldId: 'property_type', kind: 'enum', options: PROPERTY_TYPES, optionLabels: PROPERTY_TYPE_LABELS, label: 'Тип объекта', group: 'Основные сведения', required: true },
  { fieldId: 'property_type_other', kind: 'string', label: 'Уточнение иного типа объекта', group: 'Основные сведения', required: false },
  { fieldId: 'property_condition', kind: 'enum', options: PROPERTY_CONDITIONS, optionLabels: PROPERTY_CONDITION_LABELS, label: 'Состояние объекта', group: 'Основные сведения', required: true },
  { fieldId: 'property_available_from', kind: 'date', label: 'Дата доступности', group: 'Основные сведения', required: true },

  { fieldId: 'property_country_code', kind: 'enum', options: ['RU'], optionLabels: COUNTRY_CODE_LABELS, label: 'Страна', group: 'Расположение', required: true },
  { fieldId: 'property_region', kind: 'string', label: 'Регион', group: 'Расположение', required: true },
  { fieldId: 'property_city', kind: 'string', label: 'Город', group: 'Расположение', required: true },
  { fieldId: 'property_districts', kind: 'string_array', label: 'Районы или зоны', group: 'Расположение', required: false },
  { fieldId: 'property_exact_address', kind: 'string', label: 'Точный адрес объекта', group: 'Расположение', required: false },

  {
    fieldId: 'property_area_sqm',
    kind: 'decimal',
    label: 'Общая сдаваемая площадь, м²',
    group: 'Площадь и характеристики',
    required: true,
    decimalLimits: { min: 5, max: 100000, decimals: 2 },
    decimalErrorHint: 'Введите площадь в м², например 100'
  },
  { fieldId: 'property_floor', kind: 'integer', label: 'Этаж', group: 'Площадь и характеристики', required: false },
  { fieldId: 'property_total_floors', kind: 'integer', label: 'Этажность здания', group: 'Площадь и характеристики', required: false },
  {
    fieldId: 'property_ceiling_height_m',
    kind: 'decimal',
    label: 'Высота потолков, м',
    group: 'Площадь и характеристики',
    required: false,
    decimalLimits: { min: 1.8, max: 30, decimals: 2 },
    decimalErrorHint: 'Введите высоту в метрах, например 3,5'
  },
  {
    fieldId: 'property_power_kw',
    kind: 'decimal',
    label: 'Доступная электрическая мощность, кВт',
    group: 'Площадь и характеристики',
    required: false,
    decimalLimits: { min: 0, max: 10000, decimals: 2 },
    decimalErrorHint: 'Введите мощность в кВт, например 15'
  },

  // Label intentionally generic: the specific "₽/мес" vs "₽/м²/мес" wording
  // is rendered by CampaignLaunchWizard's RentField, which switches it based
  // on the user's chosen entry mode (rate per sqm vs total).
  { fieldId: 'property_monthly_rent_rub', kind: 'integer', label: 'Аренда', group: 'Арендные условия', required: true },
  { fieldId: 'property_operating_expenses_included', kind: 'boolean', label: 'Эксплуатационные расходы включены в аренду?', group: 'Арендные условия', required: true },
  { fieldId: 'property_utilities_included', kind: 'boolean', label: 'Коммунальные платежи включены в аренду?', group: 'Арендные условия', required: true },
  { fieldId: 'property_security_deposit_rub', kind: 'integer', label: 'Обеспечительный платёж, ₽', group: 'Арендные условия', required: false },
  { fieldId: 'property_min_lease_months', kind: 'integer', label: 'Минимальный срок аренды, мес.', group: 'Арендные условия', required: false },
  { fieldId: 'property_deal_priority', kind: 'enum', options: DEAL_PRIORITIES, optionLabels: DEAL_PRIORITY_LABELS, label: 'Приоритет сделки', group: 'Арендные условия', required: true },

  { fieldId: 'property_allowed_business_categories', kind: 'enum_array', options: BUSINESS_CATEGORIES, optionLabels: BUSINESS_CATEGORY_LABELS, label: 'Допустимые категории деятельности', group: 'Разрешённые виды деятельности', required: true },
  { fieldId: 'property_excluded_business_categories', kind: 'enum_array', options: BUSINESS_CATEGORIES, optionLabels: BUSINESS_CATEGORY_LABELS, label: 'Недопустимые категории деятельности', group: 'Разрешённые виды деятельности', required: false },
  { fieldId: 'property_target_tenant_categories', kind: 'enum_array', options: BUSINESS_CATEGORIES, optionLabels: BUSINESS_CATEGORY_LABELS, label: 'Предпочтительные категории арендаторов', group: 'Разрешённые виды деятельности', required: false },
  { fieldId: 'property_business_category_other', kind: 'string', label: 'Уточнение категории «иное»', group: 'Разрешённые виды деятельности', required: false },

  { fieldId: 'property_entrance_type', kind: 'enum', options: ENTRANCE_TYPES, optionLabels: ENTRANCE_TYPE_LABELS, label: 'Тип входа', group: 'Оснащение и доступ', required: false },
  { fieldId: 'property_features', kind: 'enum_array', options: PROPERTY_FEATURES, optionLabels: PROPERTY_FEATURE_LABELS, label: 'Характеристики объекта', group: 'Оснащение и доступ', required: false },
  { fieldId: 'property_parking_spaces', kind: 'integer', label: 'Число парковочных мест', group: 'Оснащение и доступ', required: false },
  { fieldId: 'property_loading_access', kind: 'enum', options: LOADING_ACCESS_OPTIONS, optionLabels: LOADING_ACCESS_LABELS, label: 'Возможность погрузки/разгрузки', group: 'Оснащение и доступ', required: false },
  { fieldId: 'property_access_mode', kind: 'enum', options: ACCESS_MODES, optionLabels: ACCESS_MODE_LABELS, label: 'Режим доступа', group: 'Оснащение и доступ', required: false },
  { fieldId: 'property_additional_requirements', kind: 'free_text', label: 'Дополнительные коммерческие условия', group: 'Оснащение и доступ', required: false }
];

if (PROPERTY_FIELDS.length !== 30) {
  throw new Error(`PROPERTY_FIELDS must have exactly 30 fields, has ${PROPERTY_FIELDS.length}`);
}

export const TENANT_REQUEST_FIELDS: readonly TAFieldDef[] = [
  { fieldId: 'request_business_category', kind: 'enum', options: BUSINESS_CATEGORIES, optionLabels: BUSINESS_CATEGORY_LABELS, label: 'Категория бизнеса', group: 'Основные сведения', required: true },
  { fieldId: 'request_business_category_other', kind: 'string', label: 'Уточнение категории бизнеса', group: 'Основные сведения', required: false },
  { fieldId: 'request_business_stage', kind: 'enum', options: BUSINESS_STAGES, optionLabels: BUSINESS_STAGE_LABELS, label: 'Стадия бизнеса / причина поиска', group: 'Основные сведения', required: true },
  { fieldId: 'request_expected_occupancy_people', kind: 'integer', label: 'Ожидаемое число людей одновременно', group: 'Основные сведения', required: false },

  { fieldId: 'request_country_code', kind: 'enum', options: ['RU'], optionLabels: COUNTRY_CODE_LABELS, label: 'Страна', group: 'Расположение', required: true },
  { fieldId: 'request_region', kind: 'string', label: 'Регион', group: 'Расположение', required: true },
  { fieldId: 'request_cities', kind: 'string_array', label: 'Города', group: 'Расположение', required: true },
  { fieldId: 'request_districts', kind: 'string_array', label: 'Приемлемые районы или зоны', group: 'Расположение', required: false },
  { fieldId: 'request_location_priorities', kind: 'enum_array', options: LOCATION_PRIORITIES, optionLabels: LOCATION_PRIORITY_LABELS, label: 'Приоритеты расположения', group: 'Расположение', required: false },

  { fieldId: 'request_property_types', kind: 'enum_array', options: PROPERTY_TYPES, optionLabels: PROPERTY_TYPE_LABELS, label: 'Приемлемые типы объектов', group: 'Площадь и характеристики', required: true },
  { fieldId: 'request_property_type_other', kind: 'string', label: 'Уточнение иного типа объекта', group: 'Площадь и характеристики', required: false },
  {
    fieldId: 'request_area_min_sqm',
    kind: 'decimal',
    label: 'Минимальная площадь, м²',
    group: 'Площадь и характеристики',
    required: true,
    decimalLimits: { min: 5, max: 100000, decimals: 2 },
    decimalErrorHint: 'Введите площадь в м², например 50'
  },
  {
    fieldId: 'request_area_max_sqm',
    kind: 'decimal',
    label: 'Максимальная площадь, м²',
    group: 'Площадь и характеристики',
    required: true,
    decimalLimits: { min: 5, max: 100000, decimals: 2 },
    decimalErrorHint: 'Введите площадь в м², например 150'
  },
  {
    fieldId: 'request_ceiling_height_min_m',
    kind: 'decimal',
    label: 'Минимальная высота потолков, м',
    group: 'Площадь и характеристики',
    required: false,
    decimalLimits: { min: 1.8, max: 30, decimals: 2 },
    decimalErrorHint: 'Введите высоту в метрах, например 3,5'
  },
  {
    fieldId: 'request_power_min_kw',
    kind: 'decimal',
    label: 'Минимальная мощность, кВт',
    group: 'Площадь и характеристики',
    required: false,
    decimalLimits: { min: 0, max: 10000, decimals: 2 },
    decimalErrorHint: 'Введите мощность в кВт, например 10'
  },

  { fieldId: 'request_monthly_budget_max_rub', kind: 'integer', label: 'Максимальный бюджет аренды', group: 'Арендные условия', required: true },
  {
    fieldId: 'request_monthly_rent_rate_max_rub_per_sqm',
    kind: 'decimal',
    label: 'Максимальная ставка аренды, ₽/м²/мес',
    group: 'Арендные условия',
    required: false,
    decimalLimits: { min: 1, max: 100000000, decimals: 2 },
    decimalErrorHint: 'Введите ставку в рублях за м², например 4000'
  },
  { fieldId: 'request_budget_includes_operating_expenses', kind: 'boolean', label: 'Бюджет включает эксплуатационные расходы?', group: 'Арендные условия', required: true },
  { fieldId: 'request_condition_options', kind: 'enum_array', options: PROPERTY_CONDITIONS, optionLabels: PROPERTY_CONDITION_LABELS, label: 'Приемлемые состояния объекта', group: 'Арендные условия', required: true },
  { fieldId: 'request_move_in_by', kind: 'date', label: 'Крайняя дата въезда', group: 'Арендные условия', required: true },
  { fieldId: 'request_min_lease_months', kind: 'integer', label: 'Минимальный приемлемый срок аренды, мес.', group: 'Арендные условия', required: false },
  { fieldId: 'request_deal_priority', kind: 'enum', options: DEAL_PRIORITIES, optionLabels: DEAL_PRIORITY_LABELS, label: 'Приоритет арендатора', group: 'Арендные условия', required: true },

  { fieldId: 'request_entrance_requirement', kind: 'enum', options: ENTRANCE_REQUIREMENTS, optionLabels: ENTRANCE_REQUIREMENT_LABELS, label: 'Требование к входу', group: 'Оснащение и доступ', required: false },
  { fieldId: 'request_floor_options', kind: 'enum_array', options: FLOOR_OPTIONS, optionLabels: FLOOR_OPTION_LABELS, label: 'Приемлемые этажи', group: 'Оснащение и доступ', required: false },
  { fieldId: 'request_parking_min_spaces', kind: 'integer', label: 'Минимум парковочных мест', group: 'Оснащение и доступ', required: false },
  { fieldId: 'request_loading_access_required', kind: 'boolean', label: 'Обязательна погрузка/разгрузка?', group: 'Оснащение и доступ', required: false },
  { fieldId: 'request_access_mode', kind: 'enum', options: ACCESS_MODES, optionLabels: ACCESS_MODE_LABELS, label: 'Требуемый режим доступа', group: 'Оснащение и доступ', required: false },
  { fieldId: 'request_required_features', kind: 'enum_array', options: PROPERTY_FEATURES, optionLabels: PROPERTY_FEATURE_LABELS, label: 'Обязательные характеристики', group: 'Оснащение и доступ', required: false },
  { fieldId: 'request_excluded_features', kind: 'enum_array', options: PROPERTY_FEATURES, optionLabels: PROPERTY_FEATURE_LABELS, label: 'Недопустимые характеристики', group: 'Оснащение и доступ', required: false },
  { fieldId: 'request_additional_requirements', kind: 'free_text', label: 'Дополнительные требования', group: 'Оснащение и доступ', required: false }
];

if (TENANT_REQUEST_FIELDS.length !== 30) {
  throw new Error(`TENANT_REQUEST_FIELDS must have exactly 30 fields, has ${TENANT_REQUEST_FIELDS.length}`);
}

/** The field list for a given scenario, keyed the same way the backend
 * keys it (technicalAssignmentApi.ts's Scenario type) -- used to rehydrate
 * a restored Technical Assignment (reload/return-to-tab) before `goal`
 * state has been set from user interaction. */
export function fieldsForScenario(scenario: 'need_tenant' | 'need_property'): readonly TAFieldDef[] {
  return scenario === 'need_tenant' ? PROPERTY_FIELDS : TENANT_REQUEST_FIELDS;
}
