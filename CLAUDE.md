---
title: ProSport — Guia do Projeto
tags:
  - prosport
  - engenharia
  - claude-code
---
ANALISE
> [!info] Legenda de status
> `✅ Implementado` · `⚠️ Mockado/Parcial` · `❌ Pendente`
> Estas tags refletem o estado real do código no momento em que este arquivo foi escrito. Sempre confira o código antes de assumir que algo mudou.

# ProSport — Guia do Projeto

Documentos relacionados: [[marketing-growth]] · [[whatsapp-integration]] · [[blueprint]]

## 1. Identidade e Propósito

**ProSport** (nome interno do produto: "ProSport Portfolio") é um SaaS que gera, em minutos e com ajuda de IA, uma página esportiva profissional ("sportpage") e materiais de divulgação para um atleta — substituindo o portfólio amador (PDF, Instagram, currículo) por uma página com link único, pensada para ser enviada a patrocinadores, clubes e imprensa.

**Domínio oficial**: `prosport.ia.br` (registrado no registro.br). Deploy real de produção é na **Vercel** (não Firebase App Hosting, apesar do `apphosting.yaml` no repo — ver §8). Domínio já adicionado ao projeto na Vercel; ⚠️ falta só o registro DNS no registro.br apontar pra lá — ver §8 (Deploy).

- **Problema que resolve**: atletas amadores e profissionais (artes marciais, futebol, natação, etc.) têm dificuldade de se apresentar profissionalmente a patrocinadores e clubes. Criar uma página/apresentação de qualidade exige tempo, design e texto que a maioria não tem.
- **Para quem é**: atletas (público primário, pagantes), e do outro lado do mercado — empresas patrocinadoras, clubes e assessorias de imprensa que visualizam as páginas geradas.
- **Modelo de negócio**: SaaS por assinatura mensal/anual, com 3 planos de atleta (ver `src/app/plans/page.tsx`):
  - **Básico** (R$ 9,90/mês) — sportpage simples em Markdown + geração de apresentação para patrocinadores. O próprio atleta distribui o link.
  - **Plus** (R$ 29,90/mês) — sportpage com design visual (estilo NFL/NBA), upload de foto, e divulgação ativa da ProSport para empresas/clubes parceiros.
  - **Premium** (R$ 59,90/mês) — tudo do Plus + vídeo do YouTube embutido + divulgação para grande mídia (TV, jornais). Alguns itens do Premium estão marcados como "em breve" na própria UI (análise de patrocinador, geração de mídia com IA).
  - Existe também um plano **Pro** para empresas/clubes (R$ 2.000/mês, ver `checkout-form.tsx`), ainda sem página de captação própria além de `/company/plans`.

## 2. Arquitetura Completa

### 2.1 Mapa dos projetos

| Projeto | Linguagem/Stack | Função | Status |
|---|---|---|---|
| **App Next.js** (raiz deste repo) | Next.js 15 + React 18 + TS | Site principal: marketing, planos, dashboards, geração de sportpage via Genkit/Gemini, checkout | ✅ Implementado (com partes mockadas, ver §3) |
| **Firebase Cloud Functions** (`functions/`) | Node 22 + TS + Firebase Functions v2 | API HTTP standalone (`generateLanding`/`getLanding`) usada por integrações externas (ex. app mobile); independente do banco de dados do app Next.js | ✅ Implementado (sem IA — ver §3) |
| **App mobile Flutter** (`prosport_mobile/`) | Flutter/Dart | **Não é o app do usuário final.** É um harness de QA manual para testar o endpoint `generateLanding` das Cloud Functions | ✅ Implementado (propositalmente simples — ver `pubspec.yaml`: "app de teste para generateLanding") |

### 2.2 Como os projetos se comunicam

```
┌──────────────────┐        ┌───────────────────────────┐
│   App Next.js     │  Admin │  Firestore (projeto        │
│  (Server Actions)  ├───────▶│  prosport-portfolio)       │
│  src/app/dashboard │  SDK   │  - coleção "sportpages"    │
│  /actions.ts       │        │  - coleção "landings"      │
└─────────┬──────────┘        └─────────────▲──────────────┘
          │                                  │ Admin SDK
          │ chama direto (mesmo runtime)      │
          ▼                                  │
┌──────────────────┐                         │
│  Genkit + Gemini  │                         │
│  src/ai/flows/*    │                         │
└────────────────────┘               ┌────────┴─────────┐
                                      │ Firebase Cloud    │
┌──────────────────┐   HTTP POST     │ Functions          │
│ App Flutter (QA)  ├────────────────▶ generateLanding/   │
│ prosport_api.dart  │   (sem auth)   │ getLanding         │
└────────────────────┘                 (functions/src)     │
                                      └────────────────────┘
```

Pontos importantes:
- **O app Next.js e as Cloud Functions NÃO compartilham código nem o mesmo fluxo de dados.** O Next.js grava sportpages na coleção `sportpages` usando o Admin SDK diretamente do Server Action (`src/lib/storage.ts`). As Functions gravam na coleção separada `landings`, via seu próprio Admin SDK (`functions/src/index.ts`). São dois pipelines paralelos para o mesmo objetivo ("gerar e servir uma página pública"), histórico de duas abordagens construídas em momentos diferentes.
- **As Cloud Functions usam IA só para a bio, via OpenAI (não Genkit/Gemini).** `generateLanding` recebe campos via POST e grava no Firestore; se o campo `bio` não vier no corpo da requisição, chama o GPT-4o-mini (`generateBioWithOpenAI`, usa a secret `OPENAI_API_KEY` via `defineSecret` — ver §5) para gerar uma bio curta a partir de nome/modalidade/conquistas/status amador-profissional. Se a secret não estiver configurada ou a chamada falhar, a função loga o erro e segue sem bio (nunca bloqueia o cadastro do landing). `getLanding` continua sem IA — só lê e devolve JSON ou um HTML simples gerado por template string local (`renderHTML`). Quem usa Genkit/Gemini continua sendo exclusivamente o app Next.js.
- **O app Flutter só conversa com as Cloud Functions**, via HTTP puro (`package:http`), batendo direto nas URLs públicas das functions (com fallback entre as regiões `southamerica-east1` e `us-central1`). Não usa Firebase SDK nem se comunica com o Next.js.

### 2.3 Árvore de pastas anotada

```
prosport/
├── CLAUDE.md                      # este arquivo
├── apphosting.yaml                # config de deploy no Firebase App Hosting (Cloud Run) — só este arquivo na RAIZ é lido pelo Firebase
├── firebase.json                  # config do Firebase CLI (hosting estático, functions, firestore rules)
├── firestore.rules                # regras do Firestore: sportpages/landings são públicas para leitura, escrita só via Admin SDK
├── storage.rules                  # regras do Firebase Storage: fotos em sportpages/{slug}/** são públicas para leitura, escrita só via Admin SDK
├── next.config.ts                 # ⚠️ ignora erros de TS e de lint durante `next build` — ver §6 e §9
├── docs/
│   ├── blueprint.md                # spec original do produto (gerado pelo Firebase Studio) — visão e guia de estilo
│   ├── marketing-growth.md         # plano de marketing/growth/redes sociais (ver §12)
│   └── whatsapp-integration.md     # roadmap de integração WhatsApp (ver §13)
├── src/
│   ├── ai/
│   │   ├── genkit.ts                # instancia o cliente Genkit com plugin googleAI (usa GEMINI_API_KEY)
│   │   ├── dev.ts                   # entrypoint do Genkit Developer UI local (carrega .env via dotenv)
│   │   └── flows/
│   │       ├── types.ts                          # schemas Zod de input/output dos flows
│   │       ├── generate-sponsor-presentation.ts   # gera a apresentação (Markdown) para patrocinadores — plano Básico
│   │       ├── generate-enhanced-sportpage.ts      # gera a sportpage Plus/Premium em HTML completo via Gemini
│   │       └── test-ai-connection.ts               # flow trivial para checar se a chave do Gemini funciona (usado em /test-ai)
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                    # landing institucional
│   │   ├── layout.tsx                  # layout raiz, fontes (Poppins/PT Sans), footer
│   │   ├── plans/page.tsx              # planos do atleta (Básico/Plus/Premium)
│   │   ├── company/plans/page.tsx      # plano Pro para empresas/clubes
│   │   ├── checkout/page.tsx           # ✅ checkout real via Stripe Checkout (ver §3, §4.5)
│   │   ├── api/webhooks/stripe/route.ts  # API Route — webhook do Stripe, verifica assinatura, atualiza o plano no Firestore (ver §4.5, §6.8)
│   │   ├── signup/, athlete/login/, company/signup/, company/login/, club/login/, forgot-password/
│   │   │                              # ✅ autenticação real (Firebase Auth via Server Actions, ver §4.1) — conteúdo de negócio de empresa/clube ainda é estático
│   │   ├── dashboard/
│   │   │   ├── page.tsx                # painel do atleta — protegido por `requireSession(["athlete"])`
│   │   │   └── actions.ts              # Server Actions: chama os flows de IA, salva o HTML gerado (`setPageContent`) e indexa `athleteProfile` em `users/{uid}` (plano Plus/Premium, ver §4.7)
│   │   ├── club/dashboard/, company/dashboard/  # protegidos por `requireSession(["company"])` — busca de atletas real via `AthleteSearchSection` (ver §4.7)
│   │   ├── admin/page.tsx              # painel admin — protegido por `requireSession(["admin"])`; métricas vêm de `src/lib/admin-metrics.ts`
│   │   ├── p/[slug]/page.tsx           # página PÚBLICA da sportpage — renderiza o HTML salvo em `iframe srcDoc` sandboxed
│   │   └── test-ai/page.tsx            # página de diagnóstico que chama `testAiConnection`
│   ├── components/
│   │   ├── auth/                       # formulários de login/signup/recuperação de senha — chamam os Server Actions de `src/lib/auth-actions.ts`
│   │   ├── checkout/checkout-form.tsx  # UI de checkout — chama `createCheckoutSession` e redireciona (`window.location.href`) pro Stripe; sem formulário de cartão local
│   │   ├── dashboard/athlete-dashboard-client.tsx  # formulário de geração da sportpage (envia foto como base64 data URI — ver §7); recebe o plano real via prop
│   │   ├── dashboard/send-to-sponsor-form.tsx  # form (Plus/Premium) que chama `sendSportpageToSponsor` para enviar a sportpage por e-mail a um patrocinador (ver §4.8)
│   │   ├── admin/admin-dashboard-client.tsx
│   │   ├── company/athlete-search-section.tsx  # Server Component compartilhado por `company/dashboard` e `club/dashboard`: form de busca (GET nativo, sem JS) + cards de resultado (ver §4.7)
│   │   └── ui/                         # primitivos shadcn/ui (gerados; evite editar a lógica interna, prefira compor por fora)
│   ├── hooks/                          # use-toast, use-mobile
│   └── lib/
│       ├── firebase-admin.ts           # inicializa o Admin SDK via API modular (`firebase-admin/app`, `/firestore`, `/auth`, `/storage`, não o import default legado); exporta `adminDb`, `adminAuth`, `adminStorage`; aceita credenciais via `FIREBASE_SERVICE_ACCOUNT` (Vercel) OU credenciais automáticas (App Hosting/Cloud Run)
│       ├── firebase-rest.ts            # chamadas REST à Identity Toolkit API (login com senha, troca de custom token, e-mail de reset) — usa `FIREBASE_WEB_API_KEY`
│       ├── auth.ts                     # `getSession()`/`requireSession(roles)` — usados no topo dos Server Components protegidos
│       ├── auth-actions.ts             # Server Actions de auth: signupAthlete, signupCompany, loginUser, logoutUser, requestPasswordReset
│       ├── plans.ts                    # fonte única dos 4 planos (preço em centavos, role) — usada pela UI e pela criação da Checkout Session
│       ├── stripe.ts                   # `getStripe()` — client Stripe instanciado de forma lazy (ver §6.9)
│       ├── checkout-actions.ts         # Server Action `createCheckoutSession` — cria a Checkout Session e devolve a URL de redirect
│       ├── billing-actions.ts          # Server Actions `createBillingPortalSession`/`redirectToBillingPortal` — portal do cliente Stripe (gerenciar/cancelar assinatura)
│       ├── email.ts                    # `getResend()` — client Resend instanciado de forma lazy (mesmo padrão do `getStripe()`, ver §6.9) — e `getEmailFromAddress()`
│       ├── sponsor-email-actions.ts    # Server Action `sendSportpageToSponsor` — envia a sportpage por e-mail a um patrocinador via Resend (plano Plus/Premium, ver §4.8)
│       ├── storage.ts                  # CRUD simples da coleção Firestore `sportpages` (apesar do nome, NÃO usa Firebase Storage)
│       ├── upload-photo.ts             # `uploadAthletePhoto` — sobe a foto do atleta pro Firebase Storage e devolve a download URL (este sim usa Firebase Storage)
│       ├── admin-metrics.ts            # `getAdminMetrics` — agregações `.count()` do Firestore para o painel admin
│       ├── athlete-search.ts           # `searchAthletes(query)` — lê atletas Plus/Premium (`users` com `athleteProfile`) e filtra por nome/esporte (ver §4.7)
│       └── utils.ts                    # helper `cn()` (clsx + tailwind-merge)
├── functions/                       # Firebase Cloud Functions (codebase "default")
│   ├── src/
│   │   └── index.ts                    # `generateLanding` (POST) e `getLanding` (GET) — API pública, sem IA, sem autenticação
│   └── package.json                    # scripts de build/deploy/emuladores
├── prosport_mobile/                 # app Flutter — harness de QA, não é produto final
│   └── lib/
│       ├── main.dart                   # UI de teste manual (`ProSportApp` / `LandingTestPage`)
│       └── services/prosport_api.dart  # cliente HTTP que chama `generateLanding`
└── keystore/                        # keystores Android (.jks) — nunca versionar (ver §9)
```

## 3. Stack Tecnológica

Esta tabela descreve a arquitetura **alvo** pedida para o produto. Onde o item ainda não existe no código, está marcado e cruzado com a §10 (Integrações Pendentes).

| Camada | Tecnologia | Status |
|---|---|---|
| Frontend | Next.js 15 (App Router) + React 18 + TypeScript | ✅ Implementado |
| UI | shadcn/ui + Tailwind CSS + Radix UI + lucide-react | ✅ Implementado |
| Formulários | react-hook-form + zod | ✅ Implementado |
| Geração de conteúdo (frontend) | Genkit (`genkit` 1.37, `@genkit-ai/googleai` 1.28) + Gemini (`gemini-1.5-flash-latest`) | ✅ Implementado, em `src/ai/flows/*`. ⚠️ `@genkit-ai/googleai` está deprecated upstream em favor de `@genkit-ai/google-genai` (ainda funciona, sem prazo de remoção anunciado) — migrar é uma decisão separada, não feita aqui |
| Geração de conteúdo (Cloud Functions) | OpenAI GPT-4o-mini | ✅ Implementado — `generateLanding` chama o GPT-4o-mini (`generateBioWithOpenAI`) para gerar a bio do atleta quando ela não vem no corpo da requisição; falha (secret ausente, erro de rede) é logada e não bloqueia o cadastro (ver §2.2) |
| Banco de dados | Firebase Firestore | ✅ Implementado (duas coleções paralelas, ver §2.2) |
| Upload de imagem | Firebase Storage | ✅ Implementado — `src/lib/upload-photo.ts` (`uploadAthletePhoto`) sobe a foto para `sportpages/{slug}/photo.{ext}` no Storage e devolve uma download URL; só a URL é salva no HTML/Firestore |
| Autenticação | Firebase Auth + sessão via cookie `httpOnly` | ✅ Implementado (`src/lib/auth.ts`, `auth-actions.ts`, `firebase-rest.ts`) — sem Firebase Client SDK, tudo roda no servidor (ver §4.1) |
| Pagamentos | Stripe Checkout (hosted/redirect) | ✅ Implementado (`src/lib/checkout-actions.ts`, `stripe.ts`, `plans.ts`, webhook em `src/app/api/webhooks/stripe/route.ts`) — sem Stripe Elements, sem Produtos/Preços pré-criados no Dashboard (ver §4.5) |
| Envio de e-mail | Resend | ✅ Implementado — `src/lib/email.ts` (`getResend()`, lazy igual ao `getStripe()`) + `src/lib/sponsor-email-actions.ts` (`sendSportpageToSponsor`), usado pelo envio da sportpage a patrocinadores (Plus/Premium, ver §4.8). **Falta**: secrets em produção e domínio verificado no Resend (ver §5, §10 item 6) |
| Backend standalone | Firebase Cloud Functions v2 (Node 22) | ✅ Implementado (`generateLanding`/`getLanding`) |
| Deploy do app Next.js | Vercel (projeto `prosport`) | ✅ É o destino real de produção hoje (confirmado em 2026-06-24 via `vercel projects ls` — domínio `prosport.ia.br`/`www` apontados pra lá, ver §1) |
| Deploy alternativo do app Next.js | Firebase App Hosting (Cloud Run) | ⚠️ `apphosting.yaml` está configurado no repo (`firebase-admin.ts` usa credenciais automáticas do Cloud Run quando rodando lá), mas **não há nenhum backend criado** no projeto `prosport-portfolio` (confirmado via `firebase apphosting:backends:list` — lista vazia). Migrar para lá é uma decisão em aberto, não feita ainda |
| App mobile | Flutter | ✅ Implementado, mas apenas como ferramenta de QA das Functions, não como app de atleta/usuário final |

## 4. Fluxos de Negócio

### 4.1 Autenticação (✅ real)
Toda a autenticação roda no servidor, sem Firebase Client SDK (ver §6.4 para a justificativa da arquitetura):

**Signup** (`signupAthlete`/`signupCompany` em `src/lib/auth-actions.ts`):
1. `adminAuth.createUser({ email, password, displayName })` (Admin SDK) cria o usuário no Firebase Auth.
2. Cria o doc `users/{uid}` no Firestore com `role` (`athlete`/`company`), `plan` (`basic` para atleta novo, `null` para empresa) e os dados do formulário.
3. `adminAuth.createCustomToken(uid)` → troca por um `idToken` via REST (`signInWithCustomToken`, `src/lib/firebase-rest.ts`) → `adminAuth.createSessionCookie(idToken)` → cookie `session` (`httpOnly`, `secure` em produção, `sameSite=lax`, 5 dias) setado via `cookies().set(...)`.
4. Redireciona para o dashboard correspondente.

**Login** (`loginUser`):
1. `signInWithPassword(email, password)` (REST à Identity Toolkit) verifica a senha de verdade — erro genérico "E-mail ou senha inválidos" em qualquer falha (não revela se o e-mail existe).
2. Mesmo fluxo de `createSessionCookie` acima.
3. O formulário (`login-form.tsx`) redireciona com base no `role` real devolvido — **não** no botão/página que o usuário usou para logar. Se o role não corresponder ao portal (ex.: conta `athlete` tentando logar em `/company/login`), a sessão recém-criada é desfeita (`logoutUser()`) e mostra "Esta conta não tem acesso a este portal."

**Logout** (`logoutUser`): revoga os refresh tokens do usuário (`adminAuth.revokeRefreshTokens`) e remove o cookie `session`. Acionado por um `<form action={logoutUser}>` dentro do `Header`.

**Proteção de rota**: cada Server Component protegido chama `requireSession(roles, redirectTo)` (`src/lib/auth.ts`) no topo da função — sem `middleware.ts` (decisão deliberada, ver §6.4). `requireSession` verifica o cookie com `adminAuth.verifySessionCookie(cookie, true)`, busca o doc em `users/{uid}`, e usa `redirect()` do Next.js se a sessão for inválida ou o `role` não estiver na lista permitida.

**Admin**: não existe signup público. Para tornar um usuário admin, defina manualmente `role: "admin"` no doc `users/{uid}` dele no Firestore (Console ou um script one-off) — o antigo "backdoor" hardcoded (`email === "admin@prosport.com"`) foi removido de `login-form.tsx`.

**`company` vs. `club`**: tratados como o mesmo `role: "company"` — o produto usa o mesmo formulário de signup e dashboards quase idênticos para os dois; não foi criada uma distinção que o produto não tem.

### 4.2 Geração de sportpage pelo Next.js (plano Básico)
1. Atleta preenche o formulário em `athlete-dashboard-client.tsx`.
2. `createBasicPresentation` (`src/app/dashboard/actions.ts`) chama `generateSponsorPresentation` (Genkit + Gemini), que devolve Markdown.
3. O Markdown é embrulhado num HTML simples (`<pre>`) e salvo via `setPageContent(slug, html)` na coleção `sportpages`.
4. Retorna a URL pública `/p/{slug}-basic-{timestamp}`.

### 4.3 Geração de sportpage pelo Next.js (plano Plus/Premium)
1. Atleta preenche o mesmo formulário + foto (convertida para base64 no browser) + link do YouTube (opcional).
2. `createEnhancedSportpage` (`src/app/dashboard/actions.ts`) exige `getSession()` válida com `role === "athlete"` — só depois disso chama `generateEnhancedSportpage`, que pede ao Gemini para gerar o **HTML completo** da página (com placeholder de imagem `__IMAGE_PLACEHOLDER__` e, se houver YouTube, um iframe de embed).
3. O placeholder é substituído pela data URI da foto.
4. HTML final salvo em `sportpages/{slug}-plus-{timestamp}`.
5. A página pública (`/p/[slug]`) renderiza esse HTML dentro de um `<iframe srcDoc>` com `sandbox="allow-scripts allow-same-origin"`.
6. Em seguida, grava (`merge: true`) um campo `athleteProfile` (`sport`, `isAmateur`, `achievements`, `photoUrl`, `slug`, `sportpageUrl`, `updatedAt`) em `users/{session.uid}` — é esse campo que alimenta a busca de atletas (ver §4.7). `createBasicPresentation` (plano Básico) não grava `athleteProfile`: Básico nunca é pesquisável, por design (ver §1).

### 4.4 Geração pela Cloud Function (`generateLanding`/`getLanding`)
Fluxo independente do Next.js, hoje usado pelo app Flutter de QA:
1. `POST generateLanding` recebe `plano`, `nome`, `modalidade`, `imagem` (+ campos opcionais `bio`, `conquistas`, `amador`, `contatoEmail`, `redes`, `theme`), normaliza nomes PT/EN. Se `bio` não vier no corpo, chama o GPT-4o-mini (`generateBioWithOpenAI`, secret `OPENAI_API_KEY` — ver §5) para gerar uma bio curta a partir de `nome`/`modalidade`/`conquistas`/`amador`; falha na chamada é logada e ignorada (segue sem bio). Depois gera um slug e grava/atualiza (`merge: true`) em `landings/{slug}`.
2. `GET getLanding?slug=X&format=html|json` lê o documento e devolve JSON, ou renderiza um HTML local (`renderHTML`) — **todo valor é escapado com `escapeHtml()` antes de ir para o HTML** (corrigido — ver §7, era uma XSS).

### 4.5 Upgrade de plano (✅ pagamento real via Stripe Checkout)
`checkout-form.tsx` lê o plano da query string (`?plan=`), mostra o preço (de `src/lib/plans.ts`, fonte única de preços — usada tanto na UI quanto na cobrança), e ao clicar em "Assinar Agora" chama o Server Action `createCheckoutSession` (`src/lib/checkout-actions.ts`):
1. Confirma sessão real (`getSession()`) e que o `role` do usuário corresponde ao plano (atleta não compra `pro`, empresa não compra `basic`/`plus`/`premium`).
2. Cria uma Stripe Checkout Session (`mode: subscription`) com `price_data` inline (sem Produto/Preço pré-cadastrado no Stripe Dashboard) e `client_reference_id`/`metadata.uid` apontando pro usuário logado — tanto na sessão quanto na subscription resultante (`subscription_data.metadata`), pra o webhook conseguir achar o usuário em qualquer evento.
3. Client faz `window.location.href = url` — redirect de verdade pro `checkout.stripe.com` (não é navegação interna do Next, por isso não usa `router.push`).

**O plano só é atualizado no Firestore pelo webhook** (`src/app/api/webhooks/stripe/route.ts`), nunca no clique do botão nem no `success_url` de retorno — é a fonte de verdade recomendada pelo próprio Stripe, já que o usuário pode fechar a aba antes do redirect de volta completar. Eventos tratados: `checkout.session.completed` (ativa o plano), `customer.subscription.updated` (sincroniza `subscriptionStatus` com o status do Stripe), `customer.subscription.deleted` (zera o plano, marca `subscriptionStatus: "canceled"`). O "plano atual" exibido em `athlete-dashboard-client.tsx` continua vindo do Firestore via `requireSession`.

O antigo `updateUserPlan` (`src/lib/auth-actions.ts`) — que gravava o plano direto no Firestore sem pagamento — foi removido; o fluxo de plano passa exclusivamente pelo webhook do Stripe agora.

**Autoatendimento (✅ portal do cliente Stripe)**: `src/lib/billing-actions.ts` exporta duas Server Actions sobre o mesmo `stripeCustomerId` salvo pelo webhook em `users/{uid}`:
- `createBillingPortalSession()` — devolve `{ success, url }` ou `{ success: false, error }`; usado pelo botão "Gerenciar assinatura" em `athlete-dashboard-client.tsx` (client component, mostra toast em caso de erro).
- `redirectToBillingPortal()` — sem retorno, usado direto em `<form action={redirectToBillingPortal}>` nos dashboards de empresa/clube (`company/dashboard`, `club/dashboard`) — não precisa de JS no client, redireciona com `redirect()` do Next.js.

Ambas chamam `stripe.billingPortal.sessions.create({ customer: stripeCustomerId, return_url })`. **Pré-requisito de produção**: o Customer Portal precisa estar configurado uma vez no Stripe Dashboard (Settings → Billing → Customer portal) — sem isso a chamada falha.

### 4.6 Acesso público à página do atleta
Qualquer pessoa com o link `/p/{slug}` acessa a sportpage gerada — leitura é pública por design (`firestore.rules`: `allow read: if true` nas coleções `sportpages` e `landings`). Não há controle de quem pode ver (não há paywall na visualização, só na geração).

### 4.7 Busca de atletas (✅ real, só Plus/Premium)
`company/dashboard` e `club/dashboard` renderizam `<AthleteSearchSection query={q} />` (`src/components/company/athlete-search-section.tsx`), recebendo `q` da query string da própria página (`searchParams.q` — form HTML simples, GET nativo, sem JS no cliente).

1. O componente chama `searchAthletes(query)` (`src/lib/athlete-search.ts`), que consulta `users` com `role == "athlete"` e `plan == "plus"` ou `plan == "premium"` (duas queries de igualdade em paralelo, mesmo padrão de `getAdminMetrics` — sem precisar de índice composto novo, `firestore.indexes.json` continua vazio).
2. Só entram no resultado docs que já têm `athleteProfile` (ver §4.3) — atleta Plus/Premium que ainda não gerou nenhuma sportpage simplesmente não aparece.
3. Filtro de texto é em memória: `includes()` case-insensitive contra `fullName` e `athleteProfile.sport` (sem normalização de acento — buscar "natacao" não acha "Natação"; é uma limitação conhecida, não um bug).
4. **Por que só Plus/Premium**: o plano Básico, por modelo de negócio (§1), não inclui divulgação ativa da ProSport — o atleta Básico distribui o próprio link. O `plan` é lido direto de `users/{uid}`, que o webhook do Stripe mantém atualizado (§4.5); se a assinatura for cancelada, o atleta some da busca automaticamente, sem nenhum código adicional.
5. Toda a leitura roda via Admin SDK dentro do Server Component (sem Client SDK, ver §4.1) — não há regra nova em `firestore.rules` para isso.

Validado manualmente criando e depois removendo contas de teste reais no Firebase do projeto (Auth + Firestore): atletas Plus/Premium aparecem, atleta Básico com `athleteProfile` preenchido não aparece (confirma que o filtro é por plano, não só presença do campo), busca por nome/esporte filtra corretamente, e o link "Ver Sportpage" resolve em `/p/{slug}`.

### 4.8 Envio da sportpage por e-mail a patrocinadores, clubes e imprensa (✅ real, só Plus/Premium)
Primeiro canal de distribuição ativa da própria ProSport (ver §10, itens 6–7 — WhatsApp continua só roadmap, ver [[whatsapp-integration]]).

1. No painel do atleta, depois de gerar a Sport Page Plus/Premium, aparece `<SendToSponsorForm sportpageUrl={...} audienceLabel={...} />` (`src/components/dashboard/send-to-sponsor-form.tsx`) — formulário react-hook-form + zod com e-mail/nome do destinatário e mensagem opcional. `audienceLabel` é só rótulo de UI ("patrocinador" no Plus, "patrocinador/clube/imprensa" no Premium, ver §1) — o backend não diferencia o tipo de destinatário, é só um e-mail.
2. Ao enviar, chama o Server Action `sendSportpageToSponsor` (`src/lib/sponsor-email-actions.ts`), que confirma sessão real (`getSession()`), `role === "athlete"` e `plan` igual a `"plus"` ou `"premium"` (mesmo critério de negócio da busca de atletas, §4.7) antes de qualquer envio.
3. O HTML do e-mail é montado com `escapeHtml()` em todo campo livre (`sponsorName`, `message`, URL) antes da interpolação — mesma regra do §6.6 — e enviado via `getResend().emails.send(...)` (`src/lib/email.ts`), usando `getEmailFromAddress()` como remetente.
4. Falha do Resend (API key ausente, domínio não verificado, erro de rede) é logada e devolve `{ success: false, error }` para o form mostrar um toast — nunca lança erro não tratado.
5. Plano Básico nunca vê esse formulário (por design, mesmo motivo do §4.7) — e mesmo que chamasse o Server Action diretamente, a checagem de `plan` no servidor bloquearia.

**Pré-requisito de produção**: `RESEND_API_KEY` precisa estar cadastrada (ver §5) e, para enviar de um endereço `@prosport.ia.br` em vez do domínio de teste do Resend, o domínio precisa estar verificado no Resend Dashboard (Domains → Add Domain) com `RESEND_FROM_EMAIL` apontando pro endereço verificado.

## 5. Variáveis de Ambiente

Nenhum valor real deve aparecer aqui nem em nenhum arquivo versionado — apenas nomes e onde obtê-los.

### Local (`.env` ou `.env.local`, na raiz — já está no `.gitignore`)
| Variável | Onde obter | Usado por |
|---|---|---|
| `GEMINI_API_KEY` | https://aistudio.google.com/app/apikey | `src/ai/genkit.ts`, carregado via `dotenv` em `src/ai/dev.ts` para `npm run dev` / `npm run genkit:dev` |
| `FIREBASE_WEB_API_KEY` | Firebase Console → Configurações do projeto → Geral → seção "Seus apps" → app Web (crie um se não existir; não precisa instalar nada) | `src/lib/firebase-rest.ts` — login com senha, troca de custom token, e-mail de redefinição de senha. Não é um segredo no modelo de ameaças do Firebase, mas é usada só no servidor aqui por simplicidade de arquitetura (ver §6.4) |
| `FIREBASE_SERVICE_ACCOUNT` (opcional localmente) | Firebase Console → Configurações do projeto → Contas de serviço → Gerar nova chave privada (cole o JSON inteiro como string) | `src/lib/firebase-admin.ts` — se ausente, tenta Application Default Credentials (`gcloud auth application-default login`). **Necessária para testar qualquer fluxo de auth localmente** (signup/login/logout chamam o Admin SDK), não só geração de sportpage |
| `FIREBASE_STORAGE_BUCKET` (opcional) | Firebase Console → Storage (nome do bucket, ex. `prosport-portfolio.appspot.com` ou `prosport-portfolio.firebasestorage.app`) | `src/lib/firebase-admin.ts` — se ausente, o Admin SDK usa o bucket padrão do projeto (funciona automaticamente em App Hosting/Cloud Run; defina explicitamente se o bucket padrão não existir ainda ou tiver nome diferente) |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys (use a chave **de teste**, `sk_test_...`, em dev) | `src/lib/stripe.ts` — cria a Checkout Session |
| `STRIPE_WEBHOOK_SECRET` | Local: `stripe listen --forward-to localhost:9003/api/webhooks/stripe` imprime um `whsec_...` de teste. Produção: Stripe Dashboard → Developers → Webhooks → criar endpoint apontando pro domínio real → revela o `whsec_...` daquele endpoint | `src/app/api/webhooks/stripe/route.ts` — verifica a assinatura do webhook antes de processar qualquer evento |
| `RESEND_API_KEY` | https://resend.com/api-keys | `src/lib/email.ts` (`getResend()`) — envia o e-mail de `sendSportpageToSponsor` (§4.8). Sem ela, `getResend()` lança erro e o Server Action devolve `{ success: false }` (não derruba a aplicação) |
| `RESEND_FROM_EMAIL` (opcional) | Resend Dashboard → Domains (depois de verificar `prosport.ia.br`) | `src/lib/email.ts` (`getEmailFromAddress()`) — endereço remetente, ex. `"ProSport <contato@prosport.ia.br>"`. Sem essa var, cai no fallback `onboarding@resend.dev` (funciona só em modo de teste do Resend, antes do domínio ser verificado) |

### Vercel (destino de deploy real do Next.js hoje — projeto `prosport`, confirmado em 2026-06-24)
| Variável | Onde obter | Como é provisionada |
|---|---|---|
| `GEMINI_API_KEY` | Google AI Studio | Project Settings da Vercel → Environment Variables |
| `FIREBASE_WEB_API_KEY` | Firebase Console (ver tabela local acima) | Project Settings da Vercel → Environment Variables |
| `FIREBASE_SERVICE_ACCOUNT` | Service account JSON do Firebase, colado como string única na env var | Project Settings da Vercel → Environment Variables — é assim que o Admin SDK autentica fora do Cloud Run (ver `src/lib/firebase-admin.ts`) |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Mesmas chaves acima | Project Settings da Vercel → Environment Variables |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Mesmas chaves acima | Project Settings da Vercel → Environment Variables — **ainda não cadastradas em produção**, ver §10 item 6 |

Use `npx vercel env ls` / `npx vercel env pull` para inspecionar o que já está cadastrado lá (CLI da Vercel não estava logado nem linkado até esta sessão — ver §8 para como autenticar).

### Firebase App Hosting (alternativa configurada no repo, não usada em produção)
`apphosting.yaml` na raiz já declara `GEMINI_API_KEY` e `FIREBASE_WEB_API_KEY`, mas **não existe nenhum backend criado** no projeto `prosport-portfolio` (confirmado via `firebase apphosting:backends:list --json` → lista vazia). Migrar para lá é uma decisão em aberto — se feita, ainda faltaria cadastrar as secrets no Secret Manager (`firebase apphosting:secrets:set NOME`) e declarar `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` no YAML, que hoje não estão lá. `FIREBASE_SERVICE_ACCOUNT` não seria necessária nesse cenário — o Admin SDK usaria credenciais automáticas do Cloud Run.

### Firebase Cloud Functions (`functions/`, via Secret Manager)
| Variável | Onde obter | Usado por |
|---|---|---|
| `OPENAI_API_KEY` (opcional) | https://platform.openai.com/api-keys | `functions/src/index.ts` (`generateBioWithOpenAI`) — gera a bio do atleta via GPT-4o-mini quando `generateLanding` é chamado sem o campo `bio`. Sem a secret cadastrada, a função simplesmente não gera bio automática (retorna `""`) e segue salvando o landing normalmente — não é um requisito bloqueante, é um enhancement |

Gerenciar secrets das Functions: `firebase functions:secrets:set NOME_DA_VARIAVEL` (pede o valor interativamente, nunca via argumento de linha de comando).

## 6. Regras de Código Obrigatórias

1. **TypeScript estrito**: não usar `any` em código novo — preferir `unknown` + type guards ou tipos explícitos (o `index.ts` das Functions tem `any` legado; não copiar esse padrão em código novo).
2. **Genkit — nunca `z.string()` puro como output schema.** Schemas de output de `ai.defineFlow`/`ai.definePrompt` devem ser sempre `z.object({...})`, mesmo que o conteúdo final seja uma única string. Use `z.object({ html: z.string() })` (ou nome de campo equivalente) e acesse `output.html`.
   - ~~Violação existente conhecida em `types.ts:34`~~ — ✅ corrigida: `GenerateEnhancedSportpageOutputSchema` agora é `z.object({ html: z.string() })`; `generate-enhanced-sportpage.ts` e `dashboard/actions.ts` já desestruturam `{ html }` em vez de tratar o retorno como string solta.
3. **Upload de imagem/arquivo binário → sempre Firebase Storage, nunca base64 embutido em documento Firestore.** Salve o arquivo no Storage e grave só a URL no Firestore. ✅ Implementado: o client em `athlete-dashboard-client.tsx` ainda converte a foto para data URI (necessário para trafegar o arquivo até o Server Action), mas `createEnhancedSportpage` (`src/app/dashboard/actions.ts`) repassa esse data URI para `uploadAthletePhoto` (`src/lib/upload-photo.ts`), que sobe o arquivo pro Storage (`sportpages/{slug}/photo.{ext}`, ver `storage.rules`) e só a download URL resultante é embutida no HTML salvo no Firestore — nunca o base64 em si.
4. **Sessão de usuário → sempre cookie `httpOnly` assinado pelo servidor, nunca `sessionStorage`/`localStorage` para decidir autenticação ou plano.** ✅ Implementado: `loginUser`/`signupAthlete`/`signupCompany` (`src/lib/auth-actions.ts`) mintam um *session cookie* via `adminAuth.createSessionCookie(idToken)` e o setam como `httpOnly`/`secure`/`sameSite=lax` com `cookies().set(...)`. Proteção de rota é feita chamando `requireSession(roles)` (`src/lib/auth.ts`) no topo de cada Server Component protegido — **deliberadamente sem `middleware.ts`**, para evitar rodar `firebase-admin` em Edge Runtime (incerteza de compatibilidade); Server Components/Server Actions já rodam em Node.js runtime por padrão, então `requireSession` ali é simples e confiável. Não recrie esse fluxo com `sessionStorage` em nenhuma feature nova.
5. **Server Actions vs API Routes**:
   - Use **Server Actions** (como em `src/app/dashboard/actions.ts`, `checkout-actions.ts`) para mutações originadas de formulários/UI dentro do próprio app Next.js.
   - Use **API Routes** (`src/app/api/.../route.ts`) ou as **Cloud Functions** quando o consumidor é externo ao Next.js (webhooks do Stripe — ✅ implementado em `src/app/api/webhooks/stripe/route.ts`, chamadas do app mobile, integrações de terceiros como WhatsApp) — Server Actions não são desenhadas para serem chamadas por clientes externos.
6. **Toda string vinda de input de usuário que será inserida em HTML renderizado deve ser escapada** antes da interpolação (ver `escapeHtml()` em `functions/src/index.ts` como referência) — nunca interpolar `req.body`/Firestore docs direto em template strings de HTML.
7. **Imports com alias `@/`** seguem o padrão já configurado em `tsconfig.json` — use-o em vez de caminhos relativos longos.
8. **Webhook do Stripe → sempre verificar a assinatura antes de processar qualquer evento**, com `stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET)` (✅ implementado em `src/app/api/webhooks/stripe/route.ts`). Use o **body cru** (`await req.text()`), nunca `req.json()` antes de verificar — a assinatura é calculada sobre os bytes exatos recebidos.
9. **Cliente Stripe é instanciado de forma lazy** (`getStripe()` em `src/lib/stripe.ts`), nunca no topo do módulo — `next build` avalia módulos de Server Action/API Route estaticamente, e isso quebraria caso `STRIPE_SECRET_KEY` não esteja presente no ambiente de build. Siga esse padrão para qualquer SDK novo que exija uma chave obrigatória.

## 7. Bugs Conhecidos e Correções

| # | Bug | Causa raiz | Correção aplicada | Arquivo |
|---|---|---|---|---|
| 1 | XSS persistente: dados do usuário gravados via `generateLanding` eram renderizados sem escapar em `getLanding?format=html` | `renderHTML()` interpolava `nome`, `modalidade`, `imagem`, `bio`, `contatoEmail` direto em template strings HTML | Criada `escapeHtml()` e aplicada a todo valor antes de entrar no HTML | `functions/src/index.ts` |
| 2 | Erro de tipo (`tsc` falhava) | `getYouTubeEmbedUrl` retorna `string \| null`, mas o schema de input do prompt esperava `string \| undefined` | `embeddableYoutubeLink ?? undefined` antes de passar ao prompt | `src/ai/flows/generate-enhanced-sportpage.ts` |
| 3 | `flutter analyze` falhava (`MyApp` isn't a class) | `widget_test.dart` era o boilerplate padrão do Flutter, nunca atualizado após o app real ser renomeado para `ProSportApp` (sem contador) | Teste reescrito para validar o app real (renderização do formulário de teste) | `prosport_mobile/test/widget_test.dart` |
| 4 | Código morto: secret `OPENAI_API_KEY` declarado mas nunca chamado | Sobra de uma tentativa anterior de integração com OpenAI nas Functions, nunca concluída | Removida a declaração `defineSecret("OPENAI_API_KEY")` e a referência em `secrets: [...]` de `generateLanding` | `functions/src/index.ts` |
| 5 | Arquivo de config duplicado/obsoleto | `src/apphosting.yaml` era um resquício de uma reestruturação anterior do repo; só o `apphosting.yaml` da raiz é lido pelo Firebase App Hosting | Arquivo removido | `src/apphosting.yaml` (deletado) |
| 6 | Boilerplate morto confundindo o codebase | `genkit-sample.ts` é o exemplo padrão gerado pelo Firebase (`menuSuggestion`), nunca foi importado/exportado por `index.ts` nem faz parte do produto | Arquivo removido, junto com o script `genkit:start` em `functions/package.json` que o referenciava, e os artefatos compilados (`lib/genkit-sample.*`) | `functions/src/genkit-sample.ts` (deletado) |
| 8 | XSS persistente no plano Básico | `createBasicPresentation` interpolava `data.fullName` e o Markdown gerado pela IA (`presentation`, que ecoa campos livres do atleta) direto em HTML, sem escapar — violando a regra §6.6 — renderizado depois na página pública `/p/[slug]` | Criado `escapeHtml()` (`src/lib/escape-html.ts`) e aplicado a ambos os valores antes da interpolação | `src/app/dashboard/actions.ts`, `src/lib/escape-html.ts` (novo) |
| 9 | Sandbox do iframe público enfraquecido | `sandbox="allow-scripts allow-same-origin"` em `/p/[slug]` é uma combinação conhecida que neutraliza o sandbox (o conteúdo ganha acesso ao mesmo origin do documento pai com scripts habilitados) | Removido `allow-same-origin`, mantendo apenas `allow-scripts` (suficiente para o embed do YouTube continuar funcionando) | `src/app/p/[slug]/page.tsx` |
| 10 | `npm audit` com 3 vulnerabilidades críticas e 21 altas (app Next.js) | Dependências desatualizadas (`fast-xml-parser`, `handlebars`, `protobufjs`, `next`, `axios`, `express`, etc.) com fixes não-major disponíveis, nunca aplicados | `npm audit fix` aplicado (sem `--force`) + `firebase-admin` atualizado para v14 (migrado para a API modular — ver item 12) + `genkit`/`@genkit-ai/googleai`/`@genkit-ai/next`/`genkit-cli` atualizados para a última versão 1.x — reduziu para 0 críticas / 6 altas / 63 moderadas. As ~69 restantes são dependências internas do próprio `genkit` (uuid antigo embutido em `jaeger-client`, `@opentelemetry/*`, `google-gax`) sem fix publicado ainda — não há nada a fazer localmente até o time do Genkit atualizar essas deps | `package.json`, `package-lock.json`, `src/lib/firebase-admin.ts` |
| 11 | `npm audit` com 3 vulnerabilidades críticas e 21 altas (Cloud Functions) | Mesma causa do item 10, na árvore de dependências de `functions/` | `npm audit fix` aplicado + removidas as dependências mortas `genkit`/`genkit-cli`/`@genkit-ai/firebase`/`@genkit-ai/googleai` (ver item 12) — reduziu para 0 críticas / 0 altas / 27 moderadas (as restantes são do próprio `firebase-admin@13` aguardando `firebase-functions` declarar suporte oficial ao v14) | `functions/package.json` |
| 12 | Dependências de IA mortas em `functions/` | `genkit`, `genkit-cli`, `@genkit-ai/firebase` e `@genkit-ai/googleai` estavam declaradas em `functions/package.json` mas nunca importadas em `functions/src/index.ts` — resquício da mesma tentativa abandonada de integração com IA que já tinha deixado o secret morto `OPENAI_API_KEY` (ver item 4) — e principal fonte das vulnerabilidades do item 11 (puxam `@opentelemetry/*`/`jaeger-client` antigos) | As 4 dependências foram removidas de `functions/package.json` | `functions/package.json` |
| 7 | Auth mockada + backdoor de admin hardcoded | Login/signup nunca verificavam credencial nenhuma; `login-form.tsx` tinha `if (email === "admin@prosport.com") router.push("/admin")` sem checar senha; nenhuma rota era protegida | Implementada autenticação real (Firebase Auth + session cookie httpOnly, ver §4.1); backdoor removido; `requireSession(roles)` agora protege `/dashboard`, `/admin`, `/club/dashboard`, `/company/dashboard` | `src/lib/auth.ts`, `auth-actions.ts`, `firebase-rest.ts`, `login-form.tsx` e demais formulários de auth |

### Dívida técnica conhecida (ainda não corrigida — não repita estes padrões)
- `apphosting.yaml` (raiz) já declara `FIREBASE_WEB_API_KEY`, mas o valor ainda não foi cadastrado no Secret Manager — necessário antes do primeiro deploy em produção com auth real (ver §5).

## 8. Comandos de Desenvolvimento e Deploy

### App Next.js (raiz)
```bash
npm install
npm run dev            # Next dev (Turbopack), porta 9003
npm run genkit:dev      # Genkit Developer UI local (tsx src/ai/dev.ts)
npm run genkit:watch    # idem, com watch
npm run typecheck       # tsc --noEmit — RODE SEMPRE antes de dar push (ver nota abaixo)
npm run build           # next build
npm run start           # next start (produção, após build)
```
> [!warning] `next.config.ts` ignora erros de build
> Define `typescript.ignoreBuildErrors: true` e `eslint.ignoreDuringBuilds: true`. **`npm run build` passar não significa que não há erros de tipo ou lint** — rode `npm run typecheck` separadamente e trate seus erros como bloqueantes.

> [!bug] Gotcha de ambiente (Windows, máquina de dev observada)
> Chamadas HTTPS feitas pelo Node (Admin SDK, download de browsers do Playwright, etc.) podem falhar com `unable to verify the first certificate` — geralmente antivírus/proxy corporativo interceptando TLS. Corrige rodando com `NODE_OPTIONS=--use-system-ca` (ex.: `export NODE_OPTIONS="--use-system-ca" && npm run dev`). Não é um problema do código do projeto.

Deploy do Next.js:
- **Vercel** (destino real de produção — projeto `prosport`, time `iris-marketing-digitaks-projects`): deploy automático a cada push (Git integration da Vercel). CLI local não estava logada/linkada (sem `.vercel/` no repo) até 2026-06-24 — `npx vercel login` (fluxo via device code, funciona mesmo sem `vercel` instalado globalmente) + `npx vercel link` se precisar rodar comandos daqui.
- **Firebase App Hosting** (alternativa configurada no repo via `apphosting.yaml`, não usada em produção): sem backend criado hoje no projeto `prosport-portfolio` (ver §5). Se for migrar, o fluxo seria criar o backend no Firebase Console (App Hosting → Backends → conectar o repo) e cadastrar as secrets faltantes.

**Domínio customizado (`prosport.ia.br`)**: ✅ configurado na Vercel em 2026-06-24 (`npx vercel domains add prosport.ia.br prosport` e `www.prosport.ia.br`, projeto `prosport`). Falta o registro DNS no painel do registro.br apontar pra lá:

| Tipo | Nome | Valor |
|---|---|---|
| A | `@` | `76.76.21.21` |
| A | `www` | `76.76.21.21` |

A Vercel verifica automaticamente após a propagação e emite o certificado SSL sozinha. Não há redirect `www` → raiz configurado (só dá pra fazer pelo dashboard da Vercel, aba Domains do projeto, não pelo CLI) — por ora os dois respondem com o mesmo conteúdo. Confirme o status atual com `npx vercel domains inspect prosport.ia.br` antes de assumir que já propagou.

Testar webhook do Stripe localmente (requer [Stripe CLI](https://stripe.com/docs/stripe-cli) instalada):
```bash
stripe listen --forward-to localhost:9003/api/webhooks/stripe
# imprime um whsec_... de teste — copiar pro STRIPE_WEBHOOK_SECRET do .env.local
```
Cartão de teste padrão do Stripe pra simular pagamento aprovado: `4242 4242 4242 4242`, qualquer validade futura e CVC.

### Firebase Cloud Functions (`functions/`)
```bash
cd functions
npm install
npm run build           # tsc && copia prompts (md/txt/yaml/yml/html) para lib/
npm run build:watch
npm run serve            # build + firebase emulators:start --only functions
npm run shell             # build + firebase functions:shell (REPL)
npm run deploy            # firebase deploy --only functions
npm run logs               # firebase functions:log
npx eslint --ext .js,.ts . [--fix]   # lint (config eslint-config-google)
```
Gerenciar secrets (`OPENAI_API_KEY` é opcional — sem ela, `generateLanding` só não gera bio automática, ver §5):
```bash
firebase functions:secrets:set OPENAI_API_KEY
```
> [!danger] `firebase functions:secrets:access NOME` imprime o VALOR da secret em texto puro no terminal — não é um comando de "ver quem tem acesso" (isso seria `firebase functions:secrets:get NOME`, que só lista metadados/versões). Evite rodar `:access` em qualquer sessão cujo output possa ficar logado; se precisar conferir se uma secret existe, use `:get`.

### Firestore
```bash
firebase deploy --only firestore:rules
```

### App mobile Flutter (`prosport_mobile/`) — apenas ferramenta de QA
```bash
cd prosport_mobile
flutter pub get
flutter analyze
flutter test
flutter run
```

## 9. Regras de Segurança

### O que nunca vai para o GitHub (ou qualquer repositório)
- `.env`, `.env.local` e variantes (já cobertos pelo `.gitignore` raiz: `.env*`).
- Qualquer JSON de service account do Firebase (ex.: `prosport-portfolio-firebase-adminsdk-*.json`). **Hoje não há esse arquivo na raiz do repo** — se algum dia for necessário baixá-lo localmente para testes, salve fora do repo ou garanta uma entrada explícita no `.gitignore` antes de criar o arquivo, e nunca referencie seu caminho absoluto no código (use sempre a env var `FIREBASE_SERVICE_ACCOUNT` ou Application Default Credentials).
- Keystores Android (`keystore/prosport.jks`, `keystore/prosport_release.jks`) — já cobertos pelo padrão `*.jks` no `.gitignore`, mas confirme antes de qualquer `git add -A`.
- Qualquer chave (`GEMINI_API_KEY`, `OPENAI_API_KEY`, tokens de WhatsApp Business/Evolution API quando existirem).

### Onde credenciais devem viver
- **Frontend (Next.js)**: Vercel Environment Variables (destino atual de produção) — ou Secret Manager via `apphosting.yaml` se um dia migrar para Firebase App Hosting.
- **Cloud Functions**: Firebase Secret Manager (`firebase functions:secrets:set`), nunca hardcoded e nunca em `functions/.env`.
- **Local**: `.env.local` na raiz, nunca commitado.

### Rotas protegidas (✅ real)
`/dashboard` (`role: athlete`), `/admin` (`role: admin`), `/club/dashboard` e `/company/dashboard` (`role: company`) chamam `requireSession(roles, redirectTo)` (`src/lib/auth.ts`) no topo do Server Component — sem sessão válida ou sem o role exigido, `redirect()` para a página de login correspondente. Verificado em produção de build: essas 4 rotas aparecem como `ƒ` (dynamic/server-rendered) no output do `next build`, confirmando que dependem de cookie em runtime e não são mais pré-renderizadas estaticamente.

Para promover um usuário a admin: defina manualmente `role: "admin"` no doc `users/{uid}` dele no Firestore (Console ou um script). Não existe (e não deve existir) signup público para admin.

### Protocolo de Proteção de Arquivos ao Editar/Gerar Código
- **Antes de editar um arquivo de produção**, tenha clareza do conteúdo original (leia o arquivo antes de editar; se a edição for grande/arriscada, considere copiar o conteúdo original para referência antes de sobrescrever).
- **Depois de qualquer edição em arquivo `.ts`/`.tsx`**, rode `npm run typecheck` (não confie só em `npm run build` — ver nota no §8 sobre `ignoreBuildErrors`) antes de dar push. Para as Functions, rode `npx tsc --noEmit` dentro de `functions/`.
- Sobre a ferramenta de edição usada: **não há evidência, neste projeto, de que a ferramenta `Edit` corrompa backticks/template literals em arquivos TypeScript.** Template literals com backticks e interpolação (`functions/src/index.ts`, função `renderHTML`) já foram editados diretamente com essa ferramenta e validados depois com `tsc --noEmit` e `eslint`, sem qualquer corrupção ou erro `TS1127`. Se esse erro voltar a aparecer, a causa mais provável é uma ferramenta/editor específico introduzindo caracteres de controle (BOM/encoding errado) — **diagnostique a causa real antes de proibir uma ferramenta**, e sempre confirme qualquer suspeita rodando o typecheck imediatamente após a edição (esse é o guard-rail real, não a escolha de ferramenta).
- Nunca commitar arquivos `.env`, JSON de service account, ou qualquer arquivo com chave privada (ver lista acima).

## 10. Integrações Pendentes (priorizado)

> [!info] Bug crítico de produção corrigido (2026-06-24)
> `FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_WEB_API_KEY` e `RESEND_API_KEY` estavam faltando em Production na Vercel (confirmado via `vercel env ls`) — sem `FIREBASE_SERVICE_ACCOUNT`, `firebase-admin.ts` cairia no fallback de Application Default Credentials, que só funciona em Cloud Run/App Hosting, não na Vercel. As 3 secrets foram cadastradas em Production (Project Settings da Vercel → Environment Variables) e reconfirmadas via `vercel env ls production` na mesma sessão. **Falta**: disparar um novo deploy (env vars só valem para deploys criados depois do cadastro) e validar com um teste real de signup/login em `https://prosport.ia.br` pós-deploy. `RESEND_FROM_EMAIL` continua opcional/pendente (ver item 6).

1. ~~Pagamento real com Stripe~~ — ✅ feito (Stripe Checkout hosted/redirect, ver §4.5). `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` já confirmados cadastrados em Production na Vercel (`vercel env ls`, checado em 2026-06-24). **Falta confirmar manualmente** (não verificável via CLI sem expor a secret): se o endpoint de webhook em produção (Stripe Dashboard → Developers → Webhooks) está apontando pra `https://prosport.ia.br/api/webhooks/stripe`, e se a chave cadastrada já é `sk_live_...` (e não `sk_test_...`) antes de cobrar de verdade.
2. ~~Autenticação real (Firebase Auth + sessão httpOnly)~~ — ✅ feito (ver §4.1, §9).
3. ~~Upload de foto para Firebase Storage~~ — ✅ feito (ver §3, `src/lib/upload-photo.ts`, `storage.rules`).
4. ~~Dashboard admin com métricas reais~~ — ✅ feito: `src/lib/admin-metrics.ts` (`getAdminMetrics`) usa agregação `.count()` do Firestore para nº de atletas, sportpages geradas e assinaturas Plus/Premium; `src/app/admin/page.tsx` passa os dados reais como props para `admin-dashboard-client.tsx` (as variações percentuais fictícias que existiam antes foram removidas, não substituídas por dados reais de histórico).
5. ~~Busca de atletas~~ — ✅ feito (ver §4.7): `company/dashboard` e `club/dashboard` listam e filtram por nome/esporte atletas Plus/Premium que já geraram sportpage (`src/lib/athlete-search.ts`, `src/components/company/athlete-search-section.tsx`). Atleta Básico nunca aparece (por design). **Possível melhoria futura**: busca não normaliza acentos; não há campo de localização (a UI antiga prometia isso no placeholder, removido nesta entrega).
6. ~~Envio da sportpage para patrocinadores (plano Plus/Premium)~~ — ✅ feito o canal de e-mail (ver §4.8, `src/lib/sponsor-email-actions.ts`, `src/components/dashboard/send-to-sponsor-form.tsx`). `RESEND_API_KEY` já cadastrada em Production na Vercel (confirmado em 2026-06-24, ver alerta no topo desta seção). **Falta**: verificar o domínio `prosport.ia.br` no Resend Dashboard (Domains → Add Domain) e cadastrar `RESEND_FROM_EMAIL` — até lá, o envio funciona usando o remetente de teste do Resend (`onboarding@resend.dev`). O canal WhatsApp continua só roadmap (ver `docs/whatsapp-integration.md`).
7. ~~Envio para mídia (plano Premium)~~ — ✅ feito reaproveitando o mesmo canal de e-mail do item 6 (ver §4.8): `SendToSponsorForm` recebe `audienceLabel` e, no plano Premium, o atleta vê "patrocinador, clube ou imprensa" em vez de só "patrocinador" — o backend (`sendSportpageToSponsor`) já era agnóstico de quem é o destinatário, só checava `plan === "plus" || "premium"`. **Geração de Mídia com IA** continua ❌ pendente de propósito: é a própria UI de planos (`src/app/plans/page.tsx`) que marca esse item (e "Análise de Patrocinador") como "(em breve)" — sem uma definição de produto do que "mídia" significa aqui (imagem? vídeo? texto?), implementar agora seria especulativo.
8. ~~Media kit em PDF~~ — ❌ descartado por decisão de produto (2026-06-24): o atleta deve usar o link da sportpage (`/p/{slug}`) como material de divulgação, não um PDF separado. Não implementar geração de PDF nesta funcionalidade a menos que essa decisão seja revista.
9. ~~Limpeza de dívida técnica~~ — ✅ feito: `src/apphosting.yaml` duplicado, secret `OPENAI_API_KEY` morto e `genkit-sample.ts` foram removidos (ver §7, itens 4–6).
10. ~~Portal do cliente Stripe~~ — ✅ feito (`src/lib/billing-actions.ts`, ver §4.5). **Falta**: configurar o Customer Portal no Stripe Dashboard (Settings → Billing → Customer portal) antes de produção — sem isso, `billingPortal.sessions.create` retorna erro.
11. ~~`npm audit` com 100 vulnerabilidades (3 críticas, 23 altas)~~ — ✅ feito o que é seguro fazer hoje: app Next.js em 69 vulnerabilidades (0 críticas/0 críticas restantes, ver §7 itens 10–12), `functions/` em 27 (0 críticas, 0 altas). O que falta é externo ao projeto: `firebase-functions` ainda não declara suporte oficial a `firebase-admin@14` (por isso `functions/` ficou pinado em `firebase-admin@13.10.0`) e o `genkit` ainda carrega `@opentelemetry/*`/`jaeger-client` antigos sem fix — reavaliar quando essas libs upstream atualizarem.
12. ~~Geração de conteúdo com IA nas Cloud Functions (OpenAI GPT-4o-mini)~~ — ✅ feito: `generateLanding` gera a bio do atleta via GPT-4o-mini (`generateBioWithOpenAI`, ver §4.4, §5) quando o campo `bio` não vem na requisição. A secret `OPENAI_API_KEY` já está cadastrada no Secret Manager do projeto `prosport-portfolio` (confirmado em 2026-06-24) — nada pendente aqui além de manter a chave rotacionada se algum dia for exposta (ver §9: nunca rode `firebase functions:secrets:access`, só `:get`).
13. ~~`FIREBASE_SERVICE_ACCOUNT` e `FIREBASE_WEB_API_KEY` faltando em Production na Vercel`~~ — ✅ feito: as duas (+ `RESEND_API_KEY`) foram cadastradas em Production em 2026-06-24 e reconfirmadas via `vercel env ls production` (ver alerta no topo desta seção). **Falta**: disparar um novo deploy pra elas entrarem em vigor e validar com um teste real de signup/login em `https://prosport.ia.br`.

## 11. Contexto do Produto

**Visão de longo prazo**: ser a ponte padrão entre atletas (de qualquer nível, começando por amador/semi-profissional) e quem investe em esporte — patrocinadores, clubes, imprensa — eliminando a barreira de "não sei me apresentar profissionalmente".

**Diferencial competitivo**: a IA do ProSport é **especializada em apresentar atletas** (prompts que entendem "categoria de peso", "ranking em artes marciais", status amador/profissional, conquistas esportivas) — não é um gerador de site genérico. O valor está no conhecimento de domínio embutido nos prompts (`src/ai/flows/*`), não na geração de HTML em si.

**Quem usa a plataforma**:
- **Atletas** — usuários pagantes, criam e mantêm a própria sportpage.
- **Empresas patrocinadoras** — público leitor das páginas geradas (hoje sem conta própria real no produto, além do plano "Pro" institucional ainda incipiente).
- **Clubes** — leitores/parceiros de divulgação (plano Plus/Premium promete divulgação ativa para clubes parceiros).
- **Assessorias de imprensa / mídia** — público-alvo do plano Premium ("envio para grande mídia"), ainda sem fluxo implementado.

## 12. Marketing, Growth e Gestão de Redes Sociais

Conteúdo extenso (funil de conversão, métricas de growth, calendário editorial, estratégias por nicho esportivo, parcerias, programa de indicação, KPIs por período e templates de copy) está em **[[marketing-growth|docs/marketing-growth.md]]**, para manter este arquivo focado em engenharia.

## 13. Comunicação Avançada via WhatsApp

Roadmap completo (CTA nas sportpages, notificações ao atleta, envio a patrocinadores, mensagens de boas-vindas/renovação, assistente via WhatsApp, escolha de API e armazenamento seguro de tokens) está em **[[whatsapp-integration|docs/whatsapp-integration.md]]**.

> [!warning] Nota de verificação
> Nenhum dos itens da seção 13 está implementado hoje — não há nenhuma referência a `wa.me` ou WhatsApp em `src/` ou `functions/src/` no momento em que este documento foi escrito. Trate o conteúdo de [[whatsapp-integration]] como roadmap, não como descrição do estado atual.
