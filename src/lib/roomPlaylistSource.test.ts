import assert from "node:assert";
import { test, describe } from "node:test";
import {
  filterQualityPlaylists,
  getRoomPlaylistWithQuery,
  getRoomPlaylist,
} from "./roomPlaylistSource";
import { UserTasteProfile } from "./userTasteProfile";

describe("Room Playlist Sourcing Engine & Quality Filter", () => {
  const sampleProfile: UserTasteProfile = {
    topGenres: ["synthwave", "indie pop", "lo-fi"],
    preferredLanguage: "English",
    dominantMusicCluster: "Reflective & Complex",
  };

  test("filterQualityPlaylists excludes playlists with fewer than minimum tracks", () => {
    const rawPlaylists = [
      { id: "p1", name: "Empty Playlist", tracks: { total: 0 } },
      { id: "p2", name: "Small Draft", tracks: { total: 2 } },
      { id: "p3", name: "High Quality Mood", tracks: { total: 45 }, followers: { total: 1200 } },
      { id: "p4", name: "Sanctuary Waves", tracks: { total: 18 }, followers: { total: 500 } },
    ];

    const qualityList = filterQualityPlaylists(rawPlaylists, 5);
    assert.strictEqual(qualityList.length, 2);
    assert.strictEqual(qualityList[0].id, "p3");
    assert.strictEqual(qualityList[1].id, "p4");
  });

  test("getRoomPlaylistWithQuery falls back to curated/broader path when offline or unauthenticated", async () => {
    const playlist = await getRoomPlaylistWithQuery(
      "midnight-neon-sanctuary",
      sampleProfile,
      undefined, // No access token (unauthenticated / offline test)
      true
    );

    assert.ok(playlist);
    assert.strictEqual(playlist.roomId, "midnight-neon-sanctuary");
    assert.ok(playlist.tracks.length >= 4);
    assert.ok(playlist.sourceType === "curated_fallback");
  });

  test("getRoomPlaylist returns valid playlist with tracks", async () => {
    const playlist = await getRoomPlaylist("electric-pulse");
    assert.strictEqual(playlist.roomId, "electric-pulse");
    assert.ok(playlist.tracks.length >= 3);
  });
});
