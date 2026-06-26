import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { buildStyleHint, buildCTA } from './sport-styles';

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
  photoUrl: z.string().optional(),
});

export type BasicSportpageInput = z.infer<typeof BasicSportpageInputSchema>;

const SYSTEM_BASIC = `Você é um designer web focado em criar propostas de patrocínio claras e profissionais. Gere um arquivo HTML5 completo, responsivo, com CSS embutido. A estética deve ser limpa, estruturada em blocos e inspirada em um folheto digital moderno.

Regras obrigatórias (BASIC):
- Layout em Blocos de Cores:
  - Bloco Superior: Crie uma seção superior com cor de fundo sólida (verde escuro profissional, ex: #1E4025). Esta seção deve conter o título "PROPOSTA DE PATROCÍNIO" no topo, seguido pela imagem principal do atleta preenchendo a largura do bloco com bordas superiores arredondadas.
  - Divisor de Seção: Use uma forma de onda ou curva suave (SVG embutido ou CSS clip-path) para transição elegante entre o bloco superior e a seção de conteúdo abaixo.
  - Bloco de Conteúdo Principal: Fundo de cor clara e neutra (off-white/bege, ex: #F8F7F4).
- Estrutura do Conteúdo:
  - Logo abaixo do divisor, título de seção centralizado (ex: "Visão Geral do Atleta") seguido por parágrafo introdutório.
  - Grade de três colunas (desktop) / uma coluna (mobile) com cards informativos.
  - Design dos Cards: fundo de cor sutil, bordas arredondadas, contendo: ÍCONE, TÍTULO em negrito, e texto descritivo.
- Botão de CTA: No final, botão centralizado com cor principal sólida e texto claro.
- Tipografia: Fontes sans-serif limpas — "Poppins" para títulos, "Lato" para corpo (Google Fonts).
- Paleta: verde escuro principal, fundo off-white/bege, texto escuro (#333).
- Código leve, mobile-first. Alt tags. HTML semântico. CSS em única tag <style> no <head>.

Saída: SOMENTE o HTML final, sem explicações.`;

const generateBasicSportpageFlow = ai.defineFlow(
  {
    name: 'generateBasicSportpageFlow',
    inputSchema: BasicSportpageInputSchema,
  },
  async (input) => {
    const styleHint = buildStyleHint(input.sport);
    const contact = input.contact || 'contato@prosport.com.br';
    const ctaHtml = buildCTA(input.fullName, contact);
    const status = input.isAmateur ? 'Amador' : 'Profissional';

    const photoHtml = input.photoUrl
      ? `<img src="${input.photoUrl}" alt="Foto de ${input.fullName}" style="width:100%;height:420px;object-fit:cover;object-position:top;display:block;">`
      : `<div style="width:100%;height:300px;background:linear-gradient(135deg,#1E4025,#3A7040);display:flex;align-items:center;justify-content:center;font-size:80px;">\uD83C\uDFC6</div>`;

    const userPrompt = `${styleHint}

DADOS DO ATLETA:
- Nome: ${input.fullName}
- Nascimento: ${input.dateOfBirth}
- Status: ${status}
- Modalidade: ${input.sport}
${input.team ? `- Equipe/Clube: ${input.team}` : ''}
- Detalhes: ${input.details}
- Títulos/Conquistas: ${input.achievements}
- Contato: ${contact}
${input.instagramUrl ? `- Instagram: ${input.instagramUrl}` : ''}

IMAGEM DO ATLETA — insira este bloco HTML exatamente na seção hero, dentro do bloco superior verde:
${photoHtml}

BOTÃO CTA — use este HTML exatamente para o botão de contato:
${ctaHtml}

Gere agora a página HTML completa seguindo todas as regras do sistema.`;

    const { text } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      system: SYSTEM_BASIC,
      prompt: userPrompt,
      config: { maxOutputTokens: 8192 },
    });

    if (!text) throw new Error('AI did not return content.');
    return text.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  }
);

export async function generateBasicSportpage(input: BasicSportpageInput): Promise<string> {
  return generateBasicSportpageFlow(input);
}
