import assert from "node:assert";
import { test, describe } from "node:test";
import {
  getCuratedFallbackPlaylists,
  getGoogleRagPlaylists
} from "./roomPlaylistSource";

describe("Room Playlist Google RAG Sourcing Engine", () => {
  test("getCuratedFallbackPlaylists returns exactly 3 curated playlists with tracks", () => {
    const playlists = getCuratedFallbackPlaylists("midnight-neon-sanctuary", "Tamil");
    assert.strictEqual(playlists.length, 3);
    assert.ok(playlists[0].title.length > 0);
    assert.ok(playlists[0].tracks.length > 0);
    assert.strictEqual(playlists[0].roomId, "midnight-neon-sanctuary");
  });

  test("getGoogleRagPlaylists falls back to curated lists when unauthenticated/no key", async () => {
    const playlists = await getGoogleRagPlaylists(
      "deep-focus-acoustic",
      [
        { name: "Resonance", artist: "HOME", album: "Odyssey" }
      ],
      "English"
    );

    assert.strictEqual(playlists.length, 3);
    assert.strictEqual(playlists[0].roomId, "deep-focus-acoustic");
    assert.ok(playlists[0].tracks.length > 0);
  });
});
