"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** iOS-style switch. Presentational; the parent owns the value. */
export function Switch({
  checked,
  tone = "red",
  className,
}: {
  checked: boolean;
  tone?: "red" | "blue";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-block h-[31px] w-[51px] shrink-0 rounded-full align-middle transition-colors",
        checked ? (tone === "red" ? "bg-mp-red" : "bg-mp-blue") : "bg-mp-line",
        className,
      )}
    >
      <motion.span
        layout
        className="absolute top-[2px] size-[27px] rounded-full bg-white shadow"
        style={{ left: checked ? 22 : 2 }}
      />
    </span>
  );
}
