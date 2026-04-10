"use client";

import { Navbar } from "@/components/Navbar";
import Image from "next/image";
import { Linkedin, Mail } from "lucide-react";
import { MarqueeGallery } from "@/components/MarqueeGallery";

const containerClass = "max-w-[1376px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-[30px]";

export default function AboutPage() {
  return (
    <div id="editable-content" className="min-h-screen w-full bg-background text-foreground font-sans selection:bg-black selection:text-white">
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
              <h1 className="text-[64px] md:text-[80px] lg:text-[100px] leading-[0.85] tracking-[-0.02em] text-foreground">
                <span className="block font-[700] italic" style={{ fontFamily: "var(--font-script)" }}>
                  Hello, I&apos;m Asil
                </span>
                <span className="text-[18px] md:text-[20px] font-extrabold text-foreground/40 mt-4 block">
                  (ah-sil Alp-teh-kin)
                </span>
              </h1>
              <p className="text-[20px] md:text-[24px] lg:text-[28px] font-semibold text-foreground/60 leading-[1.4] max-w-[700px]">
                I am a Product Designer with a knack for bringing clarity and structure through visual design, storytelling, and high-velocity output.
              </p>
            </div>
            
            {/* Meta Grid (Inline with reference pattern) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-12 pt-12 border-t border-black/5">
              <div>
                <span className="label-text mb-3 block uppercase tracking-wider text-foreground">Currently</span>
                <p className="body-text text-foreground/50">
                  Senior UX/UI Designer<br/>at Enpal
                </p>
              </div>
              <div>
                <span className="label-text mb-3 block uppercase tracking-wider text-foreground">Previously</span>
                <p className="body-text text-foreground/50">
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
              <h3 className="label-text uppercase tracking-wider text-foreground">Complexity at Scale</h3>
              <p className="body-text text-foreground/50">
                I specialize in designing the hidden operating systems that power physical industries. From Sales OS to CraftOS, I turn deep operational bottlenecks into fluid, consumer-grade SaaS tools that recovered millions in revenue.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="label-text uppercase tracking-wider text-foreground">Workshop Facilitation</h3>
              <p className="body-text text-foreground/50">
                I bridge the gap between office assumptions and field realities. By facilitating workshops with engineers, QMs, and technicians, I ensure we&apos;re solving the right compliance loops before a single pixel is drawn.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="label-text uppercase tracking-wider text-foreground">Flow Architecture</h3>
              <p className="body-text text-foreground/50">
                I translate messy, multi-step manual processes into intuitive, non-blocking flow diagrams. My focus is on the &quot;Rooftop Reality&quot;—building mobile interfaces optimized for one-handed use in high-glare environments.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="label-text uppercase tracking-wider text-foreground">Technical Empathy</h3>
              <p className="body-text text-foreground/50">
                With a background in Full Stack development, I build design systems that speak the language of engineering. I bridge the divide between Figma and production, ensuring design integrity survives the build.
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
              <span className="label-text whitespace-nowrap uppercase tracking-wider text-foreground">2021&ndash;Now</span>
              <div className="sm:col-span-3 flex flex-col gap-2">
                <h3 className="text-[20px] font-extrabold text-foreground">Enpal</h3>
                <p className="body-text text-foreground/40 mb-2 italic">Senior Product Designer</p>
                <p className="body-text text-foreground/50">
                  Designing the backbone of Germany&apos;s leading solar platform. Created Sales OS to optimize customer acquisition and CraftOS to fix the multi-million euro compliance gap between rooftops and the home office by streamlining field documentation.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 md:gap-8">
              <span className="label-text whitespace-nowrap uppercase tracking-wider text-foreground">2021 (6mo)</span>
              <div className="sm:col-span-3 flex flex-col gap-2">
                <h3 className="text-[20px] font-extrabold text-foreground">Skill Yoga</h3>
                <p className="body-text text-foreground/40 mb-2 italic">UX/UI Designer</p>
                <p className="body-text text-foreground/50">
                  Streamlined the mobile onboarding logic for a global health-tech platform. Worked at the intersection of architecture and user research to reduce friction and build a foundational design system from the ground up.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 md:gap-8">
              <span className="label-text whitespace-nowrap uppercase tracking-wider text-foreground">2019&ndash;2020</span>
              <div className="sm:col-span-3 flex flex-col gap-2">
                <h3 className="text-[20px] font-extrabold text-foreground">Urban AR</h3>
                <p className="body-text text-foreground/40 mb-2 italic">UX/UI Designer</p>
                <p className="body-text text-foreground/50">
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
              <p className="label-text mb-1 uppercase tracking-wider text-foreground">2026</p>
              <h3 className="text-[24px] font-extrabold text-foreground mb-3">Portfolio Redesign: A Pixel Perfect Journey &rarr;</h3>
              <p className="body-text text-foreground/50">
                Documentation of the process of replicating high-end portfolio aesthetics while maintaining personal brand identity.
              </p>
            </div>
            <div className="group">
              <p className="label-text mb-1 uppercase tracking-wider text-foreground">2024</p>
              <h3 className="text-[24px] font-extrabold text-foreground mb-3">Designing for Solar: Field Research Insights &rarr;</h3>
              <p className="body-text text-foreground/50">
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
