# magicplan · Field Escalation (iPad prototype)

A browser-based iPad app (landscape) that lets a contractor on site flag a
space problem **directly on the floor plan** and send it to the remote expert
in Munich: one-way, fire-and-forget, so they never wait on a reply.

> Take-home for the magicplan Product Designer challenge.
> Built with Next.js 15, React 19, Tailwind CSS v4 and Framer Motion.

---

## Run it locally

**Requirements:** Node.js 18.18 or newer (20 LTS recommended) and npm.

```bash
# 1. Clone only this prototype branch
git clone --branch claude/pensive-gauss-tldayl --single-branch \
  https://github.com/achso/asilalptekin.com.git magicplan-escalation
cd magicplan-escalation

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Then open **http://localhost:3000**.

For a production build:

```bash
npm run build && npm start
```

### Viewing on a real iPad

```bash
npm run dev:lan        # binds to 0.0.0.0
```

Open `http://<your-computer's-LAN-IP>:3000` in Safari on an iPad on the same
Wi-Fi and hold it in landscape. For a full-screen, app-like view, tap
**Share → Add to Home Screen**.

On a desktop browser the app renders inside an iPad frame (1180 × 820,
iPad Air / Pro 11" landscape) and scales to fit the window.

> **Note:** browsers only allow microphone access on `https` or `localhost`.
> Over a plain-http LAN address the voice memo falls back to a simulated
> recording. The flow still works the same way.

---

## Demo script (≈ 60 seconds)

The permit is approved, so the plan is in its **execution state**: the header
shows **🔒 Locked (Permit Approved)** and the geometry is read-only.

1. **Try a drafting tool** (Insert, Add Corner, Add Wall, Split Room, Delete).
   They're greyed out. Tapping one shows a toast: *"Plan locked for execution.
   Use 'Report Deviation' to alert the Munich office."*
2. **Tap a wall** (or a corner). It turns magicplan blue. The right sidebar
   shows the familiar **Details / Photos & Notes / Forms** inspector, with
   values read-only. **📍 Report Deviation** sits at the top of the left toolbar
   and also floats next to the selected wall.
3. Tap **Report Deviation**. The right sidebar becomes the **Escalation Form**,
   and the canvas stays visible with the wall highlighted. Nothing needs a
   keyboard:
   - **Issue type:** a radio group (Wall Missing, Dimension Mismatch, Obstacle, …).
     *Dimension Mismatch* shows a ± stepper for the measured length.
   - **Take Photo (required).** Opens the iPad's rear camera. On a laptop,
     use *"No camera? Use demo photo"*.
   - **Record Voice Memo (optional).** Tap to talk, tap to stop.
   - **Work is blocked here** toggle.
   - **Send to Munich** stays disabled until the issue type and photo are
     provided, and its label says what's missing.
4. After sending, the form closes **right away**. The wall locks in a **red
   hatched pattern** with a persistent **"Escalated to Munich"** badge
   (Sending → Delivered), and it appears in **Active Escalations**. The
   contractor moves on.

The top bar shows how long the Munich expert is still available (live
countdown to 15:00 Europe/Berlin).

---

## Project structure

```
app/
  layout.tsx               iPad viewport / web-app meta
  page.tsx                 IPadFrame + AppShell
  globals.css              Tailwind v4 theme tokens (magicplan palette)
components/
  IPadFrame.tsx            Fixed 1180×820 landscape stage, scaled to fit
  AppShell.tsx             Layout: status bar, top bar, canvas, right panel, toasts
  Chrome.tsx               Status bar, top nav (Locked badge, Munich availability),
                           locked tool palette + Report Deviation, undo/redo, floor picker
  FloorPlanCanvas.tsx      SVG plan: grid, walls, corners, openings, dimensions,
                           selection + hatched "locked" state
  CanvasOverlay.tsx        Floating "Report Deviation" CTA + "Escalated to Munich" badges
  EscalationsPanel.tsx     Right panel: Active Escalations ↔ inspector tabs ↔ Escalation Form
  EscalationForm.tsx       Structured evidence capture (issue type, photo, voice, blocking)
lib/
  floorplan.ts             Room geometry (metres), project context, issue types
  types.ts                 Target / Wall / Escalation types
  useEscalationStore.ts    Reducer for select → capture → submit → delivered, plus toasts
  useVoiceRecorder.ts      MediaRecorder with a simulated fallback
  useMunichCutoff.ts       Time left until 15:00 CET
  demoPhoto.ts             Placeholder site photo for desktop demos
```

State is in memory only (no backend). Reloading the page resets the demo.
