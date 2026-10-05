# magicplan · Field Escalation (iPad prototype)

A browser-based iPad app (landscape) that lets a contractor on site flag a
space problem **directly on the floor plan** and send it to the remote expert
in Munich: one-way, fire-and-forget, so they never wait on a reply. The plan
is locked, so ordinary CAD actions (editing a dimension, inserting a wall)
are intercepted and turned into proposals.

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

> **Note:** the voice memo is mocked (no microphone access needed), so it
> works the same over a plain-http LAN address.

---

## Demo script (≈ 60 seconds): Intercept and Propose

The permit is approved, so the plan is in its **execution state**: the header
shows **🔒 Locked (Permit Approved)**, the geometry is read-only and the
plan's dimensions carry a small lock. There is no separate "Report Deviation"
button. The contractor does what they'd do in magicplan anyway, the locked
plan **intercepts** it, and an **Escalation Draft** slides into the right
sidebar with the intent already filled in.

> This is a *Wizard of Oz* prototype: four interaction paths are wired up
> end to end, to demonstrate the UX concept. Every other tool stays locked
> and explains why when tapped.

### Path 1: "The measurement is off"

1. Tap any wall dimension on the plan (e.g. **4.55** above the North wall;
   they're tinted blue and carry the native lock glyph), or a wall's
   **Length** value in the inspector.
2. magicplan's **Change Measurement** popover opens: **Reset** (back to the
   plan value), the value field and a dark **🔒 Propose Correction** button.
   Type the laser reading and propose it.
3. The draft opens with that reading prefilled: *Proposing · Dimension
   Mismatch · East wall · plan 3.30 m*. Opening the popover again on the same
   wall shows (and updates) the proposed value. The line under the input
   shows the difference ("−20 cm vs plan").

### Path 2: "There's a wall on site that isn't on the plan" (and objects)

1. Tap **+ Insert** in the left toolbar. magicplan's Insert popover opens:
   **Room** (locked), **Partition wall**, **Object**, **Note**, **Photo**,
   **Form**. *Partition wall* was *Structural* inside the object grid; it's
   renamed and moved up because a partition wall is the case we support
   (UX audit #6). Note, Photo and Form
   never change the plan, so they're allowed: the sidebar jumps to the
   matching tab and an alert says why.
2. Tap **Partition wall**: the canvas enters `ghost_draft`. The *Tap any dimension* hint
   pill hides; a red banner says *Tap where the wall starts* (✕ cancels).
3. **Two taps draw the wall** (UX audit #1). Tap 1 drops the start; the banner
   turns into *Tap where the wall ends* and a rubber band with a live length
   follows the pointer. Tap 2 sets the end. Points snap to a 5 cm grid and
   onto an existing wall's inner face within 15 cm. **Angles are 90°**: a
   wall started on an existing wall is always perpendicular to it (as in
   magicplan, no angle to set, only the length follows the pointer); a wall
   started free in the room is horizontal or vertical.
4. The wall is drawn as a **red dashed line at true length**, with its length
   beside it, and is selected (title *New partition wall (proposed)*). The
   `EscalationDraftPane` opens with the **length prefilled** from the drawing
   and the location in words: *Drawn on plan · runs north–south · From North
   wall, 1.40 m from west to 1.40 m from west, 2.40 m from north*. The
   contractor corrects the length with the tape measure reading if it differs.
5. Once drawn it behaves like an object, and **the plan and the length field
   are one value**: type a length or tap − / + and the wall redraws; drag its
   **end handle** to resize and the field follows. Drag the wall (the ring
   with two arrows) to **move it left / right**: anchored, it slides along
   its host wall only and stays attached; free, it moves both ways. The
   native **rotate arrow** past its free end turns it (45° magnetic snap,
   green when snapped, tap = +45°): an attached wall pivots on its anchor and
   only turns into the room, a free one pivots on its middle; resizing then
   follows the new angle, and the sentence reads e.g. *Runs 1.60 m
   south-west*. Every drag or turn is one ⌘Z step.
6. Delete… removes the drawn wall (nothing was sent).

**From a spot on a wall.** Tap a wall first: as in magicplan, the exact spot
gets a **blue triangle** with a white notch through the wall, and the toolbar
switches to the element tools. **Add Wall** is then live: the spot is the
start, so a single tap draws the wall (Insert → Partition wall does the same while the
triangle shows). Tapping the wall again moves the spot.

**Objects** (Insert → Object → Doors, Windows, Plumbing, …) are a
**0.6 × 0.6 m red dashed square** labelled with the category. At a marked
spot it lands against the wall at once; otherwise one tap places it. It behaves
like the plan's own objects: **drag** to move, the native **rotate arrow** to
turn (45° snap, green when snapped, tap = +45°). The toolbar switches to object
tools: **Duplicate** adds a copy in the same report (*Placed on plan · 2
items*), **Delete…** removes the selected copy (the last one removes the
proposal). Every move, turn, copy and delete is a ⌘Z step.

### Path 3: "This object is a different size, or turned"

1. Tap the **kitchen counter**, the **table** or the **chair**. It gets
   magicplan's blue selection frame and the curved **rotate arrow**; the
   inspector shows **Width / Depth / Height / Rotation** as native value pills.
2. Change a value: tap its pill → the same Change Measurement popover →
   Propose Correction. Or **rotate**: drag the arrow. Rotation is free and
   snaps magnetically to every 45°; on a snapped angle the arrow turns
   **green** (blue otherwise), and a dashed circle shows the rotation path.
   A plain tap on the arrow turns it to the next 45°. Or **move** it: drag the
   object itself. Position is shown visually only (no coordinates): the faded
   original stays where the plan has it, the proposal follows your finger, and
   a dashed arrow links the two. The draft's *Position* row says "Moved on
   plan" with a Reset; the card adds "Moved".
3. The plan stays locked: the original stays drawn (faded) and the proposal
   is drawn over it as a **red dashed ghost**. The draft (*Dimension
   Mismatch · Small table (rectangular)*) lists all four values against the
   plan; editing them there, in the popover or with the arrow all change the
   same proposal, live on the canvas. Send needs at least one change and a
   photo; the card reads e.g. "W 0.95 → 1.10 m · ↻ 0° → 45°", and the
   ghost stays on the plan in its status colour.

### Path 4: "This isn't on site at all"

Select a wall, a corner or an object: **Delete…** in the left toolbar comes
alive (it stays locked in the room view). Tapping it deletes nothing: it opens
*Proposing · Element Not on Site · Small table (rectangular)*. The element is
crossed out on the plan (red dashed outline and cross for an object, a red
dashed overlay on a wall, a ring on a corner) and only a photo is needed. Once
sent, the cross-out stays in the report's status colour until the expert
reviews it.

### All paths

- **The form** (`EscalationDraftPane`): 15 px minimum text everywhere
  (footer and hints included), and one decimal separator: a typed comma
  becomes a period, so it's always *2.40*.
  - **Measured length**: prefilled from the drawn wall (or the popover);
    a plausible minimum of **0.50 m** is required (*"At least 0.50 m"*).
  - **Evidence**: the same photo grid as the native *Photos & Notes* tab
    (the + tile opens the rear camera; on a laptop use *"No camera? Use demo
    photo"*), at least one photo. The grid is the native 4 × 2 one, untouched.
  - **Notes + voice memo in one field** (`NotesAndAudioInput`, right under
    the grid; mocked audio, no speech-to-text API). The field shape-shifts in
    the same footprint instead of adding a section:
    - **text**: the note, with a gray **mic** button in its bottom-right corner;
    - **recording**: the text area gives way to a pill with a pulsing red dot,
      a live timer and **Stop**;
    - **recorded**: a WhatsApp-style bubble with play (mock playback fills the
      waveform), the waveform, the duration, a green **Transcribe** link and a
      trash icon (deletes the audio, back to text);
    - **Transcribe**: the text area comes back under the waveform, pre-filled
      with the transcript for the current path (e.g. *"The physical wall is
      20cm shorter than the locked plan indicates. Requesting permission to
      proceed."*), editable.

    The memo's length shows on the sent card; the ticket has a *Voice memo*
    row (*transcribed into the note* or *audio only*). Every Photos & Notes
    tab uses the same field.
  - **The Ask** (UX audit #2), required, right above Send: *Update the plan*,
    *Tell me whether I can continue*, *Check the permit*.
  - **Priority** (UX audit #5, renamed in round 2): what the contractor is
    doing, **I'm carrying on** (default) or **I've stopped**, so it can't
    contradict *"Tell me whether I can continue"*. Under it, what to expect,
    stated from the expert's hours only, with no promised response time
    (table below).
  - **Review and send** is solid primary blue and names what's missing
    (*"Add photo · pick the ask"*, *"Pick what you need back"*). It opens
    **Check before sending**: the exact ticket the expert will receive (see
    below), with *Back to edit* (the draft stays as it was) and **Send to
    expert**.
  - **Footer**: *Auto-attached: plan dimensions · Permit approved last
    Tuesday*. Nothing else (no budget, no site history).
- On send the toast names what was sent: **"Partition wall report sent"** (or
  *Plumbing / Dimension / Removal report sent*).
- After sending, the pane closes **right away**. The North wall locks in a
  **red hatched pattern** with a status pin; the ghost stays on the plan in
  its status colour. Both appear in **Active Escalations** on the room
  panel, and the contractor moves on.
- A draft closes **only** with its round **✕** (or by sending it). A tap
  elsewhere (canvas, another element, a pin, another dimension, Insert)
  shows a **"Discard this escalation draft?"** alert: *Keep Editing* (also
  Esc or a tap on the backdrop) or *Discard Draft*, which then carries out
  what you tapped. The draft's own element stays editable.
- **Undo / redo** (top right, or ⌘Z / ⇧⌘Z) step through the open draft:
  moves, rotations, value changes and ghost placement. A whole drag or
  rotation is one step; the first undo returns to "no changes" without
  closing the draft. With no draft open there's nothing to undo on the
  locked plan, so they show disabled.

**Canvas badges:** an element with standard Photos & Notes shows magicplan's
yellow paperclip. If it's also escalated, only the escalation pin shows (red,
amber or green): the blocker always wins.

**One time source** (UX audit #4, `lib/useMunichCutoff.ts`): the expert works
08:00–15:00 Europe/Berlin, Monday to Friday, and every time string comes from
one shared clock, so the top bar, the form, the cards and the ticket never
disagree. "Tomorrow" skips the weekend: Friday after 15:00 reads *08:00 Monday*.

| | Expert in (> 30 min left) | Expert in (≤ 30 min left) | After 15:00 / weekend |
|---|---|---|---|
| Top bar | *Expert available between 08:00 – 15:00*, green dot | same, amber dot | same, gray dot |
| Form, I'm carrying on | *No rush · work continues* + availability | same | same |
| Form, I've stopped | *Asking for an answer today · expert is in until 15:00* | *Expert leaves in 12 min · available again tomorrow from 08:00* | *Expert available from 08:00 tomorrow · work is stopped* + *You can leave. The answer will come to this iPad.* |
| Sent card | *Queued* / *Delivered* + availability | same | *Queued* + *Expert available from 08:00 tomorrow* |
| Expert's ticket, Urgency | *Not blocking*, or *Work stopped since 13:10* (+ *yesterday* / weekday when older) | | |
| Clocks (status bar, card, ticket) | Munich time | | |

The copy only says when the expert is **available**, never when a report will
be looked at: nobody can promise that.

**What the expert receives** (UX audit #3): the **chevron** on a sent card
opens a read-only ticket:
- **which job, where, when** under the title (*Music Room Renovation,
  Lindenstraße 14, Augsburg · 5th Floor, Music Room · Mon, 5 Oct, 18:56*), and
  **Reported by** as a row in the table (*M. Weber, site lead*, fictional);
- the plan snapshot with doors and windows and the proposal in red (length
  label, north arrow, room size). On a disputed wall the red *4.20 m (plan
  4.55)* replaces that wall's size label instead of printing over it;
- the wall in one sentence: *Starts on the north wall, 1.80 m from the west
  corner. Runs 1.95 m south.*;
- **every photo** (the selected one large, all of them as thumbnails; tap one
  to view it);
- *Issue* naming what it's about (*Dimension Mismatch · North wall*);
  *Measured* against the plan, or *estimated from the drawing, not
  measured* until the contractor types a reading (the form says so too and
  keeps step 1 open); **The Ask**; and **Urgency**.

Esc, ✕ or a tap outside closes it. The same view is the review step before
Send. A correction equal to the plan (Propose Correction with 4.55 unchanged)
isn't sendable: the button reads *Add new length*.

---

## Presenter controls: deviation lifecycle and the revoke race

**Simulated backend.** Every report starts **queued** (saved on the iPad) and
moves on by itself: **sending** after 1 s (or as soon as the iPad is back
online), **delivered** 1.5 s later, then **in review** 3 s later if the remote
expert is online (08:00–15:00 Munich). **Cheat for reviewers:** double-tap a
card's header to force the next state (queued → sending → delivered → in
review → resolved) without waiting. Resolved reports leave *Active
Escalations*; select the element to see its resolved card.

**Report Deviation pane.** The intercepted action preselects the issue type;
*Change type* lists all four with their one-line definitions (Dimension
Mismatch, Undocumented Element, Element Not on Site, Site Condition Hazard).
Picking another type keeps the photo and note but drops the intercept's
values. Under the send button: *Auto-attached: plan dimensions · Permit
approved last Tuesday.*

Each report moves through an explicit state machine (`lib/deviationMachine.ts`):

```
idle ─submit─▶ queued ─▶ sending ─▶ delivered ─▶ in_review ─▶ resolved
 ▲                 │           │             ✕
 └──── revoke ─────┴───────────┘      revoke rejected
   (optimistic; confirmed by the server after network latency)
```

| State | Canvas | Escalation card |
|---|---|---|
| Queued | Hatched wall, gray cloud-off pin | Gray **Queued** pill + *"Expert available from 08:00 tomorrow"* after hours; cascades to sending → delivered by itself; Revoke available |
| Idle (locked plan) | Black wall, toolbar tools disabled | — |
| Delivered | Red hatched wall, red lock pin | **Revoke Escalation** available |
| In Review | Hatched wall framed in amber with a pulse, amber eye pin | Revoke hidden; yellow "Expert is reviewing" badge and the note *"The expert is actively reviewing. Revocation disabled."* |
| Resolved | Green wall, green check pin | Contractor unblocked; the wall can be reported again |

**Open the hidden Dev Tools:** press **Shift + D**, **triple-tap the clock** in
the status bar (works on the iPad), or load **`/?dev=1`**. The panel flips the
expert-side status between **Delivered / In Review / Resolved**, and has:

- **Auto-advance:** the expert opens the report after ~7s and resolves it after ~14s.
- **Slow revoke (3s):** on by default, so there's time to show the race.
- **Reset** clears the demo.

**Demonstrating the race condition:**

1. Send a proposal (e.g. Path 1) and wait for **Delivered**.
2. Tap **Revoke Escalation**. The wall unlocks right away (optimistic update),
   and the panel counts down while the revoke is "in flight".
3. Before the countdown ends, tap **In Review** in Dev Tools.
4. The server wins. The revoke is rejected, the escalation comes back as
   **In Review**, and the Revoke button stays hidden.

The rule is enforced in the reducer, not only in the UI. A stale tap or
double-tap on Revoke after the report reaches In Review is rejected with the
same message.

---

## Component sandbox

Open **http://localhost:3000/sandbox** (or `:3001` if you run on that port):
a long-scrolling "kitchen sink" of every component, in isolation and in each
state.

- **Atoms:** `CanvasWall` in idle / selected / delivered / in review /
  resolved, plus `ToolButton`, `Switch` and `StepLabel`.
- **Molecules:** `EscalationCard` in all four states (sending, delivered, in
  review, resolved),
  `NumericStepper`, `PhotoEvidenceCapture`, `VoiceMemoToggle` and
  `ExpertAvailability`.
- **UI Elements:** `MeasurementPopover` (Change Measurement → Propose Correction), `LockedBadge`, the compact `EscalationPin`,
  the yellow `AttachmentBadge` paperclip, the ghost wall, `ElementBadges` precedence in context,
  and every `StatusToast` variant.

Interactive specimens log their callbacks in an event log at the bottom.

---

## Project structure

```
src/
├── app/
│   ├── page.tsx                  iPad layout shell; owns the store, composes organisms
│   ├── sandbox/page.tsx          isolated component workbench
│   ├── layout.tsx, globals.css   viewport meta, Tailwind theme tokens
├── store/
│   ├── useDeviationState.ts      escalation workflow store (selection, intercepted
│   │                             drafts + ghost_draft mode, submit, revoke with race
│   │                             guard, mock expert review)
│   └── deviationMachine.ts       lifecycle: transition table, revoke rule, labels
├── components/
│   ├── atoms/                    CanvasWall, FloatingAnchor, LockedBadge, ToolButton,
│   │                             IconButton, Switch, StepLabel
│   ├── molecules/                EscalationCard, EscalationPin, MeasurementPopover,
│   │                             NumericStepper, PhotoEvidenceCapture,
│   │                             VoiceMemoToggle, CanvasControls, ExpertAvailability
│   └── organisms/                TopBar, DeviceStatusBar, LeftToolbar, CanvasArea,
│                                 FloorPlan, RightSidebar, EscalationDraftPane,
│                                 RoomDefaultSidebar, StatusToast,
│                                 DevToolsPanel, IPadFrame
└── lib/                          floor plan data + geometry, types, layout constants,
                                  hooks (voice recorder, Munich cutoff), cn() helper
```

State is in memory only (no backend). Reloading the page resets the demo.
