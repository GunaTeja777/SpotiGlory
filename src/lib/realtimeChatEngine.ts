import { getBotCompanion, generateCompanionReply } from "./roomChatCompanion";

export interface RoomChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  isAiCompanion: boolean;
  text: string;
  timestamp: string;
}

export interface RoomState {
  roomId: string;
  activeUsersCount: number;
  messages: RoomChatMessage[];
  recentUserMessageCount: number;
}

// In-memory serverless room state store for ephemeral channel broadcasting
const ROOM_STATES: Record<string, RoomState> = {};

export function getOrCreateRoomState(roomId: string): RoomState {
  if (!ROOM_STATES[roomId]) {
    const bot = getBotCompanion(roomId);
    ROOM_STATES[roomId] = {
      roomId,
      activeUsersCount: 1, // Active user
      recentUserMessageCount: 0,
      messages: [
        {
          id: `init_${Date.now()}`,
          roomId,
          senderId: bot.id,
          senderName: bot.name,
          senderAvatar: bot.avatar,
          isAiCompanion: true,
          text: bot.greetingMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    };
  }
  return ROOM_STATES[roomId];
}

/**
 * Posts a user message into the room channel and determines if the AI Companion should reply.
 */
export function postUserMessageToRoom(
  roomId: string,
  userMsg: {
    senderId: string;
    senderName: string;
    senderAvatar: string;
    text: string;
  }
): {
  message: RoomChatMessage;
  shouldBotReply: boolean;
  botDelayMs: number;
} {
  const roomState = getOrCreateRoomState(roomId);
  const bot = getBotCompanion(roomId);

  const newMsg: RoomChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    roomId,
    senderId: userMsg.senderId,
    senderName: userMsg.senderName,
    senderAvatar: userMsg.senderAvatar,
    isAiCompanion: false,
    text: userMsg.text,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  roomState.messages.push(newMsg);
  roomState.recentUserMessageCount += 1;

  // Bot response decision logic (Requirement 3: Multi-user awareness)
  const isDirectlyAddressed = userMsg.text.toLowerCase().includes(bot.name.toLowerCase());
  const isSingleUserRoom = roomState.activeUsersCount <= 1;

  let shouldBotReply = false;
  if (isSingleUserRoom) {
    // Alone with bot: reply to every message
    shouldBotReply = true;
  } else if (isDirectlyAddressed) {
    // Directly addressed: always reply
    shouldBotReply = true;
  } else if (roomState.recentUserMessageCount % 4 === 0) {
    // Multi-user room: reply periodically (every 4th message) to avoid drowning out conversation
    shouldBotReply = true;
  }

  // Random natural typing delay between 1200ms and 1800ms (Requirement 2)
  const botDelayMs = Math.floor(Math.random() * 600) + 1200;

  return {
    message: newMsg,
    shouldBotReply,
    botDelayMs,
  };
}

/**
 * Generates and posts the AI Companion reply message into the room channel.
 */
export function generateAndPostBotReply(
  roomId: string,
  triggerUserMessageText: string
): RoomChatMessage {
  const roomState = getOrCreateRoomState(roomId);
  const bot = getBotCompanion(roomId);

  const replyText = generateCompanionReply(roomId, triggerUserMessageText);

  const botMsg: RoomChatMessage = {
    id: `bot_reply_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    roomId,
    senderId: bot.id,
    senderName: bot.name,
    senderAvatar: bot.avatar,
    isAiCompanion: true,
    text: replyText,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  roomState.messages.push(botMsg);
  return botMsg;
}

export function updateRoomActiveUsersCount(roomId: string, delta: number): number {
  const roomState = getOrCreateRoomState(roomId);
  roomState.activeUsersCount = Math.max(1, roomState.activeUsersCount + delta);
  return roomState.activeUsersCount;
}
