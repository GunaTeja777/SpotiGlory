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
 * IMPORTANT DISCLAIMER: This is an experimental algorithm derived from music-listening patterns
 * for entertainment and exploratory self-reflection, not a certified psychometric instrument.
 */

import { BehavioralFeatures } from "./features";
import { ClusterDistribution } from "./genreClusters";

export interface OceanTraitScore {
  trait: "Openness" | "Conscientiousness" | "Extraversion" | "Agreeableness" | "Neuroticism";
  score: number; // 0 - 100
  label: "High" | "Moderate" | "Balanced";
  description: string;
}

export interface OceanScoresResult {
  openness: OceanTraitScore;
  conscientiousness: OceanTraitScore;
  extraversion: OceanTraitScore;
  agreeableness: OceanTraitScore;
  neuroticism: OceanTraitScore;
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
 */
export function computeOceanScores(
  features: BehavioralFeatures,
  clusterDist: ClusterDistribution
): OceanScoresResult {
  const entropyPct = (features.genreDiversity?.normalizedEntropy || 0) * 100;
  const stabilityPct = (features.genreSpreadAcrossTimeRanges?.stabilityScore || 1) * 100;
  const popularity = features.avgArtistPopularity || 50;
  const nightRatio = features.nightListenerRatio || 0;
  const recencyRatioPct = (features.recencyConcentration || 0) * 100;

  // artistLoyalty is unique/total (lower = higher repeat depth)
  const repeatDepthPct = Math.min(100, Math.max(0, (1 - (features.artistLoyalty || 1)) * 100));

  const reflective = clusterDist.reflectiveComplex || 0;
  const intense = clusterDist.intenseRebellious || 0;
  const upbeat = clusterDist.upbeatConventional || 0;
  const energetic = clusterDist.energeticRhythmic || 0;

  // 1. OPENNESS TO EXPERIENCE
  // Rationale: Correlates strongly with genre entropy, Reflective & Complex music (Jazz, Folk, Classical),
  // niche artist preferences (lower average popularity), and taste evolution (lower genre stability).
  const opennessRaw = 
    0.40 * entropyPct +
    0.35 * reflective +
    0.15 * (100 - stabilityPct) +
    0.10 * (100 - popularity);
  const opennessScore = clampScore(opennessRaw);

  // 2. CONSCIENTIOUSNESS
  // Rationale: Correlates with structured listening routines (high recency concentration),
  // focused artist loyalty (repeat depth), and daytime/structured listening (low night ratio).
  const conscientiousnessRaw = 
    0.35 * recencyRatioPct +
    0.35 * repeatDepthPct +
    0.30 * (100 - nightRatio);
  const conscientiousnessScore = clampScore(conscientiousnessRaw);

  // 3. EXTRAVERSION
  // Rationale: Correlates with upbeat, conventional, energetic, and rhythmic music (Pop, Hip-hop, Dance)
  // as well as mainstream artist popularity (socially resonant music).
  const extraversionRaw = 
    0.35 * upbeat +
    0.35 * energetic +
    0.30 * popularity;
  const extraversionScore = clampScore(extraversionRaw);

  // 4. AGREEABLENESS
  // Rationale: Correlates positively with upbeat, conventional music and negatively with aggressive, intense music.
  const agreeablenessRaw = 
    0.60 * upbeat +
    0.40 * (100 - intense);
  const agreeablenessScore = clampScore(agreeablenessRaw);

  // 5. NEUROTICISM
  // Rationale: Correlates with intense, rebellious music (emotional catharsis),
  // late-night listening habits, and volatile/shifting musical tastes.
  const neuroticismRaw = 
    0.35 * intense +
    0.35 * nightRatio +
    0.30 * (100 - stabilityPct);
  const neuroticismScore = clampScore(neuroticismRaw);

  return {
    openness: {
      trait: "Openness",
      score: opennessScore,
      label: getTraitLabel(opennessScore),
      description: "You gravitate toward complex, varied listening and niche artistic exploration.",
    },
    conscientiousness: {
      trait: "Conscientiousness",
      score: conscientiousnessScore,
      label: getTraitLabel(conscientiousnessScore),
      description: "You maintain structured listening routines and deep artist focus.",
    },
    extraversion: {
      trait: "Extraversion",
      score: extraversionScore,
      label: getTraitLabel(extraversionScore),
      description: "You thrive on energetic, high-BPM, and socially resonant music.",
    },
    agreeableness: {
      trait: "Agreeableness",
      score: agreeablenessScore,
      label: getTraitLabel(agreeablenessScore),
      description: "You prefer uplifting, harmonious, and accessible melodies.",
    },
    neuroticism: {
      trait: "Neuroticism",
      score: neuroticismScore,
      label: getTraitLabel(neuroticismScore),
      description: "You seek emotionally intense soundscapes and late-night listening reflection.",
    },
    disclaimer: RESEARCH_DISCLAIMER,
  };
}
