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
