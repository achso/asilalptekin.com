import type { ElementCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * ObjectCategoryIcon (atom): small isometric line drawings in the style of
 * magicplan's "All Objects" insert menu (sheet + pencil, door, window,
 * stairs, sink, washer, cabinet, armchair, socket + plug, trees, fan unit). Strokes and dark fills
 * use currentColor, so the icon follows the chip's text colour.
 */

// Isometric box shared by Appliances, Cabinets and HVAC: top, left and right faces.
const BOX = (
  <>
    <path d="M14 3 5 8l9 5 9-5-9-5Z" />
    <path d="M5 8v13l9 5V13" />
    <path d="M23 8v13l-9 5" />
  </>
);

const DRAWINGS: Record<ElementCategory, React.ReactNode> = {
  annotations: (
    <>
      {/* sheet lying flat, with hand-drawn squiggles */}
      <path d="M3 12 15 6l10 5-12 6-10-5Z" />
      <path d="M8 12.2c1.5-.8 2.5.4 4-.4s2.5.4 4-.4M10.5 14c1.5-.8 2.5.4 4-.4s2.5.4 4-.4" strokeWidth={0.9} />
      {/* pencil */}
      <path d="M4 22.5 17.5 15.8l1.6 1.2L5.6 23.7 3.4 24l.6-1.5Z" />
      <path d="M15.8 16.6l1.6 1.2" strokeWidth={0.9} />
    </>
  ),
  doors: (
    <>
      <path d="M7 4.5 17 9.5V26L7 21V4.5Z" />
      {/* open leaf */}
      <path d="M8.5 6.5 13 4v19l-4.5 2.5V6.5Z" fill="currentColor" />
      <path d="M17 9.5 19.5 8.3V24.8L17 26" />
    </>
  ),
  windows: (
    <>
      <path d="M5 6 19 12.5V26L5 19.5V6Z" />
      <path d="M7 8.8 17 13.5v9.8L7 18.6V8.8Z" strokeWidth={0.9} />
      <path d="M12 11.1v9.8" />
      {/* one dark pane, like the native glyph */}
      <path d="M12.6 11.4 16.4 13.2v9.4l-3.8-1.8v-9.4Z" fill="currentColor" />
      <path d="M19 12.5 22 11v13.5L19 26" />
    </>
  ),
  structural: (
    <>
      {/* stair profile, its far side, the treads joining them */}
      <path d="M3 22v-3l4-2v-3l4-2V9l4-2V4" />
      <path d="M11 26v-3l4-2v-3l4-2v-3l4-2V8" />
      <path d="M3 19l8 4M7 17l8 4M7 14l8 4M11 12l8 4M11 9l8 4M15 7l8 4M15 4l8 4" strokeWidth={0.9} />
      <path d="M3 22l8 4M23 8v12l-12 6" />
    </>
  ),
  plumbing: (
    <>
      {/* basin */}
      <ellipse cx={14} cy={18} rx={10} ry={5} />
      <ellipse cx={14} cy={18.2} rx={6.2} ry={2.8} strokeWidth={0.9} />
      <path d="M4 18v2c0 2.8 4.5 5 10 5s10-2.2 10-5v-2" />
      <circle cx={14} cy={18.6} r={0.7} fill="currentColor" />
      {/* faucet */}
      <path d="M13 14.5V6.8c0-1.6 1-2.6 2.6-2.6h2.2v2.4" />
      <path d="M11.5 14.8h3" />
    </>
  ),
  appliances: (
    <>
      {BOX}
      {/* round door on the front face, vents on the side */}
      <ellipse cx={18.5} cy={17.6} rx={2.9} ry={3.6} transform="rotate(-28 18.5 17.6)" />
      <ellipse cx={18.5} cy={17.6} rx={1.6} ry={2.1} transform="rotate(-28 18.5 17.6)" strokeWidth={0.9} />
      <path d="M7.5 14v6.2M9.5 15.1v6.2M11.5 16.2v6.2" strokeWidth={0.9} />
      <path d="M15.5 13.3 21.5 10" strokeWidth={0.9} />
    </>
  ),
  cabinets: (
    <>
      {BOX}
      {/* drawer line, two doors, handles */}
      <path d="M14 16.2 23 11.2M18.5 13.7v9.8" strokeWidth={0.9} />
      <path d="M17.3 17.4v1.8M19.7 16.1v1.8M17.6 14.4l1.8-1" />
    </>
  ),
  furniture: (
    <>
      {/* armchair: seat, backrest, two arms */}
      <path d="M7 17.5 14 21l8-4-7-3.5-8 4Z" />
      <path d="M7 17.5V21l7 3.5 8-4V17" />
      <path d="M15 13.5V7l7 3.5V17" />
      <path d="M5 16.5v-4l7-3.5v4M5 12.5l2 1 7-3.5" strokeWidth={0.9} />
      <path d="M5 16.5v3.8l2 1M20 18v4l2.5-1.2" strokeWidth={0.9} />
    </>
  ),
  outdoors: (
    <>
      {/* trees on a slab of ground */}
      <path d="M3 19 14 13.5 25 19l-11 5.5L3 19Z" />
      <path d="M3 19v2l11 5.5L25 21v-2" />
      <path d="M10 19.5v-3M7.2 16.5 10 7.5l2.8 9H7.2ZM18 17.5v-3M15.5 14.5 18 6.5l2.5 8h-5Z" />
    </>
  ),
  electrical: (
    <>
      {/* wall plate with socket */}
      <path d="M4 4 14 9v15L4 19V4Z" />
      <ellipse cx={9} cy={12.5} rx={2.6} ry={3.2} transform="rotate(-28 9 12.5)" strokeWidth={0.9} />
      <circle cx={8.1} cy={12.2} r={0.55} fill="currentColor" />
      <circle cx={9.9} cy={13.1} r={0.55} fill="currentColor" />
      {/* plug + cable */}
      <path d="M12 17.2 15.4 19M12 19.4 15.4 21.2" strokeWidth={0.9} />
      <path d="M15.4 16.8 20 19.2v4.6l-4.6-2.4v-4.6Z" fill="currentColor" />
      <path d="M20 21.5c2.5 1.2 3.5 2.4 3.5 4.5" />
    </>
  ),
  hvac: (
    <>
      {BOX}
      {/* fan grille on the front face */}
      <ellipse cx={18.5} cy={17.4} rx={3.4} ry={4.2} transform="rotate(-28 18.5 17.4)" />
      <path d="M18.5 17.4 16.4 14.6M18.5 17.4l3.1-.4M18.5 17.4l-.6 3.6M18.5 17.4l-3 .9" strokeWidth={0.9} />
      <path d="M7 13.5v7M10.5 15.4v7" strokeWidth={0.9} />
    </>
  ),
};

export function ObjectCategoryIcon({
  category,
  size = 28,
  className,
}: {
  category: ElementCategory;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      {DRAWINGS[category]}
    </svg>
  );
}
