"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCheck, CloudUpload, Lock } from "lucide-react";
import { cornerById, toPx, wallById, wallGeometry } from "@/lib/floorplan";
import type { Escalation, Point, Target } from "@/lib/types";
import { CANVAS_H, CANVAS_W } from "@/lib/layout";

/** Where to anchor UI for a target, in canvas px. `inward` points into the room. */
function anchorFor(t: Target): { p: Point; inward: Point } {
  if (t.kind === "wall") {
    const g = wallGeometry(wallById(t.id));
    return { p: g.mid, inward: { x: g.nx, y: g.ny } };
  }
  const p = toPx(cornerById(t.id).p);
  // diagonal toward the room centre
  const c = toPx({ x: 2.275, y: 1.665 });
  const d = Math.hypot(c.x - p.x, c.y - p.y);
  return { p, inward: { x: (c.x - p.x) / d, y: (c.y - p.y) / d } };
}

export function ReportDeviationButton({
  target,
  escalated,
  onPress,
}: {
  target: Target | null;
  escalated: boolean;
  onPress: () => void;
}) {
  return (
    <AnimatePresence>
      {target && !escalated && (
        <FloatingAt key={`${target.kind}-${target.id}`} target={target} distance={78}>
          <motion.button
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            whileTap={{ scale: 0.94 }}
            onClick={onPress}
            className="flex h-16 items-center gap-3 whitespace-nowrap rounded-2xl bg-mp-red pl-4 pr-6 text-[19px] font-semibold text-white shadow-[0_10px_30px_rgba(229,53,43,0.45)] ring-4 ring-white"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20">
              <AlertTriangle size={24} strokeWidth={2.5} />
            </span>
            Report Deviation
          </motion.button>
        </FloatingAt>
      )}
    </AnimatePresence>
  );
}

/** Persistent spatial badge pinned to every escalated element. */
export function EscalationBadges({
  escalations,
  onPress,
}: {
  escalations: Escalation[];
  onPress: (t: Target) => void;
}) {
  return (
    <AnimatePresence>
      {escalations.map((e) => (
        <FloatingAt key={e.id} target={e.target} distance={-84} fallbackDistance={44}>
          <motion.button
            initial={{ scale: 0, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 22, delay: 0.15 }}
            onClick={() => onPress(e.target)}
            className="flex items-center gap-2 whitespace-nowrap rounded-full bg-mp-red py-1.5 pl-1.5 pr-3.5 text-[13px] font-semibold text-white shadow-lg ring-2 ring-white"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-mp-red">
              <Lock size={13} strokeWidth={3} />
            </span>
            Escalated to Munich
            <span className="flex items-center gap-1 rounded-full bg-black/20 px-2 py-0.5 text-[11px] font-medium">
              {e.status === "queued" ? (
                <>
                  <CloudUpload size={12} className="animate-pulse" /> Sending
                </>
              ) : (
                <>
                  <CheckCheck size={12} /> Delivered
                </>
              )}
            </span>
          </motion.button>
        </FloatingAt>
      ))}
    </AnimatePresence>
  );
}

/** Absolutely positions children centred on a point offset from the target. */
function FloatingAt({
  target,
  distance,
  fallbackDistance,
  children,
}: {
  target: Target;
  distance: number; // + = into the room, − = outside
  /** used instead of `distance` when the preferred spot would leave the canvas */
  fallbackDistance?: number;
  children: React.ReactNode;
}) {
  const { p, inward } = anchorFor(target);
  const at = (d: number) => ({ x: p.x + inward.x * d, y: p.y + inward.y * d });
  let pos = at(distance);
  if (fallbackDistance !== undefined && !inBounds(pos)) pos = at(fallbackDistance);
  // Keep floating UI fully on-canvas (≈150px half-width for the widest chip).
  const x = clamp(pos.x, MARGIN_X, CANVAS_W - MARGIN_X);
  const y = clamp(pos.y, MARGIN_Y, CANVAS_H - MARGIN_Y);
  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
    >
      <div className="pointer-events-auto">{children}</div>
    </div>
  );
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const MARGIN_X = 150;
const MARGIN_Y = 40;
const inBounds = (p: Point) =>
  p.x >= MARGIN_X && p.x <= CANVAS_W - MARGIN_X && p.y >= MARGIN_Y && p.y <= CANVAS_H - MARGIN_Y;
