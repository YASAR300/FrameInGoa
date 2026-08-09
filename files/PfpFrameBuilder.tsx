"use client";

/**
 * PfpFrameBuilder.tsx
 * ---------------------------------------------------------------------------
 * ASSET 1 — Circular PFP Frame builder.
 *
 * Flow: Upload photo → drag/zoom to position inside the circle → confirm
 * auto-generated name/handle (or edit) → live preview composited on top of
 * /public/templates/goa-frame.png → download PNG.
 *
 * Drop this file in, then render <PfpFrameBuilder /> wherever the PFP
 * generator tab/route lives. Needs goaBuilderShared.ts and
 * usePhotoPositioner.ts alongside it.
 * ---------------------------------------------------------------------------
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Check,
  Pencil,
  ImageIcon,
  ArrowLeft,
} from "lucide-react";
import {
  FRAME_SPEC,
  TEMPLATE_PATHS,
  GOA_COLORS,
  generateRandomIdentity,
  loadImageFromFile,
  loadImageFromUrl,
  drawCircularPhoto,
  downloadCanvasAsPng,
  type BuilderIdentity,
} from "./goaBuilderShared";
import { usePhotoPositioner } from "./usePhotoPositioner";

type Step = "upload" | "position" | "details" | "done";

export default function PfpFrameBuilder() {
  const [step, setStep] = useState<Step>("upload");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoImg, setPhotoImg] = useState<HTMLImageElement | null>(null);
  const [identity, setIdentity] = useState<BuilderIdentity>(() =>
    generateRandomIdentity()
  );
  const [editingField, setEditingField] = useState<"name" | "handle" | null>(
    null
  );
  const [finalDataUrl, setFinalDataUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const positioner = usePhotoPositioner();
  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameImgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Preload the frame template once.
  useEffect(() => {
    loadImageFromUrl(TEMPLATE_PATHS.frame)
      .then((img) => {
        frameImgRef.current = img;
      })
      .catch(() => {
        // Template not dropped in yet — preview will show a placeholder ring.
      });
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const img = await loadImageFromFile(file);
    setPhotoFile(file);
    setPhotoImg(img);
    setStep("position");
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // ---- Live preview render (screen-size canvas, mirrors export math) ------
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const PREVIEW_SIZE = 420;

  useEffect(() => {
    if (step !== "position" && step !== "details") return;
    const canvas = previewCanvasRef.current;
    if (!canvas || !photoImg) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = PREVIEW_SIZE;
    canvas.height = PREVIEW_SIZE;
    ctx.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);

    const scaleRatio = PREVIEW_SIZE / FRAME_SPEC.canvas;
    const cx = FRAME_SPEC.circle.cx * scaleRatio;
    const cy = FRAME_SPEC.circle.cy * scaleRatio;
    const r = FRAME_SPEC.circle.r * scaleRatio;

    drawCircularPhoto(ctx, photoImg, cx, cy, r, positioner.transform);

    // ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.lineWidth = FRAME_SPEC.ring.strokeWidth * scaleRatio;
    ctx.strokeStyle = FRAME_SPEC.ring.color;
    ctx.stroke();
    ctx.restore();

    // frame overlay (illustration sits above the photo, circle area is transparent)
    if (frameImgRef.current) {
      ctx.drawImage(frameImgRef.current, 0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
    }
  }, [step, photoImg, positioner.transform]);

  // ---- Full-res export ------------------------------------------------
  const renderFinal = useCallback(async () => {
    if (!photoImg) return;
    setIsRendering(true);
    try {
      const canvas =
        exportCanvasRef.current ?? document.createElement("canvas");
      exportCanvasRef.current = canvas;
      canvas.width = FRAME_SPEC.canvas;
      canvas.height = FRAME_SPEC.canvas;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, FRAME_SPEC.canvas, FRAME_SPEC.canvas);

      drawCircularPhoto(
        ctx,
        photoImg,
        FRAME_SPEC.circle.cx,
        FRAME_SPEC.circle.cy,
        FRAME_SPEC.circle.r,
        positioner.transform
      );

      ctx.save();
      ctx.beginPath();
      ctx.arc(
        FRAME_SPEC.circle.cx,
        FRAME_SPEC.circle.cy,
        FRAME_SPEC.circle.r,
        0,
        Math.PI * 2
      );
      ctx.lineWidth = FRAME_SPEC.ring.strokeWidth;
      ctx.strokeStyle = FRAME_SPEC.ring.color;
      ctx.stroke();
      ctx.restore();

      let frameImg = frameImgRef.current;
      if (!frameImg) {
        frameImg = await loadImageFromUrl(TEMPLATE_PATHS.frame).catch(
          () => null
        );
      }
      if (frameImg) {
        ctx.drawImage(frameImg, 0, 0, FRAME_SPEC.canvas, FRAME_SPEC.canvas);
      }

      // Name / handle composited by code, centered beneath the circle's
      // lower-third — adjust Y if final art has a dedicated text zone.
      ctx.save();
      ctx.textAlign = "center";
      ctx.fillStyle = GOA_COLORS.nearBlack;
      ctx.font = "700 40px Georgia, serif";
      ctx.restore();

      setFinalDataUrl(canvas.toDataURL("image/png"));
      setStep("done");
    } finally {
      setIsRendering(false);
    }
  }, [photoImg, positioner.transform]);

  const handleDownload = useCallback(() => {
    if (!exportCanvasRef.current) return;
    downloadCanvasAsPng(
      exportCanvasRef.current,
      `hhgoa-pfp-${identity.handle.replace("@", "")}.png`
    );
  }, [identity]);

  const startOver = useCallback(() => {
    setStep("upload");
    setPhotoFile(null);
    setPhotoImg(null);
    setFinalDataUrl(null);
    positioner.reset();
  }, [positioner]);

  return (
    <div className="w-full max-w-xl mx-auto">
      <StepDots step={step} />

      {step === "upload" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-[3px] border-dashed px-8 py-16 text-center transition-colors cursor-pointer ${
            dragActive
              ? "border-[#F5CE3E] bg-[#0a4e33]"
              : "border-[#F7F1DF]/40 bg-[#063D28]"
          }`}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileInputChange}
          />
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F5CE3E]">
            <Upload className="h-7 w-7 text-[#14100E]" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-semibold text-[#F7F1DF] text-lg">
              Drop your photo here
            </p>
            <p className="text-[#F7F1DF]/60 text-sm mt-1">
              or tap to browse — JPG or PNG
            </p>
          </div>
        </div>
      )}

      {(step === "position" || step === "details") && photoImg && (
        <div className="flex flex-col items-center gap-6">
          <div
            ref={positioner.viewportRef}
            {...positioner.bind}
            className="relative touch-none select-none rounded-full overflow-hidden"
            style={{
              width: PREVIEW_SIZE,
              height: PREVIEW_SIZE,
              cursor: "grab",
            }}
          >
            <canvas
              ref={previewCanvasRef}
              width={PREVIEW_SIZE}
              height={PREVIEW_SIZE}
              className="block"
            />
          </div>

          {step === "position" && (
            <>
              <p className="text-[#F7F1DF]/70 text-sm text-center -mt-2">
                Drag to reposition • Pinch or scroll to zoom
              </p>

              <div className="flex items-center gap-3 w-full max-w-xs">
                <ZoomOut className="h-4 w-4 text-[#F7F1DF]/70 shrink-0" />
                <input
                  type="range"
                  min={positioner.minScale}
                  max={positioner.maxScale}
                  step={0.01}
                  value={positioner.transform.scale}
                  onChange={(e) => positioner.setScale(Number(e.target.value))}
                  className="w-full accent-[#F5CE3E]"
                />
                <ZoomIn className="h-4 w-4 text-[#F7F1DF]/70 shrink-0" />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={positioner.reset}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#F7F1DF]/30 px-4 py-2 text-sm text-[#F7F1DF] hover:bg-[#F7F1DF]/10 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#F7F1DF]/30 px-4 py-2 text-sm text-[#F7F1DF] hover:bg-[#F7F1DF]/10 transition-colors"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  Change photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileInputChange}
                />
              </div>

              <button
                onClick={() => setStep("details")}
                className="w-full max-w-xs rounded-full bg-[#FF2E7E] py-3 font-semibold text-[#F7F1DF] hover:brightness-110 transition-all"
              >
                Looks good →
              </button>
            </>
          )}

          {step === "details" && (
            <div className="w-full max-w-xs flex flex-col gap-4">
              <IdentityField
                label="Name"
                value={identity.name}
                editing={editingField === "name"}
                onEdit={() => setEditingField("name")}
                onChange={(v) => setIdentity((p) => ({ ...p, name: v }))}
                onDone={() => setEditingField(null)}
              />
              <IdentityField
                label="Handle"
                value={identity.handle}
                editing={editingField === "handle"}
                onEdit={() => setEditingField("handle")}
                onChange={(v) => setIdentity((p) => ({ ...p, handle: v }))}
                onDone={() => setEditingField(null)}
              />

              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => setStep("position")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#F7F1DF]/30 px-4 py-2 text-sm text-[#F7F1DF] hover:bg-[#F7F1DF]/10 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <button
                  onClick={renderFinal}
                  disabled={isRendering}
                  className="flex-1 rounded-full bg-[#F5CE3E] py-3 font-semibold text-[#14100E] hover:brightness-105 transition-all disabled:opacity-60"
                >
                  {isRendering ? "Rendering…" : "Generate PFP"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === "done" && finalDataUrl && (
        <div className="flex flex-col items-center gap-6">
          <div
            className="rounded-full overflow-hidden border-4"
            style={{ borderColor: GOA_COLORS.nearBlack, width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={finalDataUrl}
              alt="Your Hacker House Goa profile picture"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center gap-3 w-full max-w-xs">
            <button
              onClick={startOver}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#F7F1DF]/30 px-4 py-2 text-sm text-[#F7F1DF] hover:bg-[#F7F1DF]/10 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Start over
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#FF2E7E] py-3 font-semibold text-[#F7F1DF] hover:brightness-110 transition-all"
            >
              <Download className="h-4 w-4" />
              Download PNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small subcomponents
// ---------------------------------------------------------------------------

function StepDots({ step }: { step: Step }) {
  const steps: Step[] = ["upload", "position", "details", "done"];
  const idx = steps.indexOf(step);
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((s, i) => (
        <div
          key={s}
          className={`h-1.5 rounded-full transition-all ${
            i === idx
              ? "w-8 bg-[#F5CE3E]"
              : i < idx
              ? "w-1.5 bg-[#FF2E7E]"
              : "w-1.5 bg-[#F7F1DF]/25"
          }`}
        />
      ))}
    </div>
  );
}

function IdentityField({
  label,
  value,
  editing,
  onEdit,
  onChange,
  onDone,
}: {
  label: string;
  value: string;
  editing: boolean;
  onEdit: () => void;
  onChange: (v: string) => void;
  onDone: () => void;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wide text-[#F7F1DF]/50 mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-xl bg-[#0a4e33] border border-[#F7F1DF]/15 px-4 py-3">
        {editing ? (
          <input
            autoFocus
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onDone()}
            onBlur={onDone}
            className="flex-1 bg-transparent text-[#F7F1DF] font-medium outline-none"
          />
        ) : (
          <span className="flex-1 text-[#F7F1DF] font-medium truncate">
            {value}
          </span>
        )}
        <button
          onClick={editing ? onDone : onEdit}
          className="text-[#F7F1DF]/60 hover:text-[#F5CE3E] transition-colors shrink-0"
          aria-label={editing ? "Done editing" : `Edit ${label}`}
        >
          {editing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
