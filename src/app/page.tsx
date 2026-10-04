"use client";

import { AnimatePresence } from "framer-motion";
import { ReportDeviationAction } from "@/components/molecules/ReportDeviationAction";
import { CanvasArea } from "@/components/organisms/CanvasArea";
import { DeviceStatusBar } from "@/components/organisms/DeviceStatusBar";
import { DevToolsPanel, useDevToolsToggle } from "@/components/organisms/DevToolsPanel";
import { IPadFrame } from "@/components/organisms/IPadFrame";
import {
  LOCKED_MESSAGE,
  LOCKED_MESSAGE_NO_SELECTION,
  LeftToolbar,
} from "@/components/organisms/LeftToolbar";
import { RightSidebar } from "@/components/organisms/RightSidebar";
import { StatusToast } from "@/components/organisms/StatusToast";
import { TopBar } from "@/components/organisms/TopBar";
import { PROJECT, elementInfo } from "@/lib/floorplan";
import { PANEL_W } from "@/lib/layout";
import { useDeviationState } from "@/store/useDeviationState";

/**
 * Main iPad layout shell (landscape). Owns the store and composes organisms:
 *
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │ DeviceStatusBar                                              │
 *   │ TopBar: breadcrumbs · 🔒 Locked (Permit Approved) · expert   │
 *   ├───────────────────────────────────────────┬──────────────────┤
 *   │ LeftToolbar ┐                             │                  │
 *   │ (overlay)   │      CanvasArea             │   RightSidebar   │
 *   │             ┘      (dot grid + plan)      │   (350px)        │
 *   │              StatusToast                  │                  │
 *   └───────────────────────────────────────────┴──────────────────┘
 *
 * The toolbar and toast share the canvas grid cell (stacked with
 * grid-area), so they float over the plan like magicplan's palette instead of
 * shrinking it.
 */
export default function Page() {
  const store = useDeviationState();
  const dev = useDevToolsToggle();
  const { selectedElement, captureAnchor, selectedEscalation } = store;

  const selectedPending = selectedElement ? store.pendingRevokeFor(selectedElement) : undefined;

  // Report Deviation must be anchored to geometry: only offered for a selected
  // element, never while its form is open or a revoke is still in flight.
  const actionElement = captureAnchor || selectedPending ? null : selectedElement;
  const actionKey = actionElement ? `${actionElement.type}:${actionElement.id}` : "none";

  const breadcrumbs = [
    PROJECT.floor,
    PROJECT.room,
    ...(selectedElement ? [elementInfo(selectedElement).label] : []),
  ];

  // Dev tools act on the selected element's report, else the newest one.
  const devTarget =
    selectedPending ??
    (selectedEscalation ? { escalation: selectedEscalation, settlesAt: undefined } : undefined) ??
    [
      ...Object.values(store.pendingRevokes),
      ...store.escalations.map((e) => ({ escalation: e, settlesAt: undefined })),
    ].sort((a, b) => b.escalation.createdAt - a.escalation.createdAt)[0];

  return (
    <IPadFrame>
      <div className="grid h-full grid-rows-[auto_auto_minmax(0,1fr)]">
        <DeviceStatusBar onSecretTap={dev.toggle} />
        <TopBar breadcrumbs={breadcrumbs} />

        <div
          className="grid min-h-0"
          style={{ gridTemplateColumns: `minmax(0,1fr) ${PANEL_W}px` }}
        >
          {/* Canvas column: plan, toolbar, toast and dev tools stacked in one cell */}
          <div className="relative grid min-h-0 [grid-template-areas:'stack']">
            <CanvasArea
              className="[grid-area:stack]"
              selectedElement={selectedElement}
              escalations={store.escalations}
              statusFor={(el) => store.escalationFor(el)?.status}
              actionElement={actionElement}
              actionState={store.escalationStatus}
              onSelect={(el) => (el ? store.selectElement(el.id) : store.clearSelection())}
              onReport={store.startReport}
            />

            <LeftToolbar
              className="z-10 ml-4 self-center justify-self-start [grid-area:stack]"
              onLockedTool={() =>
                store.notify(selectedElement ? LOCKED_MESSAGE : LOCKED_MESSAGE_NO_SELECTION, "locked")
              }
              reportSlot={
                <AnimatePresence>
                  {actionElement && (
                    <ReportDeviationAction
                      key={actionKey}
                      placement="toolbar"
                      selectedElement={actionElement}
                      deviationState={store.escalationStatus}
                      onReport={store.startReport}
                    />
                  )}
                </AnimatePresence>
              }
            />

            <StatusToast
              toast={store.toast}
              showHint={!selectedElement && !dev.open}
              raised={dev.open}
              onDismiss={store.dismissToast}
            />

            <DevToolsPanel
              open={dev.open}
              onClose={() => dev.setOpen(false)}
              target={devTarget?.escalation}
              revokeSettlesAt={devTarget?.settlesAt}
              demo={store.demo}
              setDemo={store.setDemo}
              setStatus={store.devSetStatus}
              onMockReview={store.mockExpertReview}
              reset={store.reset}
            />
          </div>

          {/* Swaps: empty state / Active Escalations ↔ inspector ↔ DeviationForm */}
          <RightSidebar
            selected={selectedElement}
            selectedEscalation={selectedEscalation}
            pendingRevoke={selectedPending?.escalation}
            captureAnchor={captureAnchor}
            escalations={store.escalations}
            onReport={store.startReport}
            onCancelReport={store.cancelReport}
            onSubmit={store.submitEscalation}
            onFocus={(el) => store.selectElement(el.id)}
            onClear={store.clearSelection}
            onRevoke={(id) => store.revokeEscalation(id)}
          />
        </div>
      </div>
    </IPadFrame>
  );
}
