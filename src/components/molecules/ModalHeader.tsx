import { ChevronLeft, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ModalHeader (molecule): magicplan's native modal header ("Doors · 17 items").
 *
 *   [ ⓘ or ‹ ]     Title       [ ✕ ]
 *                subtitle
 *
 * Leading slot: `leading="info"` is a non-interactive ⓘ badge (as in the
 * sidebar headers); `leading="back"` is a back button (requires onBack).
 * Three columns: the two square buttons take equal widths, so the title stays
 * truly centred whatever the subtitle length. Text never wraps; it truncates.
 */
export function ModalHeader({
  title,
  subtitle,
  leading = "back",
  onBack,
  onClose,
  backLabel = "Back",
  closeLabel = "Close",
  className,
}: {
  title: string;
  subtitle?: string;
  leading?: "info" | "back";
  onBack?: () => void;
  onClose?: () => void;
  backLabel?: string;
  closeLabel?: string;
  className?: string;
}) {
  return (
    <header className={cn("flex items-center justify-between gap-3 px-4 py-3", className)}>
      {leading === "info" ? (
        <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e6e6e9]">
          <Info size={22} strokeWidth={2} className="text-mp-ink" />
        </span>
      ) : (
        <HeaderButton label={backLabel} onClick={onBack} hidden={!onBack}>
          <ChevronLeft size={24} strokeWidth={2.5} className="text-mp-blue" />
        </HeaderButton>
      )}

      <div className="min-w-0 flex-1 text-center leading-tight">
        <h2 className="truncate whitespace-nowrap text-[18px] font-bold text-mp-ink">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 truncate whitespace-nowrap text-[15px] text-mp-muted">{subtitle}</p>
        )}
      </div>

      {/* Same round close button as the room panel and inspector. */}
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e6e6e9] text-[#6b6b70] active:bg-mp-line"
        >
          <X size={20} strokeWidth={2.25} />
        </button>
      ) : (
        <span aria-hidden className="size-10 shrink-0" />
      )}
    </header>
  );
}

/** Light-gray rounded square, 44px (iOS minimum touch target). */
function HeaderButton({
  label,
  onClick,
  hidden,
  children,
}: {
  label: string;
  onClick?: () => void;
  hidden?: boolean;
  children: React.ReactNode;
}) {
  if (hidden) return <span aria-hidden className="size-11 shrink-0" />; // keeps the title centred
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-11 shrink-0 place-items-center rounded-lg bg-gray-100 p-2.5 active:bg-gray-200"
    >
      {children}
    </button>
  );
}
