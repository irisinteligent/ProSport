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

const SYSTEM_PLUS = `Você é um designer web sênior especializado em landing pages esportivas para atletas. Gere UM arquivo HTML5 COMPLETO e responsivo (com <!DOCTYPE html>, <html>, <head> e <body>), com TODO o CSS em uma única tag <style> no <head>. Estética moderna, cinematográfica e profissional, no nível de um site de atleta de elite.

A PÁGINA DEVE CONTER, NESTA ORDEM, TODAS as seções abaixo (não pule nenhuma):

1. NAV FIXA no topo: logo/nome curto à esquerda e links âncora (Home, Stats, Media, Career, Contact) que rolam para as seções. Em mobile vira um menu compacto.

2. HERO (fundo escuro temático, ocupando a dobra):
   - <img> do atleta com src="__IMAGE_PLACEHOLDER__" (use EXATAMENTE essa string) posicionada à direita, com recorte elegante e formas geométricas decorativas (hexágonos/losangos) atrás.
   - Nome do atleta em tipografia GIGANTE (display, caixa alta), com o rótulo "PRO ATHLETE" / status acima ou abaixo.
   - Botão CTA primário sólido (ex.: "Ver Perfil Completo" ou o CTA sugerido).
   - Overlay de gradiente para legibilidade.

3. FAIXA DE STATS logo abaixo do hero: 3 destaques em ÍCONE + NÚMERO GRANDE + RÓTULO, derivados das conquistas reais informadas (ex.: "3x Campeão", "120+ Partidas", "5x Convocações"). Se faltar dado, use rótulos coerentes com a modalidade — NÃO invente recordes específicos verificáveis.

4. PERFORMANCE ANALYTICS: dois cards lado a lado, cada um com um GRÁFICO desenhado em SVG INLINE (proibido JS e libs externas):
   - Um gráfico de LINHA (evolução por temporada) e um de BARRAS (ex.: desempenho por período).
   - Os números são ILUSTRATIVOS — inclua em cada card uma legenda pequena e discreta com o texto "Dados ilustrativos".

5. STAT BREAKDOWN: painel lateral/abaixo com 3 categorias ADAPTADAS À MODALIDADE (ex.: para futebol: Ataque, Defesa, Físico; para luta: Trocação, Solo, Cardio) — cada uma com uma mini-barra de progresso em CSS.

6. CAREER HIGHLIGHTS: timeline HORIZONTAL com marcadores de ANO e nós circulares estilo "play" (desenhe o ícone de play em SVG/CSS). Baseie os marcos nas conquistas reais.

7. MEDIA GALLERY: grade de 3-4 cards. Cada card de imagem usa <img src="__IMAGE_PLACEHOLDER__"> (pode repetir a string; todas serão preenchidas com a foto do atleta) + legenda curta baseada em conquistas reais.

8. TESTIMONIALS: 2-3 cards de depoimento com aspas e barra de destaque. IMPORTANTE: NÃO invente depoimentos atribuídos a pessoas reais nomeadas. Use rótulos genéricos (ex.: "Companheiro de equipe", "Comissão técnica", "Torcida") e textos de apoio derivados das conquistas/qualidades reais do atleta.

9. CONTACT: seção final com chamada para ação e botão "Get in Touch"/CTA usando o contato informado (mailto: para e-mail, https://wa.me/ para telefone).

REGRAS GERAIS:
- Paleta e fontes alinhadas à modalidade (via styleHint); contraste mínimo 4.5:1 (WCAG AA).
- Microinterações suaves: 'transform: scale(1.03)' ou sombra em 'hover' (150-250ms). Respeitar prefers-reduced-motion.
- Mobile-first, layout que reflui bem em telas pequenas. HTML semântico (<header>,<nav>,<main>,<section>,<footer>), alt tags, ARIA quando fizer sentido.
- Sem frameworks JS/CSS externos. Apenas Google Fonts.
- Gere também uma "Descrição do Atleta" (60-110 palavras) com apelo comercial, sem promessas irreais.

Saída: SOMENTE o HTML final, sem comentários, sem explicações, sem cercas markdown.`;

const SYSTEM_PREMIUM = `Você é um Diretor de Arte Sênior especializado em design digital para atletas de elite. Gere UM arquivo HTML5 COMPLETO e responsivo (com <!DOCTYPE html>, <html>, <head> e <body>), com TODO o CSS em uma única tag <style> no <head>. A estética deve ser PREMIUM, dark e cinematográfica, no nível de apps esportivos modernos (NFL/NBA) e de um card de jogador de elite.

A PÁGINA DEVE CONTER, NESTA ORDEM, TODAS as seções abaixo (não pule nenhuma):

1. NAV FIXA no topo: nome curto à esquerda e links âncora (Home, Stats, Media, Career, Testimonials, Contact).

2. HERO EM CAMADAS (fundo muito escuro):
   - <img> do atleta com src="__IMAGE_PLACEHOLDER__" (use EXATAMENTE essa string) como camada de destaque, com overlay de gradiente escuro embaixo ('linear-gradient(to top, #0A0F0B, transparent)') para fusão.
   - Número/símbolo esportivo GIGANTE e semitransparente atrás do nome.
   - Nome em tipografia condensada de impacto, caixa alta ("Oswald" ou "Bebas Neue"), com "PRO ATHLETE"/status.
   - Botão CTA principal sólido SOBRE a imagem (cor de destaque: ouro/bronze ou neon).

3. FAIXA DE STATS (KPIs): 3 destaques ÍCONE + NÚMERO GRANDE + RÓTULO, derivados das conquistas reais (ex.: "3x Campeão", "5x Convocações", "120+ Partidas"). NÃO invente recordes específicos verificáveis.

4. PERFORMANCE ANALYTICS: dois cards com GRÁFICOS em SVG INLINE (proibido JS e libs externas): um de LINHA e um de BARRAS. Números ILUSTRATIVOS — inclua em cada card a legenda discreta "Dados ilustrativos".

5. STAT BREAKDOWN: painel com 3 categorias ADAPTADAS À MODALIDADE, cada uma com mini-barra de progresso em CSS.

6. CAREER HIGHLIGHTS: timeline horizontal com marcadores de ANO e nós circulares estilo "play" (SVG/CSS), baseada nas conquistas reais.

7. SEÇÃO DE VÍDEO: se um embed do YouTube for fornecido, inclua um <iframe> responsivo (width 100%, height ~450px, border-radius 12px). Se não houver, omita esta seção.

8. MEDIA GALLERY: grade de 3-4 cards de imagem usando <img src="__IMAGE_PLACEHOLDER__"> (pode repetir; todas serão preenchidas com a foto) + legendas curtas baseadas em conquistas reais.

9. TESTIMONIALS: 2-3 cards. NÃO invente depoimentos atribuídos a pessoas reais nomeadas — use rótulos genéricos (ex.: "Companheiro de equipe", "Comissão técnica", "Torcida") e texto derivado das qualidades/conquistas reais.

10. CONTACT: seção final com botão "Get in Touch"/CTA usando o contato informado (mailto: para e-mail, https://wa.me/ para telefone).

REGRAS GERAIS:
- Paleta sofisticada: fundo muito escuro, texto branco, UMA cor de destaque consistente. Alinhar à modalidade via styleHint. Contraste WCAG AA.
- Microinterações suaves em hover (150-250ms). Respeitar prefers-reduced-motion. Mobile-first.
- HTML semântico (<header>,<nav>,<main>,<section>,<footer>), ARIA roles, alt tags. Sem frameworks JS/CSS externos (apenas Google Fonts).
- Inclua uma "Descrição do Atleta" (60-110 palavras) com apelo comercial, sem promessas irreais.

Saída: SOMENTE o HTML final, sem comentários, sem explicações, sem cercas markdown.`;

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
      model: 'googleai/gemini-2.5-flash',
      system: isPremium ? SYSTEM_PREMIUM : SYSTEM_PLUS,
      prompt: userPrompt,
      config: { maxOutputTokens: 32768, thinkingConfig: { thinkingBudget: 0 } },
    });

    if (!text) throw new Error('AI did not return any content.');
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
