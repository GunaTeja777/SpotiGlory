import assert from "node:assert";
import { test, describe } from "node:test";
import { getGoogleRagPlaylists } from "./roomPlaylistSource";

describe("Room Playlist RAG Sourcing Engine", () => {
  test("getGoogleRagPlaylists returns empty array when unconfigured or key is not set", async () => {
    const playlists = await getGoogleRagPlaylists(
      "deep-focus-acoustic",
      [
        { name: "Resonance", artist: "HOME", album: "Odyssey" }
      ],
      "English"
    );

    assert.strictEqual(playlists.length, 0);
  });
});
