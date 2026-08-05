export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getRecentlyPlayed } from "@/lib/spotify";
import { getGoogleRagPlaylists, RoomPlaylist } from "@/lib/roomPlaylistSource";

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

function getMockPlaylists(roomId: string): RoomPlaylist[] {
  const lower = roomId.toLowerCase();
  if (lower.includes("tamil")) {
    return [
      {
        roomId,
        title: "Tamil Alternative Rock Mix",
        description: "Energetic Tamil rock and indie anthems with atmospheric melodies.",
        updatedAt: new Date().toISOString(),
        sourceType: "google_rag" as const,
        tracks: [
          { id: "tamil_1", name: "Naan Pizhai", artist: "Anirudh Ravichander", album: "Kaathuvaakula Rendu Kaadhal", durationMs: 270000, addedBy: "RAG Sourcing Engine" },
          { id: "tamil_2", name: "Maruvaarthai", artist: "Sid Sriram", album: "Enai Noki Paayum Thota", durationMs: 350000, addedBy: "RAG Sourcing Engine" },
          { id: "tamil_3", name: "Kadhaippoma", artist: "Sid Sriram", album: "Oh My Kadavule", durationMs: 290000, addedBy: "RAG Sourcing Engine" },
          { id: "tamil_4", name: "Hayyoda", artist: "Anirudh Ravichander", album: "Jawan", durationMs: 220000, addedBy: "RAG Sourcing Engine" },
          { id: "tamil_5", name: "Kannazhaga", artist: "Anirudh Ravichander", album: "3", durationMs: 200000, addedBy: "RAG Sourcing Engine" }
        ]
      },
      {
        roomId,
        title: "Tamil Indie Chill Vibes",
        description: "Mellow acoustic and independent Tamil compositions for focus.",
        updatedAt: new Date().toISOString(),
        sourceType: "google_rag" as const,
        tracks: [
          { id: "tamil_6", name: "Bodhai Kanave", artist: "Kabin", album: "Indie Hits", durationMs: 210000, addedBy: "RAG Sourcing Engine" },
          { id: "tamil_7", name: "Oru Manam", artist: "Karthik", album: "Dhruva Natchathiram", durationMs: 310000, addedBy: "RAG Sourcing Engine" },
          { id: "tamil_8", name: "Neeyum Naanum", artist: "Anirudh Ravichander", album: "Naanum Rowdydhaan", durationMs: 280000, addedBy: "RAG Sourcing Engine" }
        ]
      }
    ];
  }

  return [
    {
      roomId,
      title: "Nocturnal Ambient Coding Mix",
      description: "Mellow atmospheric synthesizers and slow beats curated for deep concentration.",
      updatedAt: new Date().toISOString(),
      sourceType: "google_rag" as const,
      tracks: [
        { id: "track_synth_1", name: "Resonance", artist: "HOME", album: "Odyssey", durationMs: 210000, addedBy: "RAG Sourcing Engine" },
        { id: "track_synth_2", name: "Aria", artist: "Hammock", album: "Departure Songs", durationMs: 250000, addedBy: "RAG Sourcing Engine" },
        { id: "track_synth_3", name: "Vanilla", artist: "Tycho", album: "Past Is Prologue", durationMs: 230000, addedBy: "RAG Sourcing Engine" },
        { id: "track_synth_4", name: "First Breath After Coma", artist: "Explosions in the Sky", album: "The Earth Is Not a Cold Dead Place", durationMs: 310000, addedBy: "RAG Sourcing Engine" },
        { id: "track_synth_5", name: "Treefingers", artist: "Radiohead", album: "Kid A", durationMs: 180000, addedBy: "RAG Sourcing Engine" }
      ]
    },
    {
      roomId,
      title: "Introspective Synthwave Drive",
      description: "Retrofuturistic synth pads and rhythmic basslines to power midnight code compilation.",
      updatedAt: new Date().toISOString(),
      sourceType: "google_rag" as const,
      tracks: [
        { id: "track_synth_6", name: "Sunset", artist: "The Midnight", album: "Endless Summer", durationMs: 240000, addedBy: "RAG Sourcing Engine" },
        { id: "track_synth_7", name: "Nightcall", artist: "Kavinsky", album: "Outrun", durationMs: 220000, addedBy: "RAG Sourcing Engine" },
        { id: "track_synth_8", name: "Tech Noir", artist: "Gunship", album: "Gunship", durationMs: 280000, addedBy: "RAG Sourcing Engine" },
        { id: "track_synth_9", name: "Fly For Your Life", artist: "Gunship", album: "Gunship", durationMs: 260000, addedBy: "RAG Sourcing Engine" },
        { id: "track_synth_10", name: "Days of Thunder", artist: "The Midnight", album: "Days of Thunder", durationMs: 300000, addedBy: "RAG Sourcing Engine" }
      ]
    },
    {
      roomId,
      title: "Lo-Fi Focus & Cozy Beats",
      description: "Laid-back, dust-laden beats, and warm vinyl grooves for quiet reflection.",
      updatedAt: new Date().toISOString(),
      sourceType: "google_rag" as const,
      tracks: [
        { id: "track_synth_11", name: "Snowman", artist: "Wys", album: "Lofi Study", durationMs: 160000, addedBy: "RAG Sourcing Engine" },
        { id: "track_synth_12", name: "Feather", artist: "Nujabes", album: "Modal Soul", durationMs: 190000, addedBy: "RAG Sourcing Engine" },
        { id: "track_synth_13", name: "Mellow", artist: "Shiloh Dynasty", album: "Mellow Beats", durationMs: 150000, addedBy: "RAG Sourcing Engine" },
        { id: "track_synth_14", name: "Departure", artist: "Nujabes", album: "Departure", durationMs: 210000, addedBy: "RAG Sourcing Engine" },
        { id: "track_synth_15", name: "Lofi Rain", artist: "Cozy Vibe", album: "Rainy Days", durationMs: 180000, addedBy: "RAG Sourcing Engine" }
      ]
    }
  ];
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

    if (!session || !session.accessToken) {
      return NextResponse.json({
        status: "success",
        playlists: getMockPlaylists(roomId)
      });
    }

    let recentTracks: { name: string; artist: string; album: string }[] = [];

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

    let playlists = await getGoogleRagPlaylists(roomId, recentTracks, effectiveLang);

    if (!playlists || playlists.length === 0) {
      playlists = getMockPlaylists(roomId);
    }

    return NextResponse.json({
      status: "success",
      playlists
    });
  } catch (error: any) {
    console.error("Room playlist API error:", error);
    const { roomId } = await params;
    return NextResponse.json({
      status: "fallback",
      playlists: getMockPlaylists(roomId)
    });
  }
}
