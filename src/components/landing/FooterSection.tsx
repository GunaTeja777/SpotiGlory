"use client";

import React from "react";
import Link from "next/link";
import { SpotifyIcon } from "./LandingNav";
import { Disc, Heart, Globe, Share2 } from "lucide-react";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function TwitterIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export const FooterSection: React.FC = () => {
  return (
    <footer id="pricing" className="mt-20 border-t border-white/10 bg-black/40 backdrop-blur-2xl relative z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5 w-fit">
              <div className="w-9 h-9 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/50 flex items-center justify-center">
                <SpotifyIcon className="w-5 h-5 text-[#1DB954]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Spoti<span className="text-[#1DB954]">Glory</span>
              </span>
            </Link>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              Unlocking the psychological dimension of music listening. Built with Next.js, 
              Spotify Web API, and Big Five personality psychometric models.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.12] transition-colors"
                aria-label="X Twitter"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/GunaTeja777/SpotiGlory"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.12] transition-colors"
                aria-label="GitHub"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <Link
                href="/design-preview"
                className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.12] transition-colors"
                aria-label="Design System"
              >
                <Disc className="w-4 h-4 text-[#1DB954]" />
              </Link>
            </div>
          </div>

          {/* Quick Links Column 1 */}
          <div className="md:col-span-2 flex flex-col gap-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">
              Platform
            </h4>
            <a href="#features" className="text-gray-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">
              How it works
            </a>
            <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">
              Pricing Tier
            </a>
            <Link href="/design-preview" className="text-gray-400 hover:text-[#1DB954] transition-colors">
              Design System
            </Link>
          </div>

          {/* Quick Links Column 2 */}
          <div className="md:col-span-2 flex flex-col gap-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">
              Resources
            </h4>
            <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
              Login Portal
            </Link>
            <a href="#features" className="text-gray-400 hover:text-white transition-colors">
              OCEAN Methodology
            </a>
            <a href="#features" className="text-gray-400 hover:text-white transition-colors">
              API Documentation
            </a>
          </div>

          {/* Quick Links Column 3 */}
          <div className="md:col-span-3 flex flex-col gap-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">
              Legal & Privacy
            </h4>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Spotify Developer Guidelines
            </a>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2026 SpotiGlory. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-gray-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>& SpotiGlory Analytics</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
