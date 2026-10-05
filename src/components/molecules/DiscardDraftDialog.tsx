"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileWarning } from "lucide-react";
import { useEffect, useRef } from "react";

/**
 * DiscardDraftDialog (molecule): magicplan's centred confirm alert, for a tap
 * elsewhere while an escalation draft is open. A stray tap must never throw
 * work away silently, so it asks. "Keep Editing" is the safe default (also
 * on Escape or a tap on the backdrop); "Discard Draft" is the destructive
 * choice, and only then does the tapped action go ahead.
 */
export function DiscardDraftDialog({
  open,
  onKeep,
  onDiscard,
}: {
  open: boolean;
  onKeep: () => void;
  onDiscard: () => void;
}) {
  const keepRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    keepRef.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onKeep();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open, onKeep]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="discard-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 z-[80] grid place-items-center bg-black/25"
          onPointerDown={(e) => e.target === e.currentTarget && onKeep()}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="discard-title"
            aria-describedby="discard-desc"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.12 } }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="w-[360px] rounded-2xl bg-[#f7f7f7] px-6 pb-6 pt-7 text-center shadow-2xl"
          >
            <FileWarning size={34} strokeWidth={1.75} className="mx-auto text-gray-400" aria-hidden />
            <h2 id="discard-title" className="mt-3 text-[17px] font-semibold text-mp-ink">
              Discard this escalation draft?
            </h2>
            <p id="discard-desc" className="mt-1.5 text-[15px] leading-snug text-mp-muted">
              Your proposed change won&apos;t be sent to the remote expert for review.
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                ref={keepRef}
                type="button"
                onClick={onKeep}
                className="h-12 rounded-xl border border-mp-line bg-white text-[17px] font-semibold text-mp-blue active:bg-gray-50"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={onDiscard}
                className="h-12 rounded-xl bg-mp-red text-[17px] font-semibold text-white active:opacity-90"
              >
                Discard Draft
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
