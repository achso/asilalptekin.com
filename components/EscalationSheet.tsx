"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BrickWall,
  Camera,
  Check,
  CircleHelp,
  Construction,
  DoorOpen,
  Mic,
  Minus,
  MoveHorizontal,
  Paperclip,
  Plus,
  Ruler,
  Send,
  Square,
  Trash2,
  X,
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

type Props = {
  open: boolean;
  target: Target | null;
  onCancel: () => void;
  onSubmit: (e: Escalation) => void;
};

export function EscalationSheet({ open, target, onCancel, onSubmit }: Props) {
  return (
    <AnimatePresence>
      {open && target && (
        <motion.div
          key="scrim"
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <SheetBody target={target} onCancel={onCancel} onSubmit={onSubmit} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SheetBody({
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
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Report deviation on ${label}`}
      initial={{ y: 40, opacity: 0, scale: 0.98 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 40, opacity: 0, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 380, damping: 34 }}
      className="flex h-[770px] w-[1040px] flex-col overflow-hidden rounded-[28px] bg-mp-panel shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-mp-line bg-white px-7 py-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-mp-red/10 text-mp-red">
          <Paperclip size={24} />
        </div>
        <div className="flex-1">
          <div className="text-[22px] font-semibold leading-tight">Report Deviation</div>
          <div className="text-[15px] text-mp-muted">
            {label}
            {plannedM !== undefined && ` · plan ${plannedM.toFixed(2)} m`} · {PROJECT.room},{" "}
            {PROJECT.floor}
          </div>
        </div>
        <button
          onClick={onCancel}
          aria-label="Cancel"
          className="grid h-12 w-12 place-items-center rounded-full bg-mp-panel text-mp-ink active:bg-mp-line"
        >
          <X size={24} />
        </button>
      </div>

      {/* Body: two columns, no keyboard needed anywhere */}
      <div className="grid flex-1 grid-cols-[1.1fr_1fr] gap-6 overflow-y-auto px-7 py-5">
        {/* Left: what's wrong */}
        <section className="flex flex-col gap-4">
          <StepLabel n={1} done={!!issue}>
            What&apos;s wrong?
          </StepLabel>
          <div className="grid grid-cols-2 gap-3">
            {ISSUE_TYPES.map((t) => {
              const Icon = ISSUE_ICONS[t.id];
              const active = issue === t.id;
              return (
                <motion.button
                  key={t.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIssue(t.id)}
                  className={`flex h-[68px] items-center gap-3 rounded-2xl border-2 px-4 text-left transition-colors ${
                    active
                      ? "border-mp-blue bg-mp-blue text-white"
                      : "border-transparent bg-white text-mp-ink active:bg-mp-line"
                  }`}
                >
                  <Icon size={26} strokeWidth={2} />
                  <span className="flex flex-col">
                    <span className="whitespace-nowrap text-[16px] font-semibold leading-tight">{t.label}</span>
                    <span className={`text-[12px] leading-tight ${active ? "text-white/80" : "text-mp-muted"}`}>
                      {t.hint}
                    </span>
                  </span>
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
                <div className="flex items-center gap-4 rounded-2xl bg-white p-4">
                  <div className="flex-1">
                    <div className="text-[13px] font-medium uppercase tracking-wide text-mp-muted">
                      Measured on site
                    </div>
                    <div className="text-[30px] font-semibold tabular-nums">
                      {measured.toFixed(2)} m
                    </div>
                    <div
                      className={`text-[14px] font-medium tabular-nums ${
                        delta === 0 ? "text-mp-muted" : "text-mp-red"
                      }`}
                    >
                      {delta === 0
                        ? `Same as plan (${plannedM.toFixed(2)} m)`
                        : `${delta > 0 ? "+" : ""}${(delta * 100).toFixed(0)} cm vs plan`}
                    </div>
                  </div>
                  <Stepper onClick={() => setMeasured((m) => Math.max(0, +(m - 0.05).toFixed(2)))}>
                    <Minus size={28} />
                  </Stepper>
                  <Stepper onClick={() => setMeasured((m) => +(m + 0.05).toFixed(2))}>
                    <Plus size={28} />
                  </Stepper>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setBlocking((b) => !b)}
            className="mt-auto flex items-center justify-between rounded-2xl bg-white px-5 py-4 text-left"
          >
            <span>
              <span className="block text-[17px] font-semibold">Work is blocked here</span>
              <span className="block text-[13px] text-mp-muted">
                Expert prioritises blocking issues before 15:00 CET
              </span>
            </span>
            <span
              className={`relative h-[34px] w-[58px] rounded-full transition-colors ${
                blocking ? "bg-mp-red" : "bg-mp-line"
              }`}
            >
              <motion.span
                layout
                className="absolute top-[3px] h-7 w-7 rounded-full bg-white shadow"
                style={{ left: blocking ? 27 : 3 }}
              />
            </span>
          </button>
        </section>

        {/* Right: evidence */}
        <section className="flex flex-col gap-4">
          <StepLabel n={2} done={!!photo}>
            Photo evidence <span className="text-mp-red">*</span>
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
            <div className="relative h-[230px] overflow-hidden rounded-2xl bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="Site evidence" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-black/70 to-transparent p-3">
                <button
                  onClick={() => fileInput.current?.click()}
                  className="flex h-12 items-center gap-2 rounded-xl bg-white/90 px-4 text-[15px] font-semibold"
                >
                  <Camera size={20} /> Retake
                </button>
                <button
                  onClick={() => setPhoto(null)}
                  aria-label="Remove photo"
                  className="grid h-12 w-12 place-items-center rounded-xl bg-white/90"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInput.current?.click()}
                className="flex h-[196px] flex-col items-center justify-center gap-3 rounded-2xl border-[3px] border-dashed border-mp-blue/50 bg-white text-mp-blue active:bg-mp-blue/5"
              >
                <span className="grid h-16 w-16 place-items-center rounded-full bg-mp-blue text-white">
                  <Camera size={32} />
                </span>
                <span className="text-[19px] font-semibold">Take Photo</span>
                <span className="text-[13px] text-mp-muted">Required · shows the expert what you see</span>
              </motion.button>
              <button
                onClick={() => setPhoto(DEMO_PHOTO)}
                className="self-center text-[13px] font-medium text-mp-blue underline-offset-2 active:underline"
              >
                No camera? Use demo photo
              </button>
            </div>
          )}

          <StepLabel n={3} done={!!voice.memo} optional>
            Voice memo
          </StepLabel>
          <div className="flex items-center gap-4 rounded-2xl bg-white p-3">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={voice.toggle}
              aria-label={voice.recording ? "Stop recording" : "Record voice memo"}
              className={`relative grid h-16 w-16 shrink-0 place-items-center rounded-full text-white ${
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
              {voice.recording ? <Square size={24} fill="white" /> : <Mic size={28} />}
            </motion.button>
            <div className="flex-1">
              {voice.recording ? (
                <Waveform seconds={voice.seconds} />
              ) : voice.memo ? (
                <div className="flex items-center gap-3">
                  {voice.memo.url ? (
                    <audio src={voice.memo.url} controls className="h-10 w-full" />
                  ) : (
                    <span className="text-[15px] font-medium">
                      Memo recorded · {voice.memo.durationS}s
                    </span>
                  )}
                  <button onClick={voice.discard} aria-label="Delete memo" className="p-2 text-mp-muted">
                    <Trash2 size={20} />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-[16px] font-semibold">Tap to talk</div>
                  <div className="text-[13px] text-mp-muted">
                    Say what you expected vs. what you found. No typing.
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-5 border-t border-mp-line bg-white px-7 py-4">
        <div className="flex-1 text-[13px] leading-snug text-mp-muted">
          <span className="font-semibold text-mp-ink">Auto-attached:</span> plan snapshot with{" "}
          {label.toLowerCase()} highlighted, captured dimensions, job context (budget ≈ €
          {PROJECT.budgetEur.toLocaleString("de-DE")}, permit {PROJECT.permit.toLowerCase()}, previous
          visit {PROJECT.previousVisit}).
        </div>
        <motion.button
          whileTap={canSend ? { scale: 0.97 } : undefined}
          disabled={!canSend}
          onClick={send}
          className={`flex h-16 min-w-[280px] items-center justify-center gap-3 rounded-2xl px-6 text-[19px] font-semibold transition-colors ${
            canSend ? "bg-mp-red text-white shadow-[0_8px_24px_rgba(229,53,43,0.35)]" : "bg-mp-line text-mp-muted"
          }`}
        >
          <Send size={22} />
          {canSend ? "Send to Munich" : `Add ${missing.join(" + ") || "…"}`}
        </motion.button>
      </div>
    </motion.div>
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
    <div className="flex items-center gap-3">
      <span
        className={`grid h-7 w-7 place-items-center rounded-full text-[14px] font-bold ${
          done ? "bg-emerald-500 text-white" : "bg-mp-ink text-white"
        }`}
      >
        {done ? <Check size={16} strokeWidth={3} /> : n}
      </span>
      <span className="text-[17px] font-semibold">{children}</span>
      {optional && <span className="text-[13px] text-mp-muted">optional</span>}
    </div>
  );
}

function Stepper({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="grid h-16 w-16 place-items-center rounded-2xl bg-mp-panel active:bg-mp-line"
    >
      {children}
    </motion.button>
  );
}

function Waveform({ seconds }: { seconds: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 flex-1 items-center gap-[3px]">
        {Array.from({ length: 32 }).map((_, i) => (
          <motion.span
            key={i}
            className="w-[4px] rounded-full bg-mp-red"
            animate={{ height: [6, 8 + ((i * 37) % 28), 6] }}
            transition={{ repeat: Infinity, duration: 0.6 + (i % 5) * 0.12, ease: "easeInOut" }}
          />
        ))}
      </div>
      <span className="w-12 text-right text-[15px] font-semibold tabular-nums text-mp-red">
        {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
      </span>
    </div>
  );
}
