"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassSkeleton } from "@/components/dashboard/GlassSkeleton";
import { BehavioralFeatures } from "@/lib/features";
import { 
  ArrowLeft, 
  Terminal, 
  BrainCircuit, 
  Sparkles, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2,
  Copy
} from "lucide-react";

export default function DebugFeaturesPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchFeatures = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analysis/features");
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to fetch behavioral features");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching feature signals");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const copyToClipboard = () => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const features: BehavioralFeatures | undefined = data?.features;

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-radial from-purple-500/15 to-transparent blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-3">
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={fetchFeatures}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refetch Signals
          </GlassButton>
          {data && (
            <GlassButton
              variant="spotify-ghost"
              size="sm"
              onClick={copyToClipboard}
              leftIcon={copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#1DB954]" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? "Copied JSON!" : "Copy JSON"}
            </GlassButton>
          )}
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <BrainCircuit className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">
              Behavioral Feature Signals Debugger
            </h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Raw output from <code className="font-mono text-purple-300">computeBehavioralFeatures()</code> computed server-side
          </p>
        </div>

        {data?.timestamp && (
          <span className="text-[11px] font-mono text-gray-400 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10">
            {new Date(data.timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 flex flex-col gap-2">
                <GlassSkeleton className="w-24 h-4" />
                <GlassSkeleton className="w-32 h-7" />
              </div>
            ))}
          </div>
          <div className="p-6 rounded-3xl bg-white/[0.05] border border-white/10">
            <GlassSkeleton className="w-full h-80 rounded-2xl" />
          </div>
        </div>
      )}

      {!isLoading && features && (
        <div className="flex flex-col gap-6">
          {/* Feature Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <GlassCard variant="interactive" radius="2xl" className="p-4 border-white/14">
              <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">Genre Diversity</span>
              <h3 className="text-xl font-black text-white mt-1">
                {features.genreDiversity.normalizedEntropy} <span className="text-xs font-normal text-gray-400">norm entropy</span>
              </h3>
              <p className="text-[11px] text-gray-400 mt-1">
                {features.genreDiversity.shannonEntropy} bits across {features.genreDiversity.uniqueGenreCount} unique genres
              </p>
            </GlassCard>

            <GlassCard variant="interactive" radius="2xl" className="p-4 border-white/14">
              <span className="text-[10px] font-mono text-[#1DB954] uppercase font-bold">Night Listener Ratio</span>
              <h3 className="text-xl font-black text-white mt-1">
                {features.nightListenerRatio}% <span className="text-xs font-normal text-gray-400">night streams</span>
              </h3>
              <p className="text-[11px] text-gray-400 mt-1">
                Peak hour: {features.peakListeningHour}:00 UTC
              </p>
            </GlassCard>

            <GlassCard variant="interactive" radius="2xl" className="p-4 border-white/14">
              <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">Artist Loyalty</span>
              <h3 className="text-xl font-black text-white mt-1">
                {features.artistLoyalty} <span className="text-xs font-normal text-gray-400">unique ratio</span>
              </h3>
              <p className="text-[11px] text-gray-400 mt-1">
                Lower = higher repeat listening
              </p>
            </GlassCard>

            <GlassCard variant="interactive" radius="2xl" className="p-4 border-white/14">
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Avg Artist Popularity</span>
              <h3 className="text-xl font-black text-white mt-1">
                {features.avgArtistPopularity}% <span className="text-xs font-normal text-gray-400">mainstream</span>
              </h3>
              <p className="text-[11px] text-gray-400 mt-1">
                Average across top 50 artists
              </p>
            </GlassCard>

            <GlassCard variant="interactive" radius="2xl" className="p-4 border-white/14">
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">Genre Stability</span>
              <h3 className="text-xl font-black text-white mt-1">
                {features.genreSpreadAcrossTimeRanges.stabilityScore} <span className="text-xs font-normal text-gray-400">Jaccard score</span>
              </h3>
              <p className="text-[11px] text-gray-400 mt-1">
                Short vs Long term genre overlap ({features.genreSpreadAcrossTimeRanges.overlapCount} shared)
              </p>
            </GlassCard>

            <GlassCard variant="interactive" radius="2xl" className="p-4 border-white/14">
              <span className="text-[10px] font-mono text-pink-400 uppercase font-bold">Recency Concentration</span>
              <h3 className="text-xl font-black text-white mt-1">
                {features.recencyConcentration} <span className="text-xs font-normal text-gray-400">overlap ratio</span>
              </h3>
              <p className="text-[11px] text-gray-400 mt-1">
                Recently played tracks present in top tracks
              </p>
            </GlassCard>
          </div>

          {/* Raw JSON Debug Container */}
          <GlassCard
            variant="elevated"
            radius="3xl"
            enableRefraction={true}
            refractionIntensity="intense"
            className="p-6 border-white/20 bg-black/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#1DB954]">
                <Terminal className="w-4 h-4" />
                <span>API Endpoint: /api/analysis/features</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                <span>Sample Counts:</span>
                <span className="text-white">
                  {data?.sampleCounts?.topTracksCount} tracks | {data?.sampleCounts?.topArtistsCount} artists | {data?.sampleCounts?.recentlyPlayedCount} recent
                </span>
              </div>
            </div>

            <pre className="p-4 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[500px] leading-relaxed">
              {JSON.stringify(data, null, 2)}
            </pre>
          </GlassCard>
        </div>
      )}
    </main>
  );
}
