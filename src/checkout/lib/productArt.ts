// Ilustrações de produto em SVG (data-URI) — checkout 100% estático, sem rede.

function encode(svg: string): string {
  return 'data:image/svg+xml,' + encodeURIComponent(svg)
}

const bg = (stop1: string, stop2: string, id: string) => `
  <defs>
    <radialGradient id="${id}" cx="50%" cy="38%" r="75%">
      <stop offset="0%" stop-color="${stop1}"/>
      <stop offset="100%" stop-color="${stop2}"/>
    </radialGradient>
  </defs>
  <rect width="200" height="200" rx="28" fill="url(#${id})"/>`

export const blenderArt = encode(`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  ${bg('#fff', '#f0f0f2', 'g1')}
  <g transform="translate(100 104)">
    <rect x="-30" y="34" width="60" height="26" rx="8" fill="#2b2b30"/>
    <rect x="-24" y="40" width="48" height="4" rx="2" fill="#4a4a52"/>
    <circle cx="0" cy="52" r="4" fill="#ed1b2f"/>
    <path d="M-26 32 L26 32 L20 -30 L-20 -30 Z" fill="#cfd6dc" opacity="0.55"/>
    <path d="M-26 32 L26 32 L20 -30 L-20 -30 Z" fill="none" stroke="#9aa4ad" stroke-width="2"/>
    <rect x="-22" y="-40" width="44" height="12" rx="4" fill="#3a3a40"/>
    <path d="M0 28 L-10 -6 L10 -6 Z" fill="#8b939b"/>
    <rect x="-2" y="-6" width="4" height="34" fill="#6c747c"/>
  </g>
</svg>`)

export const airfryerArt = encode(`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  ${bg('#fff', '#f0f0f2', 'g2')}
  <g transform="translate(100 100)">
    <path d="M-40 -46 Q0 -58 40 -46 L34 40 Q0 52 -34 40 Z" fill="#2b2b30"/>
    <path d="M-40 -46 Q0 -58 40 -46 L38 -20 Q0 -30 -38 -20 Z" fill="#3a3a40"/>
    <rect x="-30" y="30" width="60" height="16" rx="6" fill="#1d1d21"/>
    <circle cx="0" cy="-4" r="15" fill="#4a4a52"/>
    <circle cx="0" cy="-4" r="15" fill="none" stroke="#6c747c" stroke-width="2"/>
    <text x="0" y="1" font-family="Lato,Arial" font-size="12" fill="#ed1b2f" text-anchor="middle" font-weight="900">°C</text>
    <rect x="-22" y="18" width="44" height="4" rx="2" fill="#5a5a62"/>
  </g>
</svg>`)

export const kettleArt = encode(`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  ${bg('#fff', '#f0f0f2', 'g3')}
  <g transform="translate(100 104)">
    <path d="M-34 -20 Q-40 40 -20 46 L20 46 Q40 40 34 -20 Z" fill="#e6e8ea"/>
    <path d="M-34 -20 Q-40 40 -20 46 L0 46 L0 -20 Z" fill="#cfd3d7"/>
    <rect x="-38" y="-28" width="76" height="12" rx="6" fill="#2b2b30"/>
    <path d="M32 -8 Q56 -4 50 30" fill="none" stroke="#2b2b30" stroke-width="8" stroke-linecap="round"/>
    <path d="M-34 -12 Q-52 -14 -54 4" fill="none" stroke="#9aa4ad" stroke-width="7" stroke-linecap="round"/>
    <rect x="-24" y="-40" width="48" height="14" rx="6" fill="#3a3a40"/>
    <rect x="-30" y="46" width="60" height="8" rx="4" fill="#1d1d21"/>
  </g>
</svg>`)
