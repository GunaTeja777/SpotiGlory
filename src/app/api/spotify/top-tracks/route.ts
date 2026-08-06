export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getTopTracks, getClientCredentialsToken, SpotifyApiError } from "@/lib/spotify";
import { getCachedData, setCachedData } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRangeParam = searchParams.get("time_range");
    const limitParam = searchParams.get("limit");
    const forceRefresh = searchParams.get("forceRefresh") === "true";

    const timeRange = (
      ["short_term", "medium_term", "long_term"].includes(timeRangeParam || "")
        ? timeRangeParam
        : "medium_term"
    ) as "short_term" | "medium_term" | "long_term";

    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      const clientToken = await getClientCredentialsToken().catch(() => null);
      if (clientToken) {
        const searchRes = await fetch(`https://api.spotify.com/v1/search?q=top%20hits&type=track&limit=${limit}`, {
          headers: { Authorization: `Bearer ${clientToken}` }
        }).catch(() => null);

        if (searchRes && searchRes.ok) {
          const searchData = await searchRes.json();
          return NextResponse.json({
            items: searchData.tracks?.items || [],
            timestamp: new Date().toISOString()
          });
        }
      }

      return NextResponse.json({
        items: [],
        timestamp: new Date().toISOString()
      });
    }

    const userId = (session.user as any)?.id || "unknown";
    const cacheKey = `spotify:top-tracks:${userId}:${timeRange}:${limit}`;

    if (!forceRefresh) {
      const cached = await getCachedData<any>(cacheKey);
      if (cached) {
        return NextResponse.json({
          ...cached,
          fromCache: true,
        });
      }
    }

    const data = await getTopTracks(session.accessToken, timeRange, limit);

    await setCachedData(cacheKey, data, 600); // 10 minutes cache TTL

    return NextResponse.json({
      ...data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Top tracks API route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch top tracks from Spotify" },
      { status: 500 }
    );
  }
}
