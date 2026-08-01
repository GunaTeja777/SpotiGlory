"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { DashboardSidebar, NavTab } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { SpotifyIcon } from "@/components/landing/LandingNav";
import { 
  Music2, 
  UserCheck, 
  Clock, 
  Settings, 
  Lock, 
  ArrowRight,
  Terminal,
  Sparkles
} from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<NavTab>("overview");
  const [showDebugJson, setShowDebugJson] = useState(false);

  // Unauthenticated fallback prompt
  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-radial from-[#1DB954]/15 to-transparent blur-3xl pointer-events-none" />
        <GlassCard
          variant="elevated"
          radius="3xl"
          enableRefraction={true}
          refractionIntensity="intense"
          className="p-8 max-w-md w-full border-white/20 text-center shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]"
        >
          <div className="w-14 h-14 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/50 flex items-center justify-center mx-auto mb-5 shadow-[0_0_20px_rgba(29,185,84,0.5)]">
            <SpotifyIcon className="w-8 h-8 text-[#1DB954]" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">
            Authentication Required
          </h2>
          <p className="text-xs text-gray-300 mb-6 leading-relaxed">
            Connect your Spotify account to access your music personality dashboard, audio DNA, and listening metrics.
          </p>
          <Link href="/login">
            <GlassButton
              variant="primary"
              size="lg"
              leftIcon={<SpotifyIcon className="w-5 h-5 text-black" />}
              rightIcon={<ArrowRight className="w-4 h-4 text-black" />}
              className="w-full justify-center font-bold text-sm shadow-[0_0_25px_rgba(29,185,84,0.5)]"
            >
              Log in with Spotify
            </GlassButton>
          </Link>
        </GlassCard>
      </main>
    );
  }

  const isLoading = status === "loading";

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* 1. Fixed Left Glass Sidebar (Desktop & Mobile Drawer/Bottom Bar) */}
      <DashboardSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* 2. Main Dashboard Content Container */}
      <main className="flex-1 md:ml-72 p-4 md:p-8 pb-24 md:pb-12 max-w-7xl mx-auto w-full transition-all">
        {/* Top User Profile Header Bar */}
        <DashboardHeader />

        {/* Debug Toggle Bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight capitalize">
              {activeTab.replace("-", " ")}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              SpotiGlory Liquid Glass Personality & Audio Analytics
            </p>
          </div>

          <button
            onClick={() => setShowDebugJson(!showDebugJson)}
            className="px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] text-xs font-mono text-gray-300 flex items-center gap-1.5 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-[#1DB954]" />
            <span>{showDebugJson ? "Hide Debug Session" : "Debug Session JSON"}</span>
          </button>
        </div>

        {/* Optional Session JSON Debug Viewer */}
        {showDebugJson && session && (
          <GlassCard
            variant="elevated"
            radius="2xl"
            className="p-5 mb-6 border-white/20 bg-black/80"
          >
            <div className="flex items-center justify-between mb-3 text-xs font-mono text-[#1DB954]">
              <span>Active Session JSON</span>
              <span>NextAuth OAuth 2.0 State</span>
            </div>
            <pre className="text-xs font-mono text-emerald-400 overflow-x-auto p-3 rounded-xl bg-black/60 border border-white/10 max-h-60">
              {JSON.stringify(session, null, 2)}
            </pre>
          </GlassCard>
        )}

        {/* Tab Views */}
        {activeTab === "overview" && <OverviewTab isLoading={isLoading} />}

        {activeTab === "top-tracks" && (
          <GlassCard variant="elevated" radius="3xl" className="p-8 border-white/18 text-center">
            <Music2 className="w-10 h-10 text-[#1DB954] mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Top Tracks Module</h3>
            <p className="text-xs text-gray-300 max-w-md mx-auto">
              This module will fetch and display your top 50 Spotify tracks across short, medium, and long-term time ranges.
            </p>
          </GlassCard>
        )}

        {activeTab === "top-artists" && (
          <GlassCard variant="elevated" radius="3xl" className="p-8 border-white/18 text-center">
            <UserCheck className="w-10 h-10 text-purple-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Top Artists Module</h3>
            <p className="text-xs text-gray-300 max-w-md mx-auto">
              This module will render your top Spotify artists with genre tag clouds, acoustic affinity scores, and artist aura cards.
            </p>
          </GlassCard>
        )}

        {activeTab === "listening-patterns" && (
          <GlassCard variant="elevated" radius="3xl" className="p-8 border-white/18 text-center">
            <Clock className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Listening Patterns Module</h3>
            <p className="text-xs text-gray-300 max-w-md mx-auto">
              Analyze your circadian listening clock, late-night mood spikes, and temporal energy trends.
            </p>
          </GlassCard>
        )}

        {activeTab === "settings" && (
          <GlassCard variant="elevated" radius="3xl" className="p-8 border-white/18 text-left max-w-2xl">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-5">
              <Settings className="w-6 h-6 text-[#1DB954]" />
              <h3 className="text-lg font-bold text-white">App & Session Settings</h3>
            </div>
            <div className="flex flex-col gap-4 text-xs text-gray-300">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex justify-between items-center">
                <div>
                  <p className="font-bold text-white">Theme & Glass Specular Intensity</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Liquid Glass refraction active</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#1DB954]/20 text-[#1DB954] font-mono text-[10px] border border-[#1DB954]/30">
                  INTENSE GLASS
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex justify-between items-center">
                <div>
                  <p className="font-bold text-white">Spotify API Session State</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Scopes: top-read, recently-played, email, profile</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/30">
                  OAUTH READY
                </span>
              </div>
            </div>
          </GlassCard>
        )}
      </main>
    </div>
  );
}
