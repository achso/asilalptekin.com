"use client";

import { motion } from "framer-motion";

export function MobileMockup() {
  const frames = [
    { zIndex: 10, rotate: -8, xOffset: "-30%", yOffset: 60, scale: 0.9 },
    { zIndex: 30, rotate: 0, xOffset: "0%", yOffset: 0, scale: 1 },
    { zIndex: 20, rotate: 8, xOffset: "30%", yOffset: 60, scale: 0.9 },
  ];

  return (
    <div className="w-full bg-muted/40 rounded-[2rem] py-20 px-4 md:px-16 overflow-hidden my-12 border border-border flex justify-center items-center min-h-[500px] sm:min-h-[600px] md:min-h-[700px] relative">
      {/* Central anchor for the phones */}
      <div className="relative w-full max-w-[260px] md:max-w-sm aspect-[1/2.16]">
        {frames.map((frame, i) => (
          <motion.div
            key={i}
            initial={{ y: 200, opacity: 0, rotate: frame.rotate * 2, scale: 0.8 }}
            whileInView={{ y: frame.yOffset, opacity: 1, x: frame.xOffset, rotate: frame.rotate, scale: frame.scale }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ 
              duration: 0.8, 
              delay: i * 0.15, 
              type: "spring", 
              stiffness: 80,
              damping: 15
            }}
            className="absolute top-0 left-0 w-full h-full bg-black rounded-[2rem] border-[6px] md:border-[8px] border-black shadow-2xl overflow-hidden"
            style={{ zIndex: frame.zIndex }}
          >
            {/* Screen Content Placeholder - Simulating high contrast field ops UI */}
            <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col pt-12 px-5 gap-5">
               {/* UI Header */}
               <div className="flex items-center justify-between w-full">
                 <div className="w-8 h-8 rounded-full bg-zinc-800"></div>
                 <div className="w-24 h-4 rounded-full bg-zinc-800"></div>
                 <div className="w-8 h-8 rounded-full bg-zinc-800"></div>
               </div>
               
               {/* Big high contrast task card */}
               <div className="w-full aspect-square bg-[#171717] border border-zinc-800 rounded-2xl mt-4 flex flex-col items-center justify-center p-6 gap-4">
                  <div className="w-20 h-20 rounded-full border-4 border-zinc-700"></div>
                  <div className="w-3/4 h-6 rounded-full bg-zinc-800 mt-2"></div>
                  <div className="w-1/2 h-4 rounded-full bg-zinc-800"></div>
               </div>

               {/* Large tap target buttons */}
               <div className="flex flex-col gap-3 mt-auto mb-6">
                 <div className="w-full h-12 md:h-14 rounded-xl bg-green-600/20 border border-green-500/30 flex items-center justify-center">
                    <div className="w-1/3 h-4 bg-green-500/50 rounded-full"></div>
                 </div>
                 <div className="w-full h-12 md:h-14 rounded-xl bg-zinc-800 flex items-center justify-center">
                    <div className="w-1/3 h-4 bg-zinc-600 rounded-full"></div>
                 </div>
               </div>
            </div>
            
            {/* Phone Hardware Notch/Island */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-7 bg-black rounded-b-xl z-20"></div>
            {/* Home indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-zinc-700 rounded-full z-20"></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
