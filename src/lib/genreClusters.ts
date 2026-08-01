import { GenreDistributionItem } from "./features";

export type ClusterKey = 
  | "reflectiveComplex" 
  | "intenseRebellious" 
  | "upbeatConventional" 
  | "energeticRhythmic";

export interface ClusterDistribution {
  reflectiveComplex: number; // Percentage 0..100
  intenseRebellious: number; // Percentage 0..100
  upbeatConventional: number; // Percentage 0..100
  energeticRhythmic: number; // Percentage 0..100
  other: number; // Percentage 0..100
  dominantCluster: ClusterKey | "other";
}

/**
 * MUSIC Model Keyword Lists based on Rentfrow & Gosling (2003)
 */
const CLUSTER_KEYWORDS: Record<ClusterKey, string[]> = {
  reflectiveComplex: [
    "jazz", "classical", "blues", "folk", "world", "singer-songwriter",
    "ambient", "chamber", "bossa nova", "baroque", "acoustic", "compositional",
    "orchestral", "neo-classical", "indie folk", "traditional", "opera", "soul"
  ],
  intenseRebellious: [
    "rock", "metal", "punk", "alternative", "grunge", "hardcore", "emo",
    "post-rock", "thrash", "screamo", "indie rock", "garage", "shoegaze",
    "heavy metal", "death metal", "nu metal", "post-punk", "industrial"
  ],
  upbeatConventional: [
    "pop", "country", "christian", "gospel", "easy listening", "show tunes",
    "dance pop", "synthpop", "teen pop", "europop", "bubblegum", "boy band",
    "soundtrack", "latin pop"
  ],
  energeticRhythmic: [
    "hip-hop", "hip hop", "rap", "r&b", "electronic", "dance", "edm",
    "techno", "house", "trap", "dubstep", "funk", "disco", "reggaeton",
    "afrobeats", "urban", "grime", "drill", "trance", "drum and bass"
  ]
};

/**
 * Maps a genre string to one of Rentfrow & Gosling's 4 MUSIC clusters using substring keyword matching.
 */
export function categorizeGenre(genre: string): ClusterKey | "other" {
  const normalized = genre.toLowerCase().trim();
  if (!normalized) return "other";

  // Match longer keywords first for specificity
  for (const [clusterKey, keywords] of Object.entries(CLUSTER_KEYWORDS) as [ClusterKey, string[]][]) {
    for (const keyword of keywords) {
      if (normalized.includes(keyword)) {
        return clusterKey;
      }
    }
  }

  return "other";
}

/**
 * Computes percentage breakdown across Rentfrow & Gosling's 4 MUSIC clusters from a genre frequency distribution.
 */
export function computeClusterDistribution(
  genreDistribution: GenreDistributionItem[] = []
): ClusterDistribution {
  const counts: Record<ClusterKey | "other", number> = {
    reflectiveComplex: 0,
    intenseRebellious: 0,
    upbeatConventional: 0,
    energeticRhythmic: 0,
    other: 0,
  };

  let totalCount = 0;

  genreDistribution.forEach((item) => {
    const cluster = categorizeGenre(item.genre);
    counts[cluster] += item.count;
    totalCount += item.count;
  });

  const getPercent = (c: number) => (totalCount > 0 ? Math.round((c / totalCount) * 100) : 0);

  const reflectiveComplex = getPercent(counts.reflectiveComplex);
  const intenseRebellious = getPercent(counts.intenseRebellious);
  const upbeatConventional = getPercent(counts.upbeatConventional);
  const energeticRhythmic = getPercent(counts.energeticRhythmic);
  const other = getPercent(counts.other);

  // Find dominant cluster
  const clusterMap: Record<ClusterKey | "other", number> = {
    reflectiveComplex,
    intenseRebellious,
    upbeatConventional,
    energeticRhythmic,
    other,
  };

  let dominantCluster: ClusterKey | "other" = "other";
  let maxPercent = -1;

  (Object.keys(clusterMap) as (ClusterKey | "other")[]).forEach((key) => {
    if (clusterMap[key] > maxPercent) {
      maxPercent = clusterMap[key];
      dominantCluster = key;
    }
  });

  return {
    reflectiveComplex,
    intenseRebellious,
    upbeatConventional,
    energeticRhythmic,
    other,
    dominantCluster,
  };
}
