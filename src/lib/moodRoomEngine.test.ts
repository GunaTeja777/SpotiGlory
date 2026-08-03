import assert from "node:assert";
import { test, describe } from "node:test";
import {
  getRecommendedRooms,
  getRoomBySlug,
  getRoomById,
  ALL_MOOD_ROOMS,
} from "./moodRoomEngine";

describe("Mood Room Engine", () => {
  test("defines at least 5 curated Jam Rooms with sample playlists", () => {
    assert.ok(ALL_MOOD_ROOMS.length >= 5);
    ALL_MOOD_ROOMS.forEach((room) => {
      assert.ok(room.id);
      assert.ok(room.name);
      assert.ok(room.slug);
      assert.ok(room.playlistPreview.sampleTracks.length >= 2);
    });
  });

  test("getRecommendedRooms returns topRooms and adjacentRooms sorted by matchScore", () => {
    const res = getRecommendedRooms("Reflective", {
      reflectiveComplex: 70,
      intenseRebellious: 10,
      upbeatConventional: 10,
      energeticRhythmic: 10,
    });

    assert.ok(res.topRooms.length >= 2);
    assert.ok(res.adjacentRooms.length >= 1);

    // Assert topRooms are sorted descending
    for (let i = 0; i < res.topRooms.length - 1; i++) {
      assert.ok(res.topRooms[i].matchScore >= res.topRooms[i + 1].matchScore);
    }

    // Top room for Reflective mood should be Reflective
    assert.strictEqual(res.topRooms[0].room.primaryMood, "Reflective");
  });

  test("getRoomBySlug finds correct room", () => {
    const room = getRoomBySlug("midnight-neon-sanctuary");
    assert.ok(room);
    assert.strictEqual(room.name, "Midnight Neon Sanctuary");
  });

  test("getRoomById finds correct room", () => {
    const room = getRoomById("room_midnight_neon");
    assert.ok(room);
    assert.strictEqual(room.slug, "midnight-neon-sanctuary");
  });
});
