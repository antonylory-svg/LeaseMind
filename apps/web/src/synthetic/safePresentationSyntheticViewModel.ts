export const SYNTHETIC_PRESENTATION_WATERMARK = 'SYNTHETIC REFERENCE — NOT PRODUCTION APPROVED' as const;
export const SYNTHETIC_PRESENTATION_BLOCKED = 'SYNTHETIC PRESENTATION BLOCKED' as const;

const EXPECTED_KEYS = [
  'audience',
  'binding_matches',
  'hash_matches',
  'heading',
  'locale',
  'message',
  'purpose',
  'recipient',
  'revoked',
  'stale'
] as const;

export interface SafePresentationSyntheticInput {
  recipient: 'SYNTHETIC_RECIPIENT_A';
  audience: 'SYNTHETIC_AUDIENCE_A';
  purpose: 'SYNTHETIC_PURPOSE_STATIC_RENDER_TEST';
  locale: 'x-leasemind-synthetic';
  heading: 'SYNTHETIC_HEADING';
  message: 'SYNTHETIC_MESSAGE';
  stale: boolean;
  revoked: boolean;
  hash_matches: boolean;
  binding_matches: boolean;
}

export type SafePresentationSyntheticViewModel =
  | {
      kind: 'ready';
      watermark: typeof SYNTHETIC_PRESENTATION_WATERMARK;
      heading: 'SYNTHETIC_HEADING';
      message: 'SYNTHETIC_MESSAGE';
    }
  | {
      kind: 'blocked';
      presentation: typeof SYNTHETIC_PRESENTATION_BLOCKED;
    };

function hasExactClosedShape(value: unknown): value is SafePresentationSyntheticInput {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  if (keys.length !== EXPECTED_KEYS.length || keys.some((key, index) => key !== EXPECTED_KEYS[index])) return false;

  return record.recipient === 'SYNTHETIC_RECIPIENT_A'
    && record.audience === 'SYNTHETIC_AUDIENCE_A'
    && record.purpose === 'SYNTHETIC_PURPOSE_STATIC_RENDER_TEST'
    && record.locale === 'x-leasemind-synthetic'
    && record.heading === 'SYNTHETIC_HEADING'
    && record.message === 'SYNTHETIC_MESSAGE'
    && typeof record.stale === 'boolean'
    && typeof record.revoked === 'boolean'
    && typeof record.hash_matches === 'boolean'
    && typeof record.binding_matches === 'boolean';
}

export function projectSafePresentationSynthetic(value: unknown): SafePresentationSyntheticViewModel {
  if (!hasExactClosedShape(value)
      || value.stale
      || value.revoked
      || !value.hash_matches
      || !value.binding_matches) {
    return { kind: 'blocked', presentation: SYNTHETIC_PRESENTATION_BLOCKED };
  }

  return {
    kind: 'ready',
    watermark: SYNTHETIC_PRESENTATION_WATERMARK,
    heading: value.heading,
    message: value.message
  };
}
