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
}

const ROOM_PLAYLIST_DATABASE: Record<string, RoomPlaylist> = {
  "midnight-neon-sanctuary": {
    roomId: "midnight-neon-sanctuary",
    title: "Late Night Neon Sanctuary",
    description: "Atmospheric synthwave, ambient lo-fi, and midnight reverb for nocturnal reflection.",
    updatedAt: new Date().toISOString(),
    tracks: [
      {
        id: "m83_midnight_city",
        name: "Midnight City",
        artist: "M83",
        album: "Hurry Up, We're Dreaming",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b27350f0c05877f805f15d26ff8c",
        previewUrl: "https://p.scdn.co/mp3-preview/a9c4a86b16e453c07659556bbd0bf881a7b8e5c1",
        spotifyUrl: "https://open.spotify.com/track/6GyDYK2yebGZyoMVEEUtK7",
        durationMs: 243000,
        addedBy: "Echo (AI Companion)",
      },
      {
        id: "home_resonance",
        name: "Resonance",
        artist: "HOME",
        album: "Odyssey",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b27376c94aa3c76c0ebf156d43e2",
        previewUrl: "https://p.scdn.co/mp3-preview/89fa591c33f2371987d3a01726ea7df5d43e9365",
        spotifyUrl: "https://open.spotify.com/track/1TuOp65SecvGlUZLW3VdGf",
        durationMs: 212000,
        addedBy: "Echo (AI Companion)",
      },
      {
        id: "beach_house_space_song",
        name: "Space Song",
        artist: "Beach House",
        album: "Depression Cherry",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b2737e61b7f041235b0d01d1c312",
        previewUrl: "https://p.scdn.co/mp3-preview/380ea7b03a89a544b82d07521743ea416d80c57c",
        spotifyUrl: "https://open.spotify.com/track/7ac97858c1482b8a0715",
        durationMs: 320000,
        addedBy: "Echo (AI Companion)",
      },
      {
        id: "tycho_a_walk",
        name: "A Walk",
        artist: "Tycho",
        album: "Dive",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273a38f3bb2c420bd4b96791d29",
        spotifyUrl: "https://open.spotify.com/track/4b9982463e264ab2",
        durationMs: 316000,
        addedBy: "Echo (AI Companion)",
      },
      {
        id: "kavinsky_nightcall",
        name: "Nightcall",
        artist: "Kavinsky",
        album: "OutRun",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273fa41639d6b2c2860d47d4838",
        spotifyUrl: "https://open.spotify.com/track/0U0ldo2QwSFi2ClYsvjGGl",
        durationMs: 259000,
        addedBy: "Echo (AI Companion)",
      },
    ],
  },

  "deep-focus-acoustic": {
    roomId: "deep-focus-acoustic",
    title: "Serene Acoustic Resonance",
    description: "Minimalist piano, fingerpicked acoustic guitars, and calm ambient strings.",
    updatedAt: new Date().toISOString(),
    tracks: [
      {
        id: "ludovico_nuvole",
        name: "Nuvole Bianche",
        artist: "Ludovico Einaudi",
        album: "Una Mattina",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273e970b8a362f6b3bc67733f11",
        spotifyUrl: "https://open.spotify.com/track/3Fi2M5Q0aDbfM5d25",
        durationMs: 357000,
        addedBy: "Luna (AI Companion)",
      },
      {
        id: "bon_iver_holocene",
        name: "Holocene",
        artist: "Bon Iver",
        album: "Bon Iver, Bon Iver",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273cae96f131a9bf16c80521e64",
        spotifyUrl: "https://open.spotify.com/track/4P90aL6c299c",
        durationMs: 337000,
        addedBy: "Luna (AI Companion)",
      },
      {
        id: "head_heart_rivers",
        name: "Rivers and Roads",
        artist: "The Head and the Heart",
        album: "The Head and the Heart",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b27389a071f005d53512b9a7c365",
        spotifyUrl: "https://open.spotify.com/track/4b9982463e264ab2",
        durationMs: 284000,
        addedBy: "Luna (AI Companion)",
      },
      {
        id: "yiruma_river_flows",
        name: "River Flows in You",
        artist: "Yiruma",
        album: "First Love",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273c52e89643d928236b2f7678f",
        spotifyUrl: "https://open.spotify.com/track/0U0ldo2QwSFi2ClYsvjGGl",
        durationMs: 188000,
        addedBy: "Luna (AI Companion)",
      },
    ],
  },

  "electric-pulse": {
    roomId: "electric-pulse",
    title: "Adrenaline Overdrive",
    description: "Driving EDM, hyperpop synths, and high-octane 128 BPM dance anthems.",
    updatedAt: new Date().toISOString(),
    tracks: [
      {
        id: "zedd_clarity",
        name: "Clarity",
        artist: "Zedd ft. Foxes",
        album: "Clarity",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b27376c94aa3c76c0ebf156d43e2",
        spotifyUrl: "https://open.spotify.com/track/6GyDYK2yebGZyoMVEEUtK7",
        durationMs: 271000,
        addedBy: "Hyperion (AI Companion)",
      },
      {
        id: "deadmau5_strobe",
        name: "Strobe",
        artist: "deadmau5",
        album: "For Lack of a Better Name",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273a38f3bb2c420bd4b96791d29",
        spotifyUrl: "https://open.spotify.com/track/1TuOp65SecvGlUZLW3VdGf",
        durationMs: 637000,
        addedBy: "Hyperion (AI Companion)",
      },
      {
        id: "daft_punk_one_more_time",
        name: "One More Time",
        artist: "Daft Punk",
        album: "Discovery",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273fa41639d6b2c2860d47d4838",
        spotifyUrl: "https://open.spotify.com/track/0U0ldo2QwSFi2ClYsvjGGl",
        durationMs: 320000,
        addedBy: "Hyperion (AI Companion)",
      },
    ],
  },

  "sun-drenched-indie": {
    roomId: "sun-drenched-indie",
    title: "Golden Hour Melodies",
    description: "Uplifting indie pop hooks, sun-drenched basslines, and bright summer acoustics.",
    updatedAt: new Date().toISOString(),
    tracks: [
      {
        id: "grouplove_tongue_tied",
        name: "Tongue Tied",
        artist: "GROUPLOVE",
        album: "Never Trust a Happy Song",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273e970b8a362f6b3bc67733f11",
        spotifyUrl: "https://open.spotify.com/track/6GyDYK2yebGZyoMVEEUtK7",
        durationMs: 218000,
        addedBy: "Sol (AI Companion)",
      },
      {
        id: "mgmt_electric_feel",
        name: "Electric Feel",
        artist: "MGMT",
        album: "Oracular Spectacular",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b27376c94aa3c76c0ebf156d43e2",
        spotifyUrl: "https://open.spotify.com/track/1TuOp65SecvGlUZLW3VdGf",
        durationMs: 229000,
        addedBy: "Sol (AI Companion)",
      },
      {
        id: "vance_joy_riptide",
        name: "Riptide",
        artist: "Vance Joy",
        album: "Dream Your Life Away",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b27389a071f005d53512b9a7c365",
        spotifyUrl: "https://open.spotify.com/track/0U0ldo2QwSFi2ClYsvjGGl",
        durationMs: 204000,
        addedBy: "Sol (AI Companion)",
      },
    ],
  },

  "fiery-underground": {
    roomId: "fiery-underground",
    title: "Rebellious Distortion",
    description: "Raw alternative rock riffs, heavy bass trap, and intense rebellious anthems.",
    updatedAt: new Date().toISOString(),
    tracks: [
      {
        id: "nirvana_teen_spirit",
        name: "Smells Like Teen Spirit",
        artist: "Nirvana",
        album: "Nevermind",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273fa41639d6b2c2860d47d4838",
        spotifyUrl: "https://open.spotify.com/track/6GyDYK2yebGZyoMVEEUtK7",
        durationMs: 301000,
        addedBy: "Blaze (AI Companion)",
      },
      {
        id: "soad_chop_suey",
        name: "Chop Suey!",
        artist: "System Of A Down",
        album: "Toxicity",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273a38f3bb2c420bd4b96791d29",
        spotifyUrl: "https://open.spotify.com/track/1TuOp65SecvGlUZLW3VdGf",
        durationMs: 210000,
        addedBy: "Blaze (AI Companion)",
      },
      {
        id: "kendrick_humble",
        name: "HUMBLE.",
        artist: "Kendrick Lamar",
        album: "DAMN.",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b27376c94aa3c76c0ebf156d43e2",
        spotifyUrl: "https://open.spotify.com/track/0U0ldo2QwSFi2ClYsvjGGl",
        durationMs: 177000,
        addedBy: "Blaze (AI Companion)",
      },
    ],
  },

  "subtle-melodic-chill": {
    roomId: "subtle-melodic-chill",
    title: "Tranquil Evening Chill",
    description: "Warm 7th chords, neo-soul grooves, and lofi chill beats.",
    updatedAt: new Date().toISOString(),
    tracks: [
      {
        id: "petit_biscuit_sunset",
        name: "Sunset Lover",
        artist: "Petit Biscuit",
        album: "Presence",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b27389a071f005d53512b9a7c365",
        spotifyUrl: "https://open.spotify.com/track/6GyDYK2yebGZyoMVEEUtK7",
        durationMs: 237000,
        addedBy: "Zephyr (AI Companion)",
      },
      {
        id: "george_benson_breezin",
        name: "Breezin'",
        artist: "George Benson",
        album: "Breezin'",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273e970b8a362f6b3bc67733f11",
        spotifyUrl: "https://open.spotify.com/track/1TuOp65SecvGlUZLW3VdGf",
        durationMs: 340000,
        addedBy: "Zephyr (AI Companion)",
      },
      {
        id: "hiatus_kaiyote_get_sun",
        name: "Get Sun",
        artist: "Hiatus Kaiyote",
        album: "Mood Valiant",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b27376c94aa3c76c0ebf156d43e2",
        spotifyUrl: "https://open.spotify.com/track/0U0ldo2QwSFi2ClYsvjGGl",
        durationMs: 337000,
        addedBy: "Zephyr (AI Companion)",
      },
    ],
  },
};

/**
 * Retrieves the playlist for a specific room with option to force-refresh / shuffle.
 */
export async function getRoomPlaylist(
  roomIdOrSlug: string,
  forceRefresh: boolean = false
): Promise<RoomPlaylist> {
  const existing = ROOM_PLAYLIST_DATABASE[roomIdOrSlug] || ROOM_PLAYLIST_DATABASE["midnight-neon-sanctuary"];

  if (!forceRefresh) {
    return existing;
  }

  // Simulate dynamic playlist re-sourcing / track rotation
  const shuffledTracks = [...existing.tracks].sort(() => Math.random() - 0.5);
  return {
    ...existing,
    updatedAt: new Date().toISOString(),
    tracks: shuffledTracks,
  };
}
