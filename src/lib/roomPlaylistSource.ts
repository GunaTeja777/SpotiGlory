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
  sourceType: "google_rag" | "curated_fallback";
}

// -------------------------------------------------------------
// Curated fallback data for high-fidelity regional playlists
// -------------------------------------------------------------
const RAG_FALLBACK_PLAYLISTS: Record<string, Record<string, { title: string; description: string; tracks: Omit<RoomTrack, "addedBy">[] }[]>> = {
  "midnight-neon-sanctuary": {
    Tamil: [
      {
        title: "Tamil Synthwave Retro",
        description: "Atmospheric Tamil electronic and retro synth vibes.",
        tracks: [
          { id: "tm_neo_1", name: "Neela Vaanam", artist: "Kamal Haasan, Devi Sri Prasad", album: "Manmadan Ambu", durationMs: 270000, coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80" },
          { id: "tm_neo_2", name: "Adiye", artist: "A.R. Rahman, Sid Sriram", album: "Kadal", durationMs: 302000, coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80" },
          { id: "tm_neo_3", name: "Showkali", artist: "A.R. Rahman, ADK", album: "Achcham Yenbadhu Madamaiyada", durationMs: 280000, coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80" }
        ]
      },
      {
        title: "Nocturnal Tamil Ambient",
        description: "Slow-tempo ambient Tamil melodies for late nights.",
        tracks: [
          { id: "tm_amb_1", name: "Marakkavillayae", artist: "A.R. Rahman, Anirudh Ravichander", album: "Single", durationMs: 250000, coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&q=80" },
          { id: "tm_amb_2", name: "Kannaana Kanney", artist: "D. Imman, Sid Sriram", album: "Viswasam", durationMs: 269000, coverUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80" }
        ]
      },
      {
        title: "Tamil Lo-Fi Sleep",
        description: "Soothing Tamil tracks mixed with warm lo-fi tape hiss.",
        tracks: [
          { id: "tm_lo_1", name: "Po Nee Po (Lo-Fi)", artist: "Anirudh Ravichander", album: "3", durationMs: 220000, coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80" },
          { id: "tm_lo_2", name: "Munbe Vaa", artist: "A.R. Rahman, Shreya Ghoshal", album: "Sillunu Oru Kaadhal", durationMs: 360000, coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80" }
        ]
      }
    ],
    Hindi: [
      {
        title: "Midnight Synth Safar",
        description: "Nocturnal Hindi synthwave and electronic pop.",
        tracks: [
          { id: "hn_neo_1", name: "Labon Ko", artist: "KK", album: "Bhool Bhulaiyaa", durationMs: 340000, coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80" },
          { id: "hn_neo_2", name: "Auva Auva", artist: "Bappi Lahiri", album: "Disco Dancer", durationMs: 310000, coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80" }
        ]
      },
      {
        title: "Hindi Lofi Beats",
        description: "Nostalgic Bollywood acoustic numbers with soft vinyl crackle.",
        tracks: [
          { id: "hn_lo_1", name: "Tum Se Hi (Lofi)", artist: "Pritam, Mohit Chauhan", album: "Jab We Met", durationMs: 290000, coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80" },
          { id: "hn_lo_2", name: "Kun Faya Kun", artist: "A.R. Rahman, Javed Ali", album: "Rockstar", durationMs: 470000, coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&q=80" }
        ]
      },
      {
        title: "Nocturnal Escape",
        description: "Late night atmospheric Hindi indietronica.",
        tracks: [
          { id: "hn_noc_1", name: "Kyon", artist: "Pritam, Papon", album: "Barfi!", durationMs: 260000, coverUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80" }
        ]
      }
    ],
    default: [
      {
        title: "Midnight Neon Drive",
        description: "Deep nocturnal synthwave and retro beats.",
        tracks: [
          { id: "en_neo_1", name: "Midnight City", artist: "M83", album: "Hurry Up, We're Dreaming", durationMs: 240000, coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80" },
          { id: "en_neo_2", name: "Nightcall", artist: "Kavinsky", album: "OutRun", durationMs: 258000, coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80" },
          { id: "en_neo_3", name: "Resonance", artist: "HOME", album: "Odyssey", durationMs: 210000, coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80" }
        ]
      },
      {
        title: "Ambient Stargazing",
        description: "Slow-paced ethereal ambient soundscapes.",
        tracks: [
          { id: "en_amb_1", name: "Space Song", artist: "Beach House", album: "Depression Cherry", durationMs: 320000, coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&q=80" },
          { id: "en_amb_2", name: "Intro", artist: "The xx", album: "xx", durationMs: 128000, coverUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80" }
        ]
      },
      {
        title: "Late Night Chillhop",
        description: "Warm jazz-infused lo-fi beats.",
        tracks: [
          { id: "en_lo_1", name: "Snowing", artist: "Lofi Girl", album: "Chilled Beats", durationMs: 150000, coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80" }
        ]
      }
    ]
  },
  "deep-focus-acoustic": {
    Tamil: [
      {
        title: "Tamil Acoustic Study",
        description: "Unplugged acoustic covers and simple guitar strums.",
        tracks: [
          { id: "tm_ac_1", name: "Pookkale Sattru Oyivedungal", artist: "A.R. Rahman, Haricharan", album: "I", durationMs: 308000, coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80" },
          { id: "tm_ac_2", name: "Kadhale Kadhale", artist: "Govind Vasantha, Chinmayi", album: "96", durationMs: 250000, coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&q=80" }
        ]
      },
      {
        title: "Tamil Piano Echoes",
        description: "Serene solo piano arrangements of classic melodies.",
        tracks: [
          { id: "tm_pi_1", name: "Kannalane (Piano)", artist: "A.R. Rahman", album: "Bombay", durationMs: 240000, coverUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80" }
        ]
      },
      {
        title: "Indie Tamil Acoustic Folk",
        description: "Uplifting rustic folk strings and acoustic storytelling.",
        tracks: [
          { id: "tm_flk_1", name: "Usure Pogudhey", artist: "A.R. Rahman, Karthik", album: "Raavanan", durationMs: 360000, coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80" }
        ]
      }
    ],
    default: [
      {
        title: "Solo Piano Serenade",
        description: "Calm, acoustic piano to enhance focus.",
        tracks: [
          { id: "en_pi_1", name: "Nuvole Bianche", artist: "Ludovico Einaudi", album: "Una Mattina", durationMs: 357000, coverUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80" },
          { id: "en_pi_2", name: "River Flows In You", artist: "Yiruma", album: "First Love", durationMs: 188000, coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80" }
        ]
      },
      {
        title: "Deep Acoustic Flow",
        description: "Acoustic strings and relaxing instrumental folk.",
        tracks: [
          { id: "en_ac_1", name: "Holocene", artist: "Bon Iver", album: "Bon Iver, Bon Iver", durationMs: 336000, coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80" }
        ]
      },
      {
        title: "Focus Ambient Acoustic",
        description: "Atmospheric acoustic echoes and drones.",
        tracks: [
          { id: "en_foc_1", name: "Flight from the City", artist: "Jóhann Jóhannsson", album: "Orphée", durationMs: 380000, coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&q=80" }
        ]
      }
    ]
  }
};

// Generic helper to get high-quality fallbacks for any room & language combination
export function getCuratedFallbackPlaylists(roomSlug: string, language?: string): RoomPlaylist[] {
  const normalizedSlug = roomSlug.toLowerCase();
  const roomKey = Object.keys(RAG_FALLBACK_PLAYLISTS).find(k => normalizedSlug.includes(k)) || "midnight-neon-sanctuary";
  
  const langKey = language && RAG_FALLBACK_PLAYLISTS[roomKey][language] ? language : "default";
  const lists = RAG_FALLBACK_PLAYLISTS[roomKey][langKey];

  return lists.map((list, index) => ({
    roomId: roomSlug,
    title: list.title,
    description: list.description,
    updatedAt: new Date().toISOString(),
    sourceType: "curated_fallback",
    tracks: list.tracks.map(t => ({
      ...t,
      addedBy: "Google RAG Agent (Fallback Mode)"
    }))
  }));
}

/**
 * Sources 3 distinct playlists using the Google RAG Agent (OpenRouter API) or falls back to curated lists.
 */
export async function getGoogleRagPlaylists(
  roomSlug: string,
  recentTracks: { name: string; artist: string; album: string }[],
  language?: string
): Promise<RoomPlaylist[]> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const targetLang = language || "English";

  const fallbackLists = getCuratedFallbackPlaylists(roomSlug, language);

  if (!openRouterKey || openRouterKey === "your_openrouter_api_key_here") {
    console.log("OpenRouter key not configured, returning curated fallback playlists.");
    return fallbackLists;
  }

  const prompt = `You are a Google RAG Agent. A user is currently listening to these 3 recent songs:
${recentTracks.length > 0 
  ? recentTracks.map((t, i) => `${i+1}. "${t.name}" by ${t.artist} (Album: ${t.album})`).join("\n") 
  : "No recent track history available."}

Room theme: "${roomSlug}"
Primary Language: "${targetLang}"

Based on the genre, mood, and language of these 3 songs, and matching the aesthetic of the room "${roomSlug}", simulate retrieving 3 distinct, highly curated thematic playlists from Google/Spotify.
Each of the 3 playlists must represent a different sub-genre or listening mood that blends the user's taste with the room's theme.

Format your output STRICTLY as a raw JSON object matching the TypeScript shape below. DO NOT wrap in markdown \`\`\`json blocks. Do not add comments or extra text.

Shape:
{
  "playlists": [
    {
      "title": "A descriptive, stylish playlist title (e.g. 'Tamil Synthwave Retro' or 'Atmospheric Ethereal Ambient')",
      "description": "Short explanation of the vibe of this playlist.",
      "tracks": [
        {
          "id": "uniquely_generated_id_string_1",
          "name": "Actual, real popular track name in the matching genre/language",
          "artist": "Real artist name",
          "album": "Real album name",
          "durationMs": 180000
        }
      ]
    }
  ]
}

Return exactly 3 playlists, each containing 5 to 6 actual real tracks. Use realistic Unsplash cover URLs if possible, or omit coverUrl. Set durationMs to reasonable integer milliseconds. Ensure track titles match the language preference (${targetLang}) if relevant!`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500); // 6.5s timeout for fast UI responsiveness

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openRouterKey}`,
        "HTTP-Referer": "https://spotiglory.vercel.app",
        "X-Title": "SpotiGlory Google RAG Agent"
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        temperature: 0.5,
        messages: [
          { role: "system", content: "You are a precise JSON generator that returns Spotify/Google playlists." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "";
      const parsed = JSON.parse(content);

      if (Array.isArray(parsed.playlists) && parsed.playlists.length >= 3) {
        const UNSPLASH_COVERS = [
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80",
          "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80",
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80",
          "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&q=80",
          "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80"
        ];

        return parsed.playlists.slice(0, 3).map((pl: any, listIdx: number) => ({
          roomId: roomSlug,
          title: pl.title || `Curated Vibe #${listIdx + 1}`,
          description: pl.description || "Synthesized results matching your listening tastes.",
          updatedAt: new Date().toISOString(),
          sourceType: "google_rag",
          tracks: (pl.tracks || []).map((t: any, trackIdx: number) => ({
            id: t.id || `rag_${listIdx}_track_${trackIdx}`,
            name: t.name || `Track #${trackIdx + 1}`,
            artist: t.artist || "Unknown Artist",
            album: t.album || "Single",
            coverUrl: t.coverUrl || UNSPLASH_COVERS[(listIdx + trackIdx) % UNSPLASH_COVERS.length],
            durationMs: t.durationMs || 180000,
            addedBy: "Google RAG Agent (Search Result)"
          }))
        }));
      }
    }
  } catch (e) {
    console.error("OpenRouter Google RAG Agent error:", e);
  }

  return fallbackLists;
}
