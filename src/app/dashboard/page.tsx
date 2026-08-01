"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { SpotifyIcon } from "@/components/landing/LandingNav";
import { 
  LogOut, 
  ShieldCheck, 
  AlertTriangle, 
  Terminal, 
  User, 
  Key, 
  RefreshCw,
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="flex items-center gap-3 px-6 py-4 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-xl text-gray-300">
          <RefreshCw className="w-5 h-5 animate-spin text-[#1DB954]" />
          <span className="text-sm font-semibold">Verifying Spotify Session...</span>
        </div>
      </main>
    );
  }

  // Handle Unauthenticated State
  if (status === "unauthenticated" || !session) {
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
          <div className="w-14 h-14 rounded-full bg-white/[0.08] border border-white/15 flex items-center justify-center mx-auto mb-5">
            <LockIcon className="w-7 h-7 text-[#1DB954]" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">
            Authentication Required
          </h2>
          <p className="text-xs text-gray-300 mb-6 leading-relaxed">
            You must be logged in with your Spotify account to view your session debug state and personality dashboard.
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

  // Authenticated State with Active Session
  const hasRefreshError = session.error === "RefreshAccessTokenError";

  return (
    <main className="min-h-screen py-10 px-4 md:px-8 max-w-5xl mx-auto relative z-10">
      {/* Top Header Navbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 mb-8 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/50 flex items-center justify-center">
            <SpotifyIcon className="w-5 h-5 text-[#1DB954]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Spoti<span className="text-[#1DB954]">Glory</span>
            <span className="text-[10px] font-mono ml-2 px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/15">
              DEBUG DASHBOARD
            </span>
          </span>
        </Link>

        {/* User Badge & Sign Out Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md">
            {session.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name || "User Avatar"}
                className="w-6 h-6 rounded-full object-cover border border-[#1DB954]"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#1DB954]/20 flex items-center justify-center text-[#1DB954]">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
            <span className="text-xs font-bold text-white max-w-[120px] truncate">
              {session.user?.name || "Spotify User"}
            </span>
          </div>

          <GlassButton
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
            leftIcon={<LogOut className="w-3.5 h-3.5 text-gray-400" />}
            className="text-xs border-white/15 hover:border-red-500/40 hover:text-red-400"
          >
            Sign Out
          </GlassButton>
        </div>
      </div>

      {/* Main Debug Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile & Token Status Card */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Status Card */}
          <GlassCard
            variant="elevated"
            radius="3xl"
            enableRefraction={true}
            refractionIntensity="medium"
            className="p-6 border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1DB954]" />
                OAuth Status
              </h3>
              {hasRefreshError ? (
                <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-mono font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Expired
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30 text-xs font-mono font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-ping" /> Active
                </span>
              )}
            </div>

            {hasRefreshError && (
              <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 mb-4">
                Access token refresh failed. Please sign out and log in again to renew your session.
              </div>
            )}

            <div className="flex flex-col gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex justify-between items-center">
                <span className="text-gray-400">Display Name:</span>
                <span className="text-white font-bold">{session.user?.name || "N/A"}</span>
              </div>
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex justify-between items-center">
                <span className="text-gray-400">Email:</span>
                <span className="text-white font-bold">{session.user?.email || "N/A"}</span>
              </div>
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex justify-between items-center">
                <span className="text-gray-400">Token Expires At:</span>
                <span className="text-emerald-400 font-mono font-semibold">
                  {session.accessTokenExpires
                    ? new Date(session.accessTokenExpires).toLocaleTimeString()
                    : "Unknown"}
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard
            variant="default"
            radius="3xl"
            className="p-6 border-white/15 text-left"
          >
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1DB954]" />
              Spotify Scopes Granted
            </h4>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["user-top-read", "user-read-recently-played", "user-read-email", "user-read-private"].map(
                (scope) => (
                  <span
                    key={scope}
                    className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/[0.06] text-gray-300 border border-white/10"
                  >
                    {scope}
                  </span>
                )
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Full Session JSON Debug Viewer */}
        <div className="lg:col-span-7">
          <GlassCard
            variant="elevated"
            radius="3xl"
            enableRefraction={true}
            refractionIntensity="intense"
            className="p-6 border-white/20 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] h-full flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Terminal className="w-4 h-4 text-[#1DB954]" />
                  <span>Session JSON Debug Viewer</span>
                </div>
                <span className="text-[10px] font-mono text-gray-400 px-2 py-0.5 rounded-full bg-white/10">
                  JSON.stringify(session)
                </span>
              </div>

              {/* Pretty-printed JSON Viewer Container */}
              <div className="bg-black/60 rounded-2xl p-4 border border-white/10 overflow-x-auto max-h-[380px] font-mono text-xs text-emerald-400 leading-relaxed shadow-inner">
                <pre>{JSON.stringify(session, null, 2)}</pre>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
              <span>NextAuth OAuth 2.0 State</span>
              <span className="text-[#1DB954] font-mono">Token Rotation Ready</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}

function LockIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}
