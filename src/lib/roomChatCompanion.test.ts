import assert from "node:assert";
import { test, describe } from "node:test";
import { getBotCompanion, generateCompanionReply } from "./roomChatCompanion";

describe("Room AI Chat Companion Engine", () => {
  test("getBotCompanion returns correct archetype bot config", () => {
    const echo = getBotCompanion("midnight-neon-sanctuary");
    assert.strictEqual(echo.name, "Echo");
    assert.ok(echo.vibeDescription.includes("analog synth"));

    const hyperion = getBotCompanion("electric-pulse");
    assert.strictEqual(hyperion.name, "Hyperion");
    assert.ok(hyperion.vibeDescription.includes("sidechain"));
  });

  test("generateCompanionReply generates natural non-templated replies", () => {
    const reply1 = generateCompanionReply("midnight-neon-sanctuary", "Recommend a good track");
    assert.ok(reply1.length > 20);
    assert.ok(reply1.includes("Midnight Neon Sanctuary"));

    const reply2 = generateCompanionReply("electric-pulse", "hello there");
    assert.ok(reply2.includes("Hyperion"));
  });
});
