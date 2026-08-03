import assert from "node:assert";
import { test, describe } from "node:test";
import {
  validateRoomBotJson,
  generateFallbackBotReply,
  RoomBotReply,
} from "./roomBotSchema";
import {
  ROOM_BOT_PROMPT_VERSION,
  buildRoomBotUserPromptV1_0_0,
} from "../prompts/room_bot_v1.0.0";

describe("Room AI Companion Bot Chat Pipeline (v1.0.0)", () => {
  test("ROOM_BOT_PROMPT_VERSION is versioned as 1.0.0", () => {
    assert.strictEqual(ROOM_BOT_PROMPT_VERSION, "1.0.0");
  });

  test("validateRoomBotJson validates schema correctly", () => {
    const validJson = {
      replyText: "The analog warmth on Resonance hits so smooth at this hour.",
      referencedTrack: "Resonance",
      vibeAlignment: "High",
      thoughtContext: "Grounded in nocturnal synthwave archetype.",
    };

    const res = validateRoomBotJson(validJson);
    assert.strictEqual(res.success, true);
    assert.ok(res.data);
    assert.strictEqual(res.data.replyText, validJson.replyText);

    const invalidJson = {
      replyText: "Short",
    };

    const resInvalid = validateRoomBotJson(invalidJson);
    assert.strictEqual(resInvalid.success, false);
    assert.ok(resInvalid.error);
  });

  test("generateFallbackBotReply produces non-empty, schema-valid response", () => {
    const reply: RoomBotReply = generateFallbackBotReply("midnight-neon-sanctuary", {
      name: "Space Song",
      artist: "Beach House",
    });

    const validation = validateRoomBotJson(reply);
    assert.strictEqual(validation.success, true);
    assert.ok(reply.replyText.length >= 15);
    assert.ok(reply.thoughtContext);
  });

  test("response generated with specific track name reasonably references track context", () => {
    const trackName = "Space Song";
    const artistName = "Beach House";

    const reply: RoomBotReply = generateFallbackBotReply(
      "midnight-neon-sanctuary",
      { name: trackName, artist: artistName },
      "What do you think of this track?"
    );

    assert.ok(reply.replyText.length > 0);
    // Check that reply reasonably references track name or artist context
    const hasTrack = reply.replyText.includes(trackName);
    const hasArtist = reply.replyText.includes(artistName);
    const hasReferencedField = reply.referencedTrack === trackName;

    assert.ok(hasTrack || hasArtist || hasReferencedField);
  });

  test("buildRoomBotUserPromptV1_0_0 builds grounded prompt with track info", () => {
    const prompt = buildRoomBotUserPromptV1_0_0({
      roomName: "Midnight Neon Sanctuary",
      primaryMood: "Reflective",
      vibeTag: "Synthwave & Lo-Fi",
      currentTrackName: "Resonance",
      currentTrackArtist: "HOME",
      userMessage: "Love this vintage synth pad!",
      botName: "Echo",
    });

    assert.ok(prompt.includes("Midnight Neon Sanctuary"));
    assert.ok(prompt.includes("Resonance"));
    assert.ok(prompt.includes("HOME"));
    assert.ok(prompt.includes("Echo"));
    assert.ok(prompt.includes("Love this vintage synth pad!"));
  });
});
