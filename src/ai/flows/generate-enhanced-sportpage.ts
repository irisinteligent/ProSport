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
    if (urlObj.hostname === 'youtu.be') videoId = urlObj.pathname.slice(1);
    else if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') videoId = urlObj.searchParams.get('v');
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch { return null; }
}

const generateEnhancedSportpageFlow = ai.defineFlow(
  {
    name: 'generateEnhancedSportpageFlow',
    inputSchema: GenerateEnhancedSportpageInputSchema,
  },
  async (input) => {
    const youtubeEmbed = input.youtubeLink ? getYouTubeEmbedUrl(input.youtubeLink) : null;
    const status = input.isAmateur ? 'Atleta Amador' : 'Atleta Profissional';

    const athleteAge = (() => {
      try {
        const [d, m, y] = input.dateOfBirth.split('/');
        const birth = new Date(Number(y), Number(m) - 1, Number(d));
        const now = new Date();
        let age = now.getFullYear() - birth.getFullYear();
        if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
        return age;
      } catch { return ''; }
    })();

    const prompt = `You are an elite sports branding designer. Generate a cinematic, high-impact HTML page for a professional athlete — styled like NFL/NBA player profile pages.

OUTPUT RULES:
- Return ONLY raw HTML starting with <!DOCTYPE html>
- No markdown, no code fences, no explanations
- All content text in Portuguese (Brazil)
- All CSS inside a single <style> tag in <head>
- The athlete photo <img> tag MUST have src="__IMAGE_PLACEHOLDER__" exactly as written

EXACT COLOR PALETTE (mandatory):
- Page background: #0D1810 (very dark forest green/near black)
- Gold accent: #B8962E
- White: #FFFFFF
- Muted text: #8B9E88
- Section bg: #111D13
- Card bg: #162019

EXACT PAGE STRUCTURE:

1. TOP NAVIGATION BAR
   - Fixed or static, full-width, transparent background (no bg color)
   - Three links left-aligned: "Home" | "Sobre" | "Contato"
   - Links: white, font-size 14px, letter-spacing 1px, font-family Arial, no underline
   - Padding: 20px 40px

2. HERO SECTION (full viewport height, position relative)
   - Background: dark green gradient overlay OVER the athlete photo
   - The athlete photo must be:
     <img src="__IMAGE_PLACEHOLDER__" alt="Athlete" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;object-position:center top;z-index:0;opacity:0.65;">
   - Dark gradient overlay on top of photo:
     <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(to right, rgba(13,24,16,0.95) 0%, rgba(13,24,16,0.6) 50%, rgba(13,24,16,0.2) 100%);z-index:1;"></div>
   - Content overlay (z-index:2, position absolute, bottom 15%, left 40px):
     * Athlete name in TWO lines: first name / last name — each on its own line
     * Name font: bold, uppercase, white, 72px on desktop, font-family 'Arial Black' Arial
     * Line-height: 0.9 for name
     * Below name: gold CTA button "FALAR COM O ATLETA" (border-radius 6px, padding 14px 36px, background #B8962E, color #000, font-weight bold, font-size 16px)
   - STATS BAR at the very bottom of the hero (position absolute, bottom 0, full width):
     * Background: rgba(0,0,0,0.6), backdrop-filter blur(4px)
     * Three stats side by side with dividers, each centered
     * Extract 3 concrete stats/numbers from achievements — e.g. "3× Campeão" | "10 Anos de Carreira" | "Atleta ${status}"
     * Gold number/stat label, white description below in 12px

3. ABOUT SECTION (background #111D13, padding 80px 40px)
   - Section label: "SOBRE" — gold color, font-size 13px, letter-spacing 3px, uppercase, margin-bottom 12px
   - Athlete name as h2: white, font-size 36px, Arial Black, margin-bottom 20px
   - Bio paragraph: 3-4 compelling sentences about the athlete, muted color #8B9E88, font-size 17px, line-height 1.9, max-width 700px
   - Athlete sport + status badge: gold border pill badge, e.g. "${input.sport} • ${status}", font-size 13px, gold color, border 1px solid #B8962E, padding 6px 18px, border-radius 20px, display inline-block, margin-top 20px

4. CAREER HIGHLIGHTS SECTION (background #0D1810, padding 80px 40px)
   - Section header: ⭐ "DESTAQUES DA CARREIRA" — gold star emoji + gold text, font-size 13px, letter-spacing 3px, uppercase
   - Horizontal gold line below header: 60px wide, 2px tall, background #B8962E, margin 12px 0 32px
   - List of 4-6 career highlights as items, each with:
     * Gold arrow "→" prefix
     * White text, font-size 16px, line-height 1.6
     * Bottom border: 1px solid rgba(184,150,46,0.15), padding-bottom 14px, margin-bottom 14px
   - Extract these from: ${input.achievements} and ${input.details}

5. SPONSORSHIP CTA SECTION (background #111D13, padding 80px 40px, text-center)
   - Small gold label: "PATROCÍNIO"
   - H2: white, "Seja Parte da Jornada"
   - Paragraph: muted, 2 sentences about sponsorship opportunity in ${input.sport}
   - Two buttons side by side:
     * Primary: gold bg, black text, "Ver Proposta Completa"
     * Secondary: gold border, gold text, transparent bg, "Entrar em Contato"
${youtubeEmbed ? `
6. VIDEO SECTION (background #0D1810, padding 60px 40px, text-center)
   - Section label: "EM AÇÃO" — gold, letter-spacing 3px
   - YouTube iframe: src="${youtubeEmbed}", width 100%, max-width 800px, height 450px, border 0, border-radius 12px, display block, margin 20px auto
` : ''}
6. FOOTER (background #0B140D, padding 30px, text-center)
   - Muted text #8B9E88, font-size 13px
   - "© ProSport | Conectando Atletas ao Mundo"

ATHLETE DATA:
- Full name: ${input.fullName}
- Age: ${athleteAge} anos
- Sport: ${input.sport}
- Status: ${status}
- Details: ${input.details}
- Achievements: ${input.achievements}

CRITICAL REMINDERS:
- The img src must be EXACTLY: __IMAGE_PLACEHOLDER__ (this will be replaced programmatically)
- Mobile responsive: add @media (max-width: 768px) rules for smaller name font and single-column stats
- Generate compelling, specific Portuguese text based on the athlete data provided
- Make it feel cinematic, premium, and professional — like a major sports brand built this page

Generate the complete HTML now:`;

    const { text } = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      prompt,
      config: { maxOutputTokens: 8192 },
    });

    if (!text) throw new Error('AI did not return any content.');

    return text
      .replace(/^```html\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
  }
);
