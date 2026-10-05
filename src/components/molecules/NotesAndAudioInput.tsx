"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mic, Pause, Play, Square, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type NotesMode = "text" | "recording" | "recorded";
/** The voice memo that rides along with the note (mocked: no audio is kept). */
export type VoiceMemoValue = { durationS: number; transcribed?: boolean };

/** MVP transcript (golden path: the dimension mismatch). */
export const DEFAULT_TRANSCRIPT =
  "The physical wall is 20cm shorter than the locked plan indicates. Requesting permission to proceed.";

/** A fixed, natural-looking waveform (bar heights in px), so it never jumps between renders. */
const BARS = [6, 10, 16, 9, 20, 26, 14, 8, 18, 24, 12, 7, 15, 22, 28, 19, 10, 6, 13, 21, 25, 16, 9, 12, 18, 8, 5, 11, 17, 7];
const BAR_W = 3;
const BAR_GAP = 2;
const WAVE_W = BARS.length * (BAR_W + BAR_GAP) - BAR_GAP;
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** Same box for every mode, so the field shape-shifts in place instead of growing the form. */
const FOOTPRINT = "min-h-[96px] w-full rounded-xl bg-gray-100";

/**
 * NotesAndAudioInput (molecule): the Notes field and the voice memo in ONE
 * footprint (mocked audio, WhatsApp-style), so the form needs no separate
 * Voice memo section.
 *
 *   text       the note's text area, gray mic button in its bottom-right corner
 *   recording  the text area gives way to a pill: pulsing red dot · timer · Stop
 *   recorded   the WhatsApp bubble: play · waveform · duration · green Transcribe,
 *              and a trash icon (deletes the audio, back to text)
 *   Transcribe the text area comes back below the waveform, pre-filled with the
 *              transcript, editable
 */
export function NotesAndAudioInput({
  id,
  note,
  onNoteChange,
  transcript = DEFAULT_TRANSCRIPT,
  onMemoChange,
}: {
  /** Ties the "Notes" label to the text area. */
  id?: string;
  note: string;
  onNoteChange: (note: string) => void;
  /** What "Transcribe" produces (hardcoded per golden path). */
  transcript?: string;
  /** The memo as it stands (null: no memo). */
  onMemoChange?: (memo: VoiceMemoValue | null) => void;
}) {
  const [mode, setMode] = useState<NotesMode>("text");
  const [transcribed, setTranscribed] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 of mock playback

  // Recording: count up once a second.
  const tick = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (mode !== "recording") return;
    tick.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(tick.current);
  }, [mode]);

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

  const record = () => {
    setSeconds(0);
    setTranscribed(false);
    setMode("recording");
  };
  const stop = () => {
    const d = Math.max(1, seconds);
    setSeconds(d);
    setMode("recorded");
    onMemoChange?.({ durationS: d });
  };
  const transcribe = () => {
    setTranscribed(true);
    // Pre-fill (after anything already typed), editable from here.
    const prev = note.trim();
    onNoteChange(prev ? `${prev} ${transcript}` : transcript);
    onMemoChange?.({ durationS: seconds, transcribed: true });
  };
  const discard = () => {
    setPlaying(false);
    setProgress(0);
    setTranscribed(false);
    setMode("text");
    onMemoChange?.(null);
  };

  const textArea = (withMic: boolean) => (
    <div className="relative">
      <textarea
        id={id}
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Add note..."
        rows={3}
        maxLength={500}
        className={cn(
          FOOTPRINT,
          "block resize-y border-0 py-2.5 pl-3 text-[15px] leading-snug outline-none placeholder:text-[#a1a1a6] focus:ring-2 focus:ring-mp-blue/40",
          // The mic sits in the bottom-right corner; this padding keeps text clear of it.
          withMic ? "pr-14" : "pr-3",
        )}
      />
      {withMic && (
        <button
          type="button"
          onClick={record}
          aria-label="Record voice memo"
          className="absolute bottom-2 right-2 grid size-11 place-items-center rounded-full bg-gray-200 text-mp-ink active:bg-gray-300"
        >
          <Mic size={20} aria-hidden />
        </button>
      )}
    </div>
  );

  // ── text ──────────────────────────────────────────────────────────────────
  if (mode === "text") return <div data-notes-mode="text">{textArea(true)}</div>;

  // ── recording: the text area gives way to the recording pill ──────────────
  if (mode === "recording") {
    return (
      <div
        data-notes-mode="recording"
        role="status"
        aria-label={`Recording voice memo, ${clock(seconds)}`}
        className={cn(FOOTPRINT, "flex items-center gap-3 rounded-full border border-mp-line bg-white pl-5 pr-2")}
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

  // ── recorded: the WhatsApp bubble (+ the editable transcript once transcribed)
  const played = Math.round(progress * BARS.length);
  return (
    <div data-notes-mode={transcribed ? "transcribed" : "recorded"} className="flex flex-col gap-2">
      <div className={cn(FOOTPRINT, "flex items-center gap-3 p-3")}>
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
          <svg width="100%" height={28} viewBox={`0 0 ${WAVE_W} 28`} preserveAspectRatio="none" aria-hidden>
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
            {!transcribed && (
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

      {/* Transcribed: the text area returns below the waveform, pre-filled, editable. */}
      <AnimatePresence initial={false}>
        {transcribed && (
          <motion.div
            key="transcript"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ height: { duration: 0.22 }, opacity: { duration: 0.3, delay: 0.1 } }}
            className="overflow-hidden"
          >
            {textArea(false)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
