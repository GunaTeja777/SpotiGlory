import assert from "node:assert";
import { test, describe } from "node:test";
import { getGoogleRagPlaylists, getAgenticRagPlaylists, retrieveCandidatePlaylists } from "./roomPlaylistSource";

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

  test("getAgenticRagPlaylists returns empty playlists and default decisions when unconfigured or key is not set", async () => {
    // Temporarily clear key for testing unconfigured state
    const originalKey = process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_API_KEY;

    try {
      const res = await getAgenticRagPlaylists(
        "deep-focus-acoustic",
        [
          { name: "Resonance", artist: "HOME", album: "Odyssey" }
        ],
        "English"
      );

      assert.strictEqual(res.playlists.length, 0);
      assert.ok(res.decisions.length > 0);
      assert.strictEqual(res.decisions[res.decisions.length - 1].step, "Agent Routing Decision");
    } finally {
      process.env.OPENROUTER_API_KEY = originalKey;
    }
  });

  test("retrieveCandidatePlaylists performs VSM cosine-similarity retrieval matching ambient queries", () => {
    const retrieved = retrieveCandidatePlaylists(
      "ambient-focus-relax",
      [{ name: "Aria", artist: "Hammock", album: "Departure" }]
    );

    assert.strictEqual(retrieved.length, 3);
    // The top-ranked document should be the Serene Ambient Soundscapes document
    assert.strictEqual(retrieved[0].id, "doc_chill_ambient");
  });

  test("retrieveCandidatePlaylists performs VSM cosine-similarity retrieval matching rock queries", () => {
    const retrieved = retrieveCandidatePlaylists(
      "heavy-metal-room",
      [{ name: "Smells Like Teen Spirit", artist: "Nirvana", album: "Nevermind" }]
    );

    assert.strictEqual(retrieved.length, 3);
    // The top-ranked document should be Alternative & Rebellious Rock
    assert.strictEqual(retrieved[0].id, "doc_heavy_rock");
  });
});
