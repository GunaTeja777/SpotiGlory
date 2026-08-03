/**
 * Trait Card Feedback Store & Target Correction Mapper
 * 
 * Captures user feedback on computed OCEAN trait scores ("accurate", "somewhat", "not_accurate"),
 * maps feedback to corrected target scores, and persists labeled training pairs for ground-truth retraining.
 */

import { PairedScoreSample, SelfReportedOceanScores } from "./ipipQuiz";
import { retrainModel } from "./ridgeRegression";

export type FeedbackRating = "accurate" | "somewhat" | "not_accurate";

export interface TraitFeedbackSample {
  id: string;
  timestamp: string;
  trait: "openness" | "conscientiousness" | "extraversion" | "agreeableness" | "neuroticism";
  predictedScore: number;
  rating: FeedbackRating;
  targetScore: number;
  featureVector?: Record<string, number>;
}

export const FEEDBACK_STORAGE_KEY = "spotiglory_trait_feedback_samples";

/**
 * Calculates target score correction based on user rating.
 * - "accurate": target = predictedScore (no change)
 * - "somewhat": target shifted by +/- 15 points toward mean
 * - "not_accurate": target inverted (100 - predictedScore) for retraining
 */
export function calculateTargetCorrection(predictedScore: number, rating: FeedbackRating): number {
  if (rating === "accurate") {
    return predictedScore;
  }
  if (rating === "somewhat") {
    return predictedScore > 50 ? Math.max(0, predictedScore - 15) : Math.min(100, predictedScore + 15);
  }
  // "not_accurate"
  return Math.min(100, Math.max(0, 100 - predictedScore));
}

/**
 * Creates and persists a trait feedback sample.
 * Triggers retrainModel automatically when 10 feedback samples accumulate.
 */
export function saveTraitFeedbackSample(
  trait: "openness" | "conscientiousness" | "extraversion" | "agreeableness" | "neuroticism",
  predictedScore: number,
  rating: FeedbackRating,
  featureVector?: Record<string, number>
): TraitFeedbackSample {
  const targetScore = calculateTargetCorrection(predictedScore, rating);
  const sample: TraitFeedbackSample = {
    id: `fb_${trait}_${Date.now()}`,
    timestamp: new Date().toISOString(),
    trait,
    predictedScore,
    rating,
    targetScore,
    featureVector,
  };

  if (typeof window !== "undefined" && window.localStorage) {
    const existing = getTraitFeedbackSamples();
    const updated = [...existing, sample];
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));

    // Mirror to spotiglory_ipip_samples format for Pearson r & Ridge Regression solver integration
    mirrorToIpipPairedSamples(sample);

    // Auto-trigger model retraining when 10 feedback samples accumulate
    if (updated.length % 10 === 0) {
      retrainModel({ threshold: 10, force: true });
    }
  }

  return sample;
}

/**
 * Retrieves stored trait feedback samples from localStorage.
 */
export function getTraitFeedbackSamples(): TraitFeedbackSample[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Mirrors trait feedback sample into PairedScoreSample format inside spotiglory_ipip_samples
 */
function mirrorToIpipPairedSamples(feedback: TraitFeedbackSample) {
  const key = "spotiglory_ipip_samples";
  try {
    const raw = localStorage.getItem(key);
    const existing: PairedScoreSample[] = raw ? JSON.parse(raw) : [];

    const baseScores: SelfReportedOceanScores = {
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50,
    };

    const computedScores = { ...baseScores, [feedback.trait]: feedback.predictedScore };
    const selfReportedScores = { ...baseScores, [feedback.trait]: feedback.targetScore };

    const pairedSample: PairedScoreSample = {
      id: feedback.id,
      timestamp: feedback.timestamp,
      computed: computedScores,
      selfReported: selfReportedScores,
    };

    localStorage.setItem(key, JSON.stringify([...existing, pairedSample]));
  } catch (e) {
    // Ignore
  }
}

export interface MoodFeedbackSample {
  id: string;
  timestamp: string;
  inferredMood: string;
  selectedMood: string;
  emoji: string;
}

export const MOOD_STORAGE_KEY = "spotiglory_mood_feedback_samples";

export function saveMoodFeedbackSample(inferredMood: string, selectedMood: string, emoji: string): MoodFeedbackSample {
  const sample: MoodFeedbackSample = {
    id: `mood_${Date.now()}`,
    timestamp: new Date().toISOString(),
    inferredMood,
    selectedMood,
    emoji,
  };
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const existing = getMoodFeedbackSamples();
      localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify([...existing, sample]));
    } catch (e) {
      // Ignore
    }
  }
  return sample;
}

export function getMoodFeedbackSamples(): MoodFeedbackSample[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }
  try {
    const raw = localStorage.getItem(MOOD_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
