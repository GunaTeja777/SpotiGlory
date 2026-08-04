export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getTopTracks, getTopArtists, SpotifyApiError } from "@/lib/spotify";

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
    const mood = searchParams.get("mood") || "Reflective";
    const dominantCluster = searchParams.get("dominantCluster") || "Reflective & Complex";

    // 1. Fetch top artists and tracks for recommendation seeds
    const [topArtistsData, topTracksData] = await Promise.all([
      getTopArtists(session.accessToken, "medium_term", 5).catch(() => ({ items: [] })),
      getTopTracks(session.accessToken, "medium_term", 10).catch(() => ({ items: [] })),
    ]);

    const seedArtists = (topArtistsData.items || [])
      .map((a: any) => a.id)
      .filter(Boolean)
      .slice(0, 2)
      .join(",");

    const seedTracks = (topTracksData.items || [])
      .map((t: any) => t.id)
      .filter(Boolean)
      .slice(0, 3)
      .join(",");

    // 2. Map mood & dominant cluster to target audio feature parameters
    let targetValence = 0.5;
    let targetEnergy = 0.5;
    let targetDanceability = 0.5;
    let targetAcousticness = 0.3;

    if (mood.includes("Energized") || dominantCluster.includes("Energetic")) {
      targetValence = 0.8;
      targetEnergy = 0.85;
      targetDanceability = 0.75;
    } else if (mood.includes("Reflective") || dominantCluster.includes("Reflective")) {
      targetValence = 0.35;
      targetEnergy = 0.45;
      targetAcousticness = 0.6;
    } else if (mood.includes("Fiery") || dominantCluster.includes("Intense")) {
      targetValence = 0.4;
      targetEnergy = 0.9;
    } else if (mood.includes("Upbeat") || dominantCluster.includes("Upbeat")) {
      targetValence = 0.85;
      targetEnergy = 0.7;
    } else if (mood.includes("Calm")) {
      targetValence = 0.5;
      targetEnergy = 0.35;
      targetAcousticness = 0.75;
    }

    // Build Spotify recommendation query params
    const recParams = new URLSearchParams({
      limit: "5",
      target_valence: targetValence.toString(),
      target_energy: targetEnergy.toString(),
      target_danceability: targetDanceability.toString(),
      target_acousticness: targetAcousticness.toString(),
    });

    if (seedArtists) recParams.append("seed_artists", seedArtists);
    if (seedTracks) recParams.append("seed_tracks", seedTracks);

    let recommendedTracks: any[] = [];

    // Attempt Spotify Web API /v1/recommendations
    if (seedArtists || seedTracks) {
      try {
        const recRes = await fetch(
          `https://api.spotify.com/v1/recommendations?${recParams.toString()}`,
          {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }
        );

        if (recRes.ok) {
          const recData = await recRes.json();
          recommendedTracks = recData.tracks || [];
        }
      } catch (e) {
        // Ignore and fallback
      }
    }

    // 3. Fallback Safety Net: If recommendations endpoint returns empty, select from topTracks
    if (recommendedTracks.length === 0 && topTracksData.items?.length > 0) {
      recommendedTracks = topTracksData.items.slice(0, 5);
    }

    return NextResponse.json({
      tracks: recommendedTracks,
      seedContext: {
        mood,
        dominantCluster,
        targetValence,
        targetEnergy,
      },
    });
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Recommendations API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Spotify recommendations" },
      { status: 500 }
    );
  }
}
