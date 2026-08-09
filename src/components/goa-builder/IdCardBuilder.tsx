"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload,
  RotateCcw,
  RotateCw,
  Download,
  Share2,
  Sparkles,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  ImagePlus,
  User,
  Wrench,
  Award,
  Camera,
} from "lucide-react";
import { processAndDecodeImage } from "@/lib/image/decode";
import { ToastContainer, ToastItem, ToastType } from "@/components/ui/ToastNotification";

// ── AI BUILDER TITLES ─────────────────────────────────────────────────────
const AI_TITLES = [
  "Bug Whisperer",
  "Wizard of Edge Cases",
  "Async Prophet",
  "Keeper of Uptime",
  "Genesis Builder",
  "Night Owl Shipper",
  "Prototype Pirate",
  "Signal Over Noise",
  "Susegad Shipper",
  "Beach Deployer",
  "Latency Hater",
  "2:47 AM Committer",
  "Chaos Coordinator",
  "Merge Conflict Survivor",
  "Zero-Downtime Guru",
];

// ── SINGLE FINAL TEMPLATE SPECIFICATIONS (2048 x 2048) ────────────────────
const TEMPLATE_SRC = "/final/final-id-image.png";
const CARD_W = 2048;
const CARD_H = 2048;

// Exact measured coordinates for photo circle frame
const PHOTO_CX = 1024.5;
const PHOTO_CY = 970;
const PHOTO_RX = 288;
const PHOTO_RY = 282;

// Deep vintage ink color matching printed card typography
const TEXT_COLOR = "#1f0e06";

// Text Placement & Font Bounds (Perfectly Proportioned for 2048x2048 resolution)
// 1. NAME: beside label (X = 890, Y = 1460)
const NAME_START_X = 890;
const NAME_BASE_Y = 1460;
const NAME_MAX_W = 650;

// 2. SKILL: below label (centered at X = 1024, Y = 1625)
const SKILL_CENTER_X = 1024;
const SKILL_BASE_Y = 1625;
const SKILL_MAX_W = 820;

// 3. BUILDER TITLE: below label (centered at X = 1024, Y = 1785)
const TITLE_CENTER_X = 1024;
const TITLE_BASE_Y = 1785;
const TITLE_MAX_W = 850;

export default function IdCardBuilder() {
  // ── FORM FIELDS (Initial State Blank)
  const [name, setName] = useState("");
  const [stack, setStack] = useState("");
  const [title, setTitle] = useState("");

  // ── PHOTO STATE
  const [photoImg, setPhotoImg] = useState<HTMLImageElement | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // ── UI & ANIMATED TOAST STATES
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // ── REFS
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgImgRef = useRef<HTMLImageElement | null>(null);

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Preload background template
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `${TEMPLATE_SRC}?v=${Date.now()}`;
    img.onload = () => {
      bgImgRef.current = img;
      drawCanvas();
    };
    img.onerror = () => {
      drawCanvas();
    };
  }, []);

  // ── DRAW CANVAS WITH HIGH PRECISION COMPOSITING
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = CARD_W;
    canvas.height = CARD_H;

    // 1. Draw Base Template Artwork FIRST
    if (bgImgRef.current && bgImgRef.current.complete && bgImgRef.current.naturalWidth > 0) {
      ctx.drawImage(bgImgRef.current, 0, 0, CARD_W, CARD_H);
    } else {
      ctx.fillStyle = "#026836";
      ctx.fillRect(0, 0, CARD_W, CARD_H);
    }

    // 2. Draw User Photo clipped inside the photo circle frame ON TOP of template artwork
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(PHOTO_CX, PHOTO_CY, PHOTO_RX, PHOTO_RY, 0, 0, Math.PI * 2);
    ctx.clip();

    if (photoImg) {
      ctx.save();
      ctx.translate(PHOTO_CX + pan.x, PHOTO_CY + pan.y);
      ctx.rotate((rotation * Math.PI) / 180);

      const iw = photoImg.naturalWidth;
      const ih = photoImg.naturalHeight;
      const coverScale = Math.max((PHOTO_RX * 2) / iw, (PHOTO_RY * 2) / ih) * zoom;
      const dw = iw * coverScale;
      const dh = ih * coverScale;

      ctx.drawImage(photoImg, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();
    } else {
      ctx.fillStyle = "#0c2b1b";
      ctx.fill();
    }
    ctx.restore();

    // 3. Draw User Input Text ONLY IF ENTERED BY USER
    ctx.save();
    ctx.textBaseline = "alphabetic";

    // Deep organic vintage ink shadow
    ctx.shadowColor = "rgba(28, 11, 4, 0.45)";
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3;
    ctx.shadowBlur = 4;
    ctx.fillStyle = TEXT_COLOR;

    const fontStack = `"Playfair Display", "MedievalSharp", "Cinzel Decorative", Georgia, serif`;

    // ── NAME VALUE
    const valName = name.trim();
    if (valName) {
      ctx.textAlign = "left";
      let nameFs = 60;
      ctx.font = `700 ${nameFs}px ${fontStack}`;
      while (ctx.measureText(valName).width > NAME_MAX_W && nameFs > 28) {
        nameFs -= 2;
        ctx.font = `700 ${nameFs}px ${fontStack}`;
      }
      ctx.fillText(valName, NAME_START_X, NAME_BASE_Y);
    }

    // ── SKILL VALUE
    const valSkill = stack.trim();
    if (valSkill) {
      ctx.textAlign = "center";
      let skillFs = 56;
      ctx.font = `700 ${skillFs}px ${fontStack}`;
      while (ctx.measureText(valSkill).width > SKILL_MAX_W && skillFs > 24) {
        skillFs -= 2;
        ctx.font = `700 ${skillFs}px ${fontStack}`;
      }
      ctx.fillText(valSkill, SKILL_CENTER_X, SKILL_BASE_Y);
    }

    // ── BUILDER TITLE VALUE
    const valTitle = title.trim();
    if (valTitle) {
      ctx.textAlign = "center";
      let titleFs = 52;
      ctx.font = `700 ${titleFs}px ${fontStack}`;
      while (ctx.measureText(valTitle).width > TITLE_MAX_W && titleFs > 24) {
        titleFs -= 2;
        ctx.font = `700 ${titleFs}px ${fontStack}`;
      }
      ctx.fillText(valTitle, TITLE_CENTER_X, TITLE_BASE_Y);
    }

    ctx.restore();
  }, [photoImg, pan, zoom, rotation, name, stack, title]);

  useEffect(() => {
    drawCanvas();
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        drawCanvas();
      });
    }
  }, [drawCanvas]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const decoded = await processAndDecodeImage(file);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        setPhotoImg(img);
        setPan({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setIsProcessing(false);
        addToast("success", "Photo set on card!");
      };
      img.src = decoded.dataUrl;
    } catch {
      addToast("error", "Could not load photo. Try a JPG, PNG, or HEIC image.");
      setIsProcessing(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFileUpload(file);
    e.target.value = "";
  };

  const handleGenerateTitle = () => {
    setIsGeneratingTitle(true);
    setTimeout(() => {
      const pick = AI_TITLES[Math.floor(Math.random() * AI_TITLES.length)];
      setTitle(pick);
      setIsGeneratingTitle(false);
      addToast("info", `Generated Title: "${pick}"`);
    }, 350);
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CARD_W / rect.width;
    const scaleY = CARD_H / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    const dx = (x - PHOTO_CX) / PHOTO_RX;
    const dy = (y - PHOTO_CY) / PHOTO_RY;
    const isInsideCircle = dx * dx + dy * dy <= 1;

    if (!photoImg && isInsideCircle) {
      fileInputRef.current?.click();
      return;
    }

    if (photoImg && isInsideCircle) {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      panStartRef.current = { x: pan.x, y: pan.y };
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CARD_W / rect.width;
    const scaleY = CARD_H / rect.height;

    const dx = (e.clientX - dragStartRef.current.x) * scaleX;
    const dy = (e.clientY - dragStartRef.current.y) * scaleY;

    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handleCanvasMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const fakeMouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
      } as unknown as React.MouseEvent<HTMLCanvasElement>;
      handleCanvasMouseDown(fakeMouseEvent);
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const fakeMouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
      } as unknown as React.MouseEvent<HTMLCanvasElement>;
      handleCanvasMouseMove(fakeMouseEvent);
    }
  };

  const handleCanvasTouchEnd = () => {
    handleCanvasMouseUp();
  };

  const handleCanvasWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!photoImg) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((z) => Math.max(0.4, Math.min(4, z * delta)));
  };

  // ── FORM VALIDATION BEFORE DOWNLOAD / SHARE
  const validateForm = (): boolean => {
    if (!photoImg) {
      addToast("warning", "Please upload a photo before downloading!");
      return false;
    }
    if (!name.trim()) {
      addToast("warning", "Please enter your Name before downloading!");
      return false;
    }
    if (!stack.trim()) {
      addToast("warning", "Please enter your Skill / Stack before downloading!");
      return false;
    }
    if (!title.trim()) {
      addToast("warning", "Please enter your Builder Title before downloading!");
      return false;
    }
    return true;
  };

  const handleDownload = () => {
    if (!validateForm()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    const slug = name.trim().toLowerCase().replace(/\s+/g, "-");
    a.download = `hh-goa-2026-${slug}.png`;
    a.href = dataUrl;
    a.click();
    addToast("success", "Card downloaded! Share it on X.");
  };

  const handleShare = async () => {
    if (!validateForm()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    addToast("info", "⏳ Uploading card preview to Cloudinary...");

    // 1. Generate client-side unique share ID instantly
    const shareId = Math.random().toString(36).substring(2, 10);
    const shareUrl = `https://frame-in-goa.vercel.app/s/${shareId}`;

    // 2. Prepare compressed image & upload to Cloudinary
    try {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = 1080;
      tempCanvas.height = 1080;
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) {
        tempCtx.drawImage(canvas, 0, 0, 1080, 1080);
      }
      const dataUrl = tempCtx ? tempCanvas.toDataURL("image/jpeg", 0.92) : canvas.toDataURL("image/jpeg", 0.85);

      // Fast upload race (max 800ms) to ensure Cloudinary CDN has the image ready
      const uploadPromise = fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: shareId, image: dataUrl }),
      }).catch((err) => console.error(err));

      await Promise.race([uploadPromise, new Promise((r) => setTimeout(r, 800))]);

      // Copy image blob to Clipboard for instant Ctrl+V attachment as well
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (blob && typeof navigator !== "undefined" && navigator.clipboard && typeof ClipboardItem !== "undefined") {
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error("Background share error:", err);
    }

    // 3. Open X Intent with live share link
    const tweetText = `🌴 Locked in for Hacker House Goa 2026!\n\n👤 ${name}\n💻 ${stack}\n✨ ${title}\n\nShipping wild things by the sea with top builders in Goa 🚀\n\nCreate your own Builder Badge:\n${shareUrl}\n\n#FrameInGoa #HHGoa2026`;
    const tweetIntentUrl = `https://x.com/intent/post?text=${encodeURIComponent(tweetText)}`;

    if (typeof window !== "undefined") {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.open(tweetIntentUrl, "_blank");
      } else {
        window.open(tweetIntentUrl, "_blank", "width=600,height=550");
      }
    }

    addToast("success", "🚀 Opened X with live image preview card!");
  };

  return (
    <div className="w-full text-white font-sans selection:bg-[#f5c842] selection:text-[#026836]">
      {/* ══ ANIMATED REACT TOAST NOTIFICATIONS ══ */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.heic,.heif"
        className="hidden"
        onChange={onFileInputChange}
      />

      <div className="max-w-7xl mx-auto px-4 py-2 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ══ LEFT CONTROL PANEL ══ */}
        <div className="lg:col-span-5 bg-[#1f5c38] border border-[#f5c842]/20 rounded-2xl p-6 shadow-2xl flex flex-col gap-5">
          <div className="text-xs uppercase tracking-widest text-[#f5c842] font-semibold flex items-center justify-between border-b border-[#f5c842]/20 pb-3">
            <span className="flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-[#f5c842]" />
              <span>Editable Card Controls</span>
            </span>
            <span className="text-white/40 font-mono">2048×2048 Final ID</span>
          </div>

          {/* Photo Action Row */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#f5c842]/80 mb-2 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[#f5c842]" />
              <span>Photo Controls</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#f5c842] text-[#026836] font-bold px-4 py-2.5 rounded-xl text-xs hover:brightness-110 transition-all shadow-md"
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 stroke-[2.5]" />
                )}
                {photoImg ? "Change Photo" : "Upload Photo"}
              </button>

              {photoImg && (
                <>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(4, z + 0.15))}
                    className="p-2.5 rounded-xl border border-[#f5c842]/40 text-[#f5c842] hover:bg-[#f5c842]/10 transition-colors"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
                    className="p-2.5 rounded-xl border border-[#f5c842]/40 text-[#f5c842] hover:bg-[#f5c842]/10 transition-colors"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="p-2.5 rounded-xl border border-[#f5c842]/40 text-[#f5c842] hover:bg-[#f5c842]/10 transition-colors"
                    title="Rotate 90°"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPan({ x: 0, y: 0 });
                      setZoom(1);
                      setRotation(0);
                    }}
                    className="p-2.5 rounded-xl border border-white/20 text-white/70 hover:text-white transition-colors"
                    title="Reset photo"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            <p className="text-[11px] text-white/50 mt-2">
              💡 Tip: Click &amp; drag directly on the photo frame to pan. Scroll to zoom!
            </p>
          </div>

          {/* Field: Name */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#f5c842]/80 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#f5c842]" />
              <span>Your Name</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-[#f5c842]/70" />
              <input
                type="text"
                value={name}
                maxLength={26}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-black/30 border border-[#f5c842]/25 rounded-xl pl-10 pr-4 py-3 text-base sm:text-sm text-white focus:border-[#f5c842] focus:outline-none transition-colors font-medium"
              />
            </div>
          </div>

          {/* Field: Skill / Stack */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#f5c842]/80 mb-1.5 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-[#f5c842]" />
              <span>Skill / Stack</span>
            </label>
            <div className="relative">
              <Wrench className="absolute left-3.5 top-3.5 w-4 h-4 text-[#f5c842]/70" />
              <input
                type="text"
                value={stack}
                maxLength={36}
                onChange={(e) => setStack(e.target.value)}
                placeholder="Enter your skill / stack"
                className="w-full bg-black/30 border border-[#f5c842]/25 rounded-xl pl-10 pr-4 py-3 text-base sm:text-sm text-white focus:border-[#f5c842] focus:outline-none transition-colors font-medium"
              />
            </div>
          </div>

          {/* Field: Builder Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#f5c842]/80 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#f5c842]" />
                <span>Builder Title</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateTitle}
                disabled={isGeneratingTitle}
                className="inline-flex items-center gap-1 text-xs text-[#f5c842] hover:underline font-mono disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isGeneratingTitle ? "Generating…" : "Generate with AI"}
              </button>
            </div>
            <div className="relative">
              <Award className="absolute left-3.5 top-3.5 w-4 h-4 text-[#f5c842]/70" />
              <input
                type="text"
                value={title}
                maxLength={32}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter builder title"
                className="w-full bg-black/30 border border-[#f5c842]/25 rounded-xl pl-10 pr-4 py-3 text-base sm:text-sm text-white focus:border-[#f5c842] focus:outline-none transition-colors font-medium"
              />
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-[#f5c842]/20">
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#f5c842] text-[#026836] font-extrabold py-3.5 px-4 rounded-xl text-sm hover:brightness-110 transition-all shadow-xl hover:-translate-y-0.5"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              Download PNG
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center justify-center gap-2 bg-black border border-white/20 text-white font-bold py-3.5 px-5 rounded-xl text-sm hover:bg-neutral-900 transition-all hover:-translate-y-0.5"
            >
              <Share2 className="w-4 h-4 text-[#f5c842]" />
              Share
            </button>
          </div>
        </div>

        {/* ══ RIGHT LIVE CANVAS PREVIEW ══ */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full max-w-[500px] rounded-2xl overflow-hidden shadow-2xl border-2 border-[#f5c842]/40 bg-black/40 group">
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              onTouchStart={handleCanvasTouchStart}
              onTouchMove={handleCanvasTouchMove}
              onTouchEnd={handleCanvasTouchEnd}
              onWheel={handleCanvasWheel}
              className="w-full h-auto block cursor-pointer select-none touch-none"
            />

            {/* Photo Circle Overlay Indicator when no photo is uploaded */}
            {!photoImg && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="absolute cursor-pointer flex flex-col items-center justify-center gap-2 text-white/90 hover:text-white transition-all group/overlay select-none"
                style={{
                  top: "47%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "54%",
                  height: "38%",
                  borderRadius: "50%",
                }}
              >
                <div className="p-3.5 rounded-full bg-white/10 border border-white/20 group-hover/overlay:scale-110 group-hover/overlay:bg-[#f5c842] group-hover/overlay:text-[#026836] transition-all shadow-xl backdrop-blur-sm">
                  <ImagePlus className="w-8 h-8 stroke-[2]" />
                </div>
                <span className="text-xs font-bold tracking-wide drop-shadow-md flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" /> Upload Photo
                </span>
                <span className="text-[10px] text-white/70 tracking-wide drop-shadow-md">Click or drag image</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
