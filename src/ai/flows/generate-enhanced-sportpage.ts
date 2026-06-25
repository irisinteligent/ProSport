'use server';

import { ai } from '@/ai/genkit';
import { GenerateEnhancedSportpageInputSchema, type GenerateEnhancedSportpageInput } from './types';
import { buildStyleHint, buildCTA } from './sport-styles';

export async function generateEnhancedSportpage(input: GenerateEnhancedSportpageInput): Promise<string> {
  return generateEnhancedSportpageFlow(input);
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    let id: string | null = null;
    if (u.hostname === 'youtu.be') id = u.pathname.slice(1);
    else if (u.hostname.includes('youtube.com')) id = u.searchParams.get('v');
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch { return null; }
}

const SYSTEM_PLUS = `Você é designer sênior. Gere HTML5 completo e responsivo, com CSS embutido, estética moderna e cinematográfica.

Regras obrigatórias (PLUS):
- Estética de card esportivo cinematográfico com profundidade, luz e microinterações suaves. Use 'transform: scale(1.03)' ou mudança de sombra em 'hover' nos botões e cards. Duração das transições: 150-250ms.
- Foto do atleta em hero com recorte elegante usando 'clip-path' (polygon ou inset com bordas arredondadas) posicionada parcialmente sobre outros elementos para efeito de camadas (layers).
- Background temático desfocado atrás da foto. Overlays para garantir legibilidade.
- Ícones/emoji consistentes nas seções.
- Paleta alinhada à modalidade (via styleHint), contraste mínimo 4.5:1 (WCAG AA).
- Layout assimétrico em telas maiores para visual dinâmico. Mobile-first. Respeitar prefers-reduced-motion.
- Gerar "Descrição do Atleta" (60-110 palavras) com apelo comercial, sem promessas irreais.
- A tag <img> do atleta DEVE ter src="__IMAGE_PLACEHOLDER__" exatamente assim.
- CSS em única tag <style> no <head>. Sem frameworks JS/CSS externos (apenas Google Fonts).
- Acessibilidade: alt tags, HTML semântico.

Saída: SOMENTE o HTML final.`;

const SYSTEM_PREMIUM = `Você é um Diretor de Arte Sênior especializado em design digital para atletas de elite. Gere um arquivo HTML5 completo, mobile-first, com CSS embutido. A estética deve ser idêntica à de um card de jogador premium, como os vistos em apps de esportes modernos (NFL/NBA).

Regras obrigatórias (PREMIUM):
- Layout de Coluna Única: design vertical otimizado para telas de celular com expansão elegante em desktop.
- Herói em Camadas (Layers):
  - A imagem principal do atleta deve ser a camada de fundo da seção do herói.
  - A tag <img> DEVE ter src="__IMAGE_PLACEHOLDER__" exatamente assim.
  - Aplique overlay de gradiente escuro na parte inferior da imagem ('linear-gradient(to top, #0A0F0B, transparent)') para fusão suave com o fundo sólido.
  - Nome do atleta e botão CTA principal devem ficar SOBRE a imagem.
- Elemento de fundo: número ou símbolo esportivo grande e semi-transparente atrás do nome.
- Tipografia de Impacto: fonte condensada em maiúsculas ("Oswald" ou "Bebas Neue") com grande destaque para o nome.
- Seção de Estatísticas (KPIs): conquistas principais logo abaixo do nome, em formato ÍCONE + TEXTO dispostos horizontalmente.
- Paleta Sofisticada: fundo muito escuro. Branco para texto principal. Uma única cor de destaque (ouro, bronze ou neon vibrante) para CTA, ícones e detalhes.
- Qualidade e Acessibilidade: contraste WCAG AA. CSS no <head>. ARIA roles, alt tags, HTML semântico (<header>, <main>, <section>).
- Sem frameworks JS/CSS externos (apenas Google Fonts).

Saída: SOMENTE o HTML final, sem comentários ou explicações.`;

const generateEnhancedSportpageFlow = ai.defineFlow(
  {
    name: 'generateEnhancedSportpageFlow',
    inputSchema: GenerateEnhancedSportpageInputSchema,
  },
  async (input) => {
    const youtubeEmbed = input.youtubeLink ? getYouTubeEmbedUrl(input.youtubeLink) : null;
    const styleHint = buildStyleHint(input.sport);
    const contact = input.contact || 'contato@prosport.com.br';
    const status = input.isAmateur ? 'Amador' : 'Profissional';
    const isPremium = input.plan === 'premium';

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
${input.facebookUrl ? `- Facebook: ${input.facebookUrl}` : ''}
${youtubeEmbed ? `- Vídeo YouTube (embed): ${youtubeEmbed}` : ''}

IMAGEM DO ATLETA: A tag <img> do atleta deve ter EXATAMENTE src="__IMAGE_PLACEHOLDER__"

${youtubeEmbed ? `SEÇÃO DE VÍDEO: Inclua um iframe do YouTube com src="${youtubeEmbed}", width 100%, height 450px, border-radius 12px.` : ''}

Gere agora a página HTML completa profissional para este atleta.`;

    const { text } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      system: isPremium ? SYSTEM_PREMIUM : SYSTEM_PLUS,
      prompt: userPrompt,
      config: { maxOutputTokens: 8192 },
    });

    if (!text) throw new Error('AI did not return any content.');
    return text.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  }
);
