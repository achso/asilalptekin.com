"use client";

import { ProjectData } from "@/data/projects";
import Link from "next/link";
import { motion } from "framer-motion";

export function ProjectCard({ project }: { project: ProjectData }) {
  const CardContent = (
    <motion.div
      className={`project-card flex flex-col gap-6 ${project.isComingSoon ? 'cursor-default' : 'cursor-pointer'}`}
      initial="rest"
      whileHover={project.isComingSoon ? "rest" : "hover"}
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
      <div className="flex flex-col gap-2">
        <h3 className="font-sans font-bold text-[26px] md:text-[28px] text-black/85 leading-tight tracking-[-0.01em]">
          {project.title}
        </h3>

        <p className="font-sans font-semibold text-[15px] md:text-[16px] text-black/45 leading-[1.6]">
          {project.description}
        </p>

        <div className="flex items-center gap-1.5 mt-1 font-sans font-semibold text-[13px] md:text-[14px] text-black/85">
          {project.company && <span>{project.company}</span>}
          {project.company && (project.duration || project.focus) && <span className="text-black/30 font-normal">·</span>}
          {project.duration && <span>{project.duration}</span>}
          {project.duration && project.focus && <span className="text-black/30 font-normal">·</span>}
          {project.focus && <span>{project.focus}</span>}
        </div>
      </div>
    </motion.div>
  );

  if (project.isComingSoon) {
    return <div className="block">{CardContent}</div>;
  }

  return (
    <Link href={`/work/${project.slug}`} className="block">
      {CardContent}
    </Link>
  );
}
