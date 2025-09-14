"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
// Prefer the Next.js optimized build
import UnicornScene from "unicornstudio-react/next";

/**
 * Hook: track viewport size safely on the client
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    // Initialize on mount
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

/**
 * Hook: detect current theme (light/dark) by watching the <html> class list
 */
export const useTheme = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      if (typeof document === "undefined") return;
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    // Initial check
    checkTheme();

    // Watch for theme toggles
    const observer = new MutationObserver(checkTheme);
    if (typeof document !== "undefined") {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    return () => observer.disconnect();
  }, []);

  return isDark;
};

export type RaycastAnimatedBackgroundProps = {
  /**
   * Tailwind/className overrides for the outer fixed container.
   */
  className?: string;

  /**
   * Unicorn Studio project ID for dark mode.
   */
  projectIdDark: string;
  jsonFilePathDark: string;

  /**
   * Unicorn Studio project ID for light mode.
   */
  projectIdLight: string;
  jsonFilePathLight: string;

  /**
   * Use production CDN (recommended).
   */
  production?: boolean;

  /**
   * Defer scene loading until the element is in the viewport.
   */
  lazyLoad?: boolean;

  /**
   * Rendering scale (lower improves perf, e.g., 0.75).
   */
  scale?: number;

  /**
   * Pixel ratio used for rendering quality.
   */
  dpi?: number;

  /**
   * Optional placeholder (image URL or React node).
   * Shows while loading, on error, and when WebGL isn't supported.
   */
  placeholder?: string | ReactNode;

  /**
   * Optional placeholder classes (when using a CSS placeholder).
   */
  placeholderClassName?: string;

  /**
   * Show placeholder when scene fails to load.
   */
  showPlaceholderOnError?: boolean;

  /**
   * Show placeholder during scene initialization.
   */
  showPlaceholderWhileLoading?: boolean;
};

/**
 * Component: Full-screen, theme-aware Unicorn Studio animated background.
 *
 * - Fixed to the viewport with pointer-events disabled.
 * - Chooses project by current theme (light/dark).
 * - Responsive to window size changes.
 *
 * Note:
 * - Place your page content in a container with a higher z-index (e.g., z-10)
 *   if your backgrounds are opaque.
 */
export const Component = ({
  className,
  projectIdDark,
  projectIdLight,
  jsonFilePathDark,
  jsonFilePathLight,
  production = true,
  lazyLoad = true,
  scale = 1,
  dpi = 1.5,
  placeholder,
  placeholderClassName,
  showPlaceholderOnError = true,
  showPlaceholderWhileLoading = true,
}: RaycastAnimatedBackgroundProps) => {
  const { width, height } = useWindowSize();
  const isDark = useTheme();

  const projectId = isDark ? projectIdDark : projectIdLight;
  const jsonFilePath = isDark ? jsonFilePathDark : jsonFilePathLight;

  // Avoid rendering until we have non-zero viewport dimensions (CSR only)
  const canRender = width > 0 && height > 0 && projectId;

  return (
    <div
      className={cn("fixed inset-0 z-0 pointer-events-none", className)}
      aria-hidden="true"
      role="presentation"
    >
      {canRender ? (
        <UnicornScene
          production={production}
          // projectId={projectId}
          jsonFilePath={jsonFilePath}
          width={width}
          height={height}
          scale={scale}
          dpi={dpi}
          lazyLoad={lazyLoad}
          placeholder={placeholder}
          placeholderClassName={placeholderClassName}
          showPlaceholderOnError={showPlaceholderOnError}
          showPlaceholderWhileLoading={showPlaceholderWhileLoading}
          altText="Animated background"
          ariaLabel="Animated background scene"
          className="w-full h-full"
          onError={(err: unknown) => {
            // Non-blocking: log error for diagnostics
            // eslint-disable-next-line no-console
            console.error("[UnicornScene] load error:", err);
          }}
        />
      ) : null}
    </div>
  );
};

export default Component;
