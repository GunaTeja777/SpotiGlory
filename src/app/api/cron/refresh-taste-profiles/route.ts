import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildUserTasteProfile, saveTasteProfileToDb } from "@/lib/userTasteProfile";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ status: "unauthorized" }, { status: 401 });
    }

    const SEVEN_DAYS_AGO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const activeUserRows = await prisma.userTasteProfile.findMany({
      where: {
        computed_at: {
          gte: SEVEN_DAYS_AGO,
        },
      },
    });

    let refreshedCount = 0;
    for (const userRow of activeUserRows) {
      try {
        const profile = buildUserTasteProfile([], undefined, userRow.preferred_language);
        await saveTasteProfileToDb(userRow.user_id, profile);
        refreshedCount++;
      } catch (e) {
        // Continue with next user
      }
    }

    return NextResponse.json({
      status: "success",
      refreshedCount,
      totalActiveUsers: activeUserRows.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
