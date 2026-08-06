"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import PhotoUploadZone from "@/components/PhotoUploadZone";

/* ─── Inline SVG: Palm Tree ─────────────────────────────────────────────── */
function PalmTree({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M80 300 C78 260 74 220 72 180 C70 150 68 115 72 85" stroke="#3d7a4e" strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M84 300 C86 260 90 220 92 180 C94 150 96 115 92 85" stroke="#2d5e3a" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M74 240 Q82 237 90 240" stroke="#2a5235" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M73 210 Q82 207 91 210" stroke="#2a5235" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M72 180 Q82 177 92 180" stroke="#2a5235" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M71 155 Q82 152 93 155" stroke="#2a5235" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M71 130 Q82 127 93 130" stroke="#2a5235" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M72 108 Q82 105 92 108" stroke="#2a5235" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M82 88 C95 70 130 45 155 20" stroke="#1d6e35" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M82 88 C100 72 132 50 155 20 C135 55 105 75 82 88Z" fill="#1a6030" />
      <path d="M80 88 C65 70 30 45 5 20" stroke="#228b3b" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M80 88 C62 72 28 50 5 20 C25 55 55 75 80 88Z" fill="#228b3b" />
      <path d="M84 92 C110 90 140 105 150 130" stroke="#1d6e35" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M84 92 C112 92 142 108 150 130 C130 108 108 95 84 92Z" fill="#196030" />
      <path d="M78 92 C52 90 22 105 12 130" stroke="#228b3b" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M78 92 C50 92 20 108 12 130 C32 108 52 95 78 92Z" fill="#228b3b" />
      <path d="M86 98 C115 108 138 135 132 158" stroke="#196030" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M86 98 C116 110 140 138 132 158 C116 136 108 112 86 98Z" fill="#155228" />
      <path d="M76 98 C47 108 24 135 30 158" stroke="#228b3b" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M76 98 C46 110 22 138 30 158 C46 136 54 112 76 98Z" fill="#1d6e35" />
      <circle cx="83" cy="92" r="7" fill="#b87a2a" />
      <circle cx="76" cy="96" r="6" fill="#c4882a" />
      <circle cx="90" cy="97" r="6" fill="#b87a2a" />
    </svg>
  );
}

/* ─── Inline SVG: Sun ───────────────────────────────────────────────────── */
function Sun({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="22" fill="#FFD600" />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 50 + 26 * Math.cos(rad);
        const y1 = 50 + 26 * Math.sin(rad);
        const len = i % 2 === 0 ? 16 : 10;
        const x2 = 50 + (26 + len) * Math.cos(rad);
        const y2 = 50 + (26 + len) * Math.sin(rad);
        return (
          <line
            key={angle}
            x1={x1.toFixed(2)}
            y1={y1.toFixed(2)}
            x2={x2.toFixed(2)}
            y2={y2.toFixed(2)}
            stroke="#FFD600"
            strokeWidth={i % 2 === 0 ? "3.5" : "2.5"}
            strokeLinecap="round"
          />
        );
      })}
      <circle cx="44" cy="47" r="2.5" fill="#086B3C" />
      <circle cx="56" cy="47" r="2.5" fill="#086B3C" />
      <path d="M44 55 Q50 60 56 55" stroke="#086B3C" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ─── Sparkle ───────────────────────────────────────────────────────────── */
function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M10 1 L11.2 8 L18 10 L11.2 12 L10 19 L8.8 12 L2 10 L8.8 8 Z" fill="currentColor" />
    </svg>
  );
}

// Cubic bezier ease for physics-based smooth motion
const easeOutCubic = [0.25, 0.1, 0.25, 1.0];
const easeBounce = [0.34, 1.35, 0.64, 1];

export default function Home() {
  function handleFileSelected(file: File, dataUrl: string) {
    console.log("File selected:", file.name);
    void dataUrl;
  }

  return (
    <main className="min-h-screen bg-goa-dark-green overflow-x-hidden flex flex-col selection:bg-goa-yellow selection:text-goa-dark-green">

      {/* ── Yellow accent top band ─────────────────────────────────────── */}
      <div className="h-1.5 w-full bg-goa-yellow shrink-0" />

      {/* ════════════════════════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════════════════════════ */}
      <section className="relative flex-1 flex flex-col overflow-hidden" style={{ minHeight: "100vh" }}>

        {/* Background Palm SVG left */}
        <PalmTree className="absolute bottom-0 left-0 w-40 sm:w-56 opacity-25 pointer-events-none select-none z-0" />

        {/* Background Palm SVG right */}
        <PalmTree className="absolute bottom-0 right-0 w-40 sm:w-56 opacity-25 pointer-events-none select-none z-0 scale-x-[-1]" />

        {/* Background Animated Sun */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
          animate={{ opacity: 0.75, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: easeOutCubic }}
          className="absolute top-10 right-8 sm:right-20 w-16 sm:w-20 pointer-events-none select-none z-0"
        >
          <Sun className="w-full h-full" />
        </motion.div>

        {/* Sparkles */}
        <Sparkle className="absolute top-24 left-[15%] w-3 h-3 text-goa-yellow opacity-60 pointer-events-none z-0" />
        <Sparkle className="absolute top-40 right-[25%] w-2.5 h-2.5 text-goa-pink opacity-50 pointer-events-none z-0" />
        <Sparkle className="absolute top-60 left-[40%] w-2 h-2 text-goa-yellow/60 opacity-40 pointer-events-none z-0" />

        {/* ════════════════════════════════════════════════════════════════
            GOA HACKATHON PINNED STICKERS & BADGES (Framer Motion Animated)
        ════════════════════════════════════════════════════════════════ */}

        {/* 1. Official Stamp Sticker Badge (Top Left near Header) */}
        <motion.div
          initial={{ opacity: 0, y: -40, rotate: -20, scale: 0.7 }}
          whileInView={{ opacity: 1, y: 0, rotate: -8, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: easeBounce, delay: 0.2 }}
          whileHover={{ scale: 1.1, rotate: -2, transition: { duration: 0.2 } }}
          className="absolute top-20 left-4 sm:left-10 z-20 pointer-events-auto cursor-pointer hidden md:block"
        >
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [-8, -5, -8] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative bg-goa-cream p-2.5 rounded-2xl border-2 border-goa-yellow shadow-[5px_6px_0px_rgba(0,0,0,0.35)]"
          >
            {/* Pinned Dot */}
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-goa-pink border-2 border-white shadow-md z-10" />
            
            <div className="w-24 sm:w-28 h-auto overflow-hidden rounded-xl bg-white p-1">
              <Image
                src="/assets/sticker-stamp.png"
                alt="Hacker House Goa Official Stamp"
                width={120}
                height={120}
                className="object-contain w-full h-full"
              />
            </div>
            <p className="font-sans text-[9px] font-bold text-center text-goa-dark-green tracking-wider uppercase mt-1">
              Residency 2026
            </p>
          </motion.div>
        </motion.div>

        {/* 2. Beach Signpost Sticker ("BUILD / GOA / RESIDENCY") - Mid Left */}
        <motion.div
          initial={{ opacity: 0, x: -60, rotate: -12 }}
          whileInView={{ opacity: 1, x: 0, rotate: 4 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: easeOutCubic, delay: 0.35 }}
          whileHover={{ scale: 1.08, rotate: 0, transition: { duration: 0.2 } }}
          className="absolute top-64 left-2 sm:left-8 z-20 pointer-events-auto cursor-pointer hidden lg:block"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative bg-goa-cream p-2.5 rounded-2xl border-2 border-goa-yellow shadow-[6px_8px_0px_rgba(0,0,0,0.4)]"
          >
            {/* Pinned Dot */}
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-goa-yellow border-2 border-white shadow-md z-10" />

            <div className="w-28 sm:w-32 h-auto overflow-hidden rounded-xl bg-white p-1">
              <Image
                src="/assets/sticker-signpost.png"
                alt="Build Goa Residency Signpost"
                width={140}
                height={140}
                className="object-contain w-full h-full"
              />
            </div>
            <p className="font-sans text-[9px] font-extrabold text-center text-goa-dark-green tracking-widest uppercase mt-1">
              Goa Beach HQ
            </p>
          </motion.div>
        </motion.div>

        {/* 3. Coconut Drink Sticker - Top Right near Headline */}
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.8, rotate: 20 }}
          whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 10 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: easeBounce, delay: 0.3 }}
          whileHover={{ scale: 1.12, rotate: 16, transition: { duration: 0.2 } }}
          className="absolute top-24 right-4 sm:right-12 z-20 pointer-events-auto cursor-pointer hidden md:block"
        >
          <motion.div
            animate={{ y: [0, -7, 0], rotate: [10, 14, 10] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative bg-goa-cream p-2.5 rounded-2xl border-2 border-goa-yellow shadow-[5px_6px_0px_rgba(0,0,0,0.35)]"
          >
            {/* Pinned Dot */}
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-goa-yellow border-2 border-white shadow-md z-10" />

            <div className="w-24 sm:w-28 h-auto overflow-hidden rounded-xl bg-white p-1">
              <Image
                src="/assets/sticker-coconut.png"
                alt="Goa Beach Coconut Drink"
                width={120}
                height={120}
                className="object-contain w-full h-full"
              />
            </div>
            <p className="font-sans text-[9px] font-bold text-center text-goa-dark-green tracking-wider uppercase mt-1">
              Build & Chill
            </p>
          </motion.div>
        </motion.div>

        {/* 4. Retro Scooter Sticker - Bottom Right near Upload Card */}
        <motion.div
          initial={{ opacity: 0, x: 60, rotate: 15 }}
          whileInView={{ opacity: 1, x: 0, rotate: -6 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: easeOutCubic, delay: 0.4 }}
          whileHover={{ scale: 1.1, rotate: 0, transition: { duration: 0.2 } }}
          className="absolute bottom-20 right-3 sm:right-10 z-20 pointer-events-auto cursor-pointer hidden lg:block"
        >
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
            className="relative bg-goa-cream p-2.5 rounded-2xl border-2 border-goa-yellow shadow-[6px_8px_0px_rgba(0,0,0,0.4)]"
          >
            {/* Pinned Dot */}
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-goa-pink border-2 border-white shadow-md z-10" />

            <div className="w-32 sm:w-36 h-auto overflow-hidden rounded-xl bg-white p-1">
              <Image
                src="/assets/sticker-scooter.png"
                alt="Goa Beach Ride Scooter"
                width={150}
                height={150}
                className="object-contain w-full h-full"
              />
            </div>
            <p className="font-sans text-[9px] font-extrabold text-center text-goa-dark-green tracking-widest uppercase mt-1">
              Goa Ride
            </p>
          </motion.div>
        </motion.div>

        {/* ── NAV HEADER ────────────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOutCubic }}
          className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5 max-w-5xl mx-auto w-full"
        >
          <div>
            <p
              className="font-serif text-goa-yellow leading-none"
              style={{ fontSize: "clamp(1.3rem, 3vw, 2rem)", fontWeight: 800 }}
            >
              HACKER HOUSE
            </p>
            <p className="font-sans text-goa-cream/55 text-[10px] tracking-[0.25em] uppercase mt-0.5">
              Goa 2026 &nbsp;·&nbsp; AI × Crypto
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full border border-goa-yellow/30 bg-black/15 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-goa-yellow animate-pulse" />
            <span className="text-goa-cream/70 text-xs tracking-wide font-medium">Builder Residency</span>
          </div>
        </motion.header>

        {/* ── MAIN HERO CONTENT ─────────────────────────────────────── */}
        <div className="relative z-10 flex flex-col items-center text-center flex-1 justify-center px-5 sm:px-8 pb-16 max-w-3xl mx-auto w-full">

          {/* Eyebrow badge */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOutCubic, delay: 0.1 }}
            className="font-sans text-goa-yellow text-[10px] sm:text-xs tracking-[0.35em] uppercase font-semibold mb-4"
          >
            ✦ &nbsp;Frame In Goa&nbsp; ✦
          </motion.p>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: easeOutCubic, delay: 0.2 }}
            className="font-serif text-goa-cream leading-[0.88] text-balance mb-5"
            style={{ fontSize: "clamp(2.8rem, 9vw, 6rem)", fontWeight: 800 }}
          >
            Your Builder
            <br />
            <em className="text-goa-yellow italic">ID Card</em>
            <br />
            Awaits.
          </motion.h1>

          {/* Sub-copy */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeOutCubic, delay: 0.3 }}
            className="font-sans text-goa-cream/55 text-sm sm:text-[15px] leading-relaxed max-w-xs sm:max-w-sm mb-10"
          >
            Upload your photo → get your Hacker House badge →{" "}
            <strong className="text-goa-cream/80 font-medium">share to X</strong> with{" "}
            <strong className="text-goa-yellow font-semibold">#FrameInGoa</strong>
          </motion.p>

          {/* ── Step Progress Indicator ───────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeOutCubic, delay: 0.4 }}
            className="flex items-center gap-2 w-full max-w-sm mb-5"
          >
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-7 h-7 rounded-full bg-goa-yellow text-goa-dark-green text-sm font-bold flex items-center justify-center shadow-lg shadow-goa-yellow/20">1</span>
              <span className="text-goa-cream/75 text-xs font-medium">Upload photo</span>
            </div>
            <div className="flex-1 h-px bg-goa-cream/15" />
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-7 h-7 rounded-full border border-goa-cream/20 text-goa-cream/30 text-sm font-bold flex items-center justify-center">2</span>
              <span className="hidden sm:block text-goa-cream/30 text-xs font-medium">Add details</span>
            </div>
            <div className="flex-1 h-px bg-goa-cream/15" />
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-7 h-7 rounded-full border border-goa-cream/20 text-goa-cream/30 text-sm font-bold flex items-center justify-center">3</span>
              <span className="hidden sm:block text-goa-cream/30 text-xs font-medium">Get card</span>
            </div>
          </motion.div>

          {/* ── Upload Zone with Entrance Scale ────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: easeOutCubic, delay: 0.5 }}
            className="w-full max-w-md"
          >
            <PhotoUploadZone onFileSelected={handleFileSelected} />
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          TROPICAL FLOWERS SECTION DIVIDER (with Scroll Parallax/Ease)
      ════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 0.9, y: 0 }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{ duration: 0.9, ease: easeOutCubic }}
        className="relative w-full shrink-0 overflow-hidden"
        style={{ height: 110 }}
        aria-hidden="true"
      >
        <Image
          src="/assets/leaves-border.png"
          alt=""
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-goa-dark-green via-transparent to-goa-dark-green/80 pointer-events-none" />
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════
          FOOTER WITH SCROLL REVEAL
      ════════════════════════════════════════════════════════════════ */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: easeOutCubic }}
        className="shrink-0 bg-goa-dark-green py-8 text-center px-5"
      >
        <p className="font-serif text-goa-yellow text-base sm:text-lg font-bold tracking-widest uppercase">
          Hacker House Goa 2026
        </p>
        <p className="font-sans text-goa-cream/40 text-xs tracking-widest uppercase mt-1">
          by 2:47PM Studio
        </p>
        <p className="font-sans text-goa-cream/20 text-[10px] mt-3">
          No login required &nbsp;·&nbsp; Your photo never leaves your device
        </p>
      </motion.footer>

    </main>
  );
}
