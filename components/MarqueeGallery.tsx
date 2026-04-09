"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const images = [
  "/avatar4.png", // Reusing existing assets or placeholders
  "/craftapp/handheldsplash3.png",
  "/route-planner/hero.png",
  "/avatar4.png",
  "/craftapp/panocraft1-Recovered.png",
  "/avatar4.png",
  // Duplicating for seamless loop
  "/avatar4.png", 
  "/craftapp/handheldsplash3.png",
  "/route-planner/hero.png",
  "/avatar4.png",
  "/craftapp/panocraft1-Recovered.png",
  "/avatar4.png",
];

export const MarqueeGallery = () => {
  return (
    <div className="w-full overflow-hidden bg-[#f1f1f1] py-20 my-10 border-y border-border/50">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{
          x: [0, -1000],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 30,
            ease: "linear",
          },
        }}
      >
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative w-[300px] md:w-[450px] aspect-[4/3] shrink-0 rounded-[12px] overflow-hidden shadow-sm"
          >
            <Image
              src={img}
              alt={`Gallery image ${idx}`}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
};
