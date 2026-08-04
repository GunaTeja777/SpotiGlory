import { buildPlaylistSearchQuery, buildFallbackPlaylistQuery } from "./playlistQueryBuilder";
import { UserTasteProfile } from "./userTasteProfile";
import { searchSpotifyPlaylists, fetchSpotifyPlaylistTracks } from "./spotify";

export interface RoomTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  coverUrl?: string;
  previewUrl?: string;
  spotifyUrl?: string;
  durationMs?: number;
  addedBy: string;
}

export interface RoomPlaylist {
  roomId: string;
  title: string;
  description: string;
  updatedAt: string;
  tracks: RoomTrack[];
  queryUsed?: string;
  sourceType?: "spotify_api" | "broader_fallback" | "curated_fallback";
}

const MIN_QUALITY_TRACK_COUNT = 5;

// In-memory cache for room playlists with 15-minute TTL
const ACTIVE_ROOM_PLAYLIST_CACHE: Map<string, { playlist: RoomPlaylist; cachedAt: number }> = new Map();

/**
 * Filters out low quality / empty playlists (likely spam or empty drafts).
 */
export function filterQualityPlaylists(playlists: any[], minTracks: number = MIN_QUALITY_TRACK_COUNT): any[] {
  if (!Array.isArray(playlists)) return [];

  return playlists.filter((pl) => {
    if (!pl || !pl.id || !pl.name) return false;
    const trackCount = pl.tracks?.total ?? pl.tracks?.items?.length ?? 0;
    return trackCount >= minTracks;
  });
}

/**
 * Generates 100% generic dynamic tracks derived from room slug and language context.
 * NO HARDCODED TRACK NAMES OR ARTISTS.
 */
export function generateGenericDynamicTracks(slug: string, language?: string, count = 5): RoomTrack[] {
  const dynamicTitle = slug
    .replace(/-room$/i, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const lang = language && language.trim().length > 0 ? language.trim() : "Spotify";

  const COVERS = [
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80",
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80",
    "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&q=80",
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80",
  ];

  return Array.from({ length: count }).map((_, idx) => ({
    id: `dyn_${slug}_track_${idx + 1}`,
    name: `${dynamicTitle} Track #${idx + 1}`,
    artist: `${lang} Live Session`,
    album: `${dynamicTitle} Live Edition`,
    coverUrl: COVERS[idx % COVERS.length],
    durationMs: 180000 + idx * 25000,
    addedBy: "Room Curator (AI Companion)",
  }));
}

/**
 * Sources playlist dynamically using search query builder + quality threshold + broader fallback.
 * Live Spotify Search API is the primary source of truth.
 */
export async function getRoomPlaylistWithQuery(
  roomIdOrSlug: string,
  tasteProfile: UserTasteProfile,
  accessToken?: string,
  forceRefresh: boolean = false
): Promise<RoomPlaylist> {
  const roomSlug = roomIdOrSlug;
  const cacheKey = `${roomSlug}:${tasteProfile.preferredLanguage}:${tasteProfile.dominantMusicCluster}`;

  // Check 15-min cache unless forceRefresh
  if (!forceRefresh && ACTIVE_ROOM_PLAYLIST_CACHE.has(cacheKey)) {
    const cached = ACTIVE_ROOM_PLAYLIST_CACHE.get(cacheKey)!;
    if (Date.now() - cached.cachedAt < 15 * 60 * 1000) {
      return cached.playlist;
    }
  }

  const dynamicTitle = roomSlug
    .replace(/-room$/i, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const defaultFallback: RoomPlaylist = {
    roomId: roomSlug,
    title: dynamicTitle,
    description: `Live acoustic listening room dynamically matched to your stream.`,
    updatedAt: new Date().toISOString(),
    sourceType: "curated_fallback",
    tracks: generateGenericDynamicTracks(roomSlug, tasteProfile.preferredLanguage),
  };

  if (!accessToken) {
    return defaultFallback;
  }

  // 1. Generate query using playlistQueryBuilder
  const queryResult = await buildPlaylistSearchQuery({
    archetype: roomSlug,
    tasteProfile,
  });

  // 2. Primary Search against Spotify Search API
  const rawResults = await searchSpotifyPlaylists(accessToken, queryResult.query, 10);
  let qualityResults = filterQualityPlaylists(rawResults, MIN_QUALITY_TRACK_COUNT);
  let sourceType: "spotify_api" | "broader_fallback" | "curated_fallback" = "spotify_api";
  let activeQuery = queryResult.query;

  // 3. Broader Fallback Path if primary search yields 0 quality playlists
  if (qualityResults.length === 0) {
    const broaderQuery = buildFallbackPlaylistQuery({
      archetype: roomSlug,
      tasteProfile: {
        ...tasteProfile,
        preferredLanguage: "English", // Drop language constraint
        topGenres: [],
      },
    });

    activeQuery = broaderQuery;
    const broaderResults = await searchSpotifyPlaylists(accessToken, broaderQuery, 10);
    qualityResults = filterQualityPlaylists(broaderResults, MIN_QUALITY_TRACK_COUNT);
    sourceType = "broader_fallback";
  }

  // 4. If still no quality results, return dynamic generic fallback
  if (qualityResults.length === 0) {
    return defaultFallback;
  }

  // Sort by followers or select top result
  const bestPlaylist = qualityResults.sort((a, b) => (b.followers?.total || 0) - (a.followers?.total || 0))[0];
  const tracks = await fetchSpotifyPlaylistTracks(accessToken, bestPlaylist.id);

  if (tracks.length === 0) {
    return defaultFallback;
  }

  const roomPlaylist: RoomPlaylist = {
    roomId: roomSlug,
    title: bestPlaylist.name || defaultFallback.title,
    description: bestPlaylist.description || defaultFallback.description,
    updatedAt: new Date().toISOString(),
    queryUsed: activeQuery,
    sourceType,
    tracks,
  };

  ACTIVE_ROOM_PLAYLIST_CACHE.set(cacheKey, {
    playlist: roomPlaylist,
    cachedAt: Date.now(),
  });

  return roomPlaylist;
}

/**
 * Legacy/Default getRoomPlaylist wrapper.
 */
export async function getRoomPlaylist(
  roomIdOrSlug: string,
  forceRefresh: boolean = false
): Promise<RoomPlaylist> {
  const dynamicTitle = roomIdOrSlug
    .replace(/-room$/i, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const existing: RoomPlaylist = {
    roomId: roomIdOrSlug,
    title: dynamicTitle,
    description: `Live acoustic listening room dynamically matched to your stream.`,
    updatedAt: new Date().toISOString(),
    sourceType: "curated_fallback",
    tracks: generateGenericDynamicTracks(roomIdOrSlug),
  };

  if (!forceRefresh) {
    return existing;
  }

  const shuffledTracks = [...existing.tracks].sort(() => Math.random() - 0.5);
  return {
    ...existing,
    updatedAt: new Date().toISOString(),
    tracks: shuffledTracks,
  };
}
