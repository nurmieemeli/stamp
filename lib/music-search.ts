export type TrackResult = {
  title: string;
  artist: string;
  previewUrl: string;
  artworkUrl: string;
  trackUrl: string;
};

type ITunesTrack = {
  trackName?: string;
  artistName?: string;
  previewUrl?: string;
  artworkUrl100?: string;
  trackViewUrl?: string;
};

type ITunesSearchResponse = {
  results: ITunesTrack[];
};

const ITUNES_SEARCH_URL = "https://itunes.apple.com/search";
const RESULT_LIMIT = 8;

/**
 * Free, unauthenticated track search with 30-second preview URLs — no API
 * key or developer account needed, unlike Spotify's Web API (whose preview
 * URLs are also no longer reliably available on many access tiers).
 */
export async function searchTracks(query: string): Promise<TrackResult[]> {
  const url = new URL(ITUNES_SEARCH_URL);
  url.searchParams.set("term", query);
  url.searchParams.set("media", "music");
  url.searchParams.set("entity", "song");
  url.searchParams.set("limit", String(RESULT_LIMIT));

  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) {
    throw new Error(`iTunes search failed with status ${res.status}`);
  }

  const data = (await res.json()) as ITunesSearchResponse;

  return data.results
    .filter((t): t is Required<Pick<ITunesTrack, "trackName" | "artistName" | "previewUrl">> & ITunesTrack =>
      Boolean(t.trackName && t.artistName && t.previewUrl),
    )
    .map((t) => ({
      title: t.trackName,
      artist: t.artistName,
      previewUrl: t.previewUrl,
      artworkUrl: t.artworkUrl100 ?? "",
      trackUrl: t.trackViewUrl ?? "",
    }));
}
