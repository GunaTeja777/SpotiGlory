"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GlassButton } from "@/components/ui/GlassButton";
import { Menu, X, Sparkles } from "lucide-react";

// Spotify SVG Icon Component
export function SpotifyIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.38-1.32 9.84-.66 13.56 1.62.36.18.54.78.181 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z" />
    </svg>
  );
}

export const LandingNav: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <header className="sticky top-0 z-50 px-4 md:px-8 py-4 transition-all duration-300">
      <nav
        className={`max-w-6xl mx-auto rounded-full px-5 py-3 flex items-center justify-between transition-all duration-300 ${
          scrolled
            ? "bg-black/60 backdrop-blur-2xl border border-white/20 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.3),0_20px_40px_-15px_rgba(0,0,0,0.8)]"
            : "bg-white/[0.07] backdrop-blur-xl border border-white/[0.14] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.25),0_10px_30px_-10px_rgba(0,0,0,0.5)]"
        }`}
      >
        {/* Logo / Wordmark Left */}
        <Link href="/" className="flex items-center gap-2.5 group select-none">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/50 shadow-[0_0_20px_-3px_rgba(29,185,84,0.6)] group-hover:scale-105 transition-transform duration-300">
            <SpotifyIcon className="w-5 h-5 text-[#1DB954]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            Spoti<span className="text-[#1DB954]">Glory</span>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#1DB954]/15 text-[#1DB954] border border-[#1DB954]/30 hidden sm:inline-block">
              AI VIBE
            </span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-1 bg-white/[0.04] p-1.5 rounded-full border border-white/[0.08]">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-1.5 text-sm font-medium text-gray-300 hover:text-white rounded-full hover:bg-white/[0.08] transition-all duration-200 select-none"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right CTA Button */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <GlassButton
              variant="primary"
              size="md"
              leftIcon={<SpotifyIcon className="w-5 h-5 text-black" />}
              className="font-bold tracking-wide"
            >
              Login with Spotify
            </GlassButton>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full bg-white/[0.08] text-white hover:bg-white/[0.15] transition-colors border border-white/10"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 max-w-6xl mx-auto bg-[#0F0F14]/95 backdrop-blur-3xl border border-white/20 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-base font-medium text-gray-200 hover:text-white rounded-2xl hover:bg-white/[0.08] transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <GlassButton
                variant="primary"
                size="md"
                leftIcon={<SpotifyIcon className="w-5 h-5 text-black" />}
                className="w-full justify-center font-bold"
              >
                Login with Spotify
              </GlassButton>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
