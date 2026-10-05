import { type RefObject, useEffect } from "react";

/** The three native sidebar tabs (room panel and element inspector). */
export type PanelTab = "Details" | "Photos & Notes" | "Forms";

/**
 * A one-shot "open this tab" request from outside the panel, e.g. Insert →
 * Note / Photo / Form. `focusNote` also puts the cursor in the note field.
 */
export type TabRequest = { tab: PanelTab; focusNote?: boolean };

/**
 * Applies a TabRequest to whichever panel is showing, then reports it handled
 * so the request isn't replayed when another panel mounts later.
 */
export function useTabRequest(
  request: TabRequest | null | undefined,
  setTab: (t: PanelTab) => void,
  onApplied: (() => void) | undefined,
  root: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!request) return;
    setTab(request.tab);
    onApplied?.();
    // After the tab (and the panel swap animation) has rendered.
    if (request.focusNote) window.setTimeout(() => root.current?.querySelector("textarea")?.focus(), 250);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);
}
