/**
 * Sistema de temas visuais por modalidade.
 *
 * A escolha de paleta/fontes é DETERMINÍSTICA por atleta (hash do seed):
 * o mesmo atleta sempre recebe o mesmo tema (consistência de marca pessoal),
 * e atletas diferentes recebem variações — sem a loteria do Math.random().
 * O design em si NÃO é decidido pela IA: vive nos templates
 * (sportpage-templates.ts), que consomem este tema.
 */

export type Theme = {
  /** Fundo principal (escuro) */
  bg: string;
  /** Superfície elevada sobre o fundo */
  surface: string;
  /** Cor de destaque principal */
  accent: string;
  /** Variação clara do destaque (texto sobre fundo escuro) */
  accentSoft: string;
  /** Texto principal sobre fundo escuro */
  text: string;
  /** Texto secundário */
  muted: string;
  /** Bordas/linhas sutis */
  line: string;
  /** Painel claro (Premium) */
  panel: string;
  /** Tinta sobre painel claro */
  panelInk: string;
  headFont: string;
  bodyFont: string;
};

type Palette = { bg: string; surface: string; accent: string; accentSoft: string };
type StylePack = { palettes: Palette[]; fonts: [string, string][] };

const P = (bg: string, surface: string, accent: string, accentSoft: string): Palette => ({
  bg, surface, accent, accentSoft,
});

const STYLE_BY_SPORT: Record<string, StylePack> = {
  'jiu-jitsu': {
    palettes: [
      P('#0B0B0F', '#15151C', '#E11D48', '#FB7185'),
      P('#0C0A08', '#171310', '#EAB308', '#FDE047'),
      P('#0B0D12', '#141821', '#DC2626', '#F87171'),
    ],
    fonts: [['Oswald', 'Inter'], ['Bebas Neue', 'Inter'], ['Anton', 'Manrope']],
  },
  futebol: {
    palettes: [
      P('#071426', '#0D1F38', '#22C55E', '#86EFAC'),
      P('#08120C', '#101F16', '#4ADE80', '#BBF7D0'),
      P('#0B1120', '#131C31', '#FACC15', '#FDE68A'),
    ],
    fonts: [['Oswald', 'Inter'], ['Anton', 'Inter'], ['Bebas Neue', 'Manrope']],
  },
  mma: {
    palettes: [
      P('#0B0B0D', '#151518', '#DC2626', '#F87171'),
      P('#0C0A10', '#16121D', '#8B5CF6', '#C4B5FD'),
    ],
    fonts: [['Bebas Neue', 'Inter'], ['Oswald', 'Inter']],
  },
  boxe: {
    palettes: [
      P('#0D0B10', '#171420', '#EF4444', '#FCA5A5'),
      P('#0B0B0D', '#151518', '#EAB308', '#FDE047'),
    ],
    fonts: [['Bebas Neue', 'Inter'], ['Anton', 'Manrope']],
  },
  natacao: {
    palettes: [
      P('#061826', '#0C2438', '#0EA5E9', '#7DD3FC'),
      P('#071A2E', '#0E2742', '#22D3EE', '#A5F3FC'),
    ],
    fonts: [['Montserrat', 'Inter'], ['Oswald', 'Inter']],
  },
  atletismo: {
    palettes: [
      P('#0C0A09', '#171412', '#F97316', '#FDBA74'),
      P('#0B0E14', '#141926', '#FACC15', '#FDE68A'),
    ],
    fonts: [['Bebas Neue', 'Inter'], ['Oswald', 'Manrope']],
  },
  basquete: {
    palettes: [
      P('#120B07', '#1E130C', '#F97316', '#FDBA74'),
      P('#0B0B0F', '#15151C', '#FBBF24', '#FDE68A'),
    ],
    fonts: [['Anton', 'Inter'], ['Oswald', 'Inter']],
  },
  volei: {
    palettes: [P('#0B1120', '#131C31', '#FACC15', '#FDE68A')],
    fonts: [['Oswald', 'Inter']],
  },
  tenis: {
    palettes: [P('#0A140E', '#122019', '#A3E635', '#D9F99D')],
    fonts: [['Oswald', 'Inter'], ['Montserrat', 'Inter']],
  },
  hipismo: {
    palettes: [
      P('#14100B', '#201A12', '#C8A24A', '#E8CF8F'),
      P('#0F1210', '#181D1A', '#B45309', '#FCD34D'),
    ],
    fonts: [['Oswald', 'Manrope'], ['Montserrat', 'Inter']],
  },
  ciclismo: {
    palettes: [P('#0B0E14', '#141926', '#F43F5E', '#FDA4AF')],
    fonts: [['Oswald', 'Inter']],
  },
  surfe: {
    palettes: [P('#06222B', '#0C3340', '#2DD4BF', '#99F6E4')],
    fonts: [['Montserrat', 'Inter']],
  },
  judo: {
    palettes: [P('#0B0B0F', '#15151C', '#2563EB', '#93C5FD')],
    fonts: [['Oswald', 'Inter']],
  },
  karate: {
    palettes: [P('#0C0A08', '#171310', '#DC2626', '#F87171')],
    fonts: [['Oswald', 'Inter']],
  },
  ginastica: {
    palettes: [P('#120B12', '#1D131D', '#EC4899', '#F9A8D4')],
    fonts: [['Montserrat', 'Inter']],
  },
};

const FALLBACK: StylePack = {
  palettes: [
    P('#0B0E14', '#141926', '#38BDF8', '#7DD3FC'),
    P('#0B0B0F', '#15151C', '#E11D48', '#FB7185'),
    P('#0C0A09', '#171412', '#F97316', '#FDBA74'),
  ],
  fonts: [['Oswald', 'Inter'], ['Bebas Neue', 'Inter'], ['Montserrat', 'Manrope']],
};

function normalize(s: string): string {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

/** Hash determinístico (djb2) — mesma entrada, mesmo tema. */
export function hashSeed(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (((h << 5) + h) ^ s.charCodeAt(i)) >>> 0;
  return h;
}

export function buildTheme(sport: string, seed: string): Theme {
  const key = normalize(sport);
  let pack = FALLBACK;
  for (const [k, v] of Object.entries(STYLE_BY_SPORT)) {
    if (key === k || key.includes(k) || k.includes(key)) { pack = v; break; }
  }
  const h = hashSeed(`${key}::${normalize(seed)}`);
  const palette = pack.palettes[h % pack.palettes.length];
  const [headFont, bodyFont] = pack.fonts[(h >>> 3) % pack.fonts.length];

  return {
    ...palette,
    text: '#F4F4F5',
    muted: '#A1A1AA',
    line: 'rgba(255,255,255,.10)',
    panel: '#F6F5F1',
    panelInk: '#17171C',
    headFont,
    bodyFont,
  };
}

/** Fontes de peso único no Google Fonts (não aceitam wght@...). */
const SINGLE_WEIGHT_FONTS = new Set(['Bebas Neue', 'Anton']);

export function buildFontsHref(theme: Theme): string {
  const fam = (name: string, weights: string) =>
    SINGLE_WEIGHT_FONTS.has(name)
      ? `family=${encodeURIComponent(name).replace(/%20/g, '+')}`
      : `family=${encodeURIComponent(name).replace(/%20/g, '+')}:wght@${weights}`;
  return `https://fonts.googleapis.com/css2?${fam(theme.headFont, '500;600;700')}&${fam(theme.bodyFont, '400;500;600;700')}&display=swap`;
}
