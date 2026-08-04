import { UserTasteProfile } from "./userTasteProfile";

export interface PlaylistQueryParams {
  archetype: string;
  tasteProfile: UserTasteProfile;
}

export interface PlaylistQueryResult {
  query: string;
  cacheHit: boolean;
  cacheKey: string;
  source: "llm" | "cache" | "fallback";
}

// In-memory query cache keyed by (archetype, cluster, language, primaryGenre)
const QUERY_CACHE: Map<string, string> = new Map();

/**
 * Normalizes input string for cache key generation.
 */
function normalizeKeyToken(str?: string): string {
  if (!str) return "any";
  return str.toLowerCase().trim().replace(/[^a-z0-9]/g, "_");
}

/**
 * Computes deterministic cache key per (archetype, cluster, language, primaryGenre).
 */
export function getPlaylistQueryCacheKey(params: PlaylistQueryParams): string {
  const roomKey = normalizeKeyToken(params.archetype);
  const clusterKey = normalizeKeyToken(params.tasteProfile.dominantMusicCluster);
  const langKey = normalizeKeyToken(params.tasteProfile.preferredLanguage);
  const primaryGenreKey = normalizeKeyToken(params.tasteProfile.topGenres?.[0] || "any");

  return `${roomKey}:${clusterKey}:${langKey}:${primaryGenreKey}`;
}

/**
 * Clears the query cache (useful for testing or cache reset).
 */
export function clearPlaylistQueryCache(): void {
  QUERY_CACHE.clear();
}

/**
 * Deterministic fallback query builder guaranteeing grounded search query strings.
 */
export function buildFallbackPlaylistQuery(params: PlaylistQueryParams): string {
  const { archetype, tasteProfile } = params;
  const lang = tasteProfile.preferredLanguage;
  const topGenres = tasteProfile.topGenres || [];

  const langPrefix = lang && lang !== "English" ? `${lang} ` : "";

  const archetypeLower = archetype.toLowerCase();
  let moodKeywords = "vibes playlist";

  if (archetypeLower.includes("heartbreak")) {
    moodKeywords = "heartbreak sad breakup";
  } else if (archetypeLower.includes("midnight") || archetypeLower.includes("neon")) {
    moodKeywords = "late night synthwave lofi";
  } else if (archetypeLower.includes("focus") || archetypeLower.includes("acoustic")) {
    moodKeywords = "deep focus acoustic piano";
  } else if (archetypeLower.includes("electric") || archetypeLower.includes("pulse")) {
    moodKeywords = "high energy edm dance";
  } else if (archetypeLower.includes("indie") || archetypeLower.includes("sun")) {
    moodKeywords = "golden hour indie pop";
  } else if (archetypeLower.includes("fiery") || archetypeLower.includes("underground")) {
    moodKeywords = "heavy rock distortion";
  } else if (archetypeLower.includes("chill") || archetypeLower.includes("melodic")) {
    moodKeywords = "chill neo soul lofi";
  }

  const primaryGenre = topGenres.length > 0 ? topGenres[0] : "";
  const secondaryGenre = topGenres.length > 1 ? topGenres[1] : "";

  const rawQuery = `${langPrefix}${moodKeywords} ${primaryGenre} ${secondaryGenre}`.trim();
  // Clean multiple spaces
  return rawQuery.replace(/\s+/g, " ") + " playlist";
}

/**
 * Clean LLM response string into a concise Spotify search query.
 */
export function cleanLLMQueryResponse(rawText: string): string {
  let cleaned = rawText
    .replace(/```[a-z]*/gi, "")
    .replace(/```/g, "")
    .replace(/^["']|["']$/g, "")
    .replace(/^query:\s*/gi, "")
    .replace(/\n/g, " ")
    .trim();

  // Strip wrapping quotes if LLM returned `"query here"`
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  return cleaned.replace(/\s+/g, " ");
}

/**
 * Takes a room archetype plus the user's taste profile and generates a natural Spotify search query string.
 * Uses cached result if available to minimize LLM overhead.
 */
export async function buildPlaylistSearchQuery(
  params: PlaylistQueryParams
): Promise<PlaylistQueryResult> {
  const cacheKey = getPlaylistQueryCacheKey(params);

  // 1. Cache hit check
  if (QUERY_CACHE.has(cacheKey)) {
    return {
      query: QUERY_CACHE.get(cacheKey)!,
      cacheHit: true,
      cacheKey,
      source: "cache",
    };
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY;

  // 2. LLM Query Generation if API key exists
  if (openRouterKey && openRouterKey !== "your_openrouter_api_key_here") {
    try {
      const prompt = `Given mood: ${params.archetype}, genres: ${params.tasteProfile.topGenres.slice(0, 4).join(", ")}, language: ${params.tasteProfile.preferredLanguage}, generate ONE short, natural playlist search query as if searching Spotify directly (e.g. 'hindi breakup sad songs playlist' or 'late night lofi reflective'). Return only the query string, no quotes or explanation.`;

      const apiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterKey}`,
          "HTTP-Referer": "https://spotiglory.vercel.app",
          "X-Title": "SpotiGlory Playlist Query Builder",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet",
          temperature: 0.3,
          max_tokens: 35,
          messages: [
            {
              role: "system",
              content: "You are a concise Spotify search query generator. Return ONLY the search query string.",
            },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (apiRes.ok) {
        const apiJson = await apiRes.json();
        const rawContent = apiJson.choices?.[0]?.message?.content || "";
        const query = cleanLLMQueryResponse(rawContent);

        if (query.length >= 3) {
          QUERY_CACHE.set(cacheKey, query);
          return {
            query,
            cacheHit: false,
            cacheKey,
            source: "llm",
          };
        }
      }
    } catch (e) {
      // Fallback on error
    }
  }

  // 3. Fallback Query Generation
  const fallbackQuery = buildFallbackPlaylistQuery(params);
  QUERY_CACHE.set(cacheKey, fallbackQuery);

  return {
    query: fallbackQuery,
    cacheHit: false,
    cacheKey,
    source: "fallback",
  };
}
