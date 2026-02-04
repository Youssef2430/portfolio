import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PostHogProvider } from "./providers";
import { CustomCursor } from "@/components/custom-cursor";

export const metadata: Metadata = {
  title: "Youssef Chouay | يوسف شواي",
  description:
    "Portfolio of Youssef Chouay — Software Engineer and AI Researcher based in Ottawa, Canada.",
  keywords: [
    "Youssef Chouay",
    "Software Engineer",
    "AI Researcher",
    "Graph Theory",
    "Full Stack Developer",
    "Machine Learning",
  ],
  authors: [{ name: "Youssef Chouay" }],
  openGraph: {
    title: "Youssef Chouay | يوسف شواي",
    description: "Software Engineer and AI Researcher",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="icon" href="/icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-black text-white antialiased">
        <PostHogProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <CustomCursor />
            {children}
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
