/**
 * Geração da Sport Page Básica (proposta de patrocínio).
 * Mesma arquitetura do Plus/Premium: IA só escreve o conteúdo (JSON),
 * o design vem do template profissional (sportpage-templates.ts).
 */
import { z } from 'genkit';
import { generateSportpageCopy } from './sportpage-copy';
import { renderBasicSportpage } from './sportpage-templates';
import { buildTheme } from './sport-styles';

export const BasicSportpageInputSchema = z.object({
  fullName: z.string(),
  dateOfBirth: z.string(),
  sport: z.string(),
  isAmateur: z.boolean(),
  details: z.string(),
  achievements: z.string(),
  team: z.string().optional(),
  contact: z.string().optional(),
  instagramUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
  photoUrl: z.string().optional(),
});

export type BasicSportpageInput = z.infer<typeof BasicSportpageInputSchema>;

export async function generateBasicSportpage(input: BasicSportpageInput): Promise<string> {
  const data = BasicSportpageInputSchema.parse(input);

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

  return renderBasicSportpage(
    {
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      sport: data.sport,
      isAmateur: data.isAmateur,
      team: data.team,
      contact: data.contact,
      instagramUrl: data.instagramUrl,
      facebookUrl: data.facebookUrl,
      tiktokUrl: data.tiktokUrl,
      photoUrl: data.photoUrl,
    },
    copy,
    theme
  );
}
