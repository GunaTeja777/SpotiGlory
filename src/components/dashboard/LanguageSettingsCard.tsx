"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SUPPORTED_LANGUAGES, SupportedLanguage, inferLanguageFromArtists } from "@/lib/userTasteProfile";
import { Globe, Check, Sparkles } from "lucide-react";

export const LanguageSettingsCard: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const [isInferred, setIsInferred] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check if user already saved language preference in localStorage / settings
    const saved = localStorage.getItem("spotiglory_user_language");
    if (saved && saved.trim()) {
      setSelectedLanguage(saved.trim());
      setIsInferred(false);
      return;
    }

    // 2. Otherwise infer from artist market data
    const fetchInferredLanguage = async () => {
      try {
        const res = await fetch("/api/spotify/top-artists").catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          if (data.items && data.items.length > 0) {
            const inferred = inferLanguageFromArtists(data.items);
            setSelectedLanguage(inferred);
            setIsInferred(true);
          }
        }
      } catch (e) {
        // Fallback to English
      }
    };

    fetchInferredLanguage();
  }, []);

  const handleSelectLanguage = (lang: string) => {
    setSelectedLanguage(lang);
    setIsInferred(false);
    localStorage.setItem("spotiglory_user_language", lang);

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <GlassCard variant="elevated" radius="2xl" className="p-6 border-white/18 text-left">
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Globe className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Music & Playlist Language Preference</h4>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Used for sourcing tailored room playlists and regional music discovery
            </p>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1 shrink-0 ${
            isInferred
              ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
              : "bg-[#1DB954]/20 text-[#1DB954] border-[#1DB954]/40"
          }`}
        >
          {isInferred ? <Sparkles className="w-3 h-3 text-purple-300" /> : <Check className="w-3 h-3 text-[#1DB954]" />}
          {isInferred ? "Inferred from Market Data" : "Saved Preference"}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs text-gray-300 font-medium">Select your primary preferred music language:</p>

        {/* Language Grid Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang;
            return (
              <button
                key={lang}
                onClick={() => handleSelectLanguage(lang)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between ${
                  isSelected
                    ? "bg-[#1DB954] text-black border-[#1DB954] font-bold shadow-[0_0_15px_rgba(29,185,84,0.4)]"
                    : "bg-white/[0.04] text-gray-300 border-white/10 hover:bg-white/[0.08] hover:border-white/20 hover:text-white"
                }`}
              >
                <span>{lang}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-black shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>

        {isSaved && (
          <p className="text-[11px] font-mono text-[#1DB954] flex items-center gap-1 mt-1">
            <Check className="w-3.5 h-3.5" /> Language preference saved for playlist sourcing!
          </p>
        )}
      </div>
    </GlassCard>
  );
};
