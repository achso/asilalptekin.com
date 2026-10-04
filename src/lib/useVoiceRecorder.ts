"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Tap-to-toggle voice memo. Uses the real microphone (MediaRecorder) when the
 * browser grants it; otherwise falls back to a simulated recording so the
 * prototype flow still works on desktop / without permissions / over plain
 * http on a LAN iPad (where getUserMedia is blocked).
 */
export function useVoiceRecorder(maxSeconds = 60) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [memo, setMemo] = useState<{ url: string; durationS: number; simulated: boolean } | null>(
    null,
  );
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const tick = useRef<number | null>(null);
  const startedAt = useRef(0);
  const simulated = useRef(false);

  const clearTick = () => {
    if (tick.current) window.clearInterval(tick.current);
    tick.current = null;
  };

  const stop = useCallback(() => {
    clearTick();
    setRecording(false);
    const durationS = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
    if (recorder.current && recorder.current.state !== "inactive") {
      recorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: recorder.current?.mimeType || "audio/webm" });
        setMemo({ url: URL.createObjectURL(blob), durationS, simulated: false });
        recorder.current?.stream.getTracks().forEach((t) => t.stop());
        recorder.current = null;
      };
      recorder.current.stop();
    } else if (simulated.current) {
      setMemo({ url: "", durationS, simulated: true });
    }
  }, []);

  const start = useCallback(async () => {
    setMemo(null);
    setSeconds(0);
    chunks.current = [];
    simulated.current = false;
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        throw new Error("unsupported");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      rec.start();
      recorder.current = rec;
    } catch {
      simulated.current = true;
    }
    startedAt.current = Date.now();
    setRecording(true);
    tick.current = window.setInterval(() => {
      const s = Math.floor((Date.now() - startedAt.current) / 1000);
      setSeconds(s);
      if (s >= maxSeconds) stop();
    }, 250);
  }, [maxSeconds, stop]);

  const toggle = useCallback(() => (recording ? stop() : start()), [recording, start, stop]);
  const discard = useCallback(() => setMemo(null), []);

  useEffect(
    () => () => {
      clearTick();
      recorder.current?.stream.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  return { recording, seconds, memo, toggle, discard };
}
