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
  title: "Repo Wrapped - Your GitHub Year in Review",
  description:
    "Generate a beautiful Instagram Stories-style year-in-review for any GitHub repository. See commits, contributors, PRs, and more!",
  keywords: ["GitHub", "year in review", "repository", "statistics", "wrapped"],
  openGraph: {
    title: "Repo Wrapped - Your GitHub Year in Review",
    description:
      "Generate a beautiful year-in-review for any GitHub repository",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Repo Wrapped - Your GitHub Year in Review",
    description:
      "Generate a beautiful year-in-review for any GitHub repository",
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
