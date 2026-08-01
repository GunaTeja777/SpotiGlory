import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpotiGlory — Music Personality & Audio DNA",
  description: "Discover your Big Five music personality traits and audio DNA with Liquid Glass UI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0A0A0C] text-gray-100 relative selection:bg-[#1DB954] selection:text-black">
        {/* Ambient Animated Gradient Mesh Backdrop */}
        <div className="ambient-gradient-mesh" aria-hidden="true">
          <div className="ambient-gradient-mesh-accent" />
        </div>
        
        {/* Content Area */}
        <AuthProvider>
          <div className="relative z-10 flex-1">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
