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
import { GlassButton } from "@/components/ui/GlassButton";
import { NarrativeLoading } from "./NarrativeLoading";
import { OceanScoresResult } from "@/lib/oceanScoring";
import { ClusterDistribution } from "@/lib/genreClusters";
import { NarrativeProfile } from "@/lib/narrativePrompt";
import { 
  BrainCircuit, 
  Sparkles, 
  HelpCircle,
  Compass,
  CheckCircle2,
  Zap,
  Heart,
  Activity,
  Share2,
  Check,
  Lightbulb,
  AlertCircle
} from "lucide-react";

export const PersonalityTab: React.FC = () => {
  const [data, setData] = useState<{
    narrative: NarrativeProfile;
    clusters: ClusterDistribution;
    ocean: OceanScoresResult;
    disclaimer: string;
    isAiGenerated?: boolean;
    user?: { name: string };
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchNarrativeProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/analysis/narrative");
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to generate AI personality narrative");
        }
        const json = await res.json();
        if (isMounted) {
          setData(json);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "An unexpected error occurred while analyzing listening personality");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchNarrativeProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleShareProfile = () => {
    if (!data) return;
    const textToCopy = `🎵 SpotiGlory AI Music Personality Profile 🎵\n\nPersona: ${data.narrative.listeningPersona}\nHeadline: "${data.narrative.headline}"\n\n${data.narrative.summary}\n\nBig Five OCEAN Scores:\n- Openness: ${data.ocean.openness.score}/100\n- Conscientiousness: ${data.ocean.conscientiousness.score}/100\n- Extraversion: ${data.ocean.extraversion.score}/100\n- Agreeableness: ${data.ocean.agreeableness.score}/100\n- Neuroticism: ${data.ocean.neuroticism.score}/100\n\nExplore yours on SpotiGlory!`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (isLoading) {
    return <NarrativeLoading />;
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-3xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
        <span>{error || "Failed to load personality profile"}</span>
      </div>
    );
  }

  const ocean = data.ocean;
  const clusters = data.clusters;
  const narrative = data.narrative;

  // Format data for Recharts RadarChart
  const radarData = [
    { trait: "Openness", score: ocean.openness.score, fullMark: 100 },
    { trait: "Conscientiousness", score: ocean.conscientiousness.score, fullMark: 100 },
    { trait: "Extraversion", score: ocean.extraversion.score, fullMark: 100 },
    { trait: "Agreeableness", score: ocean.agreeableness.score, fullMark: 100 },
    { trait: "Neuroticism", score: ocean.neuroticism.score, fullMark: 100 },
  ];

  // Map AI insights back to traits
  const getInsightForTrait = (traitName: string, fallbackDesc: string) => {
    const found = narrative.traits?.find((t) => t.trait.toLowerCase() === traitName.toLowerCase());
    return found?.insight || fallbackDesc;
  };

  const traitList = [
    {
      data: ocean.openness,
      insight: getInsightForTrait("Openness", ocean.openness.description),
      icon: <Compass className="w-5 h-5 text-cyan-400" />,
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
      barColor: "bg-cyan-400",
    },
    {
      data: ocean.conscientiousness,
      insight: getInsightForTrait("Conscientiousness", ocean.conscientiousness.description),
      icon: <CheckCircle2 className="w-5 h-5 text-purple-400" />,
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      barColor: "bg-purple-400",
    },
    {
      data: ocean.extraversion,
      insight: getInsightForTrait("Extraversion", ocean.extraversion.description),
      icon: <Zap className="w-5 h-5 text-[#1DB954]" />,
      badgeColor: "bg-[#1DB954]/20 text-[#1DB954] border-[#1DB954]/40",
      barColor: "bg-[#1DB954]",
    },
    {
      data: ocean.agreeableness,
      insight: getInsightForTrait("Agreeableness", ocean.agreeableness.description),
      icon: <Heart className="w-5 h-5 text-pink-400" />,
      badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/40",
      barColor: "bg-pink-400",
    },
    {
      data: ocean.neuroticism,
      insight: getInsightForTrait("Neuroticism", ocean.neuroticism.description),
      icon: <Activity className="w-5 h-5 text-amber-400" />,
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      barColor: "bg-amber-400",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Hero AI Narrative Card */}
      <GlassCard
        variant="elevated"
        radius="3xl"
        enableRefraction={true}
        refractionIntensity="intense"
        className="p-8 border-purple-500/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_50px_rgba(168,85,247,0.25)] relative overflow-hidden"
      >
        {/* Glow Element */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            {/* Persona Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold tracking-wider uppercase mb-3 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>{narrative.listeningPersona || "The Sonic Explorer"}</span>
              {data.isAiGenerated && (
                <span className="text-[10px] text-[#1DB954] font-normal lowercase">(Claude 3.7 AI)</span>
              )}
            </div>

            {/* Headline */}
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight mb-3">
              "{narrative.headline}"
            </h2>

            {/* Summary */}
            <p className="text-sm text-gray-300 leading-relaxed max-w-3xl">
              {narrative.summary}
            </p>
          </div>

          {/* Share Profile Button */}
          <GlassButton
            variant="primary"
            size="lg"
            onClick={handleShareProfile}
            leftIcon={copied ? <Check className="w-4 h-4 text-black" /> : <Share2 className="w-4 h-4 text-black" />}
            className="shrink-0 font-bold text-xs shadow-[0_0_20px_rgba(29,185,84,0.6)]"
          >
            {copied ? "Profile Copied!" : "Share Your Profile"}
          </GlassButton>
        </div>
      </GlassCard>

      {/* 2. Research Disclaimer Alert */}
      <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 backdrop-blur-xl text-left flex items-start gap-3 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
        <HelpCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wide flex items-center gap-2">
            <span>Rentfrow & Gosling MUSIC Preference Model</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-[9px] font-mono border border-purple-500/30">
              RESEARCH DISCLAIMER
            </span>
          </h4>
          <p className="text-xs text-purple-300/90 mt-1 leading-relaxed">
            {data.disclaimer}
          </p>
        </div>
      </div>

      {/* 3. Main Grid: Radar Chart + MUSIC Model Clusters */}
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

      {/* 4. 5 OCEAN Trait Cards Matrix with Claude Insights */}
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

                {/* Claude AI Insight text */}
                <p className="text-xs text-gray-300 leading-relaxed">
                  {item.insight}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400 font-mono">
                <span>AI Trait Analysis</span>
                <span className="text-[#1DB954]">Grounded</span>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* 5. Fun Facts Section */}
      {narrative.funFacts && narrative.funFacts.length > 0 && (
        <GlassCard variant="elevated" radius="3xl" className="p-6 border-white/18">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10 mb-4">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-none">Fun Facts About Your Listening</h3>
              <p className="text-xs text-gray-400 mt-0.5">Data-driven observations from your Spotify signals</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {narrative.funFacts.map((fact, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col gap-2 hover:bg-white/[0.08] transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-mono font-bold text-xs">
                  #{idx + 1}
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{fact}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};
