import { ChevronLeft, ChevronRight, HelpCircle, Info, LayoutPanelLeft, Share } from "lucide-react";
import { Fragment } from "react";
import { IconButton } from "@/components/atoms/IconButton";
import { LockedBadge } from "@/components/atoms/LockedBadge";
import { ExpertAvailability } from "@/components/molecules/ExpertAvailability";

/**
 * TopBar (organism): back button, breadcrumbs (Music Room / 5th Floor and the
 * selected element, if any), the plan-lock badge, expert availability, and
 * magicplan's help/share/info actions.
 */
export function TopBar({ breadcrumbs }: { breadcrumbs: string[] }) {
  const current = breadcrumbs[breadcrumbs.length - 1];
  const trail = breadcrumbs.slice(0, -1);

  return (
    <header className="flex h-16 items-center gap-4 border-b border-mp-line bg-mp-canvas px-5">
      <button
        type="button"
        aria-label="Back to project"
        className="flex h-12 items-center gap-1 rounded-xl bg-white px-2 text-mp-blue shadow-sm"
      >
        <ChevronLeft size={26} />
        <LayoutPanelLeft size={24} />
      </button>

      <nav aria-label="Breadcrumb" className="min-w-0 leading-tight">
        <div className="truncate text-[20px] font-semibold" aria-current="page">
          {current}
        </div>
        <ol className="flex items-center gap-1 text-[14px] text-mp-muted">
          {trail.map((crumb, i) => (
            <Fragment key={crumb}>
              {i > 0 && <ChevronRight size={12} aria-hidden />}
              <li>{crumb}</li>
            </Fragment>
          ))}
        </ol>
      </nav>

      {/* Badges keep their size; a long element name truncates instead. */}
      <div className="shrink-0">
        <LockedBadge />
      </div>

      <div className="flex-1" />

      <div className="shrink-0">
        <ExpertAvailability />
      </div>

      <div className="flex items-center gap-1 text-mp-blue">
        <IconButton label="Help">
          <HelpCircle size={26} />
        </IconButton>
        <IconButton label="Share">
          <Share size={26} />
        </IconButton>
        <IconButton label="Info">
          <Info size={26} />
        </IconButton>
      </div>
    </header>
  );
}
