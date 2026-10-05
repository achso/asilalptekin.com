"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mic, Pause, Play, Square, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type MemoState = "idle" | "recording" | "recorded" | "transcribed";
export type VoiceMemoValue = { durationS: number; transcript?: string };

/** MVP transcript (golden path: the dimension mismatch). */
export const DEFAULT_TRANSCRIPT =
  "The physical wall is 20cm shorter than the locked plan indicates. Requesting permission to proceed.";

/** A fixed, natural-looking waveform (bar heights in px), so it never jumps between renders. */
const BARS = [6, 10, 16, 9, 20, 26, 14, 8, 18, 24, 12, 7, 15, 22, 28, 19, 10, 6, 13, 21, 25, 16, 9, 12, 18, 8, 5, 11, 17, 7];
const BAR_W = 3;
const BAR_GAP = 2;

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/**
 * VoiceMemoCard (molecule): a WhatsApp-style voice note, mocked (no audio,
 * no speech-to-text API) to prove the UX.
 *
 *   idle         gray "Add Voice Memo" button
 *   recording    pill: pulsing red dot · timer counting up · Stop
 *   recorded     gray bubble: play · waveform · duration · green "Transcribe"
 *   transcribed  the bubble grows downwards and the transcript fades in
 *
 * Play runs a mock playback over the memo's length (bars fill as it plays).
 * The trash button throws the memo away (back to idle).
 */
export function VoiceMemoCard({
  transcript = DEFAULT_TRANSCRIPT,
  onChange,
  className,
}: {
  /** What "Transcribe" reveals (hardcoded per golden path). */
  transcript?: string;
  /** The memo as it stands (null when there is none). */
  onChange?: (memo: VoiceMemoValue | null) => void;
  className?: string;
}) {
  const [memoState, setMemoState] = useState<MemoState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 of playback
  const tick = useRef<number | undefined>(undefined);

  // Recording: count up once a second.
  useEffect(() => {
    if (memoState !== "recording") return;
    tick.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(tick.current);
  }, [memoState]);

  // Mock playback: fill the waveform over the memo's length, then stop.
  useEffect(() => {
    if (!playing) return;
    const started = performance.now() - progress * seconds * 1000;
    const t = window.setInterval(() => {
      const p = Math.min(1, (performance.now() - started) / (seconds * 1000));
      setProgress(p);
      if (p >= 1) {
        setPlaying(false);
        setProgress(0);
      }
    }, 80);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const start = () => {
    setSeconds(0);
    setMemoState("recording");
  };
  const stop = () => {
    const d = Math.max(1, seconds);
    setSeconds(d);
    setMemoState("recorded");
    onChange?.({ durationS: d });
  };
  const transcribe = () => {
    setMemoState("transcribed");
    onChange?.({ durationS: seconds, transcript });
  };
  const discard = () => {
    setPlaying(false);
    setProgress(0);
    setSeconds(0);
    setMemoState("idle");
    onChange?.(null);
  };

  // ── State 1: idle ─────────────────────────────────────────────────────────
  if (memoState === "idle") {
    return (
      <button
        type="button"
        onClick={start}
        className={cn(
          "flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-100 text-[15px] font-semibold text-mp-ink active:bg-gray-200",
          className,
        )}
      >
        <Mic size={20} aria-hidden /> Add Voice Memo
      </button>
    );
  }

  // ── State 2: recording ────────────────────────────────────────────────────
  if (memoState === "recording") {
    return (
      <div
        role="status"
        aria-label={`Recording, ${clock(seconds)}`}
        className={cn("flex h-14 items-center gap-3 rounded-full border border-mp-line bg-white pl-5 pr-1.5", className)}
      >
        <span className="relative flex size-3" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-mp-red opacity-60" />
          <span className="relative inline-flex size-3 rounded-full bg-mp-red" />
        </span>
        <span className="text-[17px] font-semibold tabular-nums text-mp-ink">{clock(seconds)}</span>
        <span className="flex-1 text-[15px] text-mp-muted">Recording…</span>
        <button
          type="button"
          onClick={stop}
          className="flex h-11 items-center gap-2 rounded-full bg-mp-red px-4 text-[15px] font-semibold text-white active:opacity-90"
        >
          <Square size={14} fill="currentColor" aria-hidden /> Stop
        </button>
      </div>
    );
  }

  // ── States 3 + 4: recorded / transcribed (the WhatsApp bubble) ────────────
  const waveW = BARS.length * (BAR_W + BAR_GAP) - BAR_GAP;
  const played = Math.round(progress * BARS.length);
  return (
    <motion.div layout className={cn("rounded-2xl bg-gray-100 p-3", className)} data-memo-state={memoState}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause voice memo" : "Play voice memo"}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-mp-ink shadow-sm active:bg-gray-50"
        >
          {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>

        <div className="min-w-0 flex-1">
          {/* Mock waveform: bars of varying height; played bars go dark. */}
          <svg width="100%" height={28} viewBox={`0 0 ${waveW} 28`} preserveAspectRatio="none" aria-hidden>
            {BARS.map((h, i) => (
              <rect
                key={i}
                x={i * (BAR_W + BAR_GAP)}
                y={(28 - h) / 2}
                width={BAR_W}
                height={h}
                rx={1.5}
                className={i < played ? "fill-mp-ink" : "fill-gray-400"}
              />
            ))}
          </svg>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[15px] tabular-nums text-mp-muted">
              {playing ? clock(Math.round(progress * seconds)) : clock(seconds)}
            </span>
            {memoState === "recorded" && (
              <button
                type="button"
                onClick={transcribe}
                className="-my-2 px-1 py-2 text-[15px] font-semibold text-emerald-600 active:text-emerald-700"
              >
                Transcribe
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={discard}
          aria-label="Delete voice memo"
          className="grid size-11 shrink-0 place-items-center rounded-full text-mp-muted active:bg-gray-200"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* State 4: the bubble grows downwards and the transcript fades in. */}
      <AnimatePresence initial={false}>
        {memoState === "transcribed" && (
          <motion.div
            key="transcript"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ height: { duration: 0.22 }, opacity: { duration: 0.3, delay: 0.1 } }}
            className="overflow-hidden"
          >
            <p data-transcript className="mt-3 border-t border-gray-200 pt-3 text-[15px] leading-snug text-mp-ink">
              {transcript}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
