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
import { OceanScoresResult, explainTraitScore } from "@/lib/oceanScoring";
import { ClusterDistribution } from "@/lib/genreClusters";
import { NarrativeProfile } from "@/lib/narrativePrompt";
import { saveTraitFeedbackSample, FeedbackRating, getTraitFeedbackSamples } from "@/lib/feedbackStore";
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
  AlertCircle,
  BookOpen,
  Users,
  Globe,
  Scale,
  Music,
  ShieldAlert
} from "lucide-react";

interface ResearchInsight {
  key: string;
  title: string;
  source: string;
  description: string;
  metadata?: {
    age: string;
    region: string;
    gender: string;
  };
}

const BACKING_ICONS: Record<string, React.ReactNode> = {
  personality: <Users className="w-4 h-4 text-cyan-400" />,
  demographics: <Globe className="w-4 h-4 text-purple-400" />,
  values: <Scale className="w-4 h-4 text-pink-400" />,
  mood: <Activity className="w-4 h-4 text-amber-400" />,
  nlp: <Music className="w-4 h-4 text-[#1DB954]" />,
  privacy: <ShieldAlert className="w-4 h-4 text-red-400" />,
};

const RESEARCH_INSIGHTS: ResearchInsight[] = [
  {
    key: "personality",
    title: "Personality Traits (Big Five)",
    source: "Spotify Research • Lindenwood University",
    description: "Spotify Research shows personality is detectable from listening logs without self-reporting. High conscientiousness concentrates listening into narrow time windows; extraverts favor social playlists; introverts explore individual artist catalogs deeply. These links are cross-culturally validated across 53 countries."
  },
  {
    key: "demographics",
    title: "Demographics Inference",
    source: "Last.fm Listening Logs Study",
    description: "Age, gender, and nationality can be predicted from listening logs. Algorithms analyze temporal patterns and audio-derived features alongside collaborative filtering to infer demographic attributes reliably.",
    metadata: {
      age: "26-35 (Eclectic Contemporary)",
      region: "Global / Anglosphere Broad Affinity",
      gender: "Balanced Cognitive Fluidity"
    }
  },
  {
    key: "values",
    title: "Values & Moral Leanings",
    source: "arXiv Psychometrics Literature",
    description: "Musical taste is strongly tied to personal values, political orientation, and sophistication. Passive listening histories allow reliable inference of demographics, while moral values represent a more complex, multi-layered signal."
  },
  {
    key: "mood",
    title: "Mood & Emotion Regulation",
    source: "arXiv Affective Computing",
    description: "Listeners actively manage and regulate their emotional states through tailored playlists. This active regulation pattern is highly correlated with core personality traits, allowing real-time mood estimation."
  },
  {
    key: "nlp",
    title: "Lyrics + Audio NLP Fusion",
    source: "University of California Press (2023)",
    description: "Combining acoustic features with natural language processing (NLP) of lyrics significantly boosts prediction accuracy of Big Five personality attributes, capturing nuances at both domain and facet levels."
  },
  {
    key: "privacy",
    title: "Privacy & The 'Attack' Framing",
    source: "arXiv Offensive Security Study",
    description: "Security literature highlights that public playlist-level attributes encode sensitive personal lifestyle habits and personality traits, showing that attributes can be recovered without access to private histories."
  }
];

export const PersonalityTab: React.FC = () => {
  const [data, setData] = useState<{
    narrative: NarrativeProfile;
    clusters: ClusterDistribution;
    ocean: OceanScoresResult;
    disclaimer: string;
    isAiGenerated?: boolean;
    scientificBacking?: ResearchInsight[];
    telemetry?: {
      latencyMs: number;
      tokenCount: number;
      estimatedCostUsd: number;
      promptVersion: string;
      modelUsed: string;
    };
    user?: { name: string };
    features?: any;
  } | null>(null);
  const [expandedResearch, setExpandedResearch] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [submittedRatings, setSubmittedRatings] = useState<Record<string, FeedbackRating>>({});
  const [expandedDrawers, setExpandedDrawers] = useState<Record<string, boolean>>({});

  const toggleResearch = (key: string) => {
    setExpandedResearch((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleDrawer = (traitKey: string) => {
    setExpandedDrawers((prev) => ({ ...prev, [traitKey]: !prev[traitKey] }));
  };

  useEffect(() => {
    const existing = getTraitFeedbackSamples();
    const map: Record<string, FeedbackRating> = {};
    existing.forEach((s) => {
      map[s.trait] = s.rating;
    });
    setSubmittedRatings(map);
  }, []);

  const handleFeedback = (
    traitKey: "openness" | "conscientiousness" | "extraversion" | "agreeableness" | "neuroticism",
    score: number,
    rating: FeedbackRating
  ) => {
    saveTraitFeedbackSample(traitKey, score, rating);
    setSubmittedRatings((prev) => ({ ...prev, [traitKey]: rating }));
  };

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

  const backing = data.scientificBacking || RESEARCH_INSIGHTS;

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
      key: "openness" as const,
      data: ocean.openness,
      insight: getInsightForTrait("Openness", ocean.openness.description),
      icon: <Compass className="w-5 h-5 text-cyan-400" />,
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
      barColor: "bg-cyan-400",
    },
    {
      key: "conscientiousness" as const,
      data: ocean.conscientiousness,
      insight: getInsightForTrait("Conscientiousness", ocean.conscientiousness.description),
      icon: <CheckCircle2 className="w-5 h-5 text-purple-400" />,
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      barColor: "bg-purple-400",
    },
    {
      key: "extraversion" as const,
      data: ocean.extraversion,
      insight: getInsightForTrait("Extraversion", ocean.extraversion.description),
      icon: <Zap className="w-5 h-5 text-[#1DB954]" />,
      badgeColor: "bg-[#1DB954]/20 text-[#1DB954] border-[#1DB954]/40",
      barColor: "bg-[#1DB954]",
    },
    {
      key: "agreeableness" as const,
      data: ocean.agreeableness,
      insight: getInsightForTrait("Agreeableness", ocean.agreeableness.description),
      icon: <Heart className="w-5 h-5 text-pink-400" />,
      badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/40",
      barColor: "bg-pink-400",
    },
    {
      key: "neuroticism" as const,
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
        className="p-5 sm:p-8 border-purple-500/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_50px_rgba(168,85,247,0.25)] relative overflow-hidden"
      >
        {/* Glow Element */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            {/* Persona Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold tracking-wider uppercase mb-3 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <BrainCircuit className="w-3.5 h-3.5 text-purple-300" />
              <span>{narrative.listeningPersona || "The Sonic Explorer"}</span>
              {data.isAiGenerated && (
                <span className="text-[10px] text-[#1DB954] font-normal lowercase">(OpenRouter GenAI)</span>
              )}
            </div>

            {/* Distinct Taste Signature Headline */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight mb-2">
              What Makes Your Music Taste Unique
            </h2>

            {/* Dedicated Unique Signature Box */}
            <div className="p-4 rounded-2xl bg-[#1DB954]/10 border border-[#1DB954]/30 flex items-start gap-3.5 shadow-[0_0_20px_rgba(29,185,84,0.15)] my-3">
              <div className="w-8 h-8 rounded-xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center shrink-0 mt-0.5">
                <Compass className="w-4 h-4 text-[#1DB954]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-white">Sonic Fingerprint & Contrast Analysis</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#1DB954]/20 text-[#1DB954] text-[10px] font-mono font-bold border border-[#1DB954]/30">
                    DISTINCT PROFILE
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-medium">
                  {narrative.uniqueSignature || narrative.summary}
                </p>
              </div>
            </div>

            {/* GenAI Telemetry Observability Bar */}
            {data.telemetry && (
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 pt-3 border-t border-white/10 text-[10px] font-mono text-purple-300/80">
                <span>Prompt {data.telemetry.promptVersion}</span>
                <span>•</span>
                <span>{data.telemetry.latencyMs}ms latency</span>
                {data.telemetry.tokenCount > 0 && (
                  <>
                    <span>•</span>
                    <span>~{data.telemetry.tokenCount} tokens (${data.telemetry.estimatedCostUsd})</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Share Profile Button */}
          <GlassButton
            variant="primary"
            size="lg"
            onClick={handleShareProfile}
            leftIcon={copied ? <Check className="w-4 h-4 text-black" /> : <Share2 className="w-4 h-4 text-black" />}
            className="w-full sm:w-auto shrink-0 font-bold text-xs shadow-[0_0_20px_rgba(29,185,84,0.6)]"
          >
            {copied ? "Profile Copied!" : "Share Your Profile"}
          </GlassButton>
        </div>
      </GlassCard>

      {/* 2. Scientific Foundation & Spotify Research (Dynamic Interactive 3x2 Grid) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Scientific Foundation & Empirical Evidence</h3>
          </div>
          <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider hidden sm:inline font-bold">
            Spotify Research & Psychometrics
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {backing.map((item) => {
            return (
              <GlassCard
                key={item.key}
                variant="interactive"
                radius="2xl"
                className="p-5 border-white/10 flex flex-col justify-between gap-4 group transition-all duration-300 relative overflow-hidden text-left"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl pointer-events-none" />

                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                      {BACKING_ICONS[item.key] || <BookOpen className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider font-semibold truncate max-w-[150px]">
                      {item.source}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-bold text-white group-hover:text-[#1DB954] transition-colors leading-tight">
                    {item.title}
                  </h4>

                  {/* Description or Eye-Catching Metadata Badges for Demographics */}
                  {item.key === "demographics" && item.metadata ? (
                    <div className="mt-3.5 flex flex-col gap-2">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.05)]">
                        <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider font-bold">Chronotype</span>
                        <span className="text-[10px] font-bold text-white px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30">
                          {item.metadata.age}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.05)]">
                        <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider font-bold">Peak Window</span>
                        <span className="text-[10px] font-bold text-white px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30">
                          {item.metadata.region}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-pink-500/10 border border-pink-500/20 shadow-[0_0_10px_rgba(244,63,94,0.05)]">
                        <span className="text-[10px] font-mono text-pink-300 uppercase tracking-wider font-bold">Late-Night Ratio</span>
                        <span className="text-[10px] font-bold text-white px-2.5 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/30">
                          {item.metadata.gender}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 italic mt-1 leading-normal">
                        {item.description}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3.5">
                      <span className="text-[10px] font-mono text-[#1DB954] block mb-1 font-bold">✓ REAL-TIME ESTIMATION:</span>
                      <p className="text-[11px] text-gray-300 leading-relaxed font-medium">
                        {item.description}
                      </p>
                    </div>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Research Disclaimer Alert embedded contextually */}
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 leading-relaxed font-medium">
          <strong>MUSIC Model Research Disclaimer:</strong> {data.disclaimer}
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
              <div className="w-full h-84 my-2 relative">
                {/* Background Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#1DB954]/15 rounded-full blur-3xl pointer-events-none" />

                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <defs>
                      <radialGradient id="oceanRadarGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#1DB954" stopOpacity="0.75" />
                        <stop offset="100%" stopColor="#059669" stopOpacity="0.25" />
                      </radialGradient>
                    </defs>
                    <PolarGrid stroke="rgba(255, 255, 255, 0.15)" gridType="polygon" />
                    <PolarAngleAxis
                      dataKey="trait"
                      tick={({ payload, x, y, textAnchor }) => (
                        <text
                          x={x}
                          y={y}
                          textAnchor={textAnchor}
                          fill="#FFFFFF"
                          fontSize={12}
                          fontWeight={800}
                          className="font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                        >
                          {payload.value}
                        </text>
                      )}
                    />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="OCEAN Trait Score"
                      dataKey="score"
                      stroke="#1DB954"
                      strokeWidth={3}
                      fill="url(#oceanRadarGlow)"
                      fillOpacity={0.8}
                      dot={{ r: 4, fill: "#1DB954", stroke: "#FFFFFF", strokeWidth: 2 }}
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



      {/* 5. 5 OCEAN Trait Cards Matrix with Claude Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {traitList.map((item) => {
          const t = item.data;
          const contributions = data
            ? explainTraitScore(item.key, data.features || {}, data.clusters)
            : [];
          const topDriverSummary = contributions.length >= 2
            ? `driven ${contributions[0].percentage}% by ${contributions[0].featureName}, ${contributions[1].percentage}% by ${contributions[1].featureName}`
            : contributions.length === 1
            ? `driven ${contributions[0].percentage}% by ${contributions[0].featureName}`
            : "";

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

                {/* Expandable "Why this score?" Drawer */}
                <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-2">
                  <button
                    onClick={() => toggleDrawer(item.key)}
                    className="flex items-center justify-between text-xs font-mono text-purple-300 hover:text-white transition-colors"
                  >
                    <span className="flex items-center gap-1.5 font-bold">
                      <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                      <span>Why this score?</span>
                    </span>
                    <span className="text-[10px] text-gray-400 font-normal">
                      {expandedDrawers[item.key] ? "Hide Breakdown ▲" : "Show Drivers ▼"}
                    </span>
                  </button>

                  {/* Ranked Driver Summary Line */}
                  {topDriverSummary && (
                    <p className="text-[11px] text-gray-300 font-mono leading-tight">
                      <span className="font-bold text-white">{t.trait} ({t.score}/100)</span> — {topDriverSummary}
                    </p>
                  )}

                  {expandedDrawers[item.key] && contributions.length > 0 && (
                    <div className="mt-2 p-3 rounded-2xl bg-black/60 border border-white/10 flex flex-col gap-2.5">
                      {/* Horizontal Stacked Bar */}
                      <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden flex">
                        {contributions.map((c, i) => (
                          <div
                            key={i}
                            className={`h-full ${
                              i === 0 ? "bg-cyan-400" : i === 1 ? "bg-purple-400" : "bg-[#1DB954]"
                            }`}
                            style={{ width: `${c.percentage}%` }}
                            title={`${c.featureName}: ${c.percentage}%`}
                          />
                        ))}
                      </div>

                      {/* Ranked Feature List */}
                      <div className="flex flex-col gap-1.5">
                        {contributions.map((c, i) => (
                          <div key={i} className="flex items-center justify-between text-[11px] font-mono">
                            <span className="flex items-center gap-1.5 text-gray-300">
                              <span className={`w-2 h-2 rounded-full ${i === 0 ? "bg-cyan-400" : i === 1 ? "bg-purple-400" : "bg-[#1DB954]"}`} />
                              {c.featureName}
                            </span>
                            <span className="font-bold text-white">{c.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Liquid-Glass Feedback Row */}
                <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                    <span className="uppercase tracking-wider">Rating Feedback</span>
                    {submittedRatings[item.key] && (
                      <span className="text-[#1DB954] font-bold">Feedback Recorded ✓</span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleFeedback(item.key, t.score, "accurate")}
                      className={`px-2 py-1.5 rounded-xl border text-[11px] font-mono transition-all flex items-center justify-center gap-1 shadow-sm ${
                        submittedRatings[item.key] === "accurate"
                          ? "bg-[#1DB954]/30 border-[#1DB954] text-white font-bold shadow-[0_0_15px_rgba(29,185,84,0.4)]"
                          : "bg-white/[0.06] border-white/14 text-gray-200 hover:bg-[#1DB954]/20 hover:border-[#1DB954]/50 hover:text-white"
                      }`}
                    >
                      <span>Accurate</span>
                      <span>👍</span>
                    </button>

                    <button
                      onClick={() => handleFeedback(item.key, t.score, "somewhat")}
                      className={`px-2 py-1.5 rounded-xl border text-[11px] font-mono transition-all flex items-center justify-center gap-1 shadow-sm ${
                        submittedRatings[item.key] === "somewhat"
                          ? "bg-amber-500/30 border-amber-500 text-white font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                          : "bg-white/[0.06] border-white/14 text-gray-200 hover:bg-amber-500/20 hover:border-amber-500/50 hover:text-white"
                      }`}
                    >
                      <span>Somewhat</span>
                    </button>

                    <button
                      onClick={() => handleFeedback(item.key, t.score, "not_accurate")}
                      className={`px-2 py-1.5 rounded-xl border text-[11px] font-mono transition-all flex items-center justify-center gap-1 shadow-sm ${
                        submittedRatings[item.key] === "not_accurate"
                          ? "bg-red-500/30 border-red-500 text-white font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                          : "bg-white/[0.06] border-white/14 text-gray-200 hover:bg-red-500/20 hover:border-red-500/50 hover:text-white"
                      }`}
                    >
                      <span>Not accurate</span>
                      <span>👎</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400 font-mono">
                <span className="flex items-center gap-1.5 text-gray-300">
                  <span className={`w-1.5 h-1.5 rounded-full ${t.confidence === "high" ? "bg-[#1DB954]" : t.confidence === "medium" ? "bg-amber-400" : "bg-red-400"}`} />
                  {t.confidence ? `${t.confidence.toUpperCase()} CONFIDENCE (${t.reliabilityScore || 80}%)` : "GROUNDED"}
                </span>
                <span className="text-purple-300">v1.0.0 Model</span>
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
