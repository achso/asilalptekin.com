"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Camera, Plus, X } from "lucide-react";
import { useId, useRef } from "react";
import { DEMO_PHOTO } from "@/lib/demoPhoto";
import { cn } from "@/lib/utils";

/**
 * PhotoEvidenceCapture (molecule)
 *
 * The native magicplan "Photos & Notes" layout, reused as evidence capture:
 * a 4-column grid (add tile + 7 slots) and a free-text note. Used by every
 * "Photos & Notes" tab and by the EscalationDraftPane's evidence step.
 *
 * Controlled: the parent owns `photos` and `note`. The EscalationDraftPane keeps
 * its submit disabled until `photos.length >= 1`; this component makes that
 * next step obvious (the add tile has a blue border while no photo exists).
 *
 * On iPad the add tile opens the rear camera directly. On a laptop, a
 * "Use demo photo" link stands in for the camera.
 */

export const MAX_PHOTOS = 7;

export type PhotoEvidenceCaptureProps = {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  note: string;
  onNoteChange: (note: string) => void;
  /** Fires once per photo added (camera or demo). */
  onPhotoAdded?: (url: string) => void;
  /** Offer a demo image when there is no camera (desktop review). */
  allowDemo?: boolean;
  /**
   * "grid": the native Photos & Notes tab (add tile + slots).
   * "single": evidence in the escalation form: one large photo slot plus an
   * add button, no empty slots (UX audit #7).
   */
  variant?: "grid" | "single";
  className?: string;
};

export function PhotoEvidenceCapture({
  photos,
  onPhotosChange,
  note,
  onNoteChange,
  onPhotoAdded,
  allowDemo = true,
  variant = "grid",
  className,
}: PhotoEvidenceCaptureProps) {
  const input = useRef<HTMLInputElement>(null);
  const noteId = useId();
  const full = photos.length >= MAX_PHOTOS;
  const needsPhoto = photos.length === 0;

  const add = (urls: string[]) => {
    const next = [...photos, ...urls].slice(0, MAX_PHOTOS);
    onPhotosChange(next);
    next.slice(photos.length).forEach((u) => onPhotoAdded?.(u));
  };
  const remove = (i: number) => onPhotosChange(photos.filter((_, j) => j !== i));

  const emptySlots = Math.max(0, MAX_PHOTOS - photos.length);

  return (
    <div className={cn("flex flex-col", className)}>
      {/* ── Photos ─────────────────────────────────────────────── */}
      <h4 className="mb-2 whitespace-nowrap px-1 text-[15px] font-semibold text-mp-muted">Photos</h4>

      <input
        ref={input}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) add(files.map((f) => URL.createObjectURL(f)));
          e.target.value = "";
        }}
      />

      {variant === "single" ? (
        <SinglePhoto
          photos={photos}
          full={full}
          onAdd={() => input.current?.click()}
          onRemove={() => remove(0)}
        />
      ) : (
      <div className="rounded-2xl bg-white p-2.5">
        <ul className="grid grid-cols-4 gap-2" aria-label="Photos">
          {/* Add tile */}
          <li>
            <button
              type="button"
              onClick={() => input.current?.click()}
              disabled={full}
              aria-label={needsPhoto ? "Add photo (required)" : "Add another photo"}
              className={cn(
                "grid aspect-square w-full place-items-center rounded-xl border-2 bg-[#f0f0f2] text-[#8e8e93] transition-colors",
                "focus-visible:border-mp-blue focus-visible:outline-none active:border-mp-blue",
                needsPhoto ? "border-mp-blue" : "border-transparent",
                "disabled:cursor-not-allowed disabled:opacity-40",
              )}
            >
              <Plus size={30} strokeWidth={1.75} aria-hidden />
            </button>
          </li>

          {/* Captured photos */}
          <AnimatePresence initial={false}>
            {photos.map((url, i) => (
              <motion.li
                key={url}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: 0.16 } }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.12 } }}
                className="relative"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Evidence photo ${i + 1}`}
                  className="aspect-square w-full rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Remove photo ${i + 1}`}
                  // 44px touch target around a 22px visual
                  className="absolute -right-3 -top-3 grid size-11 place-items-center"
                >
                  <span className="grid size-[22px] place-items-center rounded-full bg-black/70 text-white ring-2 ring-white">
                    <X size={12} strokeWidth={3} />
                  </span>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>

          {/* Empty slots */}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <li
              key={`slot-${i}`}
              aria-hidden
              className="aspect-square rounded-xl border-2 border-dashed border-gray-300"
            />
          ))}
        </ul>
      </div>
      )}

      {allowDemo && !full && (
        <button
          type="button"
          onClick={() => add([`${DEMO_PHOTO}#${Date.now()}`])}
          className="mt-1.5 min-h-11 self-center px-3 text-[15px] font-medium text-mp-blue"
        >
          No camera? Use demo photo
        </button>
      )}

      {/* ── Notes ──────────────────────────────────────────────── */}
      <label
        htmlFor={noteId}
        className="mb-2 mt-4 whitespace-nowrap px-1 text-[15px] font-semibold text-mp-muted"
      >
        Notes
      </label>
      <div className="rounded-2xl bg-white p-2.5">
        <textarea
          id={noteId}
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Add note..."
          rows={3}
          maxLength={500}
          className="block w-full resize-y rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-[15px] leading-snug outline-none placeholder:text-[#a1a1a6] focus:ring-2 focus:ring-mp-blue/40"
        />
      </div>
    </div>
  );
}

/** One large slot (the first photo, or a big "Take photo" target) plus an add button. */
function SinglePhoto({
  photos,
  full,
  onAdd,
  onRemove,
}: {
  photos: string[];
  full: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const first = photos[0];
  if (!first) {
    return (
      <button
        type="button"
        onClick={onAdd}
        aria-label="Take photo (required)"
        className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-mp-blue bg-white text-[15px] font-semibold text-mp-blue active:bg-blue-50"
      >
        <Camera size={34} strokeWidth={1.75} aria-hidden />
        Take photo
      </button>
    );
  }
  return (
    <div className="flex flex-col gap-2" aria-label="Photos">
      <div className="relative overflow-hidden rounded-2xl bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={first} alt="Evidence photo 1" className="aspect-[4/3] w-full object-cover" />
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove photo 1"
          className="absolute right-2 top-2 grid size-11 place-items-center rounded-full bg-black/60 text-white"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onAdd}
          disabled={full}
          className="flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-[15px] font-semibold text-mp-blue active:bg-blue-50 disabled:opacity-40"
        >
          <Plus size={18} aria-hidden /> Add photo
        </button>
        {photos.length > 1 && (
          <span className="text-[15px] text-mp-muted">{photos.length} photos attached</span>
        )}
      </div>
    </div>
  );
}
