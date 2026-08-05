"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Disc, Users, Award, Star } from "lucide-react";

export const SocialProofSection: React.FC = () => {
  const [totalReviews, setTotalReviews] = useState<string>("12,430+");
  const [avgRating, setAvgRating] = useState<string>("4.9/5");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/reviews");
        if (res.ok) {
          const data = await res.json();
          if (data.status === "success") {
            setTotalReviews(`${data.totalReviews.toLocaleString()}`);
            setAvgRating(`${data.averageRating.toFixed(1)}/5`);
          }
        }
      } catch (e) {
        // Fallback silently to static stats
      }
    };
    fetchStats();
  }, []);

  const stats = [
    {
      icon: <Disc className="w-5 h-5 text-[#1DB954]" />,
      value: "10M+",
      label: "Tracks Analyzed",
      subtext: "Across 140+ countries",
    },
    {
      icon: <Users className="w-5 h-5 text-purple-400" />,
      value: "500K+",
      label: "Profiles Created",
      subtext: "Big Five music archetypes",
    },
    {
      icon: <Award className="w-5 h-5 text-[#1ED760]" />,
      value: "99.4%",
      label: "Vibe Accuracy",
      subtext: "User feedback score",
    },
    {
      icon: <Star className="w-5 h-5 text-amber-400" />,
      value: avgRating,
      label: "Community Rating",
      subtext: `From ${totalReviews} reviews`,
    },
  ];

  return (
    <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
      >
        <GlassCard
          variant="elevated"
          radius="3xl"
          enableRefraction={true}
          refractionIntensity="medium"
          className="p-8 md:p-10 border-white/20 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8),0_0_30px_0_rgba(29,185,84,0.15)]"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {stats.map((stat, idx) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center text-center ${
                  idx > 0 ? "pt-6 md:pt-0" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center mb-3">
                  {stat.icon}
                </div>
                <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
                  {stat.value}
                </h3>
                <p className="text-sm font-bold text-gray-200 mt-1">
                  {stat.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {stat.subtext}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </section>
  );
};
