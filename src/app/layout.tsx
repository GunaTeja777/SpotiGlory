import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpotiGlory — Liquid Glass Design System",
  description: "A state-of-the-art Liquid Glass design system themed around Spotify.",
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
        <div className="relative z-10 flex-1">{children}</div>
      </body>
    </html>
  );
}
