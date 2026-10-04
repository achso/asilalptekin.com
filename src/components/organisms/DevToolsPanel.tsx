"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Timer, Wifi, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { STATUS_META } from "@/store/deviationMachine";
import type { Escalation, EscalationStatus } from "@/lib/types";
import type { DemoSettings } from "@/store/useDeviationState";

const FLIP: EscalationStatus[] = ["delivered", "in_review", "resolved"];

const FLIP_STYLE: Record<EscalationStatus, string> = {
  sending: "bg-sky-500",
  delivered: "bg-mp-red",
  in_review: "bg-amber-500",
  resolved: "bg-emerald-600",
};

/**
 * Presenter-only "Munich side" controls. Hidden by default.
 * Open: Shift+D, triple-tap the status-bar clock, or load with ?dev=1.
 */
export function useDevToolsToggle() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("dev")) setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === "d") setOpen((o) => !o);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return { open, setOpen, toggle: () => setOpen((o) => !o) };
}

type Props = {
  open: boolean;
  onClose: () => void;
  /** The escalation the controls act on (selected wall's, else newest). */
  target?: Escalation;
  /** Set when `target` is optimistically revoked and awaiting server confirmation. */
  revokeSettlesAt?: number;
  demo: DemoSettings;
  setDemo: (p: Partial<DemoSettings>) => void;
  /** Dev override: any status, may move backwards (presenter convenience). */
  setStatus: (id: string, s: EscalationStatus) => void;
  /** Realistic path: Munich opens the report via the store's mockExpertReview(). */
  onMockReview: (id: string) => void;
  reset: () => void;
};

export function DevToolsPanel({
  open,
  onClose,
  target,
  revokeSettlesAt,
  demo,
  setDemo,
  setStatus,
  onMockReview,
  reset,
}: Props) {
  const remaining = useCountdown(revokeSettlesAt);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          className="absolute inset-x-4 bottom-4 z-40 rounded-2xl bg-[#1c1c1e]/95 p-3 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur"
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-white/70">
              <Zap size={12} /> Dev · Munich side
            </span>

            <div className="min-w-0 flex-1 truncate text-[13px]">
              {target ? (
                <>
                  <span className="font-semibold">{target.targetLabel}</span>
                  <span className="text-white/50"> · </span>
                  <span className="font-semibold">{STATUS_META[target.status].label}</span>
                </>
              ) : (
                <span className="text-white/50">Submit a report to control it from here.</span>
              )}
            </div>

            <Toggle
              icon={<Timer size={14} />}
              label="Auto-advance"
              on={demo.autoAdvance}
              onChange={(v) => setDemo({ autoAdvance: v })}
            />
            <Toggle
              icon={<Wifi size={14} />}
              label="Slow revoke (3s)"
              on={demo.slowNetwork}
              onChange={(v) => setDemo({ slowNetwork: v })}
            />
            <button
              onClick={reset}
              aria-label="Reset demo"
              className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 active:bg-white/20"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={onClose}
              aria-label="Close dev tools"
              className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 active:bg-white/20"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            {FLIP.map((s) => {
              const active = target?.status === s;
              return (
                <button
                  key={s}
                  disabled={!target}
                  onClick={() => {
                    if (!target) return;
                    // Forward into review goes through the state machine (this is
                    // what wins the revoke race); anything else is a dev override.
                    const forward = s === "in_review" && (target.status === "sending" || target.status === "delivered");
                    if (forward) onMockReview(target.id);
                    else setStatus(target.id, s);
                  }}
                  className={`relative h-11 flex-1 rounded-xl text-[14px] font-semibold transition-colors disabled:opacity-30 ${
                    active ? `${FLIP_STYLE[s]} text-white` : "bg-white/10 text-white/80 active:bg-white/20"
                  }`}
                >
                  {STATUS_META[s].label}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {remaining !== null && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-amber-500/15 px-3 py-2 text-[12px] text-amber-200">
                  <span className="font-mono font-bold tabular-nums">{remaining.toFixed(1)}s</span>
                  Revoke in flight. Tap <b>In Review</b> now to make Munich win the race.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Toggle({
  icon,
  label,
  on,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      aria-pressed={on}
      className={`flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-semibold transition-colors ${
        on ? "bg-white text-mp-ink" : "bg-white/10 text-white/70"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function useCountdown(until?: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!until) return;
    const t = window.setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, [until]);
  if (!until) return null;
  const s = (until - now) / 1000;
  return s > 0 ? s : null;
}
