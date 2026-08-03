/**
 * Mini-IPIP Ground Truth Validation & Pearson Correlation Module
 * 
 * Implements a 10-item Mini-IPIP (International Personality Item Pool) self-report inventory
 * to validate computed Spotify OCEAN scores against ground-truth self-report data.
 */

export interface IpipQuestion {
  id: string;
  trait: "openness" | "conscientiousness" | "extraversion" | "agreeableness" | "neuroticism";
  text: string;
  isReversed?: boolean;
}

export const MINI_IPIP_QUESTIONS: IpipQuestion[] = [
  { id: "q1", trait: "openness", text: "I have a vivid imagination and love exploring new artistic ideas." },
  { id: "q2", trait: "openness", text: "I enjoy abstract thinking and deep creative concepts." },
  { id: "q3", trait: "conscientiousness", text: "I get chores and tasks done right away without procrastinating." },
  { id: "q4", trait: "conscientiousness", text: "I pay attention to details and keep my schedule organized." },
  { id: "q5", trait: "extraversion", text: "I am the life of the party and feel energized around large groups." },
  { id: "q6", trait: "extraversion", text: "I start conversations easily with new people." },
  { id: "q7", trait: "agreeableness", text: "I sympathize with others' feelings and value harmony in relationships." },
  { id: "q8", trait: "agreeableness", text: "I make people feel at ease and value warm social connections." },
  { id: "q9", trait: "neuroticism", text: "I get stressed or anxious easily when facing unexpected changes." },
  { id: "q10", trait: "neuroticism", text: "I frequently worry about things and experience intense emotional shifts." },
];

export interface SelfReportedOceanScores {
  openness: number; // 0..100
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface PairedScoreSample {
  id: string;
  timestamp: string;
  computed: SelfReportedOceanScores;
  selfReported: SelfReportedOceanScores;
}

export interface PearsonResult {
  trait: string;
  r: number; // -1.0 .. 1.0
  sampleSize: number;
  interpretation: string;
}

/**
 * Calculates self-reported OCEAN scores (0..100) from 1-5 Likert scale Mini-IPIP answers.
 */
export function computeIpipSelfReportScores(answers: Record<string, number>): SelfReportedOceanScores {
  const traitSums: Record<string, number> = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0,
  };

  MINI_IPIP_QUESTIONS.forEach((q) => {
    const rawVal = answers[q.id] || 3;
    const score = q.isReversed ? 6 - rawVal : rawVal;
    traitSums[q.trait] += score;
  });

  // Each trait has 2 questions (max 10, min 2). Rescale (sum - 2) / 8 * 100
  const rescale = (sum: number) => Math.min(100, Math.max(0, Math.round(((sum - 2) / 8) * 100)));

  return {
    openness: rescale(traitSums.openness),
    conscientiousness: rescale(traitSums.conscientiousness),
    extraversion: rescale(traitSums.extraversion),
    agreeableness: rescale(traitSums.agreeableness),
    neuroticism: rescale(traitSums.neuroticism),
  };
}

/**
 * Computes Pearson correlation coefficient (r) between computed and self-reported scores.
 */
export function calculatePearsonCorrelation(pairs: Array<{ x: number; y: number }>): number {
  const n = pairs.length;
  if (n < 2) return 0;

  const meanX = pairs.reduce((sum, p) => sum + p.x, 0) / n;
  const meanY = pairs.reduce((sum, p) => sum + p.y, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  pairs.forEach((p) => {
    const diffX = p.x - meanX;
    const diffY = p.y - meanY;
    num += diffX * diffY;
    denX += diffX * diffX;
    denY += diffY * diffY;
  });

  if (denX === 0 || denY === 0) return 0;
  return Number((num / Math.sqrt(denX * denY)).toFixed(3));
}

/**
 * Computes Pearson validation report for all 5 OCEAN traits across paired data samples.
 */
export function evaluateGroundTruthValidation(samples: PairedScoreSample[]): Record<string, PearsonResult> {
  const traits = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"] as const;
  const results: Record<string, PearsonResult> = {};

  traits.forEach((t) => {
    const pairs = samples.map((s) => ({ x: s.computed[t], y: s.selfReported[t] }));
    const r = calculatePearsonCorrelation(pairs);

    let interpretation = "Insufficient data";
    if (samples.length >= 2) {
      if (r >= 0.6) interpretation = "Strong correlation";
      else if (r >= 0.3) interpretation = "Moderate correlation";
      else if (r >= 0.1) interpretation = "Mild correlation";
      else interpretation = "Low correlation (heuristic calibration needed)";
    }

    results[t] = {
      trait: t.charAt(0).toUpperCase() + t.slice(1),
      r,
      sampleSize: samples.length,
      interpretation,
    };
  });

  return results;
}
