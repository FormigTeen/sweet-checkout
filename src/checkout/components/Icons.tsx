import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>
const base = (p: P) => ({
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...p,
})

export const Lock = (p: P) => (
  <svg {...base(p)}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
    <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
  </svg>
)

export const ChevronLeft = (p: P) => (
  <svg {...base(p)}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
)

export const Check = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12.5l5 5L20 6.5" />
  </svg>
)

export const ChevronRight = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 5l7 7-7 7" />
  </svg>
)

export const SoundOn = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 9v6h4l5 4V5L9 9H5z" />
    <path d="M17 9c1 1 1 5 0 6M19.5 7c2 2 2 8 0 10" />
  </svg>
)

export const SoundOff = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 9v6h4l5 4V5L9 9H5z" />
    <path d="M17 9l5 6M22 9l-5 6" />
  </svg>
)

export const Pix = (p: P) => (
  <svg {...base(p)} strokeWidth={0} fill="currentColor">
    <path d="M12 2.6 8.9 5.7a3 3 0 0 0 0 4.2L11 12l-2.1 2.1a3 3 0 0 0 0 4.2L12 21.4l3.1-3.1a3 3 0 0 0 0-4.2L13 12l2.1-2.1a3 3 0 0 0 0-4.2L12 2.6Z" opacity=".35" />
    <path d="m6.2 8.6-2 2a2 2 0 0 0 0 2.8l2 2 2-2a2 2 0 0 0 0-2.8l-2-2ZM17.8 8.6l-2 2a2 2 0 0 0 0 2.8l2 2 2-2a2 2 0 0 0 0-2.8l-2-2Z" />
  </svg>
)

export const Card = (p: P) => (
  <svg {...base(p)}>
    <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
    <path d="M2.5 9.5h19" />
    <path d="M6 14.5h4" />
  </svg>
)

export const Barcode = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 6v12M7 6v12M10 6v12M13.5 6v12M17 6v12M20 6v12" />
  </svg>
)

export const Shield = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)

export const Coin = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5v9M9.7 9.5c0-1 1-1.6 2.3-1.6s2.3.7 2.3 1.6-1 1.5-2.3 1.5-2.3.6-2.3 1.6 1 1.6 2.3 1.6 2.3-.7 2.3-1.6" />
  </svg>
)

export const Store = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 10v9h16v-9" />
    <path d="M3 6h18l-1 4a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0L3 6z" />
  </svg>
)

export const Truck = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.5 6.5h11v9h-11z" />
    <path d="M13.5 9.5H18l3 3v3h-7.5" />
    <circle cx="7" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </svg>
)

export const Bolt = (p: P) => (
  <svg {...base(p)} fill="currentColor" strokeWidth={0}>
    <path d="M13 2 4 13.5h6L9 22l9-11.5h-6L13 2Z" />
  </svg>
)

export const Pencil = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 20h4L18.5 9.5a2 2 0 0 0-3-3L5 17v3z" />
    <path d="M13.5 6.5l3 3" />
  </svg>
)

export const User = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </svg>
)

export const ArrowRight = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const Return = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 10 5 14l4 4" />
    <path d="M5 14h9a5 5 0 0 0 5-5V6" />
  </svg>
)

export const Mail = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="M4 7l8 6 8-6" />
  </svg>
)

export const Copy = (p: P) => (
  <svg {...base(p)}>
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M5 15V5a2 2 0 0 1 2-2h8" />
  </svg>
)

export const X = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const Info = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </svg>
)

export const Minus = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 12h12" />
  </svg>
)

export const Plus = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 6v12M6 12h12" />
  </svg>
)

export const MapPin = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
)

export const Gear = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 3.5v2.2M12 18.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
  </svg>
)
