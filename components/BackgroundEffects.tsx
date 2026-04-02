"use client";

export function BackgroundEffects() {
  return (
    <>
      {/* Full-page grain texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none mix-blend-overlay z-[9999]"
        style={{
          backgroundImage: "url('/texture.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
          opacity: 0.7,
        }}
        aria-hidden="true"
      />



      {/* Reusable SVG blur filter for text layering */}
      <svg width="1" height="1" style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", overflow: "visible", visibility: "hidden" }}>
        <defs>
          <filter id="hero-blur" x="-5%" y="-80%" width="110%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2 13" />
          </filter>
        </defs>
      </svg>
    </>
  );
}
