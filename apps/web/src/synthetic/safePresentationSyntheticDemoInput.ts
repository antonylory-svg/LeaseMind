import type { SafePresentationSyntheticInput } from './safePresentationSyntheticViewModel.js';

export const SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT = {
  recipient: 'SYNTHETIC_RECIPIENT_A',
  audience: 'SYNTHETIC_AUDIENCE_A',
  purpose: 'SYNTHETIC_PURPOSE_STATIC_RENDER_TEST',
  locale: 'x-leasemind-synthetic',
  heading: 'SYNTHETIC_HEADING',
  message: 'SYNTHETIC_MESSAGE',
  stale: false,
  revoked: false,
  hash_matches: true,
  binding_matches: true
} as const satisfies SafePresentationSyntheticInput;
