import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getTopArtists, SpotifyApiError } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized: Missing active Spotify session" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeRangeParam = searchParams.get("time_range");
    const limitParam = searchParams.get("limit");

    const timeRange = (
      ["short_term", "medium_term", "long_term"].includes(timeRangeParam || "")
        ? timeRangeParam
        : "medium_term"
    ) as "short_term" | "medium_term" | "long_term";

    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    const data = await getTopArtists(session.accessToken, timeRange, limit);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Top artists API route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch top artists from Spotify" },
      { status: 500 }
    );
  }
}
