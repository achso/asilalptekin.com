"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BrickWall,
  Camera,
  Check,
  ChevronLeft,
  CircleHelp,
  Construction,
  DoorOpen,
  Mic,
  Minus,
  MoveHorizontal,
  Plus,
  Ruler,
  Send,
  Square,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import { ISSUE_TYPES, PROJECT, cornerById, wallById } from "@/lib/floorplan";
import { DEMO_PHOTO } from "@/lib/demoPhoto";
import type { Escalation, IssueType, Target } from "@/lib/types";
import { useVoiceRecorder } from "@/lib/useVoiceRecorder";

const ISSUE_ICONS: Record<IssueType, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  "wall-missing": BrickWall,
  "dimension-mismatch": Ruler,
  obstacle: Construction,
  "wrong-position": MoveHorizontal,
  "opening-missing": DoorOpen,
  other: CircleHelp,
};

/**
 * Escalation Form: takes over the right sidebar (replacing magicplan's
 * generic "Photos & Notes" grid + free-text area) with structured inputs.
 * The canvas stays visible, so the selected wall remains in view while
 * reporting. No keyboard needed anywhere.
 */
export function EscalationForm({
  target,
  onCancel,
  onSubmit,
}: {
  target: Target;
  onCancel: () => void;
  onSubmit: (e: Escalation) => void;
}) {
  const wall = target.kind === "wall" ? wallById(target.id) : null;
  const label = wall ? wall.label : cornerById(target.id).label;
  const plannedM = wall?.lengthM;

  const [issue, setIssue] = useState<IssueType | null>(null);
  const [measured, setMeasured] = useState<number>(plannedM ?? 0);
  const [photo, setPhoto] = useState<string | null>(null);
  const [blocking, setBlocking] = useState(true);
  const voice = useVoiceRecorder();
  const fileInput = useRef<HTMLInputElement>(null);

  const missing: string[] = [];
  if (!issue) missing.push("issue type");
  if (!photo) missing.push("photo");
  const canSend = missing.length === 0 && !voice.recording;
  const delta = plannedM !== undefined ? measured - plannedM : 0;

  const send = () => {
    if (!issue || !photo) return;
    onSubmit({
      id: `esc-${Date.now()}`,
      target,
      targetLabel: label,
      issueType: issue,
      plannedM,
      measuredM: issue === "dimension-mismatch" ? measured : undefined,
      photoUrl: photo,
      voiceMemo: voice.memo ? { url: voice.memo.url, durationS: voice.memo.durationS } : undefined,
      blocking,
      createdAt: Date.now(),
      status: "queued",
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-mp-line px-4 py-3">
        <button
          onClick={onCancel}
          className="flex h-11 items-center gap-0.5 rounded-full pl-1 pr-3 text-[16px] font-medium text-mp-blue active:bg-black/5"
        >
          <ChevronLeft size={24} /> Cancel
        </button>
        <div className="flex-1 text-right leading-tight">
          <div className="text-[18px] font-semibold">Report Deviation</div>
          <div className="text-[13px] text-mp-muted">
            {label}
            {plannedM !== undefined && ` · plan ${plannedM.toFixed(2)} m`}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
        {/* 1 · Issue type (radio group) */}
        <section>
          <StepLabel n={1} done={!!issue}>
            Issue type
          </StepLabel>
          <div role="radiogroup" aria-label="Issue type" className="mt-2.5 grid grid-cols-2 gap-2">
            {ISSUE_TYPES.map((t) => {
              const Icon = ISSUE_ICONS[t.id];
              const active = issue === t.id;
              return (
                <motion.button
                  key={t.id}
                  role="radio"
                  aria-checked={active}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIssue(t.id)}
                  className={`flex h-[58px] items-center gap-2.5 rounded-xl border-2 px-3 text-left transition-colors ${
                    active
                      ? "border-mp-blue bg-mp-blue text-white"
                      : "border-transparent bg-white text-mp-ink active:bg-mp-line"
                  }`}
                >
                  <Icon size={22} strokeWidth={2} />
                  <span className="text-[14px] font-semibold leading-tight">{t.label}</span>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence initial={false}>
            {issue === "dimension-mismatch" && plannedM !== undefined && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2.5 flex items-center gap-2.5 rounded-xl bg-white p-3">
                  <div className="flex-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-mp-muted">
                      Measured on site
                    </div>
                    <div className="text-[24px] font-semibold tabular-nums leading-tight">
                      {measured.toFixed(2)} m
                    </div>
                    <div
                      className={`text-[12px] font-medium tabular-nums ${
                        delta === 0 ? "text-mp-muted" : "text-mp-red"
                      }`}
                    >
                      {delta === 0
                        ? "Same as plan"
                        : `${delta > 0 ? "+" : ""}${(delta * 100).toFixed(0)} cm vs plan`}
                    </div>
                  </div>
                  <Stepper
                    label="Decrease"
                    onClick={() => setMeasured((m) => Math.max(0, +(m - 0.05).toFixed(2)))}
                  >
                    <Minus size={24} />
                  </Stepper>
                  <Stepper label="Increase" onClick={() => setMeasured((m) => +(m + 0.05).toFixed(2))}>
                    <Plus size={24} />
                  </Stepper>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* 2 · Photo (mandatory) */}
        <section>
          <StepLabel n={2} done={!!photo}>
            Photo <span className="text-mp-red">*</span>
          </StepLabel>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setPhoto(URL.createObjectURL(f));
              e.target.value = "";
            }}
          />
          {photo ? (
            <div className="relative mt-2.5 h-[150px] overflow-hidden rounded-xl bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="Site evidence" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-black/70 to-transparent p-2.5">
                <button
                  onClick={() => fileInput.current?.click()}
                  className="flex h-11 items-center gap-2 rounded-lg bg-white/90 px-3 text-[14px] font-semibold"
                >
                  <Camera size={18} /> Retake
                </button>
                <button
                  onClick={() => setPhoto(null)}
                  aria-label="Remove photo"
                  className="grid h-11 w-11 place-items-center rounded-lg bg-white/90"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInput.current?.click()}
                className="mt-2.5 flex h-[92px] w-full items-center justify-center gap-4 rounded-xl border-[3px] border-dashed border-mp-blue/50 bg-white text-mp-blue active:bg-mp-blue/5"
              >
                <span className="grid h-14 w-14 place-items-center rounded-full bg-mp-blue text-white">
                  <Camera size={28} />
                </span>
                <span className="text-left">
                  <span className="block text-[18px] font-semibold">Take Photo</span>
                  <span className="block text-[12px] text-mp-muted">Required for the expert</span>
                </span>
              </motion.button>
              <button
                onClick={() => setPhoto(DEMO_PHOTO)}
                className="mt-1.5 w-full text-center text-[12px] font-medium text-mp-blue"
              >
                No camera? Use demo photo
              </button>
            </>
          )}
        </section>

        {/* 3 · Voice memo */}
        <section>
          <StepLabel n={3} done={!!voice.memo} optional>
            Voice memo
          </StepLabel>
          <div className="mt-2.5 flex items-center gap-3 rounded-xl bg-white p-2.5">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={voice.toggle}
              aria-label={voice.recording ? "Stop recording" : "Record voice memo"}
              className={`relative grid h-14 w-14 shrink-0 place-items-center rounded-full text-white ${
                voice.recording ? "bg-mp-red" : "bg-mp-ink"
              }`}
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
                  <button onClick={voice.discard} aria-label="Delete memo" className="p-1.5 text-mp-muted">
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
        </section>

        <button
          onClick={() => setBlocking((b) => !b)}
          className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-left"
        >
          <span>
            <span className="block text-[15px] font-semibold">Work is blocked here</span>
            <span className="block text-[12px] text-mp-muted">Prioritised before 15:00 CET</span>
          </span>
          <span
            className={`relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors ${
              blocking ? "bg-mp-red" : "bg-mp-line"
            }`}
          >
            <motion.span
              layout
              className="absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow"
              style={{ left: blocking ? 22 : 2 }}
            />
          </span>
        </button>
      </div>

      {/* Sticky submit */}
      <div className="border-t border-mp-line bg-white px-4 pb-4 pt-3">
        <motion.button
          whileTap={canSend ? { scale: 0.97 } : undefined}
          disabled={!canSend}
          onClick={send}
          className={`flex h-14 w-full items-center justify-center gap-2.5 rounded-xl text-[18px] font-semibold transition-colors ${
            canSend
              ? "bg-mp-red text-white shadow-[0_8px_24px_rgba(229,53,43,0.35)]"
              : "bg-mp-line text-mp-muted"
          }`}
        >
          <Send size={20} />
          {canSend ? "Send to Munich" : `Add ${missing.join(" + ") || "…"}`}
        </motion.button>
        <p className="mt-2 text-[11px] leading-snug text-mp-muted">
          Auto-attached: plan snapshot, dimensions, budget ≈ €
          {PROJECT.budgetEur.toLocaleString("de-DE")}, permit {PROJECT.permit.toLowerCase()}.
        </p>
      </div>
    </div>
  );
}

function StepLabel({
  n,
  done,
  optional,
  children,
}: {
  n: number;
  done: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`grid h-6 w-6 place-items-center rounded-full text-[12px] font-bold ${
          done ? "bg-emerald-500 text-white" : "bg-mp-ink text-white"
        }`}
      >
        {done ? <Check size={14} strokeWidth={3} /> : n}
      </span>
      <span className="text-[15px] font-semibold">{children}</span>
      {optional && <span className="text-[12px] text-mp-muted">optional</span>}
    </div>
  );
}

function Stepper({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      aria-label={label}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="grid h-14 w-14 place-items-center rounded-xl bg-mp-panel active:bg-mp-line"
    >
      {children}
    </motion.button>
  );
}

function Waveform({ seconds }: { seconds: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 flex-1 items-center gap-[3px] overflow-hidden">
        {Array.from({ length: 22 }).map((_, i) => (
          <motion.span
            key={i}
            className="w-[4px] shrink-0 rounded-full bg-mp-red"
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
