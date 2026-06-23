---
title: ProSport — Marketing, Growth e Gestão de Redes Sociais
tags:
  - prosport
  - marketing
  - growth
---

# ProSport — Marketing, Growth e Gestão de Redes Sociais

> [!note] Sobre este documento
> Referenciado por [[CLAUDE#12. Marketing, Growth e Gestão de Redes Sociais|CLAUDE.md §12]]. Conteúdo de estratégia/negócio — não é necessário para tarefas de engenharia do dia a dia.

## 1. Funil de Conversão

```
Visitante (landing/redes sociais)
   → Cadastro (signup, plano Básico padrão)
      → Geração da 1ª sportpage (ativação)
         → Compartilhamento do link (1ª divulgação real)
            → Upgrade de plano (Plus/Premium)
               → Renovação / indicação de outros atletas
```

Pontos de atrito conhecidos a monitorar à medida que o produto evolui:
- Cadastro → Ativação: tempo até a primeira sportpage gerada (objetivo: < 5 minutos).
- Ativação → Compartilhamento: % de atletas que de fato enviam o link gerado (hoje não há instrumentação para medir isso — depende da auth real e de algum tracking, ver [[CLAUDE#10. Integrações Pendentes (priorizado)|CLAUDE.md §10]]).
- Compartilhamento → Upgrade: gatilho natural é a percepção de "preciso de mais alcance" (Plus) ou "quero mídia" (Premium).

## 2. Métricas de Growth a Monitorar

| Métrica | Definição | Por quê importa |
|---|---|---|
| CAC (Custo de Aquisição de Cliente) | Gasto em marketing ÷ novos atletas pagantes no período | Precisa ser menor que o LTV do plano médio |
| LTV (Lifetime Value) | Receita média esperada por atleta durante todo o relacionamento | Compara com CAC para validar canais de aquisição |
| Churn | % de atletas que cancelam/não renovam no período | Sinaliza problema de percepção de valor, especialmente pós-trial do Básico |
| NPS | Pesquisa de satisfação (0–10, "recomendaria a um colega atleta?") | Mede se a sportpage realmente ajuda na prática (resposta de patrocinador, convite de clube etc.) |
| Taxa de ativação | % de cadastros que geram ao menos 1 sportpage em 7 dias | Mede fricção do onboarding |
| Taxa de upgrade | % de atletas Básico que sobem para Plus/Premium em 90 dias | Mede percepção de valor incremental dos planos pagos |

**Pré-requisito de instrumentação**: nenhuma dessas métricas pode ser calculada com confiabilidade hoje, porque não há autenticação real nem analytics implementado (ver [[CLAUDE#4.1 Autenticação (✅ real)|CLAUDE.md §4.1]] e [[CLAUDE#10. Integrações Pendentes (priorizado)|§10]]). Priorizar isso é prioridade de growth, não só de engenharia.

## 3. Calendário Editorial (Instagram, TikTok, YouTube)

Cadência sugerida por canal:

| Canal | Frequência | Foco de conteúdo |
|---|---|---|
| Instagram (feed) | 3x/semana | Cases reais de atletas usando a sportpage gerada, bastidores do produto, prova social |
| Instagram (stories) | Diário | Bastidores, contagem de sportpages geradas, depoimentos rápidos, CTA de cadastro |
| TikTok | 3–4x/semana | "Antes e depois" do portfólio do atleta, reações de atletas vendo a própria sportpage pela primeira vez |
| YouTube | 1x/semana ou quinzenal | Vídeos mais longos: entrevista com atleta, explicação de como funciona a IA, cases de sucesso com patrocínio fechado |

Estrutura por semana (modelo):
- **Segunda** — case de atleta (Instagram feed)
- **Terça** — story de bastidores/produto
- **Quarta** — TikTok de transformação ("antes/depois")
- **Quinta** — story com CTA direto de cadastro
- **Sexta** — case de atleta de outra modalidade (rotação de nicho, ver §4)
- **Sábado/Domingo** — reposts de UGC (conteúdo gerado por atletas usuários)

## 4. Estratégia de Conteúdo por Nicho Esportivo

Cada nicho tem linguagem e prova social diferentes — não tratar "atleta" como público homogêneo:

- **Artes marciais (jiu-jitsu, MMA, boxe)**: foco em ranking/faixa, recordes de luta, busca por patrocínio de equipamento e suplementação.
- **Futebol**: foco em categoria (base, amador, várzea, semi-profissional), busca por clubes e olheiros.
- **Natação e atletismo**: foco em marcas/tempos, federações, busca por bolsas e patrocínio de marcas esportivas.
- **Esportes de combate emergentes / nicho**: maior dependência da ProSport como única vitrine profissional disponível — ângulo de comunicação: "sua primeira apresentação profissional".

Cada campanha de lançamento por modalidade (ex.: "Mês do Jiu-Jitsu na ProSport") deve combinar: 1 atleta-embaixador do nicho, depoimentos de outros atletas da mesma modalidade, e oferta de desconto/trial alinhada ao calendário de eventos daquele esporte (ex.: lançar campanha de natação perto de campeonatos regionais).

## 5. Parcerias Estratégicas

Prioridade sugerida:
1. **Academias e clubes de base** — canal direto para atletas amadores/semi-profissionais, maior volume.
2. **Federações esportivas regionais** — credibilidade + acesso a listas de atletas categorizados.
3. **Eventos esportivos (competições, copas regionais)** — ativação no local/online durante o evento, com geração de sportpage no ato como atração.
4. **Assessorias de imprensa esportiva** — canal de distribuição natural para o plano Premium.

## 6. Programa de Indicação entre Atletas

Modelo sugerido: atleta indica outro atleta → ambos ganham 1 mês do plano atual gratuito (ou desconto equivalente) na confirmação do primeiro pagamento do indicado. Requer: link/código de indicação único por atleta (depende de auth real, ver [[CLAUDE#10. Integrações Pendentes (priorizado)|CLAUDE.md §10]]) e rastreamento do cadastro de origem.

## 7. Playbook: a Sportpage como Material de Divulgação da Própria Plataforma

A própria sportpage gerada é a melhor peça de marketing do produto — usar sistematicamente:
1. Pedir autorização (já capturada no checkbox de Termos de Uso de Imagem do signup) para usar a sportpage do atleta como case público.
2. Publicar prints/vídeos da tela de geração ("em 2 minutos, isso aqui ficou pronto") — funciona bem em TikTok/Reels.
3. Comparar a sportpage com o material anterior do atleta (PDF amador, post solto de Instagram) — contraste visual é o argumento mais forte.
4. Sempre incluir o link real `/p/{slug}` no post/story, deixando claro que é uma página real e funcional, não um mockup.

## 8. KPIs de Redes Sociais por Período

| Período | KPIs principais |
|---|---|
| Semanal | Alcance, engajamento (curtidas+comentários+compartilhamentos / alcance), nº de cliques no link de cadastro |
| Mensal | Novos seguidores, nº de cadastros atribuíveis a redes sociais, custo por cadastro (se houver mídia paga) |
| Trimestral | CAC por canal, LTV:CAC, churn, NPS, nº de cases publicados por nicho esportivo |

## 9. Templates de Copy

**Post (case de atleta)**
```
De um portfólio amador para uma página profissional em minutos.
[Nome do atleta] é [modalidade] e agora tem uma sportpage feita por IA
especializada em apresentar atletas pra quem importa: patrocinadores e clubes.

👉 Crie a sua: [link]
```

**Story (CTA direto)**
```
Quantos patrocinadores já viram o seu trabalho de verdade?
Crie sua sportpage profissional agora. [Link na bio / sticker de link]
```

**Anúncio pago (segmentado por nicho)**
```
Título: Sua carreira em [modalidade] merece uma apresentação profissional
Corpo: A ProSport usa IA especializada em esporte pra transformar seus
dados e conquistas numa página pronta pra impressionar patrocinadores.
Comece com o plano Básico por R$ 9,90/mês.
CTA: Criar minha sportpage
```
