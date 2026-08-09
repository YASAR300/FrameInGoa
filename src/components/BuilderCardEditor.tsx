"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { AppState, INITIAL_STATE } from "../lib/state/machine";
import { generateTitle, generateBadgeNumber, COMMON_STACKS } from "../lib/brand/titles";
import { renderCard, preloadCardTemplate } from "../lib/canvas/card";
import { renderFrame, preloadFrameTemplate } from "../lib/canvas/frame";

interface Props {
  initialImage: { dataUrl: string; blob: Blob; imageBitmap?: ImageBitmap };
  onReset: () => void;
}

export default function BuilderCardEditor({ initialImage, onReset }: Props) {

  /* Preload templates */
  useEffect(() => {
    preloadCardTemplate();
    preloadFrameTemplate();
  }, []);

  /* Mode */
  const [mode, setMode] = useState<"frame" | "card">("frame");

  /* App state */
  const [state, setState] = useState<AppState>(() => {
    let socialHandle = "@builder";
    let name  = INITIAL_STATE.cardConfig.name;
    let stack = INITIAL_STATE.cardConfig.stack;
    if (typeof window !== "undefined") {
      try {
        socialHandle = sessionStorage.getItem("fig_handle") || "@builder";
        name  = sessionStorage.getItem("fig_name")   || name;
        stack = sessionStorage.getItem("fig_stack")  || stack;
      } catch {}
    }
    return {
      ...INITIAL_STATE,
      step: "customising",
      dataUrl: initialImage.dataUrl,
      cardConfig: {
        ...INITIAL_STATE.cardConfig,
        name,
        stack,
        title:       generateTitle(name, stack, 0),
        badgeNumber: generateBadgeNumber(name, stack),
        socialHandle,
      },
    };
  });

  /* Cropper */
  const [cropPos, setCropPos]   = useState({ x: 0, y: 0 });
  const [zoom,    setZoom]       = useState(1);
  const [isCropping, setIsCropping] = useState(false);

  /* Image element */
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!initialImage.dataUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setImgEl(img);
    img.src    = initialImage.dataUrl;
  }, [initialImage.dataUrl]);

  /* Canvas preview */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawPreview = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (mode === "frame") {
      await renderFrame(ctx, { crop: state.crop, imgElement: imgEl, scale: 0.5 });
    } else {
      await renderCard(ctx, { config: state.cardConfig, crop: state.crop, imgElement: imgEl, scale: 0.5 });
    }
  }, [mode, state.cardConfig, state.crop, imgEl]);

  useEffect(() => { void drawPreview(); }, [drawPreview]);

  /* Persist */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem("fig_name",   state.cardConfig.name);
      sessionStorage.setItem("fig_stack",  state.cardConfig.stack);
      sessionStorage.setItem("fig_handle", state.cardConfig.socialHandle || "");
    } catch {}
  }, [state.cardConfig.name, state.cardConfig.stack, state.cardConfig.socialHandle]);

  /* Crop complete */
  const onCropComplete = useCallback(
    (_: unknown, px: { x: number; y: number; width: number; height: number }) => {
      if (!imgEl) return;
      setState(p => ({
        ...p,
        crop: {
          x:      (px.x      / imgEl.width)  * 100,
          y:      (px.y      / imgEl.height) * 100,
          width:  (px.width  / imgEl.width)  * 100,
          height: (px.height / imgEl.height) * 100,
          zoom,
        },
      }));
    },
    [imgEl, zoom]
  );

  /* Input handlers */
  const setCard = (patch: Partial<typeof state.cardConfig>) =>
    setState(p => ({ ...p, cardConfig: { ...p.cardConfig, ...patch } }));

  const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value.slice(0, 22);
    setCard({
      name,
      title:       generateTitle(name, state.cardConfig.stack, state.cardConfig.rerollNonce),
      badgeNumber: generateBadgeNumber(name, state.cardConfig.stack),
    });
  };
  const handleStack = (e: React.ChangeEvent<HTMLInputElement>) => {
    const stack = e.target.value.slice(0, 28);
    setCard({
      stack,
      title:       generateTitle(state.cardConfig.name, stack, state.cardConfig.rerollNonce),
      badgeNumber: generateBadgeNumber(state.cardConfig.name, stack),
    });
  };
  const handleHandle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setCard({ socialHandle: e.target.value.slice(0, 20) });

  const handleReroll = () => {
    const nonce = state.cardConfig.rerollNonce + 1;
    setCard({
      title:        generateTitle(state.cardConfig.name, state.cardConfig.stack, nonce),
      rerollNonce:  nonce,
    });
  };

  /* Export helpers */
  const [exporting,  setExporting]  = useState(false);
  const [statusMsg,  setStatusMsg]  = useState<string | null>(null);
  const toast = (msg: string, ms = 3500) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), ms);
  };

  async function renderHD(): Promise<{ blob: Blob; canvas: HTMLCanvasElement }> {
    const off = document.createElement("canvas");
    const ctx = off.getContext("2d")!;
    if (mode === "frame") {
      await renderFrame(ctx, { crop: state.crop, imgElement: imgEl, scale: 2 });
    } else {
      await renderCard(ctx, { config: state.cardConfig, crop: state.crop, imgElement: imgEl, scale: 2 });
    }
    const blob = await new Promise<Blob>((res, rej) =>
      off.toBlob(b => b ? res(b) : rej(), "image/png")
    );
    return { blob, canvas: off };
  }

  async function handleDownload() {
    try {
      setExporting(true);
      toast("⏳ Rendering HD PNG…");
      const { blob } = await renderHD();
      const a = Object.assign(document.createElement("a"), {
        download: mode === "frame" ? "hackhouse-goa-frame.png" : "hackhouse-goa-card.png",
        href: URL.createObjectURL(blob),
      });
      a.click();
      URL.revokeObjectURL(a.href);
      if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
      toast("✅ Saved to device!");
    } catch (err) {
      console.error(err);
      toast("❌ Export failed. Try again.");
    } finally { setExporting(false); }
  }

  async function handleShareToX() {
    try {
      setExporting(true);
      toast("🔄 Preparing…");
      const { blob } = await renderHD();
      const file    = new File([blob], "hackhouse-goa.png", { type: "image/png" });
      const caption = `Locked in at Hacker House Goa 2026! 28–31 Oct, Goa 🏖️ #FrameInGoa @247pmstudio`;

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: "FrameInGoa", text: caption, files: [file] });
        toast("🎉 Shared!");
        return;
      }
      // Desktop fallback: open X intent + download image
      window.open(
        `https://x.com/intent/post?text=${encodeURIComponent(caption)}`,
        "_blank", "noopener,noreferrer"
      );
      const a = Object.assign(document.createElement("a"), {
        download: "hackhouse-goa.png",
        href: URL.createObjectURL(blob),
      });
      a.click();
      URL.revokeObjectURL(a.href);
      toast("🚀 X opened + PNG downloaded — attach it to your post!", 5000);
    } catch (err) {
      console.error(err);
      toast("Download image manually and post on X.");
    } finally { setExporting(false); }
  }

  const isFrame = mode === "frame";

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto gap-5">

      {/* ── Mode Toggle ──────────────────────────────────────────────── */}
      <div className="flex p-1.5 bg-black/40 border border-goa-yellow/30 rounded-full w-full max-w-xs shadow-lg">
        {(["frame", "card"] as const).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={[
              "flex-1 py-2 px-3 rounded-full text-[11px] font-extrabold uppercase tracking-widest transition-all duration-200",
              mode === m
                ? "bg-goa-yellow text-goa-dark-green shadow-md"
                : "text-goa-cream/55 hover:text-goa-cream",
            ].join(" ")}
          >
            {m === "frame" ? "⭕  PFP Frame" : "📇  ID Card"}
          </button>
        ))}
      </div>

      {/* ── Crop OR Canvas Preview ────────────────────────────────────── */}
      {isCropping ? (
        <div className="relative w-full aspect-square max-h-80 bg-black rounded-2xl overflow-hidden border-2 border-goa-yellow shadow-2xl">
          <Cropper
            image={initialImage.dataUrl}
            crop={cropPos}
            zoom={zoom}
            aspect={1}
            cropShape={isFrame ? "round" : "rect"}
            showGrid={false}
            onCropChange={setCropPos}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
          {/* Zoom bar */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-goa-yellow/40">
            <span className="text-goa-cream text-xs font-medium">Zoom</span>
            <input
              type="range" min={1} max={3} step={0.05}
              value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
              className="w-28 accent-goa-yellow"
            />
            <button
              type="button"
              onClick={() => setIsCropping(false)}
              className="px-3 py-1 bg-goa-yellow text-goa-dark-green text-xs font-bold rounded-full uppercase"
            >Done ✓</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 w-full">
          {/*
            Usage Note TIP — Circular Frame:
            border-radius: 50%; overflow: hidden applied when mode === "frame"
            cleanly slots the photo preview into the circle.
          */}
          <div
            className="border-[3px] border-goa-yellow/50 shadow-[0_12px_40px_rgba(0,0,0,0.6)] bg-goa-dark-green"
            style={{
              borderRadius: isFrame ? "50%" : "14px",
              overflow: "hidden",
              maxWidth: isFrame ? "420px" : "380px",
              width: "100%",
            }}
          >
            <canvas
              ref={canvasRef}
              style={{ display: "block", width: "100%", height: "auto", aspectRatio: "1 / 1" }}
            />
          </div>

          <button
            type="button"
            onClick={() => setIsCropping(true)}
            className="text-[11px] text-goa-yellow/80 hover:text-goa-yellow underline underline-offset-2 transition-colors font-semibold flex items-center gap-1"
          >
            ✂ &nbsp;Adjust photo position &amp; zoom
          </button>
        </div>
      )}

      {/* ── Card-only inputs ─────────────────────────────────────────── */}
      {!isFrame && (
        <div className="w-full rounded-2xl border border-goa-yellow/25 bg-black/30 backdrop-blur-md overflow-hidden">

          {/* Section header */}
          <div className="px-5 pt-4 pb-2 border-b border-goa-yellow/15">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-goa-yellow">
              ✦ &nbsp;Fill Your Card Zones
            </p>
            <p className="text-[10px] text-goa-cream/35 mt-0.5">
              All fields are dynamically rendered onto the card PNG
            </p>
          </div>

          <div className="p-5 space-y-4">

            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="inp-name" className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-goa-cream/60">
                  Your Name
                </span>
                <span className="text-[10px] text-goa-cream/30 font-mono">
                  {state.cardConfig.name.length}/22
                </span>
              </label>
              <input
                id="inp-name"
                type="text"
                maxLength={22}
                value={state.cardConfig.name}
                onChange={handleName}
                placeholder="e.g. Aditya Roy"
                className="w-full px-4 py-2.5 bg-goa-dark-green/70 border border-goa-cream/15 rounded-xl text-goa-cream text-sm font-semibold placeholder:text-goa-cream/25 focus:outline-none focus:border-goa-yellow/60 focus:bg-goa-dark-green/90 transition-all"
              />
            </div>

            {/* Stack */}
            <div className="space-y-1.5">
              <label htmlFor="inp-stack" className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-goa-cream/60">
                  Stack / Role
                </span>
                <span className="text-[10px] text-goa-cream/30 font-mono">
                  {state.cardConfig.stack.length}/28
                </span>
              </label>
              <input
                id="inp-stack"
                type="text"
                list="stack-suggestions"
                maxLength={28}
                value={state.cardConfig.stack}
                onChange={handleStack}
                placeholder="e.g. Full-Stack AI"
                className="w-full px-4 py-2.5 bg-goa-dark-green/70 border border-goa-cream/15 rounded-xl text-goa-cream text-sm font-semibold placeholder:text-goa-cream/25 focus:outline-none focus:border-goa-yellow/60 focus:bg-goa-dark-green/90 transition-all"
              />
              <datalist id="stack-suggestions">
                {COMMON_STACKS.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>

            {/* Social Handle */}
            <div className="space-y-1.5">
              <label htmlFor="inp-handle">
                <span className="text-[10px] font-bold uppercase tracking-widest text-goa-cream/60">
                  Social Handle
                </span>
              </label>
              <input
                id="inp-handle"
                type="text"
                maxLength={20}
                value={state.cardConfig.socialHandle || ""}
                onChange={handleHandle}
                placeholder="@yourhandle"
                className="w-full px-4 py-2.5 bg-goa-dark-green/70 border border-goa-cream/15 rounded-xl text-goa-cream text-sm font-mono placeholder:text-goa-cream/25 focus:outline-none focus:border-goa-yellow/60 focus:bg-goa-dark-green/90 transition-all"
              />
            </div>

            {/* Title row with reroll */}
            <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-goa-dark-green/50 border border-goa-cream/10">
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase tracking-widest text-goa-cream/40 font-bold mb-0.5">
                  Builder Title (auto-generated)
                </p>
                <p className="text-goa-yellow text-xs font-semibold italic truncate">
                  {state.cardConfig.title}
                </p>
              </div>
              <button
                type="button"
                onClick={handleReroll}
                title="Reroll title"
                className="shrink-0 w-8 h-8 rounded-full bg-goa-pink/20 hover:bg-goa-pink/40 text-goa-pink text-base flex items-center justify-center transition-all active:scale-90"
              >
                🎲
              </button>
            </div>

            {/* Badge preview */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-goa-dark-green/40 border border-goa-cream/10">
              <span className="text-[9px] uppercase tracking-widest text-goa-cream/30 font-bold">Badge</span>
              <span className="text-goa-pink text-[11px] font-mono font-bold ml-auto">
                {state.cardConfig.badgeNumber}
              </span>
            </div>

            <p className="text-[9px] text-goa-cream/25 text-center leading-relaxed">
              QR code auto-links to frameingoa.app with your name · All text rendered dynamically on the PNG
            </p>
          </div>
        </div>
      )}

      {/* ── Action Buttons ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <button
          type="button"
          disabled={exporting}
          onClick={handleDownload}
          className="py-3.5 rounded-xl font-extrabold text-xs tracking-widest uppercase bg-goa-yellow text-goa-dark-green hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 shadow-lg shadow-goa-yellow/20"
        >
          {exporting ? "⏳ Rendering…" : "⬇  Download PNG"}
        </button>
        <button
          type="button"
          disabled={exporting}
          onClick={handleShareToX}
          className="py-3.5 rounded-xl font-extrabold text-xs tracking-widest uppercase bg-goa-pink text-white hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 shadow-lg shadow-goa-pink/20"
        >
          {exporting ? "⏳ Preparing…" : "𝕏  Share to X"}
        </button>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="text-[11px] text-goa-cream/35 hover:text-goa-cream/70 underline underline-offset-2 transition-colors"
      >
        ← Use a different photo
      </button>

      {/* Toast notification */}
      {statusMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-goa-yellow text-goa-dark-green font-extrabold text-xs px-6 py-3 rounded-full shadow-2xl border border-black/10 whitespace-nowrap animate-bounce">
          {statusMsg}
        </div>
      )}
    </div>
  );
}
