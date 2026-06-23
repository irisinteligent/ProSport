
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

Instructions:
1.  Generate ONLY the HTML content for the <body> tag.
2.  Do NOT include <!DOCTYPE html>, <html>, <head>, <body>, or <script> tags.
3.  Do NOT use Tailwind CSS or any other CSS framework class names (e.g. no "bg-gray-900", "flex", "p-4") — this HTML is rendered in an isolated context with no stylesheet loaded, so framework classes have zero visual effect. Style every element with inline "style" attributes (or a single <style> block with plain CSS at the top) using explicit colors, fonts, spacing and layout, the same way you'd write a self-contained HTML email.
4.  Always set explicit "background-color" and "color" on the root container — never rely on the browser's default colors.
5.  The 'src' attribute for the main athlete image MUST be exactly "__IMAGE_PLACEHOLDER__". Do not use any other placeholder.
6.  If a 'youtubeLink' is provided, you MUST include a section with an embedded YouTube video player. The 'src' for the iframe must be the direct embed URL.

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
