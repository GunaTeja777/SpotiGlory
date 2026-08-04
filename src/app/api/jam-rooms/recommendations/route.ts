import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  getTopArtists,
  getRecentlyPlayed,
  getTopTracks,
  getClientCredentialsToken,
  searchSpotifyPlaylists,
  fetchSpotifyPlaylistTracks,
} from "@/lib/spotify";
import { computeBehavioralFeatures } from "@/lib/features";
import { computeOceanScores } from "@/lib/oceanScoring";
import { buildUserTasteProfile } from "@/lib/userTasteProfile";
import { generateDynamicRoomsFromListeningData, DynamicJamRoom } from "@/lib/dynamicRoomEngine";
import {
  filterQualityPlaylists,
} from "@/lib/roomPlaylistSource";
import { findJamMatches, MoodType, OceanVector, MusicClusterVector } from "@/lib/jamMatching";
import { getSyntheticUsers } from "@/lib/syntheticUsers";
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
    const customMoodParam = searchParams.get("mood");
    const inferredMood: MoodType = features.inferredMood?.label
      ? parseMood(features.inferredMood.label)
      : "Reflective";
    const activeMood: MoodType = customMoodParam ? parseMood(customMoodParam) : inferredMood;

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

    // 5. Build user taste profile based on real recent streams & language
    const tasteProfile = buildUserTasteProfile(combinedArtists, features, customLang);

    // 6. Generate 100% DYNAMIC Jam Rooms directly from user's actual Spotify listening history
    const dynamicRoomList = generateDynamicRoomsFromListeningData(
      recentlyPlayed,
      combinedArtists,
      shortTermTracks,
      tasteProfile,
      customLang
    );

    // 7. Source live Spotify public playlists for each dynamic room
    const evaluatedTopRooms = await Promise.all(
      dynamicRoomList.map(async (dynRoom) => {
        if (token) {
          try {
            const rawPlaylists = await searchSpotifyPlaylists(token, dynRoom.searchQuery, 10);
            const qualityPlaylists = filterQualityPlaylists(rawPlaylists, 5);

            if (qualityPlaylists.length > 0) {
              const bestPl = qualityPlaylists.sort(
                (a, b) => (b.followers?.total || 0) - (a.followers?.total || 0)
              )[0];
              const tracks = await fetchSpotifyPlaylistTracks(token, bestPl.id);

              if (tracks.length > 0) {
                return {
                  matchScore: dynRoom.matchScore,
                  recommendationReason: dynRoom.recommendationReason,
                  room: {
                    id: dynRoom.id,
                    slug: dynRoom.slug,
                    name: dynRoom.name,
                    vibeTag: dynRoom.vibeTag,
                    description: dynRoom.description,
                    iconName: dynRoom.iconName,
                    activeListenersCount: dynRoom.activeListenersCount,
                    playlistPreview: {
                      title: bestPl.name || dynRoom.playlistPreview.title,
                      tracksCount: tracks.length,
                      sampleTracks: tracks.slice(0, 3).map((t: any) => ({
                        title: t.name,
                        artist: t.artist,
                      })),
                    },
                  },
                };
              }
            }
          } catch (e) {
            // Keep default
          }
        }

        return {
          matchScore: dynRoom.matchScore,
          recommendationReason: dynRoom.recommendationReason,
          room: dynRoom,
        };
      })
    );

    // 8. Compute suggested people matches using real vectors
    const candidates = getSyntheticUsers();
    const peopleMatches = findJamMatches(
      {
        id: session?.user?.email || "active_user",
        ocean: userOcean,
        musicClusters: userClusters,
        currentMood: activeMood,
      },
      candidates,
      5
    );

    return NextResponse.json({
      status: "success",
      recentSongCount: recentlyPlayed.length,
      activeMood,
      userOcean,
      userClusters,
      tasteProfile,
      roomRecs: {
        topRooms: evaluatedTopRooms,
        adjacentRooms: [],
      },
      peopleMatches,
    });
  } catch (error: any) {
    console.error("Jam Rooms recommendations API error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
