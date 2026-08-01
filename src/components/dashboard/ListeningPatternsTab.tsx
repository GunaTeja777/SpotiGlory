"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassSkeleton } from "./GlassSkeleton";
import { SpotifyPlayHistory } from "@/lib/spotify";
import { 
  Clock, 
  Moon, 
  Sun, 
  Activity, 
  Calendar,
  AlertCircle,
  Music2,
  Sparkles
} from "lucide-react";

export const ListeningPatternsTab: React.FC = () => {
  const [history, setHistory] = useState<SpotifyPlayHistory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchRecentlyPlayed = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/spotify/recently-played?limit=50");
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch recently played history");
        }
        const data = await res.json();
        if (isMounted) {
          setHistory(data.items || []);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "An unexpected error occurred");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchRecentlyPlayed();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute 7-day x 24-hour matrix from history items
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  // matrix[dayIndex][hourIndex] = count
  const matrix: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  const hourCounts: number[] = Array(24).fill(0);
  let nightOwlCount = 0; // 10 PM to 4 AM (hours 22, 23, 0, 1, 2, 3)
  let earlyBirdCount = 0; // 5 AM to 11 AM (hours 5, 6, 7, 8, 9, 10)

  history.forEach((item) => {
    if (!item.played_at) return;
    const date = new Date(item.played_at);
    let day = date.getDay(); // 0 = Sun, 1 = Mon ...
    day = day === 0 ? 6 : day - 1; // Convert to Mon = 0 ... Sun = 6
    const hour = date.getHours(); // 0-23

    matrix[day][hour] += 1;
    hourCounts[hour] += 1;

    if (hour >= 22 || hour <= 3) {
      nightOwlCount += 1;
    } else if (hour >= 5 && hour <= 10) {
      earlyBirdCount += 1;
    }
  });

  // Calculate peak hour
  let peakHour = 0;
  let maxHourCount = 0;
  hourCounts.forEach((count, h) => {
    if (count > maxHourCount) {
      maxHourCount = count;
      peakHour = h;
    }
  });

  const formatHour = (h: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:00 ${period}`;
  };

  const getHeatmapColor = (count: number) => {
    if (count === 0) return "bg-white/[0.04] border-white/5";
    if (count === 1) return "bg-[#1DB954]/30 border-[#1DB954]/40";
    if (count === 2) return "bg-[#1DB954]/60 border-[#1DB954]/70";
    return "bg-[#1DB954] border-[#1DB954] shadow-[0_0_12px_rgba(29,185,84,0.8)]";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <GlassCard variant="elevated" radius="3xl" className="p-5 border-white/18 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
            <Clock className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">Listening Patterns & Circadian Heatmap</h2>
            <p className="text-xs text-gray-400">Timestamp analysis of your recent streaming activity</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-xs font-mono text-indigo-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Realtime Timestamp Parser</span>
        </div>
      </GlassCard>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-5 rounded-3xl bg-white/[0.05] border border-white/10 flex flex-col gap-3">
                <GlassSkeleton className="w-24 h-4 rounded" />
                <GlassSkeleton className="w-32 h-7 rounded-lg" />
              </div>
            ))}
          </div>
          <div className="p-6 rounded-3xl bg-white/[0.05] border border-white/10">
            <GlassSkeleton className="w-full h-64 rounded-2xl" />
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Analytics Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <GlassCard variant="interactive" radius="3xl" className="p-5 border-white/14">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  PEAK SLOT
                </span>
              </div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Peak Listening Hour
              </p>
              <h3 className="text-2xl font-black text-white tracking-tight mt-1">
                {history.length > 0 ? formatHour(peakHour) : "N/A"}
              </h3>
              <p className="text-[11px] text-gray-400 pt-2 mt-2 border-t border-white/10">
                {maxHourCount} stream events recorded
              </p>
            </GlassCard>

            <GlassCard variant="interactive" radius="3xl" className="p-5 border-white/14">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                  <Moon className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  TEMPORAL MODE
                </span>
              </div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Night Owl vs Early Bird
              </p>
              <h3 className="text-2xl font-black text-white tracking-tight mt-1">
                {nightOwlCount >= earlyBirdCount ? "Night Owl 🌙" : "Early Bird 🌅"}
              </h3>
              <p className="text-[11px] text-gray-400 pt-2 mt-2 border-t border-white/10">
                {nightOwlCount} late-night streams vs {earlyBirdCount} morning streams
              </p>
            </GlassCard>

            <GlassCard variant="interactive" radius="3xl" className="p-5 border-white/14">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-[#1DB954]" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1DB954]/15 text-[#1DB954] border border-[#1DB954]/30">
                  SAMPLE SIZE
                </span>
              </div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Recent Streams Analyzed
              </p>
              <h3 className="text-2xl font-black text-white tracking-tight mt-1">
                {history.length} Events
              </h3>
              <p className="text-[11px] text-gray-400 pt-2 mt-2 border-t border-white/10">
                Spotify API recently-played history
              </p>
            </GlassCard>
          </div>

          {/* 7x24 Circadian Heatmap Grid */}
          <GlassCard variant="elevated" radius="3xl" className="p-6 border-white/18">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-[#1DB954]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-none">24-Hour Circadian Heatmap</h3>
                  <p className="text-xs text-gray-400 mt-1">7 Days of Week x 24 Hours of Day matrix</p>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono">
                <span>0 plays</span>
                <span className="w-3 h-3 rounded bg-white/[0.04] border border-white/5" />
                <span className="w-3 h-3 rounded bg-[#1DB954]/30 border border-[#1DB954]/40" />
                <span className="w-3 h-3 rounded bg-[#1DB954]/60 border border-[#1DB954]/70" />
                <span className="w-3 h-3 rounded bg-[#1DB954] border border-[#1DB954]" />
                <span>High activity</span>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[700px] flex flex-col gap-2">
                {/* Hours Header */}
                <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 px-1">
                  <span className="w-10 text-right pr-2">Day</span>
                  <div className="flex-1 grid grid-cols-24 gap-1 text-center">
                    {Array.from({ length: 24 }).map((_, h) => (
                      <span key={h} className="truncate">
                        {h % 4 === 0 ? `${h}h` : ""}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Day Rows */}
                {days.map((dayLabel, dayIdx) => (
                  <div key={dayLabel} className="flex items-center gap-2">
                    <span className="w-10 text-xs font-mono font-bold text-gray-400 text-right pr-2">
                      {dayLabel}
                    </span>
                    <div className="flex-1 grid grid-cols-24 gap-1">
                      {Array.from({ length: 24 }).map((_, hourIdx) => {
                        const count = matrix[dayIdx][hourIdx];
                        return (
                          <div
                            key={hourIdx}
                            title={`${dayLabel} ${formatHour(hourIdx)}: ${count} streams`}
                            className={`h-7 rounded-lg border transition-all duration-200 hover:scale-110 flex items-center justify-center text-[9px] font-mono font-bold text-black/80 ${getHeatmapColor(
                              count
                            )}`}
                          >
                            {count > 0 ? count : ""}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Recently Played Activity Feed */}
          <GlassCard variant="elevated" radius="3xl" className="p-6 border-white/18">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Music2 className="w-4 h-4 text-[#1DB954]" />
              <span>Recent Stream Timeline</span>
            </h3>

            <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-2">
              {history.map((item, i) => (
                <div
                  key={`${item.played_at}-${i}`}
                  className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.07] flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-black/40 border border-white/10 shrink-0">
                      {item.track?.album?.images?.[0]?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.track.album.images[0].url}
                          alt={item.track.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                          <Music2 className="w-4 h-4 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{item.track?.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">
                        {item.track?.artists?.map((a) => a.name).join(", ")}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-gray-400 shrink-0 pl-2">
                    {item.played_at ? new Date(item.played_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
};
