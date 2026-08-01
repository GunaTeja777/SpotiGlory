import assert from "node:assert";
import { test, describe } from "node:test";
import { computeBehavioralFeatures } from "./features";
import { SpotifyArtist, SpotifyTrack, SpotifyPlayHistory } from "./spotify";

describe("Feature Engineering Module (computeBehavioralFeatures)", () => {
  test("handles empty inputs gracefully without NaN or division errors", () => {
    const res = computeBehavioralFeatures([], [], [], [], []);
    assert.strictEqual(res.genreDiversity.shannonEntropy, 0);
    assert.strictEqual(res.genreDiversity.normalizedEntropy, 0);
    assert.strictEqual(res.genreDiversity.uniqueGenreCount, 0);
    assert.strictEqual(res.topGenreDistribution.length, 0);
    assert.strictEqual(res.listeningHourDistribution.length, 24);
    assert.strictEqual(res.listeningDayDistribution.length, 7);
    assert.strictEqual(res.nightListenerRatio, 0);
    assert.strictEqual(res.artistLoyalty, 1);
    assert.strictEqual(res.avgArtistPopularity, 0);
    assert.strictEqual(res.genreSpreadAcrossTimeRanges.stabilityScore, 1);
    assert.strictEqual(res.recencyConcentration, 0);
  });

  test("calculates Shannon Entropy correctly for uniform distributions", () => {
    // 2 equal genres (50% rock, 50% pop) -> H = - (0.5 * log2(0.5) + 0.5 * log2(0.5)) = 1.0 bit
    const mockArtists: SpotifyArtist[] = [
      {
        id: "1",
        name: "Artist A",
        genres: ["rock"],
        images: [],
        followers: { total: 100 },
        popularity: 80,
        external_urls: { spotify: "" },
      },
      {
        id: "2",
        name: "Artist B",
        genres: ["pop"],
        images: [],
        followers: { total: 200 },
        popularity: 90,
        external_urls: { spotify: "" },
      },
    ];

    const res = computeBehavioralFeatures([], mockArtists, [], [], []);
    assert.strictEqual(res.genreDiversity.shannonEntropy, 1);
    assert.strictEqual(res.genreDiversity.normalizedEntropy, 1);
    assert.strictEqual(res.genreDiversity.uniqueGenreCount, 2);
    assert.strictEqual(res.avgArtistPopularity, 85);
  });

  test("calculates Shannon Entropy as 0 for a single genre", () => {
    const mockArtists: SpotifyArtist[] = [
      {
        id: "1",
        name: "Artist A",
        genres: ["synthwave", "synthwave"],
        images: [],
        followers: { total: 100 },
        popularity: 70,
        external_urls: { spotify: "" },
      },
    ];

    const res = computeBehavioralFeatures([], mockArtists, [], [], []);
    assert.strictEqual(res.genreDiversity.shannonEntropy, 0);
    assert.strictEqual(res.genreDiversity.normalizedEntropy, 0);
    assert.strictEqual(res.genreDiversity.uniqueGenreCount, 1);
  });

  test("buckets timestamps correctly for peak hour and night listener ratio", () => {
    const mockRecentlyPlayed: SpotifyPlayHistory[] = [
      {
        track: { id: "t1" } as any,
        played_at: "2026-08-01T23:15:00Z", // 23:00 Night
      },
      {
        track: { id: "t2" } as any,
        played_at: "2026-08-01T02:30:00Z", // 02:00 Night
      },
      {
        track: { id: "t3" } as any,
        played_at: "2026-08-01T14:00:00Z", // 14:00 Day
      },
    ];

    const res = computeBehavioralFeatures([], [], mockRecentlyPlayed, [], []);
    // 2 out of 3 streams are night streams -> 67%
    assert.strictEqual(res.nightListenerRatio, 67);
  });

  test("computes artist loyalty correctly", () => {
    // 2 tracks by the exact same artist -> 1 unique artist / 2 appearances = 0.5
    const mockTracks: SpotifyTrack[] = [
      {
        id: "t1",
        name: "Song 1",
        artists: [{ id: "artist-1", name: "Daft Punk" }],
        album: { id: "a1", name: "Discovery", images: [] },
        duration_ms: 200000,
        popularity: 90,
        explicit: false,
        preview_url: null,
        external_urls: { spotify: "" },
      },
      {
        id: "t2",
        name: "Song 2",
        artists: [{ id: "artist-1", name: "Daft Punk" }],
        album: { id: "a1", name: "Discovery", images: [] },
        duration_ms: 210000,
        popularity: 88,
        explicit: false,
        preview_url: null,
        external_urls: { spotify: "" },
      },
    ];

    const res = computeBehavioralFeatures(mockTracks, [], [], [], []);
    assert.strictEqual(res.artistLoyalty, 0.5);
  });

  test("computes genre spread Jaccard similarity between short-term and long-term artists", () => {
    // Short term: ["rock", "pop"]
    // Long term: ["pop", "jazz"]
    // Overlap = ["pop"] (1), Union = ["rock", "pop", "jazz"] (3) -> 1/3 = 0.333
    const shortArtists: SpotifyArtist[] = [
      { id: "1", name: "A", genres: ["rock", "pop"], images: [], followers: { total: 0 }, popularity: 50, external_urls: { spotify: "" } },
    ];
    const longArtists: SpotifyArtist[] = [
      { id: "2", name: "B", genres: ["pop", "jazz"], images: [], followers: { total: 0 }, popularity: 50, external_urls: { spotify: "" } },
    ];

    const res = computeBehavioralFeatures([], [], [], shortArtists, longArtists);
    assert.strictEqual(res.genreSpreadAcrossTimeRanges.stabilityScore, 0.333);
    assert.strictEqual(res.genreSpreadAcrossTimeRanges.overlapCount, 1);
  });

  test("computes recency concentration correctly", () => {
    const topTracks: SpotifyTrack[] = [
      { id: "track-100", name: "Track 100" } as any,
    ];
    const recentlyPlayed: SpotifyPlayHistory[] = [
      { track: { id: "track-100" } as any, played_at: "2026-08-01T10:00:00Z" },
      { track: { id: "track-200" } as any, played_at: "2026-08-01T11:00:00Z" },
    ];

    const res = computeBehavioralFeatures(topTracks, [], recentlyPlayed, [], []);
    // 1 of 2 recently played tracks is in top tracks -> 0.5
    assert.strictEqual(res.recencyConcentration, 0.5);
  });
});
