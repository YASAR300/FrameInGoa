"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import PhotoUploadZone from "@/components/PhotoUploadZone";

/* ─── Sparkle SVG ───────────────────────────────────────────────────────── */
function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M10 1 L11.2 8 L18 10 L11.2 12 L10 19 L8.8 12 L2 10 L8.8 8 Z" fill="currentColor" />
    </svg>
  );
}

// Animation easings
const easeOutCubic = [0.25, 0.1, 0.25, 1.0];
const easeBounce = [0.34, 1.35, 0.64, 1];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const mainBgY = useTransform(scrollYProgress, [0, 0.5], ["0%", "10%"]);
  const sunRotate = useTransform(scrollYProgress, [0, 0.5], [0, 90]);

  function handleFileSelected(file: File, dataUrl: string) {
    console.log("File selected:", file.name);
    void dataUrl;
  }

  return (
    <main
      ref={containerRef}
      className="min-h-screen bg-goa-dark-green overflow-x-hidden flex flex-col selection:bg-goa-yellow selection:text-goa-dark-green"
    >
      {/* ════════════════════════════════════════════════════════════════
          MAIN HERO SECTION (With footer-beach.png as Main Background)
      ════════════════════════════════════════════════════════════════ */}
      <section className="relative flex-1 flex flex-col overflow-hidden pb-12" style={{ minHeight: "92vh" }}>

        {/* MAIN BACKGROUND IMAGE: footer-beach.png */}
        <motion.div
          style={{ y: mainBgY }}
          className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden"
        >
          <Image
            src="/assets/footer-beach.png"
            alt="Goa Beach Main Background"
            fill
            priority
            className="object-cover object-center opacity-30 mix-blend-screen"
          />
          {/* Soft dark green overlay gradients for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-goa-dark-green/60 via-transparent to-goa-dark-green/90" />
        </motion.div>

        {/* Animated Sun Asset */}
        <motion.div
          style={{ rotate: sunRotate }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.9, scale: 1 }}
          transition={{ duration: 1, ease: easeOutCubic }}
          className="absolute top-8 right-6 sm:right-20 w-20 sm:w-28 h-20 sm:h-28 pointer-events-none select-none z-10"
        >
          <Image
            src="/assets/sun.png"
            alt="Tropical Goa Sun"
            width={110}
            height={110}
            className="object-contain drop-shadow-[0_0_20px_rgba(255,214,0,0.4)]"
          />
        </motion.div>

        {/* Decorative Sparkles */}
        <Sparkle className="absolute top-28 left-[14%] w-3.5 h-3.5 text-goa-yellow opacity-70 pointer-events-none z-10 animate-pulse" />
        <Sparkle className="absolute top-44 right-[28%] w-3 h-3 text-goa-pink opacity-60 pointer-events-none z-10 animate-pulse" />
        <Sparkle className="absolute top-64 left-[38%] w-2.5 h-2.5 text-goa-yellow/70 opacity-50 pointer-events-none z-10" />

        {/* ════════════════════════════════════════════════════════════════
            DISTRIBUTED STICKER BADGES (Lowered down for clean spacing)
        ════════════════════════════════════════════════════════════════ */}

        {/* 1. Official Stamp Sticker Badge ("Residency 2026") - Mid-Left */}
        <motion.div
          initial={{ opacity: 0, y: -20, rotate: -20, scale: 0.7 }}
          whileInView={{ opacity: 1, y: 0, rotate: -8, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: easeBounce, delay: 0.2 }}
          whileHover={{ scale: 1.1, rotate: -2, transition: { duration: 0.2 } }}
          className="absolute top-64 left-4 sm:left-12 z-20 pointer-events-auto cursor-pointer hidden md:block"
        >
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [-8, -5, -8] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative bg-goa-cream p-2.5 rounded-2xl border-2 border-goa-yellow shadow-[5px_6px_0px_rgba(0,0,0,0.35)]"
          >
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

        {/* 2. Coconut Drink Sticker Badge ("Build & Chill") - Mid-Right */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.8, rotate: 20 }}
          whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 10 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: easeBounce, delay: 0.3 }}
          whileHover={{ scale: 1.12, rotate: 16, transition: { duration: 0.2 } }}
          className="absolute top-72 right-4 sm:right-12 z-20 pointer-events-auto cursor-pointer hidden md:block"
        >
          <motion.div
            animate={{ y: [0, -7, 0], rotate: [10, 14, 10] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative bg-goa-cream p-2.5 rounded-2xl border-2 border-goa-yellow shadow-[5px_6px_0px_rgba(0,0,0,0.35)]"
          >
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

        {/* 3. Beach Signpost Sticker Badge ("Goa Beach HQ") - Lower Left near Upload Card */}
        <motion.div
          initial={{ opacity: 0, x: -60, rotate: -12 }}
          whileInView={{ opacity: 1, x: 0, rotate: 4 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: easeOutCubic, delay: 0.35 }}
          whileHover={{ scale: 1.08, rotate: 0, transition: { duration: 0.2 } }}
          className="absolute bottom-28 left-2 sm:left-10 z-20 pointer-events-auto cursor-pointer hidden lg:block"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative bg-goa-cream p-2.5 rounded-2xl border-2 border-goa-yellow shadow-[6px_8px_0px_rgba(0,0,0,0.4)]"
          >
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

        {/* 4. Retro Scooter Sticker Badge ("Goa Ride") - Lower Right near Upload Card */}
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
        <div className="relative z-10 flex flex-col items-center text-center flex-1 justify-center px-5 sm:px-8 pb-14 max-w-3xl mx-auto w-full">

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
            className="font-sans text-goa-cream/55 text-sm sm:text-[15px] leading-relaxed max-w-xs sm:max-w-sm mb-9"
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

          {/* ── Upload Zone ───────────────────────────────────────── */}
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
          FOOTER SECTION (With leaves-border.png in Footer)
      ════════════════════════════════════════════════════════════════ */}
      <footer className="relative shrink-0 overflow-hidden py-14 mt-auto border-t border-goa-yellow/30">

        {/* FOOTER BACKGROUND IMAGE: leaves-border.png */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
          <Image
            src="/assets/leaves-border.png"
            alt="Tropical Flowers & Leaves Border"
            fill
            className="object-cover object-center opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-goa-dark-green via-goa-dark-green/60 to-goa-dark-green/95" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: easeOutCubic }}
          className="relative z-10 max-w-4xl mx-auto px-6 text-center"
        >
          <div className="inline-block bg-goa-dark-green/80 backdrop-blur-md rounded-2xl p-6 border border-goa-yellow/30 shadow-2xl">
            <p className="font-serif text-goa-yellow text-xl sm:text-2xl font-extrabold tracking-widest uppercase mb-1">
              HACKER HOUSE GOA 2026
            </p>
            <p className="font-sans text-goa-cream text-xs tracking-widest uppercase font-bold mt-1">
              AI × Crypto Builder Residency &nbsp;·&nbsp; by{" "}
              <span className="text-goa-yellow underline">2:47PM Studio</span>
            </p>
            <p className="font-sans text-goa-cream/80 text-[11px] mt-3">
              No login required &nbsp;·&nbsp; Your photo never leaves your device &nbsp;·&nbsp; #FrameInGoa
            </p>
          </div>
        </motion.div>
      </footer>

    </main>
  );
}
