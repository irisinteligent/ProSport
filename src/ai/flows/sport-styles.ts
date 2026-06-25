// Biblioteca de estilos visuais por modalidade + helpers de geração
export type StylePack = {
  palettes: string[][];
  fonts: string[][];
  bgHints: string[];
  icons: string[];
  ctas: string[];
};

export const STYLE_BY_SPORT: Record<string, StylePack> = {
  "Jiu-Jitsu": {
    palettes: [
      ["#0b0b0d", "#e11d48", "#22d3ee", "#f1f5f9"],
      ["#0d0f12", "#c1121f", "#ffba08", "#e6e6eb"],
      ["#0b0b0d", "#ea580c", "#eab308", "#e5e7eb"],
    ],
    fonts: [["Montserrat", "Inter"], ["Oswald", "Lato"], ["Bebas Neue", "Inter"]],
    bgHints: ["textura de tatame com blur", "trama de kimono escuro", "dojo PB"],
    icons: ["\uD83E\uDD4B", "\uD83C\uDFC6", "\uD83C\uDDE7\uD83C\uDDF7"],
    ctas: ["Patrocinar agora", "Falar com o atleta", "Quero apoiar"],
  },
  "Futebol": {
    palettes: [
      ["#0a1628", "#22c55e", "#facc15", "#f8fafc"],
      ["#0f172a", "#16a34a", "#f59e0b", "#f1f5f9"],
    ],
    fonts: [["Oswald", "Inter"], ["Bebas Neue", "Roboto"]],
    bgHints: ["gramado sob holofotes", "campo aéreo noturno"],
    icons: ["\u26BD", "\uD83C\uDFC6", "\uD83C\uDDE7\uD83C\uDDF7"],
    ctas: ["Patrocinar o atleta", "Falar agora", "Quero investir"],
  },
  "MMA": {
    palettes: [
      ["#0b0b0d", "#dc2626", "#f97316", "#f1f5f9"],
      ["#0d0f12", "#7c3aed", "#f59e0b", "#e6e6eb"],
    ],
    fonts: [["Bebas Neue", "Inter"], ["Oswald", "Lato"]],
    bgHints: ["octógono iluminado", "ringue sob luz dramática"],
    icons: ["\uD83E\uDD4A", "\uD83C\uDFC6", "\uD83D\uDD25"],
    ctas: ["Patrocinar agora", "Investir no atleta"],
  },
  "Natação": {
    palettes: [
      ["#0c1a2e", "#0ea5e9", "#06b6d4", "#f0f9ff"],
      ["#0f172a", "#2563eb", "#38bdf8", "#f1f5f9"],
    ],
    fonts: [["Montserrat", "Inter"], ["Raleway", "Lato"]],
    bgHints: ["piscina olímpica aérea", "respingo de água em slow-motion"],
    icons: ["\uD83C\uDFCA", "\uD83C\uDFC6", "\uD83C\uDF0A"],
    ctas: ["Patrocinar agora", "Apoiar o atleta"],
  },
  "Atletismo": {
    palettes: [
      ["#0b0b0d", "#f97316", "#facc15", "#f8fafc"],
    ],
    fonts: [["Bebas Neue", "Inter"]],
    bgHints: ["pista de atletismo aérea", "linha de chegada"],
    icons: ["\uD83C\uDFC3", "\uD83C\uDFC6", "\u26A1"],
    ctas: ["Patrocinar agora", "Apoiar o atleta"],
  },
};

export const FALLBACK_STYLE: StylePack = {
  palettes: [["#0b0b0d", "#22d3ee", "#e11d48", "#f1f5f9"]],
  fonts: [["Montserrat", "Inter"]],
  bgHints: ["gradiente esportivo suave"],
  icons: ["\u2B50"],
  ctas: ["Quero patrocinar"],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function buildStyleHint(modalidade: string): string {
  const key = Object.keys(STYLE_BY_SPORT).find((k) =>
    (modalidade || "").toLowerCase().includes(k.toLowerCase())
  );
  const pack = key ? STYLE_BY_SPORT[key] : FALLBACK_STYLE;
  const palette = pick(pack.palettes);
  const fonts = pick(pack.fonts);
  const bg = pick(pack.bgHints);
  const [bgc, primary, accent, text = "#f1f5f9"] = palette;
  const [fontHead, fontBody] = fonts;

  return `Diretrizes visuais sugeridas:
- Paleta (hex): BG ${bgc} | Primária ${primary} | Acento ${accent} | Texto ${text}
- Tipografia (Google Fonts): Títulos "${fontHead}", Corpo "${fontBody}"
- Background temático: ${bg}
- Ícones sugeridos: ${pack.icons.join(" ")}
- CTA sugerido: "${pick(pack.ctas)}"
(OBS: Alterne hero, proporções e grade a cada geração.)`.trim();
}

export function buildCTA(nome: string, contato: string): string {
  const isPhone = /^\+?[0-9\s\-()+]+$/.test((contato || "").trim());
  const href = isPhone
    ? `https://wa.me/${contato.replace(/\D/g, "")}`
    : `mailto:${contato}`;
  const label = isPhone ? "Falar no WhatsApp" : `Patrocinar ${nome}`;
  return `<a href="${href}" style="display:inline-block;background:var(--primary,#e11d48);color:#fff;padding:14px 36px;border-radius:12px;font-weight:700;font-size:16px;text-decoration:none;transition:opacity .2s">${label}</a>`;
}
