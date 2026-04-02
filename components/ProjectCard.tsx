"use client";

import { Badge } from "@/components/ui/badge";
import { ProjectData } from "@/data/projects";
import Link from "next/link";
import { motion } from "framer-motion";

export function ProjectCard({ project }: { project: ProjectData }) {
  return (
    <Link href={`/work/${project.slug}`} className="block">
      <motion.div
        className="project-card flex flex-col gap-6"
        initial="rest"
        whileHover="hover"
        animate="rest"
      >
      {/* Image Frame Container */}
      <motion.div
        className="relative w-full overflow-hidden rounded-[12px] aspect-[16/10]"
        variants={{
          rest: { scale: 1, zIndex: 0 },
          hover: { scale: 1.05, zIndex: 10 },
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
        style={{
          backgroundColor: project.imageColor,
          backgroundImage: project.imageSrc ? `url('${project.imageSrc}')` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "50% center",
        }}
      />

      {/* Text */}
      <div className="flex flex-col">
        <div className="flex justify-between items-start gap-3 mb-2">
          <h3 className="text-[22px] sm:text-2xl font-bold tracking-tight text-foreground pr-2">
            {project.title}
          </h3>
          {project.statusBadge && (
            <Badge variant="outline" className="rounded-full text-[10px] font-semibold px-2.5 py-0.5 border-border/80 text-muted-foreground uppercase tracking-widest whitespace-nowrap mt-1">
              {project.statusBadge} ↗
            </Badge>
          )}
        </div>

        <p className="text-[15px] sm:text-[16px] text-muted-foreground/90 leading-relaxed max-w-lg mb-4">
          {project.description}
        </p>

        <div className="flex items-center gap-2 text-[13px] sm:text-sm text-foreground font-semibold">
          <span>{project.role}</span>
          <span className="text-muted-foreground font-normal">·</span>
          <span className="text-foreground">{project.year}</span>
        </div>
      </div>
      </motion.div>
    </Link>
  );
}
