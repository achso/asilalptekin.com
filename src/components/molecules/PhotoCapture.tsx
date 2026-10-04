"use client";

import { motion } from "framer-motion";
import { Camera, Trash2 } from "lucide-react";
import { useRef } from "react";
import { DEMO_PHOTO } from "@/lib/demoPhoto";

/**
 * PhotoCapture (molecule): the mandatory evidence photo plus an optional
 * one-line caption. On iPad the input opens the rear camera directly.
 */
export type PhotoValue = { url: string; caption: string };

export type PhotoCaptureProps = {
  value: PhotoValue | null;
  onChange: (v: PhotoValue | null) => void;
  /** Offer a demo image when there is no camera (desktop review). */
  allowDemo?: boolean;
};

const CAPTION_MAX = 80;

export function PhotoCapture({ value, onChange, allowDemo = true }: PhotoCaptureProps) {
  const input = useRef<HTMLInputElement>(null);
  const pick = () => input.current?.click();
  const setUrl = (url: string) => onChange({ url, caption: value?.caption ?? "" });

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) setUrl(URL.createObjectURL(f));
          e.target.value = "";
        }}
      />

      {value ? (
        <div className="overflow-hidden rounded-xl bg-white">
          <div className="relative h-[140px] bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value.url} alt="Site evidence" className="size-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-black/70 to-transparent p-2.5">
              <button
                type="button"
                onClick={pick}
                className="flex h-11 items-center gap-2 rounded-lg bg-white/90 px-3 text-[14px] font-semibold"
              >
                <Camera size={18} /> Retake
              </button>
              <button
                type="button"
                onClick={() => onChange(null)}
                aria-label="Remove photo"
                className="grid size-11 place-items-center rounded-lg bg-white/90"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          {/* Optional caption, nested in the capture area */}
          <label className="flex items-center gap-2 px-3 py-2.5">
            <span className="sr-only">Photo caption (optional)</span>
            <input
              type="text"
              value={value.caption}
              maxLength={CAPTION_MAX}
              onChange={(e) => onChange({ ...value, caption: e.target.value })}
              placeholder="Add a caption (optional), e.g. pipe behind drywall"
              enterKeyHint="done"
              onKeyDown={(e) => {
                // Inside the DeviationForm: Enter closes the keyboard, never submits.
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              className="h-10 min-w-0 flex-1 rounded-lg bg-mp-panel px-3 text-[14px] outline-none placeholder:text-mp-muted focus:ring-2 focus:ring-mp-blue/40"
            />
          </label>
        </div>
      ) : (
        <>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={pick}
            className="flex h-[92px] w-full items-center justify-center gap-4 rounded-xl border-[3px] border-dashed border-mp-blue/50 bg-white text-mp-blue active:bg-mp-blue/5"
          >
            <span className="grid size-14 place-items-center rounded-full bg-mp-blue text-white">
              <Camera size={28} />
            </span>
            <span className="text-left">
              <span className="block text-[18px] font-semibold">Take Photo</span>
              <span className="block text-[12px] text-mp-muted">Required for the expert</span>
            </span>
          </motion.button>
          {allowDemo && (
            <button
              type="button"
              onClick={() => setUrl(DEMO_PHOTO)}
              className="mt-1.5 w-full text-center text-[12px] font-medium text-mp-blue"
            >
              No camera? Use demo photo
            </button>
          )}
        </>
      )}
    </div>
  );
}
