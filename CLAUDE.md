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

**Domínio oficial**: `prosport.ia.br` (registrado no registro.br). ⚠️ Configuração de DNS/custom domain no Firebase App Hosting ainda em andamento — ver §8 (Deploy).

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
- **As Cloud Functions não usam IA.** `generateLanding` apenas recebe campos via POST e grava no Firestore; `getLanding` lê e devolve JSON ou um HTML simples gerado por template string local (`renderHTML`). Quem usa Genkit/Gemini é exclusivamente o app Next.js.
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
| Geração de conteúdo (Cloud Functions) | OpenAI GPT-4o-mini | ❌ Pendente — as Functions hoje só fazem CRUD no Firestore, sem nenhuma chamada de IA (ver §7) |
| Banco de dados | Firebase Firestore | ✅ Implementado (duas coleções paralelas, ver §2.2) |
| Upload de imagem | Firebase Storage | ✅ Implementado — `src/lib/upload-photo.ts` (`uploadAthletePhoto`) sobe a foto para `sportpages/{slug}/photo.{ext}` no Storage e devolve uma download URL; só a URL é salva no HTML/Firestore |
| Autenticação | Firebase Auth + sessão via cookie `httpOnly` | ✅ Implementado (`src/lib/auth.ts`, `auth-actions.ts`, `firebase-rest.ts`) — sem Firebase Client SDK, tudo roda no servidor (ver §4.1) |
| Pagamentos | Stripe Checkout (hosted/redirect) | ✅ Implementado (`src/lib/checkout-actions.ts`, `stripe.ts`, `plans.ts`, webhook em `src/app/api/webhooks/stripe/route.ts`) — sem Stripe Elements, sem Produtos/Preços pré-criados no Dashboard (ver §4.5) |
| Backend standalone | Firebase Cloud Functions v2 (Node 22) | ✅ Implementado (`generateLanding`/`getLanding`) |
| Deploy do app Next.js | Firebase App Hosting (Cloud Run) | ✅ Configurado via `apphosting.yaml` na raiz |
| Deploy alternativo do app Next.js | Vercel | ⚠️ Suportado pelo código (`firebase-admin.ts` aceita `FIREBASE_SERVICE_ACCOUNT` para isso), mas **não há projeto Vercel vinculado** (sem `.vercel/`, sem `vercel.json`) — confirme com o time qual é o destino real antes de configurar variáveis lá |
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
1. `POST generateLanding` recebe `plano`, `nome`, `modalidade`, `imagem` (+ campos opcionais `bio`, `contatoEmail`, `redes`, `theme`), normaliza nomes PT/EN, gera um slug e grava/atualiza (`merge: true`) em `landings/{slug}`.
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

### Firebase App Hosting (destino de deploy atual do Next.js, via `apphosting.yaml`)
| Variável | Onde obter | Como é provisionada |
|---|---|---|
| `GEMINI_API_KEY` | Mesma chave do Google AI Studio acima | Cadastrar no Secret Manager (`firebase apphosting:secrets:set GEMINI_API_KEY`) e referenciar em `apphosting.yaml` (já está) |
| `FIREBASE_WEB_API_KEY` | Mesma chave acima | Já declarada em `apphosting.yaml`; falta só cadastrar o valor no Secret Manager (`firebase apphosting:secrets:set FIREBASE_WEB_API_KEY`) antes do primeiro deploy com auth real |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Mesmas chaves acima — **trocar pra chave live (`sk_live_...`) e criar o endpoint de webhook de produção só quando o app for cobrar de verdade** | Ainda não declaradas em `apphosting.yaml` — adicionar antes do primeiro deploy com Stripe |

`FIREBASE_SERVICE_ACCOUNT` **não é necessária** no App Hosting — o Admin SDK usa credenciais automáticas do Cloud Run.

### Vercel (somente se o time decidir migrar o deploy do Next.js para lá — hoje não está configurado)
| Variável | Onde obter |
|---|---|
| `GEMINI_API_KEY` | Google AI Studio |
| `FIREBASE_WEB_API_KEY` | Firebase Console (ver tabela local acima) |
| `FIREBASE_SERVICE_ACCOUNT` | Service account JSON do Firebase, colado como string única na env var (Project Settings da Vercel → Environment Variables) |

### Firebase Cloud Functions (`functions/`, via Secret Manager)
Nenhuma secret é necessária hoje — `functions/src/index.ts` não chama nenhuma API de IA. Quando a integração real com OpenAI for implementada (§10), cadastre `OPENAI_API_KEY` (https://platform.openai.com/api-keys) via Secret Manager e declare-a no código com `defineSecret`.

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
- **Firebase App Hosting** (destino configurado hoje): deploy automático ao fazer push no branch conectado no Firebase Console (App Hosting → Backends). Não há comando manual de deploy no `package.json` para isso.
- **Vercel** (alternativa suportada pelo código, não configurada): `vercel link` (uma vez) e depois `vercel --prod`.

**Domínio customizado (`prosport.ia.br`)**: ⚠️ em andamento — domínio registrado no registro.br, mas a conexão com o backend do Firebase App Hosting ainda não foi concluída. Configuração não fica em nenhum arquivo do repo (`firebase.json` cobre só a Hosting clássica, não App Hosting); é feita em Firebase Console → App Hosting → backend → Custom domains → Add custom domain, depois adicionando os registros DNS gerados (TXT de verificação + A/CNAME) no painel do registro.br. Confirme no Console se já foi concluído antes de assumir o status.

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
Gerenciar secrets (nenhuma é necessária hoje — exemplo de uso futuro, quando a integração com OpenAI for implementada):
```bash
firebase functions:secrets:set OPENAI_API_KEY
firebase functions:secrets:access OPENAI_API_KEY   # ver quem tem acesso
```

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
- **Frontend (Next.js)**: Vercel Environment Variables (se migrar para lá) ou Secret Manager via `apphosting.yaml` (destino atual).
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

1. ~~Pagamento real com Stripe~~ — ✅ feito (Stripe Checkout hosted/redirect, ver §4.5). **Falta**: configurar o endpoint de webhook de produção e as secrets `STRIPE_*` no Secret Manager antes do primeiro deploy (ver §5); rodar com a chave `sk_test_...` até validar tudo, só trocar pra `sk_live_...` quando for cobrar de verdade.
2. ~~Autenticação real (Firebase Auth + sessão httpOnly)~~ — ✅ feito (ver §4.1, §9).
3. ~~Upload de foto para Firebase Storage~~ — ✅ feito (ver §3, `src/lib/upload-photo.ts`, `storage.rules`).
4. ~~Dashboard admin com métricas reais~~ — ✅ feito: `src/lib/admin-metrics.ts` (`getAdminMetrics`) usa agregação `.count()` do Firestore para nº de atletas, sportpages geradas e assinaturas Plus/Premium; `src/app/admin/page.tsx` passa os dados reais como props para `admin-dashboard-client.tsx` (as variações percentuais fictícias que existiam antes foram removidas, não substituídas por dados reais de histórico).
5. ~~Busca de atletas~~ — ✅ feito (ver §4.7): `company/dashboard` e `club/dashboard` listam e filtram por nome/esporte atletas Plus/Premium que já geraram sportpage (`src/lib/athlete-search.ts`, `src/components/company/athlete-search-section.tsx`). Atleta Básico nunca aparece (por design). **Possível melhoria futura**: busca não normaliza acentos; não há campo de localização (a UI antiga prometia isso no placeholder, removido nesta entrega).
6. **Envio da sportpage para patrocinadores (plano Plus)** — hoje o atleta só recebe o link para enviar manualmente; falta o canal de distribuição ativo da própria ProSport (e-mail e/ou WhatsApp, ver `docs/whatsapp-integration.md`).
7. **Envio para mídia (plano Premium)** e **Geração de Mídia com IA** — já citados como "em breve" na própria UI de planos; nenhuma implementação existe ainda.
8. **Media kit em PDF** — não existe geração de PDF em nenhuma parte do código hoje.
9. ~~Limpeza de dívida técnica~~ — ✅ feito: `src/apphosting.yaml` duplicado, secret `OPENAI_API_KEY` morto e `genkit-sample.ts` foram removidos (ver §7, itens 4–6).
10. ~~Portal do cliente Stripe~~ — ✅ feito (`src/lib/billing-actions.ts`, ver §4.5). **Falta**: configurar o Customer Portal no Stripe Dashboard (Settings → Billing → Customer portal) antes de produção — sem isso, `billingPortal.sessions.create` retorna erro.
11. ~~`npm audit` com 100 vulnerabilidades (3 críticas, 23 altas)~~ — ✅ feito o que é seguro fazer hoje: app Next.js em 69 vulnerabilidades (0 críticas/0 críticas restantes, ver §7 itens 10–12), `functions/` em 27 (0 críticas, 0 altas). O que falta é externo ao projeto: `firebase-functions` ainda não declara suporte oficial a `firebase-admin@14` (por isso `functions/` ficou pinado em `firebase-admin@13.10.0`) e o `genkit` ainda carrega `@opentelemetry/*`/`jaeger-client` antigos sem fix — reavaliar quando essas libs upstream atualizarem.

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
