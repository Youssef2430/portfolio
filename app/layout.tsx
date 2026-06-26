import type React from "react";
import type { Metadata } from "next";
import {
  Amiri,
  Aref_Ruqaa,
  Cormorant_Garamond,
  DM_Mono,
  IBM_Plex_Mono,
  Inter,
  Newsreader,
  Oswald,
  Pinyon_Script,
  Roboto_Mono,
} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PostHogProvider } from "./providers";
import { CustomCursor } from "@/components/custom-cursor";
import { ProjectSignatureTransitionProvider } from "@/components/project-signature-transition";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const arefRuqaa = Aref_Ruqaa({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-aref-ruqaa",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-roboto-mono",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

const pinyonScript = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pinyon-script",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant-garamond",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

const fontVariables = [
  inter.variable,
  arefRuqaa.variable,
  amiri.variable,
  robotoMono.variable,
  oswald.variable,
  pinyonScript.variable,
  newsreader.variable,
  dmMono.variable,
  cormorantGaramond.variable,
  ibmPlexMono.variable,
].join(" ");

export const metadata: Metadata = {
  metadataBase: new URL("https://youssefchouay.com"),
  title: "Youssef Chouay | يوسف شواي",
  description:
    "Portfolio of Youssef Chouay, Software Engineer and AI Researcher based in Ottawa, Canada.",
  keywords: [
    "Youssef Chouay",
    "Software Engineer",
    "AI Researcher",
    "Graph Theory",
    "Full Stack Developer",
    "Machine Learning",
  ],
  authors: [{ name: "Youssef Chouay" }],
  creator: "Youssef Chouay",
  publisher: "Youssef Chouay",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Youssef Chouay | يوسف شواي",
    description: "Software Engineer and AI Researcher",
    type: "website",
    url: "/",
    siteName: "Youssef Chouay",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Youssef Chouay | يوسف شواي",
    description: "Software Engineer and AI Researcher",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon-100.png" />
      </head>
      <body className="bg-background text-foreground antialiased">
        <PostHogProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <CustomCursor />
            {children}
            <ProjectSignatureTransitionProvider />
          </ThemeProvider>
        </PostHogProvider>
        <Analytics />
      </body>
    </html>
  );
}
