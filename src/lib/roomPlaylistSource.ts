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
  sourceType: "google_rag";
}

interface PlaylistDocument {
  id: string;
  title: string;
  description: string;
  vibe: string;
  genres: string[];
  tracks: { name: string; artist: string; album: string }[];
}

const PLAYLIST_CORPUS: PlaylistDocument[] = [
  {
    id: "doc_chill_ambient",
    title: "Serene Ambient Soundscapes",
    description: "Low-tempo, atmospheric synthesizer tracks and environmental field recordings designed for deep focus and meditation.",
    vibe: "calm peaceful relaxing focused ambient atmospheric acoustic soft drone",
    genres: ["ambient", "drone", "meditation", "chillout", "peaceful"],
    tracks: [
      { name: "Resonance", artist: "HOME", album: "Odyssey" },
      { name: "Aria", artist: "Hammock", album: "Departure Songs" },
      { name: "First Breath After Coma", artist: "Explosions in the Sky", album: "The Earth Is Not a Cold Dead Place" },
      { name: "Vanilla", artist: "Tycho", album: "Past Is Prologue" },
      { name: "Treefingers", artist: "Radiohead", album: "Kid A" }
    ]
  },
  {
    id: "doc_lofi_study",
    title: "Midnight Lofi Study Beats",
    description: "Moody, dust-laden hip-hop beats, vinyl crackles, and jazz piano chord loops perfect for late-night studying or coding.",
    vibe: "relaxing chill focus study late-night mellow jazz lofi cozy",
    genres: ["lofi", "chillhop", "jazzhop", "hip-hop", "study"],
    tracks: [
      { name: "Get You", artist: "Daniel Caesar", album: "Freudian" },
      { name: "Snowman", artist: "Wys", album: "Lofi Study" },
      { name: "Can I Call You Back?", artist: "Shiloh Dynasty", album: "Mellow" },
      { name: "Feather", artist: "Nujabes", album: "Modal Soul" },
      { name: "We're Finally Landing", artist: "HOME", album: "Before the Night" }
    ]
  },
  {
    id: "doc_deep_techno",
    title: "Deep Techno & Progressive House",
    description: "Driving 4/4 kicks, hypnotic basslines, and dark modular synthesizer arpeggios for club atmospheres and running playlists.",
    vibe: "energetic rhythmic dark electronic driving fast dance club beats house techno modular",
    genres: ["techno", "house", "electronic", "edm", "progressive"],
    tracks: [
      { name: "Opus", artist: "Eric Prydz", album: "Opus" },
      { name: "Strobe", artist: "deadmau5", album: "For Lack of a Better Name" },
      { name: "Unfinished Sympathy", artist: "Massive Attack", album: "Blue Lines" },
      { name: "Glue", artist: "Bicep", album: "Bicep" },
      { name: "Solar Detroit", artist: "Maceo Plex", album: "Solar" }
    ]
  },
  {
    id: "doc_heavy_rock",
    title: "Alternative & Rebellious Rock",
    description: "High-voltage electric guitars, driving live drums, and intense raw vocals from alternative rock, grunge, and punk eras.",
    vibe: "rebellious fiery energetic intense loud guitar heavy metal punk grunge rock",
    genres: ["rock", "grunge", "alternative", "punk", "metal"],
    tracks: [
      { name: "Smells Like Teen Spirit", artist: "Nirvana", album: "Nevermind" },
      { name: "In the End", artist: "Linkin Park", album: "Hybrid Theory" },
      { name: "Black Hole Sun", artist: "Soundgarden", album: "Superunknown" },
      { name: "Seven Nation Army", artist: "The White Stripes", album: "Elephant" },
      { name: "Everlong", artist: "Foo Fighters", album: "The Colour and the Shape" }
    ]
  },
  {
    id: "doc_indie_acoustic",
    title: "Woodland Indie Folk & Acoustic",
    description: "Warm acoustic fingerpicking, close vocal harmonies, and organic instrumentation designed for cozy cafe vibes and rainy days.",
    vibe: "introspective warm quiet cozy acoustic indie folk organic folk singer songwriter",
    genres: ["folk", "indie", "acoustic", "singer-songwriter", "cozy"],
    tracks: [
      { name: "Holocene", artist: "Bon OVer", album: "Bon Iver" },
      { name: "Flightless Bird, American Mouth", artist: "Iron & Wine", album: "The Shepherd's Dog" },
      { name: "Skinny Love", artist: "Bon Iver", album: "For Emma, Forever Ago" },
      { name: "The Night We Met", artist: "Lord Huron", album: "Strange Trails" },
      { name: "Rivers and Roads", artist: "The Head and the Heart", album: "The Head and the Heart" }
    ]
  },
  {
    id: "doc_upbeat_pop",
    title: "Sunkissed Upbeat Pop & Dance",
    description: "Bright, feel-good vocal melodies, energetic horn sections, and catchy pop beats to uplift mood and energy levels.",
    vibe: "cheerful upbeat positive happy energetic pop conventional hits dance charts",
    genres: ["pop", "dance", "synthpop", "uplifting", "charts"],
    tracks: [
      { name: "Blinding Lights", artist: "The Weeknd", album: "After Hours" },
      { name: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia" },
      { name: "Can't Stop the Feeling!", artist: "Justin Timberlake", album: "Trolls" },
      { name: "Stay", artist: "The Kid LAROI & Justin Bieber", album: "F*CK LOVE 3" },
      { name: "Sugar", artist: "Maroon 5", album: "V" }
    ]
  },
  {
    id: "doc_south_asian_fusion",
    title: "Sufi & South Asian Classical Fusion",
    description: "Rich sitar arpeggios, tabla rhythms, classical Indian ragas, and contemporary indie pop vocals in South Asian languages.",
    vibe: "spiritual cultural melodic south-asian indian fusion traditional classical sufi tamil telugu hindi punjabi",
    genres: ["indian", "bollywood", "tamil", "telugu", "hindi", "sufi", "punjabi"],
    tracks: [
      { name: "Kadhaippoma", artist: "Sid Sriram", album: "Oh My Kadavule" },
      { name: "Kun Faya Kun", artist: "A.R. Rahman", album: "Rockstar" },
      { name: "Kabira", artist: "Pritam", album: "Yeh Jawaani Hai Deewani" },
      { name: "Urumei", artist: "Sai Abhyankkar", album: "Urumei" },
      { name: "Kesariya", artist: "Pritam", album: "Brahmastra" }
    ]
  },
  {
    id: "doc_golden_hiphop",
    title: "Golden Age Hip-Hop & Rap",
    description: "Boom-bap drum beats, soul/funk sampling, rhythmic scratching, and masterclass lyrical flow from classic hip-hop pioneers.",
    vibe: "rhythmic groovy street hip-hop rap golden-age boom-bap lyrics urban",
    genres: ["hip-hop", "rap", "boom-bap", "classic-rap", "r&b"],
    tracks: [
      { name: "Lose Yourself", artist: "Eminem", album: "8 Mile" },
      { name: "Juicy", artist: "The Notorious B.I.G.", album: "Ready to Die" },
      { name: "C.R.E.A.M.", artist: "Wu-Tang Clan", album: "Enter the Wu-Tang" },
      { name: "All Eyez on Me", artist: "2Pac", album: "All Eyez on Me" },
      { name: "N.Y. State of Mind", artist: "Nas", album: "Illmatic" }
    ]
  }
];

export function retrieveCandidatePlaylists(
  roomSlug: string,
  recentTracks: { name: string; artist: string; album: string }[],
  language?: string
): PlaylistDocument[] {
  const queryParts: string[] = [];

  // Add room slug tokens
  const slugTokens = roomSlug.toLowerCase().split(/[-_]/);
  queryParts.push(...slugTokens);

  // Add language token
  if (language) {
    queryParts.push(language.toLowerCase());
  }

  // Add recent tracks names/artists tokens to capture genre/style affinity
  recentTracks.forEach((track) => {
    queryParts.push(...track.name.toLowerCase().split(/\s+/));
    queryParts.push(...track.artist.toLowerCase().split(/\s+/));
    queryParts.push(...track.album.toLowerCase().split(/\s+/));
  });

  // Clean tokens (remove empty, keep alphanumeric)
  const queryTokens = new Set(
    queryParts
      .map((t) => t.replace(/[^a-z0-9]/g, "").trim())
      .filter((t) => t.length > 1)
  );

  // Compute similarity score for each candidate document
  const scoredDocs = PLAYLIST_CORPUS.map((doc) => {
    // Construct document token set
    const docParts: string[] = [];
    docParts.push(...doc.title.toLowerCase().split(/\s+/));
    docParts.push(...doc.description.toLowerCase().split(/\s+/));
    docParts.push(...doc.vibe.toLowerCase().split(/\s+/));
    doc.genres.forEach((g) => docParts.push(g.toLowerCase()));

    const docTokens = new Set(
      docParts
        .map((t) => t.replace(/[^a-z0-9]/g, "").trim())
        .filter((t) => t.length > 1)
    );

    // Compute binary cosine similarity
    let score = 0;
    if (queryTokens.size > 0 && docTokens.size > 0) {
      const intersection = new Set([...queryTokens].filter((x) => docTokens.has(x)));
      score = intersection.size / Math.sqrt(queryTokens.size * docTokens.size);
    }

    return { doc, score };
  });

  // Sort by score descending and return Top 3 candidates
  scoredDocs.sort((a, b) => b.score - a.score);

  return scoredDocs.slice(0, 3).map((sd) => sd.doc);
}

/**
 * Sources 3 distinct playlists using the Context-Guided RAG Sourcing Engine (OpenRouter API) or returns an empty array.
 */
export async function getGoogleRagPlaylists(
  roomSlug: string,
  recentTracks: { name: string; artist: string; album: string }[],
  language?: string
): Promise<RoomPlaylist[]> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const targetLang = language || "English";

  if (!openRouterKey || openRouterKey === "your_openrouter_api_key_here") {
    console.log("OpenRouter key not configured, returning empty playlists.");
    return [];
  }

  // Retrieve Ground-Truth Candidate Playlists via Local Cosine-Similarity Search
  const retrievedDocs = retrieveCandidatePlaylists(roomSlug, recentTracks, targetLang);

  const prompt = `You are a Context-Guided RAG Sourcing Engine.
A user is currently listening to these 3 recent songs:
${recentTracks.length > 0 
  ? recentTracks.map((t, i) => `${i+1}. "${t.name}" by ${t.artist} (Album: ${t.album})`).join("\n") 
  : "No recent track history available."}

Primary Language: "${targetLang}"
Room Theme Target: "${roomSlug}"

[Retrieved Ground-Truth Candidate Playlists from Local Database]
Below are the top 3 closest matching playlist templates retrieved from our database using vector space token cosine similarity search:
${retrievedDocs.map((doc, idx) => `
Candidate Template #${idx + 1}: "${doc.title}"
Vibe/Description: ${doc.description}
Seed Tracks:
${doc.tracks.map(t => `  - "${t.name}" by ${t.artist} (Album: ${t.album})`).join("\n")}
`).join("\n")}

Identify the song genres and languages of the user's 3 recent songs. Based on the user's tracks AND the retrieved Ground-Truth Candidate Playlists above, generate 3 custom, highly cohesive thematic playlists.
Use the retrieved candidate track layouts as inspiration for track sequences, genres, and artists, but custom-tailor them to the target language ("${targetLang}") and vibe of the room ("${roomSlug}").
Each of the 3 playlists must represent a different music sub-genre or listening style corresponding to the target vibes.

Format your output STRICTLY as a raw JSON object matching the TypeScript shape below. DO NOT wrap in markdown \`\`\`json blocks. Do not add comments or extra text.

Shape:
{
  "playlists": [
    {
      "title": "A descriptive, stylish playlist title (e.g. 'Tamil Indie Pop Hits' or 'Soothing Acoustic Melodies')",
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
        "X-Title": "SpotiGlory RAG Playlist Generator"
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "openrouter/free",
        temperature: 0.5,
        messages: [
          { role: "system", content: "You are a precise JSON generator that returns Spotify playlists." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "";
      const cleaned = content.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      if (parsed && Array.isArray(parsed.playlists) && parsed.playlists.length >= 1) {
        return parsed.playlists.slice(0, 3).map((pl: any, listIdx: number) => ({
          roomId: roomSlug,
          title: pl.title || "",
          description: pl.description || "",
          updatedAt: new Date().toISOString(),
          sourceType: "google_rag",
          tracks: (pl.tracks || []).map((t: any, trackIdx: number) => ({
            id: t.id || `rag_${listIdx}_track_${trackIdx}`,
            name: t.name || "",
            artist: t.artist || "",
            album: t.album || "",
            coverUrl: t.coverUrl || "",
            durationMs: t.durationMs || 0,
            addedBy: "RAG Playlist Generator (Search Result)"
          }))
        }));
      }
    }
  } catch (e) {
    console.error("OpenRouter RAG Playlist Generator error:", e);
  }

  return [];
}
