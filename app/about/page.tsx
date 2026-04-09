import { Navbar } from "@/components/Navbar";
import Image from "next/image";
import { Linkedin, Mail } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen w-full bg-[#F4F4F0] text-zinc-950 font-sans selection:bg-black selection:text-white">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16 pt-12 md:pt-20 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left: Portrait Image Placeholder */}
          <div className="lg:col-span-5 w-full aspect-[3/4] bg-black/5 rounded-[20px] overflow-hidden relative shadow-sm">
             {/* Replace with your actual portrait later */}
             <Image 
                src="/craftapp/hero.png" 
                alt="Portrait Placeholder" 
                fill 
                className="object-cover grayscale mix-blend-multiply opacity-50" 
                priority 
             />
          </div>

          {/* Right: Intro & Meta Grid */}
          <div className="lg:col-span-7 flex flex-col gap-12 pt-4">
             {/* Intro Text */}
             <div className="flex flex-col gap-6">
                <h1 className="text-5xl md:text-6xl lg:text-[72px] font-poppins font-bold tracking-tight text-black/85 leading-[1.1] mb-0">
                  Hello, I&apos;m Asil.
                </h1>
                <p className="text-2xl md:text-3xl lg:text-[32px] font-sans font-medium text-black/30 leading-[1.5]">
                  I am a Product Designer with a knack for bringing clarity and structure through visual design, storytelling, and high-velocity output.
                </p>
             </div>

             {/* 2x2 Meta Grid */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-4">
               <div>
                 <span className="text-base lg:text-[18px] font-sans font-extrabold text-black/85 leading-[1.6] mb-2 block">
                   Currently
                 </span>
                 <span className="text-base lg:text-[18px] font-sans font-semibold text-black/30 block leading-[1.7]">
                   Senior UX/UI Designer<br/>at Enpal
                 </span>
               </div>
               <div>
                 <span className="text-base lg:text-[18px] font-sans font-extrabold text-black/85 leading-[1.6] mb-2 block">
                   Previously
                 </span>
                 <span className="text-base lg:text-[18px] font-sans font-semibold text-black/30 block leading-[1.7]">
                   UX/UI Designer at Enpal<br/>Junior UX/UI Designer at Skill Yoga
                 </span>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. MY SUPER POWERS (Dark Section) */}
      <section className="w-full bg-[#252525] py-20 lg:py-32">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16 grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Section Title */}
          <div className="md:col-span-4">
              <h2 className="text-3xl lg:text-[36px] font-sans font-extrabold tracking-tight text-white/85 mb-0 leading-[1.2]">
                 My super<br/>
                 <span className="text-white/30">powers</span>
              </h2>
          </div>

          {/* Section Content */}
          <div className="md:col-span-8 flex flex-col gap-12 pt-2">
             <div className="flex flex-col gap-2">
                <h3 className="text-base lg:text-[18px] font-sans font-extrabold text-white/85 leading-[1.6]">
                  Workshop Facilitation
                </h3>
                <p className="text-base lg:text-[18px] font-sans font-semibold text-white/45 leading-[1.7]">
                  I bring together stakeholders, engineers, and product managers to align on complex problems. Through structured workshops, I ensure we&apos;re solving the right problems before we even open Figma.
                </p>
             </div>
             
             <div className="flex flex-col gap-2">
                <h3 className="text-base lg:text-[18px] font-sans font-extrabold text-white/85 leading-[1.6]">
                  Flow Diagrams & Architecture
                </h3>
                <p className="text-base lg:text-[18px] font-sans font-semibold text-white/45 leading-[1.7]">
                  I love diving into messy, heavily-constrained operational problems. I translate dense workflows into clear, structural flow diagrams that build the foundation for fluid, consumer-grade experiences.
                </p>
             </div>

             <div className="flex flex-col gap-2">
                <h3 className="text-base lg:text-[18px] font-sans font-extrabold text-white/85 leading-[1.6]">
                  User Research
                </h3>
                <p className="text-base lg:text-[18px] font-sans font-semibold text-white/45 leading-[1.7]">
                  I don&apos;t just draw flat rectangles. I go into the field to observe users, test prototypes, and validate assumptions. Real insights drive my design decisions to ensure we&apos;re building tools people actually want to use.
                </p>
             </div>
          </div>
        </div>
      </section>

      {/* 3. EXPERIENCE SECTION */}
      <section className="w-full bg-[#F4F4F0] py-20 lg:py-32">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16 grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Section Title */}
          <div className="md:col-span-4">
             <h2 className="text-3xl lg:text-[36px] font-sans font-extrabold tracking-tight text-black/85 mb-0 leading-[1.2]">
                Experience
             </h2>
          </div>

          {/* Section Content (Timeline) */}
          <div className="md:col-span-8 flex flex-col gap-12 pt-2">
             
             {/* Job 1 */}
             <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-8">
                <div className="sm:col-span-4 flex flex-col">
                   <h3 className="text-base lg:text-[18px] font-sans font-extrabold text-black/85 leading-[1.6]">
                      Enpal
                   </h3>
                   <span className="text-sm font-sans font-semibold text-black/30">2021 &ndash; Present</span>
                </div>
                <div className="sm:col-span-8">
                   <h4 className="text-base lg:text-[18px] font-sans font-extrabold text-black/85 leading-[1.6] mb-2">
                      Senior UX/UI Designer / UX/UI Designer
                   </h4>
                   <p className="text-base lg:text-[18px] font-sans font-semibold text-black/45 leading-[1.7]">
                      Specialising in SaaS product design for customer acquisition and operational efficiency. Designed the Sales OS to optimize sales workflows and CraftOS to improve field team performance and simplify installation documentation.
                   </p>
                </div>
             </div>

             {/* Job 2 */}
             <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-8 mt-4">
                <div className="sm:col-span-4 flex flex-col">
                   <h3 className="text-base lg:text-[18px] font-sans font-extrabold text-black/85 leading-[1.6]">
                      Skill Yoga
                   </h3>
                   <span className="text-sm font-sans font-semibold text-black/30">Apr 2021 &ndash; Sep 2021</span>
                </div>
                <div className="sm:col-span-8">
                   <h4 className="text-base lg:text-[18px] font-sans font-extrabold text-black/85 leading-[1.6] mb-2">
                      Junior UX/UI Designer
                   </h4>
                   <p className="text-base lg:text-[18px] font-sans font-semibold text-black/45 leading-[1.7]">
                      Focused on building better onboarding flows, applying user research and structuring application flow diagrams.
                   </p>
                </div>
             </div>

             {/* Job 3 */}
             <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-8 mt-4">
                <div className="sm:col-span-4 flex flex-col">
                   <h3 className="text-base lg:text-[18px] font-sans font-extrabold text-black/85 leading-[1.6]">
                      Urban AR Productions
                   </h3>
                   <span className="text-sm font-sans font-semibold text-black/30">Nov 2019 &ndash; Mar 2020</span>
                </div>
                <div className="sm:col-span-8">
                   <h4 className="text-base lg:text-[18px] font-sans font-extrabold text-black/85 leading-[1.6] mb-2">
                      UX/UI Designer
                   </h4>
                   <p className="text-base lg:text-[18px] font-sans font-semibold text-black/45 leading-[1.7]">
                      Interface and interaction design of the &quot;Augmented Reality App - Karla&quot; to playback audio stories. Conducted briefing sessions with stakeholders and defined the core assignment and potential audience.
                   </p>
                </div>
             </div>

          </div>
        </div>
      </section>

      {/* 4. HORIZONTAL GALLERY BREAK */}
      <section className="w-full relative py-12 md:py-20 overflow-hidden bg-white mt-12 mb-12">
         {/* Simple CSS scrolling or flex row gallery fake wrapper */}
         <div className="max-w-[1400px] mx-auto px-6 h-[300px] md:h-[400px] flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
            
            <div className="flex-none w-[80vw] sm:w-[400px] h-full bg-zinc-200 rounded-[20px] relative snap-center overflow-hidden">
               <Image src="/craftapp/scaffolding.png" alt="Gallery Placeholder 1" fill className="object-cover" />
            </div>
            
            <div className="flex-none w-[80vw] sm:w-[500px] h-full bg-zinc-300 rounded-[20px] relative snap-center overflow-hidden">
               <Image src="/craftapp/hero.png" alt="Gallery Placeholder 2" fill className="object-cover" />
            </div>
            
            <div className="flex-none w-[80vw] sm:w-[350px] h-full bg-zinc-200 rounded-[20px] relative snap-center overflow-hidden">
               <Image src="/craftapp/design_brief.png" alt="Gallery Placeholder 3" fill className="object-cover" />
            </div>

            <div className="flex-none w-[80vw] sm:w-[450px] h-full bg-zinc-300 rounded-[20px] relative snap-center flex flex-col gap-3 items-center justify-center">
               <span className="text-black/30 font-bold tracking-widest text-sm uppercase">More out of office on</span>
               <a href="https://www.instagram.com/lasipalte/" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-white text-black font-extrabold font-sans rounded-full shadow-sm hover:shadow-md transition-all hover:scale-105 inline-block text-lg">
                 @lasipalte
               </a>
            </div>

         </div>
      </section>

      {/* 5. FEATURED / EXTRAS */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16 pt-12 pb-32 grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          <div className="md:col-span-4">
              <h2 className="text-3xl lg:text-[36px] font-sans font-extrabold tracking-tight text-black/85 mb-0 leading-[1.2]">
                Writing &<br/>
                <span className="text-black/30">Features</span>
              </h2>
          </div>
          <div className="md:col-span-8 flex flex-col gap-12 pt-2">
             <div className="flex flex-col gap-2 border-b border-black/5 pb-8">
                <a href="#" className="group flex flex-col gap-2">
                   <h3 className="text-base lg:text-[18px] font-sans font-extrabold text-black/85 group-hover:text-[#0c6747] transition-colors leading-[1.6]">
                     Designing for the Field: Real-world UX
                   </h3>
                   <p className="text-base lg:text-[18px] font-sans font-semibold text-black/45 leading-[1.7]">
                     An article dissecting the complexities of designing apps for outdoor, high-glare environments.
                   </p>
                </a>
             </div>
             <div className="flex flex-col gap-2 border-b border-black/5 pb-8">
                <a href="#" className="group flex flex-col gap-2">
                   <h3 className="text-base lg:text-[18px] font-sans font-extrabold text-black/85 group-hover:text-[#0c6747] transition-colors leading-[1.6]">
                     UX Collective Spotlight
                   </h3>
                   <p className="text-base lg:text-[18px] font-sans font-semibold text-black/45 leading-[1.7]">
                     Featured interview covering my transition from architecture into digital product design.
                   </p>
                </a>
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
