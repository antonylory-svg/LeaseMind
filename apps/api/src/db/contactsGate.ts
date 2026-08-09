// Synthetic-only Contacts Gate evidence (ADR-0008 section 2). A real
// consent/contact record is an explicit Launch blocker and is not built
// here. This fixed server-side literal is the only value the launch
// command accepts -- the client cannot "declare" the gate passed by
// sending arbitrary text, only by sending exactly this marker, which the
// frontend only ever sends after the synthetic Contacts screen.

export const SYNTHETIC_CONTACTS_GATE_EVIDENCE = 'synthetic-fixture-acknowledged-v1';

export function isValidContactsGateEvidence(value: unknown): boolean {
  return value === SYNTHETIC_CONTACTS_GATE_EVIDENCE;
}
