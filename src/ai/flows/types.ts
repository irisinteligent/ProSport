import {z} from 'genkit';

// Sponsor presentation (legacy)
export const GenerateSponsorPresentationInputSchema = z.object({
  fullName: z.string(),
  dateOfBirth: z.string(),
  sport: z.string(),
  isAmateur: z.boolean(),
  achievements: z.string(),
  details: z.string(),
});
export type GenerateSponsorPresentationInput = z.infer<typeof GenerateSponsorPresentationInputSchema>;
export const GenerateSponsorPresentationOutputSchema = z.object({
  presentation: z.string(),
});
export type GenerateSponsorPresentationOutput = z.infer<typeof GenerateSponsorPresentationOutputSchema>;

// Enhanced sportpage (Plus / Premium)
export const GenerateEnhancedSportpageInputSchema = z.object({
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
  youtubeLink: z.string().optional(),
  plan: z.enum(['plus', 'premium']).optional(),
});
export type GenerateEnhancedSportpageInput = z.infer<typeof GenerateEnhancedSportpageInputSchema>;
export type GenerateEnhancedSportpageOutput = string;
