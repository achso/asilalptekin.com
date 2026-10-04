"use client";

import { useState } from "react";
import { EscalationCard } from "@/components/molecules/EscalationCard";
import { DEMO_PHOTO } from "@/lib/demoPhoto";
import { PANEL_W } from "@/lib/layout";

/**
 * /sandbox: isolated component workbench (Storybook-style).
 * Each component is rendered at its real in-app width, outside the iPad shell,
 * so its states can be compared side by side.
 */

// Fixed timestamps so the cards render identically on every load.
const REPORTED = new Date("2026-10-01T13:05:00").getTime();
const OPENED = new Date("2026-10-01T13:12:00").getTime();
// Card width inside the 350px sidebar (minus its 20px padding each side).
const CARD_W = PANEL_W - 40;

export default function SandboxPage() {
  const [log, setLog] = useState<string[]>([]);
  const record = (msg: string) =>
    setLog((l) => [`${new Date().toLocaleTimeString("en-GB")}  ${msg}`, ...l].slice(0, 5));

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-gray-100 p-8 text-mp-ink">
      <header className="text-center">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-gray-500">
          Sandbox · molecules
        </p>
        <h1 className="text-[22px] font-semibold">EscalationCard</h1>
      </header>

      <div className="flex flex-wrap items-start justify-center gap-8">
        <Specimen label='status="delivered"'>
          <EscalationCard
            status="delivered"
            issueType="dimension-mismatch"
            timestamp={REPORTED}
            statusChangedAt={REPORTED + 2_000}
            targetLabel="North wall"
            photoUrl={DEMO_PHOTO}
            dimension={{ plannedM: 4.55, measuredM: 4.35 }}
            onRevoke={() => record("onRevoke() — delivered card")}
          />
        </Specimen>

        <Specimen label='status="in_review"'>
          <EscalationCard
            status="in_review"
            issueType="dimension-mismatch"
            timestamp={REPORTED}
            statusChangedAt={OPENED}
            targetLabel="North wall"
            photoUrl={DEMO_PHOTO}
            dimension={{ plannedM: 4.55, measuredM: 4.35 }}
            onRevoke={() => record("onRevoke() — in_review card (should never fire)")}
          />
        </Specimen>
      </div>

      <section aria-live="polite" className="w-full max-w-[680px]">
        <div className="mb-1.5 text-[12px] font-semibold uppercase tracking-wider text-gray-500">
          Event log
        </div>
        <pre className="min-h-[64px] rounded-xl bg-white p-3 font-mono text-[12px] text-gray-700 shadow-sm">
          {log.length ? log.join("\n") : "Tap Revoke to see the callback fire."}
        </pre>
      </section>
    </main>
  );
}

function Specimen({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <figure className="flex flex-col gap-2.5">
      <figcaption className="font-mono text-[12px] text-gray-500">{label}</figcaption>
      {/* Sidebar backdrop so the card is seen on the colour it ships on */}
      <div className="rounded-2xl bg-mp-panel p-5" style={{ width: CARD_W + 40 }}>
        {children}
      </div>
    </figure>
  );
}
