"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, CheckCheck, CloudUpload, Eye, Lock } from "lucide-react";
import type { Escalation, EscalationStatus, Target } from "@/lib/types";
import { STATUS_META } from "@/lib/deviationMachine";
import { FloatingAnchor } from "./canvas/FloatingAnchor";

const TONE_BG = { red: "bg-mp-red", amber: "bg-amber-500", green: "bg-emerald-600" } as const;
const TONE_FG = { red: "text-mp-red", amber: "text-amber-600", green: "text-emerald-600" } as const;
const STATUS_ICON: Record<EscalationStatus, React.ReactNode> = {
  sending: <CloudUpload size={12} className="animate-pulse" />,
  delivered: <CheckCheck size={12} />,
  in_review: <Eye size={12} className="animate-pulse" />,
  resolved: <Check size={12} strokeWidth={3} />,
};

/** Persistent spatial badge pinned to every escalated element; reflects the deviation state. */
export function EscalationBadges({
  escalations,
  onPress,
}: {
  escalations: Escalation[];
  onPress: (t: Target) => void;
}) {
  return (
    <AnimatePresence>
      {escalations.map((e) => {
        const meta = STATUS_META[e.status];
        return (
          <FloatingAnchor key={e.id} element={e.target} distance={-84} fallbackDistance={44}>
            <motion.button
              layout
              initial={{ scale: 0, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              onClick={() => onPress(e.target)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full py-1.5 pl-1.5 pr-3.5 text-[13px] font-semibold text-white shadow-lg ring-2 ring-white transition-colors duration-300 ${TONE_BG[meta.tone]}`}
            >
              <span
                className={`grid h-6 w-6 place-items-center rounded-full bg-white ${TONE_FG[meta.tone]}`}
              >
                {e.status === "resolved" ? (
                  <Check size={14} strokeWidth={3} />
                ) : e.status === "in_review" ? (
                  <Eye size={14} strokeWidth={2.5} />
                ) : (
                  <Lock size={13} strokeWidth={3} />
                )}
              </span>
              {meta.badge}
              <span className="flex items-center gap-1 rounded-full bg-black/20 px-2 py-0.5 text-[11px] font-medium">
                {STATUS_ICON[e.status]} {meta.label}
              </span>
            </motion.button>
          </FloatingAnchor>
        );
      })}
    </AnimatePresence>
  );
}
