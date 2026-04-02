"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";

const statements = [
  "I usually only drink half my cup of coffee.",
  "I’m listening to your parent's favorite music.",
  "I turn messy \"what ifs\" into things that work.",
  "I’m still trying to master that one guitar solo.",
  "I design software that doesn't feel like a chore.",
  "Cooking is my meditation routine."
];

// Bouncy spring motion dropping softly from the top down
const variants = {
  enter: { y: -120, opacity: 0 },
  center: { y: 0, opacity: 1 },
  exit: { y: 120, opacity: 0 }
};

const transition: Transition = {
  y: { type: "spring", stiffness: 180, damping: 13 },
  opacity: { duration: 0.4, ease: "linear" }
};

export function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % statements.length);
    }, 3000); // 3 seconds per statement
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative mt-3 grid [grid-template-areas:'stack'] overflow-hidden h-[120px] lg:h-[160px]">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={index}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
          className="[grid-area:stack] relative"
        >
          <div className="text-foreground/40 font-[800] text-[48px] lg:text-[64px] leading-[1.2]">
            {statements[index]}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
