import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Check,
  Crown,
  Star,
  Zap,
  ArrowRight,
  ShieldCheck,
  Wand2,
  Sparkles,
  Link2,
  Megaphone,
  Clock,
  Trophy,
  ChevronDown,
} from "lucide-react";

import { Header } from "@/components/header";
import { requireSession } from "@/lib/auth";
import { hasActiveSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

/* ======================================================================== */
/*  Fotos (Unsplash — uso livre, ilustram os modelos)                       */
/* ======================================================================== */

const PHOTO_HERO =
  "https://images.unsplash.com/photo-1606335544053-c43609e6155d?w=720&h=900&fit=crop&q=80";
const PHOTO_BASIC =
  "https://images.unsplash.com/photo-1763844072520-e480cb2cec8c?w=600&h=360&fit=crop&q=75";
const PHOTO_PLUS =
  "https://images.unsplash.com/photo-1606335544053-c43609e6155d?w=500&h=700&fit=crop&q=75";
const PHOTO_PREMIUM =
  "https://images.unsplash.com/photo-1710736460914-4a7f22d736c4?w=500&h=700&fit=crop&q=75";

/* ======================================================================== */
/*  Mini-mockups dos modelos                                                */
/* ======================================================================== */

function Stat({ value, label, tone }: { value: string; label: string; tone: string }) {
  return (
    <div className="text-center">
      <div className={`font-headline text-sm font-extrabold leading-none ${tone}`}>{value}</div>
      <div className="mt-0.5 text-[6px] font-semibold uppercase tracking-widest text-current opacity-60">
        {label}
      </div>
    </div>
  );
}

function PreviewBasic() {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5">
      <div className="bg-emerald-700 py-1.5 text-center text-[8px] font-bold uppercase tracking-[0.25em] text-white">
        Proposta de Patrocínio
      </div>
      <div className="relative h-28 bg-emerald-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={PHOTO_BASIC} alt="" className="h-full w-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="absolute bottom-1.5 left-2.5">
          <div className="font-headline text-base font-extrabold leading-none text-white">CARLOS SANTOS</div>
          <div className="mt-0.5 text-[8px] font-bold tracking-[0.2em] text-emerald-300">FUTEBOL · PROFISSIONAL</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 px-2.5 py-2 text-emerald-700">
        <Stat value="87" label="Gols" tone="text-emerald-700" />
        <Stat value="142" label="Jogos" tone="text-emerald-700" />
        <Stat value="06" label="Títulos" tone="text-emerald-700" />
      </div>
    </div>
  );
}

function PreviewPlus() {
  return (
    <div className="grid h-36 grid-cols-5 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5">
      <div className="col-span-3 flex flex-col justify-center gap-1.5 p-3">
        <div className="h-0.5 w-6 bg-sky-500" />
        <div className="font-headline text-xl font-extrabold uppercase leading-[0.95] text-slate-900">
          Rafael<br />Lima
        </div>
        <div className="text-[8px] font-bold tracking-[0.18em] text-sky-600">JIU-JITSU · FAIXA PRETA</div>
        <div className="mt-1 flex gap-2 text-slate-800">
          <Stat value="38" label="Vitórias" tone="text-sky-600" />
          <Stat value="24" label="Finaliz." tone="text-sky-600" />
        </div>
        <div className="mt-1 w-max rounded-full bg-sky-500 px-2.5 py-1 text-[7px] font-bold uppercase tracking-wider text-white">
          Ver Perfil
        </div>
      </div>
      <div className="relative col-span-2 bg-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={PHOTO_PLUS} alt="" className="absolute inset-0 h-full w-full object-cover" />
      </div>
    </div>
  );
}

function PreviewPremium() {
  return (
    <div className="grid h-36 grid-cols-5 overflow-hidden rounded-xl bg-slate-950 shadow-lg ring-1 ring-amber-400/20">
      <div className="col-span-3 flex flex-col justify-center gap-1 p-3">
        <div className="text-[7px] font-bold tracking-[0.25em] text-amber-400">PRO ATHLETE</div>
        <div className="font-headline text-xl font-extrabold uppercase leading-[0.95] text-white">
          Bruno<br />Alves
        </div>
        <div className="text-[8px] font-bold tracking-[0.18em] text-amber-300/80">ATLETISMO · 100M</div>
        <div className="mt-1 flex gap-2 text-white">
          <Stat value="10.2s" label="100m" tone="text-amber-400" />
          <Stat value="12" label="Medalhas" tone="text-amber-400" />
        </div>
        <div className="mt-1.5 flex w-max items-center gap-1 rounded-full border border-amber-400/40 px-2 py-0.5 text-[7px] font-bold text-amber-200">
          <span className="text-[8px]">▶</span> VÍDEO
        </div>
      </div>
      <div className="relative col-span-2 bg-slate-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={PHOTO_PREMIUM} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/15 to-transparent" />
      </div>
    </div>
  );
}

/* ======================================================================== */
/*  Dados                                                                    */
/* ======================================================================== */

const BENEFITS = [
  {
    icon: Wand2,
    title: "Foto tratada pela ProSport",
    text: "Sua foto é recortada e composta em um cenário da sua modalidade, com iluminação profissional — sem precisar de fotógrafo.",
    color: "text-emerald-400",
  },
  {
    icon: Sparkles,
    title: "Design de liga grande",
    text: "Layouts no nível de NFL e NBA, únicos para cada atleta. Nada de template genérico que todo mundo usa.",
    color: "text-sky-400",
  },
  {
    icon: Link2,
    title: "Link único para compartilhar",
    text: "Uma página com endereço próprio que você envia por WhatsApp, e-mail ou redes — abre em qualquer celular.",
    color: "text-violet-400",
  },
  {
    icon: Megaphone,
    title: "Divulgação ativa",
    text: "Nos planos Plus e Premium, a própria ProSport envia sua página para empresas, clubes e imprensa.",
    color: "text-amber-400",
  },
  {
    icon: Clock,
    title: "Pronta em minutos",
    text: "Escolha o plano, envie foto e dados, e receba a página finalizada. Sem espera, sem retrabalho.",
    color: "text-rose-400",
  },
  {
    icon: Trophy,
    title: "Para qualquer esporte",
    text: "Futebol, jiu-jitsu, natação, atletismo, MMA, vôlei... a ProSport entende a sua modalidade e o seu nível.",
    color: "text-emerald-400",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Escolha seu plano",
    text: "Básico, Plus ou Premium — conforme o alcance e os recursos que você quer.",
  },
  {
    n: "02",
    title: "Envie foto e dados",
    text: "Seu nome, modalidade, conquistas e uma foto sua. Leva poucos minutos.",
  },
  {
    n: "03",
    title: "Receba sua SportPage",
    text: "A ProSport monta a página e te entrega o link pronto para divulgar a quem investe em esporte.",
  },
];

type PlanCard = {
  id: "basic" | "plus" | "premium";
  name: string;
  price: string;
  cents: string;
  tagline: string;
  features: string[];
  cta: string;
  featured?: boolean;
  icon: typeof Star;
  accent: string;
  glow: string;
  preview: React.ReactNode;
};

const PLANS: PlanCard[] = [
  {
    id: "basic",
    name: "Básico",
    price: "R$ 9,90",
    cents: "/mês",
    tagline: "Sua proposta de patrocínio pronta para enviar.",
    features: [
      "Sportpage profissional com sua foto",
      "Apresentação para patrocinadores",
      "Link único compartilhável",
    ],
    cta: "Assinar Básico",
    icon: Star,
    accent: "text-emerald-400",
    glow: "hover:shadow-emerald-500/20",
    preview: <PreviewBasic />,
  },
  {
    id: "plus",
    name: "Plus",
    price: "R$ 29,90",
    cents: "/mês",
    tagline: "Design de revista esportiva + divulgação ativa.",
    features: [
      "Tudo do Básico",
      "Design editorial e foto tratada pela ProSport",
      "Composição automática atleta + cenário",
      "Envio para empresas e clubes parceiros",
    ],
    cta: "Assinar Plus",
    featured: true,
    icon: Zap,
    accent: "text-sky-400",
    glow: "hover:shadow-sky-500/30",
    preview: <PreviewPlus />,
  },
  {
    id: "premium",
    name: "Premium",
    price: "R$ 59,90",
    cents: "/mês",
    tagline: "O pacote flagship para chegar à grande mídia.",
    features: [
      "Tudo do Plus",
      "Sportpage flagship com vídeo do YouTube",
      "Divulgação para TV, jornais e revistas",
      "Suporte prioritário",
    ],
    cta: "Assinar Premium",
    icon: Crown,
    accent: "text-amber-400",
    glow: "hover:shadow-amber-500/30",
    preview: <PreviewPremium />,
  },
];

const FAQ = [
  {
    q: "Preciso saber mexer em design ou edição?",
    a: "Não. Você só envia sua foto e alguns dados — a ProSport cuida do recorte da foto, da composição e de todo o layout.",
  },
  {
    q: "Funciona para a minha modalidade?",
    a: "Sim. A ProSport é especializada em atletas e entende qualquer esporte: futebol, artes marciais, natação, atletismo, vôlei, e muitos outros.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. A assinatura é mensal e o cancelamento é livre, direto pelo portal de pagamento seguro.",
  },
  {
    q: "Quantas SportPages eu posso gerar?",
    a: "Até 2 SportPages por atleta dentro do plano assinado — tempo de sobra para testar ângulos e escolher a melhor.",
  },
  {
    q: "Como eu recebo a minha página?",
    a: "Por um link único, pronto para compartilhar com patrocinadores, clubes e imprensa em qualquer celular.",
  },
];

/* ======================================================================== */
/*  Página                                                                   */
/* ======================================================================== */

export default async function AssinarPage() {
  const session = await requireSession(["athlete"], "/athlete/login");

  // Já é assinante ativo? Não faz sentido ver o paywall — vai pro portal.
  if (hasActiveSubscription(session)) {
    redirect("/dashboard");
  }

  const firstName = (session.fullName ?? "Atleta").split(" ")[0];

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-950 text-white">
      {/* scroll suave para as âncoras */}
      <style>{`html{scroll-behavior:smooth}`}</style>

      <Header
        dashboardPath="/assinar"
        plansPath="/assinar"
        userLabel={session.fullName ?? "Atleta"}
        userEmail={session.email}
      />

      <main className="relative flex-1 overflow-hidden">
        {/* brilhos de fundo */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-emerald-500/25 blur-[120px]" />
          <div className="absolute top-[40rem] -right-20 h-96 w-96 rounded-full bg-sky-500/20 blur-[120px]" />
          <div className="absolute top-[90rem] -left-20 h-96 w-96 rounded-full bg-amber-500/15 blur-[120px]" />
        </div>

        <div className="relative z-10">
          {/* ============================ HERO ============================ */}
          <section className="container mx-auto grid items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
            <div>
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-emerald-300 backdrop-blur">
                <Star className="h-3.5 w-3.5" /> Bem-vindo, {firstName}
              </span>
              <h1 className="font-headline text-4xl font-extrabold leading-[1.05] md:text-6xl">
                Conquiste patrocínios com uma{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-amber-400 bg-clip-text text-transparent">
                  SportPage de tirar o fôlego
                </span>
              </h1>
              <p className="mt-5 max-w-lg text-base text-slate-300 md:text-lg">
                A ProSport monta uma página esportiva profissional com a sua foto tratada e o seu
                histórico — o material que patrocinadores, clubes e imprensa esperam ver. Pronta em
                minutos, sem designer.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="#planos"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-sky-500 px-6 py-3.5 text-sm font-bold text-slate-950 transition-transform hover:scale-[1.03]"
                >
                  Escolher meu plano <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#modelos"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
                >
                  Ver os modelos
                </Link>
              </div>
              <p className="mt-4 text-sm text-slate-400">
                A partir de R$ 9,90/mês · Cancele quando quiser
              </p>
            </div>

            {/* visual hero: sportpage flagship */}
            <div className="relative mx-auto w-full max-w-sm">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-emerald-500/30 via-sky-500/20 to-amber-500/30 blur-2xl" />
              <div className="relative grid grid-cols-5 overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
                <div className="col-span-3 flex flex-col justify-center gap-2 p-6">
                  <div className="text-[10px] font-bold tracking-[0.3em] text-amber-400">PRO ATHLETE</div>
                  <div className="font-headline text-4xl font-extrabold uppercase leading-[0.9]">
                    Rafael<br />Lima
                  </div>
                  <div className="text-[11px] font-bold tracking-[0.2em] text-sky-300">JIU-JITSU · FAIXA PRETA</div>
                  <div className="mt-2 flex gap-4">
                    <Stat value="38" label="Vitórias" tone="text-emerald-400" />
                    <Stat value="24" label="Finaliz." tone="text-emerald-400" />
                    <Stat value="08" label="Títulos" tone="text-emerald-400" />
                  </div>
                  <div className="mt-3 w-max rounded-full bg-gradient-to-r from-emerald-400 to-sky-500 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-950">
                    Ver Perfil
                  </div>
                </div>
                <div className="relative col-span-2 bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={PHOTO_HERO} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </section>

          {/* ============================ FAIXA DE IMPACTO ============================ */}
          <section className="border-y border-white/10 bg-white/[0.03]">
            <div className="container mx-auto grid grid-cols-2 gap-6 px-4 py-8 text-center md:grid-cols-4">
              {[
                ["Minutos", "para ficar pronta"],
                ["Qualquer", "modalidade"],
                ["Link único", "para compartilhar"],
                ["ProSport", "especialista em atletas"],
              ].map(([big, small]) => (
                <div key={small}>
                  <div className="font-headline text-2xl font-extrabold text-white md:text-3xl">{big}</div>
                  <div className="mt-1 text-xs text-slate-400 md:text-sm">{small}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ============================ PROBLEMA ============================ */}
          <section className="container mx-auto px-4 py-20 text-center">
            <h2 className="mx-auto max-w-2xl font-headline text-3xl font-extrabold md:text-4xl">
              Print de Instagram não fecha patrocínio
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base text-slate-300 md:text-lg">
              Atletas talentosos perdem oportunidades porque não conseguem se apresentar à altura.
              PDF amador, currículo sem design, fotos soltas... Quem decide o patrocínio recebe
              dezenas de contatos — e quem chega como profissional sai na frente.
            </p>
          </section>

          {/* ============================ O QUE É ============================ */}
          <section className="container mx-auto px-4 pb-8">
            <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-8 text-center md:p-12">
              <span className="text-sm font-bold uppercase tracking-widest text-emerald-400">
                O que é uma SportPage
              </span>
              <p className="mt-4 text-lg leading-relaxed text-slate-200 md:text-xl">
                É a sua página esportiva profissional, com link único. Reúne a sua foto tratada
                pela ProSport, a sua trajetória, as suas conquistas e os seus números num design de
                nível de liga grande — feito para impressionar quem investe em esporte.
              </p>
            </div>
          </section>

          {/* ============================ VANTAGENS ============================ */}
          <section className="container mx-auto px-4 py-20">
            <h2 className="text-center font-headline text-3xl font-extrabold md:text-4xl">
              Tudo o que sua SportPage faz por você
            </h2>
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {BENEFITS.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:bg-white/[0.07]"
                  >
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/5">
                      <Icon className={`h-5 w-5 ${b.color}`} />
                    </div>
                    <h3 className="font-headline text-lg font-bold text-white">{b.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{b.text}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ============================ COMO FUNCIONA ============================ */}
          <section className="border-y border-white/10 bg-white/[0.03] py-20">
            <div className="container mx-auto px-4">
              <h2 className="text-center font-headline text-3xl font-extrabold md:text-4xl">
                Do zero à sua SportPage em 3 passos
              </h2>
              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {STEPS.map((s) => (
                  <div key={s.n} className="relative rounded-2xl border border-white/10 bg-slate-950 p-7">
                    <div className="font-headline text-5xl font-extrabold text-white/10">{s.n}</div>
                    <h3 className="mt-2 font-headline text-xl font-bold text-white">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ============================ MODELOS ============================ */}
          <section id="modelos" className="container mx-auto px-4 py-20">
            <h2 className="text-center font-headline text-3xl font-extrabold md:text-4xl">
              Três modelos, um nível: profissional
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-slate-400">
              Cada plano entrega um estilo de página. Veja como a sua pode ficar — a sua será única,
              com a sua foto e a sua história.
            </p>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {PLANS.map((plan) => (
                <div key={plan.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  {plan.preview}
                  <div className="mt-4 flex items-center gap-2">
                    <plan.icon className={`h-5 w-5 ${plan.accent}`} />
                    <h3 className="font-headline text-lg font-bold text-white">Modelo {plan.name}</h3>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{plan.tagline}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ============================ PLANOS / PREÇOS ============================ */}
          <section id="planos" className="container mx-auto px-4 py-20">
            <h2 className="text-center font-headline text-3xl font-extrabold md:text-4xl">
              Escolha seu plano e libere seu portal
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-slate-400">
              O acesso ao seu portal é liberado assim que o pagamento for confirmado.
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`group relative flex flex-col rounded-3xl border bg-white/[0.04] p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${plan.glow} ${
                    plan.featured ? "border-sky-400/60 shadow-xl shadow-sky-500/10 md:scale-[1.04]" : "border-white/10"
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg">
                      Mais escolhido
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <plan.icon className={`h-5 w-5 ${plan.accent}`} />
                    <h3 className="font-headline text-xl font-bold text-white">{plan.name}</h3>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{plan.tagline}</p>
                  <div className="mt-4 flex items-end gap-1">
                    <span className="font-headline text-3xl font-extrabold text-white">{plan.price}</span>
                    <span className="mb-1 text-sm text-slate-400">{plan.cents}</span>
                  </div>
                  <ul className="mt-5 flex-1 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-200">
                        <Check className={`mt-0.5 h-4 w-4 flex-shrink-0 ${plan.accent}`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/checkout?plan=${plan.id}`}
                    className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-colors ${
                      plan.featured
                        ? "bg-gradient-to-r from-sky-400 to-indigo-500 text-white hover:from-sky-300 hover:to-indigo-400"
                        : "bg-white text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
            <div className="mt-10 flex items-center justify-center gap-2 text-sm text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Pagamento seguro via Stripe · Cancele quando quiser
            </div>
          </section>

          {/* ============================ FAQ ============================ */}
          <section className="container mx-auto max-w-3xl px-4 py-20">
            <h2 className="text-center font-headline text-3xl font-extrabold md:text-4xl">
              Perguntas frequentes
            </h2>
            <div className="mt-10 space-y-3">
              {FAQ.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-white">
                    {item.q}
                    <ChevronDown className="h-5 w-5 flex-shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* ============================ CTA FINAL ============================ */}
          <section className="container mx-auto px-4 pb-24">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/15 via-sky-500/10 to-amber-500/15 px-6 py-14 text-center">
              <h2 className="mx-auto max-w-2xl font-headline text-3xl font-extrabold md:text-4xl">
                Pronto para ser visto como profissional?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-slate-300">
                Escolha seu plano agora e tenha a sua SportPage pronta para conquistar patrocínios.
              </p>
              <Link
                href="#planos"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-sky-500 px-8 py-4 text-sm font-bold text-slate-950 transition-transform hover:scale-[1.03]"
              >
                Começar agora <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
