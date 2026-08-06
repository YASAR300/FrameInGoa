"use client";

import PhotoUploadZone from "@/components/PhotoUploadZone";

// ─── Inline SVG Illustrations ─────────────────────────────────────────────────

function PalmTreeLeft() {
  return (
    <svg
      viewBox="0 0 120 220"
      fill="none"
      className="w-full h-full"
      aria-hidden="true"
    >
      {/* Trunk */}
      <path
        d="M60 220 C58 190, 55 160, 62 130 C68 100, 65 80, 60 60"
        stroke="#05552F"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M60 220 C62 190, 65 160, 58 130 C52 100, 55 80, 60 60"
        stroke="#086B3C"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Fronds */}
      <path d="M60 60 C40 40, 10 45, 5 20" stroke="#086B3C" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M60 60 C80 38, 110 40, 115 15" stroke="#086B3C" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M60 60 C35 55, 8 65, 2 50" stroke="#05552F" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M60 60 C85 55, 112 68, 118 52" stroke="#05552F" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M60 60 C55 38, 45 15, 30 8" stroke="#086B3C" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M60 60 C65 38, 78 16, 92 10" stroke="#086B3C" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Coconuts */}
      <circle cx="62" cy="68" r="5" fill="#FFD600" opacity="0.8"/>
      <circle cx="56" cy="74" r="4" fill="#FFD600" opacity="0.7"/>
    </svg>
  );
}

// Pre-computed sun ray endpoints to avoid SSR/hydration mismatch
// Each entry: [x1, y1, x2, y2] for angles 0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330
const SUN_RAYS: [number, number, number, number][] = [
  [82, 50, 94, 50],
  [77.71, 66, 87.42, 72],
  [66, 77.71, 72, 87.42],
  [50, 82, 50, 94],
  [34, 77.71, 28, 87.42],
  [22.29, 66, 12.58, 72],
  [18, 50, 6, 50],
  [22.29, 34, 12.58, 28],
  [34, 22.29, 28, 12.58],
  [50, 18, 50, 6],
  [66, 22.29, 72, 12.58],
  [77.71, 34, 87.42, 28],
];

function SunIllustration() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full" aria-hidden="true">
      <circle cx="50" cy="50" r="28" fill="#FFD600"/>
      {SUN_RAYS.map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#FFD600"
          strokeWidth={i % 2 === 0 ? "3" : "2"}
          strokeLinecap="round"
        />
      ))}
      <circle cx="50" cy="50" r="22" fill="#FFD600" opacity="0.6"/>
    </svg>
  );
}

function StarSparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 2 L13.5 9 L20 10 L13.5 11.5 L12 18 L10.5 11.5 L4 10 L10.5 9 Z"
        fill="currentColor"
      />
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  function handleFileSelected(file: File, dataUrl: string) {
    // Phase 2: navigation to the form will go here
    console.log("File selected:", file.name, "size:", file.size, "preview ready");
    void dataUrl; // used by the preview in the component itself
  }

  return (
    <main className="min-h-screen bg-goa-dark-green overflow-x-hidden">

      {/* ── Decorative top band ──────────────────────────────────────────── */}
      <div className="h-1.5 w-full bg-goa-yellow" aria-hidden="true" />

      {/* ── Header / Nav ─────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 sm:px-8 py-5 max-w-5xl mx-auto">
        {/* Logo lockup */}
        <div className="flex flex-col leading-none">
          <span
            className="font-serif text-goa-yellow tracking-tight"
            style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 700 }}
          >
            HACKER HOUSE
          </span>
          <span className="font-sans text-goa-cream/70 text-xs tracking-[0.25em] uppercase mt-0.5">
            Goa 2026 &nbsp;·&nbsp; AI × Crypto
          </span>
        </div>

        {/* Pill tag */}
        <div className="hidden sm:flex items-center gap-2 border border-goa-yellow/40 rounded-full px-4 py-1.5">
          <span className="w-2 h-2 rounded-full bg-goa-yellow animate-pulse-slow" />
          <span className="text-goa-cream/80 text-xs font-medium tracking-wide">
            Builder Residency
          </span>
        </div>
      </header>

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative px-5 sm:px-8 pt-8 pb-16 max-w-5xl mx-auto">

        {/* Background decorative elements */}
        <div
          className="absolute top-0 right-0 w-48 h-48 opacity-10 pointer-events-none"
          aria-hidden="true"
        >
          <PalmTreeLeft />
        </div>
        <div
          className="absolute top-10 left-0 w-32 h-32 opacity-8 pointer-events-none -scale-x-100"
          aria-hidden="true"
        >
          <PalmTreeLeft />
        </div>
        <div
          className="absolute top-8 right-16 sm:right-40 w-20 h-20 opacity-25 pointer-events-none"
          aria-hidden="true"
        >
          <SunIllustration />
        </div>

        {/* Sparkles */}
        <StarSparkle className="absolute top-16 left-6 w-4 h-4 text-goa-yellow opacity-50 pointer-events-none" />
        <StarSparkle className="absolute top-32 right-8 w-3 h-3 text-goa-pink opacity-50 pointer-events-none" />
        <StarSparkle className="absolute top-48 left-1/4 w-2.5 h-2.5 text-goa-yellow/70 opacity-40 pointer-events-none" />

        {/* Hero heading */}
        <div className="text-center mb-3">
          <p className="font-sans text-goa-yellow text-xs sm:text-sm tracking-[0.3em] uppercase font-semibold mb-3">
            ✦ &nbsp;Frame In Goa&nbsp; ✦
          </p>
          <h1
            className="font-serif text-goa-cream leading-[0.92] text-balance"
            style={{ fontSize: "clamp(3rem, 10vw, 6.5rem)", fontWeight: 700 }}
          >
            Your Builder
            <br />
            <span className="text-goa-yellow italic">ID Card</span>
            <br />
            Awaits.
          </h1>
        </div>

        {/* Sub-copy */}
        <p className="font-sans text-goa-cream/65 text-center max-w-sm mx-auto text-sm sm:text-base leading-relaxed mt-5 mb-12">
          Upload your photo → get your Hacker House badge →&nbsp;
          <span className="text-goa-cream/90 font-medium">share to X</span> with{" "}
          <span className="text-goa-yellow font-semibold">#FrameInGoa</span>
        </p>

        {/* ── Upload Zone ──────────────────────────────────────────────── */}
        <div className="relative z-10">
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-5 max-w-md mx-auto">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-goa-yellow text-goa-dark-green font-bold text-sm shrink-0">
              1
            </div>
            <span className="text-goa-cream/80 text-sm font-medium">
              Upload your photo
            </span>
            <div className="flex-1 h-px bg-goa-cream/20" />
            <div className="flex items-center justify-center w-7 h-7 rounded-full border border-goa-cream/25 text-goa-cream/35 font-bold text-sm shrink-0">
              2
            </div>
            <div className="flex items-center justify-center w-7 h-7 rounded-full border border-goa-cream/25 text-goa-cream/35 font-bold text-sm shrink-0">
              3
            </div>
          </div>

          <PhotoUploadZone onFileSelected={handleFileSelected} />
        </div>
      </section>

      {/* ── Beach divider illustration ────────────────────────────────────── */}
      <div aria-hidden="true" className="relative w-full overflow-hidden" style={{ height: 64 }}>
        <svg
          viewBox="0 0 1440 64"
          preserveAspectRatio="none"
          className="w-full h-full"
          fill="none"
        >
          {/* Waves */}
          <path
            d="M0 32 Q180 8 360 32 Q540 56 720 32 Q900 8 1080 32 Q1260 56 1440 32 L1440 64 L0 64 Z"
            fill="#05552F"
          />
          <path
            d="M0 40 Q180 20 360 40 Q540 60 720 40 Q900 20 1080 40 Q1260 60 1440 40 L1440 64 L0 64 Z"
            fill="#086B3C"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* ── Footer strip ─────────────────────────────────────────────────── */}
      <footer className="bg-goa-green px-5 sm:px-8 py-6 text-center">
        <p className="font-sans text-goa-cream/40 text-xs tracking-widest uppercase">
          Hacker House Goa 2026 &nbsp;·&nbsp; by{" "}
          <span className="text-goa-cream/60">2:47PM Studio</span>
        </p>
        <p className="font-sans text-goa-cream/25 text-xs mt-1">
          No login required. Your photo never leaves your device.
        </p>
      </footer>

    </main>
  );
}
