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

const SYSTEM_PLUS = `Você é um Diretor de Arte sênior. Gere UM arquivo HTML5 COMPLETO e responsivo (com <!DOCTYPE html>, <html>, <head> e <body>), com TODO o CSS em uma única tag <style> no <head>. O estilo é EDITORIAL e CINEMATOGRÁFICO, de COLUNA ÚNICA, dominado por uma grande foto do atleta — como uma capa de revista esportiva premium. NÃO é um dashboard com gráficos: priorize foto, tipografia de impacto e narrativa.

VARIAÇÃO POR ATLETA: a estrutura abaixo é um NORTE de qualidade, NÃO um molde para clonar igual em todo atleta. Crie um layout ÚNICO para ESTE atleta — paleta, fontes, composição e arranjo das seções devem refletir a modalidade e o perfil dele (via styleHint). Dois atletas nunca devem gerar páginas idênticas.

A PÁGINA DEVE CONTER, NESTA ORDEM, TODAS as seções abaixo (não pule nenhuma):

1. NAV minimalista no topo (transparente sobre a foto): nome curto e poucos links âncora (Home, Sobre, Contato).

2. HERO FULL-SCREEN (FULL-BLEED, ocupando 100% da viewport: 100vw de largura e 100vh de altura):
   - A <img src="__IMAGE_PLACEHOLDER__"> (use EXATAMENTE essa string) PREENCHE A TELA INTEIRA — position:absolute; inset:0; width:100%; height:100%; object-fit:cover. A composição atleta+fundo é o protagonista. NUNCA coloque a imagem dentro de uma caixa, coluna ou card.
   - Overlay de gradiente escuro (de baixo para cima e/ou nas bordas) APENAS para legibilidade do texto.
   - TODA a tipografia fica SOBRE a imagem (sobreposta, z-index acima da foto): nome do atleta GIGANTE em caixa alta (até 2 linhas), rótulo "PRO ATHLETE"/status, botão CTA sólido na cor de destaque, e a FAIXA DE STATS (3 destaques ÍCONE + NÚMERO GRANDE + RÓTULO, ex.: "3x Campeão", "120+ Partidas") posicionada na BASE da tela, também SOBRE a imagem. NÃO invente recordes específicos verificáveis.

4. SOBRE (ABOUT): título de seção com um ÍCONE circular (ex.: "i" de informação) ao lado, seguido da "Descrição do Atleta" (60-110 palavras), apelo comercial, sem promessas irreais.

5. CAREER HIGHLIGHTS: título de seção com um ÍCONE DE ESTRELA à esquerda e uma LINHA DIVISÓRIA fina à direita. Abaixo, uma LISTA VERTICAL editorial de marcos (ANO em destaque + descrição curta), baseada nas conquistas reais. (Editorial/vertical — NÃO use timeline horizontal nem gráficos.)

6. MOMENTOS / MÍDIA: 1 ou 2 imagens em destaque grandes usando <img src="__IMAGE_PLACEHOLDER__"> (pode repetir; todas recebem a foto) com legenda curta baseada em conquista real.

7. DEPOIMENTOS: 2 citações editoriais grandes (aspas tipográficas). NÃO invente depoimentos atribuídos a pessoas reais nomeadas — use rótulos genéricos (ex.: "Companheiro de equipe", "Comissão técnica", "Torcida").

8. CONTACT: seção final com botão "Get in Touch"/CTA usando o contato informado (mailto: para e-mail, https://wa.me/ para telefone).

REGRAS GERAIS:
- Fundo muito escuro, texto claro, UMA cor de destaque (ouro/bronze ou neon) alinhada à modalidade via styleHint. Contraste WCAG AA.
- Tipografia condensada/bold de impacto para títulos. Bastante respiro (whitespace). Mobile-first — o layout vertical deve brilhar no celular.
- Microinterações suaves em hover (150-250ms). Respeitar prefers-reduced-motion. HTML semântico (<header>,<nav>,<main>,<section>,<footer>), alt tags, ARIA quando fizer sentido.
- Sem frameworks JS/CSS externos. Apenas Google Fonts.

Saída: SOMENTE o HTML final, sem comentários, sem explicações, sem cercas markdown.`;

const SYSTEM_PREMIUM = `Você é um Diretor de Arte Sênior especializado em design digital para atletas de elite. Gere UM arquivo HTML5 COMPLETO e responsivo (com <!DOCTYPE html>, <html>, <head> e <body>), com TODO o CSS em uma única tag <style> no <head>. Esta é a página MAIS RICA e sofisticada do produto (plano topo de linha): um "media kit" interativo de jogador, no nível de apps esportivos modernos (NFL/NBA). Estrutura de DASHBOARD: hero escuro cinematográfico seguido de um GRANDE PAINEL CLARO de conteúdo que se sobrepõe ao hero (cantos superiores arredondados, como um cartão).

VARIAÇÃO POR ATLETA: a estrutura abaixo é um NORTE de qualidade, NÃO um molde para clonar igual em todo atleta. Crie um layout ÚNICO para ESTE atleta — paleta, fontes, composição e arranjo das seções devem refletir a modalidade e o perfil dele (via styleHint). Dois atletas nunca devem gerar páginas idênticas.

A PÁGINA DEVE CONTER, NESTA ORDEM, TODAS as seções abaixo (não pule nenhuma):

1. NAV FIXA no topo, sobre o hero escuro: nome à esquerda e links âncora (Home, Stats, Media, Career, Testimonials, Contact); "Contact" destacado à direita.

2. HERO FULL-SCREEN (FULL-BLEED, ocupando 100% da viewport: 100vw x 100vh):
   - A <img src="__IMAGE_PLACEHOLDER__"> (use EXATAMENTE essa string) PREENCHE A TELA INTEIRA — position:absolute; inset:0; width:100%; height:100%; object-fit:cover. A composição atleta+fundo é o protagonista. NUNCA recorte a imagem numa caixa/coluna lateral.
   - Overlay de gradiente escuro (de baixo para cima e/ou nas bordas) APENAS para legibilidade.
   - TODA a tipografia fica SOBRE a imagem (sobreposta, z-index acima da foto): nome do atleta GIGANTE em caixa alta, rótulo "PRO ATHLETE"/status, botão CTA "Ver Perfil Completo"/"View Full Profile", e a faixa de STATS (3 KPIs ÍCONE + NÚMERO + RÓTULO) na BASE da tela, também SOBRE a imagem.
   - Opcional: um CONTROLE DE CARROSSEL decorativo (pílula com setas ‹ › e pontos) centralizado na borda inferior, na transição para o painel claro.

3. PAINEL CLARO sobreposto (fundo off-white, cantos superiores arredondados) contendo as seções 4 a 8.

4. PERFORMANCE ANALYTICS: dois cards lado a lado com GRÁFICOS em SVG INLINE (proibido JS e libs externas) — um de LINHA e um de BARRAS — MAIS um card lateral "STAT BREAKDOWN" com 3 categorias adaptadas à modalidade, cada linha com rótulo + chevron (›). Números ILUSTRATIVOS — legenda discreta "Dados ilustrativos".

5. CAREER HIGHLIGHTS: timeline HORIZONTAL com marcadores de ANO e nós circulares estilo "play" (SVG/CSS). SOBRE esta seção, sobreponha um CARD DE VÍDEO FLUTUANTE (thumbnail usando <img src="__IMAGE_PLACEHOLDER__">, botão de play, título curto ex.: "2020 · Seleção", e um "x" de fechar no canto) — elemento visual exclusivo deste plano.

6. SEÇÃO DE VÍDEO: se um embed do YouTube for fornecido, inclua um <iframe> responsivo (width 100%, height ~450px, border-radius 12px). Se não houver, omita.

7. MEDIA GALLERY: grade de 4 COLUNAS. Cada card = <img src="__IMAGE_PLACEHOLDER__"> (pode repetir; todas recebem a foto) + um pequeno AVATAR circular + legenda curta (uma frase de apoio com rótulo genérico). NÃO invente nomes reais.

8. TESTIMONIALS: 2-3 cards com aspas e barra de destaque. NÃO invente depoimentos atribuídos a pessoas reais nomeadas — use rótulos genéricos ("Companheiro de equipe", "Comissão técnica", "Torcida").

9. CONTACT: seção final com um botão grande "Get in Touch"/CTA usando o contato informado (mailto: para e-mail, https://wa.me/ para telefone) e um detalhe decorativo (brilho/estrela).

REGRAS GERAIS:
- Hero escuro + painel claro: dois "mundos" com UMA cor de destaque consistente (alinhada à modalidade via styleHint). Contraste WCAG AA.
- Microinterações suaves em hover (150-250ms). Respeitar prefers-reduced-motion. Mobile-first (galeria reflui para 2/1 colunas).
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
