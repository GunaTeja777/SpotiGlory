export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getTopTracks, SpotifyApiError } from "@/lib/spotify";
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
      let items = [];
      if (timeRange === "short_term") {
        items = [
          { id: "track_1", name: "Resonance", artists: [{ name: "HOME" }], album: { name: "Odyssey", images: [{ url: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&auto=format&fit=crop&q=60" }] }, preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", popularity: 62, external_urls: { spotify: "https://open.spotify.com" } },
          { id: "track_2", name: "Aria", artists: [{ name: "Hammock" }], album: { name: "Departure Songs", images: [{ url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&auto=format&fit=crop&q=60" }] }, preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", popularity: 50, external_urls: { spotify: "https://open.spotify.com" } }
        ];
      } else if (timeRange === "medium_term") {
        items = [
          { id: "track_3", name: "Vanilla", artists: [{ name: "Tycho" }], album: { name: "Past Is Prologue", images: [{ url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=60" }] }, preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", popularity: 58, external_urls: { spotify: "https://open.spotify.com" } },
          { id: "track_4", name: "First Breath After Coma", artists: [{ name: "Explosions in the Sky" }], album: { name: "The Earth Is Not a Cold Dead Place", images: [{ url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&auto=format&fit=crop&q=60" }] }, preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", popularity: 55, external_urls: { spotify: "https://open.spotify.com" } },
          { id: "track_5", name: "Treefingers", artists: [{ name: "Radiohead" }], album: { name: "Kid A", images: [{ url: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=150&auto=format&fit=crop&q=60" }] }, preview_url: null, popularity: 82, external_urls: { spotify: "https://open.spotify.com" } }
        ];
      } else {
        items = [
          { id: "track_6", name: "Blinding Lights", artists: [{ name: "The Weeknd" }], album: { name: "After Hours", images: [{ url: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=150&auto=format&fit=crop&q=60" }] }, preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", popularity: 94, external_urls: { spotify: "https://open.spotify.com" } },
          { id: "track_7", name: "Smells Like Teen Spirit", artists: [{ name: "Nirvana" }], album: { name: "Nevermind", images: [{ url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&auto=format&fit=crop&q=60" }] }, preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", popularity: 80, external_urls: { spotify: "https://open.spotify.com" } }
        ];
      }

      return NextResponse.json({
        items,
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
