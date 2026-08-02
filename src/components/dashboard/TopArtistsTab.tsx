"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassSkeleton } from "./GlassSkeleton";
import { SpotifyArtist } from "@/lib/spotify";
import { 
  UserCheck, 
  Users, 
  ExternalLink, 
  TrendingUp, 
  AlertCircle,
  Tag
} from "lucide-react";

type TimeRange = "short_term" | "medium_term" | "long_term";

export const TopArtistsTab: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");
  const [artists, setArtists] = useState<SpotifyArtist[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchTopArtists = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/spotify/top-artists?time_range=${timeRange}&limit=20`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch top artists");
        }
        const data = await res.json();
        if (isMounted) {
          setArtists(data.items || []);
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

    fetchTopArtists();
    return () => {
      isMounted = false;
    };
  }, [timeRange]);

  const formatFollowers = (count: number) => {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar with Time Range Pills */}
      <GlassCard variant="elevated" radius="3xl" className="p-5 border-white/18 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">Your Top Artists</h2>
            <p className="text-xs text-gray-400">Ranked by listening affinity & stream volume</p>
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
                  ? "bg-purple-500 text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.5)]"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-5 rounded-3xl bg-white/[0.05] border border-white/10 flex flex-col gap-4">
              <GlassSkeleton className="w-full h-44 rounded-2xl" />
              <GlassSkeleton className="w-32 h-5 rounded" />
              <GlassSkeleton className="w-24 h-3 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && artists.length === 0 && (
        <GlassCard variant="elevated" radius="3xl" className="p-12 border-white/18 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No artist data found</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Listen to more artists on Spotify to populate your top artist rankings and genre breakdown!
          </p>
        </GlassCard>
      )}

      {/* Artist Grid */}
      {!isLoading && !error && artists.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {artists.map((artist, index) => {
            const photoUrl = artist.images?.[0]?.url || "";

            return (
              <GlassCard
                key={artist.id || index}
                variant="interactive"
                radius="3xl"
                enableRefraction={true}
                refractionIntensity="medium"
                className="p-5 border-white/14 flex flex-col justify-between group hover:border-purple-500/40 transition-all duration-300 relative overflow-hidden"
              >
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />

                <div>
                  {/* Artist Photo Header */}
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-black/40 border border-white/10 mb-4 group-hover:scale-[1.02] transition-transform duration-300">
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoUrl} alt={artist.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/[0.05]">
                        <UserCheck className="w-10 h-10 text-gray-500" />
                      </div>
                    )}

                    {/* Rank Badge Floating Pill */}
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 border border-white/20 backdrop-blur-md text-xs font-black font-mono text-purple-300">
                      #{index + 1}
                    </div>

                    {/* Open Link Floating Button */}
                    <a
                      href={artist.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/70 border border-white/20 backdrop-blur-md hover:bg-purple-500/30 text-white transition-all"
                      title="Open Artist on Spotify"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Name & Stats */}
                  <h3 className="text-lg font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                    {artist.name}
                  </h3>

                  <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                      {formatFollowers(artist.followers?.total || 0)} followers
                    </span>
                    <span className="flex items-center gap-1 text-[#1DB954]">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {typeof artist.popularity === "number" ? artist.popularity : 0}% pop
                    </span>
                  </div>

                  {/* Genre Tag Cloud */}
                  {artist.genres && artist.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-3 mt-3 border-t border-white/10">
                      {artist.genres.slice(0, 3).map((genre) => (
                        <span
                          key={genre}
                          className="px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-medium text-gray-300 capitalize"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
