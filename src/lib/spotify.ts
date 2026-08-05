/**
 * Typed Spotify Web API Client
 * 
 * Handles authenticated API calls to Spotify endpoints with rate-limiting (429) backoff
 * and automatic 401 session expiration handling.
 */

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyArtistRef {
  id: string;
  name: string;
  external_urls?: { spotify: string };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  release_date?: string;
  external_urls?: { spotify: string };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtistRef[];
  album: SpotifyAlbum;
  duration_ms: number;
  popularity: number;
  explicit: boolean;
  preview_url: string | null;
  external_urls: { spotify: string };
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  images: SpotifyImage[];
  followers: { total: number };
  popularity: number;
  external_urls: { spotify: string };
}

export interface SpotifyPlayHistory {
  track: SpotifyTrack;
  played_at: string;
  context?: {
    type: string;
    href: string;
  } | null;
}

export interface SpotifyUserProfile {
  id: string;
  display_name: string;
  email: string;
  images: SpotifyImage[];
  followers: { total: number };
  country?: string;
  product?: string;
  external_urls: { spotify: string };
}

export class SpotifyApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "SpotifyApiError";
    this.status = status;
  }
}

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

/**
 * Base helper for Spotify API fetch with 429 rate limit backoff
 */
async function fetchSpotifyApi<T>(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<T> {
  if (!accessToken) {
    throw new SpotifyApiError(401, "No access token provided");
  }

  const url = endpoint.startsWith("http") ? endpoint : `${SPOTIFY_API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // Handle rate limiting (429)
  if (response.status === 429) {
    const retryAfterHeader = response.headers.get("Retry-After");
    const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 1;
    
    if (retryCount < 2) {
      await new Promise((resolve) => setTimeout(resolve, (retryAfterSeconds + 0.5) * 1000));
      return fetchSpotifyApi<T>(endpoint, accessToken, options, retryCount + 1);
    } else {
      throw new SpotifyApiError(429, "Spotify API rate limit exceeded. Please try again shortly.");
    }
  }

  if (response.status === 401) {
    throw new SpotifyApiError(401, "Spotify access token expired or invalid.");
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new SpotifyApiError(
      response.status,
      `Spotify API error (${response.status}): ${errorBody || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Fetch user's top tracks
 * @param timeRange 'short_term' (4 weeks) | 'medium_term' (6 months) | 'long_term' (all time)
 */
export async function getTopTracks(
  accessToken: string,
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
  limit = 20
): Promise<{ items: SpotifyTrack[] }> {
  const params = new URLSearchParams({
    time_range: timeRange,
    limit: limit.toString(),
  });
  return fetchSpotifyApi<{ items: SpotifyTrack[] }>(
    `/me/top/tracks?${params.toString()}`,
    accessToken
  );
}

/**
 * Fetch user's top artists
 */
export async function getTopArtists(
  accessToken: string,
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
  limit = 20
): Promise<{ items: SpotifyArtist[] }> {
  const params = new URLSearchParams({
    time_range: timeRange,
    limit: limit.toString(),
  });
  return fetchSpotifyApi<{ items: SpotifyArtist[] }>(
    `/me/top/artists?${params.toString()}`,
    accessToken
  );
}

/**
 * Fetch user's recently played tracks (up to 50)
 */
export async function getRecentlyPlayed(
  accessToken: string,
  limit = 50
): Promise<{ items: SpotifyPlayHistory[] }> {
  const params = new URLSearchParams({
    limit: limit.toString(),
  });
  return fetchSpotifyApi<{ items: SpotifyPlayHistory[] }>(
    `/me/player/recently-played?${params.toString()}`,
    accessToken
  );
}

/**
 * Fetch current user's profile
 */
export async function getUserProfile(accessToken: string): Promise<SpotifyUserProfile> {
  return fetchSpotifyApi<SpotifyUserProfile>("/me", accessToken);
}

/**
 * Obtains a Spotify Client Credentials access token for public API queries (e.g. searching public playlists)
 */
export async function getClientCredentialsToken(): Promise<string | null> {
  const clientId = (process.env.SPOTIFY_CLIENT_ID || "").trim();
  const clientSecret = (process.env.SPOTIFY_CLIENT_SECRET || "").trim();

  if (!clientId || !clientSecret) return null;

  try {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.access_token || null;
  } catch (error) {
    console.error("Failed to fetch Spotify client credentials token:", error);
    return null;
  }
}

/**
 * Search Spotify for public playlists.
 */
export async function searchSpotifyPlaylists(
  accessToken: string,
  query: string,
  limit = 10
): Promise<any[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      type: "playlist",
      limit: limit.toString(),
    });
    const res = await fetchSpotifyApi<{ playlists?: { items?: any[] } }>(
      `/search?${params.toString()}`,
      accessToken
    );
    return res.playlists?.items || [];
  } catch (e) {
    return [];
  }
}

/**
 * Fetch tracks from a specific Spotify playlist.
 */
export async function fetchSpotifyPlaylistTracks(
  accessToken: string,
  playlistId: string,
  limit = 10
): Promise<any[]> {
  try {
    const res = await fetchSpotifyApi<{ items?: any[] }>(
      `/playlists/${playlistId}/tracks?limit=${limit}`,
      accessToken
    );
    const items = res.items || [];
    return items
      .map((item: any) => item.track)
      .filter(Boolean)
      .map((track: any) => ({
        id: track.id || "",
        name: track.name || "",
        artist: track.artists?.map((a: any) => a.name).join(", ") || "",
        album: track.album?.name || "",
        coverUrl: track.album?.images?.[0]?.url || "",
        previewUrl: track.preview_url,
        spotifyUrl: track.external_urls?.spotify,
        durationMs: track.duration_ms || 0,
        addedBy: "",
      }));
  } catch (e) {
    return [];
  }
}
