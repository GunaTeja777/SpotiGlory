"use client";

import React from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FeatureGridSection } from "@/components/landing/FeatureGridSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { FooterSection } from "@/components/landing/FooterSection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative selection:bg-[#1DB954] selection:text-black">
      {/* 1. Sticky Glass Navbar */}
      <LandingNav />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. How It Works Section */}
        <HowItWorksSection />

        {/* 4. Feature Grid Section */}
        <FeatureGridSection />

        {/* 5. Social Proof / Stats Bar */}
        <SocialProofSection />
      </main>

      {/* 6. Glass Textured Footer */}
      <FooterSection />
    </div>
  );
}
