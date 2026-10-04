"use client";

import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronsUpDown,
  Columns2,
  HelpCircle,
  Info,
  Layers,
  LayoutPanelLeft,
  Plus,
  Redo2,
  Share,
  SquarePlus,
  Spline,
  Trash2,
  Undo2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { PROJECT } from "@/lib/floorplan";
import { STATUS_H, TOPBAR_H } from "@/lib/layout";
import { useMunichCutoff } from "@/lib/useMunichCutoff";

/** Fake iPadOS status bar — sells the "native app" feel in the browser. */
export function StatusBar() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = () =>
      setTime(
        new Date().toLocaleString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
      );
    fmt();
    const t = setInterval(fmt, 30_000);
    return () => clearInterval(t);
  }, []);
  return (
    <div
      style={{ height: STATUS_H }}
      className="flex items-center justify-between px-6 text-[13px] font-semibold"
    >
      <span suppressHydrationWarning>{time}</span>
      <span className="flex items-center gap-2">
        <span className="text-[12px]">4G</span>
        <span>62%</span>
        <span className="relative h-[11px] w-[22px] rounded-[3px] border border-black/60 p-[1px]">
          <span className="block h-full w-[62%] rounded-[1px] bg-black" />
        </span>
      </span>
    </div>
  );
}

export function TopBar() {
  const munich = useMunichCutoff(PROJECT.expert.cutoffHourCET);
  return (
    <header
      style={{ height: TOPBAR_H }}
      className="flex items-center gap-4 border-b border-mp-line bg-mp-canvas px-5"
    >
      <button className="flex h-12 items-center gap-1 rounded-xl bg-white px-2 text-mp-blue shadow-sm">
        <ChevronLeft size={26} />
        <LayoutPanelLeft size={24} />
      </button>
      <div className="leading-tight">
        <div className="text-[20px] font-semibold">{PROJECT.room}</div>
        <div className="text-[14px] text-mp-muted">{PROJECT.floor}</div>
      </div>

      <div className="flex-1" />

      {/* Expert availability: the one constraint that changes urgency */}
      {munich && (
        <div
          className={`flex h-11 items-center gap-2.5 rounded-full px-4 text-[14px] font-medium ${
            !munich.online
              ? "bg-mp-line text-mp-muted"
              : munich.urgent
                ? "bg-amber-100 text-amber-800"
                : "bg-emerald-50 text-emerald-800"
          }`}
        >
          <span className="relative flex h-2.5 w-2.5">
            {munich.online && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-50" />
            )}
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-current" />
          </span>
          Munich expert · {munich.online ? "online" : "offline"}
          <span className="opacity-60">·</span>
          <span className="tabular-nums">{munich.remainingLabel}</span>
        </div>
      )}

      <div className="flex items-center gap-1 text-mp-blue">
        <IconBtn label="Help">
          <HelpCircle size={26} />
        </IconBtn>
        <IconBtn label="Share">
          <Share size={26} />
        </IconBtn>
        <IconBtn label="Info">
          <Info size={26} />
        </IconBtn>
      </div>
    </header>
  );
}

function IconBtn({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button aria-label={label} className="grid h-12 w-12 place-items-center rounded-full active:bg-black/5">
      {children}
    </button>
  );
}

/** Left floating palette — magicplan's edit tools, kept for visual fidelity. */
export function ToolPalette({ visible }: { visible: boolean }) {
  const tools = [
    { icon: Plus, label: "Insert" },
    { icon: Spline, label: "Add Corner" },
    { icon: SquarePlus, label: "Add Wall" },
    { icon: Columns2, label: "Split Room" },
  ];
  return (
    <motion.div
      initial={false}
      animate={{ x: visible ? 0 : -24, opacity: visible ? 1 : 0 }}
      style={{ pointerEvents: visible ? "auto" : "none" }}
      className="absolute left-4 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2.5"
    >
      {tools.map(({ icon: Icon, label }) => (
        <PaletteBtn key={label}>
          <Icon size={20} /> {label}
        </PaletteBtn>
      ))}
      <PaletteBtn danger>
        <Trash2 size={20} /> Delete…
      </PaletteBtn>
    </motion.div>
  );
}

function PaletteBtn({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      className={`flex h-12 w-fit items-center gap-2.5 rounded-xl border border-mp-line bg-white px-4 text-[16px] font-semibold shadow-sm active:bg-mp-panel ${
        danger ? "text-mp-red" : "text-mp-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function UndoRedo() {
  return (
    <div className="absolute right-4 top-4 z-10 flex overflow-hidden rounded-xl border border-mp-line bg-white shadow-sm">
      <button aria-label="Undo" className="grid h-12 w-14 place-items-center text-mp-muted">
        <Undo2 size={22} />
      </button>
      <span className="my-2 w-px bg-mp-line" />
      <button aria-label="Redo" className="grid h-12 w-14 place-items-center text-mp-muted">
        <Redo2 size={22} />
      </button>
    </div>
  );
}

export function FloorPicker() {
  return (
    <div className="absolute bottom-4 left-4 z-10 flex gap-3">
      <button className="flex h-12 items-center gap-2.5 rounded-xl border border-mp-line bg-white px-4 text-[16px] font-semibold shadow-sm">
        <Layers size={20} /> {PROJECT.floor} <ChevronsUpDown size={16} className="text-mp-muted" />
      </button>
      <button className="flex h-12 items-center gap-2.5 rounded-xl border border-mp-line bg-white px-4 text-[16px] font-semibold shadow-sm">
        2D View <ChevronsUpDown size={16} className="text-mp-muted" />
      </button>
    </div>
  );
}
