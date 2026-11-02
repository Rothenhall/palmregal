import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = { viewBox: "0 0 24 24", "aria-hidden": true } as const;

export const WhatsApp = (p: P) => (
  <svg {...base} {...p}>
    <path
      fill="currentColor"
      d="M12 2.2A9.7 9.7 0 0 0 3.6 16.8L2.3 21.7l5-1.3A9.7 9.7 0 1 0 12 2.2zm0 17.7a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 19.9zm4.4-6c-.2-.1-1.4-.7-1.7-.8s-.4-.1-.5.1-.6.8-.8.9-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3a.4.4 0 0 0 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11.2 11.2 0 0 0 4.3 3.8c1.6.7 2.2.7 3 .6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.2-.2-.5-.3z"
    />
  </svg>
);
export const Phone = (p: P) => (
  <svg {...base} {...p}>
    <path fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" />
  </svg>
);
export const Mail = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <path d="M3.5 6.5l8.5 6.5 8.5-6.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);
export const Play = (p: P) => (
  <svg {...base} {...p}>
    <path d="M7 4.5l13 7.5-13 7.5z" fill="currentColor" />
  </svg>
);
export const Arrow = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const Calendar = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);
export const Menu = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 9h16M4 15h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
export const Close = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
export const Instagram = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
  </svg>
);
export const Facebook = (p: P) => (
  <svg {...base} {...p}>
    <path fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" d="M14.5 21v-8h3l.5-3.5h-3.5V7.6c0-1 .4-1.6 1.7-1.6H18V3.1A20 20 0 0 0 15.6 3C13 3 11 4.5 11 7.3v2.2H8V13h3v8" />
  </svg>
);
export const YouTube = (p: P) => (
  <svg {...base} {...p}>
    <rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <path d="M10 9l5 3-5 3z" fill="currentColor" />
  </svg>
);
export const MapPin = (p: P) => (
  <svg {...base} {...p}>
    <path fill="none" stroke="currentColor" strokeWidth="1.7" d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);

/** Line icons for "Why stay with us" (icons only, per the brief). */
const comfortPaths: Record<string, React.ReactNode> = {
  Kitchenette: (<><path d="M8 17h24v13a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3zM5 17h30" /><path d="M15 12c0-2 1-3 2-4M20 12c0-2 1-3 2-4M25 12c0-2 1-3 2-4" /></>),
  Balcony: (<><path d="M6 20h28M6 34h28M9 20v14M15 20v14M21 20v14M27 20v14M33 20v14" /><path d="M12 20V8h16v12" /></>),
  "Living room": (<><path d="M7 21a3 3 0 0 1 6 0v4h14v-4a3 3 0 0 1 6 0v9H7z" /><path d="M11 18v-4a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v4M9 30v3M31 30v3" /></>),
  "Home comfort": (<><path d="M6 19L20 7l14 12M10 16v17h20V16" /><path d="M20 29s-5-3-5-6.5a2.6 2.6 0 0 1 5-1 2.6 2.6 0 0 1 5 1C25 26 20 29 20 29z" /></>),
  "Air conditioning": (<><path d="M20 5v30M7 12.5l26 15M7 27.5l26-15" /><path d="M16 7l4 3 4-3M16 33l4-3 4 3" /></>),
  "Wi-Fi": (<><path d="M5 16a21 21 0 0 1 30 0M10 21.5a14 14 0 0 1 20 0M15 27a7 7 0 0 1 10 0" /><circle cx="20" cy="31.5" r="1.6" fill="currentColor" /></>),
  Parking: (<><rect x="7" y="7" width="26" height="26" rx="6" /><path d="M16 29V12h5.5a5 5 0 0 1 0 10H16" /></>),
};
export function ComfortIcon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      {comfortPaths[name]}
    </svg>
  );
}
