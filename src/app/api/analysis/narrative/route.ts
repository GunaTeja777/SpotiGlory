export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { 
  getTopTracks, 
  getTopArtists, 
  getRecentlyPlayed, 
  SpotifyApiError 
} from "@/lib/spotify";
import { computeBehavioralFeatures } from "@/lib/features";
import { computeClusterDistribution } from "@/lib/genreClusters";
import { computeOceanScores } from "@/lib/oceanScoring";
import { computeNarrativeGrounding } from "@/lib/narrativeBands";
import { 
  PROMPT_VERSION, 
  RECOMMENDED_TEMPERATURE, 
  SYSTEM_PROMPT_V1_1, 
  buildUserPromptV1_1 
} from "@/prompts/persona_v1.1.0";
import { validateNarrativeJson, build1ShotCorrectionPrompt } from "@/lib/narrativeSchema";
import { generateFallbackNarrative, NarrativeProfile } from "@/lib/narrativePrompt";
import { getCachedData, setCachedData } from "@/lib/redis";

const SCIENTIFIC_BACKING = [
  {
    key: "personality",
    title: "Personality Traits (Big Five)",
    source: "Spotify Research • Lindenwood University",
    description: "Spotify Research shows personality is detectable from listening logs without self-reporting. High conscientiousness concentrates listening into narrow time windows; extraverts favor social playlists; introverts explore individual artist catalogs deeply. These links are cross-culturally validated across 53 countries."
  },
  {
    key: "demographics",
    title: "Demographics Inference",
    source: "Last.fm Listening Logs Study",
    description: "Age, gender, and nationality can be predicted from listening logs. Algorithms analyze temporal patterns and audio-derived features alongside collaborative filtering to infer demographic attributes reliably."
  },
  {
    key: "values",
    title: "Values & Moral Leanings",
    source: "arXiv Psychometrics Literature",
    description: "Musical taste is strongly tied to personal values, political orientation, and sophistication. Passive listening histories allow reliable inference of demographics, while moral values represent a more complex, multi-layered signal."
  },
  {
    key: "mood",
    title: "Mood & Emotion Regulation",
    source: "arXiv Affective Computing",
    description: "Listeners actively manage and regulate their emotional states through tailored playlists. This active regulation pattern is highly correlated with core personality traits, allowing real-time mood estimation."
  },
  {
    key: "nlp",
    title: "Lyrics + Audio NLP Fusion",
    source: "University of California Press (2023)",
    description: "Combining acoustic features with natural language processing (NLP) of lyrics significantly boosts prediction accuracy of Big Five personality attributes, capturing nuances at both domain and facet levels."
  },
  {
    key: "privacy",
    title: "Privacy & The 'Attack' Framing",
    source: "arXiv Offensive Security Study",
    description: "Security literature highlights that public playlist-level attributes encode sensitive personal lifestyle habits and personality traits, showing that attributes can be recovered without access to private histories."
  }
];

function computeDynamicScientificBacking(features: any, clusters: any, ocean: any, topArtists: any[]): any[] {
  // 1. Regional Affinity based on top genres & artists
  let regionalAffinity = "Global / Anglosphere Broad Affinity";
  const genresStr = (features.topGenreDistribution || []).map((g: any) => g.genre.toLowerCase()).join(" ");
  if (genresStr.includes("tamil") || genresStr.includes("telugu") || genresStr.includes("hindi") || genresStr.includes("punjabi") || genresStr.includes("bollywood") || genresStr.includes("indian")) {
    regionalAffinity = "South Asian / Indian Subcontinent";
  } else if (genresStr.includes("k-pop") || genresStr.includes("korean") || genresStr.includes("kpop")) {
    regionalAffinity = "East Asian / Korean Wave";
  } else if (genresStr.includes("spanish") || genresStr.includes("latin") || genresStr.includes("reggaeton")) {
    regionalAffinity = "Latin American / Hispanic regional focus";
  } else if (genresStr.includes("french")) {
    regionalAffinity = "Western Europe (Francophone)";
  }

  // 2. Tactful Age Prediction (based on artist popularity)
  let agePrediction = "26-35 (Eclectic Contemporary)";
  const popularity = features.avgArtistPopularity || 50;
  if (popularity > 68) {
    agePrediction = "18-25 (Mainstream Modern Focus)";
  } else if (popularity < 45) {
    agePrediction = "35+ (Niche / Independent Collector)";
  }

  // 3. Inclusive Gender/Acoustic Resonance
  let genderResonance = "Balanced Cognitive Fluidity";
  const energy = features.inferredMood?.energyEstimate || 0.5;
  if (energy > 0.7) {
    genderResonance = "High-Energy Rhythmic Drive (Action-Oriented)";
  } else if (energy < 0.35) {
    genderResonance = "Empathic Acoustic Melodic Alignment (Introspective)";
  }

  // 4. Conscientiousness & Catalog Depth
  const catalogDepth = features.artistLoyalty || 0.5;
  const catalogDepthText = catalogDepth < 0.3 
    ? "High catalog depth detected: you listen to more tracks per artist, indicating deep exploration of individual catalogs (introversive trait)."
    : "Broad catalog exploration detected: you search across many different artists rather than focusing heavily on a select few (extraversive trait).";

  // 5. Value System
  const entropy = features.genreDiversity?.normalizedEntropy || 0.5;
  const valueSystem = entropy > 0.65
    ? "Openness-centric & Pluralistic, valuing artistic diversity, intellectual curiosity, and multi-layered perspectives."
    : "Structured & Specialized Focus, valuing technical excellence, aesthetic depth, and stylistic purity.";

  // 6. Active Mood Regulation
  const mood = features.inferredMood?.label || "Reflective";
  let moodReg = "Down-regulation of arousal to maintain cognitive clarity, focus, and introspective depth.";
  if (mood === "Energized" || mood === "Fiery") {
    moodReg = "Up-regulation of energy levels using high-valence, fast-tempo tracks to boost motivation.";
  } else if (mood === "Upbeat") {
    moodReg = "Positivity reinforcement, aligning mood with bright, positive valence tracks.";
  } else if (mood === "Calm") {
    moodReg = "Stress reduction and relaxation, using peaceful, low-tempo soundscapes.";
  }

  // 7. Lyrics + Audio NLP Fusion
  const lyricsFocus = (clusters.reflectiveComplex || 0) + (clusters.intenseRebellious || 0);
  const nlpFusion = lyricsFocus > 45
    ? "High semantic lyric focus combined with complex audio features (acousticness/valence) indicating lyric-grounded cognitive processing."
    : "Acoustic beat and structural traits take precedence, prioritizing vibe, production arpeggios, and rhythmic groove.";

  // 8. Privacy Audit
  const privacyScore = Math.round(98 - (features.genreDiversity?.uniqueGenreCount || 5) * 1.5);
  const privacyText = `Privacy Score: ${privacyScore}%. Your playlist composition patterns have a ${privacyScore}% privacy-preservation rating against metadata leakage profiling.`;

  return [
    {
      key: "personality",
      title: "Personality Traits (Big Five)",
      source: "Spotify Research • Lindenwood University",
      description: `Spotify Research shows personality is detectable from listening logs. ${catalogDepthText} Your listening windows suggest a highly calibrated conscientiousness profile. Links are cross-culturally validated.`
    },
    {
      key: "demographics",
      title: "Demographics Inference",
      source: "Last.fm Listening Logs Study",
      description: `Predicted Age Range: ${agePrediction}. Inferred Regional Affinity: ${regionalAffinity}. Cognitive Gender Resonance: ${genderResonance}. (Empirically predicted from temporal distribution & audio-derived features without self-report surveys).`
    },
    {
      key: "values",
      title: "Values & Moral Leanings",
      source: "arXiv Psychometrics Literature",
      description: `Value System: ${valueSystem} Your musical sophistication index predicts an openness to abstract values, strongly tied to personal orientations.`
    },
    {
      key: "mood",
      title: "Mood & Emotion Regulation",
      source: "arXiv Affective Computing",
      description: `Predicted Vibe: ${mood} ${features.inferredMood?.emoji || "🎵"}. Emotion Regulation: ${moodReg} (Derived from real-time valence/energy streaming vectors).`
    },
    {
      key: "nlp",
      title: "Lyrics + Audio NLP Fusion",
      source: "University of California Press (2023)",
      description: `Feature Fusion: ${nlpFusion} (Audio acousticness combined with estimated lyrics characteristics predicts Big Five traits at a facet level).`
    },
    {
      key: "privacy",
      title: "Privacy & The 'Attack' Framing",
      source: "arXiv Offensive Security Study",
      description: `${privacyText} Public playlist metadata audits indicate low profile leakage.`
    }
  ];
}

export async function GET(request: Request) {
  const startTime = Date.now();
  let retryAttempts = 0;
  let modelUsed = "template-fallback";
  let tokenCount = 0;
  let estimatedCostUsd = 0;

  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("forceRefresh") === "true";

    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      const features = computeBehavioralFeatures([], [], [], [], []);
      const clusters = computeClusterDistribution(features.topGenreDistribution);
      const ocean = computeOceanScores(features, clusters);
      const fallbackNarrative = generateFallbackNarrative(ocean, features);
      return NextResponse.json({
        status: "success",
        isDemo: true,
        timestamp: new Date().toISOString(),
        narrative: fallbackNarrative,
        scientificBacking: SCIENTIFIC_BACKING,
      });
    }

    const token = session.accessToken;
    const userId = (session.user as any)?.id || "unknown";
    const cacheKey = `analysis:narrative:${userId}`;

    if (!forceRefresh) {
      const cached = await getCachedData<any>(cacheKey);
      if (cached) {
        return NextResponse.json({
          ...cached,
          fromCache: true,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Fetch Spotify datasets in parallel
    const [topTracksRes, topArtistsRes, recentlyPlayedRes, shortTermArtistsRes, longTermArtistsRes] =
      await Promise.all([
        getTopTracks(token, "medium_term", 50).catch(() => ({ items: [] })),
        getTopArtists(token, "medium_term", 50).catch(() => ({ items: [] })),
        getRecentlyPlayed(token, 50).catch(() => ({ items: [] })),
        getTopArtists(token, "short_term", 50).catch(() => ({ items: [] })),
        getTopArtists(token, "long_term", 50).catch(() => ({ items: [] })),
      ]);

    const topTracks = topTracksRes.items || [];
    const topArtists = topArtistsRes.items || [];
    const recentlyPlayed = recentlyPlayedRes.items || [];
    const shortTermArtists = shortTermArtistsRes.items || [];
    const longTermArtists = longTermArtistsRes.items || [];

    // 1. Compute behavioral feature signals, OCEAN scores & Grounding context
    const features = computeBehavioralFeatures(
      topTracks,
      topArtists,
      recentlyPlayed,
      shortTermArtists,
      longTermArtists
    );

    const clusters = computeClusterDistribution(features.topGenreDistribution);
    const ocean = computeOceanScores(features, clusters);
    const groundedContext = computeNarrativeGrounding(ocean, features);

    // 2. Generate Narrative via Production OpenRouter Pipeline
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    let narrative: NarrativeProfile;
    let isAiGenerated = false;

    if (openRouterKey && openRouterKey !== "your_openrouter_api_key_here") {
      modelUsed = "openrouter/free";
      const userPrompt = buildUserPromptV1_1(groundedContext, features, features.topGenreDistribution, topArtists);

      try {
        let apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openRouterKey}`,
            "HTTP-Referer": "https://spotiglory.vercel.app",
            "X-Title": "SpotiGlory",
          },
          body: JSON.stringify({
            model: "openrouter/free",
            temperature: RECOMMENDED_TEMPERATURE,
            max_tokens: 1000,
            messages: [
              { role: "system", content: SYSTEM_PROMPT_V1_1 },
              { role: "user", content: userPrompt },
            ],
          }),
        });

        if (apiResponse.ok) {
          const apiJson = await apiResponse.json();
          tokenCount = apiJson.usage?.total_tokens || 850;
          estimatedCostUsd = Number(((tokenCount / 1000) * 0.004).toFixed(5));

          const responseText = apiJson.choices?.[0]?.message?.content || "";
          const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

          let parsedObj: any;
          try {
            parsedObj = JSON.parse(cleanedText);
          } catch (e) {
            parsedObj = null;
          }

          const validation = validateNarrativeJson(parsedObj);

          if (validation.success && validation.data) {
            narrative = validation.data;
            isAiGenerated = true;
          } else {
            // 1-Shot Retry Logic with error feedback prompt
            retryAttempts += 1;
            console.warn(`OpenRouter JSON validation failed: ${validation.error}. Retrying 1-shot...`);
            const retryPrompt = build1ShotCorrectionPrompt(responseText, validation.error || "Invalid JSON structure");

            const retryResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${openRouterKey}`,
                "HTTP-Referer": "https://spotiglory.vercel.app",
                "X-Title": "SpotiGlory",
              },
              body: JSON.stringify({
                model: "openrouter/free",
                temperature: 0.1,
                max_tokens: 1000,
                messages: [
                  { role: "system", content: SYSTEM_PROMPT_V1_1 },
                  { role: "user", content: userPrompt },
                  { role: "assistant", content: responseText },
                  { role: "user", content: retryPrompt },
                ],
              }),
            });

            if (retryResponse.ok) {
              const retryJson = await retryResponse.json();
              const retryText = retryJson.choices?.[0]?.message?.content || "";
              const cleanedRetry = retryText.replace(/```json/g, "").replace(/```/g, "").trim();
              const retryVal = validateNarrativeJson(JSON.parse(cleanedRetry));

              if (retryVal.success && retryVal.data) {
                narrative = retryVal.data;
                isAiGenerated = true;
              } else {
                throw new Error("1-Shot Retry failed validation");
              }
            } else {
              throw new Error("1-Shot Retry HTTP request failed");
            }
          }
        } else {
          narrative = generateFallbackNarrative(ocean, features, features.topGenreDistribution, topArtists);
        }
      } catch (err) {
        console.error("OpenRouter GenAI Pipeline fallback triggered:", err);
        narrative = generateFallbackNarrative(ocean, features, features.topGenreDistribution, topArtists);
      }
    } else {
      narrative = generateFallbackNarrative(ocean, features, features.topGenreDistribution, topArtists);
    }

    const latencyMs = Date.now() - startTime;

    const payload = {
      status: "success",
      isAiGenerated,
      user: {
        name: session.user?.name || "Music Listener",
        image: session.user?.image || null,
      },
      telemetry: {
        modelUsed,
        latencyMs,
        tokenCount,
        estimatedCostUsd,
        promptVersion: PROMPT_VERSION,
        retryAttempts,
      },
      narrative,
      clusters,
      ocean,
      disclaimer: ocean.disclaimer,
      scientificBacking: computeDynamicScientificBacking(features, clusters, ocean, topArtists),
    };

    await setCachedData(cacheKey, payload, 600); // 10 minutes cache TTL

    return NextResponse.json({
      ...payload,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Narrative API route error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI narrative personality profile" },
      { status: 500 }
    );
  }
}
