"use client";

import { useEffect } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";

interface ConfirmDeleteModalProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  loading?: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Inline delete confirmation modal — replacement for native `confirm()`
 * which is silently blocked by some browser settings / extensions /
 * embedded webviews. Renders a controlled overlay we own.
 */
export default function ConfirmDeleteModal({
  open,
  title,
  body,
  confirmLabel = "Xóa",
  loading = false,
  errorMessage = null,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  // Close on Escape key.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, loading, onCancel]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={() => {
        if (!loading) onCancel();
      }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden text-white"
        style={{
          background: "#161616",
          border: "1px solid rgba(239,68,68,0.3)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close X */}
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          style={{ background: "rgba(255,255,255,0.06)" }}
          aria-label="Đóng"
        >
          <X size={16} />
        </button>

        <div className="p-6 sm:p-7">
          <div className="flex items-start gap-4 mb-4">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(239,68,68,0.15)" }}
            >
              <AlertTriangle size={20} className="text-red-400" />
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <h3 className="font-bold text-white text-base leading-snug mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">
                {body}
              </p>
            </div>
          </div>

          {errorMessage && (
            <div
              className="text-xs text-red-400 px-3 py-2 rounded-lg mb-3"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
              }}
            >
              {errorMessage}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 mt-5">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white transition-colors disabled:opacity-50"
              style={{ background: "#222", border: "1px solid #333" }}
            >
              Huỷ
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white inline-flex items-center gap-2 disabled:opacity-60"
              style={{ background: "#dc2626" }}
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
