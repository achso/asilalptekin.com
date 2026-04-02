import { Navbar } from "@/components/Navbar";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { projects } from "@/data/projects";
import Image from "next/image";
import { ImageZoom } from "@/components/ImageZoom";

export default function CraftAppCaseStudy() {
  const nextProject = projects.find((p) => p.slug !== "craftapp") || projects[1] || projects[0];

  return (
    <div className="min-h-screen w-full bg-[#F1F1ED] text-zinc-950 font-sans selection:bg-black selection:text-white pb-32">
      <Navbar />

      {/* 1. HOOK & CONTEXT */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16 pt-0 md:pt-2 pb-24">
        {/* Rounded Hero Box (Figma Spec) */}
        <div className="w-full aspect-[16/9] md:aspect-[2/1] bg-white rounded-[20px] mb-12 shadow-sm relative overflow-hidden">
          <Image src="/craftapp/hero.png" alt="Hero background" fill className="object-cover" priority />
        </div>

        <div className="flex flex-col gap-[20px] w-full">
          {/* Titles */}
          <div className="max-w-[700px]">
             <h1 className="text-4xl lg:text-[40px] font-poppins font-bold tracking-tight text-[#212529] leading-[1.5] mb-0">
               CraftApp
             </h1>
             <p className="text-2xl md:text-3xl lg:text-[36px] font-sans font-medium text-black/40 leading-[1.5]">
               A conversational technician app that fixed an unnoticed compliance chain.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
            {/* Left Content */}
            <div className="md:col-span-8 flex flex-col gap-[28px]">
               <p className="text-base lg:text-[18px] font-sans font-semibold leading-[1.7] text-black/40">
                 Field operations tools are usually built by people who&apos;ve never been to a field. I wanted to understand what it actually felt like to do this job — the physical constraints, the waiting, the frustration of not knowing if your work was good enough. That shaped every decision I made.
               </p>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-10">
                 <div>
                   <h3 className="text-base lg:text-[18px] font-sans font-extrabold text-black leading-[1.6] mb-1">Problem</h3>
                   <p className="text-base lg:text-[18px] font-sans font-semibold text-black/40 leading-[1.7]">
                     Installation crews take pride in their work. But as Enpal scaled, a broken documentation loop meant that pride didn&apos;t always translate into a completed job. Work got rejected, crews went back to redo, and growth started costing more than it should.
                   </p>
                 </div>
                 <div>
                   <h3 className="text-base lg:text-[18px] font-sans font-extrabold text-black leading-[1.6] mb-1">Outcome</h3>
                   <p className="text-base lg:text-[18px] font-sans font-semibold text-black/40 leading-[1.7]">
                     First-time-correct rate in task approvals went from 65% to 95%. QA cycles improved 3x. Technicians adopted it without being pushed. Company revenue increased in millions of Euros.
                   </p>
                 </div>
               </div>
            </div>

            {/* Right Meta Data */}
            <div className="md:col-span-4 flex flex-col gap-4 md:pl-4">
              <div>
                <span className="text-base lg:text-[18px] font-sans font-extrabold text-black leading-[1.6] mb-1 block">Role</span>
                <span className="text-base lg:text-[18px] font-sans font-semibold text-black/40 block leading-[1.7]">Foundational designer,<br/>end to end</span>
              </div>
              <div>
                <span className="text-base lg:text-[18px] font-sans font-extrabold text-black leading-[1.6] mb-1 block">Timeline</span>
                <span className="text-base lg:text-[18px] font-sans font-semibold text-black/40 block leading-[1.7]">Sep 21 - May 22</span>
              </div>
              <div>
                <span className="text-base lg:text-[18px] font-sans font-extrabold text-black leading-[1.6] mb-1 block">Platform</span>
                <span className="text-base lg:text-[18px] font-sans font-semibold text-black/40 block leading-[1.7]">Android</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DESIGN BRIEF */}
      <section className="w-full">
        {/* Full Wide Context Image */}
        <div className="w-full h-[40vh] md:h-[60vh] bg-zinc-200 relative mb-[-1px]">
           <Image src="/craftapp/design_brief.png" alt="Office desk with phone and solar panel view" fill className="object-cover" />
        </div>
        
        {/* Dark Brief Content */}
        <div className="w-full bg-[#252525] py-20 lg:py-32">
          <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16 grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
            {/* Left Column */}
            <div className="flex flex-col">
              <h2 className="text-3xl lg:text-[36px] font-sans font-extrabold tracking-tight text-white mb-0 leading-[1.2]">
                Design brief
              </h2>
              <p className="text-3xl lg:text-[36px] font-sans font-extrabold tracking-tight text-white/50 leading-[1.2] mb-2 md:mb-5">
                Fix field documentation loop via CraftApp
              </p>
              <p className="text-base lg:text-[18px] font-sans font-semibold text-white/40 leading-[1.7] pr-12">
                How might we build a mobile tool that crews trust enough to actually use — and that gets work approved correctly the first time?
              </p>
            </div>
            
            {/* Right Column: Numbered List */}
            <div className="flex flex-col gap-10 pt-2">
              <div className="flex flex-col gap-1">
                <h3 className="text-base lg:text-[18px] font-sans font-extrabold text-white leading-[1.6] flex items-baseline">
                  <span className="w-10 flex-shrink-0">01</span>
                  <span>Conversational approval flow</span>
                </h3>
                <p className="text-base lg:text-[18px] font-sans font-semibold text-white/40 leading-[1.7] pl-10">
                  How do we turn a stressful QA wait into a real-time dialogue between the field and the office?
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-base lg:text-[18px] font-sans font-extrabold text-white leading-[1.6] flex items-baseline">
                  <span className="w-10 flex-shrink-0">02</span>
                  <span>One-handed field interface</span>
                </h3>
                <p className="text-base lg:text-[18px] font-sans font-semibold text-white/40 leading-[1.7] pl-10">
                  How do we make documentation feel like part of the job rather than an interruption to it?
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-base lg:text-[18px] font-sans font-extrabold text-white leading-[1.6] flex items-baseline">
                  <span className="w-10 flex-shrink-0">03</span>
                  <span>Structured rejection communication</span>
                </h3>
                <p className="text-base lg:text-[18px] font-sans font-semibold text-white/40 leading-[1.7] pl-10">
                  How do we make sure a technician always knows exactly what to fix — regardless of what the QM wrote?
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. USER RESEARCH */}
      <section className="w-full bg-[#F1F1ED]">
        <div className="w-full py-20 lg:py-32">
          <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16 grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
            {/* Left Column */}
            <div className="flex flex-col">
              <h2 className="text-3xl lg:text-[36px] font-sans font-extrabold tracking-tight text-[#212529] mb-2 leading-[1.2]">
                User research
                <br />
                <span className="text-[#212529]/40">process & plan</span>
              </h2>
              <p className="text-base lg:text-[18px] font-sans font-semibold text-black/40 leading-[1.7] lg:pr-12">
                Research spanned multiple visits across two branches, combining observation with direct conversation. The goal was to understand how the field actually worked — not how HQ assumed it did.
              </p>
            </div>
            
            {/* Right Column: Numbered List */}
            <div className="flex flex-col gap-10 lg:gap-12 pt-2">
              <div className="flex flex-col gap-1">
                <h3 className="text-base lg:text-[18px] font-sans font-extrabold text-[#212529] leading-[1.6] flex items-baseline">
                  <span className="w-10 flex-shrink-0">01</span>
                  <span>Observatory field trips</span>
                </h3>
                <p className="text-base lg:text-[18px] font-sans font-semibold text-black/40 leading-[1.7] pl-10">
                  I joined EMG crews across Brandenburg and Erfurt — present at installation from setup through pack-up. A visit meant driving from Berlin to different branches specifically to compare how a second branch operated. These trips were the foundation of everything that followed.
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-base lg:text-[18px] font-sans font-extrabold text-[#212529] leading-[1.6] flex items-baseline">
                  <span className="w-10 flex-shrink-0">02</span>
                  <span>Branch & stakeholder interviews</span>
                </h3>
                <p className="text-base lg:text-[18px] font-sans font-semibold text-black/40 leading-[1.7] pl-10">
                  At each branch I spoke with Branch Leads and Project Leads about performance, team structures, and operational pressure points. This surfaced the branch KPIs, the escalation problem, and the gap between how HQ assumed teams worked and how they actually did.
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-base lg:text-[18px] font-sans font-extrabold text-[#212529] leading-[1.6] flex items-baseline">
                  <span className="w-10 flex-shrink-0">03</span>
                  <span>Semi-structured interviews</span>
                </h3>
                <p className="text-base lg:text-[18px] font-sans font-semibold text-black/40 leading-[1.7] pl-10">
                  I interviewed monteurs and Quality Managers — the two roles at the centre of the documentation loop. With technicians I explored their daily workflow and what rejection felt like in practice. With QMs I focused on how they reviewed submissions and what happened when clarification was needed. These conversations revealed the shadow network, the cherry-picking problem, and the dignity tension underneath the FTC metric.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. USER RESEARCH RESULTS */}
      <section className="w-full">
        {/* Full Wide Context Image */}
        <div className="w-full h-[40vh] md:h-[60vh] bg-zinc-200 relative mb-[-1px]">
           <Image src="/craftapp/scaffolding.png" alt="Scaffolding on roof" fill className="object-cover" />
        </div>
        
        {/* Dark Dark Content */}
        <div className="w-full bg-[#252525] py-20 lg:py-32">
          <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16 grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
            {/* Left Column */}
            <div className="flex flex-col">
              <h2 className="text-3xl lg:text-[36px] font-sans font-extrabold tracking-tight text-white mb-2 leading-[1.2]">
                User research
                <br />
                <span className="text-white/50">results & insights</span>
              </h2>
              <p className="text-base lg:text-[18px] font-sans font-semibold text-white/40 leading-[1.7] lg:pr-12">
                The field and the office were solving the same problem in completely different ways — and neither knew what the other was doing.
              </p>
              
              <ImageZoom 
                 src="/craftapp/researchinsights.png" 
                 alt="Research insights data table" 
                 width={1000} 
                 height={800} 
                 className="w-full h-auto"
                 containerClassName="w-full mt-8 rounded-[4px] overflow-hidden shadow-2xl border border-white/5 bg-[#181614] hover:ring-2 hover:ring-white/20 transition-all duration-300" 
              />
            </div>
            
            {/* Right Column: Key Insights List */}
            <div className="flex flex-col gap-10 lg:gap-12 pt-2">
              <div className="flex flex-col gap-1">
                <h3 className="text-base lg:text-[18px] font-sans font-extrabold text-white leading-[1.6]">
                  &quot;We just use WhatsApp&quot;
                </h3>
                <p className="text-base lg:text-[18px] font-sans font-semibold text-white/40 leading-[1.7]">
                  Every branch had built its own shadow network of group chats with Project Leads to get work done. The official tool existed in name only. This wasn&apos;t resistance — it was a workaround that worked better.
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-base lg:text-[18px] font-sans font-extrabold text-white leading-[1.6]">
                  Technicians didn&apos;t know why they were rejected
                </h3>
                <p className="text-base lg:text-[18px] font-sans font-semibold text-white/40 leading-[1.7]">
                  QM feedback was freeform and inconsistent. The same photo could pass in one branch and fail in another. Technicians had no reliable signal for what &quot;good enough&quot; looked like.
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-base lg:text-[18px] font-sans font-extrabold text-white leading-[1.6]">
                  The team structure in the Airtable was wrong
                </h3>
                <p className="text-base lg:text-[18px] font-sans font-semibold text-white/40 leading-[1.7]">
                  HQ assumed fixed crews with fixed roles. In reality, monteurs moved between teams and electricians operated independently. The app was being designed for an organisation that didn&apos;t exist.
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-base lg:text-[18px] font-sans font-extrabold text-white leading-[1.6]">
                  QMs were choosing which submissions to review
                </h3>
                <p className="text-base lg:text-[18px] font-sans font-semibold text-white/40 leading-[1.7]">
                  Working from an open table, they could see all pending tasks at once. Simpler submissions got picked first. Complex ones waited — and technicians had no idea why. This had to be tackled in an adjacent project.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PROBLEM STATEMENT */}
      <section className="w-full bg-[#F1F1ED]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16 py-20 lg:py-32">
          <div className="max-w-[900px]">
             <h3 className="text-base lg:text-[18px] font-sans font-extrabold text-[#212529] block mb-6 leading-[1.6]">
               Problem statement
             </h3>
             <p className="text-2xl md:text-3xl lg:text-[36px] font-sans font-medium text-black/40 leading-[1.5]">
               EMG field technicians were completing installation work but failing to get it approved first time. How do we design a system that works on a rooftop, not just in an office — and fix the compliance chain that nobody could see?
             </p>
          </div>
        </div>
      </section>

      {/* 6. PERSONA TARIQ */}
      <section className="w-full bg-[#252525] py-20 lg:py-32">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16 flex flex-col gap-12 lg:gap-20">
          
          {/* Header Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">
             <h2 className="text-3xl lg:text-[36px] font-sans font-extrabold tracking-tight text-white leading-[1.2]">
               Introducing our<br/>
               <span className="text-white/50">persona &ndash; Tariq</span>
             </h2>
             <p className="text-base lg:text-[18px] font-sans font-semibold text-white/40 leading-[1.7] md:pt-4 pr-12 lg:pr-24">
               I&apos;ve created a persona to ground every design decision in research and clarify who we were designing for.
             </p>
          </div>

          {/* Persona Card (Asset) */}
          <ImageZoom 
            src="/craftapp/Tariq.png" 
            alt="Tariq Persona Profile Details" 
            width={1200} 
            height={600} 
            className="w-full h-auto rounded-[4px]" 
            containerClassName="w-full mt-4 md:mt-8 shadow-2xl hover:scale-[1.01] hover:shadow-white/5 transition-all duration-500 rounded-[4px]"
          />
        </div>
      </section>

      {/* 7. JOURNEY MAP */}
      <section className="w-full bg-[#F1F1ED] py-20 lg:py-32">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16 flex flex-col gap-12 lg:gap-16">
          
          {/* Header Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">
             <h2 className="text-3xl lg:text-[36px] font-sans font-extrabold tracking-tight text-[#212529] leading-[1.2]">
               Journey map<br/>
               <span className="text-[#212529]/40">for installation day</span>
             </h2>
             <p className="text-base lg:text-[18px] font-sans font-semibold text-black/40 leading-[1.7] md:pt-4 pr-12 lg:pr-12">
               I&apos;ve created a user journey map to align stakeholders and highlight pain points in the current installation and documentation experience.
             </p>
          </div>

          {/* Map Asset Document */}
          <ImageZoom 
            src="/craftapp/userjourney.png" 
            alt="Installation Day User Journey Map" 
            width={1600} 
            height={1200} 
            className="w-full h-auto" 
            containerClassName="w-full bg-white shadow-sm hover:shadow-md transition-shadow duration-300 relative"
          />

        </div>
      </section>

      {/* 8. UI SHOWCASE: Onboarding */}
      <section className="w-full bg-white">
        <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-8 py-20 lg:py-24 flex flex-col gap-12 lg:gap-16">
          <div className="max-w-2xl">
             <h3 className="text-2xl md:text-3xl lg:text-[36px] font-sans font-medium text-black/80 mb-4 leading-[1.5]">The Visual &quot;Pre-Flight&quot; Guide</h3>
             <p className="text-base lg:text-[18px] font-sans font-semibold text-black/40 leading-[1.7]">
               I designed a &quot;Smart Default&quot; entry flow presenting a high-contrast, visual-first guide before the native camera even triggers. This proactively establishes quality standards.
             </p>
          </div>
          <div className="w-full aspect-video bg-zinc-100 flex items-center justify-center border border-zinc-200 shadow-sm rounded-2xl overflow-hidden relative">
             <Image src="/craftapp/preflight.png" alt="Visual Pre-Flight Guide Screen" fill className="object-cover object-top" />
          </div>
        </div>
      </section>

      {/* 7. UI SHOWCASE: Documentation */}
      <section className="w-full bg-[#252525]">
        <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-8 py-20 lg:py-24 flex flex-col gap-12 lg:gap-16">
          <div className="max-w-2xl">
             <h3 className="text-2xl md:text-3xl lg:text-[36px] font-sans font-medium text-white/80 mb-4 leading-[1.5]">The Conversational Timeline</h3>
             <p className="text-base lg:text-[18px] font-sans font-semibold text-white/40 leading-[1.7]">
               Mirroring WhatsApp behavior, I constructed a real-time timeline where QA feedback instantly appears as a conversational bubble. The CTA is placed explicitly in the bottom thumb-zone.
             </p>
          </div>
          <div className="w-full flex justify-center mt-8">
             <div className="w-[320px] h-[693px] bg-zinc-800 flex items-center justify-center border-[12px] border-zinc-950 shadow-2xl rounded-[40px] overflow-hidden relative">
               <Image src="/craftapp/conversational.png" alt="Conversational Timeline Screen" fill className="object-cover" />
             </div>
          </div>
        </div>
      </section>
      
      {/* Massive Navigation Footer */}
      <Link href={`/work/${nextProject?.slug || ""}`} className="group block w-full bg-black text-white py-24 px-6 md:px-12 lg:px-24 transition-colors duration-500 ease-out relative">
         <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-baseline justify-between gap-12 relative z-10 w-full">
            <div className="flex flex-col gap-4">
              <span className="text-sm font-black uppercase tracking-widest text-white/40">Next Case Study</span>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none group-hover:text-white/70 transition-colors font-sans">
                {nextProject?.title?.split("—")[0].trim() || "Next"}
              </h2>
            </div>
            <div className="hidden md:flex flex-shrink-0 w-24 h-24 rounded-full border-2 border-white/20 items-center justify-center group-hover:bg-white group-hover:text-black group-hover:border-white transition-all duration-500 transform group-hover:scale-105">
               <ArrowRight className="w-8 h-8" />
            </div>
         </div>
      </Link>

    </div>
  );
}
