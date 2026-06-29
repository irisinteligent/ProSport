import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, Crown, Star, Zap, ArrowRight, ShieldCheck } from "lucide-react";

import { Header } from "@/components/header";
import { requireSession } from "@/lib/auth";
import { hasActiveSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

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
  accent: string; // classes de cor de destaque
  glow: string;
  preview: React.ReactNode;
};

/* ----------------------- Mini-mockups dos modelos ----------------------- */
/* Cada preview é uma miniatura realista de uma sportpage gerada — foto real do
   atleta + tipografia + stats — para o atleta enxergar exatamente o que recebe. */

const PHOTO_BASIC =
  "https://images.unsplash.com/photo-1763844072520-e480cb2cec8c?w=600&h=360&fit=crop&q=75";
const PHOTO_PLUS =
  "https://images.unsplash.com/photo-1606335544053-c43609e6155d?w=500&h=700&fit=crop&q=75";
const PHOTO_PREMIUM =
  "https://images.unsplash.com/photo-1710736460914-4a7f22d736c4?w=500&h=700&fit=crop&q=75";

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
    accent: "text-emerald-600",
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
      "Sportpage com design editorial e foto tratada por IA",
      "Envio para empresas e clubes parceiros",
      "Composição automática atleta + cenário",
    ],
    cta: "Assinar Plus",
    featured: true,
    icon: Zap,
    accent: "text-sky-500",
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
    accent: "text-amber-500",
    glow: "hover:shadow-amber-500/30",
    preview: <PreviewPremium />,
  },
];

export default async function AssinarPage() {
  const session = await requireSession(["athlete"], "/athlete/login");

  // Já é assinante ativo? Não faz sentido ver o paywall — vai pro portal.
  if (hasActiveSubscription(session)) {
    redirect("/dashboard");
  }

  const firstName = (session.fullName ?? "Atleta").split(" ")[0];

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-950">
      <Header
        dashboardPath="/assinar"
        plansPath="/assinar"
        userLabel={session.fullName ?? "Atleta"}
        userEmail={session.email}
      />

      <main className="relative flex-1 overflow-hidden">
        {/* fundo vibrante */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-emerald-500/25 blur-[120px]" />
          <div className="absolute top-40 -right-20 h-96 w-96 rounded-full bg-sky-500/20 blur-[120px]" />
          <div className="absolute bottom-0 -left-20 h-96 w-96 rounded-full bg-amber-500/15 blur-[120px]" />
        </div>

        <div className="container relative z-10 mx-auto flex flex-col items-center px-4 py-16 md:py-24">
          {/* Hero */}
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-emerald-300 backdrop-blur">
            <Star className="h-3.5 w-3.5" /> Bem-vindo, {firstName}
          </span>
          <h1 className="max-w-3xl text-center font-headline text-4xl font-extrabold leading-tight text-white md:text-6xl">
            Sua carreira merece uma{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-amber-400 bg-clip-text text-transparent">
              vitrine profissional
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-center text-base text-slate-300 md:text-lg">
            Escolha seu plano e a ProSport monta, com IA, uma sportpage de nível profissional
            com a sua foto. Seu portal é liberado assim que o pagamento for confirmado.
          </p>

          {/* Cards de plano */}
          <div className="mt-14 grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.id}
                  className={`group relative flex flex-col rounded-3xl border bg-white/[0.04] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${plan.glow} ${
                    plan.featured
                      ? "border-sky-400/60 shadow-xl shadow-sky-500/10 md:scale-[1.04]"
                      : "border-white/10"
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg">
                      Mais escolhido
                    </span>
                  )}

                  {plan.preview}

                  <div className="mt-5 flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${plan.accent}`} />
                    <h2 className="font-headline text-xl font-bold text-white">{plan.name}</h2>
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
              );
            })}
          </div>

          {/* Selo de confiança */}
          <div className="mt-12 flex items-center gap-2 text-sm text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Pagamento seguro via Stripe · Cancele quando quiser
          </div>
        </div>
      </main>
    </div>
  );
}
