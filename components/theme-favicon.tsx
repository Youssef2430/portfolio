"use client";
import { useEffect } from "react";
import { useTheme } from "next-themes";

const FAVICON_ID = "theme-favicon";

// Runs before hydration so the first favicon already matches the stored theme.
export const themeFaviconScript = `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||((!t||t==="system")&&matchMedia("(prefers-color-scheme: dark)").matches);var l=document.createElement("link");l.id="${FAVICON_ID}";l.rel="icon";l.type="image/svg+xml";l.href=d?"/favicon-dark.svg":"/favicon-light.svg";document.head.appendChild(l)}catch(e){}})()`;

export function ThemeFavicon() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) return;
    const href = resolvedTheme === "dark" ? "/favicon-dark.svg" : "/favicon-light.svg";
    const current = document.getElementById(FAVICON_ID) as HTMLLinkElement | null;
    if (current?.getAttribute("href") === href) return;

    // Browsers only reliably repaint the tab icon when a new link is inserted.
    current?.remove();
    const link = document.createElement("link");
    link.id = FAVICON_ID;
    link.rel = "icon";
    link.type = "image/svg+xml";
    link.href = href;
    document.head.appendChild(link);
  }, [resolvedTheme]);

  return null;
}
