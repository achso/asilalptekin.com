"use client";

import { useEffect, useState } from "react";

/** Logical iPad Air / Pro 11" landscape viewport in CSS px. */
export const IPAD_W = 1180;
export const IPAD_H = 820;
const BEZEL = 18;

/**
 * Renders the app at a fixed iPad landscape size and scales it to fit the
 * browser. On a real iPad in landscape the scale is ~1 and the bezel is
 * dropped, so it behaves like a native full-screen app.
 */
export function IPadFrame({ children }: { children: React.ReactNode }) {
  const [fit, setFit] = useState<{ scale: number; bezel: boolean } | null>(null);

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const bezel = vw > IPAD_W + 120 && vh > IPAD_H + 120;
      const pad = bezel ? 64 + BEZEL * 2 : 0;
      const scale = Math.min((vw - pad) / IPAD_W, (vh - pad) / IPAD_H, bezel ? 1.15 : 10);
      setFit({ scale, bezel });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const portrait = typeof window !== "undefined" && fit && window.innerHeight > window.innerWidth;

  return (
    <main className="flex h-dvh w-screen items-center justify-center overflow-hidden">
      <div
        style={{
          width: IPAD_W,
          height: IPAD_H,
          transform: `scale(${fit?.scale ?? 1})`,
          opacity: fit ? 1 : 0,
          padding: fit?.bezel ? BEZEL : 0,
          boxSizing: "content-box",
        }}
        className={`shrink-0 origin-center transition-opacity ${
          fit?.bezel ? "rounded-[44px] bg-black shadow-[0_40px_120px_rgba(0,0,0,0.6)]" : ""
        }`}
      >
        <div
          className={`ipad relative h-full w-full overflow-hidden bg-mp-canvas ${
            fit?.bezel ? "rounded-[28px]" : ""
          }`}
        >
          {children}
        </div>
      </div>

      {portrait && (
        <div className="fixed inset-x-0 bottom-4 mx-auto w-fit rounded-full bg-black/80 px-4 py-2 text-sm text-white">
          Rotate to landscape for the intended layout
        </div>
      )}
    </main>
  );
}
