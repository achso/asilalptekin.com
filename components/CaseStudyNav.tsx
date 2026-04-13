"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  id: string;
  label: string;
}

interface CaseStudyNavProps {
  items: NavItem[];
}

export const CaseStudyNav = ({ items }: CaseStudyNavProps) => {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0,
      }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav className="hidden lg:block fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-40 w-10">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-3 relative py-6 px-0 rounded-full bg-[#c8c8c8]/20 backdrop-blur-xl border border-white/10 shadow-sm items-center"
      >
        {items.map((item, index) => {
          const isActive = activeId === item.id;
          const label = (index + 1).toString().padStart(2, '0');
          
          return (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`text-center transition-all duration-300 py-1 font-[700] text-[13px] leading-none group relative
                ${isActive ? "text-black scale-125" : "text-[#898989] hover:text-black hover:scale-110"}
              `}
              title={item.label}
            >
              {/* Active Indicator Bar - adjusted for narrower width */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="active-bar"
                    className="absolute -left-[6px] w-[2px] bg-[#7257ff] h-3 rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </AnimatePresence>
              
              <span>{label}</span>

              {/* Tooltip on hover */}
              <span className="absolute left-full ml-4 px-3 py-1 bg-black text-white text-[11px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                {item.label}
              </span>
            </button>
          );
        })}
      </motion.div>
    </nav>
  );
};
