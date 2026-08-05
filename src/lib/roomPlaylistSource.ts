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

/**
 * Sources 3 distinct playlists using the Google RAG Agent (OpenRouter API) or returns an empty array.
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

  const prompt = `You are a Google RAG Agent. A user is currently listening to these 3 recent songs:
${recentTracks.length > 0 
  ? recentTracks.map((t, i) => `${i+1}. "${t.name}" by ${t.artist} (Album: ${t.album})`).join("\n") 
  : "No recent track history available."}

Primary Language: "${targetLang}"

Identify the song genres and languages of these 3 recent songs. Based ONLY on the name, artist, album, genre, and language of these 3 songs, simulate retrieving 3 distinct, highly curated thematic playlists from Google/Spotify.
Do NOT match or blend the results with any room's aesthetic theme or vibe. The playlists must be generated purely from the characteristics of these 3 source tracks.
Each of the 3 playlists must represent a different music sub-genre or listening style corresponding to the source tracks' vibes.

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

      if (parsed && Array.isArray(parsed.playlists) && parsed.playlists.length >= 3) {
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
            addedBy: "Google RAG Agent (Search Result)"
          }))
        }));
      }
    }
  } catch (e) {
    console.error("OpenRouter Google RAG Agent error:", e);
  }

  return [];
}
