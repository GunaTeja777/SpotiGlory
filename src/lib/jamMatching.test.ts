import assert from "node:assert";
import { test, describe } from "node:test";
import {
  findJamMatches,
  computeCosineSimilarity,
  computeMoodSimilarity,
  generateMatchReason,
  OceanVector,
  MusicClusterVector,
  JamCandidateUser,
} from "./jamMatching";
import { getSyntheticUsers } from "./syntheticUsers";

describe("Jam Matching Similarity Engine", () => {
  const baseOcean: OceanVector = {
    openness: 80,
    conscientiousness: 60,
    extraversion: 40,
    agreeableness: 70,
    neuroticism: 50,
  };

  const baseClusters: MusicClusterVector = {
    reflectiveComplex: 60,
    intenseRebellious: 10,
    upbeatConventional: 20,
    energeticRhythmic: 10,
  };

  test("computeCosineSimilarity returns 1.0 for identical vectors and 0.0 for orthogonal vectors", () => {
    const v1 = [0.8, 0.6, 0.4, 0.7, 0.5];
    const v2 = [0.8, 0.6, 0.4, 0.7, 0.5];
    const simIdentical = computeCosineSimilarity(v1, v2);
    assert.strictEqual(Math.round(simIdentical * 100), 100);

    const vOrth1 = [1.0, 0.0, 0.0];
    const vOrth2 = [0.0, 1.0, 0.0];
    const simOrthogonal = computeCosineSimilarity(vOrth1, vOrth2);
    assert.strictEqual(simOrthogonal, 0.0);
  });

  test("identical user profile candidate yields ~100% match score", () => {
    const activeUser = {
      id: "active_user_01",
      ocean: baseOcean,
      musicClusters: baseClusters,
      currentMood: "Reflective" as const,
    };

    const identicalCandidate: JamCandidateUser = {
      id: "cand_identical",
      name: "Twin Listener",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Twin",
      persona: "The Nocturnal Alchemist",
      ocean: baseOcean,
      musicClusters: baseClusters,
      currentMood: "Reflective",
    };

    const matches = findJamMatches(activeUser, [identicalCandidate]);
    assert.strictEqual(matches.length, 1);
    assert.strictEqual(matches[0].matchScore, 100);
    assert.ok(matches[0].matchReason.includes("Reflective & Complex"));
    assert.ok(matches[0].matchReason.includes("Reflective mood"));
  });

  test("opposite/orthogonal user candidate yields low match score (< 45%)", () => {
    const activeUser = {
      id: "active_user_01",
      ocean: { openness: 100, conscientiousness: 0, extraversion: 0, agreeableness: 100, neuroticism: 0 },
      musicClusters: { reflectiveComplex: 100, intenseRebellious: 0, upbeatConventional: 0, energeticRhythmic: 0 },
      currentMood: "Reflective" as const,
    };

    const oppositeCandidate: JamCandidateUser = {
      id: "cand_opposite",
      name: "Opposite Listener",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Opposite",
      persona: "The High-BPM Energy Driver",
      ocean: { openness: 0, conscientiousness: 100, extraversion: 100, agreeableness: 0, neuroticism: 100 },
      musicClusters: { reflectiveComplex: 0, intenseRebellious: 50, upbeatConventional: 0, energeticRhythmic: 50 },
      currentMood: "Fiery",
    };

    const matches = findJamMatches(activeUser, [oppositeCandidate]);
    assert.strictEqual(matches.length, 1);
    assert.ok(matches[0].matchScore < 45);
  });

  test("generateMatchReason correctly identifies dominant shared MUSIC cluster and OCEAN trait", () => {
    const u1Ocean: OceanVector = { openness: 90, conscientiousness: 30, extraversion: 20, agreeableness: 40, neuroticism: 50 };
    const u2Ocean: OceanVector = { openness: 88, conscientiousness: 80, extraversion: 80, agreeableness: 20, neuroticism: 10 };

    const u1Clusters: MusicClusterVector = { reflectiveComplex: 10, intenseRebellious: 70, upbeatConventional: 10, energeticRhythmic: 10 };
    const u2Clusters: MusicClusterVector = { reflectiveComplex: 5, intenseRebellious: 80, upbeatConventional: 5, energeticRhythmic: 10 };

    const { reason, topSharedCluster, topSharedTrait } = generateMatchReason(
      u1Ocean,
      u2Ocean,
      u1Clusters,
      u2Clusters,
      "Fiery",
      "Fiery"
    );

    assert.strictEqual(topSharedCluster, "Intense & Rebellious");
    assert.strictEqual(topSharedTrait, "Openness");
    assert.ok(reason.includes("Intense & Rebellious"));
    assert.ok(reason.includes("Openness"));
  });

  test("ranks synthetic users array and returns top 5 candidate matches", () => {
    const activeUser = {
      id: "active_user_demo",
      ocean: { openness: 88, conscientiousness: 50, extraversion: 45, agreeableness: 60, neuroticism: 70 },
      musicClusters: { reflectiveComplex: 50, intenseRebellious: 20, upbeatConventional: 10, energeticRhythmic: 20 },
      currentMood: "Reflective" as const,
    };

    const syntheticCandidates: JamCandidateUser[] = getSyntheticUsers();
    const topMatches = findJamMatches(activeUser, syntheticCandidates, 5);

    assert.strictEqual(topMatches.length, 5);
    // Assert scores are sorted descending
    for (let i = 0; i < topMatches.length - 1; i++) {
      assert.ok(topMatches[i].matchScore >= topMatches[i + 1].matchScore);
    }
    // Assert all top 5 have valid match reasons
    topMatches.forEach((m) => {
      assert.ok(m.matchScore >= 0 && m.matchScore <= 100);
      assert.ok(m.matchReason.length > 10);
      assert.ok(m.candidateUser.isSynthetic);
    });
  });
});
