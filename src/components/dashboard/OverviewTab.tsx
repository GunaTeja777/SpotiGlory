import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassSkeleton } from "./GlassSkeleton";
import { SpotifyArtist, SpotifyTrack, SpotifyPlayHistory } from "@/lib/spotify";
import { BehavioralFeatures } from "@/lib/features";
import { saveMoodFeedbackSample } from "@/lib/feedbackStore";
import { 
  Disc, 
  BarChart2, 
  Clock, 
  Zap, 
  TrendingUp, 
  PieChart, 
  Calendar,
  Sparkles,
  AlertCircle,
  Heart,
  BrainCircuit,
  Music2,
  Play,
  Pause,
  ExternalLink,
  Moon,
  Flame,
  Sun,
  Wind
} from "lucide-react";

const MOOD_CONFIG = [
  { label: "Reflective", icon: Moon },
  { label: "Energized", icon: Zap },
  { label: "Fiery", icon: Flame },
  { label: "Upbeat", icon: Sun },
  { label: "Calm", icon: Wind },
];

export interface OverviewTabProps {
  isLoading?: boolean;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ isLoading: propIsLoading = false }) => {
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<SpotifyPlayHistory[]>([]);
  const [narrativeData, setNarrativeData] = useState<any>(null);
  const [oceanData, setOceanData] = useState<any>(null);
  const [featuresData, setFeaturesData] = useState<BehavioralFeatures | null>(null);
  const [activeMood, setActiveMood] = useState<{ label: string }>({
    label: "Reflective",
  });
  const [moodOverridden, setMoodOverridden] = useState<boolean>(false);
  const [recommendedTracks, setRecommendedTracks] = useState<SpotifyTrack[]>([]);
  const [recLoading, setRecLoading] = useState<boolean>(false);
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);
  const [playlistCreated, setPlaylistCreated] = useState<boolean>(false);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAllData = async () => {
      setDataLoading(true);
      setError(null);
      try {
        const [artistsRes, shortArtistsRes, longArtistsRes, tracksRes, recentRes, oceanRes, narrativeRes, featuresRes] = await Promise.all([
          fetch("/api/spotify/top-artists?time_range=medium_term&limit=20"),
          fetch("/api/spotify/top-artists?time_range=short_term&limit=20"),
          fetch("/api/spotify/top-artists?time_range=long_term&limit=20"),
          fetch("/api/spotify/top-tracks?time_range=medium_term&limit=20"),
          fetch("/api/spotify/recently-played?limit=50"),
          fetch("/api/analysis/ocean"),
          fetch("/api/analysis/narrative"),
          fetch("/api/analysis/features"),
        ]);

        const artistsData = artistsRes.ok ? await artistsRes.json() : { items: [] };
        const shortData = shortArtistsRes.ok ? await shortArtistsRes.json() : { items: [] };
        const longData = longArtistsRes.ok ? await longArtistsRes.json() : { items: [] };
        const tracksData = tracksRes.ok ? await tracksRes.json() : { items: [] };
        const recentData = recentRes.ok ? await recentRes.json() : { items: [] };
        const oceanParsed = oceanRes.ok ? await oceanRes.json() : null;
        const narrativeParsed = narrativeRes.ok ? await narrativeRes.json() : null;
        const featuresParsed = featuresRes.ok ? await featuresRes.json() : null;

        const artistMap = new Map<string, SpotifyArtist>();
        [...(artistsData.items || []), ...(shortData.items || []), ...(longData.items || [])].forEach((a) => {
          if (a && a.id && !artistMap.has(a.id)) {
            artistMap.set(a.id, a);
          }
        });

        if (isMounted) {
          setTopArtists(Array.from(artistMap.values()));
          setTopTracks(tracksData.items || []);
          setRecentlyPlayed(recentData.items || []);
          setOceanData(oceanParsed);
          setNarrativeData(narrativeParsed);
          setFeaturesData(featuresParsed?.features || null);

          if (featuresParsed?.features?.inferredMood) {
            const raw = featuresParsed.features.inferredMood.label.split(" ")[0] || "Reflective";
            setActiveMood({ label: raw });
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to fetch Spotify analytics data");
        }
      } finally {
        if (isMounted) {
          setDataLoading(false);
        }
      }
    };

    fetchAllData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchRecs = async () => {
      setRecLoading(true);
      try {
        const clusterStr = oceanData?.dominantCluster || "Reflective & Complex";
        const res = await fetch(
          `/api/spotify/recommendations?mood=${encodeURIComponent(activeMood.label)}&dominantCluster=${encodeURIComponent(clusterStr)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setRecommendedTracks(data.tracks || []);
          }
        }
      } catch (e) {
        // Ignore
      } finally {
        if (isMounted) {
          setRecLoading(false);
        }
      }
    };

    fetchRecs();
    return () => {
      isMounted = false;
    };
  }, [activeMood.label, oceanData?.dominantCluster]);

  const togglePlayPreview = (track: SpotifyTrack) => {
    if (!track.preview_url) return;
    if (activePlayingId === track.id) {
      audioObj?.pause();
      setActivePlayingId(null);
      return;
    }

    if (audioObj) {
      audioObj.pause();
    }

    const newAudio = new Audio(track.preview_url);
    newAudio.play();
    newAudio.onended = () => setActivePlayingId(null);
    setAudioObj(newAudio);
    setActivePlayingId(track.id);
  };

  const handleMoreLikeThis = () => {
    setPlaylistCreated(true);
    const primaryArtist = topArtists[0]?.name || "Spotify";
    const searchUrl = `https://open.spotify.com/search/${encodeURIComponent(`${primaryArtist} ${activeMood.label}`)}`;
    window.open(searchUrl, "_blank");
  };

  const isLoading = propIsLoading || dataLoading;

  const localPeakHour = React.useMemo<number | null>(() => {
    if (recentlyPlayed.length > 0) {
      const counts = Array(24).fill(0);
      let validCount = 0;
      recentlyPlayed.forEach((item) => {
        if (item.played_at) {
          const h = new Date(item.played_at).getHours();
          counts[h]++;
          validCount++;
        }
      });
      if (validCount > 0) {
        let max = -1;
        let peak = 0;
        counts.forEach((c, h) => {
          if (c > max) {
            max = c;
            peak = h;
          }
        });
        return peak;
      }
    }

    if (featuresData?.peakListeningHour !== undefined && featuresData.peakListeningHour !== null) {
      const date = new Date();
      date.setUTCHours(featuresData.peakListeningHour, 0, 0, 0);
      return date.getHours();
    }

    return null;
  }, [recentlyPlayed, featuresData?.peakListeningHour]);

  const formatHour = (h: number | null) => {
    if (h === null) return "N/A";
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:00 ${period}`;
  };

  const statCards = [
    {
      title: "Top Genre Focus",
      value: featuresData?.topGenreDistribution?.[0]?.genre || "Eclectic",
      subtitle: `${featuresData?.topGenreDistribution?.[0]?.percentage || 0}% of listening profile`,
      badge: "Mode Genre",
      icon: <Disc className="w-5 h-5 text-[#1DB954]" />,
      badgeColor: "bg-[#1DB954]/15 text-[#1DB954] border-[#1DB954]/30",
    },
    {
      title: "Mainstream Popularity",
      value: `${featuresData?.avgArtistPopularity ?? 0}%`,
      subtitle: "Avg track popularity score",
      badge: "Popularity Index",
      icon: <BarChart2 className="w-5 h-5 text-emerald-400" />,
      badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    {
      title: "Peak Listening Window",
      value: formatHour(localPeakHour),
      subtitle: `${featuresData?.nightListenerRatio ?? 0}% late-night streams (Local)`,
      badge: "Circadian Pulse",
      icon: <Clock className="w-5 h-5 text-cyan-400" />,
      badgeColor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    },
    {
      title: "Taste Diversity Index",
      value: `${featuresData?.genreDiversity?.normalizedEntropy ?? 0.8}`,
      subtitle: `${featuresData?.genreDiversity?.uniqueGenreCount ?? 0} unique genre clusters`,
      badge: "Entropy Score",
      icon: <Zap className="w-5 h-5 text-[#1DB954]" />,
      badgeColor: "bg-[#1DB954]/15 text-[#1DB954] border-[#1DB954]/30",
    },
  ];

  const top5Genres = (featuresData?.topGenreDistribution || []).slice(0, 5);
  const topGenrePercentage = top5Genres[0]?.percentage || 0;
  const topGenreName = top5Genres[0]?.genre || "Eclectic";
  const isNightOwl = localPeakHour !== null ? (localPeakHour >= 22 || localPeakHour <= 4) : false;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const donutColors = ["#1DB954", "#8B5CF6", "#06B6D4", "#F59E0B", "#EC4899"];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <GlassCard key={i} variant="elevated" radius="3xl" className="p-6 border-white/10">
              <div className="flex items-center justify-between mb-4">
                <GlassSkeleton className="w-24 h-4 rounded" />
                <GlassSkeleton className="w-8 h-8 rounded-2xl" />
              </div>
              <GlassSkeleton className="w-32 h-8 rounded-lg mb-2" />
              <GlassSkeleton className="w-40 h-3 rounded" />
            </GlassCard>
          ))}
        </div>
        <GlassCard variant="elevated" radius="3xl" className="p-8 border-white/10">
          <GlassSkeleton className="w-48 h-6 rounded mb-4" />
          <GlassSkeleton className="w-full h-40 rounded-2xl" />
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 🌟 Overview Hero Section */}
      <GlassCard
        variant="elevated"
        radius="3xl"
        enableRefraction={true}
        refractionIntensity="intense"
        className="p-6 sm:p-8 border-purple-500/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_50px_rgba(168,85,247,0.2)] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold tracking-wider uppercase mb-2 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                <BrainCircuit className="w-3.5 h-3.5 text-purple-300" />
                <span>{narrativeData?.narrative?.listeningPersona || "The Sonic Explorer"}</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                {narrativeData?.narrative?.headline || "Your Psychometric Overview"}
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-3xl mt-1.5">
                {narrativeData?.narrative?.summary || "Analyzing streaming patterns and psychometric personality spectrum."}
              </p>
            </div>

            <div className="w-full md:w-auto p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-2 shrink-0">
              <div className="flex items-center justify-between gap-3 text-[11px] font-mono">
                <span className="text-gray-400 uppercase">CURRENT MOOD:</span>
                <span className="px-2 py-0.5 rounded-full bg-[#1DB954]/15 text-[#1DB954] font-bold border border-[#1DB954]/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954] animate-pulse" />
                  <span>Auto-Inferred from Recent Songs</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2.5 text-sm font-bold text-white">
                {(() => {
                  const CurrentIcon = MOOD_CONFIG.find((m) => m.label === activeMood.label)?.icon || Moon;
                  return <CurrentIcon className="w-4 h-4 text-[#1DB954]" />;
                })()}
                <span>Feeling: {featuresData?.inferredMood?.label || activeMood.label}</span>
              </div>
            </div>
          </div>

          {narrativeData?.narrative?.motivationalLine && (
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3">
              <Heart className="w-4 h-4 text-[#1DB954] shrink-0" />
              <p className="text-xs text-gray-200 font-medium italic leading-relaxed">
                &ldquo;{narrativeData.narrative.motivationalLine}&rdquo;
              </p>
            </div>
          )}

          {oceanData?.scores && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mr-1">OCEAN SPECTRUM:</span>
              {[
                { name: "Openness", val: oceanData.scores.openness?.score, color: "border-cyan-500/40 text-cyan-300 bg-cyan-500/10" },
                { name: "Conscientiousness", val: oceanData.scores.conscientiousness?.score, color: "border-purple-500/40 text-purple-300 bg-purple-500/10" },
                { name: "Extraversion", val: oceanData.scores.extraversion?.score, color: "border-[#1DB954]/40 text-[#1DB954] bg-[#1DB954]/10" },
                { name: "Agreeableness", val: oceanData.scores.agreeableness?.score, color: "border-pink-500/40 text-pink-300 bg-pink-500/10" },
                { name: "Neuroticism", val: oceanData.scores.neuroticism?.score, color: "border-amber-500/40 text-amber-300 bg-amber-500/10" },
              ].map((t) => (
                <span
                  key={t.name}
                  className={`px-2.5 py-1 rounded-full border text-[11px] font-mono font-bold flex items-center gap-1 ${t.color}`}
                >
                  <span>{t.name}:</span>
                  <span>{t.val ?? "--"}/100</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </GlassCard>

      <GlassCard
        variant="elevated"
        radius="3xl"
        enableRefraction={true}
        refractionIntensity="medium"
        className="p-6 border-white/18 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.8)]"
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center shadow-[0_0_15px_rgba(29,185,84,0.3)]">
                <Music2 className="w-5 h-5 text-[#1DB954]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">Recommended For You Right Now</h3>
                <p className="text-xs text-gray-400">
                  Seeded by feeling <span className="text-[#1DB954] font-bold">{activeMood.label}</span> & {oceanData?.dominantCluster || "Reflective & Complex"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#1DB954]/15 border border-[#1DB954]/30 text-xs font-mono text-[#1DB954]">
                5 Dynamic Recommendations
              </span>
            </div>
          </div>

          {/* 5 Recommended Track Cards Grid */}
          {recLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 flex flex-col gap-2">
                  <GlassSkeleton className="w-full h-28 rounded-xl" />
                  <GlassSkeleton className="w-20 h-4 rounded" />
                  <GlassSkeleton className="w-16 h-3 rounded" />
                </div>
              ))}
            </div>
          ) : recommendedTracks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {recommendedTracks.slice(0, 5).map((track, idx) => {
                const cover = track.album?.images?.[0]?.url || "";
                const artistStr = track.artists?.map((a) => a.name).join(", ") || "Unknown Artist";
                const isPlaying = activePlayingId === track.id;

                return (
                  <GlassCard
                    key={track.id || idx}
                    variant="interactive"
                    radius="2xl"
                    className="p-3 border-white/14 flex flex-col justify-between gap-3 group hover:border-[#1DB954]/40 transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Album Art & Play Overlay */}
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/10 group-hover:scale-[1.02] transition-transform">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cover} alt={track.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/[0.05]">
                          <Music2 className="w-6 h-6 text-gray-500" />
                        </div>
                      )}

                      {/* Play Preview Overlay Button */}
                      {track.preview_url && (
                        <button
                          onClick={() => togglePlayPreview(track)}
                          className={`absolute inset-0 m-auto w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                            isPlaying
                              ? "bg-[#1DB954] text-black scale-110 shadow-[0_0_15px_rgba(29,185,84,0.8)] font-bold"
                              : "bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-[#1DB954] hover:text-black"
                          }`}
                          title={isPlaying ? "Pause Preview" : "Play 30s Preview"}
                        >
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                        </button>
                      )}
                    </div>

                    {/* Track Info */}
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-[#1DB954] transition-colors">
                        {track.name}
                      </h4>
                      <p className="text-[11px] text-gray-400 truncate">{artistStr}</p>
                    </div>

                    {/* Spotify Direct Link */}
                    {track.external_urls?.spotify && (
                      <a
                        href={track.external_urls.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-gray-400 hover:text-[#1DB954] transition-colors"
                      >
                        <span>Open Spotify</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </GlassCard>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-gray-400">
              No recommendations returned for this mood seed yet. Try selecting another mood above!
            </div>
          )}

          {/* "More like this" Playlist Generator Button */}
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              <Music2 className="w-4 h-4 text-[#1DB954]" />
              Generate an expanded Spotify mix based on your {activeMood.label} mood & {oceanData?.dominantCluster || "Reflective"} cluster.
            </span>

            <GlassButton
              variant="primary"
              size="md"
              onClick={handleMoreLikeThis}
              leftIcon={<Music2 className="w-4 h-4 text-black" />}
              className="w-full sm:w-auto font-bold text-xs shadow-[0_0_20px_rgba(29,185,84,0.5)] shrink-0"
            >
              {playlistCreated ? "Playlist Mix Opened ✓" : "More like this"}
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <GlassCard
            key={card.title}
            variant="interactive"
            radius="3xl"
            enableRefraction={true}
            refractionIntensity="medium"
            className="p-5 border-white/14 flex flex-col justify-between group hover:border-white/30 transition-all duration-300"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                  {card.badge}
                </span>
              </div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                {card.title}
              </p>
              <h3 className="text-2xl font-black text-white tracking-tight mt-1 truncate">
                {card.value}
              </h3>
            </div>
            <p className="text-[11px] text-gray-400 pt-3 mt-3 border-t border-white/10 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-[#1DB954]" />
              <span>{card.subtitle}</span>
            </p>
          </GlassCard>
        ))}
      </div>

      {/* Chart Containers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Genre Distribution Chart */}
        <div className="lg:col-span-7">
          <GlassCard
            variant="elevated"
            radius="3xl"
            enableRefraction={true}
            refractionIntensity="medium"
            className="p-6 border-white/18 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] h-full flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center">
                    <PieChart className="w-4 h-4 text-[#1DB954]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-none">Genre Distribution</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Top 5 primary music styles</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-mono text-gray-300">
                  <Disc className="w-3 h-3 text-[#1DB954]" />
                  <span>Realtime Spotify Parse</span>
                </div>
              </div>

              {/* SVG Ring Donut Visualization */}
              <div className="my-4 p-5 rounded-2xl bg-black/40 border border-white/10 relative overflow-hidden flex flex-col items-center justify-center gap-4 min-h-[220px]">
                {top5Genres.length > 0 ? (
                  <>
                    <div className="relative w-44 h-44 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="38" stroke="rgba(255,255,255,0.08)" strokeWidth="12" fill="none" />
                        {top5Genres.map((g, idx) => {
                          const circumference = 238; // 2 * pi * 38
                          const strokeDasharray = `${(g.percentage / 100) * circumference} ${circumference}`;
                          
                          // Calculate cumulative offset
                          const priorPercentage = top5Genres
                            .slice(0, idx)
                            .reduce((sum, item) => sum + item.percentage, 0);
                          const strokeDashoffset = -((priorPercentage / 100) * circumference);

                          return (
                            <circle
                              key={g.genre}
                              cx="50"
                              cy="50"
                              r="38"
                              stroke={donutColors[idx % donutColors.length]}
                              strokeWidth="12"
                              fill="none"
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                              className="transition-all duration-500"
                            />
                          );
                        })}
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center text-center max-w-[100px]">
                        <span className="text-xl font-black text-white font-mono">{topGenrePercentage}%</span>
                        <span className="text-[10px] text-[#1DB954] font-bold uppercase truncate max-w-full">
                          {topGenreName}
                        </span>
                      </div>
                    </div>

                    {/* Genre Legend Pills */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      {top5Genres.map((g, idx) => (
                        <div key={g.genre} className="flex items-center gap-1.5 text-xs">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: donutColors[idx % donutColors.length] }}
                          />
                          <span className="text-gray-300 capitalize">
                            {g.genre} ({g.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 flex flex-col items-center justify-center max-w-sm">
                    <PieChart className="w-10 h-10 text-gray-500 mb-3 animate-pulse" />
                    <p className="text-xs font-bold text-white mb-1">No Spotify Genre Tags Found</p>
                    <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                      Spotify has not assigned explicit genre tags to your top streamed artists yet, or your listening history is very fresh.
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 bg-white/[0.05] px-3 py-1.5 rounded-full border border-white/10">
                      <span>Tip: Play more tracks or check the </span>
                      <span className="text-[#1DB954] font-bold">Upload Deep History</span>
                      <span> tab</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
              <span>Spotify Web API Endpoint</span>
              <span className="text-[#1DB954] font-mono">Live Session Data</span>
            </div>
          </GlassCard>
        </div>

        {/* 2. Listening-Time Heatmap Chart */}
        <div className="lg:col-span-5">
          <GlassCard
            variant="elevated"
            radius="3xl"
            enableRefraction={true}
            refractionIntensity="medium"
            className="p-6 border-white/18 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] h-full flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-none">Listening-Time Heatmap</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Recently Played Activity</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                  {isNightOwl ? "LATE NIGHTS" : "DAYTIME"}
                </span>
              </div>

              {/* Heatmap Grid Matrix */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-2 min-h-[220px]">
                <div className="flex justify-between text-[10px] text-gray-400 font-mono px-1">
                  <span>12AM</span>
                  <span>6AM</span>
                  <span>12PM</span>
                  <span>6PM</span>
                  <span>11PM</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  {days.map((dayLabel, i) => (
                    <div key={dayLabel} className="flex items-center gap-2">
                      <span className="w-6 text-[10px] font-mono text-gray-400">{dayLabel}</span>
                      <div className="flex-1 grid grid-cols-12 gap-1">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((col) => {
                          const hasRecentActivity = recentlyPlayed.some((item) => {
                            if (!item.played_at) return false;
                            const d = new Date(item.played_at);
                            const day = d.getDay() === 0 ? 6 : d.getDay() - 1;
                            const hourBucket = Math.floor(d.getHours() / 2);
                            return day === i && hourBucket === col;
                          });

                          return (
                            <div
                              key={col}
                              className={`h-4 rounded-md transition-all ${
                                hasRecentActivity
                                  ? "bg-[#1DB954] shadow-[0_0_8px_rgba(29,185,84,0.6)]"
                                  : "bg-white/[0.06]"
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Heatmap Legend */}
                <div className="flex items-center justify-end gap-2 pt-3 text-[10px] text-gray-400 font-mono">
                  <span>Inactive</span>
                  <span className="w-3 h-3 rounded bg-white/[0.06]" />
                  <span className="w-3 h-3 rounded bg-[#1DB954]" />
                  <span>Streamed</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
              <span>Timestamp Parsing</span>
              <span className="text-indigo-400 font-mono">Peak: {formatHour(localPeakHour)}</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
