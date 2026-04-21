import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import { ToastProvider } from "@/components/ui/toast";
import { ProfileProvider } from "@/components/profile-provider";
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
  description: "Planifie, rédige et publie ton contenu LinkedIn avec l'IA",
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
      <body className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        <ToastProvider>
          <ProfileProvider>
            <Sidebar />
            {/* Main content — offset by sidebar width */}
            <main className="lg:ml-[240px] min-h-screen transition-all duration-300">
              {/* Top bar with padding for mobile hamburger */}
              <div className="max-w-6xl mx-auto px-6 py-8 lg:pl-8 pl-16">
                {children}
              </div>
            </main>
          </ProfileProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
