"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const imageCount = 10;
const galleryImages = Array.from({ length: imageCount }, (_, i) => `/about/gallery/${i + 1}.jpg`);

// Double the images for a seamless loop
const images = [...galleryImages, ...galleryImages];

export const MarqueeGallery = () => {
  return (
    <div className="w-full overflow-hidden bg-background py-0 my-0 border-y border-black/5">
      <motion.div
        className="flex gap-0 whitespace-nowrap"
        animate={{
          x: [0, -4500], // 10 images * 450px width = 4500px
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 40,
            ease: "linear",
          },
        }}
      >
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative w-[300px] md:w-[450px] aspect-[4/3] shrink-0 overflow-hidden"
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
