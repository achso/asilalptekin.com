import { ReactNode } from "react";

interface InvertedSectionProps {
  children: ReactNode;
  className?: string;
}

export function InvertedSection({ children, className = "" }: InvertedSectionProps) {
  return (
    <section 
      className={`w-[100vw] ml-[calc(50%-50vw)] bg-[#252525] text-background py-24 px-8 md:px-12 relative overflow-hidden z-10 ${className}`}
    >
      {/* Light noise overlay for dark mode sections to preserve texture consistency */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-overlay z-[1] opacity-50"
        style={{
          backgroundImage: "url('/texture.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        {children}
      </div>
    </section>
  );
}
