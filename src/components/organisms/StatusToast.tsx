"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Lock, MousePointerClick } from "lucide-react";
import type { ToastTone } from "@/store/useDeviationState";
import { cn } from "@/lib/utils";

const ICON: Record<ToastTone, React.ReactNode> = {
  success: <CheckCircle2 size={22} className="shrink-0 text-emerald-400" />,
  locked: <Lock size={20} className="shrink-0 text-amber-300" />,
  hint: <MousePointerClick size={20} className="shrink-0 text-sky-300" />,
  warning: <AlertTriangle size={20} className="shrink-0 text-amber-400" />,
};

/**
 * StatusToast (organism): the bottom-centre message layer over the canvas.
 *
 *  - event toast  ("North wall sent for review…"): wins whenever present; tap to dismiss
 *  - idle hint    ("Something doesn't match? Tap the 4.55 dimension, or use Insert."):
 *                 the default-state guidance while nothing is selected
 */
export type StatusToastProps = {
  toast: { id: number; text: string; tone: ToastTone } | null;
  showHint: boolean;
  /** Lift above the dev-tools panel when it's open. */
  raised?: boolean;
  onDismiss: () => void;
  /** Override positioning, e.g. "relative inset-auto bottom-auto" to place it in normal flow. */
  className?: string;
};

export function StatusToast({ toast, showHint, raised, onDismiss, className }: StatusToastProps) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "pointer-events-none absolute inset-x-0 z-[60] flex justify-center transition-[bottom] duration-300",
        raised ? "bottom-[150px]" : "bottom-[84px]",
        className,
      )}
    >
      <AnimatePresence mode="wait">
        {toast ? (
          <motion.button
            key={toast.id}
            type="button"
            onClick={onDismiss}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="pointer-events-auto flex max-w-[680px] items-center gap-3 rounded-2xl bg-mp-ink px-5 py-4 text-left text-[15px] font-medium text-white shadow-2xl"
          >
            {ICON[toast.tone]}
            {toast.text}
          </motion.button>
        ) : showHint ? (
          <motion.div
            key="hint"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="whitespace-nowrap rounded-full bg-black/75 px-4 py-2 text-[14px] font-medium text-white"
          >
            Something doesn&apos;t match? Tap the 4.55 dimension, or use Insert.
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
