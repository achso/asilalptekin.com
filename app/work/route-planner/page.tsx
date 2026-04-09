import { Navbar } from "@/components/Navbar";
import { Linkedin, Mail } from "lucide-react";
import Image from "next/image";
import { ImageLightbox } from "@/components/ImageLightbox";

export default function RoutePlannerCaseStudy() {
  const container = "w-full max-w-[1100px] mx-auto px-4";

  return (
    <div id="craft-content" className="min-h-screen w-full bg-[#f0eee9] text-zinc-950 font-sans selection:bg-black selection:text-white">
      <Navbar />

      {/* ─── 1. HERO + INTRO ─── */}
      <section className="w-full bg-[#f0eee9]">
        <div className={`${container} pt-6 md:pt-8`}>
          <div className="w-full aspect-[2/1] rounded-[16px] md:rounded-[24px] overflow-hidden relative">
            <Image src="/route-planner/hero.png" alt="Route Planner hero" fill className="object-cover" priority />
          </div>
        </div>

        <div className={`${container} pt-10 md:pt-14 pb-16 md:pb-24`}>
          <div className="mb-8 md:mb-10 max-w-[760px]">
            <h1 className="font-poppins font-extrabold text-[28px] md:text-[32px] text-black leading-tight">
              Route Planner
            </h1>
            <p className="font-sans font-medium text-[22px] md:text-[32px] lg:text-[36px] text-black/55 tracking-[0.36px] leading-[1.35]">
              Placeholder subtitle — describe what this project is about.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
            <div className="flex-1 flex flex-col gap-8">
              <p className="font-sans font-semibold text-[16px] md:text-[18px] text-black/55 leading-[1.7] tracking-[0.18px]">
                Placeholder intro paragraph — describe the context and what motivated this project.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="flex flex-col gap-1.5">
                  <p className="font-sans font-extrabold text-[18px] md:text-[20px] text-black/85">The Problem</p>
                  <p className="font-sans font-semibold text-[16px] md:text-[18px] text-black/55 leading-[1.6] tracking-[0.18px]">
                    Placeholder problem description.
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="font-sans font-extrabold text-[18px] md:text-[20px] text-black/85">Outcome</p>
                  <p className="font-sans font-semibold text-[16px] md:text-[18px] text-black/55 leading-[1.6] tracking-[0.18px]">
                    Placeholder outcome description.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-row lg:flex-col gap-8 lg:gap-5 lg:w-[180px] shrink-0">
              <div>
                <p className="font-sans font-extrabold text-[16px] md:text-[18px] text-black/85">Role</p>
                <p className="font-sans font-semibold text-[15px] md:text-[16px] text-black/55 leading-[1.6]">Product Designer, end to end</p>
              </div>
              <div>
                <p className="font-sans font-extrabold text-[16px] md:text-[18px] text-black/85">Team</p>
                <p className="font-sans font-semibold text-[15px] md:text-[16px] text-black/55 leading-[1.6]">Placeholder team info</p>
              </div>
              <div>
                <p className="font-sans font-extrabold text-[16px] md:text-[18px] text-black/85">Timeline</p>
                <p className="font-sans font-semibold text-[15px] md:text-[16px] text-black/55 leading-[1.6]">TBD</p>
              </div>
              <div>
                <p className="font-sans font-extrabold text-[16px] md:text-[18px] text-black/85">Platform</p>
                <p className="font-sans font-semibold text-[15px] md:text-[16px] text-black/55 leading-[1.6]">Web</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. FULL-WIDTH IMAGE ─── */}
      <div className="w-full aspect-[3538/1280] relative overflow-hidden mb-[-16px]" style={{ clipPath: "inset(0 0 16px 0)" }}>
        <Image src="/route-planner/context.png" alt="Route Planner in context" fill className="object-cover" />
      </div>

      {/* ─── 3. DESIGN BRIEF ─── #252525 */}
      <section className="w-full bg-[#252525] py-16 md:py-[80px]">
        <div className={container}>
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            <div className="flex flex-col gap-4 lg:w-[42%] shrink-0">
              <div className="leading-[1.25]">
                <h2 className="font-sans font-extrabold text-[28px] md:text-[36px] text-white/95">Design brief</h2>
                <p className="font-sans font-semibold text-[28px] md:text-[36px] text-white/70 tracking-[0.36px]">
                  Placeholder brief subtitle
                </p>
              </div>
              <p className="font-sans font-semibold text-[15px] md:text-[18px] text-white/70 leading-[1.6] tracking-[0.18px]">
                Placeholder design brief description.
              </p>
            </div>
            <div className="flex-1 flex flex-col gap-8 md:gap-10">
              {[
                { n: "01", title: "Placeholder challenge one", body: "Placeholder description for the first design challenge." },
                { n: "02", title: "Placeholder challenge two", body: "Placeholder description for the second design challenge." },
                { n: "03", title: "Placeholder challenge three", body: "Placeholder description for the third design challenge." },
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
                Placeholder research process overview.
              </p>
            </div>
            <div className="flex-1 flex flex-col gap-8 md:gap-10">
              {[
                { n: "01", title: "Placeholder research method one", body: "Placeholder description for research method one." },
                { n: "02", title: "Placeholder research method two", body: "Placeholder description for research method two." },
                { n: "03", title: "Placeholder research method three", body: "Placeholder description for research method three." },
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
        <Image src="/route-planner/research-context.png" alt="Research context" fill className="object-cover" />
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
                Placeholder research results summary.
              </p>
              <ImageLightbox src="/route-planner/research-insights.png" alt="Research insights">
                <div className="mt-4 w-full aspect-[1960/1654] rounded-[8px] overflow-hidden relative">
                  <Image src="/route-planner/research-insights.png" alt="Research insights" fill className="object-cover" />
                </div>
              </ImageLightbox>
            </div>
            <div className="flex-1 flex flex-col gap-8 md:gap-10">
              {[
                { title: "Placeholder insight one", body: "Placeholder description for insight one." },
                { title: "Placeholder insight two", body: "Placeholder description for insight two." },
                { title: "Placeholder insight three", body: "Placeholder description for insight three." },
                { title: "Placeholder insight four", body: "Placeholder description for insight four." },
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

      {/* ─── 7. PROBLEM STATEMENT & THREE QUESTIONS ─── #252525 */}
      <section className="w-full bg-[#252525] py-16 md:py-[80px]">
        <div className={`${container} flex flex-col gap-10 md:gap-14`}>
          <div className="flex flex-col gap-4">
            <p className="font-sans font-extrabold text-[16px] md:text-[18px] text-white/95 opacity-60">Problem statement</p>
            <p className="font-sans font-medium text-[20px] md:text-[28px] text-white/90 leading-[1.4] tracking-tight">
              Placeholder problem statement — describe the core challenge this project set out to solve.
            </p>
          </div>

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
                { n: "HMW 01", title: "Placeholder HMW question one:", body: "Placeholder how-might-we description for question one." },
                { n: "HMW 02", title: "Placeholder HMW question two:", body: "Placeholder how-might-we description for question two." },
                { n: "HMW 03", title: "Placeholder HMW question three:", body: "Placeholder how-might-we description for question three." },
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

      {/* ─── 8. THE STRATEGY ─── #f0eee9 */}
      <section className="w-full bg-[#f0eee9] py-16 md:py-[80px]">
        <div className={container}>
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            <div className="flex flex-col gap-3 lg:w-[42%] shrink-0">
              <div className="leading-[1.25]">
                <p className="font-sans font-extrabold text-[28px] md:text-[36px] text-black/85">The Strategy</p>
                <p className="font-sans font-semibold text-[28px] md:text-[36px] text-black/55 tracking-[0.36px]">placeholder strategy subtitle</p>
              </div>
              <p className="font-sans font-semibold text-[15px] md:text-[18px] text-black/55 leading-[1.6] tracking-[0.18px]">
                Placeholder strategy overview description.
              </p>
            </div>
            <div className="flex-1 flex flex-col gap-8 md:gap-10">
              {[
                { n: "01", title: "Placeholder strategy point one", body: "Placeholder description for strategy point one." },
                { n: "02", title: "Placeholder strategy point two", body: "Placeholder description for strategy point two." },
                { n: "03", title: "Placeholder strategy point three", body: "Placeholder description for strategy point three." },
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

      {/* ─── 9. PERSONA ─── #252525 */}
      <section className="w-full bg-[#252525] py-16 md:py-[80px]">
        <div className={`${container} flex flex-col gap-10 md:gap-14`}>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-16 items-start">
            <div className="lg:w-[42%] shrink-0">
              <div className="leading-[1.25]">
                <p className="font-sans font-extrabold text-[28px] md:text-[36px] text-white/95">Placeholder persona name</p>
                <p className="font-sans font-semibold text-[28px] md:text-[36px] text-white/70 tracking-[0.36px]">from user research</p>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-sans font-semibold text-[15px] md:text-[18px] text-white/70 leading-[1.6] tracking-[0.18px]">
                Placeholder persona description.
              </p>
            </div>
          </div>
          <ImageLightbox src="/route-planner/persona.png" alt="Persona">
            <div className="w-full aspect-[2362/1214] rounded-[8px] overflow-hidden relative">
              <Image src="/route-planner/persona.png" alt="Persona" fill className="object-cover" />
            </div>
          </ImageLightbox>
        </div>
      </section>

      {/* ─── 10. JOURNEY MAP ─── #f0eee9 */}
      <section className="w-full bg-[#f0eee9] py-16 md:py-[80px]">
        <div className={`${container} flex flex-col gap-10 md:gap-12`}>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-16 items-start">
            <div className="lg:w-[42%] shrink-0">
              <div className="leading-[1.25]">
                <p className="font-sans font-bold text-[28px] md:text-[36px] text-black/85">Placeholder journey title</p>
                <p className="font-sans font-bold text-[28px] md:text-[36px] text-black/55">placeholder subtitle</p>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-sans font-semibold text-[15px] md:text-[18px] text-black/55 leading-[1.6] tracking-[0.18px]">
                Placeholder journey map description.
              </p>
            </div>
          </div>
          <ImageLightbox src="/route-planner/journey-map.png" alt="Journey map">
            <div className="w-full aspect-[2940/3180] rounded-[8px] overflow-hidden relative">
              <Image src="/route-planner/journey-map.png" alt="Journey map" fill className="object-cover" />
            </div>
          </ImageLightbox>
        </div>
      </section>

      {/* ─── 11. DESIGN DECISIONS ─── #252525 */}
      <section className="w-full bg-[#252525] py-16 md:py-[80px]">
        <div className={`${container} flex flex-col gap-12 md:gap-16`}>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-16 items-start">
            <div className="lg:w-[42%] shrink-0">
              <div className="leading-[1.25]">
                <p className="font-sans font-extrabold text-[28px] md:text-[36px] text-white/95">Placeholder section title</p>
                <p className="font-sans font-semibold text-[28px] md:text-[36px] text-white/70 tracking-[0.36px]">placeholder subtitle</p>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-sans font-semibold text-[15px] md:text-[18px] text-white/70 leading-[1.6] tracking-[0.18px]">
                Placeholder design decisions overview.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: "01", title: "Placeholder decision one", body: "Placeholder description for design decision one." },
              { n: "02", title: "Placeholder decision two", body: "Placeholder description for design decision two." },
              { n: "03", title: "Placeholder decision three", body: "Placeholder description for design decision three." },
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

      {/* ─── 12. UI SHOWCASE ─── #f0eee9 */}
      <section className="w-full bg-[#f0eee9] py-16 md:py-[80px]">
        <div className={`${container} flex flex-col gap-10 md:gap-12`}>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-16 items-start">
            <div className="lg:w-[42%] shrink-0">
              <div className="leading-[1.25]">
                <p className="font-sans font-bold text-[28px] md:text-[36px] text-black/85">Placeholder UI section</p>
                <p className="font-sans font-bold text-[28px] md:text-[36px] text-black/55">placeholder subtitle</p>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-sans font-semibold text-[15px] md:text-[18px] text-black/55 leading-[1.6] tracking-[0.18px]">
                Placeholder UI showcase description.
              </p>
            </div>
          </div>
          <ImageLightbox src="/route-planner/ui-showcase.png" alt="UI showcase">
            <div className="w-full rounded-[8px] overflow-hidden bg-[#f0eee9]">
              <Image src="/route-planner/ui-showcase.png" alt="UI showcase" width={2400} height={1080} className="w-full h-auto" />
            </div>
          </ImageLightbox>
        </div>
      </section>

      {/* ─── 13. RESULTS ─── #f0eee9 */}
      <section className="w-full bg-[#f0eee9] py-16 md:py-[80px]">
        <div className={`${container} flex flex-col gap-10 md:gap-14`}>
          <p className="font-sans font-extrabold text-[28px] md:text-[36px] text-black/85">Results</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { stat: "—", label: "Placeholder metric one" },
              { stat: "—", label: "Placeholder metric two" },
              { stat: "—", label: "Placeholder metric three" },
              { stat: "—", label: "Placeholder metric four" },
            ].map(({ stat, label }) => (
              <div key={label} className="flex flex-col gap-2">
                <p className="font-sans font-extrabold text-[20px] md:text-[24px] text-[#7257ff]">{stat}</p>
                <p className="font-sans font-extrabold text-[16px] md:text-[18px] text-black/85 leading-snug">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-sans font-extrabold text-[16px] md:text-[18px] text-black/85">What I learned</p>
            <div className="flex flex-col gap-5 font-sans font-medium text-[18px] md:text-[24px] text-black/55 leading-[1.5] tracking-[0.24px]">
              <p>
                Placeholder reflection — describe what you learned from this project.
              </p>
              <p>
                Placeholder second reflection paragraph.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
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
