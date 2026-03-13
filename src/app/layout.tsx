import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { CaughtProvider } from "@/providers/CaughtProvider";
import Header from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PokeDex | The Ultimate Pokemon Encyclopedia",
  description: "Browse all 1,025 Pokemon with detailed stats, evolution chains, moves, sprites, and more.",
  keywords: ["pokedex", "pokemon", "encyclopedia", "sprites", "stats"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0f0f1a] min-h-screen bg-grid`}
      >
        <QueryProvider>
          <CaughtProvider>
            <Header />
            <main className="max-w-7xl mx-auto px-4 py-6">
              {children}
            </main>
          </CaughtProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
