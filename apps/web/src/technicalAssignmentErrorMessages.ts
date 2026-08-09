// Translates a Technical Assignment save failure (safe_error_code + field_id
// from apps/api/src/app.ts's 400 response) into a specific, human Russian
// explanation -- never showing the raw field_id or error code to the user.
//
// The backend (apps/api/src/db/technicalAssignmentValidation.ts) only ever
// returns the FIRST violated rule (see saveTechnicalAssignmentDraft's
// `crossFieldErrors[0]` in apps/api/src/db/technicalAssignment.ts) and never
// says which of several possible sub-conditions under that rule actually
// fired. To give an accurate, specific message, this module re-derives the
// exact cause from the same payload the user just submitted, using the
// *same* conditions as the backend's validatePropertyCrossFieldRules /
// validateTenantRequestCrossFieldRules (doc 02_PRODUCT/CAMPAIGN_TECHNICAL_ASSIGNMENT.md
// section 7.4 / 8.4) -- purely for display. It never changes what is valid;
// the server remains the sole authority on that.

import type { TAFieldDef } from './technicalAssignmentFields';
import { BUSINESS_CATEGORY_LABELS, PROPERTY_FEATURE_LABELS, FLOOR_OPTION_LABELS, ruLabel } from './ruLabels';

export interface SaveErrorExplanation {
  message: string;
  highlightFieldIds: string[];
}

function labelOf(fields: readonly TAFieldDef[], fieldId: string): string {
  return fields.find(f => f.fieldId === fieldId)?.label ?? fieldId;
}

function quoted(values: string[]): string {
  return values.map(v => `«${v}»`).join(', ');
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

function categoryLabels(values: string[]): string[] {
  return values.map(v => ruLabel(BUSINESS_CATEGORY_LABELS, v));
}

function featureLabels(values: string[]): string[] {
  return values.map(v => ruLabel(PROPERTY_FEATURE_LABELS, v));
}

const GENERIC_UNAVAILABLE_MESSAGE = 'Не удалось сохранить Техническое задание: сервис временно недоступен.';

/** Shared "*_other" pattern: property_type_other, property_business_category_other,
 * request_business_category_other, request_property_type_other -- doc 7.2/8.2
 * "Условно [обязательно]" fields tied to an `other` choice elsewhere. */
function explainOtherField(code: string, fieldId: string, fields: readonly TAFieldDef[]): SaveErrorExplanation | null {
  if (!fieldId.endsWith('_other')) return null;
  const label = labelOf(fields, fieldId);
  if (code === 'TECHNICAL_ASSIGNMENT_REQUIRED_FIELD_MISSING') {
    return {
      message: `Вы выбрали «Иное», но не указали уточнение в поле «${label}». Заполните это поле.`,
      highlightFieldIds: [fieldId]
    };
  }
  if (code === 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT') {
    return {
      message: `Поле «${label}» заполнено, но вариант «Иное» нигде не выбран. Либо выберите «Иное», либо очистите это поле.`,
      highlightFieldIds: [fieldId]
    };
  }
  return null;
}

function explainPropertyError(code: string, fieldId: string, payload: Record<string, unknown>, fields: readonly TAFieldDef[]): SaveErrorExplanation | null {
  const allowed = asStringArray(payload.property_allowed_business_categories);
  const excluded = asStringArray(payload.property_excluded_business_categories);
  const target = asStringArray(payload.property_target_tenant_categories);
  // Mirrors technicalAssignmentValidation.ts's allowsAnyLegalBusiness
  // (2026-08-03 fix): the wildcard covers every specific category, so it no
  // longer needs to be duplicated into `target` to be considered "allowed".
  const allowsAnyLegalBusiness = allowed.includes('any_legal_business');

  if (fieldId === 'property_excluded_business_categories' && code === 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT') {
    const overlap = categoryLabels(excluded.filter(c => allowed.includes(c)));
    return {
      message: `Категори${overlap.length === 1 ? 'я' : 'и'} ${quoted(overlap)} указана одновременно как допустимая и как недопустимая для арендатора. Оставьте её только в одном из списков.`,
      highlightFieldIds: ['property_allowed_business_categories', 'property_excluded_business_categories']
    };
  }

  if (fieldId === 'property_target_tenant_categories' && code === 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT') {
    // Only reachable when the wildcard is NOT covering the extra
    // categories (see the note above), so allowsAnyLegalBusiness is always
    // false here -- kept explicit for clarity and to stay correct even if
    // that invariant ever changes.
    const extra = categoryLabels(target.filter(c => !allowsAnyLegalBusiness && !allowed.includes(c)));
    return {
      message: `Предпочтительная категория ${quoted(extra)} не входит в список допустимых категорий деятельности. Добавьте её туда (или выберите «Любой законный вид деятельности») либо уберите из предпочтительных.`,
      highlightFieldIds: ['property_allowed_business_categories', 'property_target_tenant_categories']
    };
  }

  if (fieldId === 'property_allowed_business_categories' && code === 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT') {
    const otherAllowed = categoryLabels(allowed.filter(c => c !== 'any_legal_business'));
    const clauses: string[] = [];
    const highlightFieldIds = ['property_allowed_business_categories'];
    if (otherAllowed.length > 0) {
      clauses.push(`с другими допустимыми категориями (сейчас также выбрано: ${quoted(otherAllowed)})`);
    }
    if (excluded.length > 0) {
      clauses.push(`со списком недопустимых категорий (${quoted(categoryLabels(excluded))})`);
      highlightFieldIds.push('property_excluded_business_categories');
    }
    // Preferred (target) categories are no longer part of this conflict on
    // their own -- the wildcard covers them. If target is also causing a
    // problem, that is because it overlaps `excluded`, already covered by
    // the exclusion clause above.
    return {
      message: `«Любой законный вид деятельности» нельзя сочетать ${clauses.join(', а также ')}. Либо оставьте только «Любой законный вид деятельности», либо уберите его и выберите конкретные категории.`,
      highlightFieldIds
    };
  }

  // Land-type conflict is checked before floor>total_floors on purpose: the
  // backend evaluates its land-type loop first (technicalAssignmentValidation.ts,
  // before the floor>total_floors check), so for a land-type object with
  // property_floor set, field_id='property_floor' always means THIS rule,
  // never the floor>total_floors one below.
  if (
    payload.property_type === 'land' &&
    ['property_floor', 'property_total_floors', 'property_ceiling_height_m', 'property_entrance_type'].includes(fieldId) &&
    code === 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT'
  ) {
    return {
      message: `Для земельного участка поле «${labelOf(fields, fieldId)}» не заполняется. Очистите его или выберите другой тип объекта.`,
      highlightFieldIds: [fieldId, 'property_type']
    };
  }

  if (fieldId === 'property_floor' && code === 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT') {
    const floor = payload.property_floor as number | null | undefined;
    const totalFloors = payload.property_total_floors as number | null | undefined;
    return {
      message: `Этаж (${floor}) не может быть больше этажности здания (${totalFloors}). Проверьте эти значения.`,
      highlightFieldIds: ['property_floor', 'property_total_floors']
    };
  }

  if (fieldId === 'property_features' && code === 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT') {
    const features = asStringArray(payload.property_features);
    if (features.includes('parking') && payload.property_parking_spaces === 0) {
      return {
        message: `Среди характеристик отмечена «${ruLabel(PROPERTY_FEATURE_LABELS, 'parking')}», но число парковочных мест указано как 0. Укажите число мест больше нуля или уберите эту отметку.`,
        highlightFieldIds: ['property_features', 'property_parking_spaces']
      };
    }
    if (features.includes('loading_zone') && payload.property_loading_access === 'none') {
      return {
        message: `Среди характеристик отмечена «${ruLabel(PROPERTY_FEATURE_LABELS, 'loading_zone')}», но возможность погрузки указана как «Недоступна». Выберите другой вариант погрузки или уберите эту отметку.`,
        highlightFieldIds: ['property_features', 'property_loading_access']
      };
    }
    return {
      message: `Среди характеристик объекта есть конфликт (${quoted(featureLabels(features))}). Проверьте отмеченные характеристики и связанные с ними поля.`,
      highlightFieldIds: ['property_features']
    };
  }

  return null;
}

function explainTenantRequestError(code: string, fieldId: string, payload: Record<string, unknown>): SaveErrorExplanation | null {
  if (fieldId === 'request_area_min_sqm' && code === 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT') {
    const min = payload.request_area_min_sqm as number | null | undefined;
    const max = payload.request_area_max_sqm as number | null | undefined;
    return {
      message: `Минимальная площадь (${min} м²) не может быть больше максимальной (${max} м²). Проверьте эти значения.`,
      highlightFieldIds: ['request_area_min_sqm', 'request_area_max_sqm']
    };
  }

  if (fieldId === 'request_excluded_features' && code === 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT') {
    const required = asStringArray(payload.request_required_features);
    const excluded = asStringArray(payload.request_excluded_features);
    const overlap = featureLabels(excluded.filter(f => required.includes(f)));
    return {
      message: `Характеристик${overlap.length === 1 ? 'а' : 'и'} ${quoted(overlap)} указана одновременно как обязательная и как недопустимая. Оставьте её только в одном из списков.`,
      highlightFieldIds: ['request_required_features', 'request_excluded_features']
    };
  }

  if (fieldId === 'request_floor_options' && code === 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT') {
    const floorOptions = asStringArray(payload.request_floor_options);
    const others = floorOptions.filter(f => f !== 'any').map(f => ruLabel(FLOOR_OPTION_LABELS, f));
    return {
      message: `Вариант «${ruLabel(FLOOR_OPTION_LABELS, 'any')}» нельзя сочетать с другими вариантами этажей (сейчас также выбрано: ${quoted(others)}). Оставьте только «${ruLabel(FLOOR_OPTION_LABELS, 'any')}» либо выберите конкретные этажи.`,
      highlightFieldIds: ['request_floor_options']
    };
  }

  if (fieldId === 'request_business_category' && code === 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT') {
    return {
      message: `Категория бизнеса «${ruLabel(BUSINESS_CATEGORY_LABELS, 'any_legal_business')}» недоступна при поиске помещения. Выберите конкретную категорию бизнеса.`,
      highlightFieldIds: ['request_business_category']
    };
  }

  return null;
}

/** Field-specific text for a still-empty *required* field (shown in the
 * post-save "заполнено не полностью" list) -- falls back to the plain field
 * label for every field without a dedicated message. */
export function explainMissingRequiredField(fieldId: string, defaultLabel: string): string {
  if (fieldId === 'property_allowed_business_categories') {
    return 'Укажите хотя бы одну допустимую категорию арендатора.';
  }
  return defaultLabel;
}

export function explainTechnicalAssignmentError(
  code: string,
  fieldId: string | null,
  payload: Record<string, unknown>,
  fields: readonly TAFieldDef[]
): SaveErrorExplanation {
  if (code === 'TECHNICAL_ASSIGNMENT_SCENARIO_IMMUTABLE') {
    return {
      message: 'Это Техническое задание уже создано для другого сценария и не может сменить его. Обновите страницу и начните заново.',
      highlightFieldIds: []
    };
  }
  if (code === 'TECHNICAL_ASSIGNMENT_STATE_INVALID') {
    return {
      message: 'Это Техническое задание уже связано с запущенной кампанией и больше не редактируется.',
      highlightFieldIds: []
    };
  }
  if (code === 'TECHNICAL_ASSIGNMENT_REVISION_CONFLICT') {
    return {
      message: 'Техническое задание изменилось в другой вкладке или после последнего сохранения. Ваши введённые значения сохранены на экране — обновите страницу, проверьте актуальную версию и повторите изменения.',
      highlightFieldIds: []
    };
  }
  if (!fieldId) {
    return { message: GENERIC_UNAVAILABLE_MESSAGE, highlightFieldIds: [] };
  }

  const label = labelOf(fields, fieldId);

  const otherFieldExplanation = explainOtherField(code, fieldId, fields);
  if (otherFieldExplanation) return otherFieldExplanation;

  const propertyExplanation = explainPropertyError(code, fieldId, payload, fields);
  if (propertyExplanation) return propertyExplanation;

  const tenantExplanation = explainTenantRequestError(code, fieldId, payload);
  if (tenantExplanation) return tenantExplanation;

  if (code === 'TECHNICAL_ASSIGNMENT_REQUIRED_FIELD_MISSING') {
    return { message: `Заполните обязательное поле «${label}».`, highlightFieldIds: [fieldId] };
  }
  if (code === 'TECHNICAL_ASSIGNMENT_PERSONAL_DATA_FORBIDDEN') {
    return {
      message: `В поле «${label}» обнаружены запрещённые данные (контакты, ссылки или другая личная информация). Уберите их и опишите условия без личных данных.`,
      highlightFieldIds: [fieldId]
    };
  }
  if (code === 'TECHNICAL_ASSIGNMENT_SECRET_FORBIDDEN') {
    return {
      message: `В поле «${label}» обнаружены данные, похожие на пароль или ключ доступа. Уберите их.`,
      highlightFieldIds: [fieldId]
    };
  }
  if (code === 'TECHNICAL_ASSIGNMENT_FIELD_TYPE_INVALID' || code === 'TECHNICAL_ASSIGNMENT_FIELD_VALUE_INVALID') {
    return { message: `Проверьте значение в поле «${label}» — оно не подходит по формату или диапазону.`, highlightFieldIds: [fieldId] };
  }
  if (code === 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT') {
    return { message: `В поле «${label}» есть конфликт со значением другого поля. Проверьте связанные поля.`, highlightFieldIds: [fieldId] };
  }

  return { message: GENERIC_UNAVAILABLE_MESSAGE, highlightFieldIds: [] };
}
