"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, AlertTriangle, CheckCircle2, Sparkles, X } from "lucide-react";

export type ToastType = "error" | "warning" | "success" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[3000] flex flex-col items-center gap-2 pointer-events-none w-full max-w-md px-4">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const isError = toast.type === "error";
          const isWarning = toast.type === "warning";
          const isSuccess = toast.type === "success";

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md border text-sm font-semibold w-full sm:w-auto ${
                isError
                  ? "bg-[#3a0d16]/95 border-red-500/50 text-red-200 shadow-red-950/40"
                  : isWarning
                  ? "bg-[#3b2b0a]/95 border-[#f5c842]/60 text-[#ffe9a3] shadow-amber-950/40"
                  : isSuccess
                  ? "bg-[#0b3820]/95 border-emerald-500/50 text-emerald-200 shadow-emerald-950/40"
                  : "bg-[#183424]/95 border-emerald-400/40 text-emerald-100 shadow-black/50"
              }`}
            >
              {/* Lucide Icon */}
              <div className="shrink-0">
                {isError ? (
                  <AlertCircle className="w-5 h-5 text-red-400 stroke-[2.5]" />
                ) : isWarning ? (
                  <AlertTriangle className="w-5 h-5 text-[#f5c842] stroke-[2.5]" />
                ) : isSuccess ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 stroke-[2.5]" />
                ) : (
                  <Sparkles className="w-5 h-5 text-[#f5c842] stroke-[2.5]" />
                )}
              </div>

              {/* Message */}
              <span className="flex-1 leading-snug">{toast.message}</span>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 p-1 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
