import { NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { JWT } from "next-auth/jwt";

const SPOTIFY_SCOPES = [
  "user-top-read",
  "user-read-recently-played",
  "user-read-email",
  "user-read-private",
].join(" ");

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "f139c88faa15496bbd458ee7394fb2dd";
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || "062f355d18e84c02933320f77f802e4f";

/**
 * Helper to refresh Spotify access token using the refresh token
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID || CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET environment variables.");
    }

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: token.refreshToken as string,
    });

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: params.toString(),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.error("Failed to refresh Spotify access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID || CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET || CLIENT_SECRET,
      authorization: {
        params: {
          scope: SPOTIFY_SCOPES,
          show_dialog: "true",
        },
      },
      profile(profile) {
        return {
          id: profile.id || profile.email || "spotify_user",
          name: profile.display_name || profile.id || "Spotify Listener",
          email: profile.email || `${profile.id || "user"}@spotify.com`,
          image: profile.images?.[0]?.url || profile.images?.[1]?.url || null,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "7VzK9pX3mWq2L8yR1tN4bF0vC5xJ6zQ8sA3uP9dE2gY=",
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "spotify") {
        if (!account.access_token) {
          console.error("Spotify signin failed: No access_token returned by Spotify token endpoint.");
          return false;
        }
      }
      return true;
    },

    async jwt({ token, account, user }) {
      // Initial sign-in
      if (account && user) {
        return {
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          },
        };
      }

      // Return previous token if the access token has not expired yet (with 1 min buffer)
      const expiresAt = (token.accessTokenExpires as number) || 0;
      if (Date.now() < expiresAt - 60 * 1000) {
        return token;
      }

      // Access token has expired, refresh it
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      if (token) {
        session.user = (token.user as any) || session.user;
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
        session.accessTokenExpires = token.accessTokenExpires as number;
        session.error = token.error as string | undefined;
      }
      return session;
    },
  },
};
