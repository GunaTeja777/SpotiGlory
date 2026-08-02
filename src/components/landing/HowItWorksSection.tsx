"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { ShieldCheck, Cpu, Compass, ArrowRight } from "lucide-react";

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      step: "01",
      icon: <ShieldCheck className="w-6 h-6 text-[#1DB954]" />,
      title: "Connect",
      description: "Link your Spotify account securely in one click via official OAuth without sharing passwords.",
      gradient: "from-[#1DB954]/20 to-[#1DB954]/5",
      borderColor: "border-[#1DB954]/30",
    },
    {
      step: "02",
      icon: <Cpu className="w-6 h-6 text-purple-400" />,
      title: "Analyze",
      description: "Our AI engine parses your listening history, tempo preferences, acoustic traits, and timestamps.",
      gradient: "from-purple-500/20 to-purple-500/5",
      borderColor: "border-purple-500/30",
    },
    {
      step: "03",
      icon: <Compass className="w-6 h-6 text-emerald-400" />,
      title: "Discover",
      description: "Unlock your Big Five music personality radar, vibe clock, and shareable high-res liquid aura cards.",
      gradient: "from-emerald-400/20 to-emerald-400/5",
      borderColor: "border-emerald-400/30",
    },
  ];

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section id="how-it-works" className="py-20 md:py-28 px-4 md:px-8 max-w-7xl mx-auto relative z-10 scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-mono font-bold tracking-widest text-[#1DB954] uppercase px-3 py-1 rounded-full bg-[#1DB954]/10 border border-[#1DB954]/20 inline-block mb-3">
          3 Simple Steps
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          How SpotiGlory Works
        </h2>
        <p className="mt-3 text-base text-gray-300">
          Transform your raw Spotify audio stream into clear psychological insights in under 30 seconds.
        </p>
      </div>

      {/* 3-Step Glass Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative"
      >
        {steps.map((item, index) => (
          <motion.div key={item.step} variants={itemVariants} className="relative group">
            <GlassCard
              variant="interactive"
              radius="3xl"
              enableRefraction={true}
              refractionIntensity="medium"
              className="p-8 h-full flex flex-col justify-between border-white/14 group-hover:border-white/30 transition-all duration-300"
            >
              <div>
                {/* Step Badge & Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.gradient} border ${item.borderColor} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    {item.icon}
                  </div>
                  <span className="text-3xl font-black font-mono text-white/20 group-hover:text-[#1DB954]/60 transition-colors">
                    {item.step}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-2.5 flex items-center gap-2">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-300 leading-relaxed">
                  {item.description}
                </p>
              </div>

            </GlassCard>

            {/* Connecting Indicator Arrow for desktop (outside GlassCard so overflow-hidden does not clip it) */}
            {index < steps.length - 1 && (
              <div className="hidden lg:flex absolute -right-5 lg:-right-6 top-1/2 -translate-y-1/2 z-30 pointer-events-none items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-[#0A0A0C] border border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.9)] flex items-center justify-center text-gray-400 backdrop-blur-md">
                  <ArrowRight className="w-4 h-4 text-[#1DB954]" />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};
