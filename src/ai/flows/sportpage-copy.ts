import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * A IA NÃO desenha mais a página — ela escreve apenas o CONTEÚDO, em JSON
 * estruturado validado por este schema. O design (layout, CSS, ícones,
 * hierarquia) é 100% dos templates em sportpage-templates.ts, garantindo
 * qualidade profissional constante em toda geração.
 */
export const SportpageCopySchema = z.object({
  tagline: z.string().describe('Frase de impacto curta (máx. 60 caracteres), sem clichês vazios.'),
  about: z.string().describe('Bio comercial de 60 a 110 palavras, terceira pessoa, sem promessas irreais.'),
  metaDescription: z.string().describe('Descrição para SEO/compartilhamento, máx. 155 caracteres.'),
  stats: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .min(3)
    .max(3)
    .describe('3 destaques REAIS derivados dos dados (ex.: valor "3x", rótulo "Campeão Estadual"). Valores curtos (máx. 8 caracteres). NÃO inventar números.'),
  highlights: z
    .array(z.object({ year: z.string(), title: z.string(), description: z.string() }))
    .min(3)
    .max(5)
    .describe('Marcos de carreira baseados nas conquistas reais informadas. Se o ano não for informado, usar "—".'),
  testimonials: z
    .array(z.object({ quote: z.string(), role: z.string() }))
    .min(2)
    .max(3)
    .describe('Depoimentos plausíveis SEM nomes reais — role genérico ("Comissão técnica", "Companheiro de equipe", "Torcida").'),
  mediaCaptions: z
    .array(z.string())
    .min(2)
    .max(4)
    .describe('Legendas curtas para fotos, baseadas na rotina/conquistas reais.'),
  audienceText: z.string().describe('Parágrafo curto sobre público/alcance do atleta, SEM inventar números específicos.'),
  opportunitiesText: z.string().describe('Parágrafo curto sobre o que uma marca ganha ao patrocinar este atleta.'),
  breakdown: z
    .array(z.object({ label: z.string(), percent: z.number().min(40).max(98) }))
    .min(3)
    .max(3)
    .describe('3 atributos qualitativos da modalidade (ex.: "Explosão", "Técnica", "Consistência") com intensidade ilustrativa.'),
});

export type SportpageCopy = z.infer<typeof SportpageCopySchema>;

export type CopyInput = {
  fullName: string;
  dateOfBirth: string;
  sport: string;
  isAmateur: boolean;
  details: string;
  achievements: string;
  team?: string;
};

const COPY_SYSTEM = `Você é um redator esportivo sênior de uma agência premium que produz media kits de atletas para patrocinadores.
Escreva em português do Brasil, tom profissional e confiante, SEM exageros vazios ("o melhor do mundo") e SEM inventar fatos verificáveis (títulos, recordes, números de seguidores) que não estejam nos dados fornecidos.
Depoimentos são ilustrativos: nunca atribua a pessoas reais nomeadas — apenas papéis genéricos.
Responda APENAS com o JSON pedido.`;

export async function generateSportpageCopy(input: CopyInput): Promise<SportpageCopy> {
  const status = input.isAmateur ? 'Amador' : 'Profissional';
  const prompt = `DADOS REAIS DO ATLETA:
- Nome: ${input.fullName}
- Nascimento: ${input.dateOfBirth}
- Modalidade: ${input.sport}
- Status: ${status}
${input.team ? `- Equipe/Clube: ${input.team}` : ''}
- Detalhes fornecidos pelo atleta: ${input.details}
- Conquistas fornecidas pelo atleta: ${input.achievements}

Gere o conteúdo editorial completo para a página profissional deste atleta.`;

  try {
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      system: COPY_SYSTEM,
      prompt,
      output: { schema: SportpageCopySchema },
      config: { maxOutputTokens: 4096 },
    });
    if (output) return output;
  } catch (err) {
    console.error('[sportpage-copy] IA falhou, usando fallback determinístico:', err);
  }
  return buildFallbackCopy(input);
}

/**
 * Fallback 100% determinístico a partir dos dados reais — a geração da página
 * nunca fica bloqueada por falha da IA, e nada é inventado.
 */
export function buildFallbackCopy(input: CopyInput): SportpageCopy {
  const status = input.isAmateur ? 'Amador' : 'Profissional';
  const items = input.achievements
    .split(/\r?\n|;|·|•/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);

  const highlights = (items.length ? items : [input.achievements || 'Trajetória em construção']).map(
    (t) => {
      const year = (t.match(/(19|20)\d{2}/) || ['—'])[0];
      return { year, title: t.slice(0, 80), description: t };
    }
  );
  while (highlights.length < 3) {
    highlights.push({
      year: '—',
      title: `Dedicação diária ao ${input.sport}`,
      description: input.details.slice(0, 140) || `Rotina intensa de treinos em ${input.sport}.`,
    });
  }

  return {
    tagline: `${input.sport} · Atleta ${status}`,
    about:
      input.details.trim() ||
      `${input.fullName} é atleta ${status.toLowerCase()} de ${input.sport}, em busca de parceiros para o próximo ciclo da carreira.`,
    metaDescription: `${input.fullName} — atleta ${status.toLowerCase()} de ${input.sport}. Página oficial para patrocinadores.`,
    stats: [
      { value: status, label: 'Status' },
      { value: String(highlights.length), label: 'Marcos na carreira' },
      { value: input.team ? input.team.slice(0, 14) : 'Independente', label: input.team ? 'Equipe' : 'Carreira' },
    ],
    highlights: highlights.slice(0, 5),
    testimonials: [
      { quote: 'Disciplina rara: chega primeiro, sai por último e trata cada treino como final.', role: 'Comissão técnica' },
      { quote: 'A evolução é visível a cada competição — é o tipo de atleta que uma marca quer ao lado.', role: 'Companheiro de equipe' },
    ],
    mediaCaptions: ['Rotina de treinos', 'Foco na próxima competição'],
    audienceText: `Presença crescente na comunidade de ${input.sport}, com contato direto com praticantes, competições e público local.`,
    opportunitiesText: 'Exposição de marca em competições, redes sociais e materiais oficiais do atleta, com associação a disciplina e alto rendimento.',
    breakdown: [
      { label: 'Disciplina', percent: 92 },
      { label: 'Evolução', percent: 85 },
      { label: 'Regularidade', percent: 80 },
    ],
  };
}
