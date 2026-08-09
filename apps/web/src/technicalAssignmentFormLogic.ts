// Pure, framework-free logic for the Technical Assignment form: decimal
// input parsing (comma/dot), boolean tri-state resolution, and missing
// required field reporting. Kept separate from CampaignLaunchWizard.tsx so
// it is testable with plain node:test (no DOM, no React renderer).

import type { TAFieldDef, TADecimalLimits } from './technicalAssignmentFields';

// ---------------------------------------------------------------------------
// Decimal input (comma or dot separator)
// ---------------------------------------------------------------------------

export type DecimalParseResult = { kind: 'empty' } | { kind: 'value'; value: number } | { kind: 'invalid' };

// Accepts digits with at most one '.' or ',' separator -- never a sign, never
// more than one separator, never letters. Bounds and decimal precision come
// solely from `limits`, which callers must source from the field's actual
// backend validation spec (apps/api/src/db/technicalAssignmentValidation.ts)
// -- this function never invents its own min/max.
const DECIMAL_SHAPE = /^\d+([.,]\d+)?$/;

export function parseDecimalInput(raw: string, limits: TADecimalLimits): DecimalParseResult {
  const trimmed = raw.trim();
  if (trimmed === '') return { kind: 'empty' };
  if (!DECIMAL_SHAPE.test(trimmed)) return { kind: 'invalid' };

  const normalized = trimmed.replace(',', '.');
  const value = Number(normalized);
  if (!Number.isFinite(value)) return { kind: 'invalid' };
  if (value < limits.min || value > limits.max) return { kind: 'invalid' };

  const fractionalPart = normalized.includes('.') ? normalized.split('.')[1] : '';
  if (fractionalPart.length > limits.decimals) return { kind: 'invalid' };

  const scale = 10 ** limits.decimals;
  const rounded = Math.round(value * scale) / scale;
  return { kind: 'value', value: rounded };
}

/** Russian display convention: dot -> comma. Only for display; the value
 * transmitted to the API is always the plain number from parseDecimalInput. */
export function formatDecimalForDisplay(value: number): string {
  return String(value).replace('.', ',');
}

/** Rebuilds the decimal-field display state (rawText/invalid/touched) from
 * a Technical Assignment payload just fetched from the backend -- used when
 * restoring a Technical Assignment after a reload or a return to an old tab
 * (CampaignLaunchWizard.tsx), so decimal fields show their saved value
 * instead of appearing blank even though formValues already has the number.
 * Mirrors handleDecimalBlur's own formatting exactly. Fields with no stored
 * value are omitted (left blank), not defaulted to 0. */
export function hydrateDecimalState(
  fields: readonly TAFieldDef[],
  payload: Record<string, unknown>
): Record<string, { rawText: string; invalid: boolean; touched: boolean }> {
  const result: Record<string, { rawText: string; invalid: boolean; touched: boolean }> = {};
  for (const field of fields) {
    if (field.kind !== 'decimal') continue;
    const value = payload[field.fieldId];
    if (typeof value === 'number') {
      result[field.fieldId] = { rawText: formatDecimalForDisplay(value), invalid: false, touched: true };
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Boolean tri-state ("Да" / "Нет" / not answered)
// ---------------------------------------------------------------------------

export type BooleanChoice = 'yes' | 'no' | null;

/** `null` (not answered) maps to `undefined`, never `false` -- an
 * unanswered required boolean must stay absent from the saved payload, not
 * silently become a negative answer. */
export function resolveBooleanChoice(choice: BooleanChoice): boolean | undefined {
  if (choice === 'yes') return true;
  if (choice === 'no') return false;
  return undefined;
}

export function booleanChoiceFromValue(value: unknown): BooleanChoice {
  if (value === true) return 'yes';
  if (value === false) return 'no';
  return null;
}

// ---------------------------------------------------------------------------
// Multi-value tag input (property_districts, request_districts, request_cities)
// ---------------------------------------------------------------------------

/** Adds `raw` (trimmed) to `current` unless it is empty or already present
 * (exact match) -- the client-side half of "no empty values, no
 * duplicates" for multi-value fields. The server independently rejects
 * duplicate/empty array entries too (technicalAssignmentValidation.ts,
 * 'string_array' kind); this only avoids sending them in the first place. */
export function addStringArrayToken(current: readonly string[], raw: string): string[] {
  const trimmed = raw.trim();
  if (trimmed === '' || current.includes(trimmed)) return [...current];
  return [...current, trimmed];
}

export function removeStringArrayToken(current: readonly string[], value: string): string[] {
  return current.filter(v => v !== value);
}

/** Splits text typed into a tag input on commas: every comma-terminated
 * segment is committed as a token (via addStringArrayToken) immediately;
 * whatever remains after the last comma becomes the new draft text. Returns
 * `values: null` when `raw` has no comma yet, so the caller can tell "still
 * typing" apart from "a token was just committed" without a redundant
 * array update on every keystroke. */
export function splitStringArrayInput(current: readonly string[], raw: string): { values: string[] | null; draft: string } {
  if (!raw.includes(',')) return { values: null, draft: raw };
  const parts = raw.split(',');
  const draft = parts.pop() ?? '';
  let values = [...current];
  for (const part of parts) {
    values = addStringArrayToken(values, part);
  }
  return { values, draft };
}

// ---------------------------------------------------------------------------
// Missing required fields
// ---------------------------------------------------------------------------

function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

/** Fields whose current value is absent, given the field list's own
 * `required` flag -- used both to report after a draft save and to compute
 * the "Далее (Анализ)" gate independently of the server round-trip. */
export function computeMissingRequiredFields(fields: readonly TAFieldDef[], payload: Record<string, unknown>): TAFieldDef[] {
  return fields.filter(field => field.required && isEmptyValue(payload[field.fieldId]));
}

export function isReadyForAnalysis(lifecycleStatus: string | undefined): boolean {
  return lifecycleStatus === 'ready_for_analysis';
}

// ---------------------------------------------------------------------------
// Rent display: rate-per-sqm <-> total monthly rent.
//
// UI-only convenience for entering `property_monthly_rent_rub` (the only
// value ever stored or sent -- see PROPERTY_FIELD_SPECS in
// apps/api/src/db/technicalAssignmentValidation.ts). "Rate per sqm" is not a
// field_id, not persisted, and not sent to the API on its own; it only ever
// exists to compute the real total before it is written into formValues.
// Formulas are fixed by product decision and MUST NOT change:
//   total = rate * area
//   rate  = total / area
// ---------------------------------------------------------------------------

export function computeTotalRentFromRate(ratePerSqm: number, areaSqm: number): number {
  return Math.round(ratePerSqm * areaSqm);
}

export function computeRatePerSqmFromTotal(totalRentRub: number, areaSqm: number): number {
  return totalRentRub / areaSqm;
}

/** Russian thousands grouping (U+00A0 non-breaking space), e.g. 400000 -> "400 000". */
export function formatThousands(value: number): string {
  return Math.round(value).toLocaleString('ru-RU');
}
