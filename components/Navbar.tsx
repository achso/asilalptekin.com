"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isWorkActive = pathname === "/" || pathname === "/work";
  const isFunActive = pathname === "/fun";
  const isAboutActive = pathname === "/about";

  return (
    <nav className="fixed top-0 left-0 z-50 w-full pt-6 md:pt-8 px-8 pb-8 flex items-center justify-between transition-all duration-600 ease-[cubic-bezier(0.23,1,0.32,1)]">
      {/* Premium Multi-Layer Gradient Blur */}
      <ProgressiveBlur />
      
      <div className="relative flex items-center justify-between w-full">
        <Link href="/"
          className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-[800] text-3xl hover:scale-105 transition-transform shrink-0 shadow-lg"
          style={{ fontFamily: "var(--font-script)" }}
        >
          A.
        </Link>
        {/* Desktop Menu (> 820px) */}
        <div className="hidden min-[821px]:flex items-center gap-2 text-[18px] font-[700] leading-[27px]">
          <Link href="/" className={`${isWorkActive ? 'text-black bg-[#c8c8c8]/60' : 'text-[#898989] hover:text-black hover:bg-[#c8c8c8]/60'} transition-all duration-[600ms] ease-in-out px-4 py-2 rounded-full`}>Work</Link>
          {/* <Link href="/fun" className={`${isFunActive ? 'text-black bg-[#c8c8c8]/60' : 'text-[#898989] hover:text-black hover:bg-[#c8c8c8]/60'} transition-all duration-[600ms] ease-in-out px-4 py-2 rounded-full`}>Fun</Link> */}
          <Link href="/about" className={`${isAboutActive ? 'text-black bg-[#c8c8c8]/60' : 'text-[#898989] hover:text-black hover:bg-[#c8c8c8]/60'} transition-all duration-[600ms] ease-in-out px-4 py-2 rounded-full`}>About</Link>
          <a href="/asil_alptekin_resume.pdf" target="_blank" rel="noopener noreferrer" className="text-[#898989] hover:text-black hover:bg-[#c8c8c8]/60 transition-all duration-[600ms] ease-in-out px-4 py-2 rounded-full">Resume</a>
        </div>

        {/* Mobile/Tablet Menu Toggle (<= 820px) */}
        <div className="flex min-[821px]:hidden items-center relative z-50">
          <button
            aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-[#898989] hover:text-black hover:bg-[#c8c8c8]/60 transition-all duration-[600ms] ease-in-out w-12 h-12 rounded-full flex items-center justify-center"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Options */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute top-24 left-8 right-8 flex flex-col items-end gap-2 min-[821px]:hidden z-40 bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/10"
          >
            <Link href="/" onClick={() => setIsMenuOpen(false)} className={`w-full text-right ${isWorkActive ? 'text-black bg-[#c8c8c8]/60' : 'text-[#898989] hover:text-black hover:bg-[#c8c8c8]/60'} transition-all duration-[600ms] ease-in-out px-4 py-2 rounded-full text-[18px] font-[700] leading-[27px]`}>Work</Link>
            {/* <Link href="/fun" onClick={() => setIsMenuOpen(false)} className={`w-full text-right ${isFunActive ? 'text-black bg-[#c8c8c8]/60' : 'text-[#898989] hover:text-black hover:bg-[#c8c8c8]/60'} transition-all duration-[600ms] ease-in-out px-4 py-2 rounded-full text-[18px] font-[700] leading-[27px]`}>Fun</Link> */}
            <Link href="/about" onClick={() => setIsMenuOpen(false)} className={`w-full text-right ${isAboutActive ? 'text-black bg-[#c8c8c8]/60' : 'text-[#898989] hover:text-black hover:bg-[#c8c8c8]/60'} transition-all duration-[600ms] ease-in-out px-4 py-2 rounded-full text-[18px] font-[700] leading-[27px]`}>About</Link>
            <a href="/asil_alptekin_resume.pdf" target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)} className="w-full text-right text-[#898989] hover:text-black hover:bg-[#c8c8c8]/60 transition-all duration-[600ms] ease-in-out px-4 py-2 rounded-full text-[18px] font-[700] leading-[27px]">Resume</a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

{/* 
  Progressive Blur Algorithm (Bokeh Effect) 
  Uses multiple stacked overlays with increasing blur intensity and intersecting alpha masks.
  This prevents harsh horizontal cut-offs, mimicking an actual camera lens depth-of-field.
*/}
const ProgressiveBlur = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-[150%] pointer-events-none select-none z-0">
      {/* Layer 1: Widest but gentlest blur */}
      <div className="absolute inset-0 backdrop-blur-[1px]" style={{
        maskImage: "linear-gradient(0deg, rgba(0,0,0,0) 12.5%, #000 25%, #000 37.5%, rgba(0,0,0,0) 50%)",
        WebkitMaskImage: "linear-gradient(0deg, rgba(0,0,0,0) 12.5%, #000 25%, #000 37.5%, rgba(0,0,0,0) 50%)"
      }} />
      {/* Layer 2 */}
      <div className="absolute inset-0 backdrop-blur-[2px]" style={{
        maskImage: "linear-gradient(0deg, rgba(0,0,0,0) 25%, #000 37.5%, #000 50%, rgba(0,0,0,0) 62.5%)",
        WebkitMaskImage: "linear-gradient(0deg, rgba(0,0,0,0) 25%, #000 37.5%, #000 50%, rgba(0,0,0,0) 62.5%)"
      }} />
      {/* Layer 3 */}
      <div className="absolute inset-0 backdrop-blur-[4px]" style={{
        maskImage: "linear-gradient(0deg, rgba(0,0,0,0) 37.5%, #000 50%, #000 62.5%, rgba(0,0,0,0) 75%)",
        WebkitMaskImage: "linear-gradient(0deg, rgba(0,0,0,0) 37.5%, #000 50%, #000 62.5%, rgba(0,0,0,0) 75%)"
      }} />
      {/* Layer 4 */}
      <div className="absolute inset-0 backdrop-blur-[8px]" style={{
        maskImage: "linear-gradient(0deg, rgba(0,0,0,0) 50%, #000 62.5%, #000 75%, rgba(0,0,0,0) 87.5%)",
        WebkitMaskImage: "linear-gradient(0deg, rgba(0,0,0,0) 50%, #000 62.5%, #000 75%, rgba(0,0,0,0) 87.5%)"
      }} />
      {/* Layer 5 */}
      <div className="absolute inset-0 backdrop-blur-[16px]" style={{
        maskImage: "linear-gradient(0deg, rgba(0,0,0,0) 62.5%, #000 75%, #000 87.5%, rgba(0,0,0,0))",
        WebkitMaskImage: "linear-gradient(0deg, rgba(0,0,0,0) 62.5%, #000 75%, #000 87.5%, rgba(0,0,0,0))"
      }} />
      {/* Layer 6: Heaviest blur confined to the very top */}
      <div className="absolute inset-0 backdrop-blur-[32px]" style={{
        maskImage: "linear-gradient(0deg, rgba(0,0,0,0) 75%, #000 87.5%, #000)",
        WebkitMaskImage: "linear-gradient(0deg, rgba(0,0,0,0) 75%, #000 87.5%, #000)"
      }} />
    </div>
  );
};
