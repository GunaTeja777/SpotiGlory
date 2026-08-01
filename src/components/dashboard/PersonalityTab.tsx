"use client";

import React, { useState, useEffect } from "react";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassSkeleton } from "./GlassSkeleton";
import { OceanScoresResult } from "@/lib/oceanScoring";
import { ClusterDistribution } from "@/lib/genreClusters";
import { 
  BrainCircuit, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  HelpCircle,
  TrendingUp,
  Compass,
  CheckCircle2,
  Zap,
  Heart,
  Activity
} from "lucide-react";

export const PersonalityTab: React.FC = () => {
  const [data, setData] = useState<{
    clusters: ClusterDistribution;
    ocean: OceanScoresResult;
    disclaimer: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPersonality = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/analysis/ocean");
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to compute personality profile");
        }
        const json = await res.json();
        if (isMounted) {
          setData(json);
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

    fetchPersonality();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="p-6 rounded-3xl bg-white/[0.05] border border-white/10 flex flex-col gap-4">
          <GlassSkeleton className="w-48 h-6 rounded-lg" />
          <GlassSkeleton className="w-full h-80 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 flex flex-col gap-2">
              <GlassSkeleton className="w-32 h-5 rounded" />
              <GlassSkeleton className="w-full h-3 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-3xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
        <span>{error || "Failed to load personality radar analysis"}</span>
      </div>
    );
  }

  const ocean = data.ocean;
  const clusters = data.clusters;

  // Format data for Recharts RadarChart
  const radarData = [
    { trait: "Openness", score: ocean.openness.score, fullMark: 100 },
    { trait: "Conscientiousness", score: ocean.conscientiousness.score, fullMark: 100 },
    { trait: "Extraversion", score: ocean.extraversion.score, fullMark: 100 },
    { trait: "Agreeableness", score: ocean.agreeableness.score, fullMark: 100 },
    { trait: "Neuroticism", score: ocean.neuroticism.score, fullMark: 100 },
  ];

  const traitList = [
    {
      data: ocean.openness,
      icon: <Compass className="w-5 h-5 text-cyan-400" />,
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
      barColor: "bg-cyan-400",
    },
    {
      data: ocean.conscientiousness,
      icon: <CheckCircle2 className="w-5 h-5 text-purple-400" />,
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      barColor: "bg-purple-400",
    },
    {
      data: ocean.extraversion,
      icon: <Zap className="w-5 h-5 text-[#1DB954]" />,
      badgeColor: "bg-[#1DB954]/20 text-[#1DB954] border-[#1DB954]/40",
      barColor: "bg-[#1DB954]",
    },
    {
      data: ocean.agreeableness,
      icon: <Heart className="w-5 h-5 text-pink-400" />,
      badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/40",
      barColor: "bg-pink-400",
    },
    {
      data: ocean.neuroticism,
      icon: <Activity className="w-5 h-5 text-amber-400" />,
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      barColor: "bg-amber-400",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Disclaimer Header Alert */}
      <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 backdrop-blur-xl text-left flex items-start gap-3 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
        <HelpCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wide flex items-center gap-2">
            <span>Rentfrow & Gosling MUSIC Preference Model</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-[9px] font-mono border border-purple-500/30">
              EMPIRICAL ALGORITHM
            </span>
          </h4>
          <p className="text-xs text-purple-300/90 mt-1 leading-relaxed">
            {data.disclaimer}
          </p>
        </div>
      </div>

      {/* Main Grid: Radar Chart + Cluster Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart Container */}
        <div className="lg:col-span-7">
          <GlassCard
            variant="elevated"
            radius="3xl"
            enableRefraction={true}
            refractionIntensity="intense"
            className="p-6 border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(29,185,84,0.15)] flex flex-col justify-between min-h-[420px]"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center">
                    <BrainCircuit className="w-5 h-5 text-[#1DB954]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-none">OCEAN Personality Radar</h3>
                    <p className="text-xs text-gray-400 mt-1">Big Five Trait Spectrum (0-100)</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono text-[#1DB954]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Interactive Radar</span>
                </div>
              </div>

              {/* Recharts Radar Graphic */}
              <div className="w-full h-80 my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="rgba(255, 255, 255, 0.15)" />
                    <PolarAngleAxis
                      dataKey="trait"
                      stroke="#E2E8F0"
                      tick={{ fill: "#E2E8F0", fontSize: 12, fontWeight: 700 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255, 255, 255, 0.3)" />
                    <Radar
                      name="OCEAN Trait Score"
                      dataKey="score"
                      stroke="#1DB954"
                      fill="#1DB954"
                      fillOpacity={0.45}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400 font-mono">
              <span>Normalized Psychometric Mapping</span>
              <span className="text-[#1DB954]">5 Dimensions Evaluated</span>
            </div>
          </GlassCard>
        </div>

        {/* MUSIC Model Genre Clusters Breakdown */}
        <div className="lg:col-span-5">
          <GlassCard
            variant="elevated"
            radius="3xl"
            enableRefraction={true}
            refractionIntensity="medium"
            className="p-6 border-white/18 h-full flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-none">MUSIC Model Clusters</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Rentfrow & Gosling 4-Cluster Split</p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] border border-purple-500/30 uppercase">
                  DOMINANT: {clusters.dominantCluster}
                </span>
              </div>

              {/* Cluster Progress Bars */}
              <div className="flex flex-col gap-4 my-2">
                {[
                  { key: "Reflective & Complex", pct: clusters.reflectiveComplex, color: "bg-cyan-400", desc: "Jazz, Folk, Classical, World" },
                  { key: "Intense & Rebellious", pct: clusters.intenseRebellious, color: "bg-amber-400", desc: "Rock, Metal, Punk, Alternative" },
                  { key: "Upbeat & Conventional", pct: clusters.upbeatConventional, color: "bg-pink-400", desc: "Pop, Country, Soundtracks" },
                  { key: "Energetic & Rhythmic", pct: clusters.energeticRhythmic, color: "bg-[#1DB954]", desc: "Hip-hop, EDM, House, R&B" },
                ].map((item) => (
                  <div key={item.key} className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>{item.key}</span>
                      <span className="font-mono text-purple-300">{item.pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                        style={{ width: `${Math.max(4, item.pct)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
              <span>Cluster Classifier</span>
              <span className="text-purple-400 font-mono">Keyword Substring Match</span>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* 5 OCEAN Trait Cards Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {traitList.map((item) => {
          const t = item.data;
          return (
            <GlassCard
              key={t.trait}
              variant="interactive"
              radius="3xl"
              enableRefraction={true}
              refractionIntensity="medium"
              className="p-5 border-white/14 flex flex-col justify-between group hover:border-white/30 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {t.label} ({t.score}/100)
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight">
                  {t.trait}
                </h3>

                {/* Score Progress Bar */}
                <div className="w-full h-2 rounded-full bg-white/10 my-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.barColor}`}
                    style={{ width: `${Math.max(5, t.score)}%` }}
                  />
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  {t.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400 font-mono">
                <span>Weighted Formula</span>
                <span className="text-[#1DB954]">Verified</span>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
