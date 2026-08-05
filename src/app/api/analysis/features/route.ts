export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { 
  getTopTracks, 
  getTopArtists, 
  getRecentlyPlayed, 
  SpotifyApiError 
} from "@/lib/spotify";
import { computeBehavioralFeatures } from "@/lib/features";
import { getCachedData, setCachedData } from "@/lib/redis";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("forceRefresh") === "true";

    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      const features = computeBehavioralFeatures([], [], [], [], []);
      return NextResponse.json({
        status: "success",
        isDemo: true,
        timestamp: new Date().toISOString(),
        sampleCounts: { topTracksCount: 0, topArtistsCount: 0, recentlyPlayedCount: 0, shortTermArtistsCount: 0, longTermArtistsCount: 0 },
        features,
      });
    }

    const token = session.accessToken;
    const userId = (session.user as any)?.id || "unknown";
    const cacheKey = `analysis:features:${userId}`;

    if (!forceRefresh) {
      const cached = await getCachedData<any>(cacheKey);
      if (cached) {
        return NextResponse.json({
          ...cached,
          fromCache: true,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Fetch Spotify datasets in parallel
    const [topTracksRes, topArtistsRes, recentlyPlayedRes, shortTermArtistsRes, longTermArtistsRes] =
      await Promise.all([
        getTopTracks(token, "medium_term", 50).catch(() => ({ items: [] })),
        getTopArtists(token, "medium_term", 50).catch(() => ({ items: [] })),
        getRecentlyPlayed(token, 50).catch(() => ({ items: [] })),
        getTopArtists(token, "short_term", 50).catch(() => ({ items: [] })),
        getTopArtists(token, "long_term", 50).catch(() => ({ items: [] })),
      ]);

    const topTracks = topTracksRes.items || [];
    const topArtists = topArtistsRes.items || [];
    const recentlyPlayed = recentlyPlayedRes.items || [];
    const shortTermArtists = shortTermArtistsRes.items || [];
    const longTermArtists = longTermArtistsRes.items || [];

    // Compute behavioral feature vector
    const features = computeBehavioralFeatures(
      topTracks,
      topArtists,
      recentlyPlayed,
      shortTermArtists,
      longTermArtists
    );

    const payload = {
      status: "success",
      sampleCounts: {
        topTracksCount: topTracks.length,
        topArtistsCount: topArtists.length,
        recentlyPlayedCount: recentlyPlayed.length,
        shortTermArtistsCount: shortTermArtists.length,
        longTermArtistsCount: longTermArtists.length,
      },
      features,
    };

    await setCachedData(cacheKey, payload, 600); // 10 minutes cache TTL

    return NextResponse.json({
      ...payload,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Feature engineering API error:", error);
    return NextResponse.json(
      { error: "Failed to compute behavioral features" },
      { status: 500 }
    );
  }
}
