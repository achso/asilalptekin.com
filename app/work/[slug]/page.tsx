import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MobileMockup } from "@/components/MobileMockup";
import { Navbar } from "@/components/Navbar";
import { InvertedSection } from "@/components/InvertedSection";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CaseStudyPage(props: PageProps) {
  const params = await props.params;
  const projectIndex = projects.findIndex((p) => p.slug === params.slug);
  
  if (projectIndex === -1) {
    notFound();
  }
  
  const project = projects[projectIndex];
  
  // Get next project for the footer
  const nextProject = projects[(projectIndex + 1) % projects.length];

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col items-center selection:bg-black selection:text-white">
      <Navbar />

      {/* Hero Image Block */}
      <div className="w-full max-w-5xl px-8 mt-4 md:mt-8 relative z-10">
        <div 
          className="w-full rounded-[24px] overflow-hidden bg-muted relative shadow-sm border border-border/50"
          style={{ paddingBottom: "50%", backgroundColor: project.imageColor || '#f3f4f6' }}
        >
          {project.imageSrc && (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${project.imageSrc}')` }}
            />
          )}
        </div>
      </div>

      {/* Hero Content Grid (Reference Layout) */}
      <header className="w-full max-w-5xl px-8 py-16 md:py-20 flex flex-col items-start relative z-10">
        {/* Title & Subtitle */}
        <div className="flex flex-col gap-2 mb-12 max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-[64px] font-[800] tracking-tight text-foreground leading-[1.1]">
            {project.title.split(':')[0]}
          </h1>
          <p className="text-xl md:text-[26px] text-muted-foreground font-[500] leading-[1.4] mt-4">
            {project.title.includes(':') ? `${project.title.split(':')[1].trim()}. ` : ''}{project.description}
          </p>
        </div>

        {/* Layout Grid: Left (Overview + Problem/Outcome) | Right (Metadata) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-[1fr_250px] gap-12 md:gap-24">
           {/* Left Column */}
           <div className="flex flex-col gap-10">
              <div className="text-[15px] md:text-[16px] leading-[1.8] text-foreground/80 font-[500] max-w-2xl">
                 {project.overview ? (
                   project.overview.split('\n\n').map((p, i) => <p key={i} className="mb-4">{p}</p>)
                 ) : (
                   <p>No overview provided for this project.</p>
                 )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-4 max-w-2xl">
                 <div className="flex flex-col gap-2">
                   <h3 className="font-[800] text-[15px] text-foreground">Problem</h3>
                   <p className="text-[14px] leading-[1.7] text-foreground/70 font-[500]">
                     {project.content?.problem || "Users faced significant friction managing tasks and data manually in disconnected systems."}
                   </p>
                 </div>
                 <div className="flex flex-col gap-2">
                   <h3 className="font-[800] text-[15px] text-foreground">Outcome</h3>
                   <p className="text-[14px] leading-[1.7] text-foreground/70 font-[500]">
                     {project.content?.impact ? project.content.impact.substring(0, 150) + "..." : "We delivered an integrated, high-performance platform that unified data streams."}
                   </p>
                 </div>
              </div>
           </div>

           {/* Right Column (Metadata Stack) */}
           <div className="flex flex-col gap-8 pt-2">
             <div className="flex flex-col gap-1">
               <span className="font-[800] text-[15px] text-foreground">Role</span>
               <span className="text-muted-foreground font-[500] text-[14px]">{project.role}</span>
             </div>
             <div className="flex flex-col gap-1">
               <span className="font-[800] text-[15px] text-foreground">Timeline</span>
               <span className="text-muted-foreground font-[500] text-[14px]">{project.year}</span>
             </div>
             <div className="flex flex-col gap-1">
               <span className="font-[800] text-[15px] text-foreground">Team</span>
               <span className="text-muted-foreground font-[500] text-[14px]">
                 {('team' in project ? project.team : "Cross-functional team") as string}
               </span>
             </div>
           </div>
        </div>
      </header>

      <main className="w-full flex flex-col items-center">
        {project.sections && <hr className="w-full max-w-5xl border-border border-t-2" />}

        {/* Scrolling Narrative Content */}
        <article className="w-full max-w-4xl px-8 py-16 md:py-24 flex flex-col gap-20">
          {project.sections && project.sections.map((section, index) => (
            <div key={index}>
              <section className="flex flex-col gap-6">
                <h2 className="text-2xl md:text-3xl font-[800] tracking-tight">{section.title}</h2>
                <div className="text-[18px] md:text-[20px] text-foreground/80 leading-[1.8] space-y-6 font-[500]">
                  {Array.isArray(section.content) 
                    ? section.content.map((paragraph, i) => {
                        const parts = paragraph.split('**');
                        if (parts.length > 2) {
                           return <p key={i}><strong className="text-foreground font-[800]">{parts[1]}</strong>{parts[2]}</p>
                        }
                        return <p key={i}>{paragraph}</p>
                      })
                    : <p>{section.content}</p>
                  }
                </div>

                {/* Inject Research Hook Callout specifically after the "Research That Reframed" section */}
                {project.slug === 'craftapp' && section.title === "Research That Reframed the Problem" && (
                  <div className="my-10 bg-muted/50 border-l-4 border-foreground p-8 rounded-r-2xl relative overflow-hidden backdrop-blur-sm">
                    <p className="text-[20px] font-[500] text-foreground italic leading-relaxed relative z-10">
                      &quot;Conducted foundational user research and field observations to inform high-impact design decisions for the Monteurs.&quot;
                    </p>
                  </div>
                )}
              </section>
              {index < project.sections!.length - 1 && <hr className="border-border/60 mt-20" />}
            </div>
          ))}

        </article>
        
        {/* Inject Technical Implementation Block with Phone Frames - Outside of Article to allow full-width */}
        {project.technicalNarrative && (
           <InvertedSection className="mt-8" >
              <h2 className="text-4xl md:text-5xl lg:text-[64px] font-[800] tracking-tight mb-16 text-center">Technical Implementation</h2>
              
              <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                <h3 className="text-2xl font-[800]">The Challenge</h3>
                <p className="text-[18px] md:text-[20px] text-background/90 leading-[1.8] font-[500]">{project.technicalNarrative.challenge}</p>
              </div>

              {/* SHOWCASE MOBILE FRAMES HERE */}
              {project.slug === 'craftapp' && <div className="py-16 md:py-24 max-w-5xl mx-auto"><MobileMockup /></div>}

              <div className="flex flex-col gap-6 pt-8 max-w-4xl mx-auto">
                <h3 className="text-2xl font-[800]">The Maker Solution</h3>
                <p className="text-[18px] md:text-[20px] text-background/90 leading-[1.8] font-[500]">{project.technicalNarrative.makerSolution.intro}</p>
                <ul className="flex flex-col gap-6 mt-4 list-none">
                  {project.technicalNarrative.makerSolution.points.map((point, i) => (
                    <li key={i} className="text-[18px] md:text-[20px] text-foreground leading-[1.8] font-[500] flex gap-6 bg-background/5 p-8 rounded-3xl border border-background/20 shadow-sm backdrop-blur-md">
                      <span className="font-[800] text-background text-3xl mt-[-4px] opacity-40">0{i+1}</span>
                      <div>
                        <strong className="text-background font-[800] block mb-2">{point.title}</strong>
                        <span className="text-background/90">{point.description}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                
                {/* Maker Notes Callouts */}
                {project.technicalNarrative.makerNotes && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {project.technicalNarrative.makerNotes.map((note, i) => (
                      <div key={i} className="bg-background text-foreground border border-border shadow-sm rounded-[24px] p-8 flex flex-col gap-3 hover:shadow-md transition-shadow">
                        <h4 className="font-[800] text-sm uppercase tracking-wider flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-foreground block"></span>
                          Maker Note
                        </h4>
                        <strong className="text-[18px] font-[800]">{note.title}</strong>
                        <p className="text-[16px] leading-relaxed text-muted-foreground font-[500]">
                          {note.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {project.technicalNarrative.accessibilityNote && (
                  <div className="mt-8 bg-background/10 text-background p-8 rounded-3xl border border-background/20 backdrop-blur-sm">
                    <p className="text-[16px] md:text-[18px] text-background/90 font-[500] leading-relaxed">
                      <strong className="text-background font-[800] flex items-center gap-2 mb-3">
                         <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                         Accessibility Priority
                      </strong> 
                      {project.technicalNarrative.accessibilityNote}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-6 mt-16 bg-background text-foreground p-8 md:p-12 rounded-[2rem] border border-border max-w-4xl mx-auto">
                <h3 className="text-2xl font-[800] flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  The Shipped Impact
                </h3>
                <p className="text-[18px] md:text-[20px] text-foreground/80 leading-[1.8] font-[500]">{project.technicalNarrative.impact}</p>
              </div>
           </InvertedSection>
        )}
      </main>

      {/* Massive Navigation Footer */}
      <Link href={`/work/${nextProject.slug}`} className="group block w-full border-t border-border mt-12 md:mt-24 py-24 md:py-32 px-8 hover:bg-black hover:text-white transition-colors duration-500 ease-out overflow-hidden relative">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 z-10 relative">
            <div className="flex flex-col gap-4">
              <span className="text-sm font-[800] uppercase tracking-widest opacity-50 group-hover:opacity-80 transition-opacity">Next Project</span>
              <h2 className="text-5xl md:text-7xl lg:text-[96px] font-[800] tracking-tighter leading-[0.9]">
                {nextProject.title.split('—')[0].trim()}
              </h2>
            </div>
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-2 border-current flex justify-center items-center group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all duration-500 flex-shrink-0">
               <ArrowRight className="w-8 h-8 md:w-10 md:h-10" />
            </div>
         </div>
      </Link>
    </div>
  );
}
