"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassSkeleton } from "./GlassSkeleton";
import { SpotifyArtist, SpotifyTrack, SpotifyPlayHistory } from "@/lib/spotify";
import { 
  Disc, 
  BarChart2, 
  Clock, 
  Zap, 
  TrendingUp, 
  PieChart, 
  Calendar,
  Sparkles,
  AlertCircle
} from "lucide-react";

export interface OverviewTabProps {
  isLoading?: boolean;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ isLoading: propIsLoading = false }) => {
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<SpotifyPlayHistory[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAllData = async () => {
      setDataLoading(true);
      setError(null);
      try {
        const [artistsRes, shortArtistsRes, longArtistsRes, tracksRes, recentRes] = await Promise.all([
          fetch("/api/spotify/top-artists?time_range=medium_term&limit=20"),
          fetch("/api/spotify/top-artists?time_range=short_term&limit=20"),
          fetch("/api/spotify/top-artists?time_range=long_term&limit=20"),
          fetch("/api/spotify/top-tracks?time_range=medium_term&limit=20"),
          fetch("/api/spotify/recently-played?limit=50"),
        ]);

        const artistsData = artistsRes.ok ? await artistsRes.json() : { items: [] };
        const shortData = shortArtistsRes.ok ? await shortArtistsRes.json() : { items: [] };
        const longData = longArtistsRes.ok ? await longArtistsRes.json() : { items: [] };
        const tracksData = tracksRes.ok ? await tracksRes.json() : { items: [] };
        const recentData = recentRes.ok ? await recentRes.json() : { items: [] };

        // Combine all unique artists across time ranges to maximize genre coverage
        const artistMap = new Map<string, SpotifyArtist>();
        [...(artistsData.items || []), ...(shortData.items || []), ...(longData.items || [])].forEach((a) => {
          if (a && a.id && !artistMap.has(a.id)) {
            artistMap.set(a.id, a);
          }
        });

        if (isMounted) {
          setTopArtists(Array.from(artistMap.values()));
          setTopTracks(tracksData.items || []);
          setRecentlyPlayed(recentData.items || []);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to fetch Spotify analytics data");
        }
      } finally {
        if (isMounted) {
          setDataLoading(false);
        }
      }
    };

    fetchAllData();
    return () => {
      isMounted = false;
    };
  }, []);

  const isLoading = propIsLoading || dataLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        {/* Stat Cards Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="p-5 rounded-3xl bg-white/[0.05] border border-white/10 flex flex-col gap-3">
              <GlassSkeleton className="w-8 h-8 rounded-xl" />
              <GlassSkeleton className="w-24 h-4 rounded-md" />
              <GlassSkeleton className="w-32 h-7 rounded-lg" />
              <GlassSkeleton className="w-20 h-3 rounded-md" />
            </div>
          ))}
        </div>

        {/* Charts Skeleton Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 p-6 rounded-3xl bg-white/[0.05] border border-white/10 flex flex-col gap-4">
            <GlassSkeleton className="w-48 h-6 rounded-lg" />
            <GlassSkeleton className="w-full h-64 rounded-2xl" />
          </div>
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white/[0.05] border border-white/10 flex flex-col gap-4">
            <GlassSkeleton className="w-44 h-6 rounded-lg" />
            <GlassSkeleton className="w-full h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // 1. Calculate Top Genre & Genre Breakdown
  const genreMap: Record<string, number> = {};
  topArtists.forEach((artist) => {
    artist.genres?.forEach((genre) => {
      genreMap[genre] = (genreMap[genre] || 0) + 1;
    });
  });

  const sortedGenres = Object.entries(genreMap)
    .sort(([, a], [, b]) => b - a)
    .map(([genre, count]) => ({ genre, count }));

  const totalGenreCount = sortedGenres.reduce((acc, curr) => acc + curr.count, 0);
  const topGenreName = sortedGenres[0]?.genre || "Eclectic Mix";
  const topGenrePercentage = totalGenreCount > 0 
    ? Math.round((sortedGenres[0]?.count / totalGenreCount) * 100)
    : 0;

  const top5Genres = sortedGenres.slice(0, 5).map((g) => ({
    ...g,
    percentage: totalGenreCount > 0 ? Math.round((g.count / totalGenreCount) * 100) : 0,
  }));

  // 2. Calculate Total Unique Tracks Analyzed
  const totalAnalyzed = topTracks.length + recentlyPlayed.length;

  // 3. Calculate Most Active Listening Hour from Recently Played
  const hourCounts: number[] = Array(24).fill(0);
  recentlyPlayed.forEach((item) => {
    if (!item.played_at) return;
    const hour = new Date(item.played_at).getHours();
    hourCounts[hour] += 1;
  });

  let peakHour = 0;
  let maxHourCount = 0;
  hourCounts.forEach((c, h) => {
    if (c > maxHourCount) {
      maxHourCount = c;
      peakHour = h;
    }
  });

  const formatHour = (h: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:00 ${period}`;
  };

  const isNightOwl = peakHour >= 22 || peakHour <= 4;

  // 4. Calculate Average Popularity (Acoustic Energy Index)
  const validPopularityTracks = topTracks.filter((t) => typeof t?.popularity === "number");
  const avgPopularity = validPopularityTracks.length > 0
    ? Math.round(validPopularityTracks.reduce((acc, t) => acc + (t.popularity || 0), 0) / validPopularityTracks.length)
    : 75;

  const statCards = [
    {
      title: "Top Genre",
      value: topGenreName.charAt(0).toUpperCase() + topGenreName.slice(1),
      subtitle: `${topGenrePercentage}% of genre affinity`,
      badge: "Mode Genre",
      icon: <Disc className="w-5 h-5 text-[#1DB954]" />,
      badgeColor: "bg-[#1DB954]/15 text-[#1DB954] border-[#1DB954]/30",
    },
    {
      title: "Total Tracks Analyzed",
      value: totalAnalyzed > 0 ? totalAnalyzed.toLocaleString() : "0",
      subtitle: "Combined stream events",
      badge: "100% Synced",
      icon: <BarChart2 className="w-5 h-5 text-purple-400" />,
      badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    },
    {
      title: "Most Active Listening Hour",
      value: recentlyPlayed.length > 0 ? formatHour(peakHour) : "12:00 PM",
      subtitle: isNightOwl ? "Night-Owl archetype" : "Daytime Listener",
      badge: "Peak Circadian Vibe",
      icon: <Clock className="w-5 h-5 text-indigo-400" />,
      badgeColor: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    },
    {
      title: "Energy & Popularity Index",
      value: `${avgPopularity}% Avg`,
      subtitle: "Chart affinity score",
      badge: "High Vibrancy",
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
      badgeColor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    },
  ];

  const donutColors = ["#1DB954", "#8B5CF6", "#06B6D4", "#F59E0B", "#EC4899"];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="flex flex-col gap-6">
      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <GlassCard
            key={card.title}
            variant="interactive"
            radius="3xl"
            enableRefraction={true}
            refractionIntensity="medium"
            className="p-5 border-white/14 flex flex-col justify-between group hover:border-white/30 transition-all duration-300"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                  {card.badge}
                </span>
              </div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                {card.title}
              </p>
              <h3 className="text-2xl font-black text-white tracking-tight mt-1 truncate">
                {card.value}
              </h3>
            </div>
            <p className="text-[11px] text-gray-400 pt-3 mt-3 border-t border-white/10 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-[#1DB954]" />
              <span>{card.subtitle}</span>
            </p>
          </GlassCard>
        ))}
      </div>

      {/* Chart Containers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Genre Distribution Chart */}
        <div className="lg:col-span-7">
          <GlassCard
            variant="elevated"
            radius="3xl"
            enableRefraction={true}
            refractionIntensity="medium"
            className="p-6 border-white/18 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] h-full flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center">
                    <PieChart className="w-4 h-4 text-[#1DB954]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-none">Genre Distribution</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Top 5 primary music styles</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-mono text-gray-300">
                  <Sparkles className="w-3 h-3 text-[#1DB954]" />
                  <span>Realtime Spotify Parse</span>
                </div>
              </div>

              {/* SVG Ring Donut Visualization */}
              <div className="my-4 p-5 rounded-2xl bg-black/40 border border-white/10 relative overflow-hidden flex flex-col items-center justify-center gap-4 min-h-[220px]">
                {top5Genres.length > 0 ? (
                  <>
                    <div className="relative w-44 h-44 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="38" stroke="rgba(255,255,255,0.08)" strokeWidth="12" fill="none" />
                        {top5Genres.map((g, idx) => {
                          const circumference = 238; // 2 * pi * 38
                          const strokeDasharray = `${(g.percentage / 100) * circumference} ${circumference}`;
                          
                          // Calculate cumulative offset
                          const priorPercentage = top5Genres
                            .slice(0, idx)
                            .reduce((sum, item) => sum + item.percentage, 0);
                          const strokeDashoffset = -((priorPercentage / 100) * circumference);

                          return (
                            <circle
                              key={g.genre}
                              cx="50"
                              cy="50"
                              r="38"
                              stroke={donutColors[idx % donutColors.length]}
                              strokeWidth="12"
                              fill="none"
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                              className="transition-all duration-500"
                            />
                          );
                        })}
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center text-center max-w-[100px]">
                        <span className="text-xl font-black text-white font-mono">{topGenrePercentage}%</span>
                        <span className="text-[10px] text-[#1DB954] font-bold uppercase truncate max-w-full">
                          {topGenreName}
                        </span>
                      </div>
                    </div>

                    {/* Genre Legend Pills */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      {top5Genres.map((g, idx) => (
                        <div key={g.genre} className="flex items-center gap-1.5 text-xs">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: donutColors[idx % donutColors.length] }}
                          />
                          <span className="text-gray-300 capitalize">
                            {g.genre} ({g.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 flex flex-col items-center justify-center max-w-sm">
                    <PieChart className="w-10 h-10 text-gray-500 mb-3 animate-pulse" />
                    <p className="text-xs font-bold text-white mb-1">No Spotify Genre Tags Found</p>
                    <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                      Spotify has not assigned explicit genre tags to your top streamed artists yet, or your listening history is very fresh.
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 bg-white/[0.05] px-3 py-1.5 rounded-full border border-white/10">
                      <span>Tip: Play more tracks or check the </span>
                      <span className="text-[#1DB954] font-bold">Upload Deep History</span>
                      <span> tab</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
              <span>Spotify Web API Endpoint</span>
              <span className="text-[#1DB954] font-mono">Live Session Data</span>
            </div>
          </GlassCard>
        </div>

        {/* 2. Listening-Time Heatmap Chart */}
        <div className="lg:col-span-5">
          <GlassCard
            variant="elevated"
            radius="3xl"
            enableRefraction={true}
            refractionIntensity="medium"
            className="p-6 border-white/18 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] h-full flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-none">Listening-Time Heatmap</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Recently Played Activity</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                  {isNightOwl ? "LATE NIGHTS" : "DAYTIME"}
                </span>
              </div>

              {/* Heatmap Grid Matrix */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-2 min-h-[220px]">
                <div className="flex justify-between text-[10px] text-gray-400 font-mono px-1">
                  <span>12AM</span>
                  <span>6AM</span>
                  <span>12PM</span>
                  <span>6PM</span>
                  <span>11PM</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  {days.map((dayLabel, i) => (
                    <div key={dayLabel} className="flex items-center gap-2">
                      <span className="w-6 text-[10px] font-mono text-gray-400">{dayLabel}</span>
                      <div className="flex-1 grid grid-cols-12 gap-1">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((col) => {
                          const hasRecentActivity = recentlyPlayed.some((item) => {
                            if (!item.played_at) return false;
                            const d = new Date(item.played_at);
                            const day = d.getDay() === 0 ? 6 : d.getDay() - 1;
                            const hourBucket = Math.floor(d.getHours() / 2);
                            return day === i && hourBucket === col;
                          });

                          return (
                            <div
                              key={col}
                              className={`h-4 rounded-md transition-all ${
                                hasRecentActivity
                                  ? "bg-[#1DB954] shadow-[0_0_8px_rgba(29,185,84,0.6)]"
                                  : "bg-white/[0.06]"
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Heatmap Legend */}
                <div className="flex items-center justify-end gap-2 pt-3 text-[10px] text-gray-400 font-mono">
                  <span>Inactive</span>
                  <span className="w-3 h-3 rounded bg-white/[0.06]" />
                  <span className="w-3 h-3 rounded bg-[#1DB954]" />
                  <span>Streamed</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
              <span>Timestamp Parsing</span>
              <span className="text-indigo-400 font-mono">Peak: {formatHour(peakHour)}</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
