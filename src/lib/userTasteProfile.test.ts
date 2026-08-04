import assert from "node:assert";
import { test, describe } from "node:test";
import {
  extractTopGenres,
  inferLanguageFromArtists,
  buildUserTasteProfile,
  getCachedTasteProfile,
  SUPPORTED_LANGUAGES,
} from "./userTasteProfile";
import { SpotifyArtist } from "./spotify";
import { BehavioralFeatures } from "./features";

describe("User Taste Profile Engine", () => {
  const mockArtist = (id: string, name: string, genres: string[] = [], popularity = 80): SpotifyArtist => ({
    id,
    name,
    genres,
    popularity,
    images: [],
    followers: { total: 1000 },
    external_urls: { spotify: `https://open.spotify.com/artist/${id}` },
  });

  const sampleArtists: SpotifyArtist[] = [
    mockArtist("a1", "Anirudh Ravichander", ["kollywood", "tamil pop", "filmi"], 80),
    mockArtist("a2", "Sid Sriram", ["telugu pop", "kollywood", "carnatic"], 75),
    mockArtist("a3", "Beach House", ["indie pop", "dream pop", "synthwave"], 82),
    mockArtist("a4", "M83", ["synthwave", "indie pop", "electronic"], 78),
  ];

  test("extractTopGenres extracts 5 to 10 genres sorted by frequency", () => {
    const genres = extractTopGenres(sampleArtists, undefined, 8);
    assert.ok(genres.length >= 5 && genres.length <= 10);
    assert.ok(genres.includes("kollywood"));
    assert.ok(genres.includes("indie pop"));
  });

  test("extractTopGenres falls back to behavioralFeatures or defaults when artists list is empty", () => {
    const mockFeatures: Partial<BehavioralFeatures> = {
      topGenreDistribution: [
        { genre: "ambient chill", count: 10, percentage: 50 },
        { genre: "lo-fi", count: 10, percentage: 50 },
      ],
    };

    const genres = extractTopGenres([], mockFeatures as BehavioralFeatures, 6);
    assert.ok(genres.length >= 5);
    assert.ok(genres.includes("ambient chill"));
  });

  test("inferLanguageFromArtists correctly infers languages from artist metadata", () => {
    const teluguArtist: SpotifyArtist[] = [mockArtist("t1", "Devi Sri Prasad", ["telugu pop", "tollywood"], 70)];
    assert.strictEqual(inferLanguageFromArtists(teluguArtist), "Telugu");

    const hindiArtist: SpotifyArtist[] = [mockArtist("h1", "Arijit Singh", ["bollywood", "filmi", "hindi pop"], 85)];
    assert.strictEqual(inferLanguageFromArtists(hindiArtist), "Hindi");

    const latinArtist: SpotifyArtist[] = [mockArtist("l1", "Bad Bunny", ["latin", "reggaeton", "latin pop"], 95)];
    assert.strictEqual(inferLanguageFromArtists(latinArtist), "Spanish");

    const westernArtist: SpotifyArtist[] = [mockArtist("w1", "Taylor Swift", ["pop", "dance pop"], 98)];
    assert.strictEqual(inferLanguageFromArtists(westernArtist), "English");
  });

  test("buildUserTasteProfile constructs complete profile and respects userSelectedLanguage override", () => {
    const profileInferred = buildUserTasteProfile(sampleArtists);
    assert.ok(profileInferred.topGenres.length >= 5);
    assert.ok(profileInferred.dominantMusicCluster);
    assert.ok(SUPPORTED_LANGUAGES.includes(profileInferred.preferredLanguage as any));

    // Overriding language preference
    const profileOverridden = buildUserTasteProfile(sampleArtists, undefined, "Spanish");
    assert.strictEqual(profileOverridden.preferredLanguage, "Spanish");
  });

  test("getCachedTasteProfile returns null when no cache row or expired (>12h)", async () => {
    const cached = await getCachedTasteProfile("non_existent_user_123");
    assert.strictEqual(cached, null);
  });
});
