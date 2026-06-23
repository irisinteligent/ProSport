---
title: ProSport — Roadmap de Integração WhatsApp
tags:
  - prosport
  - whatsapp
  - roadmap
---

# ProSport — Roadmap de Integração WhatsApp

> [!warning] Nada aqui está implementado
> Referenciado por [[CLAUDE#13. Comunicação Avançada via WhatsApp|CLAUDE.md §13]]. Não há nenhuma referência a `wa.me` ou WhatsApp em `src/` ou `functions/src/` hoje. Trate como plano, não como estado atual.

## 1. Visão Geral

WhatsApp como canal oficial de contato e automação entre a plataforma, o atleta e os patrocinadores, em 6 frentes:

1. CTA de WhatsApp nas sportpages geradas.
2. Notificação ao atleta quando uma empresa visualizar sua sportpage.
3. Envio da sportpage para patrocinadores via API do WhatsApp Business.
4. Mensagem automática de boas-vindas ao atleta recém-cadastrado.
5. Alerta de vencimento de plano.
6. (Futuro) Assistente via WhatsApp para o atleta atualizar dados/gerar nova sportpage sem entrar no dashboard.

### Progresso

- [ ] Item 1 — CTA na sportpage
- [ ] Item 2 — Notificação de visualização
- [ ] Item 3 — Envio a patrocinadores
- [ ] Item 4 — Boas-vindas
- [ ] Item 5 — Alerta de vencimento
- [ ] Item 6 — Assistente via WhatsApp (futuro)

^progresso-whatsapp

## 2. CTA na Sportpage (item 1)

**Status: não implementado.** Para implementar:
- Adicionar um botão `https://wa.me/{numero}?text={mensagem pré-preenchida}` no template HTML gerado (tanto no fluxo do Next.js — `generate-enhanced-sportpage.ts`/prompt — quanto, se fizer sentido, no `renderHTML()` das Cloud Functions).
- `{numero}` precisa vir de um campo real capturado no formulário do atleta (hoje o formulário não tem campo de telefone/WhatsApp — é um campo novo a adicionar nos schemas de input, `src/ai/flows/types.ts`).
- Sanitizar o número (somente dígitos, com código do país) antes de montar a URL.

## 3. Notificação ao Atleta (visualização da sportpage) (item 2)

Requer instrumentação de analytics na página pública (`/p/[slug]`) para detectar "visita de uma empresa" — hoje a página é estática, sem nenhum tracking de quem acessa. Caminho sugerido:
1. Registrar cada GET em `getPageContent`/`getLanding` com timestamp + (se disponível) origem.
2. Diferenciar "visita de empresa" exigiria algum mecanismo de identificação do visitante (ex.: link único por empresa, ou integração com um CRM) — decisão de produto pendente antes de implementar.
3. Disparar mensagem via API de WhatsApp Business ao atleta quando o evento ocorrer.

## 4. Envio para Patrocinadores via WhatsApp Business API (item 3)

Duas opções de API, com trade-offs:

| Opção | Vantagem | Desvantagem |
|---|---|---|
| **WhatsApp Business API oficial (Meta)** | Compliance total, suporte oficial, menor risco de bloqueio de número | Processo de aprovação mais longo, custo por conversa, exige BSP (Business Solution Provider) ou Cloud API direto da Meta |
| **Evolution API (open source)** | Setup rápido, sem custo de plataforma, flexível | Roda sobre WhatsApp Web não-oficial — risco de bloqueio de número, sem SLA, não é a via recomendada para uso comercial em produção |

**Recomendação**: usar ==a Cloud API oficial da Meta== para qualquer fluxo voltado a patrocinadores/clientes pagantes (item 3, 4, 5); Evolution API pode servir para prototipagem/testes internos, nunca como canal de produção principal.

## 5. Mensagens de Boas-Vindas e Alerta de Vencimento (itens 4 e 5)

Ambos dependem de:
- Auth real (saber o telefone do atleta de forma confiável, ver [[CLAUDE#10. Integrações Pendentes (priorizado)|CLAUDE.md §10]]).
- Um disparador de eventos no backend (ex.: Cloud Function acionada por escrita no Firestore — `onDocumentCreated` na coleção de usuários para boas-vindas; uma function agendada (`onSchedule`) para checar vencimentos próximos).

## 6. Assistente via WhatsApp (item 6, futuro)

Visão de longo prazo: atleta manda mensagem (“atualizar minha bio”, “gerar nova sportpage”) e um webhook recebe, interpreta (possivelmente via o mesmo Genkit/Gemini já usado no produto) e aciona os flows existentes (`generate-enhanced-sportpage`, etc.) sem o atleta abrir o dashboard. Pré-requisito: itens 1–5 funcionando e auth real implementada.

## 7. Armazenamento Seguro de Tokens

- Tokens da API do WhatsApp (Meta Cloud API: token de acesso do sistema + Phone Number ID; Evolution API: API key da instância) devem viver **exclusivamente** no Firebase Secret Manager, no mesmo padrão já usado para `OPENAI_API_KEY`/`GOOGLE_GENAI_API_KEY` (ver [[CLAUDE#5. Variáveis de Ambiente|CLAUDE.md §5]] e [[CLAUDE#8. Comandos de Desenvolvimento e Deploy|§8]]): `firebase functions:secrets:set WHATSAPP_ACCESS_TOKEN`.
- Nunca expor esses tokens no client (Next.js) — todo envio de mensagem deve passar por uma Cloud Function ou Server Action que só roda no servidor.

## 8. Fluxo de Mensagens por Evento (resumo)

| Evento | Disparo | Destinatário | Conteúdo |
|---|---|---|---|
| Cadastro concluído | Trigger Firestore (novo usuário) | Atleta | Boas-vindas + link do dashboard |
| Sportpage gerada | Server Action após `setPageContent` | Atleta | Link da sportpage + sugestão de compartilhar |
| Visualização por empresa | Trigger em `getPageContent`/`getLanding` (com identificação da empresa) | Atleta | "Sua sportpage foi vista por [empresa]" |
| Envio a patrocinador | Ação manual do atleta no dashboard (ou automática no Plus/Premium) | Patrocinador | Mensagem com o link da sportpage |
| Plano perto de vencer | Function agendada (`onSchedule`) | Atleta | Aviso de renovação + link de checkout |
| Renovação confirmada | Webhook do Stripe (já implementado, ver [[CLAUDE#4.5 Upgrade de plano (✅ pagamento real via Stripe Checkout)|CLAUDE.md §4.5]]) | Atleta | Confirmação de renovação |
