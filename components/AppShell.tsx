"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { FloorPlanCanvas } from "./FloorPlanCanvas";
import { EscalationBadges, ReportDeviationButton } from "./CanvasOverlay";
import { EscalationSheet } from "./EscalationSheet";
import { EscalationsPanel } from "./EscalationsPanel";
import { FloorPicker, StatusBar, ToolPalette, TopBar, UndoRedo } from "./Chrome";
import { CANVAS_H, CANVAS_W } from "@/lib/layout";
import { useEscalationStore } from "@/lib/useEscalationStore";

export function AppShell() {
  const { state, select, openCapture, closeCapture, submit, dismissToast, escalationFor } =
    useEscalationStore();
  const selectedEscalation = state.selected ? escalationFor(state.selected) : undefined;

  return (
    <div className="flex h-full flex-col">
      <StatusBar />
      <TopBar />

      <div className="flex min-h-0 flex-1">
        {/* Canvas area */}
        <div className="relative overflow-hidden" style={{ width: CANVAS_W, height: CANVAS_H }}>
          <FloorPlanCanvas
            width={CANVAS_W}
            height={CANVAS_H}
            selected={state.selected}
            escalationFor={escalationFor}
            onSelect={select}
          />
          <EscalationBadges escalations={state.escalations} onPress={select} />
          <ReportDeviationButton
            target={state.selected}
            escalated={!!selectedEscalation}
            onPress={openCapture}
          />
          <ToolPalette visible={!!state.selected} />
          <UndoRedo />
          <FloorPicker />

          <AnimatePresence>
            {!state.selected && state.escalations.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute bottom-[84px] left-1/2 -translate-x-1/2 rounded-full bg-black/75 px-4 py-2 text-[14px] font-medium text-white"
              >
                Something doesn&apos;t match? Tap the wall or corner.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <EscalationsPanel
          selected={state.selected}
          selectedEscalation={selectedEscalation}
          escalations={state.escalations}
          onReport={openCapture}
          onFocus={select}
          onClear={() => select(null)}
        />
      </div>

      <EscalationSheet
        open={state.capturing}
        target={state.selected}
        onCancel={closeCapture}
        onSubmit={submit}
      />

      {/* Fire-and-forget confirmation */}
      <AnimatePresence>
        {state.toast && (
          <motion.button
            key={state.toast.id}
            onClick={dismissToast}
            initial={{ y: 80, opacity: 0, x: "-50%" }}
            animate={{ y: 0, opacity: 1, x: "-50%" }}
            exit={{ y: 80, opacity: 0, x: "-50%" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute bottom-6 left-1/2 z-[60] flex items-center gap-3 rounded-2xl bg-mp-ink px-5 py-4 text-[16px] font-medium text-white shadow-2xl"
          >
            <CheckCircle2 size={22} className="text-emerald-400" />
            {state.toast.text}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
