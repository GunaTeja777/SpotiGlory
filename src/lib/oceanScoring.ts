/**
 * Big Five (OCEAN) Personality Scoring Engine
 * 
 * Maps computed Spotify behavioral features and MUSIC genre clusters to the Big Five personality traits:
 * - Openness to Experience
 * - Conscientiousness
 * - Extraversion
 * - Agreeableness
 * - Neuroticism
 * 
 * Citation & Theoretical Rationale:
 * Based on empirical music-personality research by Rentfrow & Gosling (2003),
 * "The Do Re Mi's of Everyday Life: The Structure and Personality Correlates of Music Preferences"
 * Journal of Personality and Social Psychology, 84(6), 1236-1256.
 * 
 * Configured via versioned weights (src/config/oceanWeights.json v1.0.0).
 */

import { BehavioralFeatures } from "./features";
import { ClusterDistribution } from "./genreClusters";
import oceanWeightsConfig from "@/config/oceanWeights.json";

export interface OceanTraitScore {
  trait: "Openness" | "Conscientiousness" | "Extraversion" | "Agreeableness" | "Neuroticism";
  score: number; // 0 - 100
  confidence: "high" | "medium" | "low";
  reliabilityScore: number; // 0 - 100 percentage based on sample count & variance
  sampleCount: number;
  label: "High" | "Moderate" | "Balanced";
  description: string;
}

export interface OceanScoresResult {
  openness: OceanTraitScore;
  conscientiousness: OceanTraitScore;
  extraversion: OceanTraitScore;
  agreeableness: OceanTraitScore;
  neuroticism: OceanTraitScore;
  weightsVersion: string;
  disclaimer: string;
}

const RESEARCH_DISCLAIMER = 
  "This is an experimental estimate based on music-listening patterns and empirical research by Rentfrow & Gosling (2003), not a validated psychological assessment.";

function clampScore(val: number): number {
  return Math.min(100, Math.max(0, Math.round(val)));
}

function getTraitLabel(score: number): "High" | "Moderate" | "Balanced" {
  if (score >= 65) return "High";
  if (score <= 35) return "Balanced";
  return "Moderate";
}

/**
 * Computes Big Five (OCEAN) personality scores from behavioral features and MUSIC genre clusters.
 * Normalizes all feature inputs to 0..1, applies versioned config weights, and rescales to 0..100 post-weighted.
 */
export function computeOceanScores(
  features: BehavioralFeatures,
  clusterDist: ClusterDistribution,
  customWeights?: typeof oceanWeightsConfig.weights
): OceanScoresResult {
  const w = customWeights || oceanWeightsConfig.weights;

  // 1. Normalize all input feature signals to 0..1 before combining
  const normReflective = Math.min(1, Math.max(0, (clusterDist.reflectiveComplex || 0) / 100));
  const normIntense = Math.min(1, Math.max(0, (clusterDist.intenseRebellious || 0) / 100));
  const normUpbeat = Math.min(1, Math.max(0, (clusterDist.upbeatConventional || 0) / 100));
  const normEnergetic = Math.min(1, Math.max(0, (clusterDist.energeticRhythmic || 0) / 100));

  const normEntropy = Math.min(1, Math.max(0, features.genreDiversity?.normalizedEntropy || 0));
  const normStability = Math.min(1, Math.max(0, features.genreSpreadAcrossTimeRanges?.stabilityScore || 1));
  const normPopularity = Math.min(1, Math.max(0, (features.avgArtistPopularity || 50) / 100));
  const normNightRatio = Math.min(1, Math.max(0, (features.nightListenerRatio || 0) / 100));
  const normRecency = Math.min(1, Math.max(0, features.recencyConcentration || 0));
  const normArtistLoyaltyInverted = Math.min(1, Math.max(0, 1 - (features.artistLoyalty || 1)));

  // Calculate Uncertainty / Confidence metric
  const sampleCount = (features.genreDiversity?.uniqueGenreCount || 0) + (features.topGenreDistribution?.length || 0) + 20;
  const sampleFactor = Math.min(1, sampleCount / 50);
  const reliabilityScore = Math.round(sampleFactor * 100);
  const confidence: "high" | "medium" | "low" = 
    reliabilityScore >= 80 ? "high" : reliabilityScore >= 50 ? "medium" : "low";

  // 2. Compute weighted combination on normalized inputs (0..1)
  const opennessWeighted = 
    w.openness.reflectiveComplex * normReflective +
    w.openness.normalizedEntropy * normEntropy +
    w.openness.artistLoyaltyInverted * normArtistLoyaltyInverted;
  
  const conscientiousnessWeighted = 
    w.conscientiousness.genreStability * normStability +
    w.conscientiousness.recencyConcentration * normRecency +
    w.conscientiousness.artistRepeatLoyalty * (1 - normArtistLoyaltyInverted);

  const extraversionWeighted = 
    w.extraversion.upbeatConventional * normUpbeat +
    w.extraversion.energeticRhythmic * normEnergetic +
    w.extraversion.avgPopularityNormalized * normPopularity;

  const agreeablenessWeighted = 
    w.agreeableness.upbeatConventional * normUpbeat +
    w.agreeableness.acousticPopularityBalance * (1 - Math.abs(normPopularity - 0.5)) +
    w.agreeableness.genreStability * normStability;

  const neuroticismWeighted = 
    w.neuroticism.nightListenerRatioNormalized * normNightRatio +
    w.neuroticism.recencyConcentration * normRecency +
    w.neuroticism.entropyImbalance * (1 - normStability);

  // 3. Rescale and clip to 0..100 AFTER weighted combination
  const opennessScore = clampScore(opennessWeighted * 90 + w.openness.bias);
  const conscientiousnessScore = clampScore(conscientiousnessWeighted * 85 + w.conscientiousness.bias);
  const extraversionScore = clampScore(extraversionWeighted * 90 + w.extraversion.bias);
  const agreeablenessScore = clampScore(agreeablenessWeighted * 80 + w.agreeableness.bias);
  const neuroticismScore = clampScore(neuroticismWeighted * 85 + w.neuroticism.bias);

  return {
    openness: {
      trait: "Openness",
      score: opennessScore,
      confidence,
      reliabilityScore,
      sampleCount,
      label: getTraitLabel(opennessScore),
      description: "Gravitates toward complex, varied listening and niche artistic exploration.",
    },
    conscientiousness: {
      trait: "Conscientiousness",
      score: conscientiousnessScore,
      confidence,
      reliabilityScore,
      sampleCount,
      label: getTraitLabel(conscientiousnessScore),
      description: "Maintains structured listening routines and deep artist focus.",
    },
    extraversion: {
      trait: "Extraversion",
      score: extraversionScore,
      confidence,
      reliabilityScore,
      sampleCount,
      label: getTraitLabel(extraversionScore),
      description: "Thrives on energetic, high-BPM, and socially resonant music.",
    },
    agreeableness: {
      trait: "Agreeableness",
      score: agreeablenessScore,
      confidence,
      reliabilityScore,
      sampleCount,
      label: getTraitLabel(agreeablenessScore),
      description: "Prefers uplifting, harmonious, and accessible melodies.",
    },
    neuroticism: {
      trait: "Neuroticism",
      score: neuroticismScore,
      confidence,
      reliabilityScore,
      sampleCount,
      label: getTraitLabel(neuroticismScore),
      description: "Seeks emotionally intense soundscapes and late-night reflection.",
    },
    weightsVersion: oceanWeightsConfig.version,
    disclaimer: RESEARCH_DISCLAIMER,
  };
}
