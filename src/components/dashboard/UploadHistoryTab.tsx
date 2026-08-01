"use client";

import React, { useState, useRef } from "react";
import JSZip from "jszip";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { 
  processExtendedHistoryRecords, 
  AggregatedExtendedHistory, 
  SpotifyExtendedHistoryRecord 
} from "@/lib/extendedHistory";
import { 
  UploadCloud, 
  FileText, 
  Clock, 
  Calendar, 
  Music2, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  FastForward
} from "lucide-react";

export const UploadHistoryTab: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<AggregatedExtendedHistory | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // File processing logic
  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setError(null);
    setProgressMsg("Reading uploaded files...");
    setProgressPct(10);

    const allRecords: SpotifyExtendedHistoryRecord[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.name.toLowerCase();

        if (fileName.endsWith(".zip")) {
          setProgressMsg(`Extracting zip archive: ${file.name}...`);
          setProgressPct(30);

          const zip = await JSZip.loadAsync(file);
          const jsonFiles = Object.keys(zip.files).filter(
            (name) => name.toLowerCase().endsWith(".json") && !name.startsWith("__MACOSX")
          );

          if (jsonFiles.length === 0) {
            throw new Error("No JSON streaming history files found inside the uploaded .zip archive.");
          }

          for (let j = 0; j < jsonFiles.length; j++) {
            const jsonFileName = jsonFiles[j];
            setProgressMsg(`Parsing JSON file (${j + 1}/${jsonFiles.length}): ${jsonFileName}...`);
            const contentStr = await zip.files[jsonFileName].async("text");
            try {
              const parsed = JSON.parse(contentStr);
              if (Array.isArray(parsed)) {
                allRecords.push(...parsed);
              }
            } catch (err) {
              console.warn(`Failed to parse JSON file ${jsonFileName}:`, err);
            }
          }
        } else if (fileName.endsWith(".json")) {
          setProgressMsg(`Parsing JSON file (${i + 1}/${files.length}): ${file.name}...`);
          const text = await file.text();
          try {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed)) {
              allRecords.push(...parsed);
            }
          } catch (err) {
            console.warn(`Failed to parse JSON file ${file.name}:`, err);
          }
        }
      }

      if (allRecords.length === 0) {
        throw new Error("No valid streaming history records were found in the uploaded files.");
      }

      setProgressMsg(`Aggregating ${allRecords.length.toLocaleString()} history records...`);
      setProgressPct(80);

      const aggregated = processExtendedHistoryRecords(allRecords);
      setProgressPct(100);
      setHistoryData(aggregated);
    } catch (err: any) {
      console.error("Error processing history files:", err);
      setError(err.message || "Failed to process Spotify Extended Streaming History files.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Privacy Guarantee & Instructions Banner */}
      <GlassCard variant="elevated" radius="3xl" className="p-6 border-white/18">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-[#1DB954]" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white leading-snug">
              Spotify Extended Streaming History Upload & Deep Analytics
            </h2>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">
              Upload your full raw Spotify streaming history export for all-time playback duration rankings, real skip rates, and multi-year time series.
            </p>

            {/* Instruction Steps */}
            <div className="mt-4 p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2 text-[#1DB954] font-bold">
                <Info className="w-4 h-4" />
                <span>How to get your Extended Streaming History from Spotify:</span>
              </div>
              <ol className="list-decimal list-inside text-gray-300 flex flex-col gap-1 text-[11px] leading-relaxed pl-1 font-mono">
                <li>
                  Go to{" "}
                  <a
                    href="https://www.spotify.com/account/privacy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1DB954] underline inline-flex items-center gap-1 hover:text-white"
                  >
                    spotify.com/account/privacy <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </li>
                <li>Scroll down to <strong>"Download your data"</strong> and check <strong>"Extended streaming history"</strong></li>
                <li>Click <strong>"Request data"</strong> and wait for Spotify's confirmation email (1-5 days)</li>
                <li>Download the <code>my_spotify_data.zip</code> archive and drop it below</li>
              </ol>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Drag and Drop Dropzone */}
      {!historyData && (
        <GlassCard
          variant="interactive"
          radius="3xl"
          enableRefraction={true}
          refractionIntensity="intense"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-10 border-2 border-dashed text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[280px] ${
            isDragging
              ? "border-[#1DB954] bg-[#1DB954]/10 shadow-[0_0_30px_rgba(29,185,84,0.4)]"
              : "border-white/20 hover:border-[#1DB954]/50 bg-white/[0.03]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".zip,.json"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="w-16 h-16 rounded-3xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(29,185,84,0.4)]">
            <UploadCloud className="w-8 h-8 text-[#1DB954]" />
          </div>

          <h3 className="text-xl font-bold text-white mb-2">
            Drag & Drop <code>my_spotify_data.zip</code> or <code>.json</code> files here
          </h3>
          <p className="text-xs text-gray-400 max-w-md leading-relaxed mb-6">
            Client-side in-browser extraction via JSZip. Your raw streaming records stay 100% private in your browser.
          </p>

          <GlassButton variant="primary" size="md" leftIcon={<FileText className="w-4 h-4 text-black" />}>
            Browse Files (.zip / .json)
          </GlassButton>
        </GlassCard>
      )}

      {/* Upload & Unzipping Progress Bar */}
      {isProcessing && (
        <GlassCard variant="elevated" radius="3xl" className="p-8 border-white/20 text-center">
          <div className="w-12 h-12 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-6 h-6 text-[#1DB954] animate-spin" />
          </div>
          <h4 className="text-base font-bold text-white mb-2">{progressMsg}</h4>
          <div className="w-full max-w-md mx-auto h-2 rounded-full bg-white/10 overflow-hidden my-3">
            <div
              className="h-full rounded-full bg-[#1DB954] transition-all duration-300 shadow-[0_0_10px_rgba(29,185,84,0.8)]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs font-mono text-gray-400">{progressPct}% complete</p>
        </GlassCard>
      )}

      {/* Deep History Analytics Dashboard Results */}
      {historyData && (
        <div className="flex flex-col gap-6">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">All-Time Listening Deep Analytics</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Processed {historyData.totalRecordsProcessed.toLocaleString()} streaming events ({historyData.skippedRecordsCount} skipped/malformed)
              </p>
            </div>

            <GlassButton
              variant="ghost"
              size="sm"
              onClick={() => {
                setHistoryData(null);
                setError(null);
              }}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Upload Another Archive
            </GlassButton>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <GlassCard variant="interactive" radius="3xl" className="p-5 border-white/14">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#1DB954]" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1DB954]/15 text-[#1DB954] border border-[#1DB954]/30">
                  ALL-TIME TIME
                </span>
              </div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Time Listened</p>
              <h3 className="text-2xl font-black text-white tracking-tight mt-1">
                {historyData.totalHoursPlayed.toLocaleString()} <span className="text-xs text-gray-400 font-normal">hrs</span>
              </h3>
              <p className="text-[11px] text-gray-400 pt-2 mt-2 border-t border-white/10">
                Equivalent to {historyData.totalDaysPlayed} full days of music
              </p>
            </GlassCard>

            <GlassCard variant="interactive" radius="3xl" className="p-5 border-white/14">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <FastForward className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  SKIP SIGNAL
                </span>
              </div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Real Skip Rate</p>
              <h3 className="text-2xl font-black text-white tracking-tight mt-1">
                {historyData.realSkipRate}%
              </h3>
              <p className="text-[11px] text-gray-400 pt-2 mt-2 border-t border-white/10">
                Tracks skipped before 30 seconds or via forward button
              </p>
            </GlassCard>

            <GlassCard variant="interactive" radius="3xl" className="p-5 border-white/14">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                  <Music2 className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  TOTAL PLAYS
                </span>
              </div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Stream Events</p>
              <h3 className="text-2xl font-black text-white tracking-tight mt-1">
                {historyData.totalRecordsProcessed.toLocaleString()}
              </h3>
              <p className="text-[11px] text-gray-400 pt-2 mt-2 border-t border-white/10">
                Across {historyData.uniqueTracksCount.toLocaleString()} unique tracks
              </p>
            </GlassCard>

            <GlassCard variant="interactive" radius="3xl" className="p-5 border-white/14">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  ARTISTS
                </span>
              </div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Unique Artists</p>
              <h3 className="text-2xl font-black text-white tracking-tight mt-1">
                {historyData.uniqueArtistsCount.toLocaleString()}
              </h3>
              <p className="text-[11px] text-gray-400 pt-2 mt-2 border-t border-white/10">
                Distinct musical creators streamed
              </p>
            </GlassCard>
          </div>

          {/* Monthly Listening Time-Series Bar Chart */}
          {historyData.msPlayedByMonth.length > 0 && (
            <GlassCard variant="elevated" radius="3xl" className="p-6 border-white/18">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-[#1DB954]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-none">Monthly Listening Time-Series</h3>
                    <p className="text-xs text-gray-400 mt-1">Cumulative playback hours bucketed by month</p>
                  </div>
                </div>

                <span className="text-xs font-mono text-[#1DB954]">
                  {historyData.msPlayedByMonth.length} Months Tracked
                </span>
              </div>

              <div className="w-full h-72 my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historyData.msPlayedByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="month" stroke="#94A3B8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} unit="h" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0F0F14",
                        borderColor: "rgba(255,255,255,0.2)",
                        borderRadius: "16px",
                        color: "#FFF",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="hoursPlayed" fill="#1DB954" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          )}

          {/* Top 20 Tracks by Cumulative Playback Duration */}
          <GlassCard variant="elevated" radius="3xl" className="p-6 border-white/18">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Music2 className="w-5 h-5 text-[#1DB954]" />
              <span>Top 20 Tracks by All-Time Cumulative Listening Duration</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {historyData.topTracksByTotalTime.map((item, index) => (
                <div
                  key={`${item.trackName}-${index}`}
                  className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-xs font-black font-mono ${index < 3 ? "text-[#1DB954]" : "text-gray-500"}`}>
                      #{index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{item.trackName}</p>
                      <p className="text-[11px] text-gray-400 truncate">{item.artistName}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono text-xs">
                    <span className="text-[#1DB954] font-bold">{item.hoursPlayed} hrs</span>
                    <p className="text-[10px] text-gray-400">{item.playCount} plays</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Top 20 Artists by Cumulative Playback Duration */}
          <GlassCard variant="elevated" radius="3xl" className="p-6 border-white/18">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-400" />
              <span>Top 20 Artists by All-Time Cumulative Playback Duration</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {historyData.topArtistsByTotalTime.map((item, index) => (
                <div
                  key={`${item.artistName}-${index}`}
                  className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-purple-500/10 hover:border-purple-500/30 flex flex-col justify-between transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-black font-mono ${index < 3 ? "text-purple-400" : "text-gray-500"}`}>
                        #{index + 1}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {item.playCount} plays
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white truncate">{item.artistName}</p>
                  </div>

                  <p className="text-xs font-mono text-[#1DB954] font-bold pt-2 mt-2 border-t border-white/10">
                    {item.hoursPlayed} hours total
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
