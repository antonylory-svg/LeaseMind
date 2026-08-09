// Centralized Russian display dictionaries for apps/web.
//
// These maps translate *display only*. Every key on the left is a real
// backend/API value (enum option, scenario, lifecycle_status, Campaign
// status, health status) and MUST stay byte-for-byte identical to what
// apps/api/src/db/technicalAssignmentEnums.ts, technicalAssignmentValidation.ts
// and campaigns.ts define -- never renamed, added to, or removed here.
// Nothing in this file is ever sent to the API; it only maps a known value
// to the Russian text shown for it. Payloads always carry the original
// English value (e.g. the user picks "Офис", the payload keeps `office`).
//
// Judgment-call translations (no single unambiguous Russian equivalent found
// in product docs) are marked FLAG below and repeated in the change report
// for PRODUCT to confirm or correct -- see the conversation summary.

// ---------------------------------------------------------------------------
// property_type / request_property_types (PROPERTY_TYPES)
// ---------------------------------------------------------------------------
export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  retail_unit: 'Торговое помещение',
  office: 'Офис',
  warehouse: 'Склад',
  light_industrial: 'Лёгкое производство',
  free_purpose: 'Помещение свободного назначения',
  standalone_building: 'Отдельно стоящее здание',
  land: 'Земельный участок',
  other: 'Иное'
};

// ---------------------------------------------------------------------------
// property_condition / request_condition_options (PROPERTY_CONDITIONS)
// FLAG: shell_and_core has no single-word Russian equivalent; rendered as
// the common Russian commercial real estate phrase "черновая отделка".
// ---------------------------------------------------------------------------
export const PROPERTY_CONDITION_LABELS: Record<string, string> = {
  shell_and_core: 'Черновая отделка', // FLAG: judgment call, see report
  requires_full_renovation: 'Требуется капитальный ремонт',
  cosmetic_renovation: 'Требуется косметический ремонт',
  ready_to_use: 'Готово к использованию'
};

// ---------------------------------------------------------------------------
// business_category (BUSINESS_CATEGORIES) -- shared by allowed/excluded/target
// categories (need_tenant) and request_business_category (need_property).
// FLAG: any_legal_business has no single fixed Russian product term.
// ---------------------------------------------------------------------------
export const BUSINESS_CATEGORY_LABELS: Record<string, string> = {
  cafe: 'Кафе',
  restaurant: 'Ресторан',
  grocery: 'Продуктовый магазин',
  non_food_retail: 'Непродовольственная розница',
  pharmacy: 'Аптека',
  medical: 'Медицина',
  beauty: 'Красота и уход',
  fitness: 'Фитнес',
  education: 'Образование',
  office: 'Офис',
  warehouse: 'Склад',
  light_production: 'Лёгкое производство',
  services: 'Услуги',
  showroom: 'Шоурум',
  entertainment: 'Развлечения',
  other: 'Иное',
  any_legal_business: 'Любой законный вид деятельности' // FLAG: judgment call, see report
};

// ---------------------------------------------------------------------------
// request_business_stage (BUSINESS_STAGES)
// ---------------------------------------------------------------------------
export const BUSINESS_STAGE_LABELS: Record<string, string> = {
  new_business: 'Новый бизнес',
  operating: 'Действующий бизнес',
  expansion: 'Расширение',
  relocation: 'Переезд',
  additional_location: 'Дополнительная точка'
};

// ---------------------------------------------------------------------------
// property_entrance_type (ENTRANCE_TYPES)
// ---------------------------------------------------------------------------
export const ENTRANCE_TYPE_LABELS: Record<string, string> = {
  separate_street: 'Отдельный вход с улицы',
  separate_yard: 'Отдельный вход со двора',
  shared: 'Общий вход',
  loading_only: 'Только для погрузки',
  none: 'Входа нет'
};

// ---------------------------------------------------------------------------
// request_entrance_requirement (ENTRANCE_REQUIREMENTS)
// ---------------------------------------------------------------------------
export const ENTRANCE_REQUIREMENT_LABELS: Record<string, string> = {
  separate_required: 'Обязателен отдельный вход',
  separate_preferred: 'Желателен отдельный вход',
  shared_allowed: 'Допустим общий вход',
  no_preference: 'Без предпочтений'
};

// ---------------------------------------------------------------------------
// property_features / request_required_features / request_excluded_features
// (PROPERTY_FEATURES)
// ---------------------------------------------------------------------------
export const PROPERTY_FEATURE_LABELS: Record<string, string> = {
  separate_entrance: 'Отдельный вход',
  display_windows: 'Витрины',
  ventilation: 'Вентиляция',
  air_conditioning: 'Кондиционирование',
  heating: 'Отопление',
  water_supply: 'Водоснабжение',
  sewerage: 'Канализация',
  signage_space: 'Место под вывеску',
  parking: 'Парковка',
  loading_zone: 'Зона погрузки/разгрузки',
  access_24_7: 'Круглосуточный доступ',
  security: 'Охрана',
  elevator: 'Лифт',
  freight_elevator: 'Грузовой лифт'
};

// ---------------------------------------------------------------------------
// request_location_priorities (LOCATION_PRIORITIES)
// ---------------------------------------------------------------------------
export const LOCATION_PRIORITY_LABELS: Record<string, string> = {
  near_home: 'Рядом с домом',
  near_customers: 'Рядом с клиентами',
  city_center: 'Центр города',
  near_metro: 'Рядом с метро',
  near_shopping_center: 'Рядом с торговым центром',
  near_business_center: 'Рядом с бизнес-центром',
  first_line: 'Первая линия домов',
  high_visibility: 'Высокая видимость и проходимость',
  parking: 'Наличие парковки',
  loading_access: 'Возможность погрузки/разгрузки'
};

// ---------------------------------------------------------------------------
// property_access_mode / request_access_mode (ACCESS_MODES)
// ---------------------------------------------------------------------------
export const ACCESS_MODE_LABELS: Record<string, string> = {
  business_hours: 'В рабочие часы',
  extended_hours: 'Расширенные часы работы',
  access_24_7: 'Круглосуточно',
  by_agreement: 'По договорённости'
};

// ---------------------------------------------------------------------------
// property_loading_access (LOADING_ACCESS_OPTIONS)
// Deliberately separate from ENTRANCE_TYPE_LABELS's `none` -- same raw value,
// different meaning ("no dedicated entrance" vs "no loading access").
// ---------------------------------------------------------------------------
export const LOADING_ACCESS_LABELS: Record<string, string> = {
  none: 'Недоступна',
  small_vehicle: 'Для легкового/малого транспорта',
  truck: 'Для грузового транспорта',
  loading_dock: 'Погрузочный док'
};

// ---------------------------------------------------------------------------
// request_floor_options (FLOOR_OPTIONS)
// Confirmed by PRODUCT (2026-08-02): ground = 1-й этаж, first = 2-й этаж --
// no longer a judgment call.
// ---------------------------------------------------------------------------
export const FLOOR_OPTION_LABELS: Record<string, string> = {
  basement: 'Подвальный этаж',
  semi_basement: 'Цокольный этаж',
  ground: '1-й этаж',
  first: '2-й этаж',
  upper: '3-й этаж и выше',
  any: 'Любой этаж'
};

// ---------------------------------------------------------------------------
// property_deal_priority / request_deal_priority (DEAL_PRIORITIES)
// ---------------------------------------------------------------------------
export const DEAL_PRIORITY_LABELS: Record<string, string> = {
  fastest_deal: 'Максимально быстрая сделка',
  balanced: 'Сбалансированный подход',
  maximum_economics: 'Максимальная экономическая выгода',
  counterparty_reliability: 'Надёжность контрагента'
};

// ---------------------------------------------------------------------------
// property_country_code / request_country_code (MVP: 'RU' only)
// ---------------------------------------------------------------------------
export const COUNTRY_CODE_LABELS: Record<string, string> = {
  RU: 'Россия'
};

// ---------------------------------------------------------------------------
// Scenario -- exact wording from 02_PRODUCT/CAMPAIGN_TECHNICAL_ASSIGNMENT.md
// section 1 ("need_tenant — «Мне нужен арендатор»"), already used verbatim
// on the goal-selection screen.
// ---------------------------------------------------------------------------
export const SCENARIO_LABELS: Record<string, string> = {
  need_tenant: 'Мне нужен арендатор',
  need_property: 'Мне нужно помещение'
};

// ---------------------------------------------------------------------------
// Technical Assignment lifecycle_status (server-computed, never client-set).
// "Campaign" translated to "кампания" in user-facing copy (2026-08-02
// revision) -- only the technical identifiers `Campaign`/`campaign_*`
// (types, variables, functions, files) stay in English; this dictionary
// only ever affects displayed text, never the raw lifecycle_status value.
// ---------------------------------------------------------------------------
export const LIFECYCLE_STATUS_LABELS: Record<string, string> = {
  draft: 'Черновик',
  ready_for_analysis: 'Готово к анализу',
  campaign_started: 'Кампания запущена'
};

// ---------------------------------------------------------------------------
// Campaign process status (apps/api/src/db/campaigns.ts CAMPAIGN_STATUSES,
// 11 values, source: LeaseMind_AI_MANAGER_ARCHITECTURE_v1.0.md section 5.3).
// FLAG: Qualifying, Deal Support, Strategy Building and Failed have no fixed
// Russian rendering in any product doc -- translated literally, see report.
// ---------------------------------------------------------------------------
export const CAMPAIGN_STATUS_LABELS: Record<string, string> = {
  Created: 'Создана',
  Analyzing: 'Анализ',
  'Strategy Building': 'Формирование стратегии', // FLAG: judgment call, see report
  Searching: 'Поиск',
  Qualifying: 'Квалификация', // FLAG: judgment call, see report
  Negotiating: 'Переговоры',
  Viewing: 'Показы',
  'Deal Support': 'Сопровождение сделки', // FLAG: judgment call, see report (reuses existing wizard copy)
  Completed: 'Завершена',
  Paused: 'Приостановлена',
  Failed: 'Не удалась' // FLAG: judgment call, see report
};

// ---------------------------------------------------------------------------
// /api/v1/health/{live,ready} status values (apps/web/src/api.ts HealthState).
// ---------------------------------------------------------------------------
export const HEALTH_STATUS_LABELS: Record<string, string> = {
  ok: 'в порядке',
  error: 'ошибка',
  checking: 'проверка…'
};

/** Looks up a Russian label for a known value; falls back to the raw value
 * only if something is missing from a dictionary above (should never
 * happen for the 30/30 Technical Assignment fields -- every option in
 * technicalAssignmentFields.ts is covered). */
export function ruLabel(dictionary: Record<string, string>, value: string): string {
  return dictionary[value] ?? value;
}
