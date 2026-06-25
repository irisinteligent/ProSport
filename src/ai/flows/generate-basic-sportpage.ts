'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BasicSportpageInputSchema = z.object({
  fullName: z.string(),
  dateOfBirth: z.string(),
  sport: z.string(),
  isAmateur: z.boolean(),
  details: z.string(),
  achievements: z.string(),
  photoUrl: z.string().optional(),
  contactInfo: z.string().optional(),
});

export type BasicSportpageInput = z.infer<typeof BasicSportpageInputSchema>;

const generateBasicSportpageFlow = ai.defineFlow(
  {
    name: 'generateBasicSportpageFlow',
    inputSchema: BasicSportpageInputSchema,
  },
  async (input) => {
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

    const contact = input.contactInfo || 'Entre em contato para parcerias';
    const status = input.isAmateur ? 'Atleta Amador' : 'Atleta Profissional';

    const heroBlock = input.photoUrl
      ? `<img src="${input.photoUrl}" alt="${input.fullName}" style="width:100%;height:420px;object-fit:cover;object-position:top;display:block;">`
      : `<div style="width:100%;height:420px;background:linear-gradient(135deg,#1E4025 0%,#2D5C35 50%,#3A7040 100%);display:flex;align-items:center;justify-content:center;font-size:90px;">🏆</div>`;

    const prompt = `You are a Brazilian sports marketing expert. Generate a complete, self-contained HTML page for an athlete's SPONSORSHIP PROPOSAL.

OUTPUT RULES:
- Return ONLY raw HTML starting with <!DOCTYPE html>
- No markdown, no code fences, no explanations
- All text must be in Portuguese (Brazil)
- CSS must be entirely inside a single <style> tag in <head>

EXACT COLOR PALETTE (do not deviate):
- Page background: #F5F0E8 (warm cream/beige)
- Primary green: #1E4025 (dark forest green)
- Card background: #E8E2D6 (slightly darker cream)
- Text: #1a1a1a
- Accent text: #444

EXACT PAGE STRUCTURE TO IMPLEMENT:

1. HEADER BAR
   - Full-width, background #1E4025
   - Centered white text: "PROPOSTA DE PATROCÍNIO"
   - Font: Arial Black, 24px, letter-spacing 4px, uppercase
   - Padding: 28px top/bottom

2. HERO IMAGE BLOCK (insert this exact HTML block after header):
<div style="margin:24px;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.18);">
${heroBlock}
</div>

3. ATHLETE OVERVIEW SECTION
   - Centered h2: "Visão Geral do Atleta" in color #1E4025, font-size 32px, Georgia serif
   - Below: 2-3 sentence compelling bio paragraph about this specific athlete
   - Paragraph centered, max-width 640px, font-size 17px, line-height 1.8

4. THREE CARDS ROW (flexbox, centered, gap 16px)
   Each card: background #E8E2D6, border-radius 14px, padding 28px, text-centered
   
   Card 1 - CONQUISTAS:
   - Icon: 🏆 (font-size 42px)
   - Title: "Conquistas" (bold, #1E4025, font-size 18px, Arial Black)
   - 2-3 sentences about the athlete's specific titles and achievements
   
   Card 2 - AUDIÊNCIA:
   - Icon: 📊
   - Title: "Audiência"
   - 2-3 sentences about the athlete's fan base and social reach in ${input.sport}
   
   Card 3 - OPORTUNIDADES:
   - Icon: 🤝
   - Title: "Oportunidades"
   - 2-3 sentences about unique sponsorship and promotional opportunities

5. CTA BUTTON
   - Centered dark green button, border-radius 50px, padding 16px 48px
   - Text: "Entrar em Contato"
   - Links to: ${contact}

6. FOOTER
   - Background #1E4025, white text, centered
   - Text: "© ProSport — Conectando Atletas e Patrocinadores"

ATHLETE DATA TO USE:
- Name: ${input.fullName}
- Age: ${athleteAge} anos
- Sport: ${input.sport}
- Status: ${status}
- Details: ${input.details}
- Achievements: ${input.achievements}
- Contact: ${contact}

Now generate the complete HTML page:`;

    const { text } = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      prompt,
    });

    if (!text) throw new Error('AI did not return content.');

    return text
      .replace(/^```html\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
  }
);

export async function generateBasicSportpage(input: BasicSportpageInput): Promise<string> {
  return generateBasicSportpageFlow(input);
}
