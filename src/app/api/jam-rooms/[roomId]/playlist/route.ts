import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getTopArtists } from "@/lib/spotify";
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
    const roomArchetype = room ? room.name : roomId;

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

    // Fetch top artists to derive real user taste profile
    const topArtistsRes = await getTopArtists(token, "medium_term", 30).catch(() => ({ items: [] }));
    const topArtists = topArtistsRes.items || [];
    const features = computeBehavioralFeatures([], topArtists, [], [], []);

    // Build user taste profile (topGenres, preferredLanguage, dominantMusicCluster)
    const tasteProfile = buildUserTasteProfile(topArtists, features, customLang);

    // Execute full end-to-end chain: archetype -> tasteProfile -> queryBuilder -> roomPlaylistSource
    const playlist = await getRoomPlaylistWithQuery(
      roomId,
      tasteProfile,
      token,
      forceRefresh
    );

    return NextResponse.json({
      status: "success",
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
