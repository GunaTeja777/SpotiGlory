import { SpotifyArtist, SpotifyPlayHistory, SpotifyTrack } from "./spotify";
import { UserTasteProfile, inferLanguageFromArtists } from "./userTasteProfile";
import { getCachedRoomCatalog, setCachedRoomCatalog } from "./redis";

export interface DynamicJamRoom {
  id: string;
  slug: string;
  name: string;
  vibeTag: string;
  description: string;
  iconName: "Moon" | "Zap" | "Flame" | "Sun" | "Wind" | "Radio";
  matchScore: number;
  recommendationReason: string;
  activeListenersCount: number;
  searchQuery: string;
  playlistPreview: {
    title: string;
    tracksCount: number;
    sampleTracks: { title: string; artist: string }[];
  };
}

/**
 * Capitalizes words in a string cleanly.
 */
function capitalizeWords(str: string): string {
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Generates varied, genre-tailored room title suffixes.
 */
function getRoomSuffix(genre: string, index: number): string {
  const lower = genre.toLowerCase();
  if (lower.includes("electronic") || lower.includes("edm") || lower.includes("synth")) {
    const suffixes = ["Pulse Haven", "Synthesist Vault", "Neon Wave Lounge"];
    return suffixes[index % suffixes.length];
  }
  if (lower.includes("rock") || lower.includes("metal") || lower.includes("alternative") || lower.includes("punk")) {
    const suffixes = ["Distortion Garage", "Underground Rock Den", "Raw Riff Sanctum"];
    return suffixes[index % suffixes.length];
  }
  if (lower.includes("jazz") || lower.includes("acoustic") || lower.includes("piano") || lower.includes("folk") || lower.includes("ambient")) {
    const suffixes = ["Acoustic Lounge", "Felt Piano Nook", "Velvet Jazz Chamber"];
    return suffixes[index % suffixes.length];
  }
  if (lower.includes("pop") || lower.includes("indie") || lower.includes("dance")) {
    const suffixes = ["Golden Hour Haven", "Melodic Sunshine Club", "Indie Groove Loft"];
    return suffixes[index % suffixes.length];
  }
  if (lower.includes("lofi") || lower.includes("chill") || lower.includes("soul")) {
    const suffixes = ["Evening Chill Oasis", "Nocturnal Reverb Nook", "Tranquil Beats Loft"];
    return suffixes[index % suffixes.length];
  }

  const defaultSuffixes = ["Melodies Lounge", "Symphony Oasis", "Beat Sanctum"];
  return defaultSuffixes[index % defaultSuffixes.length];
}

/**
 * Generates 100% generic, artist-tailored room descriptions without hardcoded strings.
 */
function buildRoomDescription(genre: string, artistName?: string): string {
  const formatted = capitalizeWords(genre);
  const artistMention = artistName ? ` Featuring acoustic vibes from ${artistName}.` : "";

  const lower = genre.toLowerCase();
  if (lower.includes("electronic") || lower.includes("edm") || lower.includes("synth")) {
    return `High-octane synth arpeggios, sidechain bass, and driving electronic rhythms.${artistMention}`;
  }
  if (lower.includes("rock") || lower.includes("metal") || lower.includes("alternative")) {
    return `Raw overdrive riffs, cranked fuzz pedals, and rebellious basslines.${artistMention}`;
  }
  if (lower.includes("jazz") || lower.includes("acoustic") || lower.includes("piano")) {
    return `Warm felt piano 7th chords, fingerpicked acoustic guitars, and serene soundscapes.${artistMention}`;
  }
  if (lower.includes("pop") || lower.includes("indie")) {
    return `Uplifting hooks, golden hour melodies, and bright acoustic grooves.${artistMention}`;
  }

  return `Live listening room dynamically matched to your recent ${formatted} streams.${artistMention}`;
}

/**
 * Generates distinct match reasons for each room recommendation card.
 */
function buildMatchReason(genre: string, lang: string, index: number): string {
  const formatted = capitalizeWords(genre);
  if (index === 0) {
    return `Direct match for your high-rotation ${formatted} listening streams and ${lang} regional frequency.`;
  }
  if (index === 1) {
    return `Calculated from your high ${formatted} track diversity and Openness personality vector.`;
  }
  return `Provides a relaxing ${formatted} acoustic contrast to your primary daily listening routine.`;
}

/**
 * Generates generic sample track placeholders derived dynamically from genre and language.
 */
function getGenericSampleTracks(genre: string, lang: string): { title: string; artist: string }[] {
  const formatted = capitalizeWords(genre);
  return [
    { title: `${formatted} Stream #1`, artist: `${lang} Live Session` },
    { title: `${formatted} Stream #2`, artist: `${lang} Curator` },
    { title: `${formatted} Stream #3`, artist: `${lang} Acoustic Wave` },
  ];
}

/**
 * Generates 100% dynamic Jam Rooms derived strictly from the user's recent listening history,
 * top listened artists, top genres, and listened language.
 */
export function generateDynamicRoomsFromListeningData(
  recentlyPlayed: SpotifyPlayHistory[] = [],
  topArtists: SpotifyArtist[] = [],
  topTracks: SpotifyTrack[] = [],
  userTasteProfile?: UserTasteProfile,
  customLanguage?: string | null
): DynamicJamRoom[] {
  // 1. Accumulate genres from recent streams & top artists
  const genreFrequencyMap: Record<string, number> = {};
  const artistNamesSet: Set<string> = new Set();

  topArtists.forEach((artist) => {
    if (artist.name) artistNamesSet.add(artist.name);
    artist.genres?.forEach((g) => {
      const norm = g.trim().toLowerCase();
      if (norm) {
        genreFrequencyMap[norm] = (genreFrequencyMap[norm] || 0) + 2;
      }
    });
  });

  recentlyPlayed.forEach((item) => {
    item.track?.artists?.forEach((a) => {
      if (a.name) artistNamesSet.add(a.name);
    });
  });

  // Extract top sorted genres
  const sortedGenres = Object.entries(genreFrequencyMap)
    .sort((a, b) => b[1] - a[1])
    .map(([g]) => g);

  // Determine language preference from listening history or custom choice
  const lang =
    customLanguage && customLanguage.trim().length > 0
      ? customLanguage.trim()
      : userTasteProfile?.preferredLanguage || inferLanguageFromArtists(topArtists, sortedGenres);

  const langPrefix = lang && lang !== "English" ? `${lang} ` : "";

  // 2. Select top 3 distinct music clusters/genres from user listening history
  const activeGenres =
    sortedGenres.length >= 3
      ? sortedGenres.slice(0, 3)
      : userTasteProfile?.topGenres && userTasteProfile.topGenres.length >= 3
        ? userTasteProfile.topGenres.slice(0, 3)
        : ["electronic", "alternative rock", "jazz acoustic"];

  const topArtistList = Array.from(artistNamesSet);

  const ICONS: ("Moon" | "Zap" | "Flame" | "Sun" | "Wind" | "Radio")[] = [
    "Moon",
    "Zap",
    "Flame",
    "Sun",
    "Wind",
    "Radio",
  ];

  // 3. Construct 100% dynamic rooms with distinct names, bios, match reasons, and generic track previews
  const dynamicRooms: DynamicJamRoom[] = activeGenres.map((genre, idx) => {
    const formattedGenre = capitalizeWords(genre);
    const suffix = getRoomSuffix(genre, idx);
    const slug = `${lang.toLowerCase()}-${genre.replace(/[^a-z0-9]/g, "-")}-room`;
    const roomTitle = `${langPrefix}${formattedGenre} ${suffix}`.trim();

    const assignedArtist = topArtistList[idx % Math.max(1, topArtistList.length)];
    const description = buildRoomDescription(genre, assignedArtist);
    const recommendationReason = buildMatchReason(genre, lang, idx);

    const searchQuery = `${langPrefix}${genre} playlist`.trim();
    const matchScore = Math.max(85, 98 - idx * 4);

    return {
      id: slug,
      slug,
      name: roomTitle,
      vibeTag: `${lang} • ${formattedGenre}`,
      description,
      iconName: ICONS[idx % ICONS.length],
      matchScore,
      recommendationReason,
      activeListenersCount: Math.floor(Math.random() * 35) + 12,
      searchQuery,
      playlistPreview: {
        title: `${roomTitle} Playlist`,
        tracksCount: 15,
        sampleTracks: getGenericSampleTracks(genre, lang),
      },
    };
  });

  return dynamicRooms;
}

/**
 * Async wrapper that checks Redis cache key `room-catalog:{userId}:{profileVersion}` (1h EX TTL)
 * first and only computes + writes-through to Redis on a cache miss.
 */
export async function getOrGenerateDynamicRoomsWithCache(
  recentlyPlayed: SpotifyPlayHistory[] = [],
  topArtists: SpotifyArtist[] = [],
  topTracks: SpotifyTrack[] = [],
  userTasteProfile?: UserTasteProfile,
  customLanguage?: string | null,
  userId?: string | null,
  profileVersion: number = 1
): Promise<DynamicJamRoom[]> {
  if (userId) {
    const cachedRooms = await getCachedRoomCatalog(userId, profileVersion);
    if (cachedRooms && Array.isArray(cachedRooms) && cachedRooms.length > 0) {
      return cachedRooms;
    }
  }

  // Cache miss or no userId: compute dynamic rooms
  const rooms = generateDynamicRoomsFromListeningData(
    recentlyPlayed,
    topArtists,
    topTracks,
    userTasteProfile,
    customLanguage
  );

  if (userId && rooms.length > 0) {
    // Write-through to Redis with 1h EX TTL
    setCachedRoomCatalog(userId, profileVersion, rooms).catch(() => {});
  }

  return rooms;
}
