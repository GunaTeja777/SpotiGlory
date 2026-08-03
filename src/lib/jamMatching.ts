/**
 * Jam Matching Similarity Engine
 * 
 * Computes multi-dimensional cosine similarity between an active user and candidate listeners
 * (real + synthetic). Normalizes sub-vectors (OCEAN 5D, MUSIC clusters 4D, Mood) prior to weighting:
 * - OCEAN similarity weight: 0.4
 * - MUSIC cluster similarity weight: 0.4
 * - Mood alignment weight: 0.2
 * 
 * Synthesizes plain-English match reason based on specific top overlapping dimensions.
 */

export interface OceanVector {
  openness: number; // 0-100
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface MusicClusterVector {
  reflectiveComplex: number; // 0-100
  intenseRebellious: number;
  upbeatConventional: number;
  energeticRhythmic: number;
}

export type MoodType = "Reflective" | "Energized" | "Fiery" | "Upbeat" | "Calm";

export interface JamCandidateUser {
  id: string;
  name: string;
  avatar: string;
  persona: string;
  headline?: string;
  isSynthetic?: boolean;
  ocean: OceanVector;
  musicClusters: MusicClusterVector;
  currentMood: MoodType;
}

export interface JamMatchResult {
  candidateUser: JamCandidateUser;
  matchScore: number; // 0-100
  matchReason: string;
  dimensionContributions: {
    oceanSimilarity: number; // 0-1.0
    musicSimilarity: number; // 0-1.0
    moodSimilarity: number; // 0-1.0
    topSharedCluster: string;
    topSharedTrait: string;
  };
}

/**
 * Computes cosine similarity between two normalized numeric vectors: cos(theta) = (A . B) / (||A|| * ||B||)
 */
export function computeCosineSimilarity(vA: number[], vB: number[]): number {
  if (vA.length !== vB.length || vA.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vA.length; i++) {
    dotProduct += vA[i] * vB[i];
    normA += vA[i] * vA[i];
    normB += vB[i] * vB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Computes mood alignment score (0.3 to 1.0)
 */
export function computeMoodSimilarity(m1: MoodType, m2: MoodType): number {
  if (m1 === m2) return 1.0;

  // Compatible mood pairs
  const compatiblePairs: Record<MoodType, MoodType[]> = {
    Reflective: ["Calm"],
    Calm: ["Reflective"],
    Energized: ["Fiery", "Upbeat"],
    Fiery: ["Energized"],
    Upbeat: ["Energized"],
  };

  if (compatiblePairs[m1]?.includes(m2)) return 0.7;
  return 0.3;
}

const CLUSTER_LABELS: Record<keyof MusicClusterVector, string> = {
  reflectiveComplex: "Reflective & Complex",
  intenseRebellious: "Intense & Rebellious",
  upbeatConventional: "Upbeat & Conventional",
  energeticRhythmic: "Energetic & Rhythmic",
};

const TRAIT_LABELS: Record<keyof OceanVector, string> = {
  openness: "Openness",
  conscientiousness: "Conscientiousness",
  extraversion: "Extraversion",
  agreeableness: "Agreeableness",
  neuroticism: "Neuroticism",
};

/**
 * Generates a data-driven plain-English explanation highlighting specific overlapping dimensions.
 */
export function generateMatchReason(
  u1Ocean: OceanVector,
  u2Ocean: OceanVector,
  u1Clusters: MusicClusterVector,
  u2Clusters: MusicClusterVector,
  u1Mood: MoodType,
  u2Mood: MoodType
): { reason: string; topSharedCluster: string; topSharedTrait: string } {
  // Find top overlapping MUSIC cluster: dimension with highest product (u1 * u2)
  const clusterKeys = Object.keys(u1Clusters) as (keyof MusicClusterVector)[];
  let bestClusterKey: keyof MusicClusterVector = "reflectiveComplex";
  let maxClusterProd = -1;

  for (const key of clusterKeys) {
    const prod = (u1Clusters[key] / 100) * (u2Clusters[key] / 100);
    if (prod > maxClusterProd) {
      maxClusterProd = prod;
      bestClusterKey = key;
    }
  }

  // Find top overlapping OCEAN trait: trait with smallest absolute difference & highest mean
  const oceanKeys = Object.keys(u1Ocean) as (keyof OceanVector)[];
  let bestTraitKey: keyof OceanVector = "openness";
  let maxTraitOverlap = -1;

  for (const key of oceanKeys) {
    const v1 = u1Ocean[key] / 100;
    const v2 = u2Ocean[key] / 100;
    // Overlap measure: 1 - |v1 - v2|
    const overlap = 1 - Math.abs(v1 - v2);
    if (overlap > maxTraitOverlap) {
      maxTraitOverlap = overlap;
      bestTraitKey = key;
    }
  }

  const sharedCluster = CLUSTER_LABELS[bestClusterKey];
  const sharedTrait = TRAIT_LABELS[bestTraitKey];

  let reason = "";
  if (u1Mood === u2Mood) {
    reason = `You're both ${sharedCluster} listeners with high ${sharedTrait}, both currently in a ${u1Mood} mood.`;
  } else if (computeMoodSimilarity(u1Mood, u2Mood) >= 0.7) {
    reason = `You're both ${sharedCluster} listeners with matching ${sharedTrait}, sharing complementary ${u1Mood} & ${u2Mood} vibes.`;
  } else {
    reason = `Strong alignment in ${sharedCluster} listening with shared ${sharedTrait} patterns.`;
  }

  return {
    reason,
    topSharedCluster: sharedCluster,
    topSharedTrait: sharedTrait,
  };
}

/**
 * Finds top 5 Jam Session matches for the active user sorted by similarity score.
 */
export function findJamMatches(
  activeUser: {
    id: string;
    ocean: OceanVector;
    musicClusters: MusicClusterVector;
    currentMood: MoodType;
  },
  candidates: JamCandidateUser[],
  topN: number = 5
): JamMatchResult[] {
  // Normalize active user sub-vectors to [0, 1]
  const activeOceanVec = [
    activeUser.ocean.openness / 100,
    activeUser.ocean.conscientiousness / 100,
    activeUser.ocean.extraversion / 100,
    activeUser.ocean.agreeableness / 100,
    activeUser.ocean.neuroticism / 100,
  ];

  const activeClusterVec = [
    activeUser.musicClusters.reflectiveComplex / 100,
    activeUser.musicClusters.intenseRebellious / 100,
    activeUser.musicClusters.upbeatConventional / 100,
    activeUser.musicClusters.energeticRhythmic / 100,
  ];

  const results: JamMatchResult[] = [];

  for (const candidate of candidates) {
    // Skip self-match if same ID
    if (candidate.id === activeUser.id) continue;

    // Normalize candidate sub-vectors to [0, 1]
    const candOceanVec = [
      candidate.ocean.openness / 100,
      candidate.ocean.conscientiousness / 100,
      candidate.ocean.extraversion / 100,
      candidate.ocean.agreeableness / 100,
      candidate.ocean.neuroticism / 100,
    ];

    const candClusterVec = [
      candidate.musicClusters.reflectiveComplex / 100,
      candidate.musicClusters.intenseRebellious / 100,
      candidate.musicClusters.upbeatConventional / 100,
      candidate.musicClusters.energeticRhythmic / 100,
    ];

    // Calculate sub-vector similarities BEFORE weighting
    const oceanSim = computeCosineSimilarity(activeOceanVec, candOceanVec);
    const musicSim = computeCosineSimilarity(activeClusterVec, candClusterVec);
    const moodSim = computeMoodSimilarity(activeUser.currentMood, candidate.currentMood);

    // Weighted combined similarity
    const combinedSim = 0.4 * oceanSim + 0.4 * musicSim + 0.2 * moodSim;
    const matchScore = Math.min(100, Math.max(0, Math.round(combinedSim * 100)));

    const { reason, topSharedCluster, topSharedTrait } = generateMatchReason(
      activeUser.ocean,
      candidate.ocean,
      activeUser.musicClusters,
      candidate.musicClusters,
      activeUser.currentMood,
      candidate.currentMood
    );

    results.push({
      candidateUser: candidate,
      matchScore,
      matchReason: reason,
      dimensionContributions: {
        oceanSimilarity: Number(oceanSim.toFixed(3)),
        musicSimilarity: Number(musicSim.toFixed(3)),
        moodSimilarity: Number(moodSim.toFixed(3)),
        topSharedCluster,
        topSharedTrait,
      },
    });
  }

  // Sort descending by matchScore
  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, topN);
}
