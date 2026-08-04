import assert from "node:assert";
import { test, describe, beforeEach } from "node:test";
import {
  buildPlaylistSearchQuery,
  buildFallbackPlaylistQuery,
  getPlaylistQueryCacheKey,
  cleanLLMQueryResponse,
  clearPlaylistQueryCache,
  PlaylistQueryParams,
} from "./playlistQueryBuilder";

describe("Playlist Search Query Builder & Cache Engine", () => {
  beforeEach(() => {
    clearPlaylistQueryCache();
  });

  const sampleParamsHindi: PlaylistQueryParams = {
    archetype: "Heartbreak Hour",
    tasteProfile: {
      topGenres: ["filmi", "bollywood", "indian pop"],
      preferredLanguage: "Hindi",
      dominantMusicCluster: "Upbeat & Conventional",
    },
  };

  const sampleParamsEnglish: PlaylistQueryParams = {
    archetype: "Midnight Neon Sanctuary",
    tasteProfile: {
      topGenres: ["synthwave", "indie pop", "lo-fi"],
      preferredLanguage: "English",
      dominantMusicCluster: "Reflective & Complex",
    },
  };

  test("buildFallbackPlaylistQuery includes language prefix and mood keywords", () => {
    const queryHindi = buildFallbackPlaylistQuery(sampleParamsHindi);
    assert.ok(queryHindi.toLowerCase().includes("hindi"));
    assert.ok(queryHindi.toLowerCase().includes("heartbreak"));

    const queryEng = buildFallbackPlaylistQuery(sampleParamsEnglish);
    assert.ok(queryEng.toLowerCase().includes("late night synthwave"));
  });

  test("cleanLLMQueryResponse cleans markdown and quotes cleanly", () => {
    const raw1 = '```json "hindi breakup sad songs playlist" ```';
    assert.strictEqual(cleanLLMQueryResponse(raw1), "hindi breakup sad songs playlist");

    const raw2 = 'Query: late night lofi reflective';
    assert.strictEqual(cleanLLMQueryResponse(raw2), "late night lofi reflective");
  });

  test("getPlaylistQueryCacheKey generates consistent cache keys", () => {
    const key1 = getPlaylistQueryCacheKey(sampleParamsHindi);
    const key2 = getPlaylistQueryCacheKey(sampleParamsHindi);
    assert.strictEqual(key1, key2);
    assert.ok(key1.includes("heartbreak"));
    assert.ok(key1.includes("hindi"));
  });

  test("buildPlaylistSearchQuery caches query and returns cacheHit: true on second call", async () => {
    // 1st call -> cache hit false
    const res1 = await buildPlaylistSearchQuery(sampleParamsHindi);
    assert.ok(res1.query.length >= 5);
    assert.strictEqual(res1.cacheHit, false);

    // 2nd call -> cache hit true
    const res2 = await buildPlaylistSearchQuery(sampleParamsHindi);
    assert.strictEqual(res2.query, res1.query);
    assert.strictEqual(res2.cacheHit, true);
    assert.strictEqual(res2.source, "cache");
  });
});
