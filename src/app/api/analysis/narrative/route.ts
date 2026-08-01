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
import { 
  buildNarrativePrompt, 
  generateFallbackNarrative, 
  NarrativeProfile 
} from "@/lib/narrativePrompt";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized: Active Spotify session required" },
        { status: 401 }
      );
    }

    const token = session.accessToken;

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

    // 1. Compute behavioral feature signals & OCEAN scores
    const features = computeBehavioralFeatures(
      topTracks,
      topArtists,
      recentlyPlayed,
      shortTermArtists,
      longTermArtists
    );

    const clusters = computeClusterDistribution(features.topGenreDistribution);
    const ocean = computeOceanScores(features, clusters);

    // 2. Generate Narrative (Anthropic Messages API or Fallback)
    const apiKey = process.env.ANTHROPIC_API_KEY;
    let narrative: NarrativeProfile;
    let isAiGenerated = false;

    if (apiKey && apiKey !== "your_anthropic_api_key_here") {
      try {
        const { systemPrompt, userPrompt } = buildNarrativePrompt(
          ocean,
          features,
          features.topGenreDistribution,
          topArtists
        );

        const apiResponse = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 1000,
            system: systemPrompt,
            messages: [
              {
                role: "user",
                content: userPrompt,
              },
            ],
          }),
        });

        if (apiResponse.ok) {
          const apiJson = await apiResponse.json();
          const responseText = apiJson.content?.[0]?.text || "";
          
          // Clean potential markdown blocks
          const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsedNarrative = JSON.parse(cleanedText);

          if (parsedNarrative && parsedNarrative.headline && parsedNarrative.summary) {
            narrative = parsedNarrative;
            isAiGenerated = true;
          } else {
            throw new Error("Parsed Anthropic JSON missing required fields");
          }
        } else {
          console.warn(`Anthropic API request failed with status ${apiResponse.status}, falling back.`);
          narrative = generateFallbackNarrative(ocean, features, features.topGenreDistribution, topArtists);
        }
      } catch (err) {
        console.error("Failed to generate AI narrative from Anthropic API:", err);
        narrative = generateFallbackNarrative(ocean, features, features.topGenreDistribution, topArtists);
      }
    } else {
      // No Anthropic API Key provided, use template fallback
      narrative = generateFallbackNarrative(ocean, features, features.topGenreDistribution, topArtists);
    }

    return NextResponse.json({
      status: "success",
      timestamp: new Date().toISOString(),
      isAiGenerated,
      user: {
        name: session.user?.name || "Music Listener",
        image: session.user?.image || null,
      },
      narrative,
      clusters,
      ocean,
      disclaimer: ocean.disclaimer,
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
