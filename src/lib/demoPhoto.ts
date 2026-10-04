/**
 * Stand-in "site photo" so the mandatory-photo step can be demoed on a
 * laptop without a camera. On an iPad the real camera opens instead.
 */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
  <defs>
    <linearGradient id="w" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#d9d3c7"/><stop offset="1" stop-color="#b9b1a3"/></linearGradient>
    <linearGradient id="f" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#8e8576"/><stop offset="1" stop-color="#6c6457"/></linearGradient>
  </defs>
  <rect width="640" height="480" fill="url(#w)"/>
  <polygon points="0,330 640,300 640,480 0,480" fill="url(#f)"/>
  <rect x="250" y="40" width="70" height="300" fill="#a39a8b"/>
  <rect x="250" y="40" width="70" height="300" fill="none" stroke="#7d7466" stroke-dasharray="10 8" stroke-width="3"/>
  <path d="M120 120 L190 170 L150 230 L220 300" stroke="#5d564b" stroke-width="3" fill="none"/>
  <rect x="420" y="90" width="150" height="190" fill="#c7c0b2" stroke="#8a8172" stroke-width="4"/>
  <circle cx="300" cy="380" r="60" fill="#f2c94c" opacity=".08"/>
  <g font-family="Helvetica,Arial" font-size="20" fill="#fff">
    <rect x="16" y="16" width="250" height="34" rx="6" fill="rgba(0,0,0,.45)"/>
    <text x="28" y="40">IMG_2041 · demo photo</text>
  </g>
</svg>`;

export const DEMO_PHOTO = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
