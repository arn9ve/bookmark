import type { RestaurantPriority } from '@/src/types';

function getCSSVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

/**
 * Ottieni i colori per una priorità specifica
 */
type Colors = { primary: string; secondary: string; border: string };

function getColorsForPriority(priority: RestaurantPriority): Colors {
  const yellow = getCSSVar('--accent-1', '#FFDD00');
  const blue = getCSSVar('--primary', '#0047FF');
  const wash = getCSSVar('--surface-secondary', '#FFFBEA');
  const surface = getCSSVar('--surface', '#FFFFFF');
  const border = getCSSVar('--border-dark', '#000000');

  switch (priority) {
    case 'must-visit':
      return { primary: yellow, secondary: '#000000', border };
    case 'recommended':
      // Contrasto migliore: segno di spunta bianco su blu
      return { primary: blue, secondary: surface, border };
    case 'if-in-area':
      return { primary: wash, secondary: surface, border };
    default:
      return { primary: surface, secondary: wash, border };
  }
}

/**
 * Genera l'SVG per il simbolo della priorità
 * - must-visit: stella pulita e centrata
 * - recommended: check mark
 * - if-in-area: pallino centrale discreto
 */
function getPrioritySymbol(priority: RestaurantPriority, size: number, colors: Colors): string {
  const center = size / 2;
  const iconSize = size * 0.5;

  // Helper: stella regolare
  const starPath = (() => {
    const outerR = iconSize * 0.5;
    const innerR = outerR * 0.5;
    const points = 5;
    const angleStep = Math.PI / points; // 36°
    const cx = center;
    const cy = center;
    const pts: Array<[number, number]> = [];
    for (let i = 0; i < points * 2; i += 1) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = -Math.PI / 2 + i * angleStep;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    const [sx, sy] = pts[0]!;
    return `M ${sx} ${sy} ` + pts.slice(1).map(([x, y]) => `L ${x} ${y}`).join(' ') + ' Z';
  })();

  // Helper: check mark armonizzato
  const checkPath = (() => {
    const w = iconSize * 0.9;
    const h = iconSize * 0.6;
    const x = center - w / 2;
    const y = center - h / 2;
    const x1 = x + w * 0.1;
    const y1 = y + h * 0.55;
    const x2 = x + w * 0.38;
    const y2 = y + h * 0.8;
    const x3 = x + w * 0.9;
    const y3 = y + h * 0.2;
    return `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3}`;
  })();

  switch (priority) {
    case 'must-visit':
      return `<path d="${starPath}" fill="${colors.secondary}" stroke="${colors.border}" stroke-width="1.5" stroke-linejoin="round" shape-rendering="geometricPrecision" vector-effect="non-scaling-stroke"/>`;
    case 'recommended':
      return `<path d="${checkPath}" fill="none" stroke="${colors.secondary}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`;
    case 'if-in-area': {
      const r = iconSize * 0.16;
      return `<circle cx="${center}" cy="${center}" r="${r}" fill="${colors.secondary}" stroke="${colors.border}" stroke-width="1"/>`;
    }
    default:
      return '';
  }
}

/**
 * Genera l'SVG per il simbolo del maiale
 */
function getPorkSymbol(size: number): string {
  const tagR = size * 0.28;
  const cx = size - tagR * 0.9;
  const cy = size - tagR * 0.9;
  const yellow = getCSSVar('--accent-1', '#FFDD00');
  const border = getCSSVar('--border-dark', '#000000');
  return `
    <g>
      <circle cx="${cx}" cy="${cy}" r="${tagR}" fill="${yellow}" stroke="${border}" stroke-width="2" />
      <text x="${cx}" y="${cy + tagR*0.1}" text-anchor="middle" font-size="${size*0.24}" fill="#000" font-weight="bold">🐷</text>
    </g>
  `;
}

/**
 * Genera l'SVG marker completo
 */
function generateMarkerSVG(
  priority: RestaurantPriority,
  isPorkSpecialist = false,
  size = 40,
  highlightColor?: string
): string {
  const colors = getColorsForPriority(priority);
  const centerX = size / 2;
  
  // If highlighted, add an outer thick accent ring, an animated pulse, and an offset dark border for brutalist contrast
  const outerRing = highlightColor ? (() => {
    const ringR = centerX - 1;
    const pulseTo = ringR + 8;
    return `
      <!-- Pulsing ring -->
      <circle cx="${centerX}" cy="${centerX}" r="${ringR}" fill="none" stroke="${highlightColor}" stroke-width="4" opacity="0.6">
        <animate attributeName="r" values="${ringR}; ${pulseTo}; ${ringR}" dur="1.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0.15;0.6" dur="1.6s" repeatCount="indefinite" />
      </circle>
      <!-- Outer highlight ring -->
      <circle cx="${centerX}" cy="${centerX}" r="${ringR}" fill="none" stroke="${highlightColor}" stroke-width="6" opacity="0.95"/>
      <!-- Offset dark border for brutalist effect -->
      <circle cx="${centerX + 3}" cy="${centerX + 3}" r="${ringR}" fill="none" stroke="${colors.border}" stroke-width="3" opacity="1"/>
    `;
  })() : '';

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="2" stdDeviation="0" flood-color="rgba(0,0,0,1)"/>
        </filter>
      </defs>
      ${outerRing}
      <circle cx="${centerX}" cy="${centerX}" r="${centerX-2}" fill="${colors.primary}" stroke="${colors.border}" stroke-width="${highlightColor ? 3 : 2}" filter="url(#shadow)" />
      ${getPrioritySymbol(priority, size, colors)}
      ${isPorkSpecialist ? getPorkSymbol(size) : ''}
    </svg>
  `;
}

/**
 * Converte l'SVG in una stringa data URL per Google Maps
 */
export const getMarkerIcon = (
  priority: RestaurantPriority,
  isPorkSpecialist = false,
  size = 40,
  highlightColor?: string
): string => {
  const svgString = generateMarkerSVG(priority, isPorkSpecialist, size, highlightColor);
  const encodedSvg = encodeURIComponent(svgString).replace(/'/g, '%27');
  return `data:image/svg+xml,${encodedSvg}`;
};

/**
 * Ottieni dimensioni del marker basate sulla priorità
 */
export const getMarkerSize = (priority: RestaurantPriority): { width: number; height: number } => {
  switch (priority) {
    case 'must-visit':
      return { width: 42, height: 42 };
    case 'recommended':
      return { width: 36, height: 36 };
    case 'if-in-area':
      return { width: 30, height: 30 };
    default:
      return { width: 30, height: 30 };
  }
};