import { NextResponse } from "next/server";
import { getOrCreateRoomState, postUserMessageToRoom } from "@/lib/realtimeChatEngine";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const roomState = getOrCreateRoomState(roomId);
    return NextResponse.json({
      status: "success",
      messages: roomState.messages,
      activeUsersCount: roomState.activeUsersCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch room chat history" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await request.json();

    const text = body.text?.trim();
    if (!text) {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    const userMsg = {
      senderId: body.senderId || "user_guest",
      senderName: body.senderName || "Guest Listener",
      senderAvatar: body.senderAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest",
      text,
    };

    const result = postUserMessageToRoom(roomId, userMsg);

    return NextResponse.json({
      status: "success",
      message: result.message,
      shouldBotReply: result.shouldBotReply,
      botDelayMs: result.botDelayMs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to post message to room" },
      { status: 500 }
    );
  }
}
