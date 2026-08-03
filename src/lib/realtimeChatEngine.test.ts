import assert from "node:assert";
import { test, describe } from "node:test";
import {
  getOrCreateRoomState,
  postUserMessageToRoom,
  generateAndPostBotReply,
  updateRoomActiveUsersCount,
} from "./realtimeChatEngine";

describe("Realtime Chat Engine & Bot Moderation", () => {
  test("initializes room with bot greeting message", () => {
    const state = getOrCreateRoomState("test_room_01");
    assert.strictEqual(state.messages.length, 1);
    assert.strictEqual(state.messages[0].isAiCompanion, true);
    assert.strictEqual(state.messages[0].senderName, "Echo");
  });

  test("triggers bot reply in single-user room", () => {
    const res = postUserMessageToRoom("test_room_single", {
      senderId: "u1",
      senderName: "Alice",
      senderAvatar: "avatar_url",
      text: "Love this synth vibe!",
    });

    assert.strictEqual(res.message.text, "Love this synth vibe!");
    assert.strictEqual(res.shouldBotReply, true);
    assert.ok(res.botDelayMs >= 1200 && res.botDelayMs <= 1800);
  });

  test("suppresses bot reply in multi-user room unless directly addressed or periodic", () => {
    const roomId = "test_room_multi";
    updateRoomActiveUsersCount(roomId, 2); // 3 active users

    // Normal message not addressing bot
    const res1 = postUserMessageToRoom(roomId, {
      senderId: "u1",
      senderName: "Alice",
      senderAvatar: "avatar_url",
      text: "Hey Bob what do you think of this track?",
    });

    assert.strictEqual(res1.shouldBotReply, false);

    // Message directly addressing bot ("Echo")
    const res2 = postUserMessageToRoom(roomId, {
      senderId: "u2",
      senderName: "Bob",
      senderAvatar: "avatar_url",
      text: "Hey Echo recommend a track!",
    });

    assert.strictEqual(res2.shouldBotReply, true);
  });

  test("generateAndPostBotReply creates bot message with isAiCompanion: true", () => {
    const roomId = "test_room_reply";
    const botMsg = generateAndPostBotReply(roomId, "Hello room");
    assert.strictEqual(botMsg.isAiCompanion, true);
    assert.ok(botMsg.text.length > 5);
  });
});
