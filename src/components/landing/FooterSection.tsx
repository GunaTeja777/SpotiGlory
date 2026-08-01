"use client";

import React from "react";
import Link from "next/link";
import { SpotifyIcon } from "./LandingNav";
import { Github, Twitter, Disc, Heart } from "lucide-react";

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
              Unlocking the psychological dimension of music listening. Built with Liquid Glass UI, 
              Spotify Web API, and Big Five personality machine learning models.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.12] transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.12] transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="#design-preview"
                className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.12] transition-colors"
              >
                <Disc className="w-4 h-4 text-[#1DB954]" />
              </a>
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
            <a href="/login" className="text-gray-400 hover:text-white transition-colors">
              Login Portal
            </a>
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
            <span>& Liquid Glass Technology</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
