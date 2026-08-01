export interface SpotifyExtendedHistoryRecord {
  ts?: string;
  ms_played?: number;
  master_metadata_track_name?: string | null;
  master_metadata_album_artist_name?: string | null;
  spotify_track_uri?: string | null;
  reason_start?: string | null;
  reason_end?: string | null;
  shuffle?: boolean | null;
  skipped?: boolean | null;
  platform?: string | null;
}

export interface TrackDurationStat {
  trackName: string;
  artistName: string;
  spotifyUri: string;
  totalMsPlayed: number;
  hoursPlayed: number;
  playCount: number;
}

export interface ArtistDurationStat {
  artistName: string;
  totalMsPlayed: number;
  hoursPlayed: number;
  playCount: number;
}

export interface MonthlyDurationStat {
  month: string; // "YYYY-MM"
  msPlayed: number;
  hoursPlayed: number;
  playCount: number;
}

export interface AggregatedExtendedHistory {
  totalMsPlayed: number;
  totalHoursPlayed: number;
  totalDaysPlayed: number;
  totalRecordsProcessed: number;
  skippedRecordsCount: number;
  realSkipRate: number; // percentage 0..100
  msPlayedByMonth: MonthlyDurationStat[];
  topTracksByTotalTime: TrackDurationStat[];
  topArtistsByTotalTime: ArtistDurationStat[];
  uniqueArtistsCount: number;
  uniqueTracksCount: number;
}

/**
 * Processes and aggregates raw Spotify Extended Streaming History records.
 * Calculates all-time hours/days, skip rates, monthly time-series, and playback time rankings.
 */
export function processExtendedHistoryRecords(
  records: SpotifyExtendedHistoryRecord[] = []
): AggregatedExtendedHistory {
  let totalMsPlayed = 0;
  let totalRecordsProcessed = 0;
  let skippedRecordsCount = 0;
  let skippedTracksCount = 0;

  const monthMap: Record<string, { msPlayed: number; playCount: number }> = {};
  const trackMap: Record<string, { trackName: string; artistName: string; spotifyUri: string; msPlayed: number; playCount: number }> = {};
  const artistMap: Record<string, { artistName: string; msPlayed: number; playCount: number }> = {};

  records.forEach((rec) => {
    // Validate record structure
    if (!rec || typeof rec.ms_played !== "number" || !rec.ts) {
      skippedRecordsCount += 1;
      return;
    }

    totalRecordsProcessed += 1;
    totalMsPlayed += rec.ms_played;

    // Detect if track was skipped
    const isSkipped = 
      rec.skipped === true || 
      rec.reason_end === "fwdbtn" || 
      rec.ms_played < 30000;

    if (isSkipped) {
      skippedTracksCount += 1;
    }

    // Month bucketing (YYYY-MM)
    const monthKey = rec.ts.substring(0, 7); // e.g. "2023-08"
    if (monthKey && monthKey.length === 7) {
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { msPlayed: 0, playCount: 0 };
      }
      monthMap[monthKey].msPlayed += rec.ms_played;
      monthMap[monthKey].playCount += 1;
    }

    // Track aggregation
    const trackName = rec.master_metadata_track_name?.trim();
    const artistName = rec.master_metadata_album_artist_name?.trim();
    const spotifyUri = rec.spotify_track_uri || "";

    if (trackName && artistName) {
      const trackKey = spotifyUri || `${artistName} - ${trackName}`;
      if (!trackMap[trackKey]) {
        trackMap[trackKey] = {
          trackName,
          artistName,
          spotifyUri,
          msPlayed: 0,
          playCount: 0,
        };
      }
      trackMap[trackKey].msPlayed += rec.ms_played;
      trackMap[trackKey].playCount += 1;
    }

    // Artist aggregation
    if (artistName) {
      if (!artistMap[artistName]) {
        artistMap[artistName] = { artistName, msPlayed: 0, playCount: 0 };
      }
      artistMap[artistName].msPlayed += rec.ms_played;
      artistMap[artistName].playCount += 1;
    }
  });

  // Convert monthly map to sorted array
  const msPlayedByMonth: MonthlyDurationStat[] = Object.entries(monthMap)
    .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
    .map(([month, data]) => ({
      month,
      msPlayed: data.msPlayed,
      hoursPlayed: Number((data.msPlayed / 3600000).toFixed(1)),
      playCount: data.playCount,
    }));

  // Top Tracks by total time
  const topTracksByTotalTime: TrackDurationStat[] = Object.values(trackMap)
    .sort((a, b) => b.msPlayed - a.msPlayed)
    .slice(0, 20)
    .map((item) => ({
      trackName: item.trackName,
      artistName: item.artistName,
      spotifyUri: item.spotifyUri,
      totalMsPlayed: item.msPlayed,
      hoursPlayed: Number((item.msPlayed / 3600000).toFixed(1)),
      playCount: item.playCount,
    }));

  // Top Artists by total time
  const topArtistsByTotalTime: ArtistDurationStat[] = Object.values(artistMap)
    .sort((a, b) => b.msPlayed - a.msPlayed)
    .slice(0, 20)
    .map((item) => ({
      artistName: item.artistName,
      totalMsPlayed: item.msPlayed,
      hoursPlayed: Number((item.msPlayed / 3600000).toFixed(1)),
      playCount: item.playCount,
    }));

  const totalHoursPlayed = Number((totalMsPlayed / 3600000).toFixed(1));
  const totalDaysPlayed = Number((totalMsPlayed / 86400000).toFixed(1));
  const realSkipRate = totalRecordsProcessed > 0
    ? Math.round((skippedTracksCount / totalRecordsProcessed) * 100)
    : 0;

  return {
    totalMsPlayed,
    totalHoursPlayed,
    totalDaysPlayed,
    totalRecordsProcessed,
    skippedRecordsCount,
    realSkipRate,
    msPlayedByMonth,
    topTracksByTotalTime,
    topArtistsByTotalTime,
    uniqueArtistsCount: Object.keys(artistMap).length,
    uniqueTracksCount: Object.keys(trackMap).length,
  };
}
