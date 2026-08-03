"use client";

import React from "react";
import Link from "next/link";
import { IpipQuizTab } from "@/components/dashboard/IpipQuizTab";
import { Sparkles, BrainCircuit, ArrowLeft } from "lucide-react";

export default function IpipQuizPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Back to Dashboard Navigation Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-300 font-bold uppercase tracking-wider mb-1">
            <BrainCircuit className="w-4 h-4 text-purple-400" />
            <span>Psychometric Model Calibration</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            IPIP Ground Truth Quiz & Validation
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            Take the 10-item Mini-IPIP quiz to calculate Pearson correlation (r) against your Spotify music scores.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Learned Ridge Regression</span>
        </div>
      </div>

      <IpipQuizTab />
    </div>
  );
}
