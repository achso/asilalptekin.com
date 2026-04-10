import { Navbar } from "@/components/Navbar";
import { ArrowRight, Linkedin, Mail } from "lucide-react";
import Link from "next/link";
import { projects } from "@/data/projects";
import Image from "next/image";
import { ImageLightbox } from "@/components/ImageLightbox";

export default function CraftAppCaseStudy() {
  const nextProject = projects.find((p) => p.slug !== "craftapp") || projects[1] || projects[0];

  // Shared class for constrained content width — matches taamannae.dev container-1200 (1100px + 16px padding)
  const container = "w-full max-w-[1100px] mx-auto px-4";

  return (
    <div id="editable-content" className="min-h-screen w-full bg-[#f0eee9] text-zinc-950 font-sans selection:bg-black selection:text-white">
      <Navbar />

      {/* ─── 1. HERO + INTRO ─── */}
      <section className="w-full bg-[#f0eee9] pt-24 md:pt-32">
        {/* Hero image — constrained, sits just below navbar */}
        <div className={`${container}`}>
          <div className="w-full aspect-[2/1] rounded-[16px] md:rounded-[24px] overflow-hidden relative">
            <Image src="/craftapp/handheldsplash3.png" alt="CraftApp hero" fill className="object-cover" priority />
          </div>
        </div>

        {/* Intro */}
        <div className={`${container} pt-10 md:pt-14 pb-16 md:pb-24`}>
          <div className="mb-8 md:mb-10 max-w-[760px]">
            <h1 className="font-poppins font-extrabold text-[28px] md:text-[32px] text-black leading-tight">
              CraftApp
            </h1>
            <p className="font-sans font-medium text-[22px] md:text-[32px] lg:text-[36px] text-black/55 tracking-[0.36px] leading-[1.35]">
              A conversational mobile app for solar installation workers that fixed a compliance chain nobody could see.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
            <div className="flex-1 flex flex-col gap-8">
              <p className="font-sans font-semibold text-[16px] md:text-[18px] text-black/55 leading-[1.7] tracking-[0.18px]">
                Most tools for field workers are built by people who have never done field work. I wanted to understand what the job actually felt like. Before I opened Figma, I drove to Brandenburg and spent a full day on site with the installation teams. Everything I learned there shaped what I built.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="flex flex-col gap-1.5">
                  <p className="font-sans font-extrabold text-[18px] md:text-[20px] text-black/85">The Problem</p>
                  <p className="font-sans font-semibold text-[16px] md:text-[18px] text-black/55 leading-[1.6] tracking-[0.18px]">
                    As Enpal grew and new technicians were hired, more tasks were being rejected due to QA. Workers had to return to job sites and redo their documentation. Each callback cost time and money.
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="font-sans font-extrabold text-[18px] md:text-[20px] text-black/85">Outcome</p>
                  <p className="font-sans font-semibold text-[16px] md:text-[18px] text-black/55 leading-[1.6] tracking-[0.18px]">
                    The FTC rate went from 65% to 95%. Quality review cycles improved by 3x. Technicians started using the app without any training push. The reduction in rework translated directly to millions of euros in recovered revenue.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:flex lg:flex-col gap-y-10 gap-x-6 md:gap-8 lg:gap-5 lg:w-[180px] shrink-0">
              <div>
                <p className="font-sans font-extrabold text-[16px] md:text-[18px] text-black/85">Role</p>
                <p className="font-sans font-semibold text-[15px] md:text-[16px] text-black/55 leading-[1.6]">Foundational designer, end to end</p>
              </div>
              <div>
                <p className="font-sans font-extrabold text-[16px] md:text-[18px] text-black/85">Team</p>
                <p className="font-sans font-semibold text-[15px] md:text-[16px] text-black/55 leading-[1.6]">Senior Director Product, Product Manager, 6+ Engineers</p>
              </div>
              <div>
                <p className="font-sans font-extrabold text-[16px] md:text-[18px] text-black/85">Timeline</p>
                <p className="font-sans font-semibold text-[15px] md:text-[16px] text-black/55 leading-[1.6]">Sep 21 – May 22</p>
              </div>
              <div>
                <p className="font-sans font-extrabold text-[16px] md:text-[18px] text-black/85">Platform</p>
                <p className="font-sans font-semibold text-[15px] md:text-[16px] text-black/55 leading-[1.6]">Android, Flutter</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. FULL-WIDTH IMAGE ─── */}
      <div className="w-full aspect-[3538/1280] relative overflow-hidden mb-[-16px]" style={{ clipPath: "inset(0 0 16px 0)" }}>
        <Image src="/craftapp/panocraft1-Recovered.png" alt="CraftApp panoramic view" fill className="object-cover" />
      </div>

      {/* ─── 3. DESIGN BRIEF ─── #252525 */}
      <section className="w-full bg-[#252525] py-16 md:py-[80px]">
        <div className={container}>
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            <div className="flex flex-col gap-4 lg:w-[42%] shrink-0">
              <div className="leading-[1.25]">
                <h2 className="font-sans font-extrabold text-[28px] md:text-[36px] text-white/95">Design brief</h2>
                <p className="font-sans font-semibold text-[28px] md:text-[36px] text-white/70 tracking-[0.36px]">
                  Fix field documentation loop via CraftApp
                </p>
              </div>
              <p className="font-sans font-semibold text-[15px] md:text-[18px] text-white/70 leading-[1.6] tracking-[0.18px]">
                We should build a mobile tool that installation teams trust enough to actually use, and that gets work approved correctly the first time.
              </p>
            </div>
            <div className="flex-1 flex flex-col gap-8 md:gap-10">
              {[
                { n: "01", title: "Adoption must be tackled", body: "How do we turn a stressful wait into a live conversation between the field and the office?" },
                { n: "02", title: "Working conditions should be considered", body: "How do we make documenting work feel like a natural part of the job, not something added on top of it?" },
                { n: "03", title: "Empathetic communication", body: "How do we make sure a technician always knows what to do when their submission is rejected, so they can fix it the same day without a second trip?" },
              ].map(({ n, title, body }) => (
                <div key={n} className="flex gap-4 md:gap-5 items-start">
                  <p className="font-sans font-extrabold text-[16px] md:text-[18px] text-white/95 shrink-0 w-8">{n}</p>
                  <div className="flex flex-col gap-1.5">
                    <p className="font-sans font-extrabold text-[16px] md:text-[18px] text-white/95">{title}</p>
                    <p className="font-sans font-semibold text-[15px] md:text-[18px] text-white/70 leading-[1.6] tracking-[0.18px]">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. USER RESEARCH — PROCESS & PLAN ─── #f0eee9 */}
      <section className="w-full bg-[#f0eee9] py-16 md:py-[80px]">
        <div className={container}>
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            <div className="flex flex-col gap-3 lg:w-[42%] shrink-0">
              <div className="leading-[1.25]">
                <p className="font-sans font-bold text-[28px] md:text-[36px] text-black/85">User research</p>
                <p className="font-sans font-bold text-[28px] md:text-[36px] text-black/55">process &amp; plan</p>
              </div>
              <p className="font-sans font-semibold text-[15px] md:text-[18px] text-black/55 leading-[1.6] tracking-[0.18px]">
                I visited two branches and spent time with the teams on site. The goal was to see how the work actually happened, to validate what the office  believed.
              </p>
            </div>
            <div className="flex-1 flex flex-col gap-8 md:gap-10">
              {[
                { n: "01", title: "Observatory field visits", body: "I joined installation crews in Brandenburg and Erfurt from early morning until the day was done. I drove to different branches specifically to compare how they operated differently. These visits became the foundation of everything." },
                { n: "02", title: "Branch & stakeholder interviews", body: "At each branch office I spoke with branch managers and project leads about targets, pressure points, and team structure. The gap between what HQ assumed and what actually happened on the ground was larger than anyone had acknowledged." },
                { n: "03", title: "Semi-structured interviews", body: "I spoke with teams and quality managers, those are the two people at the centre of this broken loop. With technicians I explored what rejections were handled in practice. With quality managers I focused on how they chose submissions and what happened when clarification was needed. " },
              ].map(({ n, title, body }) => (
                <div key={n} className="flex gap-4 md:gap-5 items-start">
                  <p className="font-sans font-extrabold text-[16px] md:text-[18px] text-black/85 shrink-0 w-8">{n}</p>
                  <div className="flex flex-col gap-1.5">
                    <p className="font-sans font-extrabold text-[16px] md:text-[18px] text-black/85">{title}</p>
                    <p className="font-sans font-semibold text-[15px] md:text-[18px] text-black/55 leading-[1.6] tracking-[0.18px]">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. RESEARCH IMAGE ─── */}
      <div className="w-full aspect-[2880/1200] overflow-hidden relative">
        <Image src="/craftapp/frustratedtariq2.png" alt="Frustrated technician in the field" fill className="object-cover" />
      </div>

      {/* ─── 6. RESEARCH INSIGHTS ─── #f0eee9 */}
      <section className="w-full bg-[#f0eee9] py-16 md:py-[80px]">
        <div className={container}>
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            <div className="flex flex-col gap-3 lg:w-[42%] shrink-0">
              <div className="leading-[1.25]">
                <p className="font-sans font-extrabold text-[28px] md:text-[36px] text-black/85">User research</p>
                <p className="font-sans font-semibold text-[28px] md:text-[36px] text-black/55 tracking-[0.36px]">results &amp; insights</p>
              </div>
              <p className="font-sans font-semibold text-[15px] md:text-[18px] text-black/55 leading-[1.6] tracking-[0.18px]">
                The field teams and the office were each trying to solve the same problem in completely different ways. Neither side knew what the other was doing.
              </p>
              <ImageLightbox src="/craftapp/research-insights.png" alt="Research insights">
                <div className="mt-4 w-full aspect-[1960/1654] rounded-[8px] overflow-hidden relative">
                  <Image src="/craftapp/research-insights.png" alt="Research insights" fill className="object-cover" />
                </div>
              </ImageLightbox>
            </div>
            <div className="flex-1 flex flex-col gap-8 md:gap-10">
              {[
                { title: "\u201cWe just use WhatsApp\u201d", body: "Every branch had built its own network of group chats with project leads. The official tool existed in name only \u2014 workers weren\u2019t resisting it out of laziness. They had already found something that worked better." },
                { title: "Technicians didn\u2019t know why they were rejected", body: "Quality manager feedback was inconsistent and changed from branch to branch. The same photo could be accepted in one city and rejected in another. Technicians had no reliable signal for what good enough actually meant, and the FTC rate reflected that." },
                { title: "The team structure in the Airtable was wrong", body: "HQ assumed fixed teams. In practice, technicians moved between crews and electricians worked independently. The structure was being built for an organization that did not exist on the field." },
                { title: "QMs were choosing which submissions to review", body: "With all pending submissions visible at once, simpler ones were picked first. Complex work waited, sometimes for hours. Technicians had no idea their job type was the reason for the delay. This became a separate project workstream." },
              ].map(({ title, body }) => (
                <div key={title} className="flex flex-col gap-1.5">
                  <p className="font-sans font-extrabold text-[16px] md:text-[18px] text-black/85 leading-snug">{title}</p>
                  <p className="font-sans font-semibold text-[15px] md:text-[18px] text-black/55 leading-[1.6] tracking-[0.18px]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7 & 8. PROBLEM STATEMENT & THREE QUESTIONS ─── merged ─── #252525 */}
      <section className="w-full bg-[#252525] py-16 md:py-[80px]">
        <div className={`${container} flex flex-col gap-10 md:gap-14`}>
          {/* Problem Statement block */}
          <div className="flex flex-col gap-4">
            <p className="font-sans font-extrabold text-[15px] md:text-[16px] text-white/50 uppercase tracking-wider">Problem statement</p>
            <p className="font-sans font-semibold text-[15px] md:text-[18px] text-white/70 leading-[1.6] tracking-[0.18px]">
              EMG installation technicians were completing high-quality work but failing to get it approved on the first try. The tools they had were built for desks, not rooftops. Documentation moved to 3rd party tools because that is what actually worked. The approval chain was invisible, and the FTC rate showed it.
            </p>
          </div>

          {/* Three Questions group */}
          <div className="flex flex-col gap-10 md:gap-14">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-16 items-start">
              <div className="lg:w-full shrink-0">
                <div className="leading-[1.25]">
                  <p className="font-sans font-extrabold text-[28px] md:text-[42px] text-white/95">Three questions</p>
                  <p className="font-sans font-semibold text-[28px] md:text-[42px] text-white/70 tracking-[0.36px]">from the field</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
              {[
                { n: "HMW 01", title: "Make documentation part of the installation:", body: "How might we make taking photos and logging information feel like a natural step in the work, not something separate that gets in the way?" },
                { n: "HMW 02", title: "Bring real-time feedback into a compliant system:", body: "How might we give them the experience from messaging services inside a system the company could actually rely on?" },
                { n: "HMW 03", title: "Make rejection something a technician can act on:", body: "How might we make sure a technician always knows what to do when their submission is rejected, so they can fix it the same day without a second trip?" },
              ].map(({ n, title, body }) => (
                <div key={n} className="flex flex-col gap-2">
                  <p className="font-sans font-extrabold text-[15px] md:text-[16px] text-white/50">{n}</p>
                  <p className="font-sans font-extrabold text-[18px] md:text-[20px] text-white/95 leading-tight">{title}</p>
                  <p className="font-sans font-semibold text-[15px] md:text-[17px] text-white/70 leading-[1.6]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 9. THE STRATEGY ─── #f0eee9 */}
      <section className="w-full bg-[#f0eee9] py-16 md:py-[80px]">
        <div className={container}>
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            <div className="flex flex-col gap-3 lg:w-[42%] shrink-0">
              <div className="leading-[1.25]">
                <p className="font-sans font-extrabold text-[28px] md:text-[36px] text-black/85">The Strategy</p>
                <p className="font-sans font-semibold text-[28px] md:text-[36px] text-black/55 tracking-[0.36px]">that changed the loop</p>
              </div>
              <p className="font-sans font-semibold text-[15px] md:text-[18px] text-black/55 leading-[1.6] tracking-[0.18px]">
                User research revealed that the friction wasn't just technical; it was emotional. Technicians felt judged by a "black box" system, leading them to abandon official channels for the transparency of WhatsApp. To fix the loop, I established three core pillars for the interaction model.
              </p>
            </div>
            <div className="flex-1 flex flex-col gap-8 md:gap-10">
              {[
                { n: "01", title: "Make approval feel like a conversation", body: "Instead of a rigid submission-feedback loop, the UX should mimic the cadence of a conversation. Success meant moving away from \"forms\" and toward a \"thread\" mental model where information flows bi-directionally." },
                { n: "02", title: "Build for one hand on a rooftop", body: "The interface must respect the environment. I adopted a \"rooftop-first\" philosophy, prioritizing high-contrast legibility and single-thumb ergonomics to reduce the cognitive and physical load of field documentation." },
                { n: "03", title: "Structured communication", body: "To close the loop efficiently, feedback must be persistent, not ephemeral. My strategy focused on embedding reviewer insights directly into the capture workflow to prevent context-switching." },
              ].map(({ n, title, body }) => (
                <div key={n} className="flex flex-col gap-1.5">
                  <p className="font-sans font-extrabold text-[16px] md:text-[18px] text-black/85">{n}</p>
                  <p className="font-sans font-extrabold text-[16px] md:text-[18px] text-black/85">{title}</p>
                  <p className="font-sans font-semibold text-[15px] md:text-[18px] text-black/55 leading-[1.6] tracking-[0.18px]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 10. MEET TARIQ ─── #252525 */}
      <section className="w-full bg-[#252525] py-16 md:py-[80px]">
        <div className={`${container} flex flex-col gap-10 md:gap-14`}>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-16 items-start">
            <div className="lg:w-[42%] shrink-0">
              <div className="leading-[1.25]">
                <p className="font-sans font-extrabold text-[28px] md:text-[36px] text-white/95">Meet Tariq the Monteur</p>
                <p className="font-sans font-semibold text-[28px] md:text-[36px] text-white/70 tracking-[0.36px]">from on site research</p>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-sans font-semibold text-[15px] md:text-[18px] text-white/70 leading-[1.6] tracking-[0.18px]">
                Tariq is a solar panel installer at EMG Brandenburg. He moves between teams and works multiple jobs a week. He is very good at this work and he knows it. He does not think of himself as a technology user. His phone is a tool, the same as his drill.
              </p>
            </div>
          </div>
          <ImageLightbox src="/craftapp/persona-tariq.png" alt="Tariq the Monteur persona">
            <div className="w-full aspect-[2362/1214] rounded-[8px] overflow-hidden relative">
              <Image src="/craftapp/persona-tariq.png" alt="Tariq the Monteur persona" fill className="object-cover" />
            </div>
          </ImageLightbox>
        </div>
      </section>

      {/* ─── 11. JOURNEY MAP ─── #f0eee9 */}
      <section className="w-full bg-[#f0eee9] py-16 md:py-[80px]">
        <div className={`${container} flex flex-col gap-10 md:gap-12`}>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-16 items-start">
            <div className="lg:w-[42%] shrink-0">
              <div className="leading-[1.25]">
                <p className="font-sans font-bold text-[28px] md:text-[36px] text-black/85">A day in the field</p>
                <p className="font-sans font-bold text-[28px] md:text-[36px] text-black/55">before CraftApp</p>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-sans font-semibold text-[15px] md:text-[18px] text-black/55 leading-[1.6] tracking-[0.18px]">
                I mapped to show stakeholders where the experience broke down and where there was room to improve it.
              </p>
            </div>
          </div>
          <ImageLightbox src="/craftapp/journey-map.png" alt="A day in the field — journey map">
            <div className="w-full aspect-[2940/3180] rounded-[8px] overflow-hidden relative">
              <Image src="/craftapp/journey-map.png" alt="A day in the field — journey map" fill className="object-cover" />
            </div>
          </ImageLightbox>
        </div>
      </section>

      {/* ─── 12. FROM THE ROOFTOP ─── #252525 */}
      <section className="w-full bg-[#252525] py-16 md:py-[80px]">
        <div className={`${container} flex flex-col gap-12 md:gap-16`}>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-16 items-start">
            <div className="lg:w-[42%] shrink-0">
              <div className="leading-[1.25]">
                <p className="font-sans font-extrabold text-[28px] md:text-[36px] text-white/95">From the Rooftop</p>
                <p className="font-sans font-semibold text-[28px] md:text-[36px] text-white/70 tracking-[0.36px]">to the Interface</p>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-sans font-semibold text-[15px] md:text-[18px] text-white/70 leading-[1.6] tracking-[0.18px]">
                Three constraints shaped the design library and every interface decision.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: "01", title: "One hand, always", body: "If an action requires two hands, it’s a failure. I optimized for the single thumb to keep the technician’s other hand free for their work." },
              { n: "02", title: "Readable in direct sunlight", body: "I prioritized high-contrast values and large-scale elements to ensure the UI stays functional in direct, reflective light." },
              { n: "03", title: "No black box moments", body: "I made sure every action has a clear, immediate response. By surfacing live status signals, I removed the guesswork and \"black box\" frustration from the user experience." },
            ].map(({ n, title, body }) => (
              <div key={n} className="flex flex-col gap-1.5">
                <p className="font-sans font-extrabold text-[16px] md:text-[18px] text-white/95">{n}</p>
                <p className="font-sans font-extrabold text-[16px] md:text-[18px] text-white/95">{title}</p>
                <p className="font-sans font-semibold text-[15px] md:text-[18px] text-white/70 leading-[1.6] tracking-[0.18px]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 13. LOW-FIDELITY LOGIC ─── #f0eee9 */}
      <section className="w-full bg-[#f0eee9] py-16 md:py-[80px]">
        <div className={`${container} flex flex-col gap-10 md:gap-12`}>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-16 items-start">
            <div className="lg:w-[42%] shrink-0">
              <div className="leading-[1.25]">
                <p className="font-sans font-bold text-[28px] md:text-[36px] text-black/85">Low-Fidelity Logic</p>
                <p className="font-sans font-bold text-[28px] md:text-[36px] text-black/55">flow before form</p>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-sans font-semibold text-[15px] md:text-[18px] text-black/55 leading-[1.6] tracking-[0.18px]">
                Before any visual decisions, I sketched the full app to answer one question. Could a technician move from choosing their team to submitting a photo without ever stopping to think about where to tap?
              </p>
            </div>
          </div>
          <ImageLightbox src="/craftapp/lofi-wireframes.png" alt="Low-fidelity wireframes">
            <div className="w-full rounded-[8px] overflow-hidden bg-[#f0eee9]">
              <Image src="/craftapp/lofi-wireframes.png" alt="Low-fidelity wireframes" width={2400} height={1080} className="w-full h-auto" />
            </div>
          </ImageLightbox>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: "01", title: "Two-tab task structure", body: "A How-to Guide tab and a Submission tab appeared in the first sketch. Reading and documenting are separate things. They should not compete for the same screen." },
              { n: "02", title: "Chapter status at a glance", body: "The chapter list needed to show more than names. Early sketches had simple checkmarks. The status ring system in the final design grew from that idea." },
              { n: "03", title: "Submission as a conversation", body: "Technicians already trusted Slack or Whatsapp for real work coordination. The submission screen needed to feel the same way. That decision was made in pencil, before Figma was opened." },
            ].map(({ n, title, body }) => (
              <div key={n} className="flex flex-col gap-1.5">
                <p className="font-sans font-extrabold text-[16px] md:text-[18px] text-black/85">{n}</p>
                <p className="font-sans font-extrabold text-[16px] md:text-[18px] text-black/85">{title}</p>
                <p className="font-sans font-semibold text-[15px] md:text-[18px] text-black/55 leading-[1.6] tracking-[0.18px]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 14. DESIGN SYSTEM ─── #252525 */}
      <section className="w-full bg-[#252525] py-16 md:py-[80px]">
        <div className={`${container} flex flex-col gap-10 md:gap-12`}>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-16 items-start">
            <div className="lg:w-[42%] shrink-0">
              <div className="leading-[1.25]">
                <p className="font-sans font-extrabold text-[28px] md:text-[36px] text-white/95">Building a robust</p>
                <p className="font-sans font-semibold text-[28px] md:text-[36px] text-white/70 tracking-[0.36px]">design system</p>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-sans font-semibold text-[15px] md:text-[18px] text-white/70 leading-[1.6] tracking-[0.18px]">
                I&apos;ve created a design system built to scale across the full app without visual inconsistency.
              </p>
            </div>
          </div>
          <ImageLightbox src="/craftapp/design-system.png" alt="CraftApp design system">
            <div className="w-full rounded-[8px] overflow-hidden bg-[#252525]">
              <Image src="/craftapp/design-system.png" alt="CraftApp design system" width={2400} height={1080} className="w-full h-auto" />
            </div>
          </ImageLightbox>
        </div>
      </section>

      {/* ─── 15. ONBOARDING ─── #f0eee9 */}
      <section className="w-full bg-[#f0eee9] py-16 md:py-[80px]">
        <div className={`${container} flex flex-col gap-10 md:gap-12`}>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-16 items-start">
            <div className="lg:w-[42%] shrink-0">
              <div className="leading-[1.25]">
                <p className="font-sans font-bold text-[28px] md:text-[36px] text-black/85">Onboarding</p>
                <p className="font-sans font-bold text-[28px] md:text-[36px] text-black/55">for installation day</p>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-sans font-semibold text-[15px] md:text-[18px] text-black/55 leading-[1.6] tracking-[0.18px]">
                Tariq begins each day by selecting his team and checking the week&apos;s jobs. One tap into an appointment shows everything he needs before arriving on site.
              </p>
            </div>
          </div>
          {/* Onboarding carousel — mobile scroll, desktop grid */}
          <div className="md:hidden -mx-4 overflow-x-auto pb-6 scrollbar-hide snap-x px-4">
            <div className="flex gap-4 w-fit h-[300px] md:h-[400px]">
              <div className="snap-start shrink-0 relative h-full aspect-[1960/806]">
                <ImageLightbox src="/craftapp/onboarding.png" alt="Onboarding screens">
                  <div className="w-full h-full rounded-[8px] overflow-hidden relative">
                    <Image src="/craftapp/onboarding.png" alt="Onboarding screens" fill className="object-contain" />
                  </div>
                </ImageLightbox>
              </div>
              {/* Spacer to ensure right-side padding works when scrolled to end */}
              <div className="w-8 shrink-0" />
            </div>
          </div>
          <div className="hidden md:block">
            <ImageLightbox src="/craftapp/onboarding.png" alt="Onboarding screens">
              <div className="w-full h-[403px] rounded-[8px] overflow-hidden relative">
                <Image src="/craftapp/onboarding.png" alt="Onboarding screens" fill className="object-cover" />
              </div>
            </ImageLightbox>
          </div>
        </div>
      </section>

      {/* ─── 16. GUIDE FIRST ─── full-bleed images ─── #252525 */}
      <section className="w-full bg-[#252525] py-16 md:py-[80px]">
        {/* Header — constrained */}
        <div className={`${container} mb-10 md:mb-12`}>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-16 items-start">
            <div className="lg:w-[42%] shrink-0">
              <div className="leading-[1.25]">
                <p className="font-sans font-extrabold text-[28px] md:text-[36px] text-white/95">Guide first</p>
                <p className="font-sans font-semibold text-[28px] md:text-[36px] text-white/70 tracking-[0.36px]">submit with context</p>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-sans font-semibold text-[15px] md:text-[18px] text-white/70 leading-[1.6] tracking-[0.18px]">
                Every task opens with a guide showing what to do, what a correct photo looks like, and what the reviewer will check. Tariq submits without typing a single word.
              </p>
            </div>
          </div>
        </div>

        {/* MOBILE: phone + captions stacked, full-width */}
        <div className="flex flex-col gap-8 lg:hidden px-4">
          <div className="flex flex-col gap-4">
            <ImageLightbox 
              src="/craftapp/guide-first-phone-a.png" 
              alt="Guide: reference photos"
              captions={[
                { title: "Photos from real approved submissions", body: "Swipeable reference images, selected by quality managers from actual past approvals. Not stock photos, not illustrations." },
                { title: "The review criteria before the steps", body: "The first thing a technician reads is what the quality manager will check. No guessing about what a passing submission looks like." }
              ]}
            >
              <div className="w-full h-[498px] rounded-[8px] overflow-hidden relative">
                <Image 
                  src="/craftapp/guide-first-phone-a.png" 
                  alt="Guide: reference photos" 
                  fill 
                  className="object-contain" 
                />
              </div>
            </ImageLightbox>
            <div className="flex flex-col gap-4">
              {[
                { n: "01", title: "Photos from real approved submissions", body: "Swipeable reference images, selected by quality managers from actual past approvals. Not stock photos, not illustrations." },
                { n: "02", title: "The review criteria before the steps", body: "The first thing a technician reads is what the quality manager will check. No guessing about what a passing submission looks like." },
              ].map(({ n, title, body }) => (
                <div key={n} className="flex gap-3 items-start">
                  <p className="font-sans font-extrabold text-[15px] text-white/95 shrink-0">{n}</p>
                  <div className="flex flex-col gap-1">
                    <p className="font-sans font-extrabold text-[15px] text-white/95">{title}</p>
                    <p className="font-sans font-semibold text-[14px] text-white/70 leading-[1.4]">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <ImageLightbox 
              src="/craftapp/guide-first-phone-b.png" 
              alt="Guide: submission & tagging"
              captions={[
                { title: "Tags instead of a keyboard", body: "After shooting, Tariq selects what the photo shows from a short list. One tap per tag, specific to the task type, no generic labels." },
                { title: "Multiple photos, one submission", body: "Some tasks need more than one angle. Tariq can add shots before submitting. The tags apply across all of them." }
              ]}
            >
              <div className="w-full h-[498px] rounded-[8px] overflow-hidden relative">
                <Image 
                  src="/craftapp/guide-first-phone-b.png" 
                  alt="Guide: submission & tagging" 
                  fill 
                  className="object-contain" 
                />
              </div>
            </ImageLightbox>
            <div className="flex flex-col gap-4">
              {[
                { n: "01", title: "Tags instead of a keyboard", body: "After shooting, Tariq selects what the photo shows from a short list. One tap per tag, specific to the task type, no generic labels." },
                { n: "02", title: "Multiple photos, one submission", body: "Some tasks need more than one angle. Tariq can add shots before submitting. The tags apply across all of them." },
              ].map(({ n, title, body }) => (
                <div key={n} className="flex gap-3 items-start">
                  <p className="font-sans font-extrabold text-[15px] text-white/95 shrink-0">{n}</p>
                  <div className="flex flex-col gap-1">
                    <p className="font-sans font-extrabold text-[15px] text-white/95">{title}</p>
                    <p className="font-sans font-semibold text-[14px] text-white/70 leading-[1.4]">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DESKTOP: [left captions] [phones] [right captions] — inside 1100px container */}
        <div className="hidden lg:block">
          <div className={`${container}`}>
            <div className="flex flex-row gap-8 items-start justify-center">
              {/* Left captions */}
              <div className="flex flex-col gap-10 w-[200px] shrink-0 pt-16">
                {[
                  { n: "01", title: "Photos from real approved submissions", body: "Swipeable reference images, selected by quality managers from actual past approvals. Not stock photos, not illustrations." },
                  { n: "02", title: "The review criteria before the steps", body: "The first thing a technician reads is what the quality manager will check. No guessing about what a passing submission looks like." },
                ].map(({ n, title, body }) => (
                  <div key={n} className="flex gap-3 items-start">
                    <p className="font-sans font-extrabold text-[15px] text-white/95 shrink-0">{n}</p>
                    <div className="flex flex-col gap-1">
                      <p className="font-sans font-extrabold text-[15px] text-white/95">{title}</p>
                      <p className="font-sans font-semibold text-[14px] text-white/70 leading-[1.4]">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Phone frames — fixed width so captions always have room */}
              <div className="flex gap-4 shrink-0 relative">
                <ImageLightbox 
                  src="/craftapp/guide-first-phone-a.png" 
                  alt="Guide: reference photos"
                  captions={[
                    { title: "Photos from real approved submissions", body: "Swipeable reference images, selected by quality managers from actual past approvals. Not stock photos, not illustrations." },
                    { title: "The review criteria before the steps", body: "The first thing a technician reads is what the quality manager will check. No guessing about what a passing submission looks like." }
                  ]}
                >
                  <div className="w-[280px] aspect-[9/16] rounded-[8px] overflow-hidden relative">
                    <Image src="/craftapp/guide-first-phone-a.png" alt="Guide: reference photos" fill className="object-contain" />
                  </div>
                </ImageLightbox>
                <ImageLightbox 
                  src="/craftapp/guide-first-phone-b.png" 
                  alt="Guide: submission & tagging"
                  captions={[
                    { title: "Tags instead of a keyboard", body: "After shooting, Tariq selects what the photo shows from a short list. One tap per tag, specific to the task type, no generic labels." },
                    { title: "Multiple photos, one submission", body: "Some tasks need more than one angle. Tariq can add shots before submitting. The tags apply across all of them." }
                  ]}
                >
                  <div className="w-[280px] aspect-[9/16] rounded-[8px] overflow-hidden relative">
                    <Image src="/craftapp/guide-first-phone-b.png" alt="Guide: submission & tagging" fill className="object-contain" />
                  </div>
                </ImageLightbox>
              </div>
              {/* Right captions */}
              <div className="flex flex-col gap-10 w-[200px] shrink-0 pt-16">
                {[
                  { n: "01", title: "Tags instead of a keyboard", body: "After shooting, Tariq selects what the photo shows from a short list. One tap per tag, specific to the task type, no generic labels." },
                  { n: "02", title: "Multiple photos, one submission", body: "Some tasks need more than one angle. Tariq can add shots before submitting. The tags apply across all of them." },
                ].map(({ n, title, body }) => (
                  <div key={n} className="flex gap-3 items-start">
                    <p className="font-sans font-extrabold text-[15px] text-white/95 shrink-0">{n}</p>
                    <div className="flex flex-col gap-1">
                      <p className="font-sans font-extrabold text-[15px] text-white/95">{title}</p>
                      <p className="font-sans font-semibold text-[14px] text-white/70 leading-[1.4]">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 17. CLOSING THE LOOP ─── full-bleed images ─── #f4f4f0 */}
      <section className="w-full bg-[#f4f4f0] py-16 md:py-[80px]">
        {/* Header — constrained */}
        <div className={`${container} mb-10 md:mb-12`}>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-16 items-start">
            <div className="lg:w-[42%] shrink-0">
              <div className="leading-[1.25]">
                <p className="font-sans font-extrabold text-[28px] md:text-[36px] text-black/85">Closing the Loop</p>
                <p className="font-sans font-semibold text-[28px] md:text-[36px] text-black/55 tracking-[0.36px]">real-time feedback &amp; validation</p>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-sans font-semibold text-[15px] md:text-[18px] text-black/55 leading-[1.6] tracking-[0.18px]">
                After submitting, Tariq can see the status of his work in real time. When the QM responds, a clear result appears immediately. No waiting, no guessing.
              </p>
            </div>
          </div>
        </div>

        {/* MOBILE */}
        <div className="flex flex-col gap-8 lg:hidden px-4">
          <div className="flex flex-col gap-4">
            <ImageLightbox 
              src="/craftapp/closing-loop-phone-a.png" 
              alt="Closing loop: in-review state"
              captions={[
                { title: "Managing Expectations", body: "Estimated wait time and a clear nudge to continue eliminates the idle anxiety technicians felt waiting for a response that might never come." },
                { title: "Non-Blocking Workflow", body: "Tariq doesn’t wait on the roof. He moves to the next task while QM reviews — the installation stays in flow." }
              ]}
            >
              <div className="w-full h-[498px] rounded-[8px] overflow-hidden relative">
                <Image 
                  src="/craftapp/closing-loop-phone-a.png" 
                  alt="Closing loop: in-review state" 
                  fill 
                  className="object-contain" 
                />
              </div>
            </ImageLightbox>
            <div className="flex flex-col gap-4">
              {[
                { n: "01", title: "Managing Expectations", body: "Estimated wait time and a clear nudge to continue eliminates the idle anxiety technicians felt waiting for a response that might never come." },
                { n: "02", title: "Non-Blocking Workflow", body: "Tariq doesn\u2019t wait on the roof. He moves to the next task while QM reviews \u2014 the installation stays in flow." },
              ].map(({ n, title, body }) => (
                <div key={n} className="flex gap-3 items-start">
                  <p className="font-sans font-extrabold text-[15px] text-black/85 shrink-0">{n}</p>
                  <div className="flex flex-col gap-1">
                    <p className="font-sans font-extrabold text-[15px] text-black/85">{title}</p>
                    <p className="font-sans font-semibold text-[14px] text-black/55 leading-[1.4]">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <ImageLightbox 
              src="/craftapp/closing-loop-phone-b.png" 
              alt="Closing loop: approved state"
              captions={[
                { title: "Full audit trail preserved", body: "The submitted photo and tags remain visible after approval. What was captured, what was tagged, when it was sent — is permanently on record for compliance." },
                { title: "The “Rapid Green Light”", body: "A timestamped verdict the moment QM responds. Tariq knows immediately — no waiting on site after installation, no guessing." }
              ]}
            >
              <div className="w-full h-[498px] rounded-[8px] overflow-hidden relative">
                <Image 
                  src="/craftapp/closing-loop-phone-b.png" 
                  alt="Closing loop: approved state" 
                  fill 
                  className="object-contain" 
                />
              </div>
            </ImageLightbox>
            <div className="flex flex-col gap-4">
              {[
                { n: "01", title: "Full audit trail preserved", body: "The submitted photo and tags remain visible after approval. What was captured, what was tagged, when it was sent \u2014 is permanently on record for compliance." },
                { n: "02", title: "The \u201cRapid Green Light\u201d", body: "A timestamped verdict the moment QM responds. Tariq knows immediately \u2014 no waiting on site after installation, no guessing." },
              ].map(({ n, title, body }) => (
                <div key={n} className="flex gap-3 items-start">
                  <p className="font-sans font-extrabold text-[15px] text-black/85 shrink-0">{n}</p>
                  <div className="flex flex-col gap-1">
                    <p className="font-sans font-extrabold text-[15px] text-black/85">{title}</p>
                    <p className="font-sans font-semibold text-[14px] text-black/55 leading-[1.4]">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DESKTOP: [left captions] [phones] [right captions] — inside 1100px container */}
        <div className="hidden lg:block">
          <div className={`${container}`}>
            <div className="flex flex-row gap-8 items-start justify-center">
              {/* Left captions */}
              <div className="flex flex-col gap-10 w-[200px] shrink-0 pt-16">
                {[
                  { n: "01", title: "Managing Expectations", body: "Estimated wait time and a clear nudge to continue eliminates the idle anxiety technicians felt waiting for a response that might never come." },
                  { n: "02", title: "Non-Blocking Workflow", body: "Tariq doesn\u2019t wait on the roof. He moves to the next task while QM reviews \u2014 the installation stays in flow." },
                ].map(({ n, title, body }) => (
                  <div key={n} className="flex gap-3 items-start">
                    <p className="font-sans font-extrabold text-[15px] text-black/85 shrink-0">{n}</p>
                    <div className="flex flex-col gap-1">
                      <p className="font-sans font-extrabold text-[15px] text-black/85">{title}</p>
                      <p className="font-sans font-semibold text-[14px] text-black/55 leading-[1.4]">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Phone frames */}
              <div className="flex gap-4 shrink-0 relative">
                <ImageLightbox 
                  src="/craftapp/closing-loop-phone-a.png" 
                  alt="Closing loop: in-review state"
                  captions={[
                    { title: "Managing Expectations", body: "Estimated wait time and a clear nudge to continue eliminates the idle anxiety technicians felt waiting for a response that might never come." },
                    { title: "Non-Blocking Workflow", body: "Tariq doesn’t wait on the roof. He moves to the next task while QM reviews — the installation stays in flow." }
                  ]}
                >
                  <div className="w-[280px] aspect-[9/16] rounded-[8px] overflow-hidden relative">
                    <Image src="/craftapp/closing-loop-phone-a.png" alt="Closing loop: in-review state" fill className="object-contain" />
                  </div>
                </ImageLightbox>
                <ImageLightbox 
                  src="/craftapp/closing-loop-phone-b.png" 
                  alt="Closing loop: approved state"
                  captions={[
                    { title: "Full audit trail preserved", body: "The submitted photo and tags remain visible after approval. What was captured, what was tagged, when it was sent — is permanently on record for compliance." },
                    { title: "The “Rapid Green Light”", body: "A timestamped verdict the moment QM responds. Tariq knows immediately — no waiting on site after installation, no guessing." }
                  ]}
                >
                  <div className="w-[280px] aspect-[9/16] rounded-[8px] overflow-hidden relative">
                    <Image src="/craftapp/closing-loop-phone-b.png" alt="Closing loop: approved state" fill className="object-contain" />
                  </div>
                </ImageLightbox>
              </div>
              {/* Right captions */}
              <div className="flex flex-col gap-10 w-[200px] shrink-0 pt-16">
                {[
                  { n: "01", title: "Full audit trail preserved", body: "The submitted photo and tags remain visible after approval. What was captured, what was tagged, when it was sent \u2014 is permanently on record for compliance." },
                  { n: "02", title: "The \u201cRapid Green Light\u201d", body: "A timestamped verdict the moment QM responds. Tariq knows immediately \u2014 no waiting on site after installation, no guessing." },
                ].map(({ n, title, body }) => (
                  <div key={n} className="flex gap-3 items-start">
                    <p className="font-sans font-extrabold text-[15px] text-black/85 shrink-0">{n}</p>
                    <div className="flex flex-col gap-1">
                      <p className="font-sans font-extrabold text-[15px] text-black/85">{title}</p>
                      <p className="font-sans font-semibold text-[14px] text-black/55 leading-[1.4]">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 18. WHEN QM REJECTS ─── full-bleed images ─── #252525 */}
      <section className="w-full bg-[#252525] py-16 md:py-[80px]">
        {/* Header — constrained */}
        <div className={`${container} mb-10 md:mb-12`}>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-16 items-start">
            <div className="lg:w-[42%] shrink-0">
              <div className="leading-[1.25]">
                <p className="font-sans font-extrabold text-[28px] md:text-[36px] text-white/95">When QM rejects</p>
                <p className="font-sans font-semibold text-[28px] md:text-[36px] text-white/70 tracking-[0.36px]">the loop stays closed</p>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-sans font-semibold text-[15px] md:text-[18px] text-white/70 leading-[1.6] tracking-[0.18px]">
                Rejections arrive with the QM&apos;s exact words — no interpretation, no delay. Tariq retakes with full context in view, or escalates to the Project Lead if the situation genuinely can&apos;t be resolved on site.
              </p>
            </div>
          </div>
        </div>

        {/* 3 phones — inside 1100px container */}
        <div className={container}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {[
              { img: "/craftapp/qm-reject-phone-1.png", title: "Clear rejection reason", body: "The QM\u2019s note appears verbatim, not paraphrased. Tariq knows exactly what to fix before touching the camera again." },
              { img: "/craftapp/qm-reject-phone-2.png", title: "QM feedback in the viewfinder", body: "The rejection reason stays visible while Tariq reframes the shot \u2014 no switching screens, no memorising instructions." },
              { img: "/craftapp/qm-reject-phone-3.png", title: "Escalate when retaking isn\u2019t possible", body: "If the situation genuinely can\u2019t be resolved on site, Tariq escalates to the Project Lead with one tap. Pre-written reasons keep it fast \u2014 no typing required." },
            ].map(({ img, title, body }) => (
              <div key={title} className="flex flex-col gap-5">
                <ImageLightbox src={img} alt={title} captionTitle={title} captionDescription={body}>
                  <div className="w-full aspect-[9/16] rounded-[8px] overflow-hidden relative">
                    <Image 
                      src={img} 
                      alt={title} 
                      fill 
                      className="object-contain" 
                    />
                  </div>
                </ImageLightbox>
                <div className="flex flex-col gap-2">
                  <p className="font-sans font-extrabold text-[16px] md:text-[18px] text-white/95 leading-tight">{title}</p>
                  <p className="font-sans font-semibold text-[14px] md:text-[16px] text-white/70 leading-[1.6]">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 19. RESULTS ─── #f0eee9 */}
      <section className="w-full bg-[#f0eee9] pt-16 md:pt-[80px]">
        <div className={`${container} mb-10`}>
          <p className="font-sans font-extrabold text-[28px] md:text-[36px] text-black/85">Results</p>
        </div>

        {/* Full-width Banner */}
        <div className="w-full aspect-[6600/2160] relative overflow-hidden mb-10 md:mb-14">
          <Image src="/craftapp/resultbanner.png" alt="CraftApp results banner" fill className="object-cover" />
        </div>

        <div className={`${container} flex flex-col gap-10 md:gap-14 pb-16 md:pb-[80px]`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { stat: "65% → 95%", label: "First-time-correct rate helped more appointments being fulfilled" },
              { stat: "3X", label: "QA cycle improvement eliminated the back and forth" },
              { stat: "0", label: "Zero forced adoption. Technicians chose to use it" },
              { stat: "€+ in Millions", label: "Revenue impact from reduced rework and faster completion" },
            ].map(({ stat, label }) => (
              <div key={stat} className="flex flex-col gap-2">
                <p className="font-sans font-extrabold text-[20px] md:text-[24px] text-[#7257ff]">{stat}</p>
                <p className="font-sans font-extrabold text-[16px] md:text-[18px] text-black/85 leading-snug">{label}</p>
              </div>
            ))}
          </div>

          {/* What I learned — merged */}
          <div className="flex flex-col gap-4">
            <p className="font-sans font-extrabold text-[16px] md:text-[18px] text-black/85">What I learned</p>
            <div className="flex flex-col gap-5 font-sans font-medium text-[18px] md:text-[24px] text-black/55 leading-[1.5] tracking-[0.24px]">
              <p>
                The most useful thing I did was, driving to the branches and spending a day with the installation teams. The WhatsApp & Slack workarounds, the "first-time-correct" pressure, the subtle frustration of skilled work being judged without context, none of it appeared in any brief or requirements document.
              </p>
              <p>
                I found it by being in the right place and paying attention. The compliance chain that nobody could see was not hidden. It just had not been looked for from the perspective of the technician.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 21. FOOTER ─── */}
      <footer className="w-full bg-[#252525] border-t border-white/10 p-10 md:p-14">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="font-sans font-medium text-[14px] text-white opacity-40 uppercase tracking-widest">
            © 2026 Asil Alptekin
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="https://www.linkedin.com/in/asil-alptekin/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center w-12 h-12 rounded-full bg-white/5 text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-110 border border-white/10"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} strokeWidth={1.5} />
            </a>
            <a 
              href="mailto:alptekin.contact@gmail.com" 
              className="flex items-center justify-center w-12 h-12 rounded-full bg-white/5 text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-110 border border-white/10"
              aria-label="Email"
            >
              <Mail size={20} strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
