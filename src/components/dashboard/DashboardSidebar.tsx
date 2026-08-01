"use client";

import React from "react";
import Link from "next/link";
import { SpotifyIcon } from "@/components/landing/LandingNav";
import { 
  LayoutDashboard, 
  Music2, 
  UserCheck, 
  Clock, 
  BrainCircuit, 
  UploadCloud, 
  Settings, 
  Lock,
  Sparkles
} from "lucide-react";

export type NavTab = 
  | "overview" 
  | "top-tracks" 
  | "top-artists" 
  | "listening-patterns" 
  | "debug-features"
  | "personality" 
  | "upload-history" 
  | "settings";

export interface NavItemConfig {
  id: NavTab;
  label: string;
  icon: React.ReactNode;
  isComingSoon?: boolean;
  href?: string;
}

export interface DashboardSidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const navItems: NavItemConfig[] = [
  {
    id: "overview",
    label: "Overview",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    id: "top-tracks",
    label: "Top Tracks",
    icon: <Music2 className="w-4 h-4" />,
  },
  {
    id: "top-artists",
    label: "Top Artists",
    icon: <UserCheck className="w-4 h-4" />,
  },
  {
    id: "listening-patterns",
    label: "Listening Patterns",
    icon: <Clock className="w-4 h-4" />,
  },
  {
    id: "debug-features",
    label: "Debug Features",
    icon: <BrainCircuit className="w-4 h-4 text-purple-400" />,
    href: "/dashboard/debug-features",
  },
  {
    id: "personality",
    label: "Personality Profile",
    icon: <BrainCircuit className="w-4 h-4 text-purple-400" />,
  },
  {
    id: "upload-history",
    label: "Upload Deep History",
    icon: <UploadCloud className="w-4 h-4" />,
    isComingSoon: true,
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings className="w-4 h-4" />,
  },
];

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  return (
    <>
      {/* Desktop Fixed Left Glass Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed left-4 top-4 bottom-4 z-40 bg-white/[0.06] backdrop-blur-2xl border border-white/[0.14] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.25),0_20px_40px_-15px_rgba(0,0,0,0.8)] rounded-3xl p-5 justify-between select-none">
        <div>
          {/* Brand Header */}
          <Link href="/" className="flex items-center gap-2.5 px-2 py-1 mb-8 group">
            <div className="w-9 h-9 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/50 shadow-[0_0_20px_-3px_rgba(29,185,84,0.6)] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <SpotifyIcon className="w-5 h-5 text-[#1DB954]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white leading-none">
                Spoti<span className="text-[#1DB954]">Glory</span>
              </span>
              <span className="text-[10px] font-mono text-gray-400 mt-1">LIQUID GLASS APP</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const isDisabled = item.isComingSoon;

              const content = (
                <button
                  onClick={() => !isDisabled && !item.href && onSelectTab(item.id)}
                  disabled={isDisabled}
                  className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all duration-200 text-left ${
                    isActive
                      ? "bg-[#1DB954] text-black font-bold shadow-[0_0_20px_0_rgba(29,185,84,0.5)]"
                      : isDisabled
                      ? "text-gray-500 cursor-not-allowed opacity-60 bg-transparent"
                      : "text-gray-300 hover:text-white hover:bg-white/[0.08]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>

                  {/* Badge */}
                  {item.isComingSoon && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/10 text-amber-300 border border-amber-300/30">
                      <Lock className="w-2.5 h-2.5" /> SOON
                    </span>
                  )}
                </button>
              );

              if (item.href && !isDisabled) {
                return (
                  <Link key={item.id} href={item.href}>
                    {content}
                  </Link>
                );
              }

              return <React.Fragment key={item.id}>{content}</React.Fragment>;
            })}
          </nav>
        </div>

        {/* Sidebar Footer Badge */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-[#1DB954] animate-ping" />
          <div className="text-[11px]">
            <p className="font-bold text-white leading-tight">Liquid Glass Engine</p>
            <p className="text-gray-400 text-[10px]">Realtime Session Sync</p>
          </div>
        </div>
      </aside>

      {/* Mobile Responsive Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-3 inset-x-3 z-50 bg-[#0F0F14]/90 backdrop-blur-3xl border border-white/20 rounded-full px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.9)] flex items-center justify-around">
        {navItems
          .filter((item) => !item.isComingSoon)
          .map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`p-2.5 rounded-full flex flex-col items-center gap-1 transition-all ${
                  isActive
                    ? "bg-[#1DB954] text-black shadow-[0_0_15px_rgba(29,185,84,0.6)]"
                    : "text-gray-400 hover:text-white"
                }`}
                title={item.label}
              >
                {item.icon}
              </button>
            );
          })}
      </div>
    </>
  );
};
