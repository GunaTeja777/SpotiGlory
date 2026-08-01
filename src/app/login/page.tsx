"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { SpotifyIcon } from "@/components/landing/LandingNav";
import { ArrowLeft, ShieldCheck, Lock, Sparkles, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleSimulatedConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      alert("Spotify Auth Simulation: Authentication flow complete! (Placeholder)");
    }, 1200);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-radial from-[#1DB954]/20 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </Link>

        {/* Login Glass Card */}
        <GlassCard
          variant="elevated"
          radius="3xl"
          enableRefraction={true}
          refractionIntensity="intense"
          className="p-8 border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_0_rgba(29,185,84,0.3)] text-center"
        >
          {/* Logo Badge */}
          <div className="w-16 h-16 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/50 shadow-[0_0_25px_rgba(29,185,84,0.6)] flex items-center justify-center mx-auto mb-6">
            <SpotifyIcon className="w-9 h-9 text-[#1DB954]" />
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight mb-2">
            Connect Your Spotify
          </h1>
          <p className="text-xs text-gray-300 mb-8 leading-relaxed">
            Authorize SpotiGlory to read your top artists, saved tracks, and listening timestamps to compute your Big Five music personality profile.
          </p>

          {/* Spotify Auth Action */}
          <GlassButton
            variant="primary"
            size="lg"
            isLoading={isConnecting}
            onClick={handleSimulatedConnect}
            leftIcon={<SpotifyIcon className="w-5 h-5 text-black" />}
            className="w-full justify-center font-bold text-base shadow-[0_0_25px_0_rgba(29,185,84,0.6)] py-3 mb-6"
          >
            Authorize with Spotify
          </GlassButton>

          {/* Permissions & Security checklist */}
          <div className="pt-6 border-t border-white/10 flex flex-col gap-2.5 text-left text-xs">
            <div className="flex items-center gap-2 text-gray-300">
              <CheckCircle2 className="w-4 h-4 text-[#1DB954]" />
              <span>Read-only access to top tracks & artists</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <CheckCircle2 className="w-4 h-4 text-[#1DB954]" />
              <span>No ability to modify your playlists or account</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Official OAuth 2.0 PKCE protocol</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
