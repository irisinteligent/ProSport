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

function PreviewBasic() {
  return (
    <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-white shadow-inner ring-1 ring-black/5">
      <div className="bg-emerald-700 py-1.5 text-center text-[7px] font-bold uppercase tracking-widest text-white">
        Proposta de Patrocínio
      </div>
      <div className="p-2.5">
        <div className="mb-2 h-10 w-full rounded-md bg-gradient-to-br from-emerald-200 to-emerald-400" />
        <div className="mb-1 h-1.5 w-3/4 rounded bg-slate-300" />
        <div className="mb-2 h-1.5 w-1/2 rounded bg-slate-200" />
        <div className="grid grid-cols-3 gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded bg-slate-100 p-1">
              <div className="mx-auto mb-0.5 h-2 w-2 rounded-full bg-emerald-500" />
              <div className="h-1 w-full rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewPlus() {
  return (
    <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-white shadow-inner ring-1 ring-black/5">
      <div className="grid h-full grid-cols-2">
        <div className="flex flex-col justify-center gap-1.5 bg-slate-50 p-2.5">
          <div className="h-1 w-10 rounded bg-sky-500" />
          <div className="h-2.5 w-full rounded bg-slate-800" />
          <div className="h-2.5 w-3/4 rounded bg-slate-800" />
          <div className="mt-1 flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-3 w-5 rounded bg-sky-100" />
            ))}
          </div>
          <div className="mt-1 h-2 w-12 rounded-full bg-sky-500" />
        </div>
        <div className="bg-gradient-to-br from-sky-300 via-sky-400 to-indigo-500" />
      </div>
    </div>
  );
}

function PreviewPremium() {
  return (
    <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-950 shadow-inner ring-1 ring-amber-400/20">
      <div className="grid h-full grid-cols-2">
        <div className="flex flex-col justify-center gap-1.5 p-2.5">
          <div className="h-1 w-8 rounded bg-amber-400" />
          <div className="h-3 w-full rounded bg-white/90" />
          <div className="h-3 w-2/3 rounded bg-white/90" />
          <div className="mt-1 flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-3 w-5 rounded border border-amber-400/40 bg-white/5" />
            ))}
          </div>
          <div className="mt-1 h-2 w-12 rounded-full bg-amber-400" />
        </div>
        <div className="relative bg-gradient-to-br from-slate-700 via-slate-800 to-black">
          <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 to-transparent" />
        </div>
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
