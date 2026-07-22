import { afterEach, describe, expect, it, vi } from "vitest";
import { searchTracks } from "./music-search";

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      status,
      json: async () => body,
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("searchTracks", () => {
  it("maps iTunes results to TrackResult shape", async () => {
    mockFetchOnce({
      results: [
        {
          trackName: "Coastal Static",
          artistName: "Undertow Tapes",
          previewUrl: "https://example.com/preview.m4a",
          artworkUrl100: "https://example.com/art.jpg",
          trackViewUrl: "https://music.apple.com/track/123",
        },
      ],
    });

    const results = await searchTracks("coastal static");
    expect(results).toEqual([
      {
        title: "Coastal Static",
        artist: "Undertow Tapes",
        previewUrl: "https://example.com/preview.m4a",
        artworkUrl: "https://example.com/art.jpg",
        trackUrl: "https://music.apple.com/track/123",
      },
    ]);
  });

  it("drops results with no preview URL — nothing to play means nothing worth selecting", async () => {
    mockFetchOnce({
      results: [
        { trackName: "No Preview", artistName: "Someone", previewUrl: undefined },
        { trackName: "Has Preview", artistName: "Someone Else", previewUrl: "https://example.com/p.m4a" },
      ],
    });

    const results = await searchTracks("query");
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe("Has Preview");
  });

  it("throws on a non-ok response", async () => {
    mockFetchOnce({}, false, 500);
    await expect(searchTracks("query")).rejects.toThrow();
  });
});
