"use client";

import React, { useCallback, useRef, useState } from "react";
import { processAndDecodeImage } from "@/lib/image/decode";
import BuilderCardEditor from "./BuilderCardEditor";

type UploadStatus = "idle" | "dragging" | "processing" | "ready" | "error";

export default function PhotoUploadZone() {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [statusText, setStatusText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [decodedData, setDecodedData] = useState<{
    dataUrl: string; blob: Blob; imageBitmap?: ImageBitmap;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const processFile = useCallback(async (file: File) => {
    setStatus("processing");
    setStatusText("Decoding photo…");
    setErrorMessage(null);
    try {
      const decoded = await processAndDecodeImage(file, (msg) => setStatusText(msg));
      setDecodedData({ dataUrl: decoded.dataUrl, blob: decoded.blob, imageBitmap: decoded.imageBitmap });
      setStatus("ready");
    } catch {
      setStatus("error");
      setErrorMessage("Could not decode that file. Try a JPG, PNG, or HEIC photo under 25 MB.");
    }
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
    e.target.value = "";
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setStatus((p) => p === "dragging" ? p : "dragging");
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node))
      setStatus((p) => p === "dragging" ? "idle" : p);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) void processFile(file); else setStatus("idle");
  }, [processFile]);

  const handleReset = useCallback(() => {
    setStatus("idle"); setDecodedData(null); setErrorMessage(null);
  }, []);

  // Once photo is ready → show the frame/card editor
  if (status === "ready" && decodedData) {
    return <BuilderCardEditor initialImage={decodedData} onReset={handleReset} />;
  }

  const isDragging = status === "dragging";
  const isProcessing = status === "processing";
  const isError = status === "error";

  return (
    <div className="w-full max-w-md mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        id="photo-upload-input"
        accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif"
        className="sr-only"
        onChange={handleInputChange}
        aria-label="Upload your photo"
      />

      <div
        ref={dropZoneRef}
        role="button"
        tabIndex={0}
        aria-label="Upload zone — click or drag photo here"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !isProcessing) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={[
          "relative flex flex-col items-center justify-center gap-4 p-8",
          "min-h-[300px] sm:min-h-[360px] w-full rounded-2xl border-2 border-dashed",
          "cursor-pointer select-none transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-goa-yellow",
          isDragging
            ? "border-goa-yellow bg-goa-yellow/10 scale-[1.01]"
            : isError
            ? "border-goa-pink bg-goa-pink/5"
            : "border-goa-cream/30 bg-goa-dark-green/60 hover:border-goa-yellow/50 hover:bg-goa-dark-green/80",
        ].join(" ")}
      >
        {/* Icon */}
        <div className={[
          "flex items-center justify-center w-20 h-20 rounded-full border-2 transition-all duration-300",
          isProcessing ? "border-goa-yellow bg-goa-yellow/20 animate-spin"
            : isDragging ? "border-goa-yellow bg-goa-yellow/20 scale-110"
            : isError ? "border-goa-pink/50 bg-goa-pink/10"
            : "border-goa-cream/25 bg-white/5",
        ].join(" ")}>
          {isProcessing ? (
            <svg className="w-8 h-8 text-goa-yellow" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : isError ? (
            <svg className="w-9 h-9 text-goa-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          ) : (
            /* Upload icon */
            <svg className="w-9 h-9 text-goa-cream/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-2 text-center px-4">
          {isProcessing ? (
            <p className="text-goa-yellow font-semibold text-base animate-pulse">
              {statusText || "Processing…"}
            </p>
          ) : isDragging ? (
            <p className="text-goa-yellow font-semibold text-lg tracking-wide">Drop it here ✦</p>
          ) : isError ? (
            <>
              <p className="text-goa-pink font-semibold text-sm leading-snug">{errorMessage}</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleReset(); }}
                className="mt-1 text-xs text-goa-cream/60 underline hover:text-goa-cream"
              >Try a different file</button>
            </>
          ) : (
            <>
              <p className="font-semibold text-goa-cream text-lg leading-snug">
                Drop your photo here
              </p>
              <p className="text-goa-cream/55 text-sm">
                or <span className="text-goa-yellow font-medium underline underline-offset-2">
                  tap to choose from your phone
                </span>
              </p>
              <p className="text-goa-cream/35 text-xs mt-1">
                JPG · PNG · WEBP · HEIC &nbsp;·&nbsp; up to 25 MB
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
