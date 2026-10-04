"use client";

import { motion } from "framer-motion";
import { Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AttachmentBadge (atom): magicplan's native yellow paperclip, marking an
 * element that has standard Photos & Notes attachments. A 24px disc inside a
 * 44px touch target; tapping selects the element.
 */
export function AttachmentBadge({
  count,
  label,
  onPress,
  className,
}: {
  count: number;
  /** Accessible name of the element, e.g. "North wall". */
  label: string;
  onPress?: () => void;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onPress}
      aria-label={`${label}: ${count} photo${count === 1 ? "" : "s"} attached`}
      title={`${count} photo${count === 1 ? "" : "s"}`}
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, transition: { duration: 0.18, ease: [0.2, 0, 0, 1] } }}
      exit={{ scale: 0.4, opacity: 0, transition: { duration: 0.12 } }}
      whileTap={{ scale: 0.9 }}
      className={cn("grid size-11 place-items-center rounded-full will-change-transform", className)}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFC107] text-black shadow-sm ring-2 ring-white">
        <Paperclip size={13} strokeWidth={2.75} aria-hidden />
      </span>
    </motion.button>
  );
}
