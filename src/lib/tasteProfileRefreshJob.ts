import cron from "node-cron";
import { prisma } from "./prisma";
import { getCachedTasteProfile, buildUserTasteProfile, saveTasteProfileToDb } from "./userTasteProfile";
import { computeBehavioralFeatures } from "./features";
import { getRecentlyPlayed, getTopArtists, getTopTracks } from "./spotify";

let cronStarted = false;

/**
 * Background refresh job running every 12 hours.
 * Recomputes taste profile for all active users with records updated in the last 7 days.
 */
export function initTasteProfileCronJob() {
  if (cronStarted) return;
  cronStarted = true;

  // Run every 12 hours
  cron.schedule("0 */12 * * *", async () => {
    try {
      const SEVEN_DAYS_AGO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Find users active within the last 7 days
      const activeUserRows = await prisma.userTasteProfile.findMany({
        where: {
          computed_at: {
            gte: SEVEN_DAYS_AGO,
          },
        },
      });

      for (const userRow of activeUserRows) {
        try {
          // Trigger refresh for user
          const profile = buildUserTasteProfile([], undefined, userRow.preferred_language);
          await saveTasteProfileToDb(userRow.user_id, profile);
        } catch (e) {
          // Continue with next user
        }
      }
    } catch (e) {
      // Graceful error handling for background cron
    }
  });
}

/**
 * Login Hook: Ensures a fresh taste profile is computed/persisted on user login if
 * computed_at is stale (>12h) or missing.
 */
export async function ensureFreshTasteProfileOnLogin(
  userId: string,
  accessToken?: string,
  userSelectedLanguage?: string | null
) {
  if (!userId) return null;

  // 1. Check if cached taste profile is fresh (<= 12h)
  const cached = await getCachedTasteProfile(userId);
  if (cached) {
    return {
      topGenres: cached.top_genres,
      preferredLanguage: cached.preferred_language,
      dominantMusicCluster: cached.dominant_cluster,
    };
  }

  // 2. Cache is missing or stale (>12h) — trigger recompute
  let recentlyPlayed: any[] = [];
  let shortTermArtists: any[] = [];
  let mediumTermArtists: any[] = [];
  let shortTermTracks: any[] = [];

  if (accessToken) {
    try {
      const [rpRes, staRes, mtaRes, sttRes] = await Promise.all([
        getRecentlyPlayed(accessToken, 50).catch(() => ({ items: [] })),
        getTopArtists(accessToken, "short_term", 30).catch(() => ({ items: [] })),
        getTopArtists(accessToken, "medium_term", 30).catch(() => ({ items: [] })),
        getTopTracks(accessToken, "short_term", 30).catch(() => ({ items: [] })),
      ]);
      recentlyPlayed = rpRes.items || [];
      shortTermArtists = staRes.items || [];
      mediumTermArtists = mtaRes.items || [];
      shortTermTracks = sttRes.items || [];
    } catch (e) {
      // Fallback to defaults
    }
  }

  const allArtistsMap = new Map();
  [...shortTermArtists, ...mediumTermArtists].forEach((a) => {
    if (a && (a.id || a.name) && !allArtistsMap.has(a.id || a.name)) {
      allArtistsMap.set(a.id || a.name, a);
    }
  });
  const combinedArtists = Array.from(allArtistsMap.values());

  const features = computeBehavioralFeatures(
    shortTermTracks,
    combinedArtists,
    recentlyPlayed,
    shortTermArtists,
    mediumTermArtists
  );

  const profile = buildUserTasteProfile(combinedArtists, features, userSelectedLanguage, userId);
  await saveTasteProfileToDb(userId, profile, features);

  return profile;
}
