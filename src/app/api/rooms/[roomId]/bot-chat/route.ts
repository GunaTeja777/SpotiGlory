import { NextResponse } from "next/server";
import { getRoomBySlug, getRoomById } from "@/lib/moodRoomEngine";
import { getBotCompanion } from "@/lib/roomChatCompanion";
import {
  ROOM_BOT_PROMPT_VERSION,
  RECOMMENDED_ROOM_BOT_TEMP,
  SYSTEM_PROMPT_ROOM_BOT_V1_0_0,
  buildRoomBotUserPromptV1_0_0,
} from "@/prompts/room_bot_v1.0.0";
import {
  validateRoomBotJson,
  generateFallbackBotReply,
  RoomBotReply,
} from "@/lib/roomBotSchema";
import { generateAndPostBotReply } from "@/lib/realtimeChatEngine";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await request.json().catch(() => ({}));

    const userMessage = body.userMessage || body.triggerMessageText || "";
    const currentTrackParam = body.currentTrack;

    // 1. Resolve room & bot companion archetype
    const room = getRoomBySlug(roomId) || getRoomById(roomId) || getRoomBySlug("midnight-neon-sanctuary");
    const bot = getBotCompanion(room ? room.slug : roomId);

    // 2. Resolve currently playing track from room playlist if not provided
    const currentTrack = currentTrackParam || null;

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    let botReply: RoomBotReply;

    if (openRouterKey && openRouterKey !== "your_openrouter_api_key_here") {
      const userPrompt = buildRoomBotUserPromptV1_0_0({
        roomName: room ? room.name : "Jam Room",
        primaryMood: room ? room.primaryMood : "Reflective",
        vibeTag: room ? room.vibeTag : "Acoustic",
        currentTrackName: currentTrack?.name,
        currentTrackArtist: currentTrack?.artist,
        userMessage,
        botName: bot.name,
      });

      try {
        const apiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openRouterKey}`,
            "HTTP-Referer": "https://spotiglory.vercel.app",
            "X-Title": "SpotiGlory Room Bot",
          },
          body: JSON.stringify({
            model: "anthropic/claude-3.5-sonnet",
            temperature: RECOMMENDED_ROOM_BOT_TEMP,
            max_tokens: 300,
            messages: [
              { role: "system", content: SYSTEM_PROMPT_ROOM_BOT_V1_0_0 },
              { role: "user", content: userPrompt },
            ],
          }),
        });

        if (apiRes.ok) {
          const apiJson = await apiRes.json();
          const responseText = apiJson.choices?.[0]?.message?.content || "";
          const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

          let parsedObj: any = null;
          try {
            parsedObj = JSON.parse(cleanedText);
          } catch (e) {
            parsedObj = null;
          }

          const validation = validateRoomBotJson(parsedObj);
          if (validation.success && validation.data) {
            botReply = validation.data;
          } else {
            botReply = generateFallbackBotReply(room ? room.slug : roomId, currentTrack, userMessage);
          }
        } else {
          botReply = generateFallbackBotReply(room ? room.slug : roomId, currentTrack, userMessage);
        }
      } catch (err) {
        botReply = generateFallbackBotReply(room ? room.slug : roomId, currentTrack, userMessage);
      }
    } else {
      botReply = generateFallbackBotReply(room ? room.slug : roomId, currentTrack, userMessage);
    }

    // 3. Post to realtime chat engine & format full ChatMessage
    const botChatMessage = generateAndPostBotReply(room ? room.slug : roomId, userMessage);

    return NextResponse.json({
      status: "success",
      version: ROOM_BOT_PROMPT_VERSION,
      botReply,
      botMessage: {
        ...botChatMessage,
        text: botReply.replyText,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to generate room bot response" },
      { status: 500 }
    );
  }
}
