export interface BotCompanionConfig {
  id: string;
  name: string;
  title: string;
  avatar: string;
  vibeDescription: string;
  greetingMessage: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  isAiCompanion: boolean;
  text: string;
  timestamp: string;
}

const ROOM_BOT_MAP: Record<string, BotCompanionConfig> = {
  "midnight-neon-sanctuary": {
    id: "bot_echo",
    name: "Echo",
    title: "Nocturnal Synthesist",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Echo",
    vibeDescription: "Obsessed with analog synth pads, 2 AM tape hiss, and atmospheric reverb.",
    greetingMessage: "Welcome to the Sanctuary. The 2 AM analog tape warmth hits just right in here. Which nocturnal synth track is setting your mood tonight?",
  },
  "deep-focus-acoustic": {
    id: "bot_luna",
    name: "Luna",
    title: "Acoustic Curator",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Luna",
    vibeDescription: "Passionate about felt piano, fingerpicked acoustic guitars, and minimalist serene strings.",
    greetingMessage: "Welcome in. Felt piano chords and ambient strings work wonders for deep focus. Settle in and let the serene acoustic flow guide your work.",
  },
  "electric-pulse": {
    id: "bot_hyperion",
    name: "Hyperion",
    title: "High-BPM Driver",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Hyperion",
    vibeDescription: "Hooked on sidechain compression, 128 BPM build-ups, and hyperpop synthesizers.",
    greetingMessage: "Adrenaline turned to max! The sidechain compression and drop in this queue go crazy. What high-BPM anthem are we riding next?",
  },
  "sun-drenched-indie": {
    id: "bot_sol",
    name: "Sol",
    title: "Golden Hour Selector",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Sol",
    vibeDescription: "Loves jangle-pop guitars, warm basslines, and festival golden hour melodies.",
    greetingMessage: "Golden hour vibes all around! Loving the jangle-pop guitars and bright basslines in this room. What's your favorite summer indie anthem?",
  },
  "fiery-underground": {
    id: "bot_blaze",
    name: "Blaze",
    title: "Distortion Alchemist",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Blaze",
    vibeDescription: "Cranked fuzz pedals, heavy 808s, and raw alternative rock distortion.",
    greetingMessage: "Fuzz pedals cranked to 11. Heavy basslines and raw guitar distortion only. What heavy track should we blast next?",
  },
  "subtle-melodic-chill": {
    id: "bot_zephyr",
    name: "Zephyr",
    title: "Breeze & Soul Explorer",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Zephyr",
    vibeDescription: "Smooth 7th chords, neo-soul rhythms, and tranquil lofi chill beats.",
    greetingMessage: "Smooth breeze and warm 7th chords. Take a seat, unwind your mind, and enjoy these chill neo-soul grooves.",
  },
};

export function getBotCompanion(roomIdOrSlug: string): BotCompanionConfig {
  return (
    ROOM_BOT_MAP[roomIdOrSlug] || {
      id: "bot_echo",
      name: "Echo",
      title: "Nocturnal Synthesist",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Echo",
      vibeDescription: "Atmospheric acoustic companion.",
      greetingMessage: "Welcome into the Jam Room. Let's explore these acoustic vibrations together.",
    }
  );
}

/**
 * Generates natural, non-templated AI companion responses tied to the room archetype.
 */
export function generateCompanionReply(
  roomIdOrSlug: string,
  userMessage: string
): string {
  const bot = getBotCompanion(roomIdOrSlug);
  const msgLower = userMessage.toLowerCase();

  if (msgLower.includes("recommend") || msgLower.includes("song") || msgLower.includes("track")) {
    const dynamicRoomName = roomIdOrSlug
      .replace(/-room$/i, "")
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return `If you're looking for top recommendations in this room, check out the live queue for ${dynamicRoomName} — the acoustic arrangement and rhythm section fit this room vibe perfectly.`;
  }

  if (msgLower.includes("hi") || msgLower.includes("hello") || msgLower.includes("hey")) {
    return `Hey there! Great to have you in the room. I'm ${bot.name}, tracking the acoustic frequency in here. How are these tracks hitting your mood right now?`;
  }

  if (msgLower.includes("vibe") || msgLower.includes("mood") || msgLower.includes("feel")) {
    return `The acoustic energy in here is calibrated specifically for ${bot.vibeDescription.toLowerCase()} It's rare to find a sequence that flows this seamlessly.`;
  }

  // General natural musical response
  const naturalResponses = [
    `That's a spot-on point about the arrangement. The harmonic texture in this room really brings out ${bot.vibeDescription.toLowerCase()}`,
    `Totally agree. The way the rhythm section locks in here creates such an immersive atmosphere.`,
    `Fascinating take! Listening to music in a dedicated room like this really shifts how you process the production details.`,
  ];

  return naturalResponses[Math.floor(Math.random() * naturalResponses.length)];
}
