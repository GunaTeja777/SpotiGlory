"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  BarChart3, 
  Moon, 
  BrainCircuit, 
  Waves, 
  Clock, 
  Share2,
  Sparkles
} from "lucide-react";

export const FeatureGridSection: React.FC = () => {
  const features = [
    {
      id: "genre-diversity",
      icon: <BarChart3 className="w-6 h-6 text-[#1DB954]" />,
      title: "Genre Diversity Index",
      description: "Measure your taste breadth vs niche depth. Discover whether you're a mainstream hit-chaser or an underground archivist.",
      tag: "Deep Taxonomy",
      badgeColor: "bg-[#1DB954]/15 text-[#1DB954] border-[#1DB954]/30",
      visual: (
        <div className="mt-4 flex flex-col gap-2 p-3 rounded-2xl bg-black/30 border border-white/10">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-gray-400">Synthwave & Cyber</span>
            <span className="text-[#1DB954] font-bold">42%</span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-[#1DB954] to-emerald-400 h-full rounded-full w-[42%]" />
          </div>
          <div className="flex justify-between text-xs font-mono pt-1">
            <span className="text-gray-400">Indie Dream Pop</span>
            <span className="text-purple-400 font-bold">31%</span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full w-[31%]" />
          </div>
        </div>
      ),
    },
    {
      id: "temporal-patterns",
      icon: <Moon className="w-6 h-6 text-indigo-400" />,
      title: "Night-Owl vs Early-Bird",
      description: "Temporal analysis tracking your exact peak listening hours, midnight mood spikes, and daily acoustic circadian flow.",
      tag: "Circadian Clock",
      badgeColor: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
      visual: (
        <div className="mt-4 flex items-center justify-between p-3 rounded-2xl bg-black/30 border border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Peak Hours: 1:30 AM</p>
              <p className="text-[10px] text-gray-400">Night-Owl Trait: 94th percentile</p>
            </div>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300">
            LATE VIBES
          </span>
        </div>
      ),
    },
    {
      id: "ocean-insights",
      icon: <BrainCircuit className="w-6 h-6 text-purple-400" />,
      title: "OCEAN Personality Radar",
      description: "Maps acoustic traits (valence, energy, acousticness, instrumentalness) into Big-Five psychological personality vectors.",
      tag: "AI Psychology",
      badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
      visual: (
        <div className="mt-4 grid grid-cols-2 gap-2 p-3 rounded-2xl bg-black/30 border border-white/10 text-xs">
          <div className="p-2 rounded-xl bg-white/[0.04] border border-white/5">
            <span className="text-gray-400 text-[10px] block">Openness</span>
            <span className="text-purple-300 font-bold font-mono text-sm">92% High</span>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.04] border border-white/5">
            <span className="text-gray-400 text-[10px] block">Extroversion</span>
            <span className="text-emerald-300 font-bold font-mono text-sm">68% Medium</span>
          </div>
        </div>
      ),
    },
    {
      id: "audio-dna",
      icon: <Waves className="w-6 h-6 text-cyan-400" />,
      title: "Audio DNA & Mood Matrix",
      description: "Unpack harmonic keys, tempo BPM distributions, and danceability vectors to reveal your core emotional sonic signature.",
      tag: "Acoustic Physics",
      badgeColor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
      visual: (
        <div className="mt-4 p-3 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-around">
          <div className="text-center">
            <span className="text-[10px] text-gray-400 block">Avg BPM</span>
            <span className="text-sm font-bold font-mono text-cyan-300">124 BPM</span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="text-center">
            <span className="text-[10px] text-gray-400 block">Key Mode</span>
            <span className="text-sm font-bold font-mono text-white">F# Minor</span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="text-center">
            <span className="text-[10px] text-gray-400 block">Valence</span>
            <span className="text-sm font-bold font-mono text-[#1DB954]">78% High</span>
          </div>
        </div>
      ),
    },
    {
      id: "era-nostalgia",
      icon: <Clock className="w-6 h-6 text-amber-400" />,
      title: "Decade Nostalgia Engine",
      description: "Travel through musical time. Uncover whether your soul belongs in 80s synth, 90s grunge, 2000s indie, or modern hyperpop.",
      tag: "Time Machine",
      badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      visual: (
        <div className="mt-4 p-3 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-between text-xs">
          <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-bold">
            Dominant: 80s & 2010s
          </span>
          <span className="text-gray-400 font-mono text-[11px]">84% Match</span>
        </div>
      ),
    },
    {
      id: "shareable-cards",
      icon: <Share2 className="w-6 h-6 text-emerald-400" />,
      title: "Liquid Aura Share Cards",
      description: "Generate stunning glass aesthetic infographic cards tailored for Instagram Stories, X, and Spotify social sharing.",
      tag: "Social Ready",
      badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      visual: (
        <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-[#1DB954]/20 to-purple-600/20 border border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#1DB954]" />
            <span className="text-xs font-bold text-white">4K Glass Export</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
            One-Tap Share
          </span>
        </div>
      ),
    },
  ];

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section id="features" className="py-20 md:py-28 px-4 md:px-8 max-w-7xl mx-auto relative z-10 scroll-mt-20">
      {/* Section Title */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-mono font-bold tracking-widest text-[#1DB954] uppercase px-3 py-1 rounded-full bg-[#1DB954]/10 border border-[#1DB954]/20 inline-block mb-3">
          Comprehensive Music Analytics
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Everything Your Music <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-white via-emerald-200 to-[#1DB954] bg-clip-text text-transparent">
            Says About You
          </span>
        </h2>
        <p className="mt-4 text-base text-gray-300">
          Powered by advanced acoustic signal processing and Big Five psychological mapping models.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
      >
        {features.map((feat) => (
          <motion.div key={feat.id} variants={itemVariants}>
            <GlassCard
              variant="interactive"
              radius="3xl"
              enableRefraction={true}
              refractionIntensity="medium"
              className="p-7 h-full flex flex-col justify-between border-white/14 hover:border-white/30 transition-all duration-300 group"
            >
              <div>
                {/* Header Tag & Icon */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {feat.icon}
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${feat.badgeColor}`}
                  >
                    {feat.tag}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#1DB954] transition-colors">
                  {feat.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-300 leading-relaxed">
                  {feat.description}
                </p>
              </div>

              {/* Micro Visual Card Preview */}
              {feat.visual}
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};
