"use client";

import { ProjectCard } from "@/components/ProjectCard";
import { HeroSlider } from "@/components/HeroSlider";
import { projects } from "@/data/projects";
import { Navbar } from "@/components/Navbar";
import { Linkedin, Mail } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      {/* Hero Section */}
      <div className="py-8 px-8 w-full relative overflow-hidden">
        {/* Localized dotted background pattern for Hero only */}
        <div 
          className="absolute inset-0 z-[-1] pointer-events-none opacity-80" 
          style={{
            backgroundImage: "radial-gradient(#9ca3af 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 100%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 100%, transparent 100%)"
          }} 
          aria-hidden="true"
        />
        <header className="flex flex-col min-[821px]:flex-row items-stretch justify-between gap-0 divide-y min-[821px]:divide-y-0 min-[821px]:divide-x divide-border">
          <div className="flex flex-col w-full min-[821px]:w-[60%] lg:w-[65%] py-12 min-[821px]:pr-12 lg:pr-16" style={{ position: "relative" }}>
            {/* Extra grain overlay on hero — matches taamannae.dev's intensified texture on heading */}
            {/* Extra grain overlay removed as it was overpowering. We rely on the global grain. */}
            <div className="text-[64px] lg:text-[84px] tracking-[-0.02em] leading-[0.85] mb-4">

              <div style={{ position: "relative" }}>
                {/* Layer 1: Blurred ghost — sits BEHIND, opacity 0.7 */}
                {/* Layer 1: Blurred ghost — sits BEHIND, opacity 0.7 */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "70%",
                    overflow: "hidden",
                    filter: "url('#hero-blur')",
                    opacity: 0.7,
                  }}
                >
                  <span
                    className="block text-foreground font-[700]"
                    style={{ fontFamily: "var(--font-script)" }}
                  >
                    Hello, I&apos;m Asil
                  </span>
                </div>
                {/* Layer 2: Sharp text on top */}
                <span
                  className="block text-black/85 font-[700]"
                  style={{ fontFamily: "var(--font-script)" }}
                >
                  Hello, I&apos;m Asil
                </span>
              </div>

              <HeroSlider />
            </div>
            
            <div className="flex flex-wrap gap-x-16 gap-y-6 mt-8 min-[821px]:mt-12">
              <a
                href="mailto:alptekin.contact@gmail.com"
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-bold text-[16px] hover:bg-[#0c6747] transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Mail size={18} />
                <span>Contact me</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col w-full min-[821px]:w-[40%] lg:w-[35%] items-start py-12 min-[821px]:pl-12 lg:pl-16">
            <div className="flex items-center gap-4 mb-6">
              <img 
                src="/avatar4.png" 
                alt="Profile avatar" 
                className="w-48 aspect-square rounded-[6px] object-cover object-[center_15%]"
              />
            </div>
            <p className="hero-subtitle">Nice to meet you!</p>
            <p className="body-text mb-6 max-w-2xl">
              I&apos;m a Senior UX Designer who loves design systems and building tools that simplify work. I spend my time turning complex problems into intuitive experiences—and when I&apos;m off the clock, I&apos;m usually in the studio making music or out taking photos.
            </p>
            <div className="flex items-center gap-5">
              <a
                href="https://www.linkedin.com/in/asil-alptekin/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-foreground/40 hover:text-[#0c6747] hover:bg-[#0c6747]/10 transition-all duration-[600ms] w-12 h-12 rounded-full flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>
        </header>
      </div>

      {/* Projects Grid */}
      <main className="px-8 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </main>

      <footer className="mt-20 px-8 py-8 w-full border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground font-medium uppercase tracking-wider">
        <p>© 2026 Asil Alptekin</p>
        <div className="flex gap-4 mt-4 sm:mt-0">
          <a
            href="https://www.linkedin.com/in/asil-alptekin/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-foreground text-background hover:bg-[#0c6747] transition-all duration-300 transform hover:scale-110 shadow-sm"
          >
            <Linkedin size={18} strokeWidth={2} />
          </a>
          <a
            href="mailto:alptekin.contact@gmail.com"
            aria-label="Email"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-foreground text-background hover:bg-[#0c6747] transition-all duration-300 transform hover:scale-110 shadow-sm"
          >
            <Mail size={18} strokeWidth={2} />
          </a>
        </div>
      </footer>
    </div>
  );
}
