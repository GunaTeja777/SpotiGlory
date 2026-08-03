/**
 * Versioned Prompt Template Matrix v1.0.0
 * 
 * Production prompt specification with deterministic qualitative grounding,
 * strict JSON schema requirements, and low temperature (0.3) consistency setting.
 */

import { GroundedNarrativeContext } from "@/lib/narrativeBands";
import { GenreDistributionItem, BehavioralFeatures } from "@/lib/features";
import { SpotifyArtist } from "@/lib/spotify";

export const PROMPT_VERSION = "1.0.0";
export const RECOMMENDED_TEMPERATURE = 0.3;

export const SYSTEM_PROMPT_V1 = `You are SpotiGlory's Lead AI Music Psychologist.
Your role is to write a warm, evocative, and deeply grounded Music Personality Profile based on empirical Spotify listening data.

CRITICAL CONSTRAINTS:
1. Output ONLY valid JSON matching this exact structure:
{
  "listeningPersona": "Short 2-4 word evocative title (e.g. 'The Nocturnal Alchemist')",
  "headline": "Punchy 6-12 word headline summarizing their sonic mind",
  "summary": "Rich 2-3 sentence paragraph capturing their listening identity",
  "motivationalLine": "One short specific sentence combining persona title + current mood + real top artist name",
  "traits": [
    { "trait": "Openness", "label": "Exact Label Provided", "insight": "2 sentence insight" },
    { "trait": "Conscientiousness", "label": "Exact Label Provided", "insight": "2 sentence insight" },
    { "trait": "Extraversion", "label": "Exact Label Provided", "insight": "2 sentence insight" },
    { "trait": "Agreeableness", "label": "Exact Label Provided", "insight": "2 sentence insight" },
    { "trait": "Neuroticism", "label": "Exact Label Provided", "insight": "2 sentence insight" }
  ],
  "funFacts": [
    "Fact 1 starting with emoji",
    "Fact 2 starting with emoji",
    "Fact 3 starting with emoji"
  ]
}

2. GROUNDING RULE: You MUST strictly use the pre-computed qualitative labels provided for each OCEAN trait. Never invent raw numbers, contradict the qualitative bands, or generate conflicting labels.`;

export function buildUserPromptV1(
  grounded: GroundedNarrativeContext,
  features: BehavioralFeatures,
  topGenres: GenreDistributionItem[],
  topArtists: SpotifyArtist[]
): string {
  const genreListStr = topGenres.slice(0, 5).map((g) => `${g.genre} (${g.percentage}%)`).join(", ") || "Diverse Genres";
  const artistListStr = topArtists.slice(0, 5).map((a) => a.name).join(", ") || "Top Artists";

  return `Generate a Music Personality Profile for a Spotify listener with these empirical signals:

QUALITATIVE OCEAN BANDS:
- Openness (${grounded.openness.score}/100): Label = "${grounded.openness.label}" [Band: ${grounded.openness.band}]
- Conscientiousness (${grounded.conscientiousness.score}/100): Label = "${grounded.conscientiousness.label}" [Band: ${grounded.conscientiousness.band}]
- Extraversion (${grounded.extraversion.score}/100): Label = "${grounded.extraversion.label}" [Band: ${grounded.extraversion.band}]
- Agreeableness (${grounded.agreeableness.score}/100): Label = "${grounded.agreeableness.label}" [Band: ${grounded.agreeableness.band}]
- Neuroticism (${grounded.neuroticism.score}/100): Label = "${grounded.neuroticism.label}" [Band: ${grounded.neuroticism.band}]

BEHAVIORAL SIGNALS:
- Top Genres: ${genreListStr}
- Top Artists: ${artistListStr}
- Peak Listening Hour: ${features.peakListeningHour}:00 UTC
- Night Listener Ratio: ${features.nightListenerRatio}% night streams (Band: ${grounded.nightRatioBand})
- Mainstream Popularity: ${features.avgArtistPopularity}% (Band: ${grounded.popularityBand})
- Taste Stability: Jaccard ${features.genreSpreadAcrossTimeRanges?.stabilityScore || 1}

Respond strictly in valid JSON without markdown wrapping.`;
}
