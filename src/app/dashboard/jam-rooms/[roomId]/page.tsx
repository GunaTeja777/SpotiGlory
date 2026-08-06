"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassSkeleton } from "@/components/ui/GlassSkeleton";
import { getRoomBySlug, getRoomById, MoodRoom } from "@/lib/moodRoomEngine";
import { RoomPlaylist, RoomTrack } from "@/lib/roomPlaylistSource";
import { getBotCompanion, BotCompanionConfig, ChatMessage } from "@/lib/roomChatCompanion";
import {
  ArrowLeft,
  RotateCw,
  Music2,
  Play,
  Pause,
  ExternalLink,
  Send,
  Bot,
  Disc,
  Moon,
  Zap,
  Flame,
  Sun,
  Wind,
} from "lucide-react";

const ROOM_ICON_MAP = {
  Moon: <Moon className="w-6 h-6 text-indigo-400" />,
  Zap: <Zap className="w-6 h-6 text-yellow-400" />,
  Flame: <Flame className="w-6 h-6 text-orange-400" />,
  Sun: <Sun className="w-6 h-6 text-[#1DB954]" />,
  Wind: <Wind className="w-6 h-6 text-cyan-400" />,
};

export default function IndividualJamRoomPage() {
  const params = useParams();
  const roomIdSlug = (params?.roomId as string) || "midnight-neon-sanctuary";

  const [room, setRoom] = useState<MoodRoom | null>(null);
  const [botConfig, setBotConfig] = useState<BotCompanionConfig | null>(null);
  const [playlists, setPlaylists] = useState<RoomPlaylist[]>([]);
  const [activePlaylistIndex, setActivePlaylistIndex] = useState<number>(0);
  const [isRefreshingPlaylist, setIsRefreshingPlaylist] = useState<boolean>(false);
  const [agentDecisions, setAgentDecisions] = useState<{ step: string; decision: string; status: string }[]>([]);
  const [isAgentTracing, setIsAgentTracing] = useState<boolean>(false);

  // Playback state
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Poll room chat messages
  const fetchChatStream = async () => {
    try {
      const res = await fetch(`/api/jam-rooms/${roomIdSlug}/chat`);
      if (res.ok) {
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          setChatMessages(data.messages);
        }
      }
    } catch (e) {
      // Ignore polling error
    }
  };

  const fetchDynamicPlaylist = async (forceRefresh = false) => {
    setIsAgentTracing(true);
    try {
      const savedLang = typeof window !== "undefined" ? localStorage.getItem("spotiglory_user_language") || "" : "";
      const langParam = savedLang ? `&language=${encodeURIComponent(savedLang)}` : "";
      const res = await fetch(`/api/jam-rooms/${roomIdSlug}/playlist?forceRefresh=${forceRefresh}${langParam}`);
      if (res.ok) {
        const data = await res.json();
        if (data.decisions) {
          setAgentDecisions(data.decisions);
        }
        if (data.playlists && data.playlists.length > 0) {
          setPlaylists(data.playlists);
          return;
        }
      }
    } catch (e) {
      // Fallback
    } finally {
      setIsAgentTracing(false);
    }

    setPlaylists([]);
  };

  useEffect(() => {
    // 1. Fetch room details (support static and 100% dynamic rooms)
    const staticRoom = getRoomBySlug(roomIdSlug) || getRoomById(roomIdSlug);

    const formattedTitle = roomIdSlug
      .replace(/-room$/i, "")
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const currentRoom: MoodRoom = staticRoom || {
      id: roomIdSlug,
      slug: roomIdSlug,
      name: formattedTitle,
      primaryMood: "Reflective",
      secondaryMoods: ["Calm"],
      vibeTag: "Live Dynamic Match",
      description: `Live listening room dynamically matched to your stream.`,
      activeListenersCount: 32,
      iconName: "Moon",
      playlistPreview: { title: `${formattedTitle} Playlist`, tracksCount: 15, sampleTracks: [] },
      dominantCluster: "Reflective & Complex",
      oceanMatchTraits: ["High Openness"],
    };

    setRoom(currentRoom);
    const bot = getBotCompanion(currentRoom.slug);
    setBotConfig(bot);

    // 2. Fetch room playlist via connected end-to-end pipeline
    fetchDynamicPlaylist(false);

    // 3. Initial chat fetch & periodic poll
    fetchChatStream();
    const interval = setInterval(fetchChatStream, 3000);
    return () => clearInterval(interval);
  }, [roomIdSlug]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isBotTyping]);

  const handleRefreshPlaylist = async () => {
    setIsRefreshingPlaylist(true);
    try {
      await fetchDynamicPlaylist(true);
    } finally {
      setTimeout(() => setIsRefreshingPlaylist(false), 400);
    }
  };

  const toggleTrackPlay = (track: RoomTrack) => {
    if (!track.previewUrl) return;

    if (activePlayingId === track.id) {
      audioObj?.pause();
      setActivePlayingId(null);
      return;
    }

    if (audioObj) {
      audioObj.pause();
    }

    const newAudio = new Audio(track.previewUrl);
    newAudio.play();
    newAudio.onended = () => setActivePlayingId(null);
    setAudioObj(newAudio);
    setActivePlayingId(track.id);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputMessage.trim();
    if (!trimmed || !botConfig) return;

    setInputMessage("");

    try {
      // 1. Post user message to room chat channel
      const res = await fetch(`/api/jam-rooms/${roomIdSlug}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: "user_active",
          senderName: "You",
          senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
          text: trimmed,
        }),
      });

      if (!res.ok) return;
      const data = await res.json();

      if (data.message) {
        setChatMessages((prev) => [...prev, data.message]);
      }

      // 2. Handle bot reply if triggered by multi-user logic
      if (data.shouldBotReply) {
        setIsBotTyping(true);
        const delay = data.botDelayMs || 1400;

        setTimeout(async () => {
          try {
            const botRes = await fetch(`/api/jam-rooms/${roomIdSlug}/bot-reply`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ triggerMessageText: trimmed }),
            });

            if (botRes.ok) {
              const botData = await botRes.json();
              if (botData.botMessage) {
                setChatMessages((prev) => [...prev, botData.botMessage]);
              }
            }
          } finally {
            setIsBotTyping(false);
          }
        }, delay);
      }
    } catch (err) {
      setIsBotTyping(false);
    }
  };

  const formatMs = (ms?: number) => {
    if (!ms) return "3:30";
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  if (!room || !botConfig) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row relative">
        <DashboardSidebar activeTab="jam-rooms" onSelectTab={() => {}} />
        <main className="flex-1 md:ml-72 p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
          <DashboardHeader />
          <GlassSkeleton className="w-full h-40 rounded-3xl" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Sidebar Navigation */}
      <DashboardSidebar activeTab="jam-rooms" onSelectTab={() => {}} />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 p-4 md:p-8 pb-24 md:pb-12 max-w-7xl mx-auto w-full transition-all flex flex-col gap-6">
        <DashboardHeader />

        {/* Back Link */}
        <div>
          <Link
            href="/dashboard/jam-rooms"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#1DB954]" />
            <span>Back to Jam Rooms</span>
          </Link>
        </div>

        {/* 🌟 Room Header Banner */}
        <GlassCard
          variant="elevated"
          radius="3xl"
          enableRefraction={true}
          refractionIntensity="intense"
          className="p-6 sm:p-8 border-emerald-500/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_50px_rgba(16,185,129,0.2)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                {ROOM_ICON_MAP[room.iconName] || <Moon className="w-6 h-6 text-indigo-400" />}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-mono text-gray-300 font-bold">
                    🏷️ {room.vibeTag}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-ping" />
                    {room.activeListenersCount} listeners in room
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  {room.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed mt-1">
                  {room.description}
                </p>
              </div>
            </div>

            {/* AI Companion Active Status Badge */}
            <div className="p-3.5 rounded-2xl bg-black/50 border border-emerald-500/30 flex items-center gap-3 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={botConfig.avatar}
                alt={botConfig.name}
                className="w-10 h-10 rounded-full border border-emerald-400 bg-black p-0.5"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">{botConfig.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-mono font-bold flex items-center gap-1">
                    <Bot className="w-2.5 h-2.5 text-purple-300" />
                    AI COMPANION
                  </span>
                </div>
                <span className="text-[10px] text-gray-400">{botConfig.title} (Always Active)</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* 2-COLUMN MAIN CONTENT GRID: Playlist (Left) & Real-Time AI Chat (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 🎵 SECTION 1: Room Playlist Container (8 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <GlassCard variant="elevated" radius="3xl" className="p-6 border-white/18">
              {/* Header & Refresh Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#1DB954] mb-1">
                    <Disc className="w-4 h-4" />
                    <span>ROOM PLAYLIST SOURCE (RAG PLAYLIST ENGINE)</span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    {playlists[activePlaylistIndex]?.title || `${room.name} Playlists`}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {playlists[activePlaylistIndex]?.tracks.length || 0} curated tracks • Updated live
                  </p>
                </div>

                <GlassButton
                  variant="spotify-ghost"
                  size="sm"
                  onClick={handleRefreshPlaylist}
                  disabled={isRefreshingPlaylist}
                  leftIcon={<RotateCw className={`w-3.5 h-3.5 ${isRefreshingPlaylist ? "animate-spin" : ""}`} />}
                  className="font-bold text-xs shrink-0"
                >
                  {isRefreshingPlaylist ? "Re-sourcing..." : "Refresh Playlists"}
                </GlassButton>
              </div>

              {/* 🤖 Agentic RAG Decision Trace */}
              {(isAgentTracing || agentDecisions.length > 0) && (
                <div className="mb-5 p-4 rounded-2xl bg-black/45 border border-emerald-500/30 backdrop-blur-xl relative overflow-hidden transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_32px_0_rgba(0,0,0,0.5)] animate-fadeIn">
                  <div className="absolute top-0 right-0 p-3 text-[9px] font-mono text-emerald-400/80 flex items-center gap-1.5 uppercase font-bold tracking-widest">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>{isAgentTracing ? "Tracing Execution..." : "Agent Catalog Active"}</span>
                  </div>
                  
                  <h4 className="text-xs font-mono font-bold text-emerald-400 mb-3 flex items-center gap-2 tracking-wide">
                    <Bot className="w-4 h-4 text-purple-400 animate-bounce" />
                    <span>AGENTIC RAG DECISION PATH</span>
                  </h4>
                  
                  <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin text-xs font-mono">
                    {agentDecisions.map((dec, idx) => {
                      let dotColor = "bg-gray-600";
                      let statusText = "SKIPPED";
                      let textColor = "text-gray-400";
                      
                      if (dec.status === "done") {
                        dotColor = "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]";
                        statusText = "SUCCESS";
                        textColor = "text-gray-200";
                      } else if (dec.status === "active") {
                        dotColor = "bg-yellow-400 animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.7)]";
                        statusText = "RUNNING";
                        textColor = "text-yellow-200";
                      }
                      
                      return (
                        <div key={idx} className={`flex items-start gap-2.5 p-2 rounded-xl transition-all duration-300 ${dec.status === 'active' ? 'bg-white/[0.04] border border-white/5 shadow-[0_0_15px_rgba(29,185,84,0.1)]' : ''}`}>
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <span className="font-bold text-white tracking-wide">{dec.step}</span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border ${
                                dec.status === 'done' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                dec.status === 'active' ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' : 
                                'bg-white/[0.04] text-gray-500 border-white/5'
                              }`}>
                                {statusText}
                              </span>
                            </div>
                            <p className={`text-[11px] leading-relaxed ${textColor}`}>{dec.decision}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Playlist Tabs Selector */}
              {playlists.length > 0 && (
                <div className="flex gap-2.5 mb-4 overflow-x-auto pb-1.5 border-b border-white/5 scrollbar-thin">
                  {playlists.map((pl, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActivePlaylistIndex(idx);
                        if (audioObj) {
                          audioObj.pause();
                          setActivePlayingId(null);
                        }
                      }}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all shrink-0 duration-200 ${
                        activePlaylistIndex === idx
                          ? "bg-[#1DB954] text-black border-[#1DB954] shadow-[0_0_15px_rgba(29,185,84,0.3)]"
                          : "bg-white/[0.03] text-gray-400 border-white/10 hover:text-white hover:bg-white/[0.08]"
                      }`}
                    >
                      {pl.title}
                    </button>
                  ))}
                </div>
              )}

              {/* Tracks List */}
              {playlists.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {playlists[activePlaylistIndex]?.tracks.map((track, idx) => {
                    const isPlaying = activePlayingId === track.id;
                    return (
                      <div
                        key={track.id || idx}
                        className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.07] hover:border-white/20 flex items-center justify-between gap-3 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-5 text-center text-xs font-mono text-gray-400 font-bold shrink-0">
                            {idx + 1}
                          </span>

                          {/* Track Album Art / Play Overlay */}
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                            {track.coverUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={track.coverUrl} alt={track.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-white/5">
                                <Music2 className="w-4 h-4 text-gray-500" />
                              </div>
                            )}

                            {track.previewUrl && (
                              <button
                                onClick={() => toggleTrackPlay(track)}
                                className={`absolute inset-0 m-auto flex items-center justify-center transition-all ${
                                  isPlaying
                                    ? "bg-[#1DB954] text-black opacity-100"
                                    : "bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-[#1DB954] hover:text-black"
                                }`}
                                title={isPlaying ? "Pause Preview" : "Play 30s Preview"}
                              >
                                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                              </button>
                            )}
                          </div>

                          {/* Track Title & Artist */}
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate group-hover:text-[#1DB954] transition-colors">
                              {track.name}
                            </h4>
                            <p className="text-[11px] text-gray-400 truncate">
                              {track.artist} • <span className="text-gray-400">{track.album}</span>
                            </p>
                          </div>
                        </div>

                        {/* Right Track Actions */}
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[11px] font-mono text-gray-400 hidden sm:block">
                            {formatMs(track.durationMs)}
                          </span>

                          {track.spotifyUrl && (
                            <a
                              href={track.spotifyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-gray-400 hover:text-[#1DB954] hover:border-[#1DB954]/40 transition-colors"
                              title="Open on Spotify"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center">
                    <Music2 className="w-5 h-5 text-gray-400 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">No Playlists Found</h4>
                    <p className="text-xs text-gray-400 max-w-sm mt-1 leading-relaxed">
                      We couldn't source playlists from the RAG Sourcing Engine. Try listening to some songs on Spotify first to build your active profile history!
                    </p>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>

          {/* 💬 SECTION 2: Real-Time Room Chat & AI Companion Panel (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <GlassCard variant="elevated" radius="3xl" className="p-5 border-white/18 flex flex-col h-[560px] justify-between">
              {/* Chat Header & AI Companion Identity */}
              <div className="pb-3 border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={botConfig.avatar}
                      alt={botConfig.name}
                      className="w-8 h-8 rounded-full border border-purple-400 bg-black p-0.5"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#1DB954] border border-black" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white">{botConfig.name}</h4>
                      {/* CLEAR AI COMPANION BADGE */}
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-mono font-bold flex items-center gap-1">
                        <Bot className="w-2.5 h-2.5 text-purple-300" />
                        AI COMPANION
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono">Room Host • Always Active</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                  LIVE CHAT
                </span>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto my-3 pr-2 flex flex-col gap-3">
                {chatMessages.map((msg) => {
                  const isBot = msg.isAiCompanion;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col gap-1 ${isBot ? "items-start" : "items-end"}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400">
                        <span>{msg.senderName}</span>
                        {isBot && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[8px] font-bold border border-purple-500/30">
                            AI COMPANION
                          </span>
                        )}
                        <span>• {msg.timestamp}</span>
                      </div>

                      <div
                        className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                          isBot
                            ? "bg-purple-500/15 border border-purple-500/30 text-purple-100 rounded-tl-sm shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                            : "bg-[#1DB954] text-black font-semibold rounded-tr-sm shadow-[0_0_15px_rgba(29,185,84,0.3)]"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}

                {/* AI Companion Typing Indicator */}
                {isBotTyping && (
                  <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 w-fit animate-pulse">
                    <Bot className="w-3.5 h-3.5 text-purple-400" />
                    <span className="font-mono text-[11px]">{botConfig.name} is listening & typing...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleSendMessage} className="pt-3 border-t border-white/10 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Chat with ${botConfig.name} (AI Companion)...`}
                  className="flex-1 px-3.5 py-2.5 rounded-2xl bg-black/60 border border-white/15 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#1DB954] font-medium"
                />
                <GlassButton
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!inputMessage.trim()}
                  className="px-3.5 py-2.5 font-bold shadow-[0_0_15px_rgba(29,185,84,0.5)] shrink-0"
                >
                  <Send className="w-4 h-4 text-black" />
                </GlassButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}
