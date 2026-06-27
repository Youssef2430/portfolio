"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Play, Pause, MapPin } from "lucide-react";

const travelPhotos = [
  {
    src: "/travel/amsterdam.jpg",
    alt: "Amsterdam",
    location: "Amsterdam, NL",
    rotate: -6,
    x: "2%",
    y: "0%",
    z: 2,
    width: 160,
    height: 210,
  },
  {
    src: "/travel/barcelona.jpg",
    alt: "Barcelona",
    location: "Barcelona, ES",
    rotate: 4,
    x: "42%",
    y: "-3%",
    z: 3,
    width: 150,
    height: 200,
  },
  {
    src: "/travel/chelsea-cottage.jpg",
    alt: "Chelsea Cottage",
    location: "Chelsea, QC",
    rotate: -2,
    x: "22%",
    y: "15%",
    z: 7,
    width: 145,
    height: 190,
  },
  {
    src: "/travel/french-rivera.jpg",
    alt: "French Riviera",
    location: "Côte d'Azur, FR",
    rotate: 5,
    x: "55%",
    y: "18%",
    z: 4,
    width: 150,
    height: 200,
  },
  {
    src: "/travel/laarache.jpg",
    alt: "Laarache",
    location: "Larache, MA",
    rotate: -4,
    x: "0%",
    y: "35%",
    z: 5,
    width: 155,
    height: 205,
  },
  {
    src: "/travel/nerja.jpg",
    alt: "Nerja",
    location: "Nerja, ES",
    rotate: 7,
    x: "38%",
    y: "38%",
    z: 1,
    width: 140,
    height: 185,
  },
  {
    src: "/travel/nice.jpg",
    alt: "Nice",
    location: "Nice, FR",
    rotate: -3,
    x: "12%",
    y: "55%",
    z: 6,
    width: 155,
    height: 205,
  },
  {
    src: "/travel/ottawa-sunset.jpg",
    alt: "Ottawa Sunset",
    location: "Ottawa, CA",
    rotate: 3,
    x: "50%",
    y: "52%",
    z: 8,
    width: 148,
    height: 195,
  },
  {
    src: "/travel/victoria-islands.jpg",
    alt: "Victoria Islands",
    location: "Victoria, CA",
    rotate: -5,
    x: "28%",
    y: "72%",
    z: 9,
    width: 155,
    height: 200,
  },
];

export function CurrentListen() {
  const sectionRef = useRef<HTMLElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hoveredPhoto, setHoveredPhoto] = useState<number | null>(null);

  // Deezer track ID for "SOMETIMES" by Riles (from The 25th Hour)
  const deezerTrackId = "3579493971";

  // Fetch preview URL on mount
  useEffect(() => {
    async function fetchPreview() {
      try {
        const response = await fetch(
          `/api/music/preview?trackId=${deezerTrackId}`
        );
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
    } else {
      setIsLoading(true);
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error("Playback failed:", error);
        setIsLoading(false);
      }
    }
  };

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [previewUrl]);

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

  // Calculate SVG circle properties for progress ring
  const size = 56;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Static noise background with vertical fade */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          maskImage: `linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)`,
          WebkitMaskImage: `linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)`,
          opacity: 0.08,
        }}
      />

      {/* Audio element */}
      {previewUrl && (
        <audio ref={audioRef} src={previewUrl} preload="metadata" />
      )}

      <div className="container mx-auto px-6 md:px-12">
        {/* Section divider with Arabic text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center gap-4 mb-16 md:mb-24"
        >
          <div className="flex-1 h-px bg-foreground/20" />
          <div className="flex flex-col items-center px-4">
            <span className="text-foreground/40 text-sm mb-1">{"\u300C"}</span>
            <span className="font-arabic text-foreground/60 text-xl md:text-2xl leading-relaxed">
              {"موسيقى & سفر"}
            </span>
            <span className="text-foreground/40 text-sm mt-1">{"\u300D"}</span>
          </div>
          <div className="flex-1 h-px bg-foreground/20" />
        </motion.div>

        {/* ==================== */}
        {/* MAIN SIDE-BY-SIDE LAYOUT */}
        {/* ==================== */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-8 xl:gap-16">
          {/* ==================== */}
          {/* LEFT: Photo Album Collage */}
          {/* ==================== */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full lg:w-1/2 flex flex-col items-center"
          >
            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={
                isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }
              }
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center mb-12"
            >
              <span className="bracket-label">Recent Travels</span>
            </motion.div>

            {/* Photo scatter container */}
            <div className="photo-album-container relative w-[340px] h-[600px] md:w-[420px] md:h-[700px]">
              {travelPhotos.map((photo, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 0,
                    scale: 0.7,
                    rotate: photo.rotate * 2,
                    y: 40,
                  }}
                  animate={
                    isInView
                      ? {
                          opacity: 1,
                          scale: hoveredPhoto === i ? 1.08 : 1,
                          rotate: hoveredPhoto === i ? 0 : photo.rotate,
                          y: 0,
                        }
                      : { opacity: 0, scale: 0.7, rotate: photo.rotate * 2, y: 40 }
                  }
                  transition={{
                    duration: 0.7,
                    delay: 0.15 + i * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                    scale: { duration: 0.4 },
                    rotate: { duration: 0.4 },
                  }}
                  onMouseEnter={() => setHoveredPhoto(i)}
                  onMouseLeave={() => setHoveredPhoto(null)}
                  className="absolute cursor-pointer"
                  style={{
                    left: photo.x,
                    top: photo.y,
                    zIndex: hoveredPhoto === i ? 20 : photo.z,
                    filter:
                      hoveredPhoto !== null && hoveredPhoto !== i
                        ? "brightness(0.6)"
                        : "brightness(1)",
                    transition: "filter 0.4s ease, box-shadow 0.4s ease",
                  }}
                >
                  {/* Polaroid-style photo card */}
                  <div
                    className="photo-card relative bg-[#f5f0e8] p-[6px] pb-[24px] md:p-[8px] md:pb-[28px] shadow-xl"
                    style={{
                      boxShadow:
                        hoveredPhoto === i
                          ? "0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)"
                          : "0 8px 30px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)",
                    }}
                  >
                    <div
                      className="relative overflow-hidden"
                      style={{
                        width: `${photo.width * 0.7}px`,
                        height: `${photo.height * 0.7}px`,
                      }}
                    >
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                      {/* Subtle film grain on each photo */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-[0.12] mix-blend-overlay"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 128 128' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                        }}
                      />
                      {/* Warm vignette */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.15) 100%)",
                        }}
                      />
                    </div>

                    {/* Tape strip decoration on some photos */}
                    {(i === 0 || i === 4 || i === 7) && (
                      <div
                        className="absolute -top-[8px] left-1/2 -translate-x-1/2 w-[40px] md:w-[48px] h-[14px] md:h-[16px]"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.12) 100%)",
                          backdropFilter: "blur(2px)",
                          transform: `translateX(-50%) rotate(${i === 4 ? 2 : i === 7 ? -1 : 0}deg)`,
                        }}
                      />
                    )}

                    {/* Location indicator on hover */}
                    <AnimatePresence>
                      {hoveredPhoto === i && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.2 }}
                          className="absolute bottom-[3px] md:bottom-[4px] left-0 right-0 flex items-center justify-center gap-[3px] pointer-events-none"
                        >
                          <MapPin className="w-[9px] h-[9px] md:w-[10px] md:h-[10px] text-[#8a7a6a]" strokeWidth={2.5} />
                          <span className="text-[8px] md:text-[9px] font-mono tracking-[0.08em] uppercase text-[#8a7a6a]">
                            {photo.location}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}

              {/* Decorative scattered elements */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 0.15 } : { opacity: 0 }}
                transition={{ duration: 1, delay: 1 }}
                className="absolute bottom-4 right-8 font-script text-foreground text-2xl md:text-3xl select-none pointer-events-none"
                style={{ transform: "rotate(-8deg)" }}
              >
                memories
              </motion.div>
            </div>
          </motion.div>

          {/* ==================== */}
          {/* RIGHT: Vinyl / Music Player */}
          {/* ==================== */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{
              duration: 1,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.2,
            }}
            className="relative flex flex-col items-center lg:w-1/2"
          >
            <div className="relative vinyl-container">
              {/* Label */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }
                }
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center mb-8"
              >
                <span className="bracket-label">Currently On Repeat</span>
              </motion.div>

              {/* Vinyl + Album wrapper */}
              <div
                className="relative flex items-center cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() =>
                  !isExpanded && !isPlaying && setIsHovered(false)
                }
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
                  animate={{ x: getVinylX() }}
                  transition={{
                    x: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                  }}
                  className="absolute z-0 w-[200px] h-[200px] md:w-[280px] md:h-[280px] top-0 left-0"
                >
                  {/* Shadow cast by the disc */}
                  <div className="absolute -bottom-4 left-[12%] right-[8%] h-5 rounded-[50%] bg-black/30 blur-lg pointer-events-none" />

                  {/* Rotating disc - spins under the static sheen */}
                  <motion.div
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={
                      isPlaying
                        ? {
                            rotate: {
                              duration: 1.8,
                              ease: "linear",
                              repeat: Infinity,
                            },
                          }
                        : { rotate: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
                    }
                    className="relative w-full h-full rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle at center, hsl(0 0% 13%) 0%, hsl(0 0% 8%) 52%, hsl(0 0% 5%) 100%)",
                    }}
                  >
                    {/* Groove texture */}
                    <div
                      className="absolute inset-[4%] rounded-full"
                      style={{
                        background: `repeating-radial-gradient(
                          circle at center,
                          hsl(0 0% 9%) 0px,
                          hsl(0 0% 13%) 1px,
                          hsl(0 0% 8%) 2px
                        )`,
                      }}
                    />

                    {/* Dead-wax bands separating the "tracks" */}
                    {["60%", "72%", "86%"].map((d) => (
                      <div
                        key={d}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06]"
                        style={{ width: d, height: d }}
                      />
                    ))}

                    {/* Paper label */}
                    <div
                      className="absolute inset-[31%] rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle at 35% 30%, hsl(42 38% 54%) 0%, hsl(40 34% 44%) 60%, hsl(38 30% 37%) 100%)",
                        boxShadow:
                          "0 0 0 2px hsl(0 0% 6%), inset 0 1px 4px rgba(0,0,0,0.25)",
                      }}
                    >
                      {/* Label type - fades out when the play control appears */}
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none"
                        style={{
                          opacity: isExpanded ? 0 : 1,
                          transition: "opacity 0.3s ease",
                        }}
                      >
                        <span className="font-mono text-[8px] md:text-[9px] tracking-[0.3em] uppercase text-black/75">
                          Riles
                        </span>
                        <span className="my-[4px] block h-px w-7 bg-black/30" />
                        <span className="font-mono text-[7px] md:text-[8px] tracking-[0.2em] uppercase text-black/60">
                          Sometimes
                        </span>
                        <span className="mt-[3px] font-mono text-[6px] md:text-[7px] tracking-[0.18em] text-black/40">
                          45 RPM
                        </span>
                      </div>

                      {/* Spindle hole */}
                      <div
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[hsl(0,0%,7%)]"
                        style={{
                          boxShadow:
                            "inset 0 1px 2px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.1)",
                        }}
                      />
                    </div>
                  </motion.div>

                  {/* Static light sheen */}
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background:
                        "conic-gradient(from 210deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.10) 22deg, transparent 60deg, transparent 168deg, rgba(255,255,255,0.06) 200deg, transparent 245deg)",
                    }}
                  />

                  {/* Rim light + depth */}
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      boxShadow:
                        "inset 0 1px 1px rgba(255,255,255,0.18), inset 0 -2px 6px rgba(0,0,0,0.55), 0 12px 35px rgba(0,0,0,0.35)",
                    }}
                  />

                  {/* Play control - static overlay, never rotates with the disc */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.25 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="relative">
                          {/* Progress ring */}
                          <svg
                            className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] -rotate-90"
                            viewBox={`0 0 ${size} ${size}`}
                          >
                            <circle
                              cx={size / 2}
                              cy={size / 2}
                              r={radius}
                              fill="none"
                              stroke="rgba(255,255,255,0.15)"
                              strokeWidth={strokeWidth}
                            />
                            <circle
                              cx={size / 2}
                              cy={size / 2}
                              r={radius}
                              fill="none"
                              stroke="hsl(var(--gold))"
                              strokeWidth={strokeWidth}
                              strokeLinecap="round"
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeDashoffset}
                              className="transition-[stroke-dashoffset] duration-200 ease-linear"
                            />
                          </svg>

                          {/* Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayClick();
                            }}
                            disabled={!previewUrl || isLoading}
                            aria-label={isPlaying ? "Pause preview" : "Play preview"}
                            className="relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-[0_4px_20px_rgba(0,0,0,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : isPlaying ? (
                              <Pause className="w-5 h-5 md:w-6 md:h-6 text-white" />
                            ) : (
                              <Play className="w-5 h-5 md:w-6 md:h-6 text-white ml-1" />
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Album Sleeve */}
                <div className="relative z-10 w-[200px] h-[200px] md:w-[280px] md:h-[280px] rounded-[6px] overflow-hidden shadow-2xl">
                  <Image
                    src="/album-cover.jpg"
                    alt="SOMETIMES - Riles"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 200px, 280px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                  <div
                    className="absolute inset-0 pointer-events-none opacity-[0.15] mix-blend-overlay"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                  />
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage: `radial-gradient(circle at 30% 30%, transparent 0%, rgba(0,0,0,0.3) 100%)`,
                    }}
                  />
                  {/* Opening shadow where the record slips out */}
                  <div
                    className="absolute inset-y-0 right-0 w-10 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to left, rgba(0,0,0,0.35), transparent)",
                    }}
                  />
                  {/* Spine highlight + sleeve edge */}
                  <div className="absolute inset-y-0 left-0 w-px bg-white/20 pointer-events-none" />
                  <div className="absolute inset-0 rounded-[6px] ring-1 ring-white/10 pointer-events-none" />
                </div>
              </div>

              {/* Song Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-8 text-center"
              >
                <span className="inline-flex items-center justify-center gap-3">
                  <span className="bracket-label">Riles - SOMETIMES</span>
                  {isPlaying && (
                    <span className="inline-flex items-end gap-[2px] h-3" aria-hidden>
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-[2px] rounded-full bg-[hsl(var(--gold))]"
                          animate={{ height: ["4px", "12px", "6px", "10px", "4px"] }}
                          transition={{
                            duration: 0.9,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </span>
                  )}
                </span>
                <AnimatePresence>
                  {isExpanded && duration > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-2 font-mono text-[10px] tracking-[0.2em] text-[hsl(var(--foreground-muted))]"
                    >
                      {formatTime((progress / 100) * duration)} /{" "}
                      {formatTime(duration)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
