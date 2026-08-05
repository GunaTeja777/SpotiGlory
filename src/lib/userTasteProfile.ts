import { SpotifyArtist } from "./spotify";
import { BehavioralFeatures, GenreDistributionItem } from "./features";
import { computeClusterDistribution } from "./genreClusters";
import { prisma } from "./prisma";

export const SUPPORTED_LANGUAGES = [
  "English",
  "Hindi",
  "Telugu",
  "Tamil",
  "Spanish",
  "Punjabi",
  "Korean",
  "Japanese",
  "Malayalam",
  "Kannada",
  "French",
  "German",
  "Portuguese",
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export interface UserTasteProfile {
  topGenres: string[];
  preferredLanguage: string;
  dominantMusicCluster: string;
}

/**
 * Infers user's primary music language preference from artist genres and market signals.
 */
export function inferLanguageFromArtists(
  artists: SpotifyArtist[] = [],
  topGenres: string[] = []
): string {
  const counts: Record<string, number> = {
    Tamil: 0,
    Telugu: 0,
    Hindi: 0,
    Punjabi: 0,
    Spanish: 0,
    Korean: 0,
    Japanese: 0,
    Malayalam: 0,
    Kannada: 0,
    French: 0,
    German: 0
  };

  const mappingsList = cachedMappings || DEFAULT_MAPPINGS;

  artists.forEach((artist) => {
    const name = (artist.name || "").toLowerCase();
    const genres = (artist.genres || []).map((g) => g.toLowerCase());
    const combinedText = [name, ...genres].join(" ");

    mappingsList.forEach((mapping) => {
      if (mapping.type === "genre") {
        if (combinedText.includes(mapping.pattern.toLowerCase())) {
          counts[mapping.language] = (counts[mapping.language] || 0) + 1;
        }
      } else if (mapping.type === "artist") {
        if (name.includes(mapping.pattern.toLowerCase())) {
          counts[mapping.language] = (counts[mapping.language] || 0) + 1;
        }
      }
    });
  });

  topGenres.forEach((genre) => {
    const norm = genre.toLowerCase();
    mappingsList.forEach((mapping) => {
      if (mapping.type === "genre" && norm.includes(mapping.pattern.toLowerCase())) {
        counts[mapping.language] = (counts[mapping.language] || 0) + 1;
      }
    });
  });

  let bestLang = "English";
  let maxCount = 0;

  Object.entries(counts).forEach(([lang, count]) => {
    if (count > maxCount) {
      maxCount = count;
      bestLang = lang;
    }
  });

  const threshold = artists.length <= 2 ? 1 : 3;
  if (maxCount >= threshold) {
    return bestLang;
  }

  return "English";
}

/**
 * Extracts top 5-10 genres sorted by frequency from top artists and behavioral features.
 */
export function extractTopGenres(
  artists: SpotifyArtist[] = [],
  behavioralFeatures?: BehavioralFeatures,
  limit: number = 8
): string[] {
  const genreCountMap: Record<string, number> = {};

  // 1. Accumulate genres from artists array
  artists.forEach((artist) => {
    artist.genres?.forEach((g) => {
      const normalized = g.trim().toLowerCase();
      if (normalized) {
        genreCountMap[normalized] = (genreCountMap[normalized] || 0) + 1;
      }
    });
  });

  // 2. If artists list yielded genres, sort and take top N
  let sortedGenres = Object.entries(genreCountMap)
    .sort((a, b) => b[1] - a[1])
    .map(([genre]) => genre);

  // 3. Fall back to behavioralFeatures.topGenreDistribution if available
  if (sortedGenres.length < 3 && behavioralFeatures?.topGenreDistribution) {
    const featGenres = behavioralFeatures.topGenreDistribution.map((item) => item.genre.toLowerCase());
    sortedGenres = Array.from(new Set([...sortedGenres, ...featGenres]));
  }

  // 4. Default fallback if still fewer than 5 genres
  if (sortedGenres.length < 5) {
    const defaults = ["indie pop", "synthwave", "alternative rock", "lo-fi", "pop", "electronic", "acoustic", "r&b"];
    sortedGenres = Array.from(new Set([...sortedGenres, ...defaults]));
  }

  const boundedLimit = Math.max(5, Math.min(10, limit));
  return sortedGenres.slice(0, boundedLimit);
}

/**
 * Helper to resolve human-readable dominant music cluster label.
 */
export function getDominantClusterLabel(distribution: GenreDistributionItem[] = []): string {
  const dist = computeClusterDistribution(distribution);
  switch (dist.dominantCluster) {
    case "reflectiveComplex":
      return "Reflective & Complex";
    case "intenseRebellious":
      return "Intense & Rebellious";
    case "upbeatConventional":
      return "Upbeat & Conventional";
    case "energeticRhythmic":
      return "Energetic & Rhythmic";
    default:
      return "Diverse & Eclectic";
  }
}

export interface UserTasteProfileRecord {
  user_id: string;
  top_genres: string[];
  preferred_language: string;
  dominant_cluster: string;
  entropy: number;
  loyalty: number;
  computed_at: Date;
  version: number;
}

/**
 * Returns cached taste profile from user_taste_profiles table if computed_at is within 12 hours,
 * otherwise returns null.
 */
export async function getCachedTasteProfile(userId: string): Promise<UserTasteProfileRecord | null> {
  if (!userId) return null;
  try {
    const row = await prisma.userTasteProfile.findUnique({
      where: { user_id: userId },
    });

    if (!row || !row.computed_at) return null;

    const ageInMs = Date.now() - new Date(row.computed_at).getTime();
    const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

    if (ageInMs <= TWELVE_HOURS_MS) {
      const genres = Array.isArray(row.top_genres)
        ? (row.top_genres as string[])
        : typeof row.top_genres === "string"
        ? JSON.parse(row.top_genres)
        : [];

      return {
        user_id: row.user_id,
        top_genres: genres,
        preferred_language: row.preferred_language,
        dominant_cluster: row.dominant_cluster,
        entropy: row.entropy,
        loyalty: row.loyalty,
        computed_at: new Date(row.computed_at),
        version: row.version,
      };
    }

    return null; // Expired (>12h)
  } catch (e) {
    // Graceful fallback if database connection is not configured or offline
    return null;
  }
}

/**
 * Writes computed taste profile record to user_taste_profiles database table.
 */
export async function saveTasteProfileToDb(
  userId: string,
  profile: UserTasteProfile,
  behavioralFeatures?: BehavioralFeatures
): Promise<UserTasteProfileRecord | null> {
  if (!userId) return null;

  const entropy = behavioralFeatures?.genreDiversity?.normalizedEntropy ?? 0;
  const loyalty = behavioralFeatures?.artistLoyalty ?? 1;

  try {
    const row = await prisma.userTasteProfile.upsert({
      where: { user_id: userId },
      update: {
        top_genres: profile.topGenres,
        preferred_language: profile.preferredLanguage,
        dominant_cluster: profile.dominantMusicCluster,
        entropy,
        loyalty,
        computed_at: new Date(),
        version: { increment: 1 },
      },
      create: {
        user_id: userId,
        top_genres: profile.topGenres,
        preferred_language: profile.preferredLanguage,
        dominant_cluster: profile.dominantMusicCluster,
        entropy,
        loyalty,
        computed_at: new Date(),
        version: 1,
      },
    });

    const genres = Array.isArray(row.top_genres)
      ? (row.top_genres as string[])
      : [];

    return {
      user_id: row.user_id,
      top_genres: genres,
      preferred_language: row.preferred_language,
      dominant_cluster: row.dominant_cluster,
      entropy: row.entropy,
      loyalty: row.loyalty,
      computed_at: new Date(row.computed_at),
      version: row.version,
    };
  } catch (e) {
    return null;
  }
}

/**
 * Builds combined User Taste Profile for playlist sourcing.
 * Returns: { topGenres: string[], preferredLanguage: string, dominantMusicCluster: string }
 */
export function buildUserTasteProfile(
  artists: SpotifyArtist[] = [],
  behavioralFeatures?: BehavioralFeatures,
  userSelectedLanguage?: string | null,
  userId?: string | null
): UserTasteProfile {
  const topGenres = extractTopGenres(artists, behavioralFeatures, 8);

  const preferredLanguage =
    userSelectedLanguage && userSelectedLanguage.trim().length > 0
      ? userSelectedLanguage.trim()
      : inferLanguageFromArtists(artists, topGenres);

  let dominantMusicCluster = "Reflective & Complex";
  if (behavioralFeatures?.topGenreDistribution && behavioralFeatures.topGenreDistribution.length > 0) {
    dominantMusicCluster = getDominantClusterLabel(behavioralFeatures.topGenreDistribution);
  } else if (topGenres.length > 0) {
    const mockDistribution: GenreDistributionItem[] = topGenres.map((g, idx) => ({
      genre: g,
      count: topGenres.length - idx,
      percentage: Math.round((1 / topGenres.length) * 100),
    }));
    dominantMusicCluster = getDominantClusterLabel(mockDistribution);
  }

  const profile: UserTasteProfile = {
    topGenres,
    preferredLanguage,
    dominantMusicCluster,
  };

  if (userId && typeof userId === "string" && userId.trim().length > 0) {
    // Write output to database table
    saveTasteProfileToDb(userId, profile, behavioralFeatures).catch(() => {});
  }

  return profile;
}

export const DEFAULT_MAPPINGS = [
  { language: "Tamil", type: "genre", pattern: "tamil" },
  { language: "Tamil", type: "genre", pattern: "kollywood" },
  { language: "Tamil", type: "artist", pattern: "anirudh" },
  { language: "Tamil", type: "artist", pattern: "ravichander" },
  { language: "Tamil", type: "artist", pattern: "sai abhyankkar" },
  { language: "Tamil", type: "artist", pattern: "harris jayaraj" },
  { language: "Tamil", type: "artist", pattern: "santhosh narayanan" },
  { language: "Tamil", type: "artist", pattern: "yuvan shankar raja" },
  { language: "Tamil", type: "artist", pattern: "gv prakash" },

  { language: "Telugu", type: "genre", pattern: "telugu" },
  { language: "Telugu", type: "genre", pattern: "tollywood" },
  { language: "Telugu", type: "artist", pattern: "devi sri prasad" },
  { language: "Telugu", type: "artist", pattern: "thaman" },
  { language: "Telugu", type: "artist", pattern: "sid sriram" },
  { language: "Telugu", type: "artist", pattern: "hesham abdul wahab" },

  { language: "Hindi", type: "genre", pattern: "hindi" },
  { language: "Hindi", type: "genre", pattern: "bollywood" },
  { language: "Hindi", type: "genre", pattern: "filmi" },
  { language: "Hindi", type: "genre", pattern: "desi" },
  { language: "Hindi", type: "genre", pattern: "indian pop" },
  { language: "Hindi", type: "artist", pattern: "arijit" },
  { language: "Hindi", type: "artist", pattern: "pritam" },
  { language: "Hindi", type: "artist", pattern: "shreya" },
  { language: "Hindi", type: "artist", pattern: "atif aslam" },
  { language: "Hindi", type: "artist", pattern: "neha kakkar" },
  { language: "Hindi", type: "artist", pattern: "badshah" },
  { language: "Hindi", type: "artist", pattern: "jubin nautiyal" },
  { language: "Hindi", type: "artist", pattern: "sachin-jigar" },
  { language: "Hindi", type: "artist", pattern: "b praak" },

  { language: "Punjabi", type: "genre", pattern: "punjabi" },
  { language: "Punjabi", type: "genre", pattern: "bhangra" },
  { language: "Punjabi", type: "artist", pattern: "diljit" },
  { language: "Punjabi", type: "artist", pattern: "ap dhillon" },
  { language: "Punjabi", type: "artist", pattern: "karan aujla" },
  { language: "Punjabi", type: "artist", pattern: "sidhu moose" },
  { language: "Punjabi", type: "artist", pattern: "shubh" },
  { language: "Punjabi", type: "artist", pattern: "guru randhawa" },

  { language: "Malayalam", type: "genre", pattern: "malayalam" },
  { language: "Malayalam", type: "genre", pattern: "mollywood" },

  { language: "Kannada", type: "genre", pattern: "kannada" },

  { language: "Spanish", type: "genre", pattern: "latin" },
  { language: "Spanish", type: "genre", pattern: "reggaeton" },
  { language: "Spanish", type: "genre", pattern: "spanish" },
  { language: "Spanish", type: "genre", pattern: "salsa" },
  { language: "Spanish", type: "genre", pattern: "bachata" },
  { language: "Spanish", type: "artist", pattern: "bad bunny" },
  { language: "Spanish", type: "artist", pattern: "rauw alejandro" },
  { language: "Spanish", type: "artist", pattern: "rosalía" },
  { language: "Spanish", type: "artist", pattern: "daddy yankee" },
  { language: "Spanish", type: "artist", pattern: "j balvin" },

  { language: "Korean", type: "genre", pattern: "k-pop" },
  { language: "Korean", type: "genre", pattern: "korean" },
  { language: "Korean", type: "artist", pattern: "bts" },
  { language: "Korean", type: "artist", pattern: "blackpink" },

  { language: "Japanese", type: "genre", pattern: "j-pop" },
  { language: "Japanese", type: "genre", pattern: "j-rock" },
  { language: "Japanese", type: "genre", pattern: "anime" },
  { language: "Japanese", type: "genre", pattern: "japanese" },

  { language: "French", type: "genre", pattern: "french" },
  { language: "French", type: "genre", pattern: "chanson" },
  { language: "French", type: "artist", pattern: "indila" },
  { language: "French", type: "artist", pattern: "stromae" },

  { language: "German", type: "genre", pattern: "german" },
  { language: "German", type: "genre", pattern: "deutschrock" }
];

export let cachedMappings: { language: string; type: string; pattern: string }[] | null = null;

export async function ensureMappingsLoaded() {
  if (cachedMappings !== null) return cachedMappings;
  try {
    let rows = await prisma.languageMapping.findMany();
    if (rows.length === 0) {
      const toInsert = DEFAULT_MAPPINGS.map(m => ({
        language: m.language,
        type: m.type,
        pattern: m.pattern
      }));
      await prisma.languageMapping.createMany({ data: toInsert });
      rows = await prisma.languageMapping.findMany();
    }
    cachedMappings = rows;
    return cachedMappings;
  } catch (e) {
    console.error("Failed to load mappings from database, falling back to defaults", e);
    cachedMappings = DEFAULT_MAPPINGS;
    return cachedMappings;
  }
}
