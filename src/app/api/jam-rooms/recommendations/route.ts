import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getTopArtists, getRecentlyPlayed, getTopTracks, getClientCredentialsToken } from "@/lib/spotify";
import { computeBehavioralFeatures } from "@/lib/features";
import { computeOceanScores } from "@/lib/oceanScoring";
import { buildUserTasteProfile } from "@/lib/userTasteProfile";
import { getRecommendedRooms, EvaluatedMoodRoom } from "@/lib/moodRoomEngine";
import { findJamMatches, MoodType, OceanVector, MusicClusterVector } from "@/lib/jamMatching";
import { getSyntheticUsers } from "@/lib/syntheticUsers";
import { getRoomPlaylistWithQuery } from "@/lib/roomPlaylistSource";
import { computeClusterDistribution } from "@/lib/genreClusters";

const parseMood = (raw?: string): MoodType => {
  if (!raw) return "Reflective";
  const lower = raw.toLowerCase();
  if (lower.includes("energized")) return "Energized";
  if (lower.includes("fiery")) return "Fiery";
  if (lower.includes("upbeat")) return "Upbeat";
  if (lower.includes("calm")) return "Calm";
  return "Reflective";
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("forceRefresh") === "true";
    const customLang = searchParams.get("language");

    const session = await getServerSession(authOptions);
    let token: string | undefined = session?.accessToken;

    if (!token) {
      token = (await getClientCredentialsToken()) || undefined;
    }

    let recentlyPlayed: any[] = [];
    let shortTermArtists: any[] = [];
    let mediumTermArtists: any[] = [];
    let shortTermTracks: any[] = [];

    if (session?.accessToken) {
      const userToken = session.accessToken;
      const [rpRes, staRes, mtaRes, sttRes] = await Promise.all([
        getRecentlyPlayed(userToken, 50).catch(() => ({ items: [] })),
        getTopArtists(userToken, "short_term", 30).catch(() => ({ items: [] })),
        getTopArtists(userToken, "medium_term", 30).catch(() => ({ items: [] })),
        getTopTracks(userToken, "short_term", 30).catch(() => ({ items: [] })),
      ]);
      recentlyPlayed = rpRes.items || [];
      shortTermArtists = staRes.items || [];
      mediumTermArtists = mtaRes.items || [];
      shortTermTracks = sttRes.items || [];
    }

    // Combine short-term & medium-term artists
    const allArtistsMap = new Map();
    [...shortTermArtists, ...mediumTermArtists].forEach((a) => {
      if (a && (a.id || a.name) && !allArtistsMap.has(a.id || a.name)) {
        allArtistsMap.set(a.id || a.name, a);
      }
    });
    const combinedArtists = Array.from(allArtistsMap.values());

    // 1. Compute real behavioral features from recent listening stream
    const features = computeBehavioralFeatures(
      shortTermTracks,
      combinedArtists,
      recentlyPlayed,
      shortTermArtists,
      mediumTermArtists
    );

    // 2. Derive real-time inferred mood
    const inferredMood: MoodType = features.inferredMood?.label
      ? parseMood(features.inferredMood.label)
      : "Reflective";

    // 3. Compute real music cluster distribution vector from user top genres
    const clusterDist = computeClusterDistribution(features.topGenreDistribution || []);
    const userClusters: MusicClusterVector = {
      reflectiveComplex: Math.round(clusterDist.reflectiveComplex || 25),
      intenseRebellious: Math.round(clusterDist.intenseRebellious || 25),
      upbeatConventional: Math.round(clusterDist.upbeatConventional || 25),
      energeticRhythmic: Math.round(clusterDist.energeticRhythmic || 25),
    };

    // 4. Compute real OCEAN personality vector
    const oceanScores = computeOceanScores(features, clusterDist);
    const userOcean: OceanVector = {
      openness: oceanScores.openness?.score ?? 85,
      conscientiousness: oceanScores.conscientiousness?.score ?? 60,
      extraversion: oceanScores.extraversion?.score ?? 48,
      agreeableness: oceanScores.agreeableness?.score ?? 72,
      neuroticism: oceanScores.neuroticism?.score ?? 54,
    };

    // 5. Build user taste profile for live Spotify playlist search
    const tasteProfile = buildUserTasteProfile(combinedArtists, features, customLang);

    // 6. Calculate room recommendations using real user mood & cluster vectors
    const recs = getRecommendedRooms(inferredMood, userClusters, userOcean);

    // 7. Source live Spotify public playlists for recommended rooms
    const updatedTopRooms: EvaluatedMoodRoom[] = await Promise.all(
      recs.topRooms.map(async (evalRoom) => {
        try {
          const livePlaylist = await getRoomPlaylistWithQuery(
            evalRoom.room.slug,
            tasteProfile,
            token,
            forceRefresh
          );
          if (livePlaylist && livePlaylist.tracks?.length > 0) {
            return {
              ...evalRoom,
              room: {
                ...evalRoom.room,
                playlistPreview: {
                  title: livePlaylist.title,
                  tracksCount: livePlaylist.tracks.length,
                  sampleTracks: livePlaylist.tracks.slice(0, 3).map((t) => ({
                    title: t.name,
                    artist: t.artist,
                  })),
                },
              },
            };
          }
        } catch (e) {
          // Keep default if fetch fails
        }
        return evalRoom;
      })
    );

    const updatedAdjacentRooms: EvaluatedMoodRoom[] = await Promise.all(
      recs.adjacentRooms.map(async (evalRoom) => {
        try {
          const livePlaylist = await getRoomPlaylistWithQuery(
            evalRoom.room.slug,
            tasteProfile,
            token,
            forceRefresh
          );
          if (livePlaylist && livePlaylist.tracks?.length > 0) {
            return {
              ...evalRoom,
              room: {
                ...evalRoom.room,
                playlistPreview: {
                  title: livePlaylist.title,
                  tracksCount: livePlaylist.tracks.length,
                  sampleTracks: livePlaylist.tracks.slice(0, 3).map((t) => ({
                    title: t.name,
                    artist: t.artist,
                  })),
                },
              },
            };
          }
        } catch (e) {
          // Keep default
        }
        return evalRoom;
      })
    );

    // 8. Compute suggested people matches using real vectors
    const candidates = getSyntheticUsers();
    const peopleMatches = findJamMatches(
      {
        id: session?.user?.email || "active_user",
        ocean: userOcean,
        musicClusters: userClusters,
        currentMood: inferredMood,
      },
      candidates,
      5
    );

    return NextResponse.json({
      status: "success",
      recentSongCount: recentlyPlayed.length,
      activeMood: inferredMood,
      userOcean,
      userClusters,
      tasteProfile,
      roomRecs: {
        topRooms: updatedTopRooms,
        adjacentRooms: updatedAdjacentRooms,
      },
      peopleMatches,
    });
  } catch (error: any) {
    console.error("Jam Rooms recommendations API error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
