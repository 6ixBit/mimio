import type React from "react";
import type { Metadata } from "next";
import { Geist_Mono as GeistMono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";
import "./globals.css";

const geistMono = GeistMono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mimio - Recreate Viral Formats With One Click",
  description:
    "AI-powered video analysis platform for marketers. Analyze viral videos, extract their format, and automatically post to multiple TikTok accounts.",
  keywords: [
    "AI video analysis",
    "viral marketing",
    "TikTok automation",
    "video generation",
    "social media marketing",
  ],
  authors: [{ name: "Mimio" }],
  creator: "Mimio",
  publisher: "Mimio",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico",
    apple: "/mimio_logo.png",
  },
  openGraph: {
    title: "Mimio - Recreate Viral Formats With One Click",
    description:
      "AI-powered video analysis platform for marketers. Analyze viral videos, extract their format, and automatically post to multiple TikTok accounts.",
    url: "https://mimio.app",
    siteName: "Mimio",
    images: [
      {
        url: "/mimio_logo.png",
        width: 1200,
        height: 630,
        alt: "Mimio - AI Video Analysis Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mimio - Recreate Viral Formats With One Click",
    description:
      "AI-powered video analysis platform for marketers. Analyze viral videos, extract their format, and automatically post to multiple TikTok accounts.",
    images: ["/mimio_logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistMono.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <AuthProvider>{children}</AuthProvider>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
