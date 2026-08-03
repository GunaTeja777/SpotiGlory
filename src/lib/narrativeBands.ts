/**
 * Deterministic Qualitative Grounding & Score Band Mapper
 * 
 * Maps raw numeric scores to explicit qualitative bands (very_low, low, moderate, high, very_high)
 * in deterministic TypeScript BEFORE passing data to the LLM.
 * Prohibits the LLM from inventing contradictory number-to-label mappings.
 */

import { OceanScoresResult } from "./oceanScoring";
import { BehavioralFeatures } from "./features";

export type ScoreBand = "very_low" | "low" | "moderate" | "high" | "very_high";

export interface TraitGrounding {
  trait: string;
  score: number;
  band: ScoreBand;
  label: string;
  allowedKeywords: string[];
}

export interface GroundedNarrativeContext {
  openness: TraitGrounding;
  conscientiousness: TraitGrounding;
  extraversion: TraitGrounding;
  agreeableness: TraitGrounding;
  neuroticism: TraitGrounding;
  genreDiversityBand: ScoreBand;
  popularityBand: ScoreBand;
  nightRatioBand: ScoreBand;
}

export function getScoreBand(score: number): ScoreBand {
  if (score < 25) return "very_low";
  if (score < 45) return "low";
  if (score < 65) return "moderate";
  if (score < 85) return "high";
  return "very_high";
}

const TRAIT_LABELS: Record<string, Record<ScoreBand, { label: string; keywords: string[] }>> = {
  openness: {
    very_low: { label: "Hyper-Focused & Consistent", keywords: ["niche", "focused", "specialized", "consistent"] },
    low: { label: "Selective & Familiar", keywords: ["familiar", "signature", "selective", "curated"] },
    moderate: { label: "Balanced Exploration", keywords: ["balanced", "eclectic", "adaptable", "open"] },
    high: { label: "Broad & Experimental", keywords: ["experimental", "adventuresome", "diverse", "exploratory"] },
    very_high: { label: "Boundless Sonic Explorer", keywords: ["unbounded", "boundary-pushing", "innovative", "eclectic"] },
  },
  conscientiousness: {
    very_low: { label: "Spontaneous & Unstructured", keywords: ["spontaneous", "fluid", "unpredictable", "freeform"] },
    low: { label: "Flexible & Mood-Driven", keywords: ["flexible", "mood-driven", "varied", "intuitive"] },
    moderate: { label: "Steady Listening Habits", keywords: ["steady", "balanced", "regular", "habitual"] },
    high: { label: "Structured & Loyal Focus", keywords: ["structured", "loyal", "methodical", "focused"] },
    very_high: { label: "Disciplined Discography Scholar", keywords: ["disciplined", "scholarly", "systematic", "dedicated"] },
  },
  extraversion: {
    very_low: { label: "Introspective & Solitary", keywords: ["introspective", "solitary", "quiet", "contemplative"] },
    low: { label: "Reflective & Intimate", keywords: ["reflective", "intimate", "subtle", "understated"] },
    moderate: { label: "Versatile Social Vibe", keywords: ["versatile", "balanced", "adaptable", "social"] },
    high: { label: "Upbeat & High Energy", keywords: ["upbeat", "energetic", "vibrant", "socially-resonant"] },
    very_high: { label: "Electric & Anthem-Driven", keywords: ["electric", "anthem-driven", "exuberant", "dynamic"] },
  },
  agreeableness: {
    very_low: { label: "Raw & Uncompromising", keywords: ["raw", "uncompromising", "edgy", "direct"] },
    low: { label: "Intense & Rebellious", keywords: ["intense", "rebellious", "cathartic", "bold"] },
    moderate: { label: "Harmonious & Accessible", keywords: ["harmonious", "accessible", "pleasant", "inviting"] },
    high: { label: "Uplifting & Welcoming", keywords: ["uplifting", "welcoming", "warm", "soothing"] },
    very_high: { label: "Pure Sonic Empathy", keywords: ["empathic", "unifying", "comforting", "radiant"] },
  },
  neuroticism: {
    very_low: { label: "Serene & Grounded", keywords: ["serene", "grounded", "calm", "tranquil"] },
    low: { label: "Even-Keeled & Stable", keywords: ["stable", "composed", "steady", "balanced"] },
    moderate: { label: "Emotionally Dynamic", keywords: ["dynamic", "expressive", "resilient", "nuanced"] },
    high: { label: "Atmospheric & Nocturnal", keywords: ["atmospheric", "nocturnal", "reflective", "evocative"] },
    very_high: { label: "Deep Emotional Intensity", keywords: ["intense", "deeply-felt", "cathartic", "haunting"] },
  },
};

export function computeNarrativeGrounding(
  ocean: OceanScoresResult,
  features: BehavioralFeatures
): GroundedNarrativeContext {
  const getGrounding = (traitName: keyof typeof TRAIT_LABELS, score: number): TraitGrounding => {
    const band = getScoreBand(score);
    const config = TRAIT_LABELS[traitName][band];
    return {
      trait: traitName.charAt(0).toUpperCase() + traitName.slice(1),
      score,
      band,
      label: config.label,
      allowedKeywords: config.keywords,
    };
  };

  return {
    openness: getGrounding("openness", ocean.openness.score),
    conscientiousness: getGrounding("conscientiousness", ocean.conscientiousness.score),
    extraversion: getGrounding("extraversion", ocean.extraversion.score),
    agreeableness: getGrounding("agreeableness", ocean.agreeableness.score),
    neuroticism: getGrounding("neuroticism", ocean.neuroticism.score),
    genreDiversityBand: getScoreBand(Math.round((features.genreDiversity?.normalizedEntropy || 0) * 100)),
    popularityBand: getScoreBand(features.avgArtistPopularity || 50),
    nightRatioBand: getScoreBand(features.nightListenerRatio || 0),
  };
}
