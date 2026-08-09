"use client";

/**
 * IdCardBuilder.tsx
 * ---------------------------------------------------------------------------
 * ASSET 2 — Builder ID Card generator.
 *
 * Flow: Upload photo → drag/zoom to fit the rounded photo box → confirm/edit
 * auto-generated identity fields (name, stack, title, badge #, handle) →
 * live preview composited on top of /public/templates/goa-card.png, with a
 * generated QR code dropped in the bottom-right QR zone → download PNG.
 *
 * Needs the `qrcode` package: npm install qrcode
 * Needs goaBuilderShared.ts and usePhotoPositioner.ts alongside it.
 * ---------------------------------------------------------------------------
 */

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
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
  CreditCard,
} from "lucide-react";
import {
  CARD_SPEC,
  TEMPLATE_PATHS,
  GOA_COLORS,
  generateRandomIdentity,
  loadImageFromFile,
  loadImageFromUrl,
  drawRoundedRectPhoto,
  downloadCanvasAsPng,
  type BuilderIdentity,
} from "./goaBuilderShared";
import { usePhotoPositioner } from "./usePhotoPositioner";

type Step = "upload" | "position" | "details" | "done";
type FieldKey = keyof BuilderIdentity;

const EVENT_NAME = "HACKER HOUSE GOA '26";
const QR_TARGET_URL = "https://hhgoa.dev/builder"; // replace with real profile/verify URL

export default function IdCardBuilder() {
  const [step, setStep] = useState<Step>("upload");
  const [photoImg, setPhotoImg] = useState<HTMLImageElement | null>(null);
  const [identity, setIdentity] = useState<BuilderIdentity>(() =>
    generateRandomIdentity()
  );
  const [editingField, setEditingField] = useState<FieldKey | null>(null);
  const [finalDataUrl, setFinalDataUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const positioner = usePhotoPositioner();
  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardImgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const PREVIEW_SIZE = 380;

  useEffect(() => {
    loadImageFromUrl(TEMPLATE_PATHS.card)
      .then((img) => {
        cardImgRef.current = img;
      })
      .catch(() => {
        // Template not dropped in yet — preview falls back to a flat green card.
      });
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const img = await loadImageFromFile(file);
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

  // ---- Live preview -----------------------------------------------------
  useEffect(() => {
    if (step !== "position" && step !== "details") return;
    const canvas = previewCanvasRef.current;
    if (!canvas || !photoImg) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = PREVIEW_SIZE;
    canvas.height = PREVIEW_SIZE;
    ctx.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
    ctx.fillStyle = GOA_COLORS.forestGreen;
    ctx.fillRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);

    const ratio = PREVIEW_SIZE / CARD_SPEC.canvas;
    const box = {
      x: CARD_SPEC.photoBox.x * ratio,
      y: CARD_SPEC.photoBox.y * ratio,
      w: CARD_SPEC.photoBox.w * ratio,
      h: CARD_SPEC.photoBox.h * ratio,
      borderRadius: CARD_SPEC.photoBox.borderRadius * ratio,
    };

    drawRoundedRectPhoto(ctx, photoImg, box, positioner.transform);

    if (cardImgRef.current) {
      ctx.drawImage(cardImgRef.current, 0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
    }

    if (step === "details") {
      drawCardText(ctx, ratio, identity);
    }
  }, [step, photoImg, positioner.transform, identity]);

  // ---- Full-res export ----------------------------------------------------
  const renderFinal = useCallback(async () => {
    if (!photoImg) return;
    setIsRendering(true);
    try {
      const canvas = exportCanvasRef.current ?? document.createElement("canvas");
      exportCanvasRef.current = canvas;
      canvas.width = CARD_SPEC.canvas;
      canvas.height = CARD_SPEC.canvas;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = GOA_COLORS.forestGreen;
      ctx.fillRect(0, 0, CARD_SPEC.canvas, CARD_SPEC.canvas);

      drawRoundedRectPhoto(ctx, photoImg, CARD_SPEC.photoBox, positioner.transform);

      let cardImg = cardImgRef.current;
      if (!cardImg) {
        cardImg = await loadImageFromUrl(TEMPLATE_PATHS.card).catch(() => null);
      }
      if (cardImg) {
        ctx.drawImage(cardImg, 0, 0, CARD_SPEC.canvas, CARD_SPEC.canvas);
      }

      drawCardText(ctx, 1, identity);

      // Event name in the top banner zone (ZONE A)
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = GOA_COLORS.nearBlack;
      ctx.font = "700 34px Georgia, serif";
      ctx.fillText(
        EVENT_NAME,
        CARD_SPEC.bannerZone.w / 2,
        CARD_SPEC.bannerZone.centerY
      );
      ctx.restore();

      // QR code in the QR zone
      const qrDataUrl = await QRCode.toDataURL(QR_TARGET_URL, {
        margin: 0,
        color: { dark: GOA_COLORS.nearBlack, light: "#FFFFFF00" },
      });
      const qrImg = await loadImageFromUrl(qrDataUrl);
      ctx.drawImage(
        qrImg,
        CARD_SPEC.qrZone.x,
        CARD_SPEC.qrZone.y,
        CARD_SPEC.qrZone.w,
        CARD_SPEC.qrZone.h
      );

      setFinalDataUrl(canvas.toDataURL("image/png"));
      setStep("done");
    } finally {
      setIsRendering(false);
    }
  }, [photoImg, identity]);

  const handleDownload = useCallback(() => {
    if (!exportCanvasRef.current) return;
    downloadCanvasAsPng(
      exportCanvasRef.current,
      `hhgoa-id-card-${identity.badgeNumber}.png`
    );
  }, [exportCanvasRef, identity]);

  const startOver = useCallback(() => {
    setStep("upload");
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
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-[3px] border-dashed px-8 py-16 text-center transition-colors cursor-pointer ${
            dragActive
              ? "border-[#F5CE3E] bg-[#0a4e33]"
              : "border-[#F7F1DF]/40 bg-[#063D28]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileInputChange}
          />
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF2E7E]">
            <CreditCard className="h-7 w-7 text-[#F7F1DF]" strokeWidth={2.5} />
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
            className="relative rounded-2xl overflow-hidden border-4"
            style={{
              borderColor: GOA_COLORS.nearBlack,
              width: PREVIEW_SIZE,
              height: PREVIEW_SIZE,
            }}
          >
            <div
              ref={positioner.viewportRef}
              {...positioner.bind}
              className="touch-none select-none"
              style={{ cursor: "grab" }}
            >
              <canvas
                ref={previewCanvasRef}
                width={PREVIEW_SIZE}
                height={PREVIEW_SIZE}
                className="block"
              />
            </div>
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
            <div className="w-full max-w-xs flex flex-col gap-3">
              <IdentityField
                label="Name"
                value={identity.name}
                editing={editingField === "name"}
                onEdit={() => setEditingField("name")}
                onChange={(v) => setIdentity((p) => ({ ...p, name: v }))}
                onDone={() => setEditingField(null)}
              />
              <IdentityField
                label="Stack / Role"
                value={identity.stack}
                editing={editingField === "stack"}
                onEdit={() => setEditingField("stack")}
                onChange={(v) => setIdentity((p) => ({ ...p, stack: v }))}
                onDone={() => setEditingField(null)}
              />
              <IdentityField
                label="Builder Title"
                value={identity.title}
                editing={editingField === "title"}
                onEdit={() => setEditingField("title")}
                onChange={(v) => setIdentity((p) => ({ ...p, title: v }))}
                onDone={() => setEditingField(null)}
              />
              <IdentityField
                label="Badge Number"
                value={identity.badgeNumber}
                editing={editingField === "badgeNumber"}
                onEdit={() => setEditingField("badgeNumber")}
                onChange={(v) => setIdentity((p) => ({ ...p, badgeNumber: v }))}
                onDone={() => setEditingField(null)}
              />
              <IdentityField
                label="Social Handle"
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
                  {isRendering ? "Rendering…" : "Generate ID Card"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === "done" && finalDataUrl && (
        <div className="flex flex-col items-center gap-6">
          <div
            className="rounded-2xl overflow-hidden border-4"
            style={{
              borderColor: GOA_COLORS.nearBlack,
              width: PREVIEW_SIZE,
              height: PREVIEW_SIZE,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={finalDataUrl}
              alt="Your Hacker House Goa builder ID card"
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
// Text drawing for ruled Zone C lines
// ---------------------------------------------------------------------------
function drawCardText(
  ctx: CanvasRenderingContext2D,
  ratio: number,
  identity: BuilderIdentity
) {
  const { textLines } = CARD_SPEC;
  const cx = textLines.centerX * ratio;

  const rows: Array<{ text: string; spec: { y: number; size: number; weight: number } }> = [
    { text: identity.name, spec: textLines.name },
    { text: identity.stack, spec: textLines.stack },
    { text: identity.title, spec: textLines.title },
    { text: `#${identity.badgeNumber}`, spec: textLines.badge },
    { text: identity.handle, spec: textLines.handle },
  ];

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = GOA_COLORS.cream;

  for (const row of rows) {
    ctx.font = `${row.spec.weight} ${row.spec.size * ratio}px "Helvetica Neue", Arial, sans-serif`;
    // baseline sits a few px above the ruled line for legibility
    const baselineY = row.spec.y * ratio - 6 * ratio;
    ctx.fillText(row.text, cx, baselineY);
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Small subcomponents (kept local — duplicate-but-decoupled from
// PfpFrameBuilder's version so each file can be dropped in independently)
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
