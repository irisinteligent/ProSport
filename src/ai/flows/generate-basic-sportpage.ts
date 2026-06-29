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

const SYSTEM_BASIC = `Você é um designer sênior. Gere UM arquivo HTML5 COMPLETO e responsivo (com <!DOCTYPE html>, <html>, <head> e <body>), com TODO o CSS em uma única tag <style> no <head>. O formato é uma PROPOSTA DE PATROCÍNIO limpa e profissional (one-pager/flyer), pensada para mobile.

IMPORTANTE — VARIAÇÃO POR ATLETA: a estrutura abaixo é um NORTE de qualidade, NÃO um molde para clonar igual em todo atleta. Crie um layout ÚNICO para ESTE atleta — paleta, fontes e arranjo devem refletir a MODALIDADE e o perfil dele (via styleHint). Dois atletas nunca devem gerar páginas idênticas.

A PÁGINA DEVE CONTER, NESTA ORDEM:

1. CABEÇALHO em barra com a cor de destaque da modalidade e o título "PROPOSTA DE PATROCÍNIO" em caixa alta, centralizado.

2. FOTO/HERO: use EXATAMENTE o bloco de IMAGEM fornecido no prompt, grande, com cantos arredondados, logo abaixo do cabeçalho (se for o fallback sem foto, trate como bloco visual temático).

3. "VISÃO GERAL DO ATLETA": título de seção + a "Descrição do Atleta" (60-110 palavras), apelo comercial, sem promessas irreais.

4. TRÊS CARDS (1 coluna no mobile, 3 no desktop), cada um com ÍCONE + TÍTULO + texto curto:
   - "Conquistas" — derivado das conquistas reais informadas.
   - "Público" — alcance/engajamento, SEM inventar números específicos.
   - "Oportunidades" — o que uma marca ganha apoiando o atleta.

5. CTA final centralizado: use EXATAMENTE o bloco de CTA fornecido (ex.: "Fale Conosco").

REGRAS GERAIS:
- Fundo claro e limpo, UMA cor de destaque alinhada à modalidade (via styleHint). Contraste WCAG AA.
- Tipografia profissional (Google Fonts). Microinterações suaves em hover (150-250ms). Respeitar prefers-reduced-motion.
- MOBILE-FIRST (a maioria abre no celular). HTML semântico (<header>,<main>,<section>,<footer>), alt tags.
- Sem frameworks JS/CSS externos. Apenas Google Fonts. NÃO invente recordes verificáveis nem depoimentos atribuídos a pessoas reais nomeadas.
- ÍCONES: use SEMPRE ícones desenhados em SVG inline. NUNCA use emojis em lugar nenhum (nem em stats, cards, botões ou títulos). Emoji é proibido.

Saída: SOMENTE o HTML final, sem comentários, sem explicações, sem cercas markdown.`;

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
      model: 'googleai/gemini-2.5-flash',
      system: SYSTEM_BASIC,
      prompt: userPrompt,
      config: { maxOutputTokens: 32768, thinkingConfig: { thinkingBudget: 0 } },
    });

    if (!text) throw new Error('AI did not return content.');
    // Remove markdown fences que o Gemini às vezes insere antes/depois do HTML
    const cleaned = text
      .replace(/^```html\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    if (!cleaned || cleaned.length < 200) {
      throw new Error(`Gemini retornou HTML incompleto (${cleaned.length} chars).`);
    }
    return cleaned;
  }
);

export async function generateBasicSportpage(input: BasicSportpageInput): Promise<string> {
  return generateBasicSportpageFlow(input);
}
