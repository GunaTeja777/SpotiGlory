import assert from "node:assert";
import { test, describe } from "node:test";
import { computeNarrativeGrounding } from "./narrativeBands";
import { validateNarrativeJson } from "./narrativeSchema";
import { generateFallbackNarrative } from "./narrativePrompt";
import { BehavioralFeatures } from "./features";
import { ClusterDistribution } from "./genreClusters";
import { OceanScoresResult } from "./oceanScoring";

describe("Synthetic Evaluation Test Suite for GenAI Narrative Pipeline", () => {
  const dummyOcean: OceanScoresResult = {
    openness: { trait: "Openness", score: 85, confidence: "high", reliabilityScore: 90, sampleCount: 50, label: "High", description: "High exploration" },
    conscientiousness: { trait: "Conscientiousness", score: 40, confidence: "medium", reliabilityScore: 70, sampleCount: 40, label: "Moderate", description: "Moderate focus" },
    extraversion: { trait: "Extraversion", score: 75, confidence: "high", reliabilityScore: 85, sampleCount: 50, label: "High", description: "Upbeat music" },
    agreeableness: { trait: "Agreeableness", score: 60, confidence: "medium", reliabilityScore: 75, sampleCount: 45, label: "Moderate", description: "Harmonious sound" },
    neuroticism: { trait: "Neuroticism", score: 70, confidence: "high", reliabilityScore: 88, sampleCount: 50, label: "High", description: "Late-night listening" },
    weightsVersion: "1.0.0",
    disclaimer: "Disclaimer text",
  };

  const dummyFeatures: BehavioralFeatures = {
    genreDiversity: { shannonEntropy: 2.5, normalizedEntropy: 0.82, uniqueGenreCount: 8, state: "MULTI_GENRE", stateMessage: "Diverse" },
    topGenreDistribution: [{ genre: "indie rock", count: 10, percentage: 40 }, { genre: "synthwave", count: 6, percentage: 24 }],
    listeningHourDistribution: Array(24).fill(2),
    listeningDayDistribution: Array(7).fill(5),
    peakListeningHour: 2,
    nightListenerRatio: 65,
    artistLoyalty: 0.45,
    avgArtistPopularity: 48,
    genreSpreadAcrossTimeRanges: { stabilityScore: 0.65, shortTermGenreCount: 5, longTermGenreCount: 8, overlapCount: 4 },
    recencyConcentration: 0.35,
  };

  test("computes qualitative grounding context without errors", () => {
    const grounded = computeNarrativeGrounding(dummyOcean, dummyFeatures);
    assert.strictEqual(grounded.openness.band, "very_high");
    assert.strictEqual(grounded.openness.label, "Boundless Sonic Explorer");
    assert.ok(grounded.openness.allowedKeywords.length > 0);
  });

  test("validates clean GenAI JSON output", () => {
    const validJson = {
      listeningPersona: "The Sonic Explorer",
      headline: "Exploring the deep boundaries of indie rock and synthwave",
      summary: "Your listening habits demonstrate a rare blend of experimental curiosity and late-night reflection.",
      traits: [
        { trait: "Openness", label: "Boundless Sonic Explorer", insight: "Deep genre exploration across indie rock and synthwave." },
        { trait: "Conscientiousness", label: "Selective & Familiar", insight: "Maintains flexible, mood-driven listening habits." },
        { trait: "Extraversion", label: "Upbeat & High Energy", insight: "Thrives on high-tempo energetic soundscapes." },
        { trait: "Agreeableness", label: "Harmonious & Accessible", insight: "Prefers uplifting and pleasant melodies." },
        { trait: "Neuroticism", label: "Atmospheric & Nocturnal", insight: "Streams 65% of music during late night hours." },
      ],
      funFacts: [
        "🌙 65% of your streams occur late at night",
        "🎷 Top genre indie rock accounts for 40% of listening",
        "⚡ Peak listening hour occurs around 2:00 UTC",
      ],
    };

    const res = validateNarrativeJson(validJson);
    assert.strictEqual(res.success, true);
    assert.ok(res.data);
    assert.strictEqual(res.data.traits.length, 5);
  });

  test("rejects malformed GenAI JSON output with missing required fields", () => {
    const invalidJson = {
      listeningPersona: "Short",
      headline: "",
      summary: "Too short",
    };

    const res = validateNarrativeJson(invalidJson);
    assert.strictEqual(res.success, false);
    assert.ok(res.error);
  });

  test("generates robust fallback narrative for synthetic profile", () => {
    const fallback = generateFallbackNarrative(dummyOcean, dummyFeatures, dummyFeatures.topGenreDistribution, []);
    assert.ok(fallback.listeningPersona);
    assert.ok(fallback.headline);
    assert.strictEqual(fallback.traits.length, 5);
    assert.strictEqual(fallback.funFacts.length, 3);
  });
});
