"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassSkeleton } from "./GlassSkeleton";
import { SpotifyTrack } from "@/lib/spotify";
import { 
  Music2, 
  Clock, 
  ExternalLink, 
  TrendingUp, 
  PlayCircle,
  AlertCircle,
  Sparkles
} from "lucide-react";

type TimeRange = "short_term" | "medium_term" | "long_term";

export const TopTracksTab: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchTopTracks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/spotify/top-tracks?time_range=${timeRange}&limit=20`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch top tracks");
        }
        const data = await res.json();
        if (isMounted) {
          setTracks(data.items || []);
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

    fetchTopTracks();
    return () => {
      isMounted = false;
    };
  }, [timeRange]);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar with Time Range Pills */}
      <GlassCard variant="elevated" radius="3xl" className="p-5 border-white/18 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center">
            <Music2 className="w-5 h-5 text-[#1DB954]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">Your Top Tracks</h2>
            <p className="text-xs text-gray-400">Ranked by frequency & play duration</p>
          </div>
        </div>

        {/* Time Range Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10">
          {(
            [
              { key: "short_term", label: "4 Weeks" },
              { key: "medium_term", label: "6 Months" },
              { key: "long_term", label: "All Time" },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setTimeRange(item.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                timeRange === item.key
                  ? "bg-[#1DB954] text-black font-bold shadow-[0_0_15px_rgba(29,185,84,0.5)]"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              {item.label}
            </button>
          ))}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center gap-4">
              <GlassSkeleton className="w-14 h-14 rounded-xl shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <GlassSkeleton className="w-40 h-4 rounded" />
                <GlassSkeleton className="w-24 h-3 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && tracks.length === 0 && (
        <GlassCard variant="elevated" radius="3xl" className="p-12 border-white/18 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center mx-auto mb-4">
            <Music2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Not enough listening history yet</h3>
          <p className="text-xs text-gray-400 leading-relaxed mb-6">
            Spotify needs a little more activity on your account to generate top track rankings for this time period. Play some music on Spotify and check back soon!
          </p>
        </GlassCard>
      )}

      {/* Track Grid */}
      {!isLoading && !error && tracks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tracks.map((track, index) => {
            const albumCover = track.album.images?.[0]?.url || "";
            const artistNames = track.artists.map((a) => a.name).join(", ");

            return (
              <GlassCard
                key={track.id || index}
                variant="interactive"
                radius="2xl"
                enableRefraction={true}
                refractionIntensity="subtle"
                className="p-3.5 border-white/14 flex items-center gap-3.5 group hover:border-white/30 transition-all duration-300"
              >
                {/* Rank Badge */}
                <div className="w-8 text-center shrink-0">
                  <span className={`text-sm font-black font-mono ${index < 3 ? "text-[#1DB954]" : "text-gray-500"}`}>
                    #{index + 1}
                  </span>
                </div>

                {/* Album Cover Art */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0 group-hover:scale-105 transition-transform duration-300">
                  {albumCover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={albumCover} alt={track.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/[0.05]">
                      <Music2 className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Track Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate group-hover:text-[#1DB954] transition-colors">
                    {track.name}
                  </h4>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {artistNames}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      {formatDuration(track.duration_ms)}
                    </span>
                    <span className="flex items-center gap-1 text-[#1DB954]">
                      <TrendingUp className="w-3 h-3" />
                      {typeof track.popularity === "number" ? track.popularity : 0}% pop
                    </span>
                  </div>
                </div>

                {/* Open in Spotify Link */}
                <a
                  href={track.external_urls?.spotify || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-[#1DB954]/20 hover:border-[#1DB954]/40 text-gray-400 hover:text-[#1DB954] transition-all shrink-0 ml-auto self-center"
                  title="Open in Spotify"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
