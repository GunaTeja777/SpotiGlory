"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { DashboardSidebar, NavTab } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { TopTracksTab } from "@/components/dashboard/TopTracksTab";
import { TopArtistsTab } from "@/components/dashboard/TopArtistsTab";
import { ListeningPatternsTab } from "@/components/dashboard/ListeningPatternsTab";
import { PersonalityTab } from "@/components/dashboard/PersonalityTab";
import { JamRoomsTab } from "@/components/dashboard/JamRoomsTab";
import { UploadHistoryTab } from "@/components/dashboard/UploadHistoryTab";
import { LanguageSettingsCard } from "@/components/dashboard/LanguageSettingsCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { SpotifyIcon } from "@/components/landing/LandingNav";
import { 
  Settings, 
  ArrowRight,
  Terminal,
  Sparkles
} from "lucide-react";

function DashboardContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as NavTab | null;
  const [activeTab, setActiveTab] = useState<NavTab>(tabParam || "overview");
  const [showDebugJson, setShowDebugJson] = useState(false);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Allow unauthenticated users to explore in Demo Mode

  const isLoading = status === "loading";

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* 1. Fixed Left Glass Sidebar (Desktop & Mobile Drawer/Bottom Bar) */}
      <DashboardSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* 2. Main Dashboard Content Container */}
      <main className="flex-1 md:ml-72 p-4 md:p-8 pb-24 md:pb-12 max-w-7xl mx-auto w-full transition-all">
        {/* Demo Mode Banner when unauthenticated */}
        {status === "unauthenticated" && (
          <div className="mb-6 p-4 rounded-2xl bg-purple-500/15 border border-purple-500/30 backdrop-blur-xl text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_25px_rgba(168,85,247,0.2)]">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wide flex items-center gap-2">
                  <span>Demo Guest Preview Mode</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-[9px] font-mono border border-purple-500/30 text-purple-300">
                    PREVIEW
                  </span>
                </h4>
                <p className="text-xs text-purple-300/90 mt-1 leading-relaxed">
                  You are exploring SpotiGlory in Demo Mode with synthetic music analytics. Connect your Spotify account anytime to analyze your live listening data.
                </p>
              </div>
            </div>

            <Link href="/login" className="shrink-0 w-full sm:w-auto">
              <GlassButton
                variant="primary"
                size="sm"
                leftIcon={<SpotifyIcon className="w-4 h-4 text-black" />}
                className="font-bold text-xs shadow-[0_0_15px_rgba(29,185,84,0.5)] w-full sm:w-auto justify-center"
              >
                Connect Spotify
              </GlassButton>
            </Link>
          </div>
        )}

        {/* Top User Profile Header Bar */}
        <DashboardHeader />

        {/* Header & Debug Toggle Bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight capitalize">
              {activeTab.replace("-", " ")}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              SpotiGlory Personality & Audio Analytics
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

        {/* Active Tab Views */}
        {activeTab === "overview" && <OverviewTab isLoading={isLoading} />}
        {activeTab === "top-tracks" && <TopTracksTab />}
        {activeTab === "top-artists" && <TopArtistsTab />}
        {activeTab === "listening-patterns" && <ListeningPatternsTab />}
        {activeTab === "personality" && <PersonalityTab />}
        {activeTab === "jam-rooms" && <JamRoomsTab />}
        {activeTab === "upload-history" && <UploadHistoryTab />}

        {activeTab === "settings" && (
          <div className="flex flex-col gap-6 max-w-2xl">
            <LanguageSettingsCard />

            <GlassCard variant="elevated" radius="3xl" className="p-8 border-white/18 text-left">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-5">
                <Settings className="w-6 h-6 text-[#1DB954]" />
                <h3 className="text-lg font-bold text-white">App & Session Settings</h3>
              </div>
              <div className="flex flex-col gap-4 text-xs text-gray-300">
                {/* Optional IPIP Validation Quiz Link */}
                <Link
                  href="/dashboard/quiz"
                  className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/20 transition-all flex justify-between items-center group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Sparkles className="w-4 h-4 text-purple-300" />
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-purple-200 transition-colors">
                        Help improve accuracy (optional, 2 min)
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Take the 10-item Mini-IPIP quiz to validate Spotify scores and train Ridge Regression weights
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-purple-300 font-bold group-hover:translate-x-1 transition-transform">
                    <span>Take Quiz</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-white">Theme & Glass Specular Intensity</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Analytics engine active</p>
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
                    OAUTH ACTIVE
                  </span>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0E] text-white flex items-center justify-center p-8 text-xs font-mono">
        Loading SpotiGlory Analytics...
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
