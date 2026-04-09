"use client";

import { Navbar } from "@/components/Navbar";
import Image from "next/image";
import { Linkedin, Mail } from "lucide-react";
import { MarqueeGallery } from "@/components/MarqueeGallery";

const containerClass = "max-w-[1376px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-[30px]";

export default function AboutPage() {
  return (
    <div className="min-h-screen w-full bg-[#f1f1f1] text-[#212529] font-sans selection:bg-black selection:text-white">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="pt-32 md:pt-48 pb-20">
        <div className={containerClass}>
          {/* Left: Portrait (4 cols) */}
          <div className="md:col-span-4 mb-10 md:mb-0">
            <div className="w-full aspect-[4/5] md:aspect-[3/4] rounded-[20px] overflow-hidden relative shadow-sm bg-zinc-200">
               <Image 
                  src="/avatar4.png" 
                  alt="Asil Alptekin portrait" 
                  fill 
                  className="object-cover" 
                  priority 
               />
            </div>
          </div>

          {/* Right: Intro (8 cols) */}
          <div className="md:col-span-8 flex flex-col gap-8 md:pt-4">
            <div className="flex flex-col gap-6">
              <h1 className="text-[64px] md:text-[80px] lg:text-[100px] leading-[0.85] tracking-[-0.02em] text-black">
                <span className="block font-[700] italic" style={{ fontFamily: "var(--font-script)" }}>
                  Hello, I&apos;m Asil
                </span>
                <span className="text-[18px] md:text-[20px] font-[700] text-[#212529]/40 mt-4 block">
                  (ah-sil Alp-teh-kin)
                </span>
              </h1>
              <p className="text-[20px] md:text-[24px] lg:text-[28px] font-[600] text-[#212529]/60 leading-[1.4] max-w-[700px]">
                I am a Product Designer with a knack for bringing clarity and structure through visual design, storytelling, and high-velocity output.
              </p>
            </div>
            
            {/* Meta Grid (Inline with reference pattern) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-12 pt-12 border-t border-black/5">
              <div>
                <span className="text-[18px] font-[900] text-black mb-3 block uppercase tracking-wider">Currently</span>
                <p className="text-[18px] font-[600] text-[#212529]/50 leading-[1.6]">
                  Senior UX/UI Designer<br/>at Enpal
                </p>
              </div>
              <div>
                <span className="text-[18px] font-[900] text-black mb-3 block uppercase tracking-wider">Previously</span>
                <p className="text-[18px] font-[600] text-[#212529]/50 leading-[1.6]">
                  UX Designer at Skill Yoga<br/>Junior Designer at Urban AR
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SUPER POWERS */}
      <section className="py-24 md:py-32 border-t border-black/5">
        <div className={containerClass}>
          {/* Section title (4 cols) */}
          <div className="md:col-span-4 mb-8 md:mb-0">
            <h2 className="text-[32px] md:text-[40px] font-[900] text-black leading-none">
              My super<br/>
              <span className="text-black/30">powers</span>
            </h2>
          </div>
          {/* Section content (8 cols) */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
            <div className="flex flex-col gap-4">
              <h3 className="text-[18px] font-[900] text-black uppercase tracking-wider">Workshop Facilitation</h3>
              <p className="text-[18px] font-[600] text-[#212529]/50 leading-[1.6]">
                I bring stakeholders and engineers to align on complex problems. I ensure we&apos;re solving the right problems before we open Figma.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-[18px] font-[900] text-black uppercase tracking-wider">Flow Architecture</h3>
              <p className="text-[18px] font-[600] text-[#212529]/50 leading-[1.6]">
                I translate dense workflows into clear, structural flow diagrams that build the foundation for fluid, consumer-grade experiences.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-[18px] font-[900] text-black uppercase tracking-wider">User Research</h3>
              <p className="text-[18px] font-[600] text-[#212529]/50 leading-[1.6]">
                I go into the field to observe users and validate assumptions. Real insights drive my design decisions to ensure we&apos;re building the right tools.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-[18px] font-[900] text-black uppercase tracking-wider">Design Systems</h3>
              <p className="text-[18px] font-[600] text-[#212529]/50 leading-[1.6]">
                I build and maintain living design systems that enable teams to ship fast while maintaining a high bar for visual and functional consistency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MARQUEE GALLERY (Full Width) */}
      <section className="w-full">
        <MarqueeGallery />
      </section>

      {/* 4. EXPERIENCE SECTION */}
      <section className="py-24 md:py-32">
        <div className={containerClass}>
          {/* Section title (4 cols) */}
          <div className="md:col-span-4 mb-12 md:mb-0">
            <h2 className="text-[32px] md:text-[40px] font-[900] text-black leading-none">
              Experience
            </h2>
          </div>
          {/* Section content (8 cols) */}
          <div className="md:col-span-8 flex flex-col gap-16">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 md:gap-8">
              <span className="text-[18px] font-[900] text-black whitespace-nowrap uppercase tracking-wider">2021&ndash;Now</span>
              <div className="sm:col-span-3 flex flex-col gap-2">
                <h3 className="text-[20px] font-[900] text-black">Enpal</h3>
                <p className="text-[18px] font-[600] text-[#212529]/40 mb-2 italic">Senior Product Designer</p>
                <p className="text-[18px] font-[600] text-[#212529]/50 leading-[1.6]">
                  Designing the backbone of Germany&apos;s leading solar platform. Created Sales OS to optimize customer acquisition and CraftOS to fix the multi-million euro compliance gap between rooftops and the home office by streamlining field documentation.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 md:gap-8">
              <span className="text-[18px] font-[900] text-black whitespace-nowrap uppercase tracking-wider">2021 (6mo)</span>
              <div className="sm:col-span-3 flex flex-col gap-2">
                <h3 className="text-[20px] font-[900] text-black">Skill Yoga</h3>
                <p className="text-[18px] font-[600] text-[#212529]/40 mb-2 italic">UX/UI Designer</p>
                <p className="text-[18px] font-[600] text-[#212529]/50 leading-[1.6]">
                  Streamlined the mobile onboarding logic for a global health-tech platform. Worked at the intersection of architecture and user research to reduce friction and build a foundational design system from the ground up.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 md:gap-8">
              <span className="text-[18px] font-[900] text-black whitespace-nowrap uppercase tracking-wider">2019&ndash;2020</span>
              <div className="sm:col-span-3 flex flex-col gap-2">
                <h3 className="text-[20px] font-[900] text-black">Urban AR</h3>
                <p className="text-[18px] font-[600] text-[#212529]/40 mb-2 italic">UX/UI Designer</p>
                <p className="text-[18px] font-[600] text-[#212529]/50 leading-[1.6]">
                  Defined the interaction models for AR-driven storytelling. Transformed complex stakeholder visions into &quot;Karla,&quot; a spatial audio experience that connects physical history with digital interfaces.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WRITING & FEATURES (Placeholder for future) */}
      <section className="py-24 md:py-32 border-t border-black/5">
        <div className={containerClass}>
          <div className="md:col-span-4 mb-8 md:mb-0">
            <h2 className="text-[32px] md:text-[40px] font-[900] text-black leading-none">
              Writing &<br/>
              <span className="text-black/30">Features</span>
            </h2>
          </div>
          <div className="md:col-span-8 flex flex-col gap-12">
            <div className="group border-b border-black/5 pb-10">
              <p className="text-[18px] font-[900] text-black mb-1 uppercase tracking-wider">2026</p>
              <h3 className="text-[24px] font-[900] text-black mb-3">Portfolio Redesign: A Pixel Perfect Journey &rarr;</h3>
              <p className="text-[18px] font-[600] text-[#212529]/50 leading-[1.6]">
                Documentation of the process of replicating high-end portfolio aesthetics while maintaining personal brand identity.
              </p>
            </div>
            <div className="group">
              <p className="text-[18px] font-[900] text-black mb-1 uppercase tracking-wider">2024</p>
              <h3 className="text-[24px] font-[900] text-black mb-3">Designing for Solar: Field Research Insights &rarr;</h3>
              <p className="text-[18px] font-[600] text-[#212529]/50 leading-[1.6]">
                Spending time with solar installation crews in Brandenburg to build better operational tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-20 px-8 py-10 w-full border-t border-black/5 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground font-medium uppercase tracking-wider">
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
