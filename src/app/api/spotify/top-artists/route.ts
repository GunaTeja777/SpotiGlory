export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getTopArtists, SpotifyApiError } from "@/lib/spotify";
import { getCachedData, setCachedData } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json({
        items: [
          { id: "art_1", name: "HOME", genres: ["synthwave", "electronic"], images: [{ url: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&auto=format&fit=crop&q=60" }], popularity: 62 },
          { id: "art_2", name: "Tycho", genres: ["ambient", "downtempo"], images: [{ url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=60" }], popularity: 58 },
          { id: "art_3", name: "Hammock", genres: ["ambient", "post-rock"], images: [{ url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&auto=format&fit=crop&q=60" }], popularity: 50 },
          { id: "art_4", name: "Explosions in the Sky", genres: ["post-rock", "instrumental"], images: [{ url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&auto=format&fit=crop&q=60" }], popularity: 55 },
          { id: "art_5", name: "Radiohead", genres: ["alternative", "electronic"], images: [{ url: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=150&auto=format&fit=crop&q=60" }], popularity: 82 },
          { id: "art_6", name: "Sid Sriram", genres: ["carnatic", "indie", "tamil"], images: [{ url: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=150&auto=format&fit=crop&q=60" }], popularity: 70 },
          { id: "art_7", name: "Nujabes", genres: ["lofi", "hip-hop"], images: [{ url: "https://images.unsplash.com/photo-1487180142328-0c4e37023af5?w=150&auto=format&fit=crop&q=60" }], popularity: 65 }
        ],
        timestamp: new Date().toISOString()
      });
    }

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

    const userId = (session.user as any)?.id || "unknown";
    const cacheKey = `spotify:top-artists:${userId}:${timeRange}:${limit}`;

    if (!forceRefresh) {
      const cached = await getCachedData<any>(cacheKey);
      if (cached) {
        return NextResponse.json({
          ...cached,
          fromCache: true,
        });
      }
    }

    const data = await getTopArtists(session.accessToken, timeRange, limit);

    await setCachedData(cacheKey, data, 600); // 10 minutes cache TTL

    return NextResponse.json({
      ...data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Top artists API route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch top artists from Spotify" },
      { status: 500 }
    );
  }
}
