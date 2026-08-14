// Opaque campaign_id navigation state for the Campaign detail screen, kept
// in the URL query string only -- never localStorage/sessionStorage. Pure
// and DOM-free (URLSearchParams is a standard global in both the browser
// and Node), directly unit-testable with plain node:test. Mirrors
// technicalAssignmentUrlState.ts's `ta` param exactly, using a distinct
// `campaign` param so both can coexist in the same URL without collision.
//
// CampaignLaunchWizard.tsx always re-fetches the actual Campaign (and, if
// linked, its current post_launch_refresh Analysis Snapshot) from the
// backend on restore -- this module only carries the opaque id, never any
// Campaign/Analysis content.

const CAMPAIGN_QUERY_PARAM = 'campaign';

// Matches only UUID v4 or v7 (version nibble 4 or 7, RFC 4122 variant
// nibble 8/9/a/b) -- mirrors apps/api/src/uuid.ts's isUuidV4OrV7 exactly, so
// a malformed or forbidden-version value from the URL is never trusted
// enough to attempt a fetch or land in restored state; the backend
// re-validates independently regardless.
const UUID_V4_OR_V7_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isLikelyCampaignId(value: string): boolean {
  return UUID_V4_OR_V7_PATTERN.test(value);
}

export function getCampaignIdFromSearch(search: string): string | null {
  return new URLSearchParams(search).get(CAMPAIGN_QUERY_PARAM);
}

export function buildSearchWithCampaignId(search: string, campaignId: string): string {
  const params = new URLSearchParams(search);
  params.set(CAMPAIGN_QUERY_PARAM, campaignId);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function buildSearchWithoutCampaignId(search: string): string {
  const params = new URLSearchParams(search);
  params.delete(CAMPAIGN_QUERY_PARAM);
  const query = params.toString();
  return query ? `?${query}` : '';
}

// H2 corrective pass: CampaignLaunchWizard.tsx also restores a Technical
// Assignment from a `ta` id in the URL (technicalAssignmentUrlState.ts). A
// `campaign` id only takes priority over that `ta` restore -- suppressing
// it -- when it is actually a supported, well-formed Campaign id; a
// malformed one must never block `ta` restore (it is stripped from the URL
// instead, see buildSearchWithoutCampaignId above). Kept here, alongside
// isLikelyCampaignId/getCampaignIdFromSearch, so the wizard's initial
// `restoring` state and its `ta`-restore effect guard both call the exact
// same pure, directly unit-tested decision -- not two hand-copied
// conditions that could silently drift apart.
export function campaignRestoreTakesPriority(search: string): boolean {
  const campaignId = getCampaignIdFromSearch(search);
  return campaignId !== null && isLikelyCampaignId(campaignId);
}
