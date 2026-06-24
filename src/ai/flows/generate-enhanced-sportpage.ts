
'use server';
/**
 * @fileOverview A flow to generate an enhanced, visually appealing sportpage for an athlete.
 * 
 * This flow takes athlete data and generates an HTML page with a professional,
 * modern design inspired by major sports leagues (NFL, NBA).
 *
 * - generateEnhancedSportpage - A function that handles the sportpage generation.
 */

import {ai} from '@/ai/genkit';
import { GenerateEnhancedSportpageInputSchema, GenerateEnhancedSportpageOutputSchema, type GenerateEnhancedSportpageInput, type GenerateEnhancedSportpageOutput } from './types';

/**
 * Generates an enhanced sportpage by calling the Genkit flow.
 * @param input The athlete's data.
 * @returns An object containing the generated HTML for the sportpage.
 */
export async function generateEnhancedSportpage(input: GenerateEnhancedSportpageInput): Promise<GenerateEnhancedSportpageOutput> {
  return generateEnhancedSportpageFlow(input);
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  let videoId = null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === "youtu.be") {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname === "www.youtube.com" || urlObj.hostname === "youtube.com") {
      videoId = urlObj.searchParams.get("v");
    }
  } catch (e) {
    // Invalid URL
    return null;
  }
  
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return null;
}

const generateEnhancedSportpagePrompt = ai.definePrompt({
    name: 'generateEnhancedSportpagePrompt',
    input: { schema: GenerateEnhancedSportpageInputSchema },
    output: { schema: GenerateEnhancedSportpageOutputSchema },
    model: 'googleai/gemini-2.5-flash',
    prompt: `
You are an expert web designer creating a self-contained, professional athlete profile page inspired by major sports leagues (NFL/NBA).

Technical instructions:
1.  Generate ONLY the HTML content for the <body> tag.
2.  Do NOT include <!DOCTYPE html>, <html>, <head>, <body>, or <script> tags.
3.  Do NOT use Tailwind CSS or any other CSS framework class names (e.g. no "bg-gray-900", "flex", "p-4") — this HTML is rendered in an isolated context with no stylesheet loaded, so framework classes have zero visual effect. Style every element with inline "style" attributes (or a single <style> block with plain CSS at the top) using explicit colors, fonts, spacing and layout, the same way you'd write a self-contained HTML email.
4.  Always set explicit "background-color" and "color" on the root container — never rely on the browser's default colors.
5.  The 'src' attribute for the main athlete image MUST be exactly "__IMAGE_PLACEHOLDER__". Do not use any other placeholder.
6.  If a 'youtubeLink' is provided, you MUST include a section with an embedded YouTube video player. The 'src' for the iframe must be the direct embed URL.

Layout — this is the MINIMUM acceptable structure, always include all four sections below in this order:
1.  **Hero**: the athlete photo (__IMAGE_PLACEHOLDER__) as a large image filling the top of the page, with a dark gradient overlay (e.g. linear-gradient from transparent to a near-black tone) over its lower portion so text stays legible on top of it. Overlaid near the bottom of the photo: the athlete's full name in very large, bold, uppercase white letters, and below it a smaller line with the sport and status (Amateur/Professional). Below the photo, a pill-shaped call-to-action button styled like "Get in Touch" using a gold/amber accent color (e.g. #f5c518 or similar) with dark text.
2.  **Stat badges row**: 2 to 3 highlight badges side by side, each with a small icon (use a simple unicode symbol like 🏆, 🥇, ⭐ — no external icon library), a bold number/short stat, and a short label underneath, derived from the achievements/details provided (e.g. count titles, or highlight the most impressive credential). Match the gold/amber accent color used in the hero CTA.
3.  **About**: a small icon, an "ABOUT" heading, and a paragraph written from the "Details" field (and general athlete context) describing the athlete professionally.
4.  **Career Highlights**: a star icon and a "CAREER HIGHLIGHTS" heading, followed by the achievements as a clean list (one item per achievement).

Visual style: dark theme overall (charcoal/near-black background, e.g. #14171c), white/light-gray text, the same gold/amber accent color used consistently across the CTA, stat badges and section icons. Professional, sports-broadcast feel — similar to an NFL/NBA player card.

Use the following data to create the page:
- Full Name: {{{fullName}}}
- Date of Birth: {{{dateOfBirth}}}
- Sport: {{{sport}}}
- Status: {{#if isAmateur}}Amateur{{else}}Professional{{/if}}
- Details: {{{details}}}
- Achievements: {{{achievements}}}
{{#if youtubeLink}}
- YouTube Video: {{{youtubeLink}}}
{{/if}}
`,
});

const generateEnhancedSportpageFlow = ai.defineFlow(
  {
    name: 'generateEnhancedSportpageFlow',
    inputSchema: GenerateEnhancedSportpageInputSchema,
    outputSchema: GenerateEnhancedSportpageOutputSchema,
  },
  async (input) => {
    const embeddableYoutubeLink = input.youtubeLink ? getYouTubeEmbedUrl(input.youtubeLink) : null;
    
    const promptInput = {
      ...input,
      youtubeLink: embeddableYoutubeLink ?? undefined, // Use the embeddable link for the prompt
    };

    const { output } = await generateEnhancedSportpagePrompt(promptInput);
    if (!output) {
      throw new Error("AI failed to generate a response.");
    }
    return output;
  }
);
