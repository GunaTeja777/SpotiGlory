import assert from "node:assert";
import { test, describe } from "node:test";
import { getSyntheticUsers, getSyntheticUserById, isSyntheticUser } from "./syntheticUsers";

describe("Synthetic User Profiles Store & Filtering Utilities", () => {
  test("returns at least 15-20 synthetic demo user profiles", () => {
    const users = getSyntheticUsers();
    assert.ok(users.length >= 15);
    assert.ok(users.length <= 20);
  });

  test("all synthetic user profiles contain required fields and isSynthetic = true", () => {
    const users = getSyntheticUsers();
    users.forEach((user) => {
      assert.strictEqual(user.isSynthetic, true);
      assert.ok(user.id.startsWith("synth_user_"));
      assert.ok(user.name.length > 0);
      assert.ok(user.avatar.length > 0);
      assert.ok(user.persona.length > 0);
      assert.ok(user.headline.length > 0);

      // Check OCEAN boundaries
      assert.ok(user.ocean.openness >= 0 && user.ocean.openness <= 100);
      assert.ok(user.ocean.conscientiousness >= 0 && user.ocean.conscientiousness <= 100);
      assert.ok(user.ocean.extraversion >= 0 && user.ocean.extraversion <= 100);
      assert.ok(user.ocean.agreeableness >= 0 && user.ocean.agreeableness <= 100);
      assert.ok(user.ocean.neuroticism >= 0 && user.ocean.neuroticism <= 100);

      // Check MUSIC cluster sum
      const clusterSum =
        user.musicClusters.reflectiveComplex +
        user.musicClusters.intenseRebellious +
        user.musicClusters.upbeatConventional +
        user.musicClusters.energeticRhythmic;
      assert.strictEqual(clusterSum, 100);

      // Check valid mood
      assert.ok(["Reflective", "Energized", "Fiery", "Upbeat", "Calm"].includes(user.currentMood));
    });
  });

  test("finds synthetic user by ID cleanly", () => {
    const user = getSyntheticUserById("synth_user_01");
    assert.ok(user);
    assert.strictEqual(user?.name, "Aria Vance");
    assert.strictEqual(user?.persona, "The Nocturnal Alchemist");
  });

  test("correctly identifies synthetic user IDs", () => {
    assert.strictEqual(isSyntheticUser("synth_user_05"), true);
    assert.strictEqual(isSyntheticUser("synth_custom_99"), true);
    assert.strictEqual(isSyntheticUser("real_user_spotify_id_123"), false);
    assert.strictEqual(isSyntheticUser(undefined), false);
  });
});
