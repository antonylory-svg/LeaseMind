// Matches only UUID v4 or v7 (version nibble 4 or 7, RFC 4122 variant nibble
// 8/9/a/b). Case-insensitive: Postgres normalizes uuid columns to lowercase
// regardless of input casing, so app-level validation accepts either.
const UUID_V4_OR_V7_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Rejects malformed strings and forbidden UUID versions (v1/v2/v3/v5/v6/v8)
 * before any SQL is executed -- the primary defense for injection-shaped
 * path parameters, since a non-UUID string never reaches the database. */
export function isUuidV4OrV7(value: string): boolean {
  return UUID_V4_OR_V7_PATTERN.test(value);
}
