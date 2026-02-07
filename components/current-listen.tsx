"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Play, Pause } from "lucide-react";

export function CurrentListen() {
  const sectionRef = useRef<HTMLElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Deezer track ID for "SURVIVAL" by Riles (from The 25th Hour)
  const deezerTrackId = "3579494031";

  // Fetch preview URL on mount
  useEffect(() => {
    async function fetchPreview() {
      try {
        const response = await fetch(`/api/music/preview?trackId=${deezerTrackId}`);
        const data = await response.json();
        if (data.previewUrl) {
          setPreviewUrl(data.previewUrl);
        }
      } catch (error) {
        console.error("Failed to fetch preview:", error);
      }
    }
    fetchPreview();
  }, []);

  const handlePlayClick = async () => {
    if (!audioRef.current || !previewUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Playback failed:", error);
      }
      setIsLoading(false);
    }
  };

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  // Reset expanded state when clicking outside (only if not playing)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isExpanded && !isPlaying && !target.closest(".vinyl-container")) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isExpanded, isPlaying]);

  // Vinyl position based on state
  const getVinylX = () => {
    if (isPlaying || isExpanded) return "55%";
    if (isHovered) return "25%";
    return "10%";
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden bg-black"
    >
      {/* Audio element */}
      {previewUrl && (
        <audio ref={audioRef} src={previewUrl} preload="metadata" />
      )}

      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative vinyl-container"
          >
            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center mb-8"
            >
              <span className="bracket-label">Currently On Repeat</span>
            </motion.div>

            {/* Vinyl + Album wrapper */}
            <div
              className="relative flex items-center cursor-pointer"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => !isExpanded && !isPlaying && setIsHovered(false)}
              onClick={(e) => {
                e.stopPropagation();
                if (!isExpanded) {
                  setIsExpanded(true);
                  setIsHovered(true);
                }
              }}
            >
              {/* Vinyl Record */}
              <motion.div
                animate={{
                  x: getVinylX(),
                  rotate: isPlaying ? 360 : 0,
                }}
                transition={
                  isPlaying
                    ? {
                        x: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                        rotate: { duration: 2, ease: "linear", repeat: Infinity },
                      }
                    : {
                        x: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                        rotate: { duration: 0.5 },
                      }
                }
                className="absolute z-0 w-[200px] h-[200px] md:w-[280px] md:h-[280px] top-0 left-0"
                style={{ originX: 0.5, originY: 0.5 }}
              >
                {/* Vinyl base */}
                <div className="relative w-full h-full rounded-full bg-[hsl(42,30%,35%)] shadow-xl">
                  {/* Vinyl grooves */}
                  <div
                    className="absolute inset-2 rounded-full"
                    style={{
                      background: `repeating-radial-gradient(
                        circle at center,
                        hsl(42, 25%, 30%) 0px,
                        hsl(42, 20%, 25%) 1px,
                        hsl(42, 25%, 32%) 2px
                      )`,
                    }}
                  />

                  {/* Inner ring */}
                  <div className="absolute inset-[30%] rounded-full bg-[hsl(0,0%,25%)]">
                    {/* Center label */}
                    <div className="absolute inset-[25%] rounded-full bg-[hsl(0,0%,35%)] flex items-center justify-center">
                      {/* Play/Pause button */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayClick();
                            }}
                            disabled={!previewUrl || isLoading}
                            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? (
                              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ) : isPlaying ? (
                              <Pause className="w-5 h-5 md:w-6 md:h-6 text-black" />
                            ) : (
                              <Play className="w-5 h-5 md:w-6 md:h-6 text-black ml-1" />
                            )}
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Vinyl shine effect */}
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)`,
                    }}
                  />
                </div>
              </motion.div>

              {/* Album Cover */}
              <div className="relative z-10 w-[200px] h-[200px] md:w-[280px] md:h-[280px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/album-cover.jpg"
                  alt="SURVIVAL - Riles"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 200px, 280px"
                />
                {/* Subtle overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />

                {/* White noise/grain texture overlay */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.15] mix-blend-overlay"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                  }}
                />

                {/* Vinyl texture overlay */}
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(circle at 30% 30%, transparent 0%, rgba(0,0,0,0.3) 100%)`,
                  }}
                />
              </div>
            </div>

            {/* Song Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 text-center"
            >
              <span className="bracket-label">Riles - SURVIVAL</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
