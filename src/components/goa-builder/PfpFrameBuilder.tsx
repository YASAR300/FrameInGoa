"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload,
  RotateCcw,
  RotateCw,
  Download,
  Share2,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Palette,
  Check,
  ImagePlus,
  User,
  AtSign,
} from "lucide-react";
import { processAndDecodeImage } from "@/lib/image/decode";
import { ToastContainer, ToastItem, ToastType } from "@/components/ui/ToastNotification";

const FRAME_W = 1080;
const FRAME_H = 1080;
const FRAME_CX = 540;
const FRAME_CY = 540;
const FRAME_R = 380;

interface FrameTemplateOption {
  id: number;
  name: string;
  badge: string;
  src: string;
}

const FRAME_TEMPLATES: FrameTemplateOption[] = [
  { id: 1, name: "Goa Beach Poster", badge: "Masterpiece", src: "/templates/frame-1.png" },
  { id: 2, name: "Sunset Horizon", badge: "Spacious", src: "/templates/frame-2.png" },
  { id: 3, name: "Tropical Oasis", badge: "Intricate", src: "/templates/frame-3.png" },
  { id: 4, name: "Azulejo Heritage", badge: "Vintage", src: "/templates/frame-4.png" },
  { id: 5, name: "Hibiscus Palms", badge: "Artistic", src: "/templates/frame-5.png" },
  { id: 6, name: "Coastal Sunset", badge: "Vibrant", src: "/templates/frame-6.png" },
];

export default function PfpFrameBuilder() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>(1);
  const activeTemplate = FRAME_TEMPLATES.find((t) => t.id === selectedTemplateId) || FRAME_TEMPLATES[0];

  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [photoImg, setPhotoImg] = useState<HTMLImageElement | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const [isProcessing, setIsProcessing] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

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

  // Preload frame background template
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `${activeTemplate.src}?v=${Date.now()}`;
    img.onload = () => {
      bgImgRef.current = img;
      drawCanvas();
    };
    img.onerror = () => {
      drawCanvas();
    };
  }, [activeTemplate]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = FRAME_W;
    canvas.height = FRAME_H;

    // 1. Draw frame background artwork FIRST
    if (bgImgRef.current && bgImgRef.current.complete && bgImgRef.current.naturalWidth > 0) {
      ctx.drawImage(bgImgRef.current, 0, 0, FRAME_W, FRAME_H);
    } else {
      ctx.fillStyle = "#026836";
      ctx.fillRect(0, 0, FRAME_W, FRAME_H);
    }

    // 2. Draw user photo in central circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(FRAME_CX, FRAME_CY, FRAME_R, 0, Math.PI * 2);
    ctx.clip();

    if (photoImg) {
      ctx.save();
      ctx.translate(FRAME_CX + pan.x, FRAME_CY + pan.y);
      ctx.rotate((rotation * Math.PI) / 180);

      const iw = photoImg.naturalWidth;
      const ih = photoImg.naturalHeight;
      const coverScale = Math.max((FRAME_R * 2) / iw, (FRAME_R * 2) / ih) * zoom;
      const dw = iw * coverScale;
      const dh = ih * coverScale;

      ctx.drawImage(photoImg, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();
    } else {
      ctx.fillStyle = "#042a1a";
      ctx.fill();
    }
    ctx.restore();

    // 3. Ring stroke border around circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(FRAME_CX, FRAME_CY, FRAME_R, 0, Math.PI * 2);
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#f5c842";
    ctx.stroke();
    ctx.restore();

    // 4. Draw Name & Handle overlay text (ONLY IF ENTERED)
    const valName = name.trim().toUpperCase();
    const valHandle = handle.trim();

    if (valName || valHandle) {
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Banner badge overlay
      ctx.fillStyle = "rgba(2, 42, 26, 0.92)";
      ctx.beginPath();
      ctx.roundRect(FRAME_CX - 300, 915, 600, 115, 24);
      ctx.fill();
      ctx.strokeStyle = "rgba(245, 200, 66, 0.6)";
      ctx.lineWidth = 3;
      ctx.stroke();

      if (valName && valHandle) {
        let nameFs = 44;
        ctx.font = `800 ${nameFs}px system-ui, sans-serif`;
        while (ctx.measureText(valName).width > 560 && nameFs > 22) {
          nameFs -= 2;
          ctx.font = `800 ${nameFs}px system-ui, sans-serif`;
        }
        ctx.fillStyle = "#f5c842";
        ctx.fillText(valName, FRAME_CX, 950);

        let handleFs = 28;
        ctx.font = `600 ${handleFs}px monospace`;
        while (ctx.measureText(valHandle).width > 560 && handleFs > 16) {
          handleFs -= 2;
          ctx.font = `600 ${handleFs}px monospace`;
        }
        ctx.fillStyle = "#f0ead6";
        ctx.fillText(valHandle, FRAME_CX, 994);
      } else if (valName) {
        let nameFs = 48;
        ctx.font = `800 ${nameFs}px system-ui, sans-serif`;
        while (ctx.measureText(valName).width > 560 && nameFs > 24) {
          nameFs -= 2;
          ctx.font = `800 ${nameFs}px system-ui, sans-serif`;
        }
        ctx.fillStyle = "#f5c842";
        ctx.fillText(valName, FRAME_CX, 972);
      } else if (valHandle) {
        let handleFs = 34;
        ctx.font = `600 ${handleFs}px monospace`;
        while (ctx.measureText(valHandle).width > 560 && handleFs > 18) {
          handleFs -= 2;
          ctx.font = `600 ${handleFs}px monospace`;
        }
        ctx.fillStyle = "#f0ead6";
        ctx.fillText(valHandle, FRAME_CX, 972);
      }
      ctx.restore();
    }
  }, [photoImg, pan, zoom, rotation, name, handle, activeTemplate]);

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
        addToast("success", "PFP Photo uploaded!");
      };
      img.src = decoded.dataUrl;
    } catch {
      addToast("error", "Could not load photo. Try another image.");
      setIsProcessing(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFileUpload(file);
    e.target.value = "";
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (FRAME_W / rect.width),
      y: (e.clientY - rect.top) * (FRAME_H / rect.height),
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    const dist = Math.hypot(x - FRAME_CX, y - FRAME_CY);

    if (!photoImg && dist <= FRAME_R) {
      fileInputRef.current?.click();
      return;
    }

    if (photoImg && dist <= FRAME_R * 1.2) {
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
    const scaleX = FRAME_W / rect.width;
    const scaleY = FRAME_H / rect.height;

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
    if (!handle.trim()) {
      addToast("warning", "Please enter your Handle before downloading!");
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
    a.download = `hh-goa-pfp-${slug}.png`;
    a.href = dataUrl;
    a.click();
    addToast("success", "PFP Frame downloaded!");
  };

  const handleShare = async () => {
    if (!validateForm()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    addToast("info", "⏳ Uploading PFP preview to Cloudinary...");

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
      console.error("Background PFP share error:", err);
    }

    // 3. Open X Intent with live share link
    const userHandle = handle.trim().startsWith("@") ? handle.trim() : `@${handle.trim()}`;
    const tweetText = `🌴 Custom PFP Frame locked in for Hacker House Goa 2026!\n\n👤 ${name}\n🏷️ ${userHandle}\n\nReady to ship & vibe with builders by the sea in Goa 🌊⚡\n\nCreate your own PFP Frame:\n${shareUrl}\n\n#FrameInGoa #HHGoa2026`;
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

      {/* ══ 6 MASTERPIECE PFP FRAME TEMPLATES SELECTOR ══ */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="bg-[#1f5c38] border border-[#f5c842]/20 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs uppercase tracking-widest text-[#f5c842] font-semibold flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span>Choose PFP Frame Template (6 Styles)</span>
            </span>
            <span className="text-xs text-white/50 font-mono">
              Selected: #{selectedTemplateId} — {activeTemplate.name}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {FRAME_TEMPLATES.map((tpl) => {
              const isSelected = tpl.id === selectedTemplateId;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`relative flex flex-col items-center p-2 rounded-xl border transition-all text-left group overflow-hidden ${
                    isSelected
                      ? "border-[#f5c842] bg-[#f5c842]/20 scale-105 shadow-lg"
                      : "border-white/10 bg-black/30 hover:border-[#f5c842]/50 hover:bg-black/50"
                  }`}
                >
                  <div className="w-full aspect-square rounded-lg overflow-hidden relative mb-1.5 bg-black/50 border border-white/10">
                    <img
                      src={tpl.src}
                      alt={tpl.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-[#f5c842] text-[#026836] rounded-full flex items-center justify-center shadow-md">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-bold text-white group-hover:text-[#f5c842] transition-colors truncate w-full text-center">
                    {tpl.name}
                  </span>
                  <span className="text-[10px] text-[#f5c842]/70 font-mono truncate">
                    {tpl.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-2 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ══ LEFT CONTROL PANEL ══ */}
        <div className="lg:col-span-5 bg-[#1f5c38] border border-[#f5c842]/20 rounded-2xl p-6 shadow-2xl flex flex-col gap-5">
          <div className="text-xs uppercase tracking-widest text-[#f5c842] font-semibold flex items-center justify-between border-b border-[#f5c842]/20 pb-3">
            <span>✦ Editable PFP Controls</span>
            <span className="text-white/40">1080×1080 Canvas</span>
          </div>

          {/* Photo Action Row */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#f5c842]/80 mb-2">
              Photo Actions
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
              💡 Tip: Click &amp; drag directly on the PFP circle to pan. Scroll to zoom!
            </p>
          </div>

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

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#f5c842]/80 mb-1.5 flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5 text-[#f5c842]" />
              <span>Social Handle</span>
            </label>
            <div className="relative">
              <AtSign className="absolute left-3.5 top-3.5 w-4 h-4 text-[#f5c842]/70" />
              <input
                type="text"
                value={handle}
                maxLength={24}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="Enter your handle"
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
              Download PFP
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
          <div className="relative w-full max-w-[480px] rounded-2xl overflow-hidden shadow-2xl border-2 border-[#f5c842]/40 bg-black/40 group">
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
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "60%",
                  height: "60%",
                  borderRadius: "50%",
                }}
              >
                <div className="p-4 rounded-full bg-white/10 border border-white/20 group-hover/overlay:scale-110 group-hover/overlay:bg-[#f5c842] group-hover/overlay:text-[#026836] transition-all shadow-xl backdrop-blur-sm">
                  <ImagePlus className="w-10 h-10 stroke-[2]" />
                </div>
                <span className="text-xs font-bold tracking-wide drop-shadow-md">Upload PFP Photo</span>
                <span className="text-[10px] text-white/70 tracking-wide drop-shadow-md">Click or drag image</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
