"use client";

import React, { useState } from "react";
import { GlassNav } from "@/components/ui/GlassNav";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import {
  Play as PlayIcon,
  Pause as PauseIcon,
  SkipForward as SkipForwardIcon,
  SkipBack as SkipBackIcon,
  Volume2 as VolumeIcon,
  Sparkles as SparklesIcon,
  Layers as LayersIcon,
  MousePointer as MousePointerIcon,
  Palette as PaletteIcon,
  Compass as CompassIcon,
  Zap as ZapIcon,
  Radio as RadioIcon,
  Sliders as SlidersIcon,
  CheckCircle2 as CheckCircleIcon,
  Heart as HeartIcon,
  Share2 as ShareIcon,
  ShieldCheck as ShieldIcon,
  Disc as DiscIcon,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export default function DesignPreviewPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingButtons, setIsLoadingButtons] = useState(false);
  const [activeTab, setActiveTab] = useState("#hero");
  const [liked, setLiked] = useState(false);

  return (
    <div className="min-h-screen pb-24 pt-28 px-4 md:px-8">
      {/* Floating Glass Navbar */}
      <GlassNav
        activeHref={activeTab}
        onSelectTab={(href) => setActiveTab(href)}
      />

      <main className="max-w-7xl mx-auto space-y-20">
        
        {/* Section 1: Hero Banner & Specular Refraction Showcase */}
        <section id="hero" className="scroll-mt-32">
          <GlassCard
            variant="elevated"
            radius="4xl"
            enableRefraction
            refractionIntensity="intense"
            className="p-8 md:p-14 relative overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#1DB954]/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#6B21A8]/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.14] backdrop-blur-md">
                  <SparklesIcon className="w-4 h-4 text-[#1DB954] animate-spin" />
                  <span className="text-xs font-semibold tracking-wide text-gray-200 uppercase">
                    Spotify Liquid Glass Aesthetic
                  </span>
                </div>

                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
                  Refracted Light. <br />
                  <span className="bg-gradient-to-r from-[#1DB954] via-[#1ED760] to-emerald-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(29,185,84,0.4)]">
                    Pure Specular Sheen.
                  </span>
                </h1>

                <p className="text-base md:text-lg text-gray-300 leading-relaxed max-w-2xl font-normal">
                  Experience a next-generation UI system designed with deep near-black backdrop (
                  <code className="text-[#1DB954] font-mono text-sm px-1.5 py-0.5 rounded bg-black/40 border border-[#1DB954]/30">
                    #0A0A0C
                  </code>
                  ), ambient Spotify Green &amp; Violet mesh drift, top edge specular highlights, and real-time cursor refraction tracking.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <GlassButton
                    variant="primary"
                    size="lg"
                    leftIcon={<PlayIcon className="w-5 h-5 fill-current" />}
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? "Pause Demo Experience" : "Play Liquid Experience"}
                  </GlassButton>

                  <GlassButton
                    variant="ghost"
                    size="lg"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    onClick={() => {
                      const el = document.getElementById("tokens");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Explore Tokens
                  </GlassButton>
                </div>
              </div>

              {/* Interactive Glass Specular Preview Widget */}
              <div className="lg:col-span-5">
                <GlassCard
                  variant="interactive"
                  radius="3xl"
                  enableRefraction
                  className="p-6 border-[#1DB954]/30 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-[#1DB954] animate-ping" />
                      <span className="text-xs font-mono text-gray-300 uppercase tracking-widest">
                        Refraction Engine
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[#1DB954] px-2 py-0.5 rounded-full bg-[#1DB954]/10 border border-[#1DB954]/30">
                      60 FPS RAF
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Specular Highlight</span>
                        <span className="text-white font-mono">Top Edge Inset</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#1DB954] to-emerald-300 w-3/4 rounded-full" />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Backdrop Blur Radius</span>
                        <span className="text-white font-mono">24px (Blur XL)</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-[#1DB954] w-5/6 rounded-full" />
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 flex items-center gap-2 pt-1">
                    <MousePointerIcon className="w-4 h-4 text-[#1DB954]" />
                    <span>Hover cursor over this panel to see the specular sheen track mouse position.</span>
                  </div>
                </GlassCard>
              </div>
            </div>
          </GlassCard>
        </section>


        {/* Section 2: Design Tokens & System Specs */}
        <section id="tokens" className="space-y-8 scroll-mt-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2 text-[#1DB954] font-semibold text-xs uppercase tracking-wider mb-2">
                <PaletteIcon className="w-4 h-4" />
                <span>Foundation Architecture</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                Design System Tokens
              </h2>
            </div>
            <p className="text-sm text-gray-400 max-w-md">
              Curated color tokens, frosted layer opacities, and specular highlight ratios defining the SpotiGlory experience.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Color Swatch 1 */}
            <GlassCard variant="default" radius="2xl" className="p-5 space-y-4">
              <div className="h-24 rounded-xl bg-[#0A0A0C] border border-white/10 flex items-end p-3 relative overflow-hidden">
                <span className="font-mono text-xs font-bold text-white bg-black/60 px-2 py-1 rounded backdrop-blur-md">
                  #0A0A0C
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Deep Base Background</h3>
                <p className="text-xs text-gray-400">Near-black base providing infinite depth behind translucent glass layers.</p>
              </div>
            </GlassCard>

            {/* Color Swatch 2 */}
            <GlassCard variant="default" radius="2xl" className="p-5 space-y-4">
              <div className="h-24 rounded-xl bg-[#1DB954] shadow-[0_0_30px_rgba(29,185,84,0.5)] flex items-end p-3 relative overflow-hidden">
                <span className="font-mono text-xs font-bold text-black bg-white/80 px-2 py-1 rounded backdrop-blur-md">
                  #1DB954
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Spotify Green Accent</h3>
                <p className="text-xs text-gray-400">High-vibrancy accent strictly reserved for CTAs, active states, and glowing accents.</p>
              </div>
            </GlassCard>

            {/* Color Swatch 3 */}
            <GlassCard variant="default" radius="2xl" className="p-5 space-y-4">
              <div className="h-24 rounded-xl bg-gradient-to-br from-[#6B21A8] to-[#4C1D95] flex items-end p-3 relative overflow-hidden">
                <span className="font-mono text-xs font-bold text-white bg-black/60 px-2 py-1 rounded backdrop-blur-md">
                  #6B21A8
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Violet Ambient Mesh</h3>
                <p className="text-xs text-gray-400">Low-opacity secondary gradient undertones for organic fluid backdrop drift.</p>
              </div>
            </GlassCard>

            {/* Color Swatch 4 */}
            <GlassCard variant="default" radius="2xl" className="p-5 space-y-4">
              <div className="h-24 rounded-xl bg-white/[0.06] border border-white/[0.12] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] flex items-end p-3 relative overflow-hidden">
                <span className="font-mono text-xs font-bold text-white bg-black/60 px-2 py-1 rounded backdrop-blur-md">
                  rgba(255,255,255,0.06)
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Liquid Specular Glass</h3>
                <p className="text-xs text-gray-400">Frosted panel overlay with top edge specular light inset shadow.</p>
              </div>
            </GlassCard>
          </div>
        </section>


        {/* Section 3: GlassButton Showcase Suite */}
        <section id="buttons" className="space-y-8 scroll-mt-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2 text-[#1DB954] font-semibold text-xs uppercase tracking-wider mb-2">
                <ZapIcon className="w-4 h-4" />
                <span>Interactive Controls</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                GlassButton Primitive
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => setIsLoadingButtons(!isLoadingButtons)}
              >
                {isLoadingButtons ? "Reset Buttons" : "Simulate Loading State"}
              </GlassButton>
            </div>
          </div>

          <GlassCard variant="elevated" radius="3xl" className="p-8 space-y-8">
            
            {/* Primary Variant Row */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-[#1DB954] uppercase tracking-wider">
                  Primary Variant (Spotify Green Fill &amp; Glow)
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <GlassButton variant="primary" size="lg" isLoading={isLoadingButtons} leftIcon={<PlayIcon className="w-5 h-5 fill-current" />}>
                  Large Primary CTA
                </GlassButton>
                <GlassButton variant="primary" size="md" isLoading={isLoadingButtons} leftIcon={<SparklesIcon className="w-4 h-4" />}>
                  Medium Primary
                </GlassButton>
                <GlassButton variant="primary" size="sm" isLoading={isLoadingButtons}>
                  Small Primary
                </GlassButton>
                <GlassButton variant="primary" size="icon" isLoading={isLoadingButtons}>
                  <PlayIcon className="w-4 h-4 fill-current ml-0.5" />
                </GlassButton>
                <GlassButton variant="primary" size="md" disabled>
                  Disabled State
                </GlassButton>
              </div>
            </div>

            <div className="h-px bg-white/10" />

            {/* Ghost Variant Row */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">
                  Ghost Variant (Translucent Frosted Border)
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <GlassButton variant="ghost" size="lg" isLoading={isLoadingButtons} leftIcon={<DiscIcon className="w-5 h-5" />}>
                  Large Ghost CTA
                </GlassButton>
                <GlassButton variant="ghost" size="md" isLoading={isLoadingButtons} leftIcon={<CompassIcon className="w-4 h-4" />}>
                  Medium Ghost
                </GlassButton>
                <GlassButton variant="ghost" size="sm" isLoading={isLoadingButtons}>
                  Small Ghost
                </GlassButton>
                <GlassButton variant="ghost" size="icon" isLoading={isLoadingButtons}>
                  <HeartIcon className="w-4 h-4 text-red-400" />
                </GlassButton>
                <GlassButton variant="ghost" size="md" disabled>
                  Disabled Ghost
                </GlassButton>
              </div>
            </div>

            <div className="h-px bg-white/10" />

            {/* Spotify Ghost & Subtle Row */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-[#1DB954] uppercase tracking-wider">
                  Spotify Ghost &amp; Subtle Variants
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <GlassButton variant="spotify-ghost" size="md" leftIcon={<RadioIcon className="w-4 h-4" />}>
                  Spotify Ghost Accent
                </GlassButton>
                <GlassButton variant="subtle" size="md" leftIcon={<SlidersIcon className="w-4 h-4" />}>
                  Subtle Text Button
                </GlassButton>
              </div>
            </div>

          </GlassCard>
        </section>


        {/* Section 4: GlassCard Showcase Suite */}
        <section id="cards" className="space-y-8 scroll-mt-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2 text-[#1DB954] font-semibold text-xs uppercase tracking-wider mb-2">
                <LayersIcon className="w-4 h-4" />
                <span>Surface Components</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                GlassCard Primitive Variants
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Standard Glass Card */}
            <GlassCard variant="default" radius="3xl" className="p-6 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/15">
                <ShieldIcon className="w-5 h-5 text-gray-200" />
              </div>
              <h3 className="text-lg font-bold text-white">Default Glass Card</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Standard translucent panel featuring <code className="text-[#1DB954]">backdrop-blur-xl</code>, 6% white opacity background, and subtle top specular shadow.
              </p>
              <div className="pt-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 bg-black/40 px-2.5 py-1 rounded-full border border-white/10">
                  variant=&quot;default&quot;
                </span>
              </div>
            </GlassCard>

            {/* Elevated Glass Card */}
            <GlassCard variant="elevated" radius="3xl" className="p-6 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-[#1DB954]/15 flex items-center justify-center text-[#1DB954] border border-[#1DB954]/30 shadow-[0_0_15px_rgba(29,185,84,0.3)]">
                <SparklesIcon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Elevated Glass Card</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Gradient frosted glass fill with double specular highlights and deeper drop shadows for prominent UI sections.
              </p>
              <div className="pt-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#1DB954] bg-[#1DB954]/10 px-2.5 py-1 rounded-full border border-[#1DB954]/30">
                  variant=&quot;elevated&quot;
                </span>
              </div>
            </GlassCard>

            {/* Interactive Refraction Card */}
            <GlassCard variant="interactive" radius="3xl" enableRefraction className="p-6 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/15">
                <MousePointerIcon className="w-5 h-5 text-[#1DB954]" />
              </div>
              <h3 className="text-lg font-bold text-white">Interactive Refraction</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Refraction sheen follows mouse cursor coordinates in real-time via <code className="text-[#1DB954]">useGlassRefraction</code> hook.
              </p>
              <div className="pt-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  variant=&quot;interactive&quot;
                </span>
              </div>
            </GlassCard>
          </div>
        </section>


        {/* Section 5: Spotify Liquid Audio Player Mockup */}
        <section id="interactive" className="space-y-8 scroll-mt-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2 text-[#1DB954] font-semibold text-xs uppercase tracking-wider mb-2">
                <RadioIcon className="w-4 h-4" />
                <span>Integrated Composition</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                Spotify Music Player Mockup
              </h2>
            </div>
            <p className="text-sm text-gray-400 max-w-md">
              A real-world Spotify application UI showcasing GlassNav, GlassCard, and GlassButtons working in harmony.
            </p>
          </div>

          <GlassCard variant="glowing" radius="4xl" enableRefraction className="p-8 md:p-10">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              
              {/* Album Art Glass Cover */}
              <div className="lg:col-span-5 relative group">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#1DB954]/40 via-[#6B21A8]/50 to-black p-1 border border-white/20 shadow-2xl relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-radial from-white/20 via-transparent to-transparent opacity-60 pointer-events-none" />
                  <DiscIcon className="w-32 h-32 text-white/40 animate-spin [animation-duration:12s]" />
                  
                  {/* Floating Now Playing Pill */}
                  <div className="absolute bottom-4 inset-x-4 p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Liquid Drift (Remix)</p>
                      <p className="text-[10px] text-gray-400">SpotiGlory Studio</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1 h-4 bg-[#1DB954] rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1 h-5 bg-[#1DB954] rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1 h-3 bg-[#1DB954] rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Player Controls & Track Info */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-[#1DB954] font-semibold tracking-wider uppercase">
                      Now Playing • Liquid Audio Hi-Res
                    </span>
                    <h3 className="text-3xl font-extrabold text-white tracking-tight mt-1">
                      Spotify Design Aesthetic
                    </h3>
                    <p className="text-sm text-gray-300 mt-1">Spotify Original Design System • 324 kbps FLAC</p>
                  </div>

                  <GlassButton
                    variant="ghost"
                    size="icon"
                    onClick={() => setLiked(!liked)}
                    className="w-11 h-11"
                  >
                    <HeartIcon className={`w-5 h-5 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-gray-300"}`} />
                  </GlassButton>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="relative h-2 rounded-full bg-white/10 border border-white/10 cursor-pointer overflow-hidden group">
                    <div className="absolute top-0 bottom-0 left-0 w-2/5 bg-gradient-to-r from-[#1DB954] to-emerald-300 rounded-full group-hover:bg-[#1ED760]" />
                  </div>
                  <div className="flex justify-between text-xs font-mono text-gray-400">
                    <span>1:42</span>
                    <span>3:58</span>
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <GlassButton variant="ghost" size="icon">
                      <ShareIcon className="w-4 h-4 text-gray-300" />
                    </GlassButton>
                    <GlassButton variant="ghost" size="icon">
                      <SlidersIcon className="w-4 h-4 text-gray-300" />
                    </GlassButton>
                  </div>

                  <div className="flex items-center gap-4">
                    <GlassButton variant="ghost" size="icon">
                      <SkipBackIcon className="w-5 h-5 fill-current text-white" />
                    </GlassButton>

                    <GlassButton
                      variant="primary"
                      size="lg"
                      className="w-14 h-14 p-0 rounded-full shadow-[0_0_30px_rgba(29,185,84,0.6)]"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? (
                        <PauseIcon className="w-6 h-6 fill-current" />
                      ) : (
                        <PlayIcon className="w-6 h-6 fill-current ml-1" />
                      )}
                    </GlassButton>

                    <GlassButton variant="ghost" size="icon">
                      <SkipForwardIcon className="w-5 h-5 fill-current text-white" />
                    </GlassButton>
                  </div>

                  <div className="flex items-center gap-2">
                    <VolumeIcon className="w-4 h-4 text-gray-400" />
                    <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full w-3/4 bg-[#1DB954] rounded-full" />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </GlassCard>
        </section>

      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/10 text-center text-xs text-gray-400 space-y-2">
        <p className="font-semibold text-white">SpotiGlory Design System</p>
        <p>Built with Next.js 14 App Router • Tailwind CSS • Glass Refraction Engine</p>
      </footer>
    </div>
  );
}
