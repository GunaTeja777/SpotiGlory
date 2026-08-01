"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassSkeleton } from "./GlassSkeleton";
import { 
  Disc, 
  BarChart2, 
  Clock, 
  Zap, 
  TrendingUp, 
  Activity, 
  PieChart, 
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";

export interface OverviewTabProps {
  isLoading?: boolean;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ isLoading = false }) => {
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

  const statCards = [
    {
      title: "Top Genre",
      value: "Synthwave",
      subtitle: "34% of total listening",
      badge: "+14% this month",
      icon: <Disc className="w-5 h-5 text-[#1DB954]" />,
      badgeColor: "bg-[#1DB954]/15 text-[#1DB954] border-[#1DB954]/30",
    },
    {
      title: "Total Tracks Analyzed",
      value: "1,248",
      subtitle: "Unique stream events",
      badge: "100% Synced",
      icon: <BarChart2 className="w-5 h-5 text-purple-400" />,
      badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    },
    {
      title: "Most Active Listening Hour",
      value: "1:30 AM",
      subtitle: "Night-Owl archetype",
      badge: "Peak Circadian Vibe",
      icon: <Clock className="w-5 h-5 text-indigo-400" />,
      badgeColor: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    },
    {
      title: "Acoustic Energy Index",
      value: "78% High",
      subtitle: "High BPM & Danceability",
      badge: "Vibrant Energy",
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
      badgeColor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    },
  ];

  // Placeholder heatmap data matrix (7 days x 12 time slots)
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="flex flex-col gap-6">
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
              <h3 className="text-2xl font-black text-white tracking-tight mt-1">
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
        {/* 1. Genre Distribution Placeholder Chart */}
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
                  <span>Realtime AI Parse</span>
                </div>
              </div>

              {/* Graphic Donut / Bar Chart Placeholder Visualization */}
              <div className="my-4 p-5 rounded-2xl bg-black/40 border border-white/10 relative overflow-hidden flex flex-col items-center justify-center gap-4 min-h-[220px]">
                {/* SVG Ring Chart Graphic Placeholder */}
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" stroke="rgba(255,255,255,0.08)" strokeWidth="12" fill="none" />
                    {/* Segment 1: Synthwave (34%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#1DB954"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray="81 238"
                      strokeDashoffset="0"
                      className="filter drop-shadow-[0_0_6px_rgba(29,185,84,0.6)]"
                    />
                    {/* Segment 2: Indie Pop (26%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#8B5CF6"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray="62 238"
                      strokeDashoffset="-81"
                    />
                    {/* Segment 3: Deep House (20%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#06B6D4"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray="48 238"
                      strokeDashoffset="-143"
                    />
                    {/* Segment 4: Cyberpunk (12%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#F59E0B"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray="28 238"
                      strokeDashoffset="-191"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-white font-mono">34%</span>
                    <span className="text-[10px] text-[#1DB954] font-bold uppercase">Synthwave</span>
                  </div>
                </div>

                {/* Genre Legend Pills */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1DB954]" />
                    <span className="text-gray-300">Synthwave (34%)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span className="text-gray-300">Indie Pop (26%)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                    <span className="text-gray-300">Deep House (20%)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-gray-300">Cyberpunk (12%)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
              <span>Interactive Data Binding</span>
              <span className="text-[#1DB954] font-mono">Ready for Spotify API</span>
            </div>
          </GlassCard>
        </div>

        {/* 2. Listening-Time Heatmap Placeholder Chart */}
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
                    <p className="text-[11px] text-gray-400 mt-0.5">24h Circadian Activity</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  LATE NIGHTS
                </span>
              </div>

              {/* Heatmap Matrix Grid Placeholder */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-2 min-h-[220px]">
                <div className="flex justify-between text-[10px] text-gray-400 font-mono px-1">
                  <span>12AM</span>
                  <span>6AM</span>
                  <span>12PM</span>
                  <span>6PM</span>
                  <span>11PM</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  {days.map((day, i) => (
                    <div key={day} className="flex items-center gap-2">
                      <span className="w-6 text-[10px] font-mono text-gray-400">{day}</span>
                      <div className="flex-1 grid grid-cols-12 gap-1">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((col) => {
                          // Highlight late night (cols 0-2 & 10-11)
                          const isHigh = (col <= 2 || col >= 10) && (i === 1 || i === 4 || i === 5);
                          const isMed = col >= 8 && col <= 10;
                          return (
                            <div
                              key={col}
                              className={`h-4 rounded-md transition-all ${
                                isHigh
                                  ? "bg-[#1DB954] shadow-[0_0_8px_rgba(29,185,84,0.6)]"
                                  : isMed
                                  ? "bg-[#1DB954]/50"
                                  : "bg-white/[0.06]"
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Heatmap Intensity Legend */}
                <div className="flex items-center justify-end gap-2 pt-3 text-[10px] text-gray-400 font-mono">
                  <span>Less</span>
                  <span className="w-3 h-3 rounded bg-white/[0.06]" />
                  <span className="w-3 h-3 rounded bg-[#1DB954]/50" />
                  <span className="w-3 h-3 rounded bg-[#1DB954]" />
                  <span>More</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
              <span>Timestamp Parsing</span>
              <span className="text-indigo-400 font-mono">Peak: 1:30 AM</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
