"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassSkeleton } from "./GlassSkeleton";
import { LogOut, User, ShieldCheck, Flame, RefreshCw } from "lucide-react";
import { SpotifyIcon } from "@/components/landing/LandingNav";

export const DashboardHeader: React.FC = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <header className="w-full bg-white/[0.06] backdrop-blur-2xl border border-white/[0.14] rounded-3xl p-4 mb-6 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.25)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GlassSkeleton className="w-10 h-10 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <GlassSkeleton className="w-32 h-4 rounded-md" />
            <GlassSkeleton className="w-20 h-3 rounded-md" />
          </div>
        </div>
        <GlassSkeleton className="w-24 h-9 rounded-full" />
      </header>
    );
  }

  const userName = session?.user?.name || "Spotify Member";
  const userImage = session?.user?.image;
  const userEmail = session?.user?.email;

  return (
    <header className="w-full bg-white/[0.06] backdrop-blur-2xl border border-white/[0.14] rounded-3xl p-4 mb-6 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.25),0_15px_35px_-10px_rgba(0,0,0,0.6)] flex flex-wrap items-center justify-between gap-4">
      {/* User Profile info */}
      <div className="flex items-center gap-3.5">
        <div className="relative">
          {userImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={userImage}
              alt={userName}
              className="w-11 h-11 rounded-full object-cover border-2 border-[#1DB954] shadow-[0_0_15px_rgba(29,185,84,0.5)]"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/50 flex items-center justify-center text-[#1DB954] shadow-[0_0_15px_rgba(29,185,84,0.4)]">
              <User className="w-6 h-6" />
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#1DB954] border-2 border-[#0A0A0C]" />
        </div>

        <div>
          <h2 className="text-base font-bold text-white leading-tight flex items-center gap-2">
            {userName}
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#1DB954]/15 text-[#1DB954] border border-[#1DB954]/30 hidden sm:inline-block">
              ACTIVE SESSION
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">{userEmail || "Spotify OAuth Connected"}</p>
        </div>
      </div>

      {/* Connection Pill & Logout Button */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs text-gray-300">
          <SpotifyIcon className="w-4 h-4 text-[#1DB954]" />
          <span>OAuth 2.0 Connected</span>
        </div>

        <GlassButton
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
          leftIcon={<LogOut className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />}
          className="text-xs font-semibold border-white/15 hover:border-red-500/40 hover:text-red-400 transition-colors"
        >
          Sign Out
        </GlassButton>
      </div>
    </header>
  );
};
