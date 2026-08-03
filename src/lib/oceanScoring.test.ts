import assert from "node:assert";
import { test, describe } from "node:test";
import { computeOceanScores, explainTraitScore } from "./oceanScoring";
import { BehavioralFeatures } from "./features";
import { ClusterDistribution } from "./genreClusters";

describe("Big Five (OCEAN) Personality Scoring Engine", () => {
  const mockFeatures: BehavioralFeatures = {
    genreDiversity: { shannonEntropy: 2.5, normalizedEntropy: 0.8, uniqueGenreCount: 6 },
    topGenreDistribution: [
      { genre: "jazz", count: 10, percentage: 50 },
      { genre: "indie folk", count: 10, percentage: 50 },
    ],
    listeningHourDistribution: Array(24).fill(0),
    listeningDayDistribution: Array(7).fill(0),
    peakListeningHour: 23,
    nightListenerRatio: 40,
    artistLoyalty: 0.4,
    avgArtistPopularity: 45,
    genreSpreadAcrossTimeRanges: { stabilityScore: 0.5, shortTermGenreCount: 4, longTermGenreCount: 6, overlapCount: 3 },
    recencyConcentration: 0.6,
  };

  const mockClusterDist: ClusterDistribution = {
    reflectiveComplex: 60,
    intenseRebellious: 10,
    upbeatConventional: 15,
    energeticRhythmic: 15,
    other: 0,
    dominantCluster: "reflectiveComplex",
  };

  test("computes all 5 OCEAN scores within 0 to 100 boundaries", () => {
    const res = computeOceanScores(mockFeatures, mockClusterDist);

    assert.ok(res.openness.score >= 0 && res.openness.score <= 100);
    assert.ok(res.conscientiousness.score >= 0 && res.conscientiousness.score <= 100);
    assert.ok(res.extraversion.score >= 0 && res.extraversion.score <= 100);
    assert.ok(res.agreeableness.score >= 0 && res.agreeableness.score <= 100);
    assert.ok(res.neuroticism.score >= 0 && res.neuroticism.score <= 100);
  });

  test("boosts Openness score when Reflective/Complex cluster and genre entropy are high", () => {
    const res = computeOceanScores(mockFeatures, mockClusterDist);
    assert.strictEqual(res.openness.score >= 60, true);
    assert.strictEqual(res.openness.label, "High");
  });

  test("includes required research disclaimer", () => {
    const res = computeOceanScores(mockFeatures, mockClusterDist);
    assert.ok(res.disclaimer.includes("Rentfrow & Gosling"));
    assert.ok(res.disclaimer.includes("experimental estimate"));
  });

  test("explainTraitScore returns feature contributions that sum to exactly 100%", () => {
    const traits = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"] as const;
    traits.forEach((t) => {
      const contributions = explainTraitScore(t, mockFeatures, mockClusterDist);
      assert.ok(contributions.length > 0);
      const totalPct = contributions.reduce((sum, c) => sum + c.percentage, 0);
      assert.strictEqual(totalPct, 100);
    });
  });
});
