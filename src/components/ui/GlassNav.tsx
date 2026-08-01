"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { GlassButton } from "./GlassButton";
import { Music2, Search, Bell, Sparkles, User, Menu, X } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
}

export interface GlassNavProps {
  brandName?: string;
  items?: NavItem[];
  activeHref?: string;
  onSelectTab?: (href: string) => void;
  className?: string;
}

export const GlassNav: React.FC<GlassNavProps> = ({
  brandName = "SpotiGlory",
  items = [
    { label: "Design System", href: "#design-system" },
    { label: "Buttons", href: "#buttons" },
    { label: "Glass Cards", href: "#cards" },
    { label: "Interactive Demo", href: "#interactive" },
  ],
  activeHref = "#design-system",
  onSelectTab,
  className,
}) => {
  const [activeTab, setActiveTab] = useState(activeHref);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab(href);
    if (onSelectTab) {
      onSelectTab(href);
    }
  };

  return (
    <header className={cn("fixed top-4 inset-x-0 z-50 px-4 md:px-8 max-w-7xl mx-auto", className)}>
      <nav className="relative bg-white/[0.06] backdrop-blur-2xl border border-white/[0.14] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.25),0_20px_40px_-15px_rgba(0,0,0,0.6)] rounded-full px-4 py-2.5 flex items-center justify-between transition-all duration-300">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 pl-2">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/40 shadow-[0_0_20px_-3px_rgba(29,185,84,0.5)]">
            <Music2 className="w-5 h-5 text-[#1DB954] animate-pulse" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
            {brandName}
            <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-[#1DB954]/15 text-[#1DB954] border border-[#1DB954]/30">
              v1.0
            </span>
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-black/20 p-1.5 rounded-full border border-white/[0.06]">
          {items.map((item) => {
            const isActive = activeTab === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleTabClick(item.href, e)}
                className={cn(
                  "relative px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 flex items-center gap-2 select-none",
                  isActive
                    ? "text-black font-bold bg-[#1DB954] shadow-[0_0_15px_0_rgba(29,185,84,0.5)]"
                    : "text-gray-300 hover:text-white hover:bg-white/[0.08]"
                )}
              >
                {item.icon}
                {item.label}
              </a>
            );
          })}
        </div>

        {/* Actions & Utilities */}
        <div className="hidden md:flex items-center gap-3">
          {/* Glass Search Input Mock */}
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search components..."
              className="w-36 lg:w-44 h-8 pl-8 pr-3 text-xs bg-white/[0.05] border border-white/[0.1] rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-[#1DB954]/50 focus:bg-white/[0.08] transition-all"
            />
          </div>

          <GlassButton variant="ghost" size="icon" className="w-8 h-8">
            <Bell className="w-4 h-4 text-gray-300" />
          </GlassButton>

          <GlassButton variant="primary" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
            Pro Liquid
          </GlassButton>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <GlassButton
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </GlassButton>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 bg-black/90 backdrop-blur-3xl border border-white/[0.14] rounded-3xl p-4 shadow-2xl flex flex-col gap-2">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                handleTabClick(item.href, e);
                setMobileMenuOpen(false);
              }}
              className={cn(
                "px-4 py-2.5 text-sm font-medium rounded-2xl transition-all flex items-center justify-between",
                activeTab === item.href
                  ? "bg-[#1DB954] text-black font-bold"
                  : "text-gray-200 hover:bg-white/[0.08]"
              )}
            >
              {item.label}
            </a>
          ))}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <GlassButton variant="primary" size="sm" className="w-full">
              Get Started
            </GlassButton>
          </div>
        </div>
      )}
    </header>
  );
};
