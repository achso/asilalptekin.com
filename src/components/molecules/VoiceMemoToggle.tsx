"use client";

import { motion } from "framer-motion";
import { Mic, Square, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useVoiceRecorder } from "@/lib/useVoiceRecorder";
import { cn } from "@/lib/utils";

/**
 * VoiceMemoToggle (molecule): tap to talk, tap to stop. Uses the microphone
 * when the browser allows it, otherwise a simulated recording (see
 * useVoiceRecorder). Reports the memo and the recording state upward.
 */
export type VoiceMemo = { url: string; durationS: number };

export type VoiceMemoToggleProps = {
  onChange: (memo: VoiceMemo | undefined) => void;
  /** Lets the form block "Send" while a recording is still running. */
  onRecordingChange?: (recording: boolean) => void;
};

export function VoiceMemoToggle({ onChange, onRecordingChange }: VoiceMemoToggleProps) {
  const voice = useVoiceRecorder();

  useEffect(() => onRecordingChange?.(voice.recording), [voice.recording, onRecordingChange]);
  useEffect(
    () => onChange(voice.memo ? { url: voice.memo.url, durationS: voice.memo.durationS } : undefined),
    [voice.memo, onChange],
  );

  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-2.5">
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={voice.toggle}
        aria-pressed={voice.recording}
        aria-label={voice.recording ? "Stop recording" : "Record voice memo"}
        className={cn(
          "relative grid size-14 shrink-0 place-items-center rounded-full text-white",
          voice.recording ? "bg-mp-red" : "bg-mp-ink",
        )}
      >
        {voice.recording && (
          <motion.span
            className="absolute inset-0 rounded-full bg-mp-red"
            animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
            transition={{ repeat: Infinity, duration: 1.1 }}
          />
        )}
        {voice.recording ? <Square size={20} fill="white" /> : <Mic size={24} />}
      </motion.button>

      <div className="min-w-0 flex-1">
        {voice.recording ? (
          <Waveform seconds={voice.seconds} />
        ) : voice.memo ? (
          <div className="flex items-center gap-2">
            {voice.memo.url ? (
              <audio src={voice.memo.url} controls className="h-9 w-full min-w-0" />
            ) : (
              <span className="text-[14px] font-medium">Memo · {voice.memo.durationS}s</span>
            )}
            <button
              type="button"
              onClick={voice.discard}
              aria-label="Delete memo"
              className="p-1.5 text-mp-muted"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ) : (
          <div>
            <div className="text-[15px] font-semibold">Record Voice Memo</div>
            <div className="text-[12px] text-mp-muted">Expected vs. found, in your words</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Waveform({ seconds }: { seconds: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 flex-1 items-center gap-[3px] overflow-hidden">
        {Array.from({ length: 22 }).map((_, i) => (
          <motion.span
            key={i}
            className="w-1 shrink-0 rounded-full bg-mp-red"
            animate={{ height: [6, 8 + ((i * 37) % 24), 6] }}
            transition={{ repeat: Infinity, duration: 0.6 + (i % 5) * 0.12, ease: "easeInOut" }}
          />
        ))}
      </div>
      <span className="text-[14px] font-semibold tabular-nums text-mp-red">
        {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
      </span>
    </div>
  );
}
