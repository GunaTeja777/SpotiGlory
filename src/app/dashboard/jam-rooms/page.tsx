"use client";

import React from "react";
import Link from "next/link";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { JamRoomsTab } from "@/components/dashboard/JamRoomsTab";
import { ArrowLeft } from "lucide-react";

export default function JamRoomsPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* 1. Dashboard Left Glass Sidebar */}
      <DashboardSidebar activeTab="jam-rooms" onSelectTab={() => {}} />

      {/* 2. Main Dashboard Content Container */}
      <main className="flex-1 md:ml-72 p-4 md:p-8 pb-24 md:pb-12 max-w-7xl mx-auto w-full transition-all">
        {/* Top User Profile Header Bar */}
        <DashboardHeader />

        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#1DB954]" />
            <span>Back to Main Dashboard</span>
          </Link>
        </div>

        {/* Active Tab View */}
        <JamRoomsTab />
      </main>
    </div>
  );
}
