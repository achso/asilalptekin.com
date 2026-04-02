"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface ImageZoomProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  containerClassName?: string;
}

export function ImageZoom({
  src,
  alt,
  width,
  height,
  fill,
  className,
  containerClassName = "",
}: ImageZoomProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <div
        className={`cursor-zoom-in relative ${containerClassName}`}
        onClick={() => setIsOpen(true)}
      >
        {fill ? (
          <Image src={src} alt={alt} fill className={className} />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={width || 1200}
            height={height || 800}
            className={className}
          />
        )}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 backdrop-blur-md cursor-zoom-out transition-opacity"
          onClick={() => setIsOpen(false)}
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 md:top-10 md:right-10 text-white/50 hover:text-white transition-colors p-2 z-50"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative w-full h-full max-w-[90vw] max-h-[90vh] flex items-center justify-center p-4">
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain"
              quality={100}
              unoptimized={true}
            />
          </div>
        </div>
      )}
    </>
  );
}
