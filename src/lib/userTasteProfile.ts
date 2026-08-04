import { SpotifyArtist } from "./spotify";
import { BehavioralFeatures, GenreDistributionItem } from "./features";
import { computeClusterDistribution } from "./genreClusters";

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
  const allGenreText = [
    ...artists.flatMap((a) => a.genres || []),
    ...topGenres,
    ...artists.map((a) => a.name || ""),
  ]
    .join(" ")
    .toLowerCase();

  const artistNamesLower = artists.map((a) => (a.name || "").toLowerCase()).join(" ");

  // Artist name matching signals
  if (
    allGenreText.includes("tamil") ||
    allGenreText.includes("kollywood") ||
    artistNamesLower.includes("anirudh") ||
    artistNamesLower.includes("ravichander") ||
    artistNamesLower.includes("sai abhyankkar") ||
    artistNamesLower.includes("harris jayaraj") ||
    artistNamesLower.includes("santhosh narayanan") ||
    artistNamesLower.includes("yuvan shankar raja") ||
    artistNamesLower.includes("gv prakash")
  ) {
    return "Tamil";
  }
  if (
    allGenreText.includes("telugu") ||
    allGenreText.includes("tollywood") ||
    artistNamesLower.includes("devi sri prasad") ||
    artistNamesLower.includes("thaman") ||
    artistNamesLower.includes("sid sriram") ||
    artistNamesLower.includes("hesham abdul wahab")
  ) {
    return "Telugu";
  }
  if (
    allGenreText.includes("hindi") ||
    allGenreText.includes("bollywood") ||
    allGenreText.includes("filmi") ||
    allGenreText.includes("desi") ||
    allGenreText.includes("indian pop") ||
    artistNamesLower.includes("arijit singh") ||
    artistNamesLower.includes("pritam") ||
    artistNamesLower.includes("shreya ghoshal") ||
    artistNamesLower.includes("atif aslam") ||
    artistNamesLower.includes("neha kakkar") ||
    artistNamesLower.includes("badshah") ||
    artistNamesLower.includes("jubin nautiyal") ||
    artistNamesLower.includes("sachin-jigar") ||
    artistNamesLower.includes("b praak")
  ) {
    return "Hindi";
  }
  if (
    allGenreText.includes("punjabi") ||
    allGenreText.includes("bhangra") ||
    artistNamesLower.includes("diljit") ||
    artistNamesLower.includes("ap dhillon") ||
    artistNamesLower.includes("karan aujla") ||
    artistNamesLower.includes("sidhu moose") ||
    artistNamesLower.includes("shubh") ||
    artistNamesLower.includes("guru randhawa")
  ) {
    return "Punjabi";
  }
  if (allGenreText.includes("malayalam") || allGenreText.includes("mollywood")) {
    return "Malayalam";
  }
  if (allGenreText.includes("kannada")) {
    return "Kannada";
  }
  if (
    allGenreText.includes("latin") ||
    allGenreText.includes("reggaeton") ||
    allGenreText.includes("spanish") ||
    allGenreText.includes("salsa") ||
    allGenreText.includes("bachata") ||
    artistNamesLower.includes("bad bunny") ||
    artistNamesLower.includes("rauw alejandro") ||
    artistNamesLower.includes("rosalía") ||
    artistNamesLower.includes("daddy yankee") ||
    artistNamesLower.includes("j balvin")
  ) {
    return "Spanish";
  }
  if (allGenreText.includes("k-pop") || allGenreText.includes("korean") || artistNamesLower.includes("bts") || artistNamesLower.includes("blackpink")) {
    return "Korean";
  }
  if (
    allGenreText.includes("j-pop") ||
    allGenreText.includes("j-rock") ||
    allGenreText.includes("anime") ||
    allGenreText.includes("japanese")
  ) {
    return "Japanese";
  }
  if (allGenreText.includes("french") || allGenreText.includes("chanson") || artistNamesLower.includes("indila") || artistNamesLower.includes("stromae")) {
    return "French";
  }
  if (allGenreText.includes("german") || allGenreText.includes("deutschrock")) {
    return "German";
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

import { prisma } from "./prisma";

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
