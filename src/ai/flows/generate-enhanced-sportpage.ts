'use server';

import { ai } from '@/ai/genkit';
import { GenerateEnhancedSportpageInputSchema, type GenerateEnhancedSportpageInput } from './types';

export async function generateEnhancedSportpage(input: GenerateEnhancedSportpageInput): Promise<string> {
  return generateEnhancedSportpageFlow(input);
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    let videoId: string | null = null;
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      videoId = urlObj.searchParams.get('v');
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

const generateEnhancedSportpageFlow = ai.defineFlow(
  {
    name: 'generateEnhancedSportpageFlow',
    inputSchema: GenerateEnhancedSportpageInputSchema,
  },
  async (input) => {
    const youtubeEmbed = input.youtubeLink ? getYouTubeEmbedUrl(input.youtubeLink) : null;

    const prompt = [
      'You are an expert web designer. Generate a complete, self-contained HTML page for a professional athlete profile.',
      '',
      'STRICT RULES:',
      '1. Output ONLY raw HTML — no markdown, no code fences, no explanation.',
      '2. Start with <!DOCTYPE html> and include <html>, <head>, <body>.',
      '3. Use only a <style> tag inside <head> for CSS (no external stylesheets).',
      '4. The main athlete photo <img> tag MUST have src="__IMAGE_PLACEHOLDER__" exactly.',
      '5. Dark, modern, sports-themed design (dark bg, bold typography, gold/neon green accent).',
      '6. Must look impressive — like an NFL or NBA player profile card.',
      youtubeEmbed ? `7. Embed YouTube iframe with src="${youtubeEmbed}" width 100% height 400px.` : '',
      '',
      'Athlete data:',
      `- Name: ${input.fullName}`,
      `- Date of Birth: ${input.dateOfBirth}`,
      `- Sport: ${input.sport}`,
      `- Status: ${input.isAmateur ? 'Amateur' : 'Professional'}`,
      `- Details: ${input.details}`,
      `- Achievements: ${input.achievements}`,
      youtubeEmbed ? `- YouTube Embed URL: ${youtubeEmbed}` : '',
    ].filter(Boolean).join('\n');

    const { text } = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      prompt,
    });

    if (!text) {
      throw new Error('AI did not return any content.');
    }

    const cleaned = text
      .replace(/^```html\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    return cleaned;
  }
);
