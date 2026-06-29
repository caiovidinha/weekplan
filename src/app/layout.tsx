import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { BottomNav } from "@/components/bottom-nav";
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
  title: "Weekplan",
  description: "Agenda da semana, treinos, hábitos e nutrição em um só lugar.",
  applicationName: "Weekplan",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Weekplan",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#161719",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col">
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-safe pb-4">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
