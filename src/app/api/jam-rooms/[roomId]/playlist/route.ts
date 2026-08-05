export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getRecentlyPlayed } from "@/lib/spotify";
import { getGoogleRagPlaylists } from "@/lib/roomPlaylistSource";

function extractLanguageFromSlug(slug: string, customLang?: string | null): string | undefined {
  if (customLang && customLang.trim().length > 0) return customLang.trim();
  const lower = slug.toLowerCase();
  if (lower.includes("tamil")) return "Tamil";
  if (lower.includes("telugu")) return "Telugu";
  if (lower.includes("hindi") || lower.includes("bollywood")) return "Hindi";
  if (lower.includes("punjabi")) return "Punjabi";
  if (lower.includes("spanish") || lower.includes("latin")) return "Spanish";
  if (lower.includes("french")) return "French";
  if (lower.includes("korean") || lower.includes("kpop")) return "Korean";
  return undefined;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const { searchParams } = new URL(request.url);
    const customLang = searchParams.get("language");
    const effectiveLang = extractLanguageFromSlug(roomId, customLang);

    const session = await getServerSession(authOptions);

    let recentTracks: { name: string; artist: string; album: string }[] = [];

    // Fetch ONLY the 3 most recently played songs to minimize Spotify API calls
    if (session?.accessToken) {
      try {
        const rpRes = await getRecentlyPlayed(session.accessToken, 3);
        const items = rpRes.items || [];
        recentTracks = items.map((item: any) => ({
          name: item.track?.name || "",
          artist: item.track?.artists?.[0]?.name || "",
          album: item.track?.album?.name || ""
        }));
      } catch (e) {
        console.error("Failed to fetch 3 recent tracks from Spotify:", e);
      }
    }

    // Call the RAG Sourcing Engine to fetch/generate 3 playlists matching the taste & room theme
    const playlists = await getGoogleRagPlaylists(roomId, recentTracks, effectiveLang);

    return NextResponse.json({
      status: "success",
      playlists
    });
  } catch (error: any) {
    console.error("Room playlist API error:", error);
    return NextResponse.json({
      status: "fallback",
      playlists: []
    });
  }
}
