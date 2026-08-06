import { NextResponse } from "next/server";
import { getAgenticRagPlaylists } from "@/lib/roomPlaylistSource";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message;

    if (!message || !message.chat || !message.text) {
      return NextResponse.json({ status: "ok", message: "No text to process" });
    }

    const chatId = message.chat.id;
    const userFirstName = message.from?.first_name || "Listener";
    const text = message.text.trim();

    const botToken = process.env.TELEGRAM_BOT_TOKEN || "8775500609:AAEylU81JBdKXr-yXghkXI43SVhZG0oab6k";

    let replyText = "";

    if (text === "/start" || text === "/help") {
      replyText = `🎵 *Welcome to SpotiGlory Bot, ${userFirstName}!*\n\n` +
        `I am your AI Music Companion & Jam Room Assistant.\n\n` +
        `*Commands & Options:*\n` +
        `• Send me any song name or music genre (e.g. \`Pop\`, \`EDM\`, \`Acoustic\`, \`Latin\`).\n` +
        `• I will dynamically run the *Agentic RAG Engine* and return custom thematic playlists for you!\n\n` +
        `🌐 *Web Dashboard:* [SpotiGlory App](https://spotiglory.vercel.app)`;
    } else {
      // Run Agentic RAG playlist generator dynamically for Telegram query
      const ragResult = await getAgenticRagPlaylists(
        text.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        [],
        "English"
      );

      if (ragResult.playlists && ragResult.playlists.length > 0) {
        replyText = `🎧 *SpotiGlory Agentic RAG Recommendations for "${text}":*\n\n`;
        ragResult.playlists.slice(0, 2).forEach((pl, idx) => {
          replyText += `*Playlist #${idx + 1}: ${pl.title}*\n_${pl.description}_\n`;
          pl.tracks.slice(0, 4).forEach((tr, tIdx) => {
            replyText += `  ${tIdx + 1}. *${tr.name}* - ${tr.artist}\n`;
          });
          replyText += `\n`;
        });
        replyText += `✨ _Generated dynamically by SpotiGlory Agent Router_`;
      } else {
        replyText = `🎶 *SpotiGlory Music Bot*\n\nFound vibe query: "${text}".\nVisit your dashboard to view full Jam Rooms: https://spotiglory.vercel.app/dashboard/jam-rooms`;
      }
    }

    // Send response back to Telegram API
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: replyText,
        parse_mode: "Markdown",
        disable_web_page_preview: false
      })
    });

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("Telegram Webhook Error:", error);
    return NextResponse.json({ status: "error", error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    bot: "@SpotiGlory_Bot",
    description: "Telegram Webhook Endpoint for SpotiGlory AI Assistant"
  });
}
