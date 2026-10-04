"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Lock, MousePointerClick } from "lucide-react";
import { FloorPlanCanvas } from "./FloorPlanCanvas";
import { EscalationBadges, ReportDeviationButton } from "./CanvasOverlay";
import { EscalationsPanel } from "./EscalationsPanel";
import { FloorPicker, LOCKED_MESSAGE, StatusBar, ToolPalette, TopBar, UndoRedo } from "./Chrome";
import { PROJECT, cornerById, wallById } from "@/lib/floorplan";
import { CANVAS_H, CANVAS_W } from "@/lib/layout";
import { useEscalationStore, type ToastTone } from "@/lib/useEscalationStore";

export function AppShell() {
  const { state, select, openCapture, closeCapture, submit, notify, dismissToast, escalationFor } =
    useEscalationStore();
  const { selected, capturing } = state;
  const selectedEscalation = selected ? escalationFor(selected) : undefined;

  const title = selected
    ? selected.kind === "wall"
      ? wallById(selected.id).label
      : cornerById(selected.id).label
    : PROJECT.room;

  // The toolbar's Report Deviation is always visible; it needs a target first.
  const reportFromToolbar = () => {
    if (capturing) return;
    if (!selected) return notify("Tap the wall or corner that doesn't match first.", "hint");
    if (selectedEscalation) return notify(`${title} is already escalated to Munich.`, "hint");
    openCapture();
  };

  return (
    <div className="flex h-full flex-col">
      <StatusBar />
      <TopBar title={title} />

      <div className="flex min-h-0 flex-1">
        {/* Canvas area */}
        <div className="relative overflow-hidden" style={{ width: CANVAS_W, height: CANVAS_H }}>
          <FloorPlanCanvas
            width={CANVAS_W}
            height={CANVAS_H}
            selected={selected}
            escalationFor={escalationFor}
            onSelect={select}
          />
          <EscalationBadges escalations={state.escalations} onPress={select} />
          <ReportDeviationButton
            target={capturing ? null : selected}
            escalated={!!selectedEscalation}
            onPress={openCapture}
          />
          <ToolPalette
            hasSelection={!!selected && !selectedEscalation}
            capturing={capturing}
            onReport={reportFromToolbar}
            onLockedTool={() => notify(LOCKED_MESSAGE, "locked")}
          />
          <UndoRedo />
          <FloorPicker />

          <AnimatePresence>
            {!selected && state.escalations.length === 0 && !state.toast && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute bottom-[84px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/75 px-4 py-2 text-[14px] font-medium text-white"
              >
                Something doesn&apos;t match? Tap the wall or corner.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <EscalationsPanel
          selected={selected}
          selectedEscalation={selectedEscalation}
          capturing={capturing}
          escalations={state.escalations}
          onReport={openCapture}
          onCancelReport={closeCapture}
          onSubmit={submit}
          onFocus={select}
          onClear={() => select(null)}
        />
      </div>

      <AnimatePresence>
        {state.toast && (
          <Toast
            key={state.toast.id}
            text={state.toast.text}
            tone={state.toast.tone}
            onDismiss={dismissToast}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const TOAST_ICON: Record<ToastTone, React.ReactNode> = {
  success: <CheckCircle2 size={22} className="shrink-0 text-emerald-400" />,
  locked: <Lock size={20} className="shrink-0 text-amber-300" />,
  hint: <MousePointerClick size={20} className="shrink-0 text-sky-300" />,
};

/** Lightweight toast, centred over the canvas. */
function Toast({ text, tone, onDismiss }: { text: string; tone: ToastTone; onDismiss: () => void }) {
  return (
    <motion.button
      onClick={onDismiss}
      initial={{ y: 80, opacity: 0, x: "-50%" }}
      animate={{ y: 0, opacity: 1, x: "-50%" }}
      exit={{ y: 80, opacity: 0, x: "-50%" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      style={{ left: CANVAS_W / 2 }}
      className="absolute bottom-[84px] z-[60] flex max-w-[640px] items-center gap-3 rounded-2xl bg-mp-ink px-5 py-4 text-left text-[15px] font-medium text-white shadow-2xl"
    >
      {TOAST_ICON[tone]}
      {text}
    </motion.button>
  );
}
