import { getBotCompanion } from "./roomChatCompanion";

export interface RoomBotReply {
  replyText: string;
  referencedTrack?: string | null;
  vibeAlignment?: string;
  thoughtContext?: string;
}

export interface RoomBotValidationResult {
  success: boolean;
  data?: RoomBotReply;
  error?: string;
}

/**
 * Validates raw parsed JSON object against strict RoomBotReply schema.
 */
export function validateRoomBotJson(obj: any): RoomBotValidationResult {
  if (!obj || typeof obj !== "object") {
    return { success: false, error: "Response is not a valid JSON object" };
  }

  if (typeof obj.replyText !== "string" || obj.replyText.trim().length < 8) {
    return { success: false, error: "Missing or short 'replyText' field (min 8 chars)" };
  }

  return {
    success: true,
    data: {
      replyText: obj.replyText.trim(),
      referencedTrack: typeof obj.referencedTrack === "string" ? obj.referencedTrack.trim() : null,
      vibeAlignment: typeof obj.vibeAlignment === "string" ? obj.vibeAlignment.trim() : "High",
      thoughtContext: typeof obj.thoughtContext === "string" ? obj.thoughtContext.trim() : "Grounded in room archetype and current track.",
    },
  };
}

/**
 * Fallback response generator guaranteeing qualitative grounding without inventing contradictory details.
 */
export function generateFallbackBotReply(
  roomIdOrSlug: string,
  currentTrack?: { name?: string; artist?: string },
  userMessage?: string
): RoomBotReply {
  const bot = getBotCompanion(roomIdOrSlug);
  const trackStr = currentTrack?.name && currentTrack?.artist
    ? `"${currentTrack.name}" by ${currentTrack.artist}`
    : null;

  let replyText = "";
  const msgLower = (userMessage || "").toLowerCase();

  if (trackStr && (msgLower.includes("song") || msgLower.includes("track") || msgLower.includes("playing") || msgLower.includes("listen") || !userMessage)) {
    replyText = `The acoustic texture on ${trackStr} fits the ${bot.name} energy perfectly in here. That transition really sets the mood.`;
  } else if (msgLower.includes("hi") || msgLower.includes("hello") || msgLower.includes("hey")) {
    replyText = `Hey there! Great to have you in the room. I'm ${bot.name}, tracking the acoustic frequency in here. How are these tracks hitting your mood right now?`;
  } else if (trackStr) {
    replyText = `Totally get that vibe. Currently spinning ${trackStr} in this room — the production locks in so smoothly with the room's mood.`;
  } else {
    replyText = `The acoustic energy in here is calibrated specifically for ${bot.vibeDescription.toLowerCase()} It's rare to find a sequence that flows this seamlessly.`;
  }

  return {
    replyText,
    referencedTrack: trackStr ? currentTrack?.name || null : null,
    vibeAlignment: "High",
    thoughtContext: `Grounded in room host ${bot.name} and current playing track ${trackStr || "stream"}.`,
  };
}
