/**
 * Synthetic User Profiles Data Store & Helper Utilities
 * 
 * Provides structured access to synthetic demo profiles, ensuring they are
 * clearly separated from production analytics data via `isSynthetic: true` flags.
 */

export interface SyntheticUser {
  id: string;
  name: string;
  avatar: string;
  persona: string;
  headline: string;
  isSynthetic: boolean; // Explicit flag to isolate from production real user analytics
  ocean: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  musicClusters: {
    reflectiveComplex: number;
    intenseRebellious: number;
    upbeatConventional: number;
    energeticRhythmic: number;
  };
  currentMood: "Reflective" | "Energized" | "Fiery" | "Upbeat" | "Calm";
  behavioralSignals: {
    topGenre: string;
    peakHour: number; // 0-23 UTC
    nightListenerRatio: number; // 0-100%
    artistLoyalty: number; // 0-1.0
    avgPopularity: number; // 0-100%
  };
}

import syntheticUsersData from "@/data/syntheticUsers.json";

/**
 * Returns all synthetic demo profiles.
 */
export function getSyntheticUsers(): SyntheticUser[] {
  return (syntheticUsersData as SyntheticUser[]).map((user) => ({
    ...user,
    isSynthetic: true,
  }));
}

/**
 * Find a specific synthetic user by ID.
 */
export function getSyntheticUserById(id: string): SyntheticUser | undefined {
  return getSyntheticUsers().find((u) => u.id === id);
}

/**
 * Checks if a given user ID belongs to a synthetic demo profile.
 */
export function isSyntheticUser(id?: string): boolean {
  if (!id) return false;
  return id.startsWith("synth_") || getSyntheticUsers().some((u) => u.id === id);
}
