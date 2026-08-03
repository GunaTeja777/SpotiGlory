"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassSkeleton } from "@/components/ui/GlassSkeleton";
import {
  getRecommendedRooms,
  RoomRecommendationResult,
  EvaluatedMoodRoom,
} from "@/lib/moodRoomEngine";
import {
  findJamMatches,
  JamMatchResult,
  MoodType,
  OceanVector,
  MusicClusterVector,
} from "@/lib/jamMatching";
import { getSyntheticUsers } from "@/lib/syntheticUsers";
import {
  Users,
  RotateCw,
  Sparkles,
  Disc,
  BrainCircuit,
  Moon,
  Zap,
  Flame,
  Sun,
  Wind,
  Info,
  HelpCircle,
  Radio,
  Music2,
  ArrowRight,
  Headphones,
  Compass,
} from "lucide-react";

const MOOD_ICONS: Record<MoodType, React.ReactNode> = {
  Reflective: <Moon className="w-3.5 h-3.5 text-indigo-400" />,
  Energized: <Zap className="w-3.5 h-3.5 text-yellow-400" />,
  Fiery: <Flame className="w-3.5 h-3.5 text-orange-400" />,
  Upbeat: <Sun className="w-3.5 h-3.5 text-[#1DB954]" />,
  Calm: <Wind className="w-3.5 h-3.5 text-cyan-400" />,
};

const ROOM_ICON_MAP = {
  Moon: <Moon className="w-5 h-5 text-indigo-400" />,
  Zap: <Zap className="w-5 h-5 text-yellow-400" />,
  Flame: <Flame className="w-5 h-5 text-orange-400" />,
  Sun: <Sun className="w-5 h-5 text-[#1DB954]" />,
  Wind: <Wind className="w-5 h-5 text-cyan-400" />,
};

export const JamRoomsTab: React.FC = () => {
  const [activeMood, setActiveMood] = useState<MoodType>("Reflective");
  const [userOcean, setUserOcean] = useState<OceanVector>({
    openness: 85,
    conscientiousness: 60,
    extraversion: 48,
    agreeableness: 72,
    neuroticism: 54,
  });
  const [userClusters, setUserClusters] = useState<MusicClusterVector>({
    reflectiveComplex: 50,
    intenseRebellious: 15,
    upbeatConventional: 15,
    energeticRhythmic: 20,
  });
  const [recentSongCount, setRecentSongCount] = useState<number>(0);
  const [roomRecs, setRoomRecs] = useState<RoomRecommendationResult | null>(null);
  const [peopleMatches, setPeopleMatches] = useState<JamMatchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const parseMood = (raw?: string): MoodType => {
    if (!raw) return "Reflective";
    const lower = raw.toLowerCase();
    if (lower.includes("energized")) return "Energized";
    if (lower.includes("fiery")) return "Fiery";
    if (lower.includes("upbeat")) return "Upbeat";
    if (lower.includes("calm")) return "Calm";
    return "Reflective";
  };

  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      try {
        const [featRes, oceanRes] = await Promise.all([
          fetch("/api/analysis/features").catch(() => null),
          fetch("/api/analysis/ocean").catch(() => null),
        ]);

        if (featRes && featRes.ok && oceanRes && oceanRes.ok) {
          const featData = await featRes.json();
          const oceanData = await oceanRes.json();

          if (isMounted && featData?.features) {
            const count = featData.sampleCounts?.recentlyPlayedCount || 10;
            setRecentSongCount(count);

            if (featData.features.inferredMood?.label) {
              const inferred = parseMood(featData.features.inferredMood.label);
              setActiveMood(inferred);
            }

            if (oceanData?.scores) {
              setUserOcean({
                openness: oceanData.scores.openness?.score ?? 85,
                conscientiousness: oceanData.scores.conscientiousness?.score ?? 60,
                extraversion: oceanData.scores.extraversion?.score ?? 48,
                agreeableness: oceanData.scores.agreeableness?.score ?? 72,
                neuroticism: oceanData.scores.neuroticism?.score ?? 54,
              });
            }

            const dom = oceanData?.dominantCluster || "";
            if (dom.includes("Reflective")) {
              setUserClusters({ reflectiveComplex: 55, intenseRebellious: 15, upbeatConventional: 15, energeticRhythmic: 15 });
            } else if (dom.includes("Intense")) {
              setUserClusters({ reflectiveComplex: 15, intenseRebellious: 55, upbeatConventional: 15, energeticRhythmic: 15 });
            } else if (dom.includes("Upbeat")) {
              setUserClusters({ reflectiveComplex: 15, intenseRebellious: 15, upbeatConventional: 55, energeticRhythmic: 15 });
            } else if (dom.includes("Energetic")) {
              setUserClusters({ reflectiveComplex: 15, intenseRebellious: 15, upbeatConventional: 15, energeticRhythmic: 55 });
            }
          }
        }
      } catch (e) {
        // Fallback gracefully
      }
    };

    fetchUserData();
    return () => {
      isMounted = false;
    };
  }, []);

  const loadAllData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // 1. Get room recommendations from moodRoomEngine
      const recs = getRecommendedRooms(activeMood, userClusters, userOcean);
      setRoomRecs(recs);

      // 2. Get suggested people matches from jamMatching engine
      const candidates = getSyntheticUsers();
      const top5People = findJamMatches(
        {
          id: "active_user_current",
          ocean: userOcean,
          musicClusters: userClusters,
          currentMood: activeMood,
        },
        candidates,
        5
      );
      setPeopleMatches(top5People);
      setIsLoading(false);
      setIsRefreshing(false);
    }, 300);
  };

  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMood]);

  return (
    <div className="flex flex-col gap-8">
      {/* 🌟 1. Page Header & Live Vibe Bar */}
      <GlassCard
        variant="elevated"
        radius="3xl"
        enableRefraction={true}
        refractionIntensity="intense"
        className="p-6 sm:p-8 border-emerald-500/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_50px_rgba(16,185,129,0.2)] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            {/* Category Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Jam Rooms & Acoustic Community</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1DB954]/15 border border-[#1DB954]/30 text-[#1DB954] text-xs font-mono font-bold shadow-[0_0_15px_rgba(29,185,84,0.2)]">
                <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse" />
                <span>Live Recent Songs Stream ({recentSongCount || 10} tracks)</span>
              </div>
            </div>

            {/* Header Title & Subtitle */}
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              Jam Rooms
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed font-medium">
              Discover acoustic listening rooms matching your vibe & connect with compatible listeners in real time.
            </p>

            {/* Active Vibe Indicator */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/10 text-xs font-mono">
              <span className="text-gray-400 font-medium uppercase">CURRENT VIBE:</span>
              <div className="px-3 py-1.5 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/40 text-[#1DB954] font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(29,185,84,0.3)]">
                {MOOD_ICONS[activeMood]}
                <span>Feeling: {activeMood}</span>
                <span className="text-[10px] text-gray-400 font-normal lowercase">(Auto-Inferred from Recent Songs)</span>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <GlassButton
            variant="primary"
            size="md"
            onClick={loadAllData}
            disabled={isRefreshing}
            leftIcon={<RotateCw className={`w-4 h-4 text-black ${isRefreshing ? "animate-spin" : ""}`} />}
            className="w-full sm:w-auto shrink-0 font-bold text-xs shadow-[0_0_20px_rgba(29,185,84,0.5)]"
          >
            {isRefreshing ? "Recomputing..." : "Refresh Rooms & Matches"}
          </GlassButton>
        </div>
      </GlassCard>

      {/* 🎵 SECTION 1: Recommended Rooms For Your Current Vibe */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center">
              <Headphones className="w-4 h-4 text-[#1DB954]" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Recommended Rooms For Your Current Vibe
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Curated acoustic rooms matched to your active mood & music clusters
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mood Room Engine v1.0</span>
          </span>
        </div>

        {isLoading || !roomRecs ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <GlassCard key={i} variant="elevated" radius="2xl" className="p-6 border-white/10 flex flex-col gap-4">
                <GlassSkeleton className="w-40 h-6 rounded" />
                <GlassSkeleton className="w-full h-16 rounded-xl" />
                <GlassSkeleton className="w-full h-24 rounded-xl" />
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Top 3 Personalized Room Suggestions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {roomRecs.topRooms.map((evalRoom) => {
                const room = evalRoom.room;
                return (
                  <GlassCard
                    key={room.id}
                    variant="interactive"
                    radius="3xl"
                    className="p-6 border-emerald-500/30 hover:border-[#1DB954] flex flex-col justify-between gap-5 relative overflow-hidden group transition-all duration-300 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.8)]"
                  >
                    {/* Top Accent Gradient Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-[#1DB954] to-cyan-500 opacity-80 group-hover:opacity-100 transition-opacity" />

                    <div>
                      {/* Room Header */}
                      <div className="flex items-start justify-between gap-3 mb-3 pt-1">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            {ROOM_ICON_MAP[room.iconName] || <Moon className="w-5 h-5 text-indigo-400" />}
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-white group-hover:text-[#1DB954] transition-colors leading-tight">
                              {room.name}
                            </h4>
                            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                              <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-ping" />
                              {room.activeListenersCount} listening now
                            </span>
                          </div>
                        </div>

                        {/* Match Score Badge */}
                        <div className="px-2.5 py-1 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/50 text-[#1DB954] text-xs font-mono font-black shrink-0 shadow-[0_0_15px_rgba(29,185,84,0.3)]">
                          {evalRoom.matchScore}% Match
                        </div>
                      </div>

                      {/* Vibe Tag & Description */}
                      <div className="mb-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-mono text-gray-300 font-bold mb-2">
                          🏷️ {room.vibeTag}
                        </span>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {room.description}
                        </p>
                      </div>

                      {/* Personalized Match Reason */}
                      <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 font-medium mb-4 leading-relaxed">
                        &ldquo;{evalRoom.recommendationReason}&rdquo;
                      </div>

                      {/* Playlist Preview Box */}
                      <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-white/10">
                          <span className="text-white font-bold flex items-center gap-1.5 truncate">
                            <Disc className="w-3.5 h-3.5 text-[#1DB954]" />
                            {room.playlistPreview.title}
                          </span>
                          <span className="text-gray-400 text-[10px] shrink-0">
                            {room.playlistPreview.tracksCount} tracks
                          </span>
                        </div>

                        <div className="flex flex-col gap-1 pt-1">
                          {room.playlistPreview.sampleTracks.map((track, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[11px] text-gray-300">
                              <span className="truncate text-white font-medium">
                                {idx + 1}. {track.title}
                              </span>
                              <span className="text-gray-400 truncate text-[10px] ml-2">
                                {track.artist}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Room Action Link */}
                    <Link href={`/dashboard/jam-rooms/${room.slug}`} className="w-full">
                      <GlassButton
                        variant="primary"
                        size="md"
                        rightIcon={<ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />}
                        className="w-full justify-center font-bold text-xs shadow-[0_0_20px_rgba(29,185,84,0.5)]"
                      >
                        Enter Room
                      </GlassButton>
                    </Link>
                  </GlassCard>
                );
              })}
            </div>

            {/* Adjacent / Related Rooms Section */}
            {roomRecs.adjacentRooms.length > 0 && (
              <div className="pt-4 border-t border-white/10 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Explore Adjacent Rooms (Complementary Vibes)
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {roomRecs.adjacentRooms.map((evalRoom) => {
                    const room = evalRoom.room;
                    return (
                      <GlassCard
                        key={room.id}
                        variant="interactive"
                        radius="2xl"
                        className="p-4 border-white/15 hover:border-purple-500/50 flex flex-col justify-between gap-3 group transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {ROOM_ICON_MAP[room.iconName] || <Moon className="w-4 h-4 text-purple-400" />}
                              <h5 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                                {room.name}
                              </h5>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                              {evalRoom.matchScore}% Match
                            </span>
                          </div>

                          <p className="text-[11px] text-gray-300 leading-snug line-clamp-2 mb-2">
                            {room.description}
                          </p>

                          <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-[10px] font-mono text-gray-300 truncate">
                            🎵 Playlist: {room.playlistPreview.title}
                          </div>
                        </div>

                        <Link href={`/dashboard/jam-rooms/${room.slug}`}>
                          <GlassButton
                            variant="subtle"
                            size="sm"
                            rightIcon={<ArrowRight className="w-3.5 h-3.5 text-purple-300" />}
                            className="w-full justify-center text-xs border-purple-500/30 text-purple-200 hover:bg-purple-500/10"
                          >
                            Explore Room
                          </GlassButton>
                        </Link>
                      </GlassCard>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 👥 SECTION 2: Suggested People For Your Current Mood */}
      <div className="flex flex-col gap-5 pt-6 border-t border-white/10">
        {/* Section Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Suggested People For Your Current Mood
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Listeners with matching acoustic taste & current {activeMood} vibe
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-gray-400 hidden sm:block">
            Multi-Vector Cosine Matrix
          </span>
        </div>

        {/* Experimental Model Disclaimer Alert */}
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 backdrop-blur-xl text-left flex items-start gap-3 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
          <HelpCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wide flex items-center gap-2">
              <span>Experimental Similarity Model</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-[9px] font-mono border border-purple-500/30 text-purple-300">
                DISCLAIMER
              </span>
            </h4>
            <p className="text-xs text-purple-300/90 mt-1 leading-relaxed">
              Matches are computed from your Big Five traits, music taste clusters, and current mood — this is an experimental similarity model, not a validated compatibility measurement.
            </p>
          </div>
        </div>

        {/* Top 5 Compatibility Match Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <GlassCard key={i} variant="elevated" radius="2xl" className="p-6 border-white/10 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <GlassSkeleton className="w-14 h-14 rounded-full" />
                  <div className="flex flex-col gap-2 flex-1">
                    <GlassSkeleton className="w-28 h-5 rounded" />
                    <GlassSkeleton className="w-20 h-4 rounded" />
                  </div>
                </div>
                <GlassSkeleton className="w-full h-16 rounded-xl" />
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {peopleMatches.map((match, idx) => {
              const u = match.candidateUser;
              return (
                <GlassCard
                  key={u.id || idx}
                  variant="interactive"
                  radius="2xl"
                  className="p-5 border-white/15 hover:border-[#1DB954]/50 flex flex-col justify-between gap-4 relative overflow-hidden group transition-all duration-300"
                >
                  {/* Top Accent Bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/80 via-[#1DB954] to-purple-500/80 opacity-60 group-hover:opacity-100 transition-opacity" />

                  {/* Header: Candidate Info & Demo Profile Badge */}
                  <div className="flex items-start justify-between gap-3 pt-1">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar Image */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-12 h-12 rounded-full border border-white/20 bg-black/40 p-0.5 shrink-0 object-cover group-hover:scale-105 transition-transform"
                      />

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white truncate group-hover:text-[#1DB954] transition-colors">
                            {u.name}
                          </h4>
                          {/* Demo Profile Label */}
                          {u.isSynthetic && (
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-mono font-bold shrink-0">
                              Demo Profile
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate">{u.persona}</p>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className="px-2.5 py-1 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/50 text-[#1DB954] text-xs font-mono font-black shrink-0 shadow-[0_0_15px_rgba(29,185,84,0.3)]">
                      {match.matchScore}% Match
                    </div>
                  </div>

                  {/* Plain-English Match Reason Box */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-gray-200 leading-relaxed font-medium">
                    &ldquo;{match.matchReason}&rdquo;
                  </div>

                  {/* Sub-Vector Contribution Breakdown Pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-emerald-300 border border-white/10 flex items-center gap-1">
                      <Disc className="w-3 h-3 text-[#1DB954]" />
                      {match.dimensionContributions.topSharedCluster}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-purple-300 border border-white/10 flex items-center gap-1">
                      <BrainCircuit className="w-3 h-3 text-purple-400" />
                      {match.dimensionContributions.topSharedTrait}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-cyan-300 border border-white/10 flex items-center gap-1">
                      {MOOD_ICONS[u.currentMood]}
                      {u.currentMood}
                    </span>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}

        {/* Discovery Notice */}
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3 text-xs text-gray-400">
          <Info className="w-4 h-4 text-[#1DB954] shrink-0" />
          <span>
            <strong>Match Discovery Mode:</strong> Profiles shown are algorithmically ranked using 12-signal acoustic vector matching. Direct messaging & live room session invites will be enabled in upcoming releases.
          </span>
        </div>
      </div>
    </div>
  );
};
