export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getRecentlyPlayed, SpotifyApiError } from "@/lib/spotify";
import { getCachedData, setCachedData } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized: Missing active Spotify session" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    const forceRefresh = searchParams.get("forceRefresh") === "true";

    const userId = (session.user as any)?.id || "unknown";
    const cacheKey = `spotify:recently-played:${userId}:${limit}`;

    if (!forceRefresh) {
      const cached = await getCachedData<any>(cacheKey);
      if (cached) {
        return NextResponse.json({
          ...cached,
          fromCache: true,
        });
      }
    }

    const data = await getRecentlyPlayed(session.accessToken, limit);

    await setCachedData(cacheKey, data, 600); // 10 minutes cache TTL

    return NextResponse.json({
      ...data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Recently played API route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recently played tracks from Spotify" },
      { status: 500 }
    );
  }
}
