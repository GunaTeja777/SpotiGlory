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
import { computeClusterDistribution } from "@/lib/genreClusters";
import { computeOceanScores } from "@/lib/oceanScoring";
import { getCachedData, setCachedData } from "@/lib/redis";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("forceRefresh") === "true";

    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      const features = computeBehavioralFeatures([], [], [], [], []);
      const clusters = computeClusterDistribution(features.topGenreDistribution);
      const ocean = computeOceanScores(features, clusters);
      return NextResponse.json({
        status: "success",
        isDemo: true,
        timestamp: new Date().toISOString(),
        user: { name: "Demo Listener", image: null },
        clusters,
        ocean,
        disclaimer: ocean.disclaimer,
      });
    }

    const token = session.accessToken;
    const userId = (session.user as any)?.id || "unknown";
    const cacheKey = `analysis:ocean:${userId}`;

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

    // 1. Compute behavioral feature signals
    const features = computeBehavioralFeatures(
      topTracks,
      topArtists,
      recentlyPlayed,
      shortTermArtists,
      longTermArtists
    );

    // 2. Compute Rentfrow & Gosling MUSIC model cluster distribution
    const clusters = computeClusterDistribution(features.topGenreDistribution);

    // 3. Compute Big Five (OCEAN) personality scores
    const ocean = computeOceanScores(features, clusters);

    const payload = {
      status: "success",
      user: {
        name: session.user?.name || "Music Listener",
        image: session.user?.image || null,
      },
      clusters,
      ocean,
      disclaimer: ocean.disclaimer,
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
    console.error("OCEAN scoring API error:", error);
    return NextResponse.json(
      { error: "Failed to compute Big Five personality scores" },
      { status: 500 }
    );
  }
}
