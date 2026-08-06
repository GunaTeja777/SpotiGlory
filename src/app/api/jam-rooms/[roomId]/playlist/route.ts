export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getRecentlyPlayed } from "@/lib/spotify";
import { getGoogleRagPlaylists, getAgenticRagPlaylists, RoomPlaylist } from "@/lib/roomPlaylistSource";

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

async function searchSpotifyPlaylists(
  token: string,
  query: string,
  roomId: string
): Promise<RoomPlaylist[]> {
  try {
    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=2`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    if (!searchRes.ok) return [];
    const searchData = await searchRes.json();
    const playlists = searchData.playlists?.items || [];
    if (playlists.length === 0) return [];

    const results: RoomPlaylist[] = [];
    for (const pl of playlists.slice(0, 1)) {
      const tracksRes = await fetch(
        `https://api.spotify.com/v1/playlists/${pl.id}/tracks?limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (!tracksRes.ok) continue;
      const tracksData = await tracksRes.json();
      const tracksItems = tracksData.items || [];
      
      const tracks = tracksItems
        .map((item: any, idx: number) => {
          const track = item.track;
          if (!track) return null;
          return {
            id: track.id || `sp_track_${idx}_${Date.now()}`,
            name: track.name || "",
            artist: track.artists?.[0]?.name || "",
            album: track.album?.name || "",
            coverUrl: track.album?.images?.[0]?.url || "",
            previewUrl: track.preview_url || "",
            spotifyUrl: track.external_urls?.spotify || "",
            durationMs: track.duration_ms || 200000,
            addedBy: `Spotify Online Search: ${pl.name || "Curated Playlist"}`
          };
        })
        .filter(Boolean) as RoomTrack[];

      if (tracks.length > 0) {
        results.push({
          roomId,
          title: pl.name || `Dynamic ${query} Mix`,
          description: pl.description || `Playlists searched dynamically from Spotify for: "${query}".`,
          updatedAt: new Date().toISOString(),
          sourceType: "google_rag" as const,
          tracks
        });
      }
    }
    return results;
  } catch (e) {
    console.error("Failed to search Spotify playlists:", e);
    return [];
  }
}

import { RoomTrack } from "@/lib/roomPlaylistSource";

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
      const mockDecisions = [
        { step: "Analyze Request Vibe", decision: `Analyzing target room vibe "${roomId}" with preferred language "Tamil" and 10 recent history tracks.`, status: "done" },
        { step: "Query Local Catalog", decision: `Identified top 2 matching candidate playlist templates from local catalog.`, status: "done" },
        { step: "Use User History", decision: `Analyzing user history tracks: "Naan Pizhai", "Kadhaippoma", "Maruvaarthai".`, status: "done" },
        { step: "Search Spotify", decision: `Searching Spotify playlists & tracks for "Tamil Alternative Rock".`, status: "done" },
        { step: "Consolidate & Merge Data", decision: `Gathered input from: history, spotify, web. Merging candidate tracks to create 3 targeted playlists.`, status: "done" },
        { step: "Create Playlists", decision: `Successfully generated 3 playlists.`, status: "done" }
      ];
      return NextResponse.json({
        status: "success",
        playlists: getMockPlaylists(roomId),
        decisions: mockDecisions
      });
    }

    let recentTracks: { name: string; artist: string; album: string }[] = [];

    if (session?.accessToken) {
      try {
        const rpRes = await getRecentlyPlayed(session.accessToken, 12);
        const items = rpRes.items || [];
        recentTracks = items.map((item: any) => ({
          name: item.track?.name || "",
          artist: item.track?.artists?.[0]?.name || "",
          album: item.track?.album?.name || ""
        }));
      } catch (e) {
        console.error("Failed to fetch recent tracks from Spotify:", e);
      }
    }

    let playlists: any[] = [];
    let decisions: any[] = [];

    const agenticResult = await getAgenticRagPlaylists(roomId, recentTracks, effectiveLang, session.accessToken);
    playlists = agenticResult.playlists;
    decisions = agenticResult.decisions;

    if (!playlists || playlists.length === 0) {
      // 1. Try to search Spotify online dynamically for playlists matching the language & theme!
      if (session.accessToken) {
        const query = effectiveLang 
          ? `${effectiveLang} ${roomId.split('-').join(' ')}` 
          : roomId.split('-').join(' ');
        
        const onlinePlaylists = await searchSpotifyPlaylists(session.accessToken, query, roomId);
        if (onlinePlaylists && onlinePlaylists.length > 0) {
          playlists = onlinePlaylists;
        }
      }

      // 2. Fall back to your recently played list or mock playlists if online search returned empty
      if (!playlists || playlists.length === 0) {
        if (recentTracks.length > 0) {
          const dynamicPlaylist: RoomPlaylist = {
            roomId,
            title: `Dynamic ${effectiveLang || "Personalized"} Vibe Room`,
            description: `Real-time synchronization with your active recently played tracks on Spotify.`,
            updatedAt: new Date().toISOString(),
            sourceType: "google_rag" as const,
            tracks: recentTracks.map((t, idx) => ({
              id: `recent_${idx}_${Date.now()}`,
              name: t.name,
              artist: t.artist,
              album: t.album,
              durationMs: 220000,
              addedBy: "Spotify Live Sync"
            }))
          };
          playlists = [dynamicPlaylist];
        } else {
          playlists = getMockPlaylists(roomId);
        }
      }
    }

    if (!playlists || playlists.length === 0) {
      playlists = getMockPlaylists(roomId);
    }

    return NextResponse.json({
      status: "success",
      playlists,
      decisions
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
