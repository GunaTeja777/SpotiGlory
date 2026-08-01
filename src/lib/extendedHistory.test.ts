import assert from "node:assert";
import { test, describe } from "node:test";
import { processExtendedHistoryRecords, SpotifyExtendedHistoryRecord } from "./extendedHistory";

describe("Spotify Extended Streaming History Aggregator", () => {
  test("handles empty array gracefully", () => {
    const res = processExtendedHistoryRecords([]);
    assert.strictEqual(res.totalMsPlayed, 0);
    assert.strictEqual(res.totalHoursPlayed, 0);
    assert.strictEqual(res.totalRecordsProcessed, 0);
    assert.strictEqual(res.skippedRecordsCount, 0);
    assert.strictEqual(res.realSkipRate, 0);
    assert.strictEqual(res.msPlayedByMonth.length, 0);
  });

  test("skips malformed records and counts them", () => {
    const records: SpotifyExtendedHistoryRecord[] = [
      { ts: "2023-08-01T12:00:00Z", ms_played: 180000 },
      { ts: "2023-08-01T12:03:00Z" } as any, // missing ms_played
      { ms_played: 200000 } as any, // missing ts
    ];

    const res = processExtendedHistoryRecords(records);
    assert.strictEqual(res.totalRecordsProcessed, 1);
    assert.strictEqual(res.skippedRecordsCount, 2);
    assert.strictEqual(res.totalMsPlayed, 180000);
  });

  test("calculates real skip rate correctly", () => {
    const records: SpotifyExtendedHistoryRecord[] = [
      { ts: "2023-08-01T12:00:00Z", ms_played: 180000, skipped: false, reason_end: "trackdone" }, // Completed
      { ts: "2023-08-01T12:03:00Z", ms_played: 15000, skipped: true, reason_end: "fwdbtn" }, // Skipped (<30s & fwdbtn)
    ];

    const res = processExtendedHistoryRecords(records);
    assert.strictEqual(res.totalRecordsProcessed, 2);
    assert.strictEqual(res.realSkipRate, 50);
  });

  test("ranks top tracks and artists by cumulative playback duration", () => {
    const records: SpotifyExtendedHistoryRecord[] = [
      {
        ts: "2023-08-01T10:00:00Z",
        ms_played: 300000, // 5 min
        master_metadata_track_name: "Get Lucky",
        master_metadata_album_artist_name: "Daft Punk",
      },
      {
        ts: "2023-08-01T11:00:00Z",
        ms_played: 600000, // 10 min
        master_metadata_track_name: "One More Time",
        master_metadata_album_artist_name: "Daft Punk",
      },
      {
        ts: "2023-08-01T12:00:00Z",
        ms_played: 120000, // 2 min
        master_metadata_track_name: "Starboy",
        master_metadata_album_artist_name: "The Weeknd",
      },
    ];

    const res = processExtendedHistoryRecords(records);
    assert.strictEqual(res.topTracksByTotalTime[0].trackName, "One More Time");
    assert.strictEqual(res.topArtistsByTotalTime[0].artistName, "Daft Punk");
    assert.strictEqual(res.topArtistsByTotalTime[0].playCount, 2);
    assert.strictEqual(res.uniqueArtistsCount, 2);
  });

  test("buckets monthly time-series activity chronologically", () => {
    const records: SpotifyExtendedHistoryRecord[] = [
      { ts: "2023-09-01T10:00:00Z", ms_played: 3600000 }, // Sept
      { ts: "2023-08-01T10:00:00Z", ms_played: 7200000 }, // Aug
    ];

    const res = processExtendedHistoryRecords(records);
    assert.strictEqual(res.msPlayedByMonth.length, 2);
    assert.strictEqual(res.msPlayedByMonth[0].month, "2023-08");
    assert.strictEqual(res.msPlayedByMonth[0].hoursPlayed, 2);
    assert.strictEqual(res.msPlayedByMonth[1].month, "2023-09");
    assert.strictEqual(res.msPlayedByMonth[1].hoursPlayed, 1);
  });
});
