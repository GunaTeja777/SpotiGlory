export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserProfile, SpotifyApiError } from "@/lib/spotify";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized: Missing active Spotify session" },
        { status: 401 }
      );
    }

    const data = await getUserProfile(session.accessToken);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Profile API route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile from Spotify" },
      { status: 500 }
    );
  }
}
