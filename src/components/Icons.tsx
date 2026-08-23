import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const IconHome = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
  </svg>
);
export const IconChat = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M21 12c0 4.5-4 8-9 8a10 10 0 0 1-4-.8L3 20l1-4a7.5 7.5 0 0 1-1-4c0-4.5 4-8 9-8s9 3.5 9 8z" />
  </svg>
);
export const IconBag = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 8h16l-1.2 12a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8z" />
    <path d="M8 8V6a4 4 0 1 1 8 0v2" />
  </svg>
);
export const IconScan = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 8V5a2 2 0 0 1 2-2h3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3" />
    <path d="M3 12h18" />
  </svg>
);
export const IconWhistle = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M15 9a5 5 0 1 1-5 5" />
    <path d="M15 9V5h5" />
    <circle cx="10" cy="14" r="1" fill="currentColor" />
  </svg>
);
export const IconTrophy = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M8 4h8v4a4 4 0 0 1-8 0z" />
    <path d="M8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3" />
    <path d="M10 12v3M14 12v3M8 20h8M9 20l1-5M15 20l-1-5" />
  </svg>
);
export const IconSearch = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);
export const IconArrowRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);
export const IconArrowLeft = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M19 12H5M11 5l-7 7 7 7" />
  </svg>
);
export const IconStar = (p: IconProps) => (
  <svg {...{ ...base(p), fill: "currentColor", stroke: "none" }}>
    <path d="M12 2.5 15 9l7 1-5 5 1.5 7L12 18l-6.5 4L7 15 2 10l7-1z" />
  </svg>
);
export const IconStarOutline = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 2.5 15 9l7 1-5 5 1.5 7L12 18l-6.5 4L7 15 2 10l7-1z" />
  </svg>
);
export const IconHeart = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 20s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z" />
  </svg>
);
export const IconHeartFilled = (p: IconProps) => (
  <svg {...{ ...base(p), fill: "currentColor", stroke: "none" }}>
    <path d="M12 20s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z" />
  </svg>
);
export const IconComment = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-6.5A8 8 0 1 1 21 12z" />
  </svg>
);
export const IconShare = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" />
  </svg>
);
export const IconCheck = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m5 12 5 5 9-11" />
  </svg>
);
export const IconCheckCircle = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12 3 3 5-6" />
  </svg>
);
export const IconPin = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);
export const IconUsers = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2 20a7 7 0 0 1 14 0" />
    <circle cx="17" cy="9" r="3" />
    <path d="M15 20a7 7 0 0 1 7-6" />
  </svg>
);
export const IconUser = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);
export const IconClose = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const IconShield = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3 4 6v6c0 4.5 3 8 8 9 5-1 8-4.5 8-9V6z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
export const IconSparkles = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    <path d="M12 8l1.5 2.5L16 12l-2.5 1.5L12 16l-1.5-2.5L8 12l2.5-1.5z" />
  </svg>
);
export const IconTrendUp = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 17 9 11l4 4 8-8" />
    <path d="M14 4h7v7" />
  </svg>
);
export const IconTrendDown = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 7 9 13l4-4 8 8" />
    <path d="M14 20h7v-7" />
  </svg>
);
export const IconCamera = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 8h3l2-2h6l2 2h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);
export const IconRefresh = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" />
  </svg>
);
export const IconDumbbell = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2 12h2M20 12h2M6 8v8M18 8v8M8 6v12M16 6v12M8 12h8" />
  </svg>
);
export const IconVerified = (p: IconProps) => (
  <svg {...{ ...base(p), fill: "currentColor", stroke: "none" }}>
    <path d="m12 1.5 2.5 2.2 3.3-.3.9 3.2 3 1.6-1.4 3 1.4 3-3 1.6-.9 3.2-3.3-.3L12 20.5 9.5 18.3l-3.3.3-.9-3.2-3-1.6L3.7 12 2.3 9l3-1.6.9-3.2 3.3.3z" />
    <path
      d="m8 12 3 3 5-6"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);
export const IconLogo = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 12c0-4 3-8 8-8s8 4 8 8-3 8-8 8" strokeWidth="2.2" />
    <path d="M4 12h8" strokeWidth="2.2" />
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
  </svg>
);
export const IconNews = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 5h12a1 1 0 0 1 1 1v13H5a1 1 0 0 1-1-1z" />
    <path d="M17 9h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2" />
    <path d="M7 8h6M7 12h6M7 16h4" />
  </svg>
);
export const IconTruck = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2 7h11v9H2zM13 10h4l3 3v3h-7z" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
  </svg>
);
export const IconCreditCard = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20M6 15h4" />
  </svg>
);
export const IconLock = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 1 1 8 0v3" />
  </svg>
);
export const IconMail = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);
export const IconLogout = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M15 5V3H4v18h11v-2" />
    <path d="M10 12h11M18 8l4 4-4 4" />
  </svg>
);
export const IconPackage = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 8 12 3l9 5v8l-9 5-9-5z" />
    <path d="m3 8 9 5 9-5M12 13v8" />
  </svg>
);
export const IconCalendar = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);
export const IconPlus = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IconMinus = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 12h14" />
  </svg>
);
export const IconTrash = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6" />
  </svg>
);
export const IconFlash = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
  </svg>
);
export const IconEye = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
export const IconClock = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
export const IconMenu = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
