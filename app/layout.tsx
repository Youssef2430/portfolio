import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PostHogProvider } from "./providers";
import dynamic from "next/dynamic";
const RaycastAnimatedBackground = dynamic(
  () =>
    import("@/components/ui/raycast-animated-background").then(
      (m) => m.Component,
    ),
  { ssr: false },
);

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Youssef Chouay",
  description:
    "Portfolio of Youssef Chouay, Software Engineer and AI Researcher",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.png" />
      </head>
      <body className={inter.className}>
        <PostHogProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <RaycastAnimatedBackground
              projectIdDark="masbuaiTYfU0XI8OeDl8"
              projectIdLight="zcTTWpmdUZjykDScfsUY"
              jsonFilePathDark="/shaders/dark.json"
              jsonFilePathLight="/shaders/light.json"
            />
            {children}
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
