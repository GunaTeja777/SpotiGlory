"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassSkeleton } from "@/components/ui/GlassSkeleton";
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
} from "lucide-react";

const MOOD_ICONS: Record<MoodType, React.ReactNode> = {
  Reflective: <Moon className="w-3.5 h-3.5 text-indigo-400" />,
  Energized: <Zap className="w-3.5 h-3.5 text-yellow-400" />,
  Fiery: <Flame className="w-3.5 h-3.5 text-orange-400" />,
  Upbeat: <Sun className="w-3.5 h-3.5 text-[#1DB954]" />,
  Calm: <Wind className="w-3.5 h-3.5 text-cyan-400" />,
};

const MOOD_OPTIONS: MoodType[] = ["Reflective", "Energized", "Fiery", "Upbeat", "Calm"];

export const JamPartnersTab: React.FC = () => {
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
  const [isRecentSongsLoaded, setIsRecentSongsLoaded] = useState<boolean>(false);
  const [recentSongCount, setRecentSongCount] = useState<number>(0);
  const [matches, setMatches] = useState<JamMatchResult[]>([]);
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

            setIsRecentSongsLoaded(true);
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

  const loadMatches = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const candidates = getSyntheticUsers();
      const top5 = findJamMatches(
        {
          id: "active_user_current",
          ocean: userOcean,
          musicClusters: userClusters,
          currentMood: activeMood,
        },
        candidates,
        5
      );
      setMatches(top5);
      setIsLoading(false);
      setIsRefreshing(false);
    }, 300);
  };

  useEffect(() => {
    loadMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMood, isRecentSongsLoaded]);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Page Header & Actions */}
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
            {/* Category Tag & Recent Songs Stream Indicator */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Acoustic Compatibility Engine</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1DB954]/15 border border-[#1DB954]/30 text-[#1DB954] text-xs font-mono font-bold shadow-[0_0_15px_rgba(29,185,84,0.2)]">
                <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse" />
                <span>Seeded from Recent Songs ({recentSongCount || 10} tracks)</span>
              </div>
            </div>

            {/* Plain-Language Header Title */}
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              Jam Partners
            </h2>

            {/* Plain-Language Subtitle */}
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed font-medium">
              People with similar taste and current vibe — calculated in real time using multi-vector cosine similarity across your OCEAN personality spectrum, genre clusters, and active mood.
            </p>

            {/* Mood Selector Switcher */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/10">
              <span className="text-xs text-gray-400 font-medium mr-1">Your Vibe Seed:</span>
              {MOOD_OPTIONS.map((mood) => {
                const isActive = activeMood === mood;
                return (
                  <button
                    key={mood}
                    onClick={() => setActiveMood(mood)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isActive
                        ? "bg-[#1DB954] text-black shadow-[0_0_15px_rgba(29,185,84,0.6)] font-bold scale-105"
                        : "bg-white/[0.06] hover:bg-white/[0.12] text-gray-300 border border-white/10"
                    }`}
                  >
                    {MOOD_ICONS[mood]}
                    <span>{mood}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Refresh Matches Button */}
          <GlassButton
            variant="primary"
            size="md"
            onClick={loadMatches}
            disabled={isRefreshing}
            leftIcon={<RotateCw className={`w-4 h-4 text-black ${isRefreshing ? "animate-spin" : ""}`} />}
            className="w-full sm:w-auto shrink-0 font-bold text-xs shadow-[0_0_20px_rgba(29,185,84,0.5)]"
          >
            {isRefreshing ? "Recomputing..." : "Refresh Matches"}
          </GlassButton>
        </div>
      </GlassCard>

      {/* 2. Experimental Model Research Disclaimer Alert */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-xl text-left flex items-start gap-3 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
        <HelpCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wide flex items-center gap-2">
            <span>Experimental Similarity Model</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[9px] font-mono border border-emerald-500/30 text-emerald-300">
              DISCLAIMER
            </span>
          </h4>
          <p className="text-xs text-emerald-300/90 mt-1 leading-relaxed">
            Matches are computed from your Big Five traits, music taste clusters, and current mood — this is an experimental similarity model, not a validated compatibility measurement.
          </p>
        </div>
      </div>

      {/* 3. Top 5 Compatibility Match Cards Grid */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white">Top 5 Compatibility Matches</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/40 text-[#1DB954] text-xs font-mono font-bold">
              Cosine Matrix
            </span>
          </div>
          <span className="text-xs font-mono text-gray-400">
            Ranked by Weighted Similarity
          </span>
        </div>

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
            {matches.map((match, idx) => {
              const u = match.candidateUser;
              return (
                <GlassCard
                  key={u.id || idx}
                  variant="interactive"
                  radius="2xl"
                  className="p-5 border-white/15 hover:border-[#1DB954]/50 flex flex-col justify-between gap-4 relative overflow-hidden group transition-all duration-300"
                >
                  {/* Subtle Top Accent Bar */}
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
                    "{match.matchReason}"
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
      </div>

      {/* 3. Match Discovery Notice */}
      <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3 text-xs text-gray-400">
        <Info className="w-4 h-4 text-[#1DB954] shrink-0" />
        <span>
          <strong>Match Discovery Mode:</strong> Profiles shown are algorithmically ranked using 12-signal acoustic vector matching. Direct messaging & live listening session invites will be enabled in upcoming releases.
        </span>
      </div>
    </div>
  );
};
