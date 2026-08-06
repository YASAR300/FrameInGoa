"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";

// ─── Types ───────────────────────────────────────────────────────────────────

type UploadState =
  | { status: "idle" }
  | { status: "dragging" }
  | { status: "error"; message: string }
  | { status: "preview"; file: File; dataUrl: string };

// ─── Constants ───────────────────────────────────────────────────────────────

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const ACCEPTED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
]);

const MAX_FILE_SIZE_MB = 20;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getFileExtension(name: string): string {
  return name.slice(name.lastIndexOf(".")).toLowerCase();
}

function isAcceptedFile(file: File): boolean {
  // Check MIME type first
  if (ACCEPTED_TYPES.has(file.type)) return true;
  // Fallback to extension (HEIC often has wrong MIME)
  const ext = getFileExtension(file.name);
  return ACCEPTED_EXTENSIONS.has(ext);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

interface PhotoUploadZoneProps {
  onFileSelected?: (file: File, dataUrl: string) => void;
}

export default function PhotoUploadZone({
  onFileSelected,
}: PhotoUploadZoneProps) {
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // ── Process a picked/dropped file ──────────────────────────────────────────
  const processFile = useCallback(
    async (file: File) => {
      // Validate type
      if (!isAcceptedFile(file)) {
        setState({
          status: "error",
          message: `"${file.name}" isn't a supported format. Please upload a JPG, PNG, WEBP, or HEIC photo.`,
        });
        return;
      }

      // Validate size
      const sizeMb = file.size / (1024 * 1024);
      if (sizeMb > MAX_FILE_SIZE_MB) {
        setState({
          status: "error",
          message: `That file is ${sizeMb.toFixed(1)} MB — please keep it under ${MAX_FILE_SIZE_MB} MB.`,
        });
        return;
      }

      try {
        const dataUrl = await readFileAsDataUrl(file);
        setState({ status: "preview", file, dataUrl });
        onFileSelected?.(file, dataUrl);
      } catch {
        setState({
          status: "error",
          message: "Couldn't read that file. Please try again.",
        });
      }
    },
    [onFileSelected]
  );

  // ── Input handler ──────────────────────────────────────────────────────────
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      // Reset so the same file can be re-selected
      e.target.value = "";
    },
    [processFile]
  );

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState((prev) =>
      prev.status === "dragging" ? prev : { status: "dragging" }
    );
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear dragging if leaving the drop zone itself, not a child
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setState((prev) =>
        prev.status === "dragging" ? { status: "idle" } : prev
      );
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files?.[0];
      if (file) {
        processFile(file);
      } else {
        setState({ status: "idle" });
      }
    },
    [processFile]
  );

  // ── Reset handler ──────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  // ─── Render ────────────────────────────────────────────────────────────────

  const isDragging = state.status === "dragging";
  const isError = state.status === "error";
  const isPreview = state.status === "preview";

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        id="photo-upload-input"
        accept=".jpg,.jpeg,.png,.webp,.heic,image/jpeg,image/png,image/webp,image/heic,image/heif"
        className="sr-only"
        onChange={handleInputChange}
        aria-label="Upload your photo"
      />

      {/* Drop zone / Preview area */}
      {!isPreview ? (
        <div
          ref={dropZoneRef}
          role="button"
          tabIndex={0}
          aria-label="Photo upload zone — click or drag a photo here"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={[
            "relative flex flex-col items-center justify-center gap-4",
            "min-h-[320px] sm:min-h-[380px] w-full rounded-2xl border-2 border-dashed",
            "cursor-pointer select-none transition-all duration-300",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-goa-yellow",
            isDragging
              ? "border-goa-yellow bg-goa-yellow/10 scale-[1.01]"
              : isError
              ? "border-goa-pink bg-goa-pink/5"
              : "border-goa-cream/40 bg-goa-dark-green/60 hover:border-goa-yellow/60 hover:bg-goa-dark-green/80",
          ].join(" ")}
        >
          {/* Decorative palm leaf SVG top-right */}
          <svg
            className="absolute top-3 right-4 w-16 h-16 opacity-20 pointer-events-none"
            viewBox="0 0 64 64"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M32 8 C 18 20, 8 36, 32 56"
              stroke="#FFF7E7"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M32 14 C 44 12, 58 22, 48 40"
              stroke="#FFF7E7"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M32 20 C 16 18, 6 32, 20 48"
              stroke="#FFF7E7"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>

          {/* Decorative leaf SVG bottom-left */}
          <svg
            className="absolute bottom-3 left-4 w-12 h-12 opacity-20 pointer-events-none rotate-180"
            viewBox="0 0 64 64"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M32 8 C 18 20, 8 36, 32 56"
              stroke="#FFD600"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M32 14 C 44 12, 58 22, 48 40"
              stroke="#FFD600"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          {/* Upload icon */}
          <div
            className={[
              "flex items-center justify-center w-20 h-20 rounded-full border-2 transition-all duration-300",
              isDragging
                ? "border-goa-yellow bg-goa-yellow/20 scale-110"
                : isError
                ? "border-goa-pink/50 bg-goa-pink/10"
                : "border-goa-cream/30 bg-white/5",
            ].join(" ")}
          >
            {isError ? (
              <svg
                className="w-9 h-9 text-goa-pink"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
            ) : isDragging ? (
              <svg
                className="w-9 h-9 text-goa-yellow animate-bounce-gentle"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            ) : (
              <svg
                className="w-9 h-9 text-goa-cream/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            )}
          </div>

          {/* Text */}
          <div className="flex flex-col items-center gap-2 px-6 text-center">
            {isDragging ? (
              <p className="text-goa-yellow font-semibold text-lg tracking-wide">
                Drop it here ✦
              </p>
            ) : isError ? (
              <>
                <p className="text-goa-pink font-semibold text-base leading-snug">
                  {(state as { status: "error"; message: string }).message}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  className="mt-1 text-sm text-goa-cream/70 underline underline-offset-2 hover:text-goa-cream transition-colors"
                >
                  Try a different file
                </button>
              </>
            ) : (
              <>
                <p className="font-semibold text-goa-cream text-lg leading-snug">
                  Drop your photo here
                </p>
                <p className="text-goa-cream/60 text-sm">
                  or{" "}
                  <span className="text-goa-yellow font-medium underline underline-offset-2">
                    tap to choose from your phone
                  </span>
                </p>
                <p className="text-goa-cream/40 text-xs mt-1">
                  JPG · PNG · WEBP · HEIC &nbsp;·&nbsp; up to 20 MB
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        /* ── Preview state ─────────────────────────────────────────────────── */
        <div className="flex flex-col gap-5 animate-slide-up">
          {/* Thumbnail */}
          <div className="relative w-full aspect-square max-h-72 rounded-2xl overflow-hidden border-2 border-goa-yellow/40 shadow-lg shadow-black/30">
            <Image
              src={(state as { status: "preview"; file: File; dataUrl: string }).dataUrl}
              alt="Your uploaded photo preview"
              fill
              className="object-cover"
              unoptimized // data URL, no Next.js optimization needed
            />
            {/* File name badge */}
            <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent">
              <p className="text-white text-xs font-medium truncate">
                {(state as { status: "preview"; file: File; dataUrl: string }).file.name}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {/* Continue CTA */}
            <button
              id="continue-btn"
              type="button"
              className={[
                "w-full py-4 px-6 rounded-xl font-bold text-base tracking-widest uppercase",
                "bg-goa-yellow text-goa-dark-green",
                "hover:bg-goa-yellow/90 active:scale-[0.98]",
                "transition-all duration-200 shadow-md shadow-goa-yellow/20",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-goa-yellow/50",
              ].join(" ")}
            >
              Continue →
            </button>

            {/* Change photo link */}
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-goa-cream/60 hover:text-goa-cream underline underline-offset-2 transition-colors text-center"
            >
              Use a different photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
