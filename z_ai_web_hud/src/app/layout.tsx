import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Z-AI | JARVIS Core Interface",
  description: "Advanced Agentic AI Assistant HUD",
};

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased font-sans bg-background text-foreground overflow-hidden`}>
        <div className="crt-overlay" />
        <div className="crt-scan" />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}



