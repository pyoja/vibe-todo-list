import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

import { cn } from "@/lib/utils";
import { Noto_Sans_KR } from "next/font/google";
import { Toaster } from "sonner";

const fontSans = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "하루조각 - 당신의 하루를 정리하세요",
  description: "당신의 하루를 채우는 작은 조각들",
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
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
