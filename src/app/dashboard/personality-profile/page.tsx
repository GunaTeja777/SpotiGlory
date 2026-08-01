"use client";

import React from "react";
import Link from "next/link";
import { PersonalityTab } from "@/components/dashboard/PersonalityTab";
import { ArrowLeft } from "lucide-react";

export default function PersonalityProfilePage() {
  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-radial from-[#1DB954]/15 to-transparent blur-3xl pointer-events-none" />

      {/* Back Link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">
          Your Big Five (OCEAN) Personality Profile
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Empirical music preference mapping based on Rentfrow & Gosling research
        </p>
      </div>

      <PersonalityTab />
    </main>
  );
}
