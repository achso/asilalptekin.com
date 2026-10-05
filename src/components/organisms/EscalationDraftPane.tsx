"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, MapPinCheck, PackagePlus, Ruler, SearchX, Send } from "lucide-react";
import { useState } from "react";
import { StepLabel } from "@/components/atoms/StepLabel";
import { Switch } from "@/components/atoms/Switch";
import { CategoryChips } from "@/components/molecules/CategoryChips";
import { ModalHeader } from "@/components/molecules/ModalHeader";
import { NumericStepper } from "@/components/molecules/NumericStepper";
import { PhotoEvidenceCapture } from "@/components/molecules/PhotoEvidenceCapture";
import { VoiceMemoToggle, type VoiceMemo } from "@/components/molecules/VoiceMemoToggle";
import { CATEGORY_MEASURES, DIMENSION_FIELDS, PROJECT, ROOM, categoryLabel } from "@/lib/floorplan";
import type { ElementCategory, EscalationDraft, IssueType, Point } from "@/lib/types";
import { cn } from "@/lib/utils";
import { type Draft, draftLabel } from "@/store/useDeviationState";

/**
 * EscalationDraftPane (organism)
 *
 * "Intercept and Propose": the contractor never picks an issue type. They do
 * what they'd do in magicplan (Insert, Add Wall, Delete…, tap a dimension),
 * the locked plan intercepts it, and this pane slides in with the intent
 * already known. It asks only for what that intent needs:
 *
 *   dimension → Dimension Mismatch: one stepper per axis (wall length,
 *               ceiling height; the room's width + length), each > 0
 *   insert    → Undocumented Element: Object Category (preset by Add Wall /
 *               the Insert pick), the Ghost Object's location, its size
 *   delete    → Element Not on Site: nothing beyond the evidence
 *
 * Every proposal needs at least one photo. Budget and permit status are
 * attached automatically and shown above the send button.
 */
export type EscalationDraftPaneProps = {
  draft: Draft;
  /** Close (✕): discard the draft, keep the selection. */
  onCancel: () => void;
  onSubmit: (draft: EscalationDraft) => void;
};

const ISSUE_FOR: Record<Draft["intent"]["kind"], IssueType> = {
  dimension: "dimension-mismatch",
  insert: "undocumented-element",
  delete: "element-not-on-site",
};

export function EscalationDraftPane({ draft, onCancel, onSubmit }: EscalationDraftPaneProps) {
  const { anchor, intent, marker } = draft;
  const label = draftLabel(anchor);

  // Insert: category (preset by the tool, still changeable) + size.
  const [category, setCategory] = useState<ElementCategory | null>(
    intent.kind === "insert" ? intent.category : null,
  );
  const [size, setSize] = useState<{ primary: number | null; height: number | null }>({
    primary: null,
    height: null,
  });
  // Dimension: one reading per input of the challenged field.
  const field = intent.kind === "dimension" ? DIMENSION_FIELDS[intent.field] : null;
  const [readings, setReadings] = useState<{ primary: number | null; width: number | null }>({
    primary: null,
    width: null,
  });

  const [photos, setPhotos] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [voiceMemo, setVoiceMemo] = useState<VoiceMemo | undefined>();
  const [recording, setRecording] = useState(false);
  const [blocking, setBlocking] = useState(true);

  const positive = (v: number | null) => v !== null && v > 0;
  const measure = category ? CATEGORY_MEASURES[category] : null;

  // The first structured gap, if any; the button names it with the photo.
  const gap = (() => {
    if (field) {
      const empty = field.inputs.find((i) => !positive(readings[i.key]));
      return empty ? empty.label.replace("Measured ", "").toLowerCase() : null;
    }
    if (intent.kind === "insert") {
      if (!category) return "category";
      if (!positive(size.primary)) return measure!.primary.label.toLowerCase();
      if (measure!.height && !positive(size.height)) return "height";
    }
    return null;
  })();
  const hasPhoto = photos.length > 0;
  const missing = [gap, !hasPhoto && "photo"].filter(Boolean) as string[];
  const canSend = missing.length === 0 && !recording;

  const send = () => {
    if (!canSend) return;
    const base = {
      issueType: ISSUE_FOR[intent.kind],
      photoUrls: photos,
      note: note.trim() || undefined,
      voiceMemo,
      blocking,
    };
    if (field && intent.kind === "dimension") {
      const plan = (key: "primary" | "width") => field.inputs.find((i) => i.key === key)?.plannedM(anchor);
      onSubmit({
        ...base,
        dimensionField: intent.field,
        plannedM: plan("primary"),
        measuredM: readings.primary ?? undefined,
        plannedWidthM: plan("width"),
        measuredWidthM: field.inputs.some((i) => i.key === "width") ? (readings.width ?? undefined) : undefined,
      });
    } else if (intent.kind === "insert") {
      onSubmit({
        ...base,
        category: category ?? undefined,
        measuredM: size.primary ?? undefined,
        heightM: measure?.height ? (size.height ?? undefined) : undefined,
      });
    } else {
      onSubmit(base);
    }
  };

  let step = 0;
  const next = () => ++step;

  return (
    <form
      className="flex h-full flex-col"
      aria-label={`Escalation draft for ${label}`}
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <ModalHeader
        leading="info"
        title="Escalation Draft"
        subtitle={label}
        onClose={onCancel}
        closeLabel="Discard draft"
        className="border-b border-mp-line"
      />

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
        <IntentBanner draft={draft} category={category} />

        {/* ── Intent-specific inputs ─────────────────────────────── */}
        {field && (
          <section className="flex flex-col gap-2.5">
            <StepLabel n={next()} done={!gap}>
              Measured on site <span className="text-mp-red">*</span>
            </StepLabel>
            {field.inputs.map((input) => (
              <NumericStepper
                key={input.key}
                label={input.label}
                value={readings[input.key]}
                onChange={(v) => setReadings((r) => ({ ...r, [input.key]: v }))}
                reference={input.plannedM(anchor)}
              />
            ))}
          </section>
        )}

        {intent.kind === "insert" && (
          <section className="flex flex-col gap-2.5">
            <StepLabel n={next()} done={!gap}>
              New element <span className="text-mp-red">*</span>
            </StepLabel>
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-3">
              <div className="flex flex-col gap-2">
                <p className="text-[13px] font-semibold text-mp-ink">Object Category</p>
                <CategoryChips value={category} onChange={setCategory} />
              </div>
              <LocationRow marker={marker ?? null} />
              <AnimatePresence initial={false}>
                {measure && (
                  <motion.div
                    key="size"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "tween", duration: 0.22, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-2">
                      <p className="text-[13px] font-semibold text-mp-ink">Measured on site</p>
                      <NumericStepper
                        label={measure.primary.label}
                        hint={measure.primary.hint}
                        value={size.primary}
                        onChange={(v) => setSize((s) => ({ ...s, primary: v }))}
                        className="bg-mp-panel"
                      />
                      {measure.height && (
                        <NumericStepper
                          label="Height"
                          hint={`${measure.height.hint} · ceiling ${ROOM.ceilingM.toFixed(2)} m`}
                          max={ROOM.ceilingM}
                          value={size.height}
                          onChange={(v) => setSize((s) => ({ ...s, height: v }))}
                          className="bg-mp-panel"
                        />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* ── Evidence: mandatory for every proposal ─────────────── */}
        <section className="flex flex-col gap-2.5">
          <StepLabel n={next()} done={hasPhoto}>
            Evidence <span className="text-mp-red">*</span>
            <span className="ml-1.5 text-[12px] font-normal text-mp-muted">at least 1 photo</span>
          </StepLabel>
          <PhotoEvidenceCapture photos={photos} onPhotosChange={setPhotos} note={note} onNoteChange={setNote} />
        </section>

        <section className="flex flex-col gap-2.5">
          <StepLabel n={next()} done={!!voiceMemo} optional>
            Voice memo
          </StepLabel>
          <VoiceMemoToggle onChange={setVoiceMemo} onRecordingChange={setRecording} />
        </section>

        <button
          type="button"
          role="switch"
          aria-checked={blocking}
          onClick={() => setBlocking((b) => !b)}
          className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-left"
        >
          <span>
            <span className="block text-[15px] font-semibold">Work is blocked here</span>
            <span className="block text-[12px] text-mp-muted">Prioritised before 15:00 CET</span>
          </span>
          <Switch checked={blocking} />
        </button>
      </div>

      {/* ── Sticky submit with the auto-attached metadata ──────── */}
      <div className="border-t border-mp-line bg-white px-4 pb-4 pt-3">
        <ul aria-label="Attached automatically" className="mb-2.5 flex flex-wrap gap-1.5">
          {[
            `Budget €${PROJECT.budgetEur / 1000}k`,
            `Permit ${PROJECT.permit.split(" ")[0].toLowerCase()}`,
            "Plan snapshot",
          ].map((m) => (
            <li
              key={m}
              className="whitespace-nowrap rounded-full bg-mp-panel px-2.5 py-1 text-[11px] font-medium text-mp-muted"
            >
              {m}
            </li>
          ))}
        </ul>
        <motion.button
          type="submit"
          whileTap={canSend ? { scale: 0.97 } : undefined}
          disabled={!canSend}
          className={cn(
            "flex h-14 w-full items-center justify-center gap-2.5 rounded-xl text-[18px] font-semibold transition-colors",
            canSend
              ? "bg-mp-red text-white shadow-[0_8px_24px_rgba(229,53,43,0.35)]"
              : "bg-mp-line text-mp-muted",
          )}
        >
          <Send size={20} />
          {canSend ? "Send to review" : recording ? "Stop recording first" : `Add ${missing.join(" + ")}`}
        </motion.button>
      </div>
    </form>
  );
}

/** "Proposing: …" — the intercepted intent, so the contractor sees what the plan understood. */
function IntentBanner({ draft, category }: { draft: Draft; category: ElementCategory | null }) {
  const { anchor, intent } = draft;
  const label = draftLabel(anchor);
  const view =
    intent.kind === "dimension"
      ? (() => {
          const f = DIMENSION_FIELDS[intent.field];
          const plan = f.inputs
            .slice()
            .reverse() // length × width, like the plan's dimension lines
            .map((i) => i.plannedM(anchor).toFixed(2))
            .join(" × ");
          return { Icon: Ruler, title: "Dimension Change", detail: `${f.label} · plan ${plan} m` };
        })()
      : intent.kind === "insert"
        ? {
            Icon: PackagePlus,
            title: category ? `New ${categoryLabel(category)}` : "New Element",
            detail: "Undocumented Element",
          }
        : { Icon: SearchX, title: "Element Not on Site", detail: `${label} · drawn on the plan, missing on site` };

  return (
    <div role="status" className="flex items-center gap-3 rounded-2xl bg-white p-3">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-red-50 text-mp-red">
        <view.Icon size={22} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-mp-red">Proposing</span>
        <span className="block truncate whitespace-nowrap text-[16px] font-semibold text-mp-ink">{view.title}</span>
        <span className="block text-[12px] leading-snug text-mp-muted">{view.detail}</span>
      </span>
    </div>
  );
}

/** Where the Ghost Object is. The action happens on the canvas; this confirms it. */
function LocationRow({ marker }: { marker: Point | null }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[13px] font-semibold text-mp-ink">Location</p>
      <div className="flex min-h-14 items-center gap-3 rounded-xl bg-mp-panel px-3 py-2">
        {marker ? (
          <MapPinCheck size={22} className="shrink-0 text-mp-red" aria-hidden />
        ) : (
          <Crosshair size={22} className="shrink-0 text-mp-red" aria-hidden />
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate whitespace-nowrap text-[15px] font-semibold text-mp-ink">
            {marker ? "Placed on plan" : "Tap the plan where it is"}
          </span>
          {marker && (
            // Data, not a label: may wrap on narrow type rather than truncate.
            <p className="text-[12px] leading-snug text-mp-muted">
              {marker.x.toFixed(2)} m from west · {marker.y.toFixed(2)} m from north
            </p>
          )}
        </span>
      </div>
      {marker && <p className="px-1 text-[12px] text-mp-blue">Tap the plan again to move it.</p>}
    </div>
  );
}
