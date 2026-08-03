"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { SpotifyIcon } from "@/components/landing/LandingNav";
import { 
  ArrowLeft, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  RefreshCw
} from "lucide-react";

function LoginContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const [isLoading, setIsLoading] = useState(false);

  const handleSpotifyLogin = async () => {
    try {
      setIsLoading(true);
      await signIn("spotify", { callbackUrl: "/dashboard" });
    } catch (err) {
      console.error("Initiating Spotify signin failed:", err);
      setIsLoading(false);
    }
  };

  // Map NextAuth error codes to user-friendly error messages
  const getErrorMessage = (code: string | null) => {
    if (!code) return null;
    switch (code) {
      case "AccessDenied":
        return {
          title: "Permission Request Denied",
          description: "You canceled or denied the Spotify authorization request. Please accept permissions to explore your music personality.",
        };
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
        return {
          title: "Authentication Connection Error",
          description: "Unable to complete Spotify OAuth handshake. Ensure 'http://localhost:3000/api/auth/callback/spotify' is added in your Spotify Developer Dashboard under Redirect URIs, and your Spotify account email is added under Users and Access.",
        };
      case "Configuration":
        return {
          title: "Spotify API Misconfigured",
          description: "Spotify Client ID or Secret is missing in environment variables. Please check your .env.local configuration.",
        };
      case "RefreshAccessTokenError":
        return {
          title: "Session Expired",
          description: "Your Spotify access token could not be refreshed. Please sign in again to renew your session.",
        };
      default:
        return {
          title: "Authentication Error",
          description: `An unexpected authentication error occurred (${code}). Please try logging in again.`,
        };
    }
  };

  const authError = getErrorMessage(errorCode);

  return (
    <div className="w-full max-w-md relative z-10">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Landing Page</span>
      </Link>

      {/* Auth Error Banner if present */}
      {authError && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/15 border border-red-500/30 backdrop-blur-xl text-left flex items-start gap-3 shadow-[0_0_25px_rgba(239,68,68,0.2)] animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-red-200 uppercase tracking-wide">
              {authError.title}
            </h4>
            <p className="text-xs text-red-300/90 mt-1 leading-relaxed">
              {authError.description}
            </p>
          </div>
        </div>
      )}

      {/* Login Glass Card */}
      <GlassCard
        variant="elevated"
        radius="3xl"
        enableRefraction={true}
        refractionIntensity="intense"
        className="p-8 border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_0_rgba(29,185,84,0.3)] text-center"
      >
        {/* Logo Badge */}
        <div className="w-16 h-16 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/50 shadow-[0_0_25px_rgba(29,185,84,0.6)] flex items-center justify-center mx-auto mb-6">
          <SpotifyIcon className="w-9 h-9 text-[#1DB954]" />
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight mb-2">
          Connect Your Spotify
        </h1>
        <p className="text-xs text-gray-300 mb-8 leading-relaxed">
          Sign in securely with Spotify to generate your OCEAN personality radar and listening profile.
        </p>

        {/* Buttons Group */}
        <div className="flex flex-col gap-3 mb-6">
          <GlassButton
            variant="primary"
            size="lg"
            isLoading={isLoading}
            onClick={handleSpotifyLogin}
            leftIcon={<SpotifyIcon className="w-5 h-5 text-black" />}
            className="w-full justify-center font-bold text-base shadow-[0_0_25px_0_rgba(29,185,84,0.6)] py-3"
          >
            Continue with Spotify
          </GlassButton>

          <Link href="/dashboard" className="w-full">
            <GlassButton
              variant="secondary"
              size="md"
              leftIcon={<RefreshCw className="w-4 h-4 text-purple-400" />}
              className="w-full justify-center font-semibold text-xs border-purple-500/30 text-purple-200 hover:bg-purple-500/10"
            >
              Explore Demo Mode (Instant Preview)
            </GlassButton>
          </Link>
        </div>

        {/* Privacy Note */}
        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 mb-6 flex items-start gap-2 text-left">
          <Info className="w-4 h-4 text-[#1DB954] shrink-0 mt-0.5" />
          <p className="text-[11px] text-gray-300 leading-snug">
            <strong className="text-white font-semibold">Privacy Promise:</strong> We only read your listening data. We never post, modify your library, or change playlists on your Spotify account.
          </p>
        </div>

        {/* Permissions & Security checklist */}
        <div className="pt-6 border-t border-white/10 flex flex-col gap-2.5 text-left text-xs">
          <div className="flex items-center gap-2 text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-[#1DB954]" />
            <span>Top tracks & recently played listening history</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-[#1DB954]" />
            <span>Profile info (email & display name)</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Official OAuth 2.0 PKCE with auto-refresh</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-radial from-[#1DB954]/20 to-transparent blur-3xl pointer-events-none" />

      <Suspense fallback={
        <div className="text-center text-gray-400 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-[#1DB954]" />
          <span>Loading authorization portal...</span>
        </div>
      }>
        <LoginContent />
      </Suspense>
    </main>
  );
}
