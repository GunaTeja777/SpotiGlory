import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getTopArtists, getRecentlyPlayed, getTopTracks } from "@/lib/spotify";
import { computeBehavioralFeatures } from "@/lib/features";
import { buildUserTasteProfile } from "@/lib/userTasteProfile";
import { getRoomPlaylistWithQuery, getRoomPlaylist } from "@/lib/roomPlaylistSource";
import { getRoomBySlug, getRoomById } from "@/lib/moodRoomEngine";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("forceRefresh") === "true";
    const customLang = searchParams.get("language");

    const session = await getServerSession(authOptions);
    const room = getRoomBySlug(roomId) || getRoomById(roomId);

    if (!session || !session.accessToken) {
      // Unauthenticated / Demo Fallback
      const defaultTaste = buildUserTasteProfile([], undefined, customLang);
      const playlist = await getRoomPlaylistWithQuery(roomId, defaultTaste, undefined, forceRefresh);
      return NextResponse.json({
        status: "success",
        isDemo: true,
        playlist,
      });
    }

    const token = session.accessToken;

    // 1. Fetch real-time recent song listening history & top datasets in parallel
    const [recentlyPlayedRes, shortTermArtistsRes, mediumTermArtistsRes, shortTermTracksRes] =
      await Promise.all([
        getRecentlyPlayed(token, 50).catch(() => ({ items: [] })),
        getTopArtists(token, "short_term", 30).catch(() => ({ items: [] })),
        getTopArtists(token, "medium_term", 30).catch(() => ({ items: [] })),
        getTopTracks(token, "short_term", 30).catch(() => ({ items: [] })),
      ]);

    const recentlyPlayed = recentlyPlayedRes.items || [];
    const shortTermArtists = shortTermArtistsRes.items || [];
    const mediumTermArtists = mediumTermArtistsRes.items || [];
    const shortTermTracks = shortTermTracksRes.items || [];

    // Combine short-term & medium-term artists to prioritize recent listening taste
    const allArtistsMap = new Map();
    [...shortTermArtists, ...mediumTermArtists].forEach((a) => {
      if (a && (a.id || a.name) && !allArtistsMap.has(a.id || a.name)) {
        allArtistsMap.set(a.id || a.name, a);
      }
    });
    const combinedArtists = Array.from(allArtistsMap.values());

    // 2. Compute behavioral features based on RECENT song listening streams
    const features = computeBehavioralFeatures(
      shortTermTracks,
      combinedArtists,
      recentlyPlayed,
      shortTermArtists,
      mediumTermArtists
    );

    // 3. Build user taste profile based on RECENT listening genres, artists, and language
    const tasteProfile = buildUserTasteProfile(combinedArtists, features, customLang);

    // 4. Execute full end-to-end chain: archetype -> tasteProfile -> queryBuilder -> roomPlaylistSource
    const playlist = await getRoomPlaylistWithQuery(
      roomId,
      tasteProfile,
      token,
      forceRefresh
    );

    return NextResponse.json({
      status: "success",
      recentSongCount: recentlyPlayed.length,
      tasteProfile,
      playlist,
    });
  } catch (error: any) {
    console.error("Room playlist API error:", error);
    const fallback = await getRoomPlaylist(await params.then((p) => p.roomId));
    return NextResponse.json({
      status: "fallback",
      playlist: fallback,
    });
  }
}
