import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
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
  title: "Repo Wrapped - GitHub Repository Analytics",
  description:
    "Analytics for your GitHub repositories. Visualize commits, pull requests, code changes, and team contributions across any time period. Perfect for retrospectives, progress tracking, and celebrating your team's achievements.",
  keywords: ["GitHub", "analytics", "repository", "statistics", "metrics", "insights", "wrapped"],
  openGraph: {
    title: "Repo Wrapped - GitHub Repository Analytics",
    description:
      "Analytics for your GitHub repositories. Visualize commits, pull requests, code changes, and team contributions across any time period.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Repo Wrapped - GitHub Repository Analytics",
    description:
      "Analytics for your GitHub repositories. Visualize commits, pull requests, code changes, and team contributions across any time period.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
