"use client";

import { useState, useCallback, useRef } from "react";
import { Pencil, X, Save, Copy, Check, AlertCircle, Loader2 } from "lucide-react";

// ─── Dev-only guard ───────────────────────────────────────────────────────────
// process.env.NODE_ENV is replaced at build time by Next.js.
// In production builds this component returns null immediately.
if (process.env.NODE_ENV !== "development") {
  // eslint-disable-next-line import/no-anonymous-default-export
  const Noop = () => null;
  Noop.displayName = "AdminEditMode";
  module.exports = { AdminEditMode: Noop };
}

interface ChangeEntry {
  original: string;
  current: string;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function AdminEditMode() {
  // Extra runtime guard — belt-and-suspenders
  if (process.env.NODE_ENV !== "development") return null;

  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [savedCount, setSavedCount] = useState(0);
  const [failedItems, setFailedItems] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const originals = useRef<Map<Element, string>>(new Map());

  // ── Enter edit mode ──────────────────────────────────────────────────────
  const enableEditing = useCallback(() => {
    setIsEditing(true);
    setSaveStatus("idle");
    setFailedItems([]);
    originals.current.clear();

    document
      .querySelectorAll("#editable-content p, #editable-content h1, #editable-content h2, #editable-content h3")
      .forEach((el) => {
        const html = el as HTMLElement;
        originals.current.set(el, html.innerText);
        html.contentEditable = "true";
        html.style.outline = "1.5px dashed rgba(114,87,255,0.45)";
        html.style.borderRadius = "3px";
        html.style.cursor = "text";
        html.style.transition = "outline-color 0.15s, background-color 0.15s";

        const onFocus = () => {
          html.style.outlineColor = "rgba(114,87,255,1)";
          html.style.backgroundColor = "rgba(114,87,255,0.04)";
        };
        const onBlur = () => {
          html.style.outlineColor = "rgba(114,87,255,0.45)";
          html.style.backgroundColor = "";
        };
        html.addEventListener("focus", onFocus);
        html.addEventListener("blur", onBlur);
      });
  }, []);

  // ── Collect changes ──────────────────────────────────────────────────────
  const collectChanges = useCallback((): ChangeEntry[] => {
    const result: ChangeEntry[] = [];
    originals.current.forEach((original, el) => {
      const current = (el as HTMLElement).innerText;
      if (current !== original) {
        result.push({ original, current });
      }
    });
    return result;
  }, []);

  // ── Exit edit mode (no save) ─────────────────────────────────────────────
  const disableEditing = useCallback(() => {
    setIsEditing(false);
    document
      .querySelectorAll("#editable-content p, #editable-content h1, #editable-content h2, #editable-content h3")
      .forEach((el) => {
        const html = el as HTMLElement;
        html.contentEditable = "false";
        html.style.outline = "";
        html.style.backgroundColor = "";
        html.style.cursor = "";
        html.style.borderRadius = "";
        html.style.transition = "";
      });
  }, []);

  // ── Save to file ─────────────────────────────────────────────────────────
  const saveToFile = useCallback(async () => {
    const changes = collectChanges();
    if (!changes.length) {
      disableEditing();
      return;
    }

    setSaveStatus("saving");

    try {
      const res = await fetch("/api/save-edits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changes }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Unknown error");

      setSavedCount(data.saved);
      setFailedItems(data.failedItems ?? []);
      setSaveStatus(data.saved > 0 ? "saved" : "error");
    } catch (err) {
      console.error("[AdminEditMode] save failed:", err);
      setSaveStatus("error");
    } finally {
      disableEditing();
    }
  }, [collectChanges, disableEditing]);

  // ── Copy JSON ────────────────────────────────────────────────────────────
  const copyJson = useCallback(() => {
    const changes = collectChanges();
    if (!changes.length) return;
    const out = changes.reduce<Record<string, { was: string; now: string }>>(
      (acc, c, i) => {
        acc[`edit_${i + 1}`] = { was: c.original, now: c.current };
        return acc;
      },
      {}
    );
    navigator.clipboard.writeText(JSON.stringify(out, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [collectChanges]);

  // ── Status label ─────────────────────────────────────────────────────────
  const statusLabel =
    saveStatus === "saved"
      ? `✓ Saved ${savedCount} edit${savedCount !== 1 ? "s" : ""} to file`
      : saveStatus === "error"
      ? `⚠ ${failedItems.length} text${failedItems.length !== 1 ? "s" : ""} couldn't be matched`
      : null;

  return (
    <>
      {/* Watermark so you always know you're in dev mode */}
      <div className="fixed bottom-6 left-6 z-50 text-[11px] font-mono text-black/20 pointer-events-none select-none">
        DEV · edit mode available
      </div>

      {/* Status toast */}
      {statusLabel && (
        <div
          className={`fixed bottom-24 right-6 z-50 flex items-start gap-2 max-w-xs rounded-2xl px-4 py-3 shadow-lg text-sm font-semibold font-sans ${
            saveStatus === "saved"
              ? "bg-[#0c6747] text-white"
              : "bg-amber-50 text-amber-900 border border-amber-200"
          }`}
        >
          {saveStatus === "error" && <AlertCircle size={15} className="mt-0.5 shrink-0" />}
          <div className="flex flex-col gap-1">
            <span>{statusLabel}</span>
            {failedItems.length > 0 && (
              <ul className="text-[11px] font-normal opacity-80 list-disc pl-4">
                {failedItems.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Floating controls */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {isEditing && (
          <>
            {/* Copy JSON (fallback) */}
            <button
              onClick={copyJson}
              title="Copy changes as JSON (fallback)"
              className="flex items-center gap-2 bg-white text-black/85 text-[12px] font-semibold px-3.5 py-2 rounded-full shadow border border-black/10 hover:bg-zinc-50 transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied!" : "Copy JSON"}
            </button>

            {/* Save to file — primary action */}
            <button
              onClick={saveToFile}
              disabled={saveStatus === "saving"}
              className="flex items-center gap-2 bg-[#7257ff] text-white text-[13px] font-semibold px-4 py-2.5 rounded-full shadow-lg hover:bg-[#5e43e0] disabled:opacity-60 transition-colors"
            >
              {saveStatus === "saving" ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Save size={13} />
              )}
              {saveStatus === "saving" ? "Saving…" : "Save to file"}
            </button>
          </>
        )}

        {/* Edit / Done toggle */}
        <button
          onClick={isEditing ? saveToFile : enableEditing}
          disabled={saveStatus === "saving"}
          className={`flex items-center gap-2 text-[13px] font-semibold px-4 py-2.5 rounded-full shadow-lg transition-all disabled:opacity-60 ${
            isEditing
              ? "bg-black text-white hover:bg-zinc-800"
              : "bg-white text-black/85 border border-black/10 hover:bg-zinc-50"
          }`}
        >
          {isEditing ? (
            saveStatus === "saving" ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />
          ) : (
            <Pencil size={13} />
          )}
          {isEditing
            ? saveStatus === "saving"
              ? "Saving…"
              : "Done & Save"
            : "Edit text"}
        </button>
      </div>
    </>
  );
}
