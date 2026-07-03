/**
 * Geração da Sport Page Plus/Premium.
 *
 * Arquitetura (qualidade constante):
 *   1. A IA gera APENAS o conteúdo editorial (JSON validado — sportpage-copy.ts).
 *   2. O design vem dos templates profissionais (sportpage-templates.ts) com o
 *      tema determinístico por atleta/modalidade (sport-styles.ts).
 * A IA nunca escreve HTML/CSS — nenhuma geração sai com layout amador.
 */
import { GenerateEnhancedSportpageInputSchema, type GenerateEnhancedSportpageInput } from './types';
import { generateSportpageCopy } from './sportpage-copy';
import { renderPlusSportpage, renderPremiumSportpage } from './sportpage-templates';
import { buildTheme } from './sport-styles';

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    let id: string | null = null;
    if (u.hostname === 'youtu.be') id = u.pathname.slice(1);
    else if (u.hostname.includes('youtube.com')) id = u.searchParams.get('v') || (u.pathname.startsWith('/shorts/') ? u.pathname.split('/')[2] : null);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

export async function generateEnhancedSportpage(input: GenerateEnhancedSportpageInput): Promise<string> {
  const data = GenerateEnhancedSportpageInputSchema.parse(input);

  const copy = await generateSportpageCopy({
    fullName: data.fullName,
    dateOfBirth: data.dateOfBirth,
    sport: data.sport,
    isAmateur: data.isAmateur,
    details: data.details,
    achievements: data.achievements,
    team: data.team,
  });

  const theme = buildTheme(data.sport, data.fullName);
  const athlete = {
    fullName: data.fullName,
    dateOfBirth: data.dateOfBirth,
    sport: data.sport,
    isAmateur: data.isAmateur,
    team: data.team,
    contact: data.contact,
    instagramUrl: data.instagramUrl,
    facebookUrl: data.facebookUrl,
    tiktokUrl: data.tiktokUrl,
    youtubeEmbedUrl: data.youtubeLink ? getYouTubeEmbedUrl(data.youtubeLink) : null,
  };

  return data.plan === 'premium'
    ? renderPremiumSportpage(athlete, copy, theme)
    : renderPlusSportpage(athlete, copy, theme);
}
