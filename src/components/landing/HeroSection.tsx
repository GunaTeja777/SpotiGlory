"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { SpotifyIcon } from "./LandingNav";
import { Play, Sparkles, ArrowRight, Activity, Zap, Compass, Music, Flame } from "lucide-react";

export const HeroSection: React.FC = () => {
  // Parallax Tilt State for Mockup Card
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for fluid 3D parallax motion
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), {
    damping: 25,
    stiffness: 200,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), {
    damping: 25,
    stiffness: 200,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const currentMouseX = (e.clientX - rect.left) / width - 0.5;
    const currentMouseY = (e.clientY - rect.top) / height - 0.5;
    mouseX.set(currentMouseX);
    mouseY.set(currentMouseY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section className="relative pt-8 pb-20 md:pt-16 md:pb-32 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Glow Orbs behind Hero */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-radial from-[#1DB954]/15 via-[#6B21A8]/10 to-transparent blur-3xl pointer-events-none rounded-full" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: Headline & Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}

          className="lg:col-span-7 flex flex-col gap-6 text-left z-10"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-[#1DB954]/30 backdrop-blur-md w-fit shadow-[0_0_15px_-3px_rgba(29,185,84,0.3)]">
            <Sparkles className="w-4 h-4 text-[#1DB954] animate-pulse" />
            <span className="text-xs font-semibold text-gray-200 tracking-wide">
              Next-Gen Spotify Personality Analytics
            </span>
          </div>

          {/* Large Bold Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
            Discover Your True <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-white via-gray-100 to-[#1DB954] bg-clip-text text-transparent">
              Music Personality
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl font-normal leading-relaxed">
            SpotiGlory transforms your Spotify listening history into an interactive liquid glass 
            OCEAN personality radar, temporal vibe clock, and acoustic identity profile.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/login">
              <GlassButton
                variant="primary"
                size="lg"
                leftIcon={<SpotifyIcon className="w-5 h-5 text-black" />}
                rightIcon={<ArrowRight className="w-4 h-4 text-black" />}
                className="font-bold text-base shadow-[0_0_30px_0_rgba(29,185,84,0.6)]"
              >
                Connect Spotify
              </GlassButton>
            </Link>

            <a href="#how-it-works">
              <GlassButton
                variant="ghost"
                size="lg"
                className="font-semibold text-base border-white/20 hover:border-white/40"
              >
                See how it works
              </GlassButton>
            </a>
          </div>

          {/* Mini Trust Stats Pill */}
          <div className="flex items-center gap-6 pt-4 text-xs font-medium text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#1DB954] animate-ping" />
              <span>Instant Readout</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">100% Secure</span> Spotify OAuth 2.0
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">No Password</span> Stored
            </div>
          </div>
        </motion.div>

        {/* Right Column: Floating Glass Mockup Card with 3D Parallax Tilt */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 35 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}

          className="lg:col-span-5 flex justify-center perspective-1000 z-10"
        >
          <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
            className="w-full max-w-md cursor-pointer group"
          >
            <GlassCard
              variant="elevated"
              radius="3xl"
              enableRefraction={true}
              refractionIntensity="intense"
              className="p-6 border-white/20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_0_rgba(29,185,84,0.2)] transition-shadow duration-500 hover:shadow-[0_35px_70px_-15px_rgba(0,0,0,0.9),0_0_50px_0_rgba(29,185,84,0.4)]"
            >
              {/* Mockup Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1DB954] to-emerald-300 flex items-center justify-center text-black font-bold text-sm shadow-[0_0_15px_rgba(29,185,84,0.5)]">
                    JD
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-none">Alex Rivera</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Top 0.5% Eclectic Listener</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1DB954]/15 border border-[#1DB954]/30 text-[#1DB954] text-xs font-mono">
                  <Flame className="w-3.5 h-3.5" />
                  <span>98.4 VIBE</span>
                </div>
              </div>

              {/* OCEAN Radar Chart Container */}
              <div className="my-5 relative flex flex-col items-center justify-center">
                <div className="w-full h-56 relative flex items-center justify-center">
                  {/* SVG OCEAN Radar Chart */}
                  <svg className="w-full h-full" viewBox="0 0 200 200">
                    {/* Pentagon Grid Lines */}
                    {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
                      <polygon
                        key={i}
                        points={`
                          ${100 + 80 * scale * Math.sin(0)},${100 - 80 * scale * Math.cos(0)}
                          ${100 + 80 * scale * Math.sin((2 * Math.PI) / 5)},${100 - 80 * scale * Math.cos((2 * Math.PI) / 5)}
                          ${100 + 80 * scale * Math.sin((4 * Math.PI) / 5)},${100 - 80 * scale * Math.cos((4 * Math.PI) / 5)}
                          ${100 + 80 * scale * Math.sin((6 * Math.PI) / 5)},${100 - 80 * scale * Math.cos((6 * Math.PI) / 5)}
                          ${100 + 80 * scale * Math.sin((8 * Math.PI) / 5)},${100 - 80 * scale * Math.cos((8 * Math.PI) / 5)}
                        `}
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.08)"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Radar Spoke Lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line
                        key={i}
                        x1="100"
                        y1="100"
                        x2={100 + 80 * Math.sin((2 * Math.PI * i) / 5)}
                        y2={100 - 80 * Math.cos((2 * Math.PI * i) / 5)}
                        stroke="rgba(255, 255, 255, 0.12)"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                    ))}

                    {/* OCEAN Polygon Glowing Fill */}
                    {/* Scores: O:88%, C:72%, E:65%, A:80%, N:45% */}
                    <polygon
                      points={`
                        ${100 + 80 * 0.88 * Math.sin(0)},${100 - 80 * 0.88 * Math.cos(0)}
                        ${100 + 80 * 0.72 * Math.sin((2 * Math.PI) / 5)},${100 - 80 * 0.72 * Math.cos((2 * Math.PI) / 5)}
                        ${100 + 80 * 0.65 * Math.sin((4 * Math.PI) / 5)},${100 - 80 * 0.65 * Math.cos((4 * Math.PI) / 5)}
                        ${100 + 80 * 0.80 * Math.sin((6 * Math.PI) / 5)},${100 - 80 * 0.80 * Math.cos((6 * Math.PI) / 5)}
                        ${100 + 80 * 0.45 * Math.sin((8 * Math.PI) / 5)},${100 - 80 * 0.45 * Math.cos((8 * Math.PI) / 5)}
                      `}
                      fill="url(#radarGradient)"
                      stroke="#1DB954"
                      strokeWidth="2.5"
                      className="filter drop-shadow-[0_0_8px_rgba(29,185,84,0.8)]"
                    />

                    {/* Gradient Definition */}
                    <defs>
                      <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1DB954" stopOpacity="0.55" />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.35" />
                      </linearGradient>
                    </defs>

                    {/* Vertices Dots */}
                    {[
                      { val: 0.88, angle: 0 },
                      { val: 0.72, angle: (2 * Math.PI) / 5 },
                      { val: 0.65, angle: (4 * Math.PI) / 5 },
                      { val: 0.8, angle: (6 * Math.PI) / 5 },
                      { val: 0.45, angle: (8 * Math.PI) / 5 },
                    ].map((pt, idx) => (
                      <circle
                        key={idx}
                        cx={100 + 80 * pt.val * Math.sin(pt.angle)}
                        cy={100 - 80 * pt.val * Math.cos(pt.angle)}
                        r="3.5"
                        fill="#1ED760"
                        className="shadow-[0_0_6px_#1ED760]"
                      />
                    ))}
                  </svg>

                  {/* Axis Labels */}
                  <span className="absolute top-1 text-[11px] font-bold text-[#1DB954] tracking-wide">
                    OPENNESS (88%)
                  </span>
                  <span className="absolute right-0 top-1/3 text-[10px] font-semibold text-gray-300">
                    ENERGY (72%)
                  </span>
                  <span className="absolute right-2 bottom-4 text-[10px] font-semibold text-gray-300">
                    VALENCE (65%)
                  </span>
                  <span className="absolute left-2 bottom-4 text-[10px] font-semibold text-gray-300">
                    ACOUSTIC (80%)
                  </span>
                  <span className="absolute left-0 top-1/3 text-[10px] font-semibold text-gray-300">
                    DEPTH (45%)
                  </span>
                </div>
              </div>

              {/* Bottom Mini Now-Playing Track Bar */}
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-900 flex items-center justify-center text-white shadow-inner">
                    <Music className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Midnight City</h4>
                    <p className="text-[10px] text-gray-400">M83 • Synthetica Vibe</p>
                  </div>
                </div>

                {/* Animated Equalizer Visualizer Bars */}
                <div className="flex items-end gap-1 h-5 px-2">
                  <span className="w-1 bg-[#1DB954] rounded-full animate-[bounce_1s_infinite_100ms] h-3" />
                  <span className="w-1 bg-[#1DB954] rounded-full animate-[bounce_1s_infinite_300ms] h-5" />
                  <span className="w-1 bg-[#1DB954] rounded-full animate-[bounce_1s_infinite_200ms] h-2" />
                  <span className="w-1 bg-[#1DB954] rounded-full animate-[bounce_1s_infinite_400ms] h-4" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
