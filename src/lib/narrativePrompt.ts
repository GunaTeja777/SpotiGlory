import { OceanScoresResult } from "./oceanScoring";
import { BehavioralFeatures, GenreDistributionItem } from "./features";
import { SpotifyArtist } from "./spotify";

export interface TraitInsight {
  trait: "Openness" | "Conscientiousness" | "Extraversion" | "Agreeableness" | "Neuroticism";
  insight: string;
}

export interface NarrativeProfile {
  headline: string;
  summary: string; // 2-3 sentences
  listeningPersona: string; // Evocative title like "The Nocturnal Explorer"
  traits: TraitInsight[];
  funFacts: string[]; // 2-3 specific data-driven observations
}

/**
 * Builds structured System & User prompts for Claude (claude-sonnet-4-6)
 */
export function buildNarrativePrompt(
  ocean: OceanScoresResult,
  features: BehavioralFeatures,
  topGenres: GenreDistributionItem[] = [],
  topArtists: SpotifyArtist[] = []
): { systemPrompt: string; userPrompt: string } {
  const topGenreNames = topGenres.slice(0, 5).map((g) => `${g.genre} (${g.percentage}%)`).join(", ") || "None recorded";
  const topArtistNames = topArtists.slice(0, 5).map((a) => a.name).join(", ") || "None recorded";

  const systemPrompt = `You are SpotiGlory's expert music-personality analyst. Your task is to write an engaging, warm, specific, and grounded personality profile based on empirical Big Five (OCEAN) scores and Spotify streaming signals.

CRITICAL RULES:
1. Ground every claim directly in the actual numbers, genres, peak hours, and artist names provided in the prompt.
2. DO NOT use generic horoscope-style filler or vague astrology tropes.
3. DO NOT use medical, clinical, or diagnostic framing.
4. Keep the tone warm, insightful, playful, and intellectually satisfying.
5. You MUST return ONLY valid JSON with no markdown formatting around the JSON string.

REQUIRED JSON SCHEMA:
{
  "headline": "A short, punchy 6-10 word headline capturing their musical identity",
  "summary": "A 2-3 sentence personalized profile narrative summarizing their sonic archetype and listening habits",
  "listeningPersona": "A 2-4 word evocative title (e.g. 'The Nocturnal Sonic Explorer', 'The High-BPM Rhythm Curator')",
  "traits": [
    { "trait": "Openness", "insight": "A specific 1-2 sentence observation connecting their score to their genre diversity and niche tastes" },
    { "trait": "Conscientiousness", "insight": "A specific 1-2 sentence observation connecting their score to repeat listening, loyalty, or daytime routines" },
    { "trait": "Extraversion", "insight": "A specific 1-2 sentence observation connecting their score to energetic/upbeat genres and artist popularity" },
    { "trait": "Agreeableness", "insight": "A specific 1-2 sentence observation connecting their score to harmonious/accessible genres" },
    { "trait": "Neuroticism", "insight": "A specific 1-2 sentence observation connecting their score to emotional intensity, late-night streams, or genre shifts" }
  ],
  "funFacts": [
    "Fact 1 derived from peak hour / night ratio / loyalty data",
    "Fact 2 derived from genre distribution / artist popularity",
    "Fact 3 derived from short vs long term taste stability"
  ]
}`;

  const userPrompt = `Analyze the following Spotify listening data and compute a JSON personality profile:

USER STREAMING DATA & OCEAN SCORES:
- Openness: ${ocean.openness.score}/100 (${ocean.openness.label})
- Conscientiousness: ${ocean.conscientiousness.score}/100 (${ocean.conscientiousness.label})
- Extraversion: ${ocean.extraversion.score}/100 (${ocean.extraversion.label})
- Agreeableness: ${ocean.agreeableness.score}/100 (${ocean.agreeableness.label})
- Neuroticism: ${ocean.neuroticism.score}/100 (${ocean.neuroticism.label})

BEHAVIORAL SIGNALS:
- Genre Diversity (Normalized Shannon Entropy): ${features.genreDiversity.normalizedEntropy} (Unique genres: ${features.genreDiversity.uniqueGenreCount})
- Peak Listening Hour: ${features.peakListeningHour}:00 UTC
- Night Stream Ratio (10 PM - 5 AM UTC): ${features.nightListenerRatio}%
- Artist Loyalty Ratio (Unique / Appearances): ${features.artistLoyalty} (Lower = more repeat depth)
- Average Artist Popularity: ${features.avgArtistPopularity}%
- Genre Stability Across Time (Short vs Long Term Jaccard): ${features.genreSpreadAcrossTimeRanges.stabilityScore}
- Recency Concentration: ${features.recencyConcentration}

LISTENING HIGHLIGHTS:
- Top Genres: ${topGenreNames}
- Top Artists: ${topArtistNames}

Return ONLY the raw JSON matching the required schema.`;

  return { systemPrompt, userPrompt };
}

/**
 * Fallback narrative generator if Anthropic API key is missing or request fails.
 * Guarantees that the app UI always has a rich, data-grounded narrative profile.
 */
export function generateFallbackNarrative(
  ocean: OceanScoresResult,
  features: BehavioralFeatures,
  topGenres: GenreDistributionItem[] = [],
  topArtists: SpotifyArtist[] = []
): NarrativeProfile {
  const topGenre = topGenres[0]?.genre || "eclectic sounds";
  const topArtistName = topArtists[0]?.name || "your favorite artists";
  const peakH = features.peakListeningHour ?? 22;
  let timeOfDayDesc = "evening streaming window";
  if (peakH >= 22 || peakH <= 4) {
    timeOfDayDesc = "late-night streaming window";
  } else if (peakH >= 5 && peakH <= 11) {
    timeOfDayDesc = "morning listening window";
  } else if (peakH >= 12 && peakH <= 17) {
    timeOfDayDesc = "afternoon streaming window";
  }

  // Determine Persona
  let listeningPersona = "The Sonic Explorer";
  if (features.nightListenerRatio > 35) {
    listeningPersona = "The Nocturnal Alchemist";
  } else if (ocean.openness.score >= 65) {
    listeningPersona = "The Eclectic Audio Curator";
  } else if (ocean.extraversion.score >= 65) {
    listeningPersona = "The High-BPM Energy Driver";
  } else if (ocean.conscientiousness.score >= 60) {
    listeningPersona = "The Methodical Rhythm Strategist";
  }

  const headline = `Driven by ${topGenre.toUpperCase()} and deep ${ocean.openness.label.toLowerCase()} musical curiosity`;

  const summary = `Your listening habits showcase a strong affinity for ${topGenre} alongside artist staples like ${topArtistName}. With a peak ${timeOfDayDesc} and a ${ocean.openness.label.toLowerCase()} openness score (${ocean.openness.score}/100), your library balances familiar favorites with sonic exploration.`;

  const traits: TraitInsight[] = [
    {
      trait: "Openness",
      insight: `With a genre diversity score of ${features.genreDiversity.normalizedEntropy} across ${features.genreDiversity.uniqueGenreCount} distinct styles, your openness score (${ocean.openness.score}/100) reflects a appetite for sonic range.`,
    },
    {
      trait: "Conscientiousness",
      insight: `Your artist loyalty index (${features.artistLoyalty}) and recency concentration (${features.recencyConcentration}) show a structured approach to repeat listening and routine.`,
    },
    {
      trait: "Extraversion",
      insight: `An average artist popularity rating of ${features.avgArtistPopularity}% indicates a balance between socially resonant hits and personal deep cuts.`,
    },
    {
      trait: "Agreeableness",
      insight: `Your preference distribution emphasizes uplifting melodic structures over abrasive soundscapes, yielding an agreeableness score of ${ocean.agreeableness.score}/100.`,
    },
    {
      trait: "Neuroticism",
      insight: `With ${features.nightListenerRatio}% of your playback occurring after dark, your neuroticism index (${ocean.neuroticism.score}/100) highlights a tendency for late-night emotional reflection.`,
    },
  ];

  const funFacts = [
    `Peak Activity: Your heaviest streaming pulse occurs during the ${timeOfDayDesc}, anchoring your daily rhythm.`,
    `Genre Anchor: ${topGenre.toUpperCase()} represents your most frequent genre token, anchoring ${topGenres[0]?.percentage || 30}% of your primary genre distribution.`,
    `Taste Dynamics: Your short-term vs long-term genre stability score of ${features.genreSpreadAcrossTimeRanges.stabilityScore} shows steady loyalty to core musical pillars.`,
  ];

  return {
    headline,
    summary,
    listeningPersona,
    traits,
    funFacts,
  };
}
