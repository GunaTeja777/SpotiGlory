import { MoodType, OceanVector, MusicClusterVector } from "./jamMatching";

export interface RoomSampleTrack {
  title: string;
  artist: string;
  coverUrl?: string;
}

export interface RoomPlaylistPreview {
  title: string;
  tracksCount: number;
  sampleTracks: RoomSampleTrack[];
}

export interface MoodRoom {
  id: string;
  name: string;
  slug: string;
  description: string;
  primaryMood: MoodType;
  secondaryMoods: MoodType[];
  vibeTag: string;
  iconName: "Moon" | "Zap" | "Flame" | "Sun" | "Wind";
  activeListenersCount: number;
  playlistPreview: RoomPlaylistPreview;
  dominantCluster: string;
  oceanMatchTraits: string[];
}

export interface EvaluatedMoodRoom {
  room: MoodRoom;
  matchScore: number; // 0-100
  recommendationReason: string;
  isAdjacent?: boolean;
}

export interface RoomRecommendationResult {
  topRooms: EvaluatedMoodRoom[];
  adjacentRooms: EvaluatedMoodRoom[];
}

export const ALL_MOOD_ROOMS: MoodRoom[] = [
  {
    id: "room_midnight_neon",
    name: "Midnight Neon Sanctuary",
    slug: "midnight-neon-sanctuary",
    description: "Deep nocturnal synthwave, ambient lo-fi, and atmospheric soundscapes for late-night reflection.",
    primaryMood: "Reflective",
    secondaryMoods: ["Calm"],
    vibeTag: "Synthwave & Lo-Fi",
    iconName: "Moon",
    activeListenersCount: 42,
    dominantCluster: "Reflective & Complex",
    oceanMatchTraits: ["High Openness", "Moderate Neuroticism"],
    playlistPreview: {
      title: "Late Night Neon Waves",
      tracksCount: 35,
      sampleTracks: [
        { title: "Midnight City", artist: "M83" },
        { title: "Resonance", artist: "HOME" },
        { title: "Space Song", artist: "Beach House" },
      ],
    },
  },
  {
    id: "room_deep_focus",
    name: "Deep Focus Acoustic Lounge",
    slug: "deep-focus-acoustic",
    description: "Minimalist piano, indie folk, and acoustic strings designed for intense concentration and serene flow.",
    primaryMood: "Reflective",
    secondaryMoods: ["Calm"],
    vibeTag: "Acoustic & Piano",
    iconName: "Moon",
    activeListenersCount: 28,
    dominantCluster: "Reflective & Complex",
    oceanMatchTraits: ["High Conscientiousness", "High Openness"],
    playlistPreview: {
      title: "Serene Acoustic Resonance",
      tracksCount: 40,
      sampleTracks: [
        { title: "Nuvole Bianche", artist: "Ludovico Einaudi" },
        { title: "Holocene", artist: "Bon Iver" },
        { title: "Rivers and Roads", artist: "The Head and the Heart" },
      ],
    },
  },
  {
    id: "room_electric_pulse",
    name: "High Energy Electric Pulse",
    slug: "electric-pulse",
    description: "Driving EDM, hyperpop, and rhythmic dance anthems to surge your adrenaline.",
    primaryMood: "Energized",
    secondaryMoods: ["Fiery", "Upbeat"],
    vibeTag: "EDM & Hyperpop",
    iconName: "Zap",
    activeListenersCount: 56,
    dominantCluster: "Energetic & Rhythmic",
    oceanMatchTraits: ["High Extraversion", "High Openness"],
    playlistPreview: {
      title: "Adrenaline Overdrive",
      tracksCount: 50,
      sampleTracks: [
        { title: "Clarity", artist: "Zedd" },
        { title: "Strobe", artist: "deadmau5" },
        { title: "One More Time", artist: "Daft Punk" },
      ],
    },
  },
  {
    id: "room_sun_drenched_indie",
    name: "Sun-Drenched Indie Haven",
    slug: "sun-drenched-indie",
    description: "Bright indie pop melodies, uplifting hooks, and golden hour vibes.",
    primaryMood: "Upbeat",
    secondaryMoods: ["Energized", "Calm"],
    vibeTag: "Indie Pop & Alt",
    iconName: "Sun",
    activeListenersCount: 39,
    dominantCluster: "Upbeat & Conventional",
    oceanMatchTraits: ["High Agreeableness", "High Extraversion"],
    playlistPreview: {
      title: "Golden Hour Melodies",
      tracksCount: 45,
      sampleTracks: [
        { title: "Tongue Tied", artist: "GROUPLOVE" },
        { title: "Electric Feel", artist: "MGMT" },
        { title: "Riptide", artist: "Vance Joy" },
      ],
    },
  },
  {
    id: "room_fiery_underground",
    name: "Fiery Underground Club",
    slug: "fiery-underground",
    description: "Raw alternative rock, heavy bass trap, and intense rebellious anthems.",
    primaryMood: "Fiery",
    secondaryMoods: ["Energized"],
    vibeTag: "Rock & Heavy Bass",
    iconName: "Flame",
    activeListenersCount: 31,
    dominantCluster: "Intense & Rebellious",
    oceanMatchTraits: ["High Openness", "Low Conscientiousness"],
    playlistPreview: {
      title: "Rebellious Distortion",
      tracksCount: 42,
      sampleTracks: [
        { title: "Smells Like Teen Spirit", artist: "Nirvana" },
        { title: "Chop Suey!", artist: "System Of A Down" },
        { title: "HUMBLE.", artist: "Kendrick Lamar" },
      ],
    },
  },
  {
    id: "room_subtle_melodic_chill",
    name: "Subtle Melodic Chill-Out",
    slug: "subtle-melodic-chill",
    description: "Gentle lo-fi beats, warm neo-soul chords, and tranquil breeze acoustic vibes.",
    primaryMood: "Calm",
    secondaryMoods: ["Reflective", "Upbeat"],
    vibeTag: "Neo-Soul & Lo-Fi",
    iconName: "Wind",
    activeListenersCount: 24,
    dominantCluster: "Upbeat & Conventional",
    oceanMatchTraits: ["High Agreeableness", "Low Neuroticism"],
    playlistPreview: {
      title: "Tranquil Evening Chill",
      tracksCount: 38,
      sampleTracks: [
        { title: "Breezin'", artist: "George Benson" },
        { title: "Get Sun", artist: "Hiatus Kaiyote" },
        { title: "Sunset Lover", artist: "Petit Biscuit" },
      ],
    },
  },
];

const COMPATIBLE_MOOD_MAP: Record<MoodType, MoodType[]> = {
  Reflective: ["Calm", "Upbeat"],
  Calm: ["Reflective", "Upbeat"],
  Energized: ["Fiery", "Upbeat"],
  Fiery: ["Energized", "Upbeat"],
  Upbeat: ["Energized", "Calm"],
};

/**
 * Computes personalized room recommendations based on user's current mood,
 * music cluster distribution, and OCEAN personality traits.
 */
export function getRecommendedRooms(
  currentMood: MoodType,
  userClusters?: MusicClusterVector,
  userOcean?: OceanVector
): RoomRecommendationResult {
  const evaluatedRooms: EvaluatedMoodRoom[] = ALL_MOOD_ROOMS.map((room) => {
    let score = 50;

    // 1. Primary mood alignment (40 points)
    if (room.primaryMood === currentMood) {
      score += 40;
    } else if (room.secondaryMoods.includes(currentMood)) {
      score += 25;
    } else if (COMPATIBLE_MOOD_MAP[currentMood]?.includes(room.primaryMood)) {
      score += 15;
    }

    // 2. Music cluster alignment (30 points)
    if (userClusters) {
      if (room.dominantCluster === "Reflective & Complex" && userClusters.reflectiveComplex > 30) {
        score += Math.min(30, Math.round(userClusters.reflectiveComplex * 0.4));
      } else if (room.dominantCluster === "Intense & Rebellious" && userClusters.intenseRebellious > 30) {
        score += Math.min(30, Math.round(userClusters.intenseRebellious * 0.4));
      } else if (room.dominantCluster === "Upbeat & Conventional" && userClusters.upbeatConventional > 30) {
        score += Math.min(30, Math.round(userClusters.upbeatConventional * 0.4));
      } else if (room.dominantCluster === "Energetic & Rhythmic" && userClusters.energeticRhythmic > 30) {
        score += Math.min(30, Math.round(userClusters.energeticRhythmic * 0.4));
      }
    } else {
      score += 15;
    }

    // 3. OCEAN trait alignment (30 points)
    if (userOcean) {
      const opennessBonus = (userOcean.openness / 100) * 15;
      const extraversionBonus = (userOcean.extraversion / 100) * 15;
      score += Math.round((opennessBonus + extraversionBonus) / 2);
    } else {
      score += 10;
    }

    const finalScore = Math.min(99, Math.max(40, score));

    // Synthesize human-readable match reason
    let reason = "";
    if (room.primaryMood === currentMood) {
      reason = `Direct match for your ${currentMood} mood and ${room.dominantCluster} music preference.`;
    } else if (room.secondaryMoods.includes(currentMood)) {
      reason = `Shares your ${currentMood} vibe with an energetic ${room.vibeTag} twist.`;
    } else {
      reason = `Adjacent room featuring complementary ${room.primaryMood} acoustics.`;
    }

    return {
      room,
      matchScore: finalScore,
      recommendationReason: reason,
      isAdjacent: room.primaryMood !== currentMood,
    };
  });

  // Sort descending by matchScore
  evaluatedRooms.sort((a, b) => b.matchScore - a.matchScore);

  // Top 2-3 rooms matching primary vibe
  const topRooms = evaluatedRooms.slice(0, 3);
  const topRoomIds = new Set(topRooms.map((r) => r.room.id));

  // Adjacent/related rooms with complementary vibes
  const adjacentRooms = evaluatedRooms
    .filter((r) => !topRoomIds.has(r.room.id))
    .slice(0, 3);

  return {
    topRooms,
    adjacentRooms,
  };
}

export function getRoomBySlug(slug: string): MoodRoom | undefined {
  return ALL_MOOD_ROOMS.find((r) => r.slug === slug);
}

export function getRoomById(id: string): MoodRoom | undefined {
  return ALL_MOOD_ROOMS.find((r) => r.id === id);
}
