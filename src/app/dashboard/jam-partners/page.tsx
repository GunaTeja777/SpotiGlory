"use client";

import React from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { JamPartnersTab } from "@/components/dashboard/JamPartnersTab";

export default function JamPartnersPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* 1. Dashboard Left Glass Sidebar */}
      <DashboardSidebar activeTab="jam-partners" onSelectTab={() => {}} />

      {/* 2. Main Dashboard Content Container */}
      <main className="flex-1 md:ml-72 p-4 md:p-8 pb-24 md:pb-12 max-w-7xl mx-auto w-full transition-all">
        {/* Top User Profile Header Bar */}
        <DashboardHeader />

        {/* Active Tab View */}
        <JamPartnersTab />
      </main>
    </div>
  );
}
