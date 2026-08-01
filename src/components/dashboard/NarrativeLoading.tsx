"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { BrainCircuit, Sparkles } from "lucide-react";

const LOADING_MESSAGES = [
  "Analyzing your genre diversity & Shannon entropy...",
  "Mapping your 24-hour circadian listening clock...",
  "Evaluating your Big Five OCEAN personality traits...",
  "Synthesizing your AI music personality narrative...",
  "Formatting sonic archetype and fun facts...",
];

export const NarrativeLoading: React.FC = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto py-8">
      <GlassCard
        variant="elevated"
        radius="3xl"
        enableRefraction={true}
        refractionIntensity="intense"
        className="p-10 border-purple-500/30 text-center shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(168,85,247,0.3)] flex flex-col items-center justify-center relative overflow-hidden"
      >
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

        {/* Animated Icon */}
        <div className="relative w-20 h-20 rounded-3xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.5)]">
          <BrainCircuit className="w-10 h-10 text-purple-300 animate-spin duration-3000" />
          <Sparkles className="w-5 h-5 text-purple-400 absolute -top-2 -right-2 animate-bounce" />
        </div>

        <h3 className="text-xl font-black text-white tracking-tight mb-3">
          Synthesizing AI Personality Profile
        </h3>

        {/* Rotating Message */}
        <div className="h-8 flex items-center justify-center">
          <p className="text-xs font-mono text-purple-300 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
            {LOADING_MESSAGES[currentMessageIndex]}
          </p>
        </div>

        {/* Shimmer Bar */}
        <div className="w-full max-w-xs h-1.5 rounded-full bg-white/10 overflow-hidden mt-6 relative">
          <div className="h-full rounded-full bg-gradient-to-r from-purple-500 via-[#1DB954] to-cyan-400 animate-pulse w-full" />
        </div>
      </GlassCard>
    </div>
  );
};
