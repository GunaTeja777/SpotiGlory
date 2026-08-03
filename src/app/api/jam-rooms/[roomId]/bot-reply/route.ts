import { NextResponse } from "next/server";
import { POST as botChatPost } from "@/app/api/rooms/[roomId]/bot-chat/route";

export async function POST(
  request: Request,
  context: { params: Promise<{ roomId: string }> }
) {
  return botChatPost(request, context);
}
