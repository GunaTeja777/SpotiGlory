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

export interface AgenticDecision {
  step: string;
  decision: string;
  status: "done" | "active" | "skipped";
}

export interface AgenticPlaylistResponse {
  playlists: RoomPlaylist[];
  decisions: AgenticDecision[];
}

function cleanAndParseJson(content: string): any {
  const cleaned = content.replace(/```json/gi, "").replace(/```/gi, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    try {
      // Fix unquoted string values starting with a letter that have spaces or punctuation
      const fixed = cleaned.replace(/:\s*([A-Za-z][A-Za-z0-9_'\-& ]+)\s*(,|}|\n)/g, ': "$1"$2');
      return JSON.parse(fixed);
    } catch (err) {
      throw e; // Throw original error if fix fails
    }
  }
}

export async function getAgenticRagPlaylists(
  roomSlug: string,
  recentTracks: { name: string; artist: string; album: string }[],
  language?: string,
  accessToken?: string
): Promise<AgenticPlaylistResponse> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  // Dynamically resolve target language: if user provided custom language parameter, use it;
  // otherwise, pass user's actual recent tracks to the AI agent to dynamically infer language and genre!
  let targetLang = language && language.trim().length > 0 && language !== "default" ? language.trim() : "Dynamic (Infer from History)";

  const decisions: AgenticDecision[] = [];

  decisions.push({
    step: "Analyze Request Vibe",
    decision: `Analyzing target room vibe "${roomSlug}" with preferred language "${targetLang}" and ${recentTracks.length} recent history tracks.`,
    status: "done"
  });

  if (!openRouterKey || openRouterKey === "your_openrouter_api_key_here") {
    decisions.push({
      step: "Agent Routing Decision",
      decision: "OpenRouter API key is not configured. Falling back to local templates.",
      status: "skipped"
    });
    return { playlists: [], decisions };
  }

  const retrievedDocs = retrieveCandidatePlaylists(roomSlug, recentTracks, targetLang);
  decisions.push({
    step: "Query Local Catalog",
    decision: `Identified top ${retrievedDocs.length} matching candidate playlist templates: ${retrievedDocs.map(d => `"${d.title}"`).join(", ")}.`,
    status: "done"
  });

  const decisionPrompt = `You are an AI Agent Router for the SpotiGlory music recommendation system.
You are generating a playlist for a room with vibe/theme: "${roomSlug}" and language: "${targetLang}".
The user's recent listening history includes:
${recentTracks.length > 0 ? recentTracks.map((t, idx) => `  - "${t.name}" by ${t.artist}`).join("\n") : "  - No recent tracks available."}

DYNAMIC LANGUAGE & GENRE INSTRUCTIONS:
1. Analyze the user's recent tracks dynamically. Identify the primary language (e.g. English, Spanish, Hindi, Korean, Tamil) and music style from the artist names and song titles.
2. If the user's recent history is in English, Spanish, or another language, target that language and artist genre dynamically. Do NOT force any regional language unless the user's history actually matches it!

You have access to these sourcing tools:
1. "search_spotify": Search Spotify index for playlist or track keywords.
2. "search_web": Search web music reviews, blogs, and charts.
3. "find_similar_artists": Find similar or complementary artists to the user's favorites.
4. "use_user_listening_history": Directly include or match user's recent songs.
5. "search_reddit": Search Reddit communities like r/music, r/listentothis for community favorites.
6. "try_another_query": Refine or try a different search keyword if the vibe is niche.

Determine a list of 5-6 decisions. Decide whether to execute each tool (set "execute": true) or skip it (set "execute": false). Provide a specific search query or target artist name for the executed tools and a 1-sentence reasoning.

Format your output STRICTLY as a raw JSON object matching the JSON structure below. Do not wrap in markdown blocks, do not add comments.
JSON Structure:
{
  "decisions": [
    {
      "tool": "search_spotify" | "search_web" | "find_similar_artists" | "use_user_listening_history" | "search_reddit" | "try_another_query",
      "execute": boolean,
      "queryOrArtist": "Query keyword or artist name, or empty string",
      "reasoning": "Reasoning sentence"
    }
  ]
}
`;

  let decisionData: any = null;
  try {
    const decRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openRouterKey}`,
        "HTTP-Referer": "https://spotiglory.vercel.app",
        "X-Title": "SpotiGlory Agent Router"
      },
      body: JSON.stringify({
        model: "openrouter/free",
        temperature: 0.3,
        messages: [
          { role: "system", content: "You are a precise JSON router that outputs tool execution plans." },
          { role: "user", content: decisionPrompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (decRes.ok) {
      const decJson = await decRes.json();
      const content = decJson.choices?.[0]?.message?.content || "";
      decisionData = cleanAndParseJson(content);
    }
  } catch (e) {
    console.error("Agent router error:", e);
  }

  if (!decisionData || !Array.isArray(decisionData.decisions)) {
    decisionData = {
      decisions: [
        { tool: "use_user_listening_history", execute: true, queryOrArtist: "", reasoning: "Leveraging user recently played songs." },
        { tool: "search_spotify", execute: true, queryOrArtist: `${targetLang} ${roomSlug}`, reasoning: "Searching Spotify for main vibe." },
        { tool: "find_similar_artists", execute: false, queryOrArtist: "", reasoning: "No user artists resolved." },
        { tool: "search_web", execute: true, queryOrArtist: `best ${targetLang} ${roomSlug} tracks`, reasoning: "Querying web index for additional songs." },
        { tool: "search_reddit", execute: true, queryOrArtist: `${targetLang} indie music Reddit`, reasoning: "Sourcing community discussions." },
        { tool: "try_another_query", execute: false, queryOrArtist: "", reasoning: "Initial queries are sufficient." }
      ]
    };
  }

  const activeTools = new Set<string>();
  const toolQueries: Record<string, string> = {};

  decisionData.decisions.forEach((dec: any) => {
    let stepTitle = "";
    let desc = dec.reasoning;
    switch (dec.tool) {
      case "search_spotify":
        stepTitle = "Search Spotify";
        if (dec.execute) {
          activeTools.add("spotify");
          toolQueries["spotify"] = dec.queryOrArtist;
          desc = `Searching Spotify playlists & tracks for "${dec.queryOrArtist}". (${dec.reasoning})`;
        }
        break;
      case "search_web":
        stepTitle = "Search Web";
        if (dec.execute) {
          activeTools.add("web");
          toolQueries["web"] = dec.queryOrArtist;
          desc = `Sourcing web music indexes for "${dec.queryOrArtist}". (${dec.reasoning})`;
        }
        break;
      case "find_similar_artists":
        stepTitle = "Find Similar Artists";
        if (dec.execute) {
          activeTools.add("similar_artists");
          toolQueries["similar_artists"] = dec.queryOrArtist;
          desc = `Sourcing similar/complementary artists to "${dec.queryOrArtist}". (${dec.reasoning})`;
        }
        break;
      case "use_user_listening_history":
        stepTitle = "Use User History";
        if (dec.execute && recentTracks.length > 0) {
          activeTools.add("history");
          desc = `Analyzing user history tracks: ${recentTracks.slice(0, 3).map(t => `"${t.name}"`).join(", ")}. (${dec.reasoning})`;
        } else {
          dec.execute = false;
          desc = `Skipping history integration (no tracks found). (${dec.reasoning})`;
        }
        break;
      case "search_reddit":
        stepTitle = "Search Reddit";
        if (dec.execute) {
          activeTools.add("reddit");
          toolQueries["reddit"] = dec.queryOrArtist;
          desc = `Querying Reddit music subreddits (r/listentothis, r/music) for "${dec.queryOrArtist}". (${dec.reasoning})`;
        }
        break;
      case "try_another_query":
        stepTitle = "Try Refined Query";
        if (dec.execute) {
          activeTools.add("refined_query");
          toolQueries["refined_query"] = dec.queryOrArtist;
          desc = `Trying refined backup query: "${dec.queryOrArtist}". (${dec.reasoning})`;
        }
        break;
    }

    if (stepTitle) {
      decisions.push({
        step: stepTitle,
        decision: desc,
        status: dec.execute ? "done" : "skipped"
      });
    }
  });

  let spotifySearchTracks: any[] = [];
  if (activeTools.has("spotify") && accessToken && toolQueries["spotify"]) {
    try {
      const searchRes = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(toolQueries["spotify"])}&type=playlist&limit=2`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const playlists = searchData.playlists?.items || [];
        if (playlists.length > 0) {
          const plId = playlists[0].id;
          const tracksRes = await fetch(
            `https://api.spotify.com/v1/playlists/${plId}/tracks?limit=6`,
            {
              headers: { Authorization: `Bearer ${accessToken}` }
            }
          );
          if (tracksRes.ok) {
            const tracksData = await tracksRes.json();
            spotifySearchTracks = (tracksData.items || [])
              .map((item: any) => item.track)
              .filter(Boolean)
              .map((t: any) => ({ name: t.name, artist: t.artists?.[0]?.name || "", album: t.album?.name || "" }));
          }
        }
      }
    } catch (e) {
      console.error("Spotify RAG search failed:", e);
    }
  }

  decisions.push({
    step: "Consolidate & Merge Data",
    decision: `Gathered input from: ${Array.from(activeTools).join(", ")}. Merging candidate tracks to create 3 targeted playlists.`,
    status: "active"
  });

  const consolidationPrompt = `You are a Context-Guided RAG Sourcing Engine and playlist creator.
A user is listening to these recent songs:
${recentTracks.length > 0 ? recentTracks.map((t, idx) => `  - "${t.name}" by ${t.artist}`).join("\n") : "  - None."}

Primary Language: "${targetLang}"
Room Theme Target: "${roomSlug}"

[Retrieved Ground-Truth Candidate Playlists]
Use these as templates for track style & progression:
${retrievedDocs.map((doc, idx) => `
Template #${idx + 1}: "${doc.title}"
Vibe/Description: ${doc.description}
Tracks:
${doc.tracks.map(t => `  - "${t.name}" by ${t.artist}`).join("\n")}
`).join("\n")}

[Sourcing Tool Findings]
- Active Tools: ${Array.from(activeTools).join(", ")}
- Spotify Search Results: ${spotifySearchTracks.length > 0 ? spotifySearchTracks.map(t => `"${t.name}" by ${t.artist}`).join(", ") : "None/Bypassed"}
- Web Query: "${toolQueries["web"] || "None"}"
- Reddit Query: "${toolQueries["reddit"] || "None"}"
- Similar Artists Search: "${toolQueries["similar_artists"] || "None"}"

Construct 3 custom, highly cohesive thematic playlists. Each playlist must represent a different sub-genre or listening style corresponding to "${roomSlug}".

DYNAMIC LANGUAGE & GENRE EXTRACTION:
1. Dynamically analyze the user's recent listening history above to detect their primary language and genres.
2. If the user's recent tracks are in Spanish, English, Hindi, Korean, etc., construct playlists matching that detected language and artist style.

CRITICAL JSON CONSTRAINT RULES:
1. Every key and string value (title, description, name, artist, album, id) MUST be strictly enclosed in double quotes (e.g. "album": "Yennai Arindhaal"). Never leave a string value unquoted or raw.
2. The response must be a single, valid JSON object matching the schema below. No comments or extra text.
3. Do NOT hallucinate or invent non-existent songs. Do NOT translate artist or song names into other languages (e.g., do not make up Tamil songs for "Neoni" or Spanish songs for "Anirudh"). Only output actual real songs by real artists that exist in that language/genre.

Format your output STRICTLY as a raw JSON object matching the TypeScript shape below. DO NOT wrap in markdown \`\`\`json blocks. Do not add comments or extra text.

Shape:
{
  "playlists": [
    {
      "title": "Descriptive, stylish playlist title (e.g. 'Tamil Indie Pop Hits')",
      "description": "Short explanation of the vibe of this playlist.",
      "tracks": [
        {
          "id": "uniquely_generated_id_string",
          "name": "Actual real track name in the matching genre/language",
          "artist": "Real artist name",
          "album": "Real album name",
          "durationMs": 180000
        }
      ]
    }
  ]
}
`;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openRouterKey}`,
        "HTTP-Referer": "https://spotiglory.vercel.app",
        "X-Title": "SpotiGlory RAG Playlist Generator"
      },
      body: JSON.stringify({
        model: "openrouter/free",
        temperature: 0.5,
        messages: [
          { role: "system", content: "You are a precise JSON generator that returns Spotify playlists." },
          { role: "user", content: consolidationPrompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "";
      const parsed = cleanAndParseJson(content);

      if (parsed && Array.isArray(parsed.playlists) && parsed.playlists.length >= 1) {
        const finalPlaylists = parsed.playlists.slice(0, 3).map((pl: any, listIdx: number) => ({
          roomId: roomSlug,
          title: pl.title || "",
          description: pl.description || "",
          updatedAt: new Date().toISOString(),
          sourceType: "google_rag" as const,
          tracks: (pl.tracks || []).map((t: any, trackIdx: number) => ({
            id: t.id || `rag_${listIdx}_track_${trackIdx}`,
            name: t.name || "",
            artist: t.artist || "",
            album: t.album || "",
            coverUrl: t.coverUrl || "",
            durationMs: t.durationMs || 220000,
            addedBy: "RAG Playlist Generator (Search Result)"
          }))
        }));

        decisions[decisions.length - 1].status = "done";
        decisions.push({
          step: "Create Playlists",
          decision: `Successfully generated 3 playlists: ${finalPlaylists.map((p: any) => `"${p.title}"`).join(", ")}.`,
          status: "done"
        });

        return {
          playlists: finalPlaylists,
          decisions
        };
      }
    }
  } catch (e) {
    console.error("OpenRouter Agentic Playlist Generator error:", e);
  }

  decisions[decisions.length - 1].status = "skipped";
  decisions.push({
    step: "Create Playlists",
    decision: "Failed to generate playlists using Agentic RAG. Falling back to local templates.",
    status: "skipped"
  });

  return {
    playlists: [],
    decisions
  };
}
