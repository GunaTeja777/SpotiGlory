"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { SpotifyIcon } from "@/components/landing/LandingNav";
import { 
  LayoutDashboard, 
  Music2, 
  UserCheck, 
  Clock, 
  BrainCircuit, 
  GitCompare,
  UploadCloud, 
  Settings, 
  Lock,
  Sparkles,
  BarChart3,
  Users
} from "lucide-react";

export type NavTab = 
  | "overview" 
  | "top-tracks" 
  | "top-artists" 
  | "listening-patterns" 
  | "debug-features"
  | "model-diff"
  | "personality" 
  | "jam-rooms"
  | "ipip-quiz"
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
    id: "personality",
    label: "Personality Profile",
    icon: <Sparkles className="w-4 h-4 text-[#1DB954]" />,
  },
  {
    id: "jam-rooms",
    label: "Jam Rooms",
    icon: <Users className="w-4 h-4 text-emerald-400" />,
    href: "/dashboard/jam-rooms",
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
    id: "model-diff",
    label: "Model Diff",
    icon: <GitCompare className="w-4 h-4 text-purple-400" />,
    href: "/dashboard/model-diff",
  },
  {
    id: "upload-history",
    label: "Upload Deep History",
    icon: <UploadCloud className="w-4 h-4 text-cyan-400" />,
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
  const router = useRouter();
  const pathname = usePathname();
  const [showDevMode, setShowDevMode] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("spotiglory_dev_mode");
      if (saved === "true") {
        setShowDevMode(true);
      }
    }
  }, []);

  const toggleDevMode = () => {
    const next = !showDevMode;
    setShowDevMode(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("spotiglory_dev_mode", next ? "true" : "false");
    }
  };

  const handleNavClick = (item: NavItemConfig) => {
    if (item.isComingSoon) return;

    if (item.href) {
      if (pathname !== item.href) {
        router.push(item.href);
      }
      return;
    }

    if (pathname !== "/dashboard") {
      if (item.id === "overview") {
        router.push("/dashboard");
      } else {
        router.push(`/dashboard?tab=${item.id}`);
      }
    } else {
      onSelectTab(item.id);
    }
  };

  const filteredItems = navItems.filter((item) => {
    if (!showDevMode && (item.id === "debug-features" || item.id === "model-diff")) {
      return false;
    }
    return true;
  });

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
              <span className="text-[10px] font-mono text-gray-400 mt-1">SPOTIGLORY ANALYTICS</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {filteredItems.map((item) => {
              const isActive = activeTab === item.id;
              const isDisabled = item.isComingSoon;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
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
            })}
          </nav>
        </div>

        {/* Sidebar Footer Badge */}
        <div className="flex flex-col gap-2">
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-[#1DB954] animate-ping" />
              <div className="min-w-0">
                <p className="font-bold text-white text-xs leading-tight">SpotiGlory Engine</p>
                <p className="text-[10px] font-mono text-gray-400">v1.2.0 ML Pipeline</p>
              </div>
            </div>
          </div>

          <button
            onClick={toggleDevMode}
            className="w-full py-1.5 px-3 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-all flex items-center justify-between text-[10px] font-mono text-gray-400 hover:text-purple-300"
          >
            <span>{showDevMode ? "🔧 Dev Tools Active" : "🔒 Dev Tools Hidden"}</span>
            <span className="text-purple-400 font-bold">{showDevMode ? "HIDE" : "SHOW"}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Responsive Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-3 inset-x-3 z-50 bg-[#0F0F14]/95 backdrop-blur-3xl border border-white/20 rounded-full px-3 py-2 shadow-[0_10px_35px_rgba(0,0,0,0.95)] flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
        {filteredItems
          .filter((item) => !item.isComingSoon)
          .map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`p-2.5 rounded-full shrink-0 flex flex-col items-center gap-1 transition-all ${
                  isActive
                    ? "bg-[#1DB954] text-black shadow-[0_0_15px_rgba(29,185,84,0.6)] font-bold scale-105"
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
