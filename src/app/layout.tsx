import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { NotificationBell } from "@/components/notification-bell";
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
  title: "LinkedIn Mission Control",
  description: "Planifie, rédige et publie ton contenu LinkedIn",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-950 text-gray-100">
        <nav className="border-b border-gray-800 bg-gray-900">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-8">
            <Link href="/" className="text-lg font-bold text-blue-400">
              Mission Control
            </Link>
            <div className="flex gap-6 text-sm">
              <Link href="/" className="hover:text-blue-400 transition-colors">
                Dashboard
              </Link>
              <Link href="/editor" className="hover:text-blue-400 transition-colors">
                Nouveau post
              </Link>
              <Link href="/batch" className="hover:text-blue-400 transition-colors">
                Batch
              </Link>
              <Link href="/calendar" className="hover:text-blue-400 transition-colors">
                Calendrier
              </Link>
              <Link href="/ideas" className="hover:text-blue-400 transition-colors">
                Idées
              </Link>
              <Link href="/series" className="hover:text-blue-400 transition-colors">
                Séries
              </Link>
              <Link href="/templates" className="hover:text-blue-400 transition-colors">
                Templates
              </Link>
              <Link href="/analytics" className="hover:text-blue-400 transition-colors">
                Analytics
              </Link>
            </div>
            <div className="ml-auto">
              <NotificationBell />
            </div>
          </div>
        </nav>
        <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
