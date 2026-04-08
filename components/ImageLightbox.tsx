"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import { X, ZoomIn } from "lucide-react";

interface CaptionItem {
  title: string;
  body: string;
}

interface ImageLightboxProps {
  src: string;
  alt: string;
  captionTitle?: string;
  captionDescription?: string;
  captions?: CaptionItem[];
  children: ReactNode;
}

export function ImageLightbox({
  src,
  alt,
  captionTitle,
  captionDescription,
  captions,
  children,
}: ImageLightboxProps) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  const hasCaption = !!(captionTitle || captionDescription || (captions && captions.length > 0));

  return (
    <>
      {/* Clickable wrapper */}
      <div onClick={() => setOpen(true)} className="group relative cursor-zoom-in w-full h-full">
        {children}
        <div className="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-end p-3 rounded-inherit">
          <div className="bg-black/55 backdrop-blur-sm rounded-full p-1.5 shadow">
            <ZoomIn size={14} className="text-white" />
          </div>
        </div>
      </div>

      {/* Lightbox overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[10001] bg-black/98 flex flex-col lg:flex-row animate-in fade-in duration-200"
          onClick={close}
        >
          {/* Close button — positioned relative to the whole view */}
          <button
            onClick={close}
            className="absolute top-6 left-6 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition-colors z-[210] lg:bg-transparent lg:hover:bg-white/10"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Main Content Area (Image) */}
          <div className="flex-1 flex items-center justify-center p-4 md:p-12 min-h-0">
            <img
              src={src}
              alt={alt}
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-full object-contain shadow-2xl"
            />
          </div>

          {/* Sidebar Area (Captions) — Hidden on mobile, flex on desktop */}
          {hasCaption && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="hidden lg:flex w-[400px] h-full bg-black/75 backdrop-blur-xl border-l border-white/10 p-10 flex-col gap-6 shrink-0 overflow-y-auto"
            >
              <div className="flex flex-col gap-8 mt-12 lg:mt-16">
                {/* Single Caption Case */}
                {!captions && (captionTitle || captionDescription) && (
                  <div className="flex flex-col gap-3">
                    {captionTitle && (
                      <h3 className="font-sans font-extrabold text-[22px] md:text-[26px] text-white/95 leading-tight">
                        {captionTitle}
                      </h3>
                    )}
                    {captionDescription && (
                      <p className="font-sans font-medium text-[15px] md:text-[16px] text-white/70 leading-relaxed max-w-sm">
                        {captionDescription}
                      </p>
                    )}
                  </div>
                )}

                {/* Multiple Captions Case */}
                {captions && captions.map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-3 group/item">
                    <div className="flex gap-4 items-start">
                      <span className="font-sans font-extrabold text-[15px] md:text-[18px] text-white/95 shrink-0">
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
                      <div className="flex flex-col gap-1">
                        <h3 className="font-sans font-extrabold text-[18px] md:text-[20px] text-white/95 leading-tight">
                          {item.title}
                        </h3>
                        <p className="font-sans font-medium text-[14px] md:text-[15px] text-white/70 leading-relaxed">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom hint */}
              <div className="mt-auto pt-10 pb-4">
                <div className="flex flex-col gap-4 text-[13px] text-white/60 font-medium italic">
                  <p>Click anywhere outside or press Esc to return to the case study.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
