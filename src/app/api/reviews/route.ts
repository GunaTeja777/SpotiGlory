export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const BASELINE_REVIEWS: any[] = [];

export async function GET() {
  try {
    const [dbReviews, dbProfilesCount] = await Promise.all([
      prisma.communityReview.findMany({ orderBy: { created_at: "desc" } }),
      prisma.userTasteProfile.count()
    ]);

    const dbSum = dbReviews.reduce((sum, r) => sum + r.rating, 0);
    const totalCount = dbReviews.length;
    const averageRating = totalCount > 0 ? (dbSum / totalCount).toFixed(1) : "0.0";

    // Dynamic Vibe Accuracy calculation (ratio of >= 4 stars reviews)
    const dbAccurate = dbReviews.filter(r => r.rating >= 4).length;
    const accuracyVal = totalCount > 0 ? ((dbAccurate / totalCount) * 100).toFixed(1) : "0.0";

    // Dynamic Profiles Created
    const totalProfiles = dbProfilesCount;

    // Dynamic Tracks Analyzed (approx. 80 tracks per taste profile analysis)
    const totalTracks = dbProfilesCount * 80;

    // Merge baseline and dynamic db reviews
    const formattedDbReviews = dbReviews.map(r => ({
      id: r.id,
      user_name: r.user_name,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at.toISOString()
    }));

    return NextResponse.json({
      status: "success",
      totalReviews: totalCount,
      averageRating: parseFloat(averageRating),
      vibeAccuracy: `${accuracyVal}%`,
      profilesCreated: totalProfiles,
      tracksAnalyzed: totalTracks,
      reviews: [...formattedDbReviews, ...BASELINE_REVIEWS]
    });
  } catch (error) {
    console.error("Failed to fetch community reviews:", error);
    return NextResponse.json({
      status: "success",
      totalReviews: 0,
      averageRating: 0.0,
      vibeAccuracy: "0.0%",
      profilesCreated: 0,
      tracksAnalyzed: 0,
      reviews: []
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rating, comment } = body;

    if (!rating || !comment || comment.trim().length === 0) {
      return NextResponse.json(
        { error: "Rating (1-5) and a written review comment are required." },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || (session?.user as any)?.email || "demo_guest";
    const userName = session?.user?.name || "Demo Guest";

    const review = await prisma.communityReview.create({
      data: {
        user_id: userId,
        user_name: userName,
        rating: Math.max(1, Math.min(5, parseInt(rating, 10))),
        comment: comment.trim()
      }
    });

    return NextResponse.json({
      status: "success",
      review
    });
  } catch (error) {
    console.error("Failed to submit community review:", error);
    return NextResponse.json(
      { error: "Failed to persist community review in database." },
      { status: 500 }
    );
  }
}
