"use client";

import { motion } from "framer-motion";
import type { Point } from "@/lib/types";

/**
 * GhostMarker (atom): where an Undocumented Element physically is. It's not
 * part of the locked plan, so it's drawn as a dashed "ghost" ring with a
 * crosshair rather than as geometry. The draft (blue) pulses and drops in
 * while the contractor is placing it; submitted ones take their report's
 * status colour.
 */
export function GhostMarker({
  at,
  color,
  draft = false,
}: {
  at: Point;
  color: string;
  draft?: boolean;
}) {
  return (
    <motion.g
      pointerEvents="none"
      // Moving the draft glides instead of jumping.
      initial={draft ? { x: at.x, y: at.y - 18, opacity: 0 } : false}
      animate={{ x: at.x, y: at.y, opacity: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      aria-hidden
      data-ghost={draft ? "draft" : "submitted"}
    >
      {draft && (
        <motion.circle
          r={16}
          fill="none"
          stroke={color}
          strokeWidth={2}
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <circle r={16} fill={color} fillOpacity={0.14} stroke={color} strokeWidth={2.5} strokeDasharray="5 4" />
      <path d="M0 -24 V-9 M0 9 V24 M-24 0 H-9 M9 0 H24" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <circle r={3.5} fill={color} />
    </motion.g>
  );
}
