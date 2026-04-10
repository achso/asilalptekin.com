"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const imageCount = 6;
const galleryImages = Array.from({ length: imageCount }, (_, i) => `/about/gallery/${i + 1}.jpg`);

// Double the images for a seamless loop
const images = [...galleryImages, ...galleryImages];

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
