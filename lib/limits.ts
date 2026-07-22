export const FREE_LINK_LIMIT = 7;
// Not truly unlimited — saveProfileAction has no rate limiting today (unlike
// searchTracksAction), so a finite Pro cap keeps a soft ceiling against a
// scripted client hammering the save action.
export const PRO_LINK_LIMIT = 25;

/**
 * True if a profile save should be rejected for exceeding the link cap.
 * saveProfileAction replaces the ENTIRE link set on every save (no
 * incremental add) — a naive `incomingCount > cap` check would lock an
 * already-over-cap free user out of editing anything at all, including
 * unrelated fields. Grandfather them in place instead: only block actual
 * growth past the cap, not edits/trims of an existing over-cap set.
 */
export function exceedsLinkCap(isPro: boolean, incomingCount: number, currentPersistedCount: number): boolean {
  const cap = isPro ? PRO_LINK_LIMIT : FREE_LINK_LIMIT;
  if (incomingCount <= cap) return false;
  return incomingCount > currentPersistedCount;
}
