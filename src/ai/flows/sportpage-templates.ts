/**
 * Templates profissionais das Sport Pages — nível de referência NFL/NBA.
 *
 * A IA escreve o CONTEÚDO (sportpage-copy.ts); o DESIGN vive aqui, escrito à
 * mão: foto fundida no fundo (sem moldura/recorte aparente), tipografia de
 * impacto, ícones SVG preenchidos nos stats, painel claro com "puxador",
 * timeline com nós de play. Nenhum pixel é decidido pelo modelo.
 *
 * Todos os campos de usuário/IA passam por escapeHtml (regra §6.6).
 * A foto entra via __IMAGE_PLACEHOLDER__ (substituída em dashboard/actions.ts).
 */

import { escapeHtml } from '@/lib/escape-html';
import type { SportpageCopy } from './sportpage-copy';
import { buildFontsHref, hashSeed, type Theme } from './sport-styles';

export type TemplateAthlete = {
  fullName: string;
  dateOfBirth: string;
  sport: string;
  isAmateur: boolean;
  team?: string;
  contact?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  youtubeEmbedUrl?: string | null;
  /** Só no Básico: URL direta da foto (Plus/Premium usam __IMAGE_PLACEHOLDER__). */
  photoUrl?: string;
};

const esc = escapeHtml;
const IMG = '__IMAGE_PLACEHOLDER__';

/* ─── Ícones SVG ───────────────────────────────────────────────────────── */
/* FILL: preenchidos (stats/cards, como nas referências) · STROKE: utilitários */

const FILL_ICONS: Record<string, string> = {
  trophy: '<path d="M6 2h12v2h3v3a5 5 0 0 1-4.5 4.97A6 6 0 0 1 13 15.9V18h3a1 1 0 0 1 1 1v2H7v-2a1 1 0 0 1 1-1h3v-2.1a6 6 0 0 1-3.5-3.93A5 5 0 0 1 3 7V4h3V2zm-1 4v1a3 3 0 0 0 1.2 2.4A9 9 0 0 1 6 7.5V6H5zm14 0h-1v1.5c0 .66-.07 1.3-.2 1.9A3 3 0 0 0 19 7V6z"/>',
  medal: '<path d="M12 8.5 9.2 2H5.5l3.6 7.3A6.5 6.5 0 1 0 12 8.5zm2.8-6.5h3.7l-2.9 5.9a7.6 7.6 0 0 0-2.6-1.2L14.8 2zM12 11a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 1.6 1 1.9 2.1.3-1.5 1.5.3 2.1-1.9-1-1.9 1 .3-2.1-1.5-1.5 2.1-.3 1-1.9z"/>',
  star: '<path d="m12 2 3 6.3 6.9.9-5 4.8 1.2 6.8L12 17.6 5.9 20.8 7.1 14l-5-4.8L9 8.3 12 2z"/>',
  bolt: '<path d="M13.5 2 4 14h6l-1.5 8L18 10h-6l1.5-8z"/>',
  chartBars: '<path d="M4 12h3.5v8H4v-8zm6.25-5h3.5v13h-3.5V7zM16.5 3H20v17h-3.5V3z"/>',
  users: '<path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-3.9 0-7 2.2-7 5v3h14v-3c0-2.8-3.1-5-7-5zm8.5-3.2a3.6 3.6 0 0 0 0-7.1 5.9 5.9 0 0 1 0 7.1zM17 13.4c2.9.7 5 2.5 5 4.6v3h-3v-3c0-1.8-.8-3.4-2-4.6z"/>',
  megaphone: '<path d="M20 3 7 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1.2l1.6 5.4A1 1 0 0 0 6.8 22h2.4a1 1 0 0 0 1-1.3L8.9 16H7l13 5V3z"/>',
  play: '<path d="M8 5.3a1 1 0 0 1 1.5-.9l10.3 6.7a1 1 0 0 1 0 1.7L9.5 19.6A1 1 0 0 1 8 18.7V5.3z"/>',
  quote: '<path d="M6.5 5C4 6.5 2.5 9 2.5 12.5V19h7v-7H5.6c.2-2 1.3-3.6 3.2-4.7L6.5 5zm11 0C15 6.5 13.5 9 13.5 12.5V19h7v-7h-3.9c.2-2 1.3-3.6 3.2-4.7L17.5 5z"/>',
  sparkle: '<path d="M12 1.5 14 9l7.5 2-7.5 2-2 7.5L10 13l-7.5-2L10 9l2-7.5z"/>',
  tiktok: '<path d="M16.6 3c.5 2.2 2 3.7 4.1 4v3.3c-1.6 0-3-.5-4.1-1.4v6.6a6.2 6.2 0 1 1-6.2-6.2c.35 0 .7.03 1 .1v3.4a2.9 2.9 0 1 0 2.1 2.8V3h3.1z"/>',
};

const STROKE_ICONS: Record<string, string> = {
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  phone: '<path d="M6.6 3h3l1.5 4.5-2 1.5a12 12 0 0 0 5.9 5.9l1.5-2L21 14.4v3A2.6 2.6 0 0 1 18.4 20 15.4 15.4 0 0 1 4 5.6 2.6 2.6 0 0 1 6.6 3z"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  arrow: '<path d="M4 12h16M13 5l7 7-7 7"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 10.5V17M12 7.2v.3"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="4"/><path d="M17.2 6.8v.2"/>',
  facebook: '<path d="M14.5 8.5H17V5h-2.5A3.5 3.5 0 0 0 11 8.5V11H8.5v3.5H11V21h3.5v-6.5H17L17.5 11h-3V8.5z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M8 3v4M16 3v4M3.5 10.5h17"/>',
};

function fic(name: keyof typeof FILL_ICONS, size = 22, cls = ''): string {
  return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${FILL_ICONS[name]}</svg>`;
}
function sic(name: keyof typeof STROKE_ICONS, size = 18, cls = ''): string {
  return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${STROKE_ICONS[name]}</svg>`;
}

const STAT_FILL: (keyof typeof FILL_ICONS)[] = ['trophy', 'medal', 'star'];

/* ─── Helpers ──────────────────────────────────────────────────────────── */

function contactHref(contact?: string): { href: string; label: string; ic: string } {
  const c = (contact || '').trim();
  if (c && /^\+?[0-9\s\-()]{8,}$/.test(c)) {
    return { href: `https://wa.me/${c.replace(/\D/g, '')}`, label: 'Falar no WhatsApp', ic: sic('phone', 18) };
  }
  const mail = c && c.includes('@') ? c : 'contato@prosport.ia.br';
  return { href: `mailto:${mail}`, label: 'Enviar proposta', ic: sic('mail', 18) };
}

function splitName(fullName: string): { lead: string; accent: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { lead: parts[0], accent: '' };
  return { lead: parts.slice(0, -1).join(' '), accent: parts[parts.length - 1] };
}

function computeAge(dateOfBirth: string): number | null {
  let d = new Date(dateOfBirth);
  if (isNaN(d.getTime())) {
    const m = dateOfBirth.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
    if (!m) return null;
    d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    if (isNaN(d.getTime())) return null;
  }
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) age--;
  return age > 5 && age < 90 ? age : null;
}

function metaChips(a: TemplateAthlete): string[] {
  const chips = [a.sport, a.isAmateur ? 'Atleta Amador' : 'Atleta Profissional'];
  const age = computeAge(a.dateOfBirth);
  if (age) chips.push(`${age} anos`);
  if (a.team) chips.push(a.team);
  return chips;
}

/** Botões circulares de redes sociais (Instagram, TikTok, Facebook). */
function socialIconRow(a: TemplateAthlete, cls = 'soc'): string {
  const out: string[] = [];
  if (a.instagramUrl) out.push(`<a class="${cls}" href="${esc(a.instagramUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">${sic('instagram', 18)}</a>`);
  if (a.tiktokUrl) out.push(`<a class="${cls}" href="${esc(a.tiktokUrl)}" target="_blank" rel="noopener noreferrer" aria-label="TikTok">${fic('tiktok', 18)}</a>`);
  if (a.facebookUrl) out.push(`<a class="${cls}" href="${esc(a.facebookUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Facebook">${sic('facebook', 18)}</a>`);
  return out.join('');
}

/** Texto sobre a cor de destaque: escuro se o accent for claro (ouro), branco se for escuro. */
function accentInk(hex: string): string {
  const m = hex.replace('#', '');
  const r = parseInt(m.slice(0, 2), 16), g = parseInt(m.slice(2, 4), 16), b = parseInt(m.slice(4, 6), 16);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.62 ? '#161309' : '#ffffff';
}

function baseCss(theme: Theme): string {
  return `
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
img{display:block;max-width:100%}
a{color:inherit}
::selection{background:${theme.accent};color:${accentInk(theme.accent)}}
:focus-visible{outline:2px solid ${theme.accent};outline-offset:3px;border-radius:4px}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
`;
}

function fontLinks(theme: Theme): string {
  return `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="${buildFontsHref(theme)}" rel="stylesheet">`;
}

/** Losangos decorativos semitransparentes (como nas referências NFL/NBA). */
function diamondsSvg(accent: string): string {
  return `<svg class="dias" viewBox="0 0 400 600" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
<g opacity=".16" fill="${accent}">
<rect x="240" y="60" width="90" height="90" transform="rotate(45 285 105)"/>
<rect x="300" y="200" width="140" height="140" transform="rotate(45 370 270)"/>
<rect x="170" y="330" width="70" height="70" transform="rotate(45 205 365)"/>
</g>
<g opacity=".3" stroke="${accent}" stroke-width="1.5">
<rect x="120" y="140" width="110" height="110" transform="rotate(45 175 195)"/>
<rect x="280" y="420" width="90" height="90" transform="rotate(45 325 465)"/>
</g></svg>`;
}

/* ═══ PLUS — editorial imersivo (foto full-bleed, texto sobre a base) ═══ */

export function renderPlusSportpage(a: TemplateAthlete, copy: SportpageCopy, theme: Theme): string {
  const cta = contactHref(a.contact);
  const ink = accentInk(theme.accent);
  const chips = metaChips(a);

  const statsHtml = copy.stats
    .map(
      (s, i) => `
      <div class="stat">
        <span class="stat-ic">${fic(STAT_FILL[i % STAT_FILL.length], 30)}</span>
        <div><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>
      </div>`
    )
    .join('');

  const highlightsHtml = copy.highlights
    .map(
      (h) => `
      <li class="hl">
        <span class="hl-year">${esc(h.year)}</span>
        <div><h3>${esc(h.title)}</h3><p>${esc(h.description)}</p></div>
      </li>`
    )
    .join('');

  const mediaHtml = copy.mediaCaptions
    .slice(0, 2)
    .map(
      (c, i) => `
      <figure class="media-item">
        <div class="media-frame"><img src="${IMG}" alt="${esc(a.fullName)} — ${esc(c)}" loading="lazy"></div>
        <figcaption><span>0${i + 1}</span>${esc(c)}</figcaption>
      </figure>`
    )
    .join('');

  const quotesHtml = copy.testimonials
    .slice(0, 2)
    .map(
      (t) => `
      <figure class="quote">
        <span class="q-ic">${fic('quote', 26)}</span>
        <blockquote>${esc(t.quote)}</blockquote>
        <figcaption>${esc(t.role)}</figcaption>
      </figure>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(a.fullName)} · ${esc(a.sport)}</title>
<meta name="description" content="${esc(copy.metaDescription)}">
${fontLinks(theme)}
<style>
${baseCss(theme)}
:root{--bg:${theme.bg};--surface:${theme.surface};--accent:${theme.accent};--soft:${theme.accentSoft};--aink:${ink};--text:#F3EFE6;--muted:${theme.muted};--line:${theme.line}}
body{background:var(--bg);color:var(--text);font-family:'${theme.bodyFont}',system-ui,sans-serif;line-height:1.65;-webkit-font-smoothing:antialiased}
h1,h2,h3{font-family:'${theme.headFont}','Arial Narrow',sans-serif;text-transform:uppercase;line-height:1.02;letter-spacing:.01em;font-weight:600}
.wrap{max-width:860px;margin:0 auto;padding:0 clamp(20px,4vw,32px)}
.btn{display:inline-flex;align-items:center;gap:.55rem;background:var(--accent);color:var(--aink);padding:.95rem 2rem;border-radius:10px;font-weight:800;font-size:.98rem;text-decoration:none;transition:transform .18s,filter .18s}
.btn:hover{transform:translateY(-2px);filter:brightness(1.06)}
.soc{display:inline-grid;place-items:center;width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,255,255,.28);color:var(--text);text-decoration:none;transition:background .18s,transform .18s}
.soc:hover{background:rgba(255,255,255,.12);transform:translateY(-2px)}
/* NAV */
.nav{position:absolute;inset:0 0 auto 0;z-index:5;padding:1.2rem 0}
.nav .wrap{display:flex;align-items:center;justify-content:space-between}
.nav-links{display:flex;gap:1.7rem;font-size:.9rem;font-weight:600}
.nav-links a{text-decoration:none;color:rgba(243,239,230,.85);transition:color .18s}
.nav-links a:hover{color:#fff}
.nav-links a.on{border-bottom:2px solid var(--accent);padding-bottom:2px}
/* HERO imersivo */
.hero{position:relative;min-height:100svh;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden;isolation:isolate}
.hero-bg{position:absolute;inset:0;z-index:-1}
.hero-bg img{width:100%;height:100%;object-fit:cover;object-position:50% 8%}
.hero-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.30) 0%,transparent 26%,transparent 40%,color-mix(in srgb,var(--bg) 86%,transparent) 78%,var(--bg) 100%),radial-gradient(90% 60% at 50% 110%,color-mix(in srgb,var(--bg) 55%,transparent),transparent)}
.hero-in{padding-bottom:clamp(2.2rem,6vh,4rem)}
.hero h1{font-size:clamp(3.4rem,11vw,7.5rem);color:#F6F1E6;text-shadow:0 4px 30px rgba(0,0,0,.45);max-width:9ch;animation:rise .8s ease both}
.hero .sub{font-size:clamp(.85rem,2.4vw,1.05rem);font-weight:700;letter-spacing:.34em;text-transform:uppercase;color:rgba(243,239,230,.85);margin:.9rem 0 1.4rem;animation:rise .8s .08s both}
.hero .cta-row{display:flex;flex-wrap:wrap;align-items:center;gap:.9rem;animation:rise .8s .14s both}
.stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.2rem;margin-top:clamp(1.8rem,5vh,3rem);padding-top:1.6rem;border-top:1px solid rgba(255,255,255,.22);animation:rise .8s .2s both}
.stat{display:flex;align-items:center;gap:.85rem}
.stat-ic{color:var(--accent);filter:drop-shadow(0 3px 10px rgba(0,0,0,.4))}
.stat strong{display:block;font-family:'${theme.headFont}',sans-serif;font-size:clamp(1.6rem,4.2vw,2.3rem);line-height:1;color:#fff}
.stat span{font-size:.72rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(243,239,230,.75)}
@keyframes rise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
@media(max-width:640px){.stats{grid-template-columns:1fr 1fr}.stat:last-child{grid-column:1/-1}}
/* SEÇÕES */
section{padding:clamp(3.6rem,9vw,6rem) 0}
.sec-h{display:flex;align-items:center;gap:.9rem;margin-bottom:clamp(1.6rem,4vw,2.4rem)}
.sec-h .badge{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:color-mix(in srgb,var(--accent) 18%,transparent);border:1.5px solid var(--accent);color:var(--accent);flex-shrink:0}
.sec-h h2{font-size:clamp(1.7rem,5vw,2.5rem)}
.sec-h::after{content:"";flex:1;height:1.5px;background:linear-gradient(90deg,var(--accent),transparent)}
.about p{font-size:clamp(1.05rem,2.6vw,1.2rem);color:#DDD8CC;max-width:62ch}
.about p::first-letter{font-family:'${theme.headFont}',sans-serif;font-size:3.2em;float:left;line-height:.82;padding-right:.14em;color:var(--accent)}
.chips{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1.6rem}
.chip{font-size:.72rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#DDD8CC;border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:.4rem .9rem}
.hls{list-style:none}
.hl{display:grid;grid-template-columns:96px 1fr;gap:1.3rem;padding:1.4rem .9rem;border-top:1px solid var(--line);transition:background .18s}
.hl:last-child{border-bottom:1px solid var(--line)}
.hl:hover{background:var(--surface)}
.hl-year{font-family:'${theme.headFont}',sans-serif;font-size:1.5rem;color:var(--accent);line-height:1.1}
.hl h3{font-size:1.03rem;margin-bottom:.3rem;color:#F0EBDF}
.hl p{color:var(--muted);font-size:.95rem}
@media(max-width:560px){.hl{grid-template-columns:70px 1fr;gap:.9rem}}
.media-grid{display:grid;grid-template-columns:1fr;gap:1.6rem}
.media-frame{overflow:hidden;border-radius:18px}
.media-item:first-child .media-frame{aspect-ratio:16/10}
.media-item:last-child .media-frame{aspect-ratio:16/12}
.media-frame img{width:100%;height:100%;object-fit:cover;object-position:50% 12%;transition:transform .5s ease}
.media-item:hover img{transform:scale(1.03)}
.media-item figcaption{display:flex;gap:.7rem;align-items:baseline;margin-top:.75rem;color:var(--muted);font-size:.9rem}
.media-item figcaption span{font-family:'${theme.headFont}',sans-serif;color:var(--accent)}
.quotes{display:grid;gap:1.3rem}
.quote{border-left:3px solid var(--accent);padding:.4rem 0 .4rem 1.5rem;display:flex;flex-direction:column;gap:.8rem}
.q-ic{color:var(--accent)}
.quote blockquote{font-size:clamp(1.15rem,3vw,1.45rem);color:#EFEAE0;font-weight:500;line-height:1.45}
.quote figcaption{font-size:.74rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
.contact{text-align:center;background:linear-gradient(180deg,transparent,color-mix(in srgb,var(--accent) 7%,var(--bg)))}
.contact .k{font-size:.76rem;font-weight:700;letter-spacing:.34em;text-transform:uppercase;color:var(--soft)}
.contact h2{font-size:clamp(2.4rem,8vw,4.4rem);margin:.9rem 0 1.8rem}
.contact .row{display:flex;flex-wrap:wrap;gap:.9rem;justify-content:center;align-items:center}
footer{border-top:1px solid var(--line);padding:1.6rem 0;font-size:.82rem;color:var(--muted)}
footer .wrap{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap}
footer a{color:var(--soft);text-decoration:none}
</style>
</head>
<body>
<main>
  <section class="hero" style="padding:0">
    <div class="hero-bg"><img src="${IMG}" alt="Foto de ${esc(a.fullName)}" fetchpriority="high"></div>
    <nav class="nav" aria-label="Seções"><div class="wrap">
      <div class="nav-links"><a class="on" href="#top">Home</a><a href="#sobre">Sobre</a><a href="#carreira">Carreira</a></div>
      <div class="nav-links"><a href="#contato">Contato</a></div>
    </div></nav>
    <div class="wrap hero-in" id="top">
      <h1>${esc(a.fullName)}</h1>
      <p class="sub">${esc(a.isAmateur ? 'Atleta Amador' : 'Atleta Profissional')} · ${esc(a.sport)}</p>
      <div class="cta-row">
        <a class="btn" href="${cta.href}">${cta.ic}${cta.label}</a>
        ${socialIconRow(a)}
      </div>
      <div class="stats">${statsHtml}</div>
    </div>
  </section>

  <section id="sobre" class="about"><div class="wrap">
    <div class="sec-h"><span class="badge">${sic('info', 20)}</span><h2>Sobre</h2></div>
    <p>${esc(copy.about)}</p>
    <div class="chips">${chips.map((c) => `<span class="chip">${esc(c)}</span>`).join('')}</div>
  </div></section>

  <section id="carreira"><div class="wrap">
    <div class="sec-h"><span class="badge">${fic('star', 20)}</span><h2>Career Highlights</h2></div>
    <ul class="hls">${highlightsHtml}</ul>
  </div></section>

  <section id="momentos"><div class="wrap">
    <div class="sec-h"><span class="badge">${fic('bolt', 20)}</span><h2>Momentos</h2></div>
    <div class="media-grid">${mediaHtml}</div>
  </div></section>

  <section><div class="wrap">
    <div class="sec-h"><span class="badge">${fic('quote', 18)}</span><h2>O que dizem</h2></div>
    <div class="quotes">${quotesHtml}</div>
  </div></section>

  <section id="contato" class="contact"><div class="wrap">
    <span class="k">Patrocínio &amp; parcerias</span>
    <h2>Vamos conversar</h2>
    <div class="row">
      <a class="btn" href="${cta.href}">${cta.ic}${cta.label}</a>
      ${socialIconRow(a)}
    </div>
  </div></section>
</main>
<footer><div class="wrap">
  <span>${esc(a.fullName)} · ${esc(a.sport)}</span>
  <span>Sport Page criada com <a href="https://prosport.ia.br" target="_blank" rel="noopener noreferrer">ProSport</a></span>
</div></footer>
</body>
</html>`;
}

/* ═══ PREMIUM — media kit NFL/NBA (hero fundido + painel claro) ═════════ */

function chartSeries(seed: string, n: number, min: number, max: number): number[] {
  let h = hashSeed(seed);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    out.push(min + ((h % 1000) / 1000) * (max - min));
  }
  return out;
}

function lineChartSvg(seed: string, accent: string): string {
  const vals = chartSeries(seed + ':line', 8, 30, 96);
  const w = 320, hgt = 132, pad = 12;
  const pts = vals.map((v, i) => [
    Math.round(pad + (i * (w - pad * 2)) / (vals.length - 1)),
    Math.round(hgt - pad - ((v - 20) / 80) * (hgt - pad * 2)),
  ] as const);
  const line = pts.map((p) => p.join(',')).join(' ');
  const area = `${pad},${hgt - pad} ${line} ${w - pad},${hgt - pad}`;
  const grid = [0.28, 0.52, 0.76]
    .map((f) => `<line x1="${pad}" y1="${Math.round(hgt * f)}" x2="${w - pad}" y2="${Math.round(hgt * f)}" stroke="rgba(0,0,0,.07)"/>`) 
    .join('');
  const dots = pts.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="${accent}"/>`).join('');
  return `<svg viewBox="0 0 ${w} ${hgt}" role="img" aria-label="Gráfico de linha ilustrativo" style="width:100%;height:auto">
<defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${accent}" stop-opacity=".26"/><stop offset="100%" stop-color="${accent}" stop-opacity="0"/></linearGradient></defs>
${grid}<polygon points="${area}" fill="url(#lg)"/><polyline points="${line}" fill="none" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>${dots}</svg>`;
}

function barChartSvg(seed: string, accent: string): string {
  const vals = chartSeries(seed + ':bars', 7, 26, 100);
  const w = 320, hgt = 132, pad = 12, gap = 13;
  const bw = (w - pad * 2 - gap * (vals.length - 1)) / vals.length;
  const bars = vals
    .map((v, i) => {
      const bh = (v / 100) * (hgt - pad * 2);
      return `<rect x="${(pad + i * (bw + gap)).toFixed(1)}" y="${(hgt - pad - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="4" fill="${accent}" opacity="${(0.45 + (i / vals.length) * 0.55).toFixed(2)}"/>`;
    })
    .join('');
  return `<svg viewBox="0 0 ${w} ${hgt}" role="img" aria-label="Gráfico de barras ilustrativo" style="width:100%;height:auto">${bars}<line x1="${pad}" y1="${hgt - pad}" x2="${w - pad}" y2="${hgt - pad}" stroke="rgba(0,0,0,.15)"/></svg>`;
}

export function renderPremiumSportpage(a: TemplateAthlete, copy: SportpageCopy, theme: Theme): string {
  const name = splitName(a.fullName);
  const cta = contactHref(a.contact);
  const ink = accentInk(theme.accent);
  const seed = `${a.fullName}:${a.sport}`;

  const statsHtml = copy.stats
    .map(
      (s, i) => `
      <div class="stat">
        <span class="stat-ic">${fic(STAT_FILL[i % STAT_FILL.length], 34)}</span>
        <div><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>
      </div>`
    )
    .join('');

  const breakdownHtml = copy.breakdown
    .map(
      (b) => `
      <div class="bd-row">
        <span class="bd-sq"></span>
        <div class="bd-mid">
          <div class="bd-top"><span>${esc(b.label)}</span><em>${Math.round(b.percent)}%</em></div>
          <div class="bd-track"><span style="width:${Math.round(b.percent)}%"></span></div>
        </div>
        <span class="bd-ch">${sic('chevron', 15)}</span>
      </div>`
    )
    .join('');

  const nodesHtml = copy.highlights
    .map(
      (h, i) => `
      <li class="node${i === 0 ? ' hot' : ''}">
        <span class="node-c">${fic('play', 14)}</span>
        <span class="node-y">${esc(h.year)}</span>
      </li>`
    )
    .join('');

  const hlCardsHtml = copy.highlights
    .map(
      (h) => `
      <article class="hl-card">
        <span class="hl-y">${esc(h.year)}</span>
        <h3>${esc(h.title)}</h3>
        <p>${esc(h.description)}</p>
      </article>`
    )
    .join('');

  const galleryHtml = [0, 1, 2, 3]
    .map((i) => {
      const cap = copy.mediaCaptions[i % copy.mediaCaptions.length];
      return `
      <figure class="g-card">
        <div class="g-frame"><img src="${IMG}" alt="${esc(a.fullName)} — ${esc(cap)}" loading="lazy"></div>
        <figcaption><img class="g-avatar" src="${IMG}" alt="" aria-hidden="true"><span>${esc(cap)}</span></figcaption>
      </figure>`;
    })
    .join('');

  const testimonialsHtml = copy.testimonials
    .slice(0, 3)
    .map(
      (t) => `
      <figure class="t-card">
        <span class="q-ic">${fic('quote', 24)}</span>
        <blockquote>${esc(t.quote)}</blockquote>
        <figcaption>${esc(t.role)}</figcaption>
      </figure>`
    )
    .join('');

  const videoSection = a.youtubeEmbedUrl
    ? `
      <section id="video">
        <h2 class="p-h2">Em Ação</h2>
        <div class="yt"><iframe src="${esc(a.youtubeEmbedUrl)}" title="Vídeo de ${esc(a.fullName)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>
      </section>`
    : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(a.fullName)} · ${esc(a.sport)} · Media Kit</title>
<meta name="description" content="${esc(copy.metaDescription)}">
${fontLinks(theme)}
<style>
${baseCss(theme)}
:root{--bg:${theme.bg};--surface:${theme.surface};--accent:${theme.accent};--soft:${theme.accentSoft};--aink:${ink};--text:#F3EFE6;--muted:${theme.muted};--line:${theme.line};--panel:#EEF0F2;--ink:#191B20}
body{background:var(--bg);color:var(--text);font-family:'${theme.bodyFont}',system-ui,sans-serif;line-height:1.62;-webkit-font-smoothing:antialiased}
h1,h2,h3{font-family:'${theme.headFont}','Arial Narrow',sans-serif;text-transform:uppercase;line-height:1.02;letter-spacing:.01em;font-weight:600}
.wrap{max-width:1140px;margin:0 auto;padding:0 clamp(20px,4vw,32px)}
.btn{display:inline-flex;align-items:center;gap:.55rem;background:var(--accent);color:var(--aink);padding:.9rem 1.9rem;border-radius:9px;font-weight:800;font-size:.95rem;text-decoration:none;transition:transform .18s,filter .18s}
.btn:hover{transform:translateY(-2px);filter:brightness(1.06)}
.soc{display:inline-grid;place-items:center;width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.28);color:var(--text);text-decoration:none;transition:background .18s,transform .18s}
.soc:hover{background:rgba(255,255,255,.12);transform:translateY(-2px)}
/* NAV */
.nav{position:absolute;inset:0 0 auto 0;z-index:6;padding:1.15rem 0}
.nav .wrap{display:flex;align-items:center;justify-content:space-between}
.nav-links{display:flex;gap:1.6rem;font-size:.88rem;font-weight:600}
.nav-links a{text-decoration:none;color:rgba(243,239,230,.85);transition:color .18s}
.nav-links a:hover{color:#fff}
.nav-links a.on{border-bottom:2px solid var(--accent);padding-bottom:2px}
@media(max-width:720px){.nav-links.sec{display:none}}
/* HERO fundido */
.hero{position:relative;min-height:100svh;display:flex;align-items:center;overflow:hidden;isolation:isolate}
.hero-bg{position:absolute;inset:0;z-index:-2}
.hero-bg img{width:100%;height:100%;object-fit:cover;object-position:74% 10%}
.hero-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,var(--bg) 6%,color-mix(in srgb,var(--bg) 82%,transparent) 34%,transparent 62%),linear-gradient(0deg,var(--bg) 0%,transparent 34%),linear-gradient(180deg,rgba(0,0,0,.35),transparent 30%)}
.dias{position:absolute;right:0;top:0;height:100%;width:min(44vw,460px);z-index:-1;pointer-events:none}
.hero-in{padding:clamp(5.5rem,12vh,7rem) 0 clamp(2.6rem,7vh,4.5rem);width:100%}
.hero-copy{max-width:600px}
.hero h1{font-size:clamp(3.2rem,9vw,6.6rem);color:#F6F1E6;text-shadow:0 4px 30px rgba(0,0,0,.4)}
.hero h1 .ax{color:var(--soft)}
.hero .sub{font-size:clamp(.85rem,2vw,1.05rem);font-weight:700;letter-spacing:.34em;text-transform:uppercase;color:rgba(243,239,230,.8);margin:.9rem 0 1.5rem}
.hero .cta-row{display:flex;flex-wrap:wrap;align-items:center;gap:.9rem}
.stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.4rem;margin-top:clamp(2.2rem,7vh,4rem);max-width:760px}
.stat{display:flex;align-items:center;gap:.9rem}
.stat-ic{color:var(--accent);filter:drop-shadow(0 3px 10px rgba(0,0,0,.4))}
.stat strong{display:block;font-family:'${theme.headFont}',sans-serif;font-size:clamp(1.7rem,3.4vw,2.4rem);line-height:1;color:#fff}
.stat span{font-size:.72rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(243,239,230,.75)}
@media(max-width:680px){.stats{grid-template-columns:1fr 1fr}.stat:last-child{grid-column:1/-1}}
/* PAINEL CLARO */
.panel{position:relative;z-index:2;margin-top:-2.4rem;background:var(--panel);color:var(--ink);border-radius:26px 26px 0 0;box-shadow:0 -20px 60px rgba(0,0,0,.4)}
.handle{position:absolute;top:-13px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:7px;background:var(--accent);color:var(--aink);border-radius:999px;padding:6px 18px}
.handle i{width:5px;height:5px;border-radius:50%;background:currentColor;opacity:.85}
.panel .wrap>section{padding:clamp(2.8rem,6vw,4.2rem) 0}
.p-h2{font-size:clamp(1.25rem,3vw,1.6rem);letter-spacing:.06em;color:var(--ink);margin-bottom:1.4rem}
.card{background:#fff;border:1px solid rgba(0,0,0,.05);border-radius:14px;padding:1.35rem;box-shadow:0 6px 22px rgba(15,18,25,.06)}
.card h3{font-size:.78rem;letter-spacing:.1em;color:rgba(0,0,0,.55);margin-bottom:1rem}
.an-grid{display:grid;grid-template-columns:1.1fr 1.1fr .95fr;gap:1.2rem}
.an-note{font-size:.68rem;color:rgba(0,0,0,.4);letter-spacing:.08em;text-transform:uppercase;margin-top:.8rem}
.bd-row{display:flex;align-items:center;gap:.8rem;padding:.72rem 0;border-bottom:1px solid rgba(0,0,0,.06)}
.bd-row:last-of-type{border-bottom:0}
.bd-sq{width:11px;height:11px;border-radius:3px;background:var(--accent);flex-shrink:0}
.bd-mid{flex:1}
.bd-top{display:flex;justify-content:space-between;font-size:.9rem;font-weight:600;margin-bottom:.4rem}
.bd-top em{font-style:normal;color:color-mix(in srgb,var(--accent) 80%,var(--ink))}
.bd-track{height:6px;border-radius:99px;background:rgba(0,0,0,.08);overflow:hidden}
.bd-track span{display:block;height:100%;border-radius:99px;background:var(--accent)}
.bd-ch{color:rgba(0,0,0,.35)}
@media(max-width:900px){.an-grid{grid-template-columns:1fr}}
/* TIMELINE */
.tl-zone{position:relative}
.tl-strip{display:flex;align-items:center;gap:clamp(.6rem,2.4vw,1.6rem);background:#fff;border:1px solid rgba(0,0,0,.05);border-radius:14px;padding:1.2rem clamp(1rem,3vw,1.8rem);box-shadow:0 6px 22px rgba(15,18,25,.06);overflow-x:auto;list-style:none}
.node{display:flex;flex-direction:column;align-items:center;gap:.45rem;flex-shrink:0;position:relative;padding:0 .35rem}
.node:not(:last-child)::after{content:"";position:absolute;right:-14px;top:16px;width:10px;height:2px;background:rgba(0,0,0,.15)}
.node-c{display:grid;place-items:center;width:36px;height:36px;border-radius:50%;border:2px solid rgba(0,0,0,.22);color:rgba(0,0,0,.4);background:#fff}
.node.hot .node-c{border-color:var(--accent);color:var(--accent)}
.node-y{font-size:.8rem;font-weight:700;color:rgba(0,0,0,.6)}
.vid-card{position:absolute;right:0;top:-4.4rem;width:246px;background:#fff;border-radius:14px;box-shadow:0 20px 50px rgba(0,0,0,.2);border:1px solid rgba(0,0,0,.06);overflow:hidden;transform:rotate(1.6deg);z-index:3}
.vc-frame{position:relative;aspect-ratio:16/10}
.vc-frame img{width:100%;height:100%;object-fit:cover;object-position:50% 10%}
.vc-play{position:absolute;inset:0;display:grid;place-items:center}
.vc-play span{width:44px;height:44px;border-radius:50%;background:var(--accent);color:var(--aink);display:grid;place-items:center;box-shadow:0 8px 22px rgba(0,0,0,.32)}
.vc-x{position:absolute;top:8px;right:8px;width:23px;height:23px;border-radius:50%;background:rgba(0,0,0,.45);color:#fff;display:grid;place-items:center}
.vid-card figcaption{padding:.65rem .9rem;font-size:.8rem;font-weight:600;color:var(--ink)}
@media(max-width:1020px){.vid-card{display:none}}
.hl-cards{display:grid;grid-template-columns:repeat(2,1fr);gap:1.2rem;margin-top:1.4rem}
.hl-card{background:#fff;border:1px solid rgba(0,0,0,.05);border-radius:14px;padding:1.25rem;box-shadow:0 6px 22px rgba(15,18,25,.05)}
.hl-y{font-family:'${theme.headFont}',sans-serif;font-size:1.15rem;color:color-mix(in srgb,var(--accent) 82%,var(--ink))}
.hl-card h3{font-size:.98rem;margin:.3rem 0;color:var(--ink)}
.hl-card p{font-size:.88rem;color:rgba(0,0,0,.58)}
@media(max-width:720px){.hl-cards{grid-template-columns:1fr}}
/* VIDEO / GALLERY / DEPOIMENTOS */
.yt{aspect-ratio:16/9;border-radius:14px;overflow:hidden;box-shadow:0 14px 40px rgba(0,0,0,.14)}
.yt iframe{width:100%;height:100%;border:0}
.gallery{display:grid;grid-template-columns:repeat(4,1fr);gap:1.1rem}
.g-card{background:#fff;border:1px solid rgba(0,0,0,.05);border-radius:14px;padding:.7rem;box-shadow:0 6px 22px rgba(15,18,25,.06);transition:transform .2s,box-shadow .2s}
.g-card:hover{transform:translateY(-4px);box-shadow:0 14px 34px rgba(15,18,25,.11)}
.g-frame{aspect-ratio:4/3.4;border-radius:9px;overflow:hidden}
.g-frame img{width:100%;height:100%;object-fit:cover;object-position:50% 10%}
.g-card figcaption{display:flex;align-items:center;gap:.55rem;padding:.7rem .25rem .3rem;font-size:.8rem;color:rgba(0,0,0,.62)}
.g-avatar{width:28px;height:28px;border-radius:50%;object-fit:cover;object-position:50% 6%;flex-shrink:0}
@media(max-width:940px){.gallery{grid-template-columns:repeat(2,1fr)}}
@media(max-width:520px){.gallery{grid-template-columns:1fr}}
.t-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.2rem}
.t-card{background:#fff;border-radius:14px;padding:1.4rem;border-left:4px solid var(--accent);box-shadow:0 6px 22px rgba(15,18,25,.05);display:flex;flex-direction:column;gap:.8rem}
.q-ic{color:var(--accent)}
.t-card blockquote{font-size:.98rem;color:var(--ink);font-weight:500}
.t-card figcaption{font-size:.7rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(0,0,0,.48)}
@media(max-width:820px){.t-grid{grid-template-columns:1fr}}
/* CONTACT (dentro do painel, como na referência) */
.contact-bar{display:flex;align-items:center;justify-content:space-between;gap:1.2rem;background:#fff;border:1px solid rgba(0,0,0,.05);border-radius:16px;padding:1.4rem 1.6rem;box-shadow:0 6px 22px rgba(15,18,25,.06);position:relative}
.contact-bar .spark{position:absolute;right:-10px;top:-14px;color:var(--accent)}
.contact-bar p{font-size:.95rem;color:rgba(0,0,0,.62);max-width:46ch}
.contact-bar .socs{display:flex;gap:.6rem}
.contact-bar .soc{border-color:rgba(0,0,0,.18);color:var(--ink)}
.contact-bar .soc:hover{background:rgba(0,0,0,.06)}
@media(max-width:760px){.contact-bar{flex-direction:column;align-items:flex-start}}
footer{background:var(--panel);color:rgba(0,0,0,.5);padding:1.4rem 0 2rem;font-size:.8rem}
footer .wrap{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap}
footer a{color:color-mix(in srgb,var(--accent) 80%,var(--ink));text-decoration:none;font-weight:600}
</style>
</head>
<body>
<main>
  <section class="hero" id="top" style="padding:0">
    <div class="hero-bg"><img src="${IMG}" alt="Foto de ${esc(a.fullName)}" fetchpriority="high"></div>
    ${diamondsSvg(theme.accent)}
    <nav class="nav" aria-label="Seções"><div class="wrap">
      <div class="nav-links"><a class="on" href="#top">Home</a><a href="#stats">Stats</a><a href="#media">Media</a><a href="#carreira">Career</a></div>
      <div class="nav-links sec"><a href="#contato">Contact</a></div>
    </div></nav>
    <div class="wrap hero-in">
      <div class="hero-copy">
        <h1>${esc(name.lead)}<br><span class="ax">${esc(name.accent)}</span></h1>
        <p class="sub">${esc(a.isAmateur ? 'Amateur Athlete' : 'Pro Athlete')} · ${esc(a.sport)}</p>
        <div class="cta-row"><a class="btn" href="#stats">Ver perfil completo</a>${socialIconRow(a)}</div>
      </div>
      <div class="stats">${statsHtml}</div>
    </div>
  </section>

  <div class="panel">
    <div class="handle" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="wrap">
      <section id="stats">
        <h2 class="p-h2">Performance Analytics</h2>
        <div class="an-grid">
          <div class="card"><h3>Evolução na temporada</h3>${lineChartSvg(seed, theme.accent)}<p class="an-note">Dados ilustrativos</p></div>
          <div class="card"><h3>Ritmo de competição</h3>${barChartSvg(seed, theme.accent)}<p class="an-note">Dados ilustrativos</p></div>
          <div class="card"><h3>Stat Breakdown</h3>${breakdownHtml}<p class="an-note">Dados ilustrativos</p></div>
        </div>
      </section>

      <section id="carreira">
        <h2 class="p-h2">Career Highlights</h2>
        <div class="tl-zone">
          <figure class="vid-card" aria-hidden="true">
            <div class="vc-frame"><img src="${IMG}" alt=""><span class="vc-play"><span>${fic('play', 18)}</span></span><span class="vc-x">${sic('close', 12)}</span></div>
            <figcaption>${esc(copy.highlights[0]?.year ?? '')} · ${esc(copy.highlights[0]?.title ?? '')}</figcaption>
          </figure>
          <ol class="tl-strip">${nodesHtml}</ol>
          <div class="hl-cards">${hlCardsHtml}</div>
        </div>
      </section>
      ${videoSection}
      <section id="media">
        <h2 class="p-h2">Media Gallery</h2>
        <div class="gallery">${galleryHtml}</div>
      </section>

      <section id="sobre">
        <h2 class="p-h2">Sobre ${esc(a.fullName)}</h2>
        <p style="max-width:70ch;font-size:1.05rem;color:rgba(0,0,0,.68)">${esc(copy.about)}</p>
      </section>

      <section>
        <h2 class="p-h2">Testimonials</h2>
        <div class="t-grid">${testimonialsHtml}</div>
      </section>

      <section id="contato">
        <h2 class="p-h2">Contact</h2>
        <div class="contact-bar">
          <span class="spark">${fic('sparkle', 26)}</span>
          <p>Interessado em patrocinar ${esc(a.fullName)}? Fale direto com o atleta e receba o media kit completo.</p>
          <div class="socs">${socialIconRow(a)}</div>
          <a class="btn" href="${cta.href}">${cta.ic}Get in Touch</a>
        </div>
      </section>
    </div>
  </div>
</main>
<footer><div class="wrap">
  <span>${esc(a.fullName)} · ${esc(a.sport)}</span>
  <span>Media kit criado com <a href="https://prosport.ia.br" target="_blank" rel="noopener noreferrer">ProSport</a></span>
</div></footer>
</body>
</html>`;
}

/* ═══ BÁSICO — proposta de patrocínio (one-pager centrado) ══════════════ */

export function renderBasicSportpage(a: TemplateAthlete, copy: SportpageCopy, theme: Theme): string {
  const cta = contactHref(a.contact);
  const chips = metaChips(a);

  const photoBlock = a.photoUrl
    ? `<div class="ph"><img src="${esc(a.photoUrl)}" alt="Foto de ${esc(a.fullName)}" fetchpriority="high"></div>`
    : `<div class="ph ph-fallback" role="img" aria-label="Atleta de ${esc(a.sport)}"><span>${fic('trophy', 86)}</span></div>`;

  const achievementsList = copy.highlights
    .slice(0, 4)
    .map((h) => `<li>${sic('check', 15)}<span><b>${esc(h.year)}</b> — ${esc(h.title)}</span></li>`)
    .join('');

  const cards = [
    { ic: fic('trophy', 30), title: 'Conquistas', body: `<ul class="mini">${achievementsList}</ul>` },
    { ic: fic('chartBars', 30), title: 'Público', body: `<p>${esc(copy.audienceText)}</p>` },
    { ic: fic('megaphone', 30), title: 'Oportunidades', body: `<p>${esc(copy.opportunitiesText)}</p>` },
  ]
    .map(
      (c) => `
    <article class="pcard">
      <span class="pcard-ic">${c.ic}</span>
      <h3>${c.title}</h3>
      ${c.body}
    </article>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Proposta de Patrocínio · ${esc(a.fullName)}</title>
<meta name="description" content="${esc(copy.metaDescription)}">
${fontLinks(theme)}
<style>
${baseCss(theme)}
:root{--accent:${theme.accent};--accent-dk:color-mix(in srgb,${theme.accent} 72%,#1a1a10);--ink:#23241F;--muted:#5D5F58;--bgp:#F1EFE8;--card:color-mix(in srgb,${theme.accent} 9%,#F5F4EE);--line:rgba(35,36,31,.08)}
body{background:var(--bgp);color:var(--ink);font-family:'${theme.bodyFont}',system-ui,sans-serif;line-height:1.65;-webkit-font-smoothing:antialiased}
h1,h2,h3{font-family:'${theme.headFont}','Arial Narrow',sans-serif;text-transform:uppercase;line-height:1.06;font-weight:600}
.wrap{max-width:860px;margin:0 auto;padding:0 20px}
.topbar{background:var(--accent-dk);color:#fff;padding:1.05rem 0;text-align:center}
.topbar h2{font-size:clamp(1rem,3.4vw,1.35rem);letter-spacing:.3em}
.ph{border-radius:22px;overflow:hidden;margin-top:1.6rem;aspect-ratio:4/3.1;box-shadow:0 20px 50px rgba(35,36,31,.14)}
.ph img{width:100%;height:100%;object-fit:cover;object-position:50% 12%}
.ph-fallback{background:radial-gradient(120% 130% at 22% 0%,var(--accent),var(--accent-dk));display:grid;place-items:center;color:rgba(255,255,255,.92)}
.idn{text-align:center;padding:2rem 0 .6rem}
.idn h1{font-size:clamp(2rem,6.6vw,3.2rem)}
.chips{display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center;margin-top:.9rem}
.chip{font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--accent-dk);background:color-mix(in srgb,var(--accent) 13%,#fff);border:1px solid color-mix(in srgb,var(--accent) 28%,#fff);border-radius:999px;padding:.38rem .85rem}
section{padding:1.9rem 0}
.ov{text-align:center}
.ov h2{font-size:clamp(1.6rem,5vw,2.3rem);color:var(--accent-dk);margin-bottom:1rem}
.ov p{max-width:62ch;margin:0 auto;font-size:1.04rem;color:#3A3B35}
.pgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.1rem}
.pcard{background:var(--card);border-radius:16px;padding:1.7rem 1.4rem;text-align:center;transition:transform .18s,box-shadow .18s}
.pcard:hover{transform:translateY(-3px);box-shadow:0 14px 34px rgba(35,36,31,.10)}
.pcard-ic{display:inline-grid;place-items:center;color:var(--accent-dk);margin-bottom:.8rem}
.pcard h3{font-size:1.05rem;letter-spacing:.06em;margin-bottom:.6rem}
.pcard p{font-size:.92rem;color:var(--muted)}
.mini{list-style:none;display:grid;gap:.55rem;text-align:left}
.mini li{display:flex;gap:.5rem;font-size:.88rem;color:#3A3B35}
.mini svg{color:var(--accent-dk);flex-shrink:0;margin-top:.22rem}
@media(max-width:720px){.pgrid{grid-template-columns:1fr}}
.cta-z{text-align:center;padding:1.4rem 0 2.6rem}
.btn{display:inline-flex;align-items:center;gap:.6rem;background:var(--accent-dk);color:#fff;padding:1.05rem 2.6rem;border-radius:12px;font-weight:800;font-size:1.02rem;text-decoration:none;transition:transform .18s,filter .18s}
.btn:hover{transform:translateY(-2px);filter:brightness(1.1)}
.socs{display:flex;gap:.7rem;justify-content:center;margin-top:1.2rem}
.soc{display:inline-grid;place-items:center;width:42px;height:42px;border-radius:50%;border:1.5px solid color-mix(in srgb,var(--accent-dk) 45%,transparent);color:var(--accent-dk);text-decoration:none;transition:background .18s,transform .18s}
.soc:hover{background:color-mix(in srgb,var(--accent) 14%,#fff);transform:translateY(-2px)}
footer{text-align:center;color:var(--muted);font-size:.8rem;padding:0 0 2.2rem}
footer a{color:var(--accent-dk);text-decoration:none;font-weight:600}
</style>
</head>
<body>
<header class="topbar"><div class="wrap"><h2>Proposta de Patrocínio</h2></div></header>
<main class="wrap">
  ${photoBlock}
  <div class="idn">
    <h1>${esc(a.fullName)}</h1>
    <div class="chips">${chips.map((c) => `<span class="chip">${esc(c)}</span>`).join('')}</div>
  </div>

  <section class="ov">
    <h2>Visão Geral do Atleta</h2>
    <p>${esc(copy.about)}</p>
  </section>

  <section>
    <div class="pgrid">${cards}</div>
  </section>

  <section class="cta-z">
    <a class="btn" href="${cta.href}">${cta.ic}${cta.label}</a>
    <div class="socs">${socialIconRow(a)}</div>
  </section>
</main>
<footer>Sport Page criada com <a href="https://prosport.ia.br" target="_blank" rel="noopener noreferrer">ProSport</a></footer>
</body>
</html>`;
}
