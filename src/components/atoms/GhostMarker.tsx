"use client";

import { motion } from "framer-motion";
import { ObjectCategoryIcon } from "@/components/atoms/ObjectCategoryIcon";
import type { ElementCategory, Point } from "@/lib/types";

/**
 * GhostMarker (atom): a proposed element that isn't on the locked plan (the
 * "Ghost Object"). It isn't geometry, so it's drawn as a dashed,
 * semi-transparent ring with crosshair ticks, holding the category's glyph
 * once one is known. The draft drops in and pulses while it's being placed;
 * submitted ones take their report's status colour.
 */
export function GhostMarker({
  at,
  color,
  category,
  draft = false,
}: {
  at: Point;
  color: string;
  category?: ElementCategory | null;
  draft?: boolean;
}) {
  const r = category ? 22 : 16;
  return (
    <motion.g
      pointerEvents="none"
      // Moving the draft glides instead of jumping.
      initial={draft ? { x: at.x, y: at.y - 18, opacity: 0 } : false}
      animate={{ x: at.x, y: at.y, opacity: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      style={{ color }}
      aria-hidden
      data-ghost={draft ? "draft" : "submitted"}
    >
      {draft && (
        <motion.circle
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={2}
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.9, opacity: 0 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <circle r={r} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={2.5} strokeDasharray="5 4" />
      <path
        d={`M0 ${-r - 8} V${-r - 2} M0 ${r + 2} V${r + 8} M${-r - 8} 0 H${-r - 2} M${r + 2} 0 H${r + 8}`}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {category ? (
        <g transform="translate(-14 -14)" opacity={0.85}>
          <ObjectCategoryIcon category={category} size={28} />
        </g>
      ) : (
        <circle r={3.5} fill={color} />
      )}
    </motion.g>
  );
}
