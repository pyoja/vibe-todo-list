import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PWAInstallManager } from "@/components/pwa/pwa-manager";
import { PWAInstallBanner } from "@/components/pwa-install-banner"; // by jh 20260205

import { cn } from "@/lib/utils";
import { Noto_Sans_KR, Inter } from "next/font/google"; // 1. Import Inter
import { Toaster } from "sonner";

const fontSans = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontInter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  metadataBase: new URL("https://vibe-todo-list-brown.vercel.app"),
  title: "하루조각 - 당신의 하루를 정리하세요",
  description: "복잡한 일상을 심플하게 관리하는 투두 리스트",
  manifest: "/manifest.json",
  openGraph: {
    title: "하루조각 - 당신의 하루를 정리하세요",
    description: "복잡한 일상을 심플하게 관리하는 투두 리스트",
    url: "/",
    siteName: "하루조각",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "하루조각 - 당신의 하루를 정리하세요",
    description: "복잡한 일상을 심플하게 관리하는 투두 리스트",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontInter.variable, // 2. Add variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <PWAInstallManager />
          <PWAInstallBanner />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
