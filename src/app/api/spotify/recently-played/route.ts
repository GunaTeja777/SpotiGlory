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
      const items = [];
      const days = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday
      const hours = [22, 23, 0, 1, 2];   // Night owl peak hours
      const mockTracks = [
        { name: "Resonance", artist: "HOME", album: "Odyssey" },
        { name: "Aria", artist: "Hammock", album: "Departure Songs" },
        { name: "Vanilla", artist: "Tycho", album: "Past Is Prologue" },
        { name: "First Breath After Coma", artist: "Explosions in the Sky", album: "The Earth Is Not a Cold Dead Place" }
      ];

      let count = 0;
      for (const day of days) {
        for (const hour of hours) {
          const playedAt = new Date();
          const currentDay = playedAt.getDay();
          const targetOffset = day - currentDay;
          playedAt.setDate(playedAt.getDate() + targetOffset);
          playedAt.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

          const trackIndex = count % mockTracks.length;
          const track = mockTracks[trackIndex];
          items.push({
            track: {
              id: `recent_${count}`,
              name: track.name,
              artists: [{ name: track.artist }],
              album: { name: track.album }
            },
            played_at: playedAt.toISOString()
          });
          count++;
        }
      }

      return NextResponse.json({
        items,
        timestamp: new Date().toISOString()
      });
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
