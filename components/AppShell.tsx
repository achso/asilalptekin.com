"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Lock, MousePointerClick } from "lucide-react";
import { FloorPlanCanvas } from "./FloorPlanCanvas";
import { EscalationBadges, ReportDeviationButton } from "./CanvasOverlay";
import { EscalationsPanel } from "./EscalationsPanel";
import { FloorPicker, LOCKED_MESSAGE, StatusBar, ToolPalette, TopBar, UndoRedo } from "./Chrome";
import { DevToolsPanel, useDevToolsToggle } from "./DevTools";
import { PROJECT, cornerById, wallById } from "@/lib/floorplan";
import { CANVAS_H, CANVAS_W } from "@/lib/layout";
import { sameTarget, useEscalationStore, type ToastTone } from "@/lib/useEscalationStore";

export function AppShell() {
  const store = useEscalationStore();
  const { state, select, openCapture, closeCapture, submit, revoke, notify, dismissToast } = store;
  const { selected, capturing } = state;
  const dev = useDevToolsToggle();

  const selectedEscalation = selected ? store.escalationFor(selected) : undefined;
  // Locks the wall: anything not yet resolved by Munich.
  const selectedActive = selected ? store.activeEscalationFor(selected) : undefined;
  const pendingRevokes = Object.values(state.pendingRevokes);
  const selectedPending = selected
    ? pendingRevokes.find((p) => sameTarget(p.escalation.target, selected))
    : undefined;

  // Dev tools act on the selected wall's report, else the newest (including in-flight revokes).
  const devTarget =
    selectedPending ??
    (selectedEscalation ? { escalation: selectedEscalation, settlesAt: undefined } : undefined) ??
    [
      ...pendingRevokes,
      ...state.escalations.map((e) => ({ escalation: e, settlesAt: undefined })),
    ].sort((a, b) => b.escalation.createdAt - a.escalation.createdAt)[0];

  const title = selected
    ? selected.kind === "wall"
      ? wallById(selected.id).label
      : cornerById(selected.id).label
    : PROJECT.room;

  // The toolbar's Report Deviation is always visible; it needs a target first.
  const reportFromToolbar = () => {
    if (capturing) return;
    if (!selected) return notify("Tap the wall or corner that doesn't match first.", "hint");
    if (selectedActive) return notify(`${title} is already escalated to Munich.`, "hint");
    if (selectedPending) return notify("Wait for the revoke to finish.", "hint");
    openCapture();
  };

  return (
    <div className="flex h-full flex-col">
      <StatusBar onSecretTap={dev.toggle} />
      <TopBar title={title} />

      <div className="flex min-h-0 flex-1">
        {/* Canvas area */}
        <div className="relative overflow-hidden" style={{ width: CANVAS_W, height: CANVAS_H }}>
          <FloorPlanCanvas
            width={CANVAS_W}
            height={CANVAS_H}
            selected={selected}
            statusFor={(t) => store.escalationFor(t)?.status}
            onSelect={select}
          />
          <EscalationBadges escalations={state.escalations} onPress={select} />
          <ReportDeviationButton
            target={capturing || selectedPending ? null : selected}
            escalated={!!selectedActive}
            onPress={openCapture}
          />
          <ToolPalette
            hasSelection={!!selected && !selectedActive && !selectedPending}
            capturing={capturing}
            onReport={reportFromToolbar}
            onLockedTool={() => notify(LOCKED_MESSAGE, "locked")}
          />
          <UndoRedo />
          <FloorPicker />

          <AnimatePresence>
            {!selected && state.escalations.length === 0 && !state.toast && !dev.open && (
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

          <DevToolsPanel
            open={dev.open}
            onClose={() => dev.setOpen(false)}
            target={devTarget?.escalation}
            revokeSettlesAt={devTarget?.settlesAt}
            demo={state.demo}
            setDemo={store.setDemo}
            setStatus={store.devSetStatus}
            reset={store.reset}
          />
        </div>

        <EscalationsPanel
          selected={selected}
          selectedEscalation={selectedEscalation}
          pendingRevoke={selectedPending?.escalation}
          capturing={capturing}
          escalations={state.escalations}
          onReport={openCapture}
          onCancelReport={closeCapture}
          onSubmit={submit}
          onFocus={select}
          onClear={() => select(null)}
          onRevoke={revoke}
        />
      </div>

      <AnimatePresence>
        {state.toast && (
          <Toast
            key={state.toast.id}
            text={state.toast.text}
            tone={state.toast.tone}
            raised={dev.open}
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
  warning: <AlertTriangle size={20} className="shrink-0 text-amber-400" />,
};

/** Lightweight toast, centred over the canvas. */
function Toast({
  text,
  tone,
  raised,
  onDismiss,
}: {
  text: string;
  tone: ToastTone;
  raised: boolean;
  onDismiss: () => void;
}) {
  return (
    <motion.button
      onClick={onDismiss}
      initial={{ y: 80, opacity: 0, x: "-50%" }}
      animate={{ y: 0, opacity: 1, x: "-50%" }}
      exit={{ y: 80, opacity: 0, x: "-50%" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      style={{ left: CANVAS_W / 2, bottom: raised ? 150 : 84 }}
      className="absolute z-[60] flex max-w-[680px] items-center gap-3 rounded-2xl bg-mp-ink px-5 py-4 text-left text-[15px] font-medium text-white shadow-2xl"
    >
      {TOAST_ICON[tone]}
      {text}
    </motion.button>
  );
}
