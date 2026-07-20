import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Handshake,
  HeartHandshake,
  LineChart,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Para Patrocinadores, Clubes e Empresas · ProSport",
  description:
    "Encontre atletas com perfil completo, busque por modalidade e fale direto com quem sua marca quer apoiar. Seja parceiro fundador da ProSport.",
};

/**
 * Landing B2B de parceria — patrocinadores, clubes e empresas.
 * Princípios (skill inbound B2B): valor claro acima da dobra, confiança sem
 * hype, UM CTA (criar conta de empresa), mobile-first com CTA fixo.
 */

const CTA_HREF = "/company/signup";

function Cta({ label = "Criar conta de empresa", className = "" }: { label?: string; className?: string }) {
  return (
    <Link
      href={CTA_HREF}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-7 py-3.5 text-sm font-bold text-amber-950 transition hover:bg-amber-300 ${className}`}
    >
      {label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

export default function ParceirosPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top bar mínima: logo + CTA (LP focada em conversão) */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="font-headline text-lg font-bold tracking-tight">
            Pro<span className="text-amber-400">Sport</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/company/login" className="hidden text-sm font-medium text-slate-300 hover:text-white sm:block">
              Já sou parceiro
            </Link>
            <Link
              href={CTA_HREF}
              className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-amber-950 transition hover:bg-amber-300"
            >
              Começar
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO — o valor em 5 segundos */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_70%_0%,rgba(251,191,36,.14),transparent_60%)]"
          />
          <div className="mx-auto max-w-6xl px-5 pb-16 pt-14 md:pb-24 md:pt-20">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-300">
              <Handshake className="h-3.5 w-3.5" />
              Patrocinadores · Clubes · Empresas
            </p>
            <h1 className="max-w-3xl font-headline text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              O próximo atleta da sua marca
              <span className="text-amber-400"> já está aqui.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
              A ProSport transforma atletas em apresentações profissionais completas — história,
              conquistas, números e contato direto. Você busca por modalidade, avalia em minutos e
              fala com quem interessa. Sem intermediário, sem PDF amador.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Cta />
              <span className="text-sm text-slate-400">Conta gratuita para explorar os atletas</span>
            </div>
            {/* Barra de confiança — qualitativa, sem números inventados */}
            <div className="mt-12 grid grid-cols-1 gap-3 border-t border-white/10 pt-8 sm:grid-cols-3">
              {[
                { ic: BadgeCheck, t: "Perfis completos", d: "Página profissional com trajetória, conquistas e mídia — não currículo solto." },
                { ic: Search, t: "Busca por modalidade", d: "Do futebol ao jiu-jitsu: encontre atletas do esporte que interessa à sua marca." },
                { ic: MessageCircle, t: "Contato direto", d: "WhatsApp e redes do atleta a um clique — a negociação é sua, sem comissão." },
              ].map((f) => (
                <div key={f.t} className="flex items-start gap-3">
                  <f.ic className="mt-1 h-5 w-5 flex-shrink-0 text-amber-400" />
                  <div>
                    <p className="font-semibold">{f.t}</p>
                    <p className="text-sm text-slate-400">{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROBLEMA → SOLUÇÃO */}
        <section className="border-t border-white/10 bg-slate-900/50">
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
              <div>
                <h2 className="font-headline text-2xl font-bold md:text-3xl">
                  Achar o atleta certo não deveria ser trabalho de garimpo
                </h2>
                <p className="mt-4 leading-relaxed text-slate-300">
                  Hoje, avaliar um atleta para patrocínio significa juntar prints de Instagram,
                  PDFs desatualizados e indicações soltas. Falta padrão, faltam dados — e o
                  investimento vira aposta.
                </p>
              </div>
              <div>
                <h2 className="font-headline text-2xl font-bold text-amber-400 md:text-3xl">
                  Na ProSport, cada atleta chega pronto para ser avaliado
                </h2>
                <p className="mt-4 leading-relaxed text-slate-300">
                  Todos os atletas do catálogo têm uma Sport Page profissional: quem são, o que já
                  conquistaram (com anos), onde competem, redes sociais e vídeo. Você compara com
                  critério e decide com confiança.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* POR QUE SER PARCEIRO — valorizando a vinda deles */}
        <section className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Parceria fundadora</p>
            <h2 className="mt-2 font-headline text-3xl font-bold md:text-4xl">
              Quem chega agora, chega na frente
            </h2>
            <p className="mt-3 text-slate-300">
              A ProSport está formando sua primeira rede de patrocinadores, clubes e empresas. Os
              primeiros parceiros têm um lugar que dinheiro não compra depois: o começo.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { ic: Sparkles, t: "Selo de Parceiro Fundador", d: "Sua marca registrada entre as primeiras a acreditar nos atletas da plataforma — e destacada como tal." },
              { ic: Trophy, t: "Acesso antecipado aos talentos", d: "Novos atletas entram todos os dias. Parceiros veem primeiro — e falam primeiro." },
              { ic: HeartHandshake, t: "Associação a impacto real", d: "Muitos atletas lideram projetos sociais nas suas comunidades. Patrocinar aqui é branding com propósito." },
              { ic: Users, t: "Pipeline contínuo de atletas", d: "Em vez de garimpar indicações, um catálogo vivo, filtrado por modalidade, sempre atualizado." },
              { ic: LineChart, t: "Decisão baseada em informação", d: "Trajetória, regularidade em competições e presença digital — os dados que sustentam o investimento." },
              { ic: ShieldCheck, t: "Sem comissão sobre o patrocínio", d: "A ProSport conecta. O acordo, os valores e a relação com o atleta são inteiramente seus." },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 transition hover:border-amber-400/40">
                <c.ic className="h-6 w-6 text-amber-400" />
                <h3 className="mt-4 font-headline text-lg font-bold">{c.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* COMO FUNCIONA — 3 passos */}
        <section className="border-t border-white/10 bg-slate-900/50">
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
            <h2 className="font-headline text-3xl font-bold md:text-4xl">Como funciona</h2>
            <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                { n: "01", t: "Crie sua conta de empresa", d: "Cadastro gratuito em 2 minutos — nome, CNPJ e o tipo de patrocínio que sua marca oferece." },
                { n: "02", t: "Busque por modalidade", d: "Explore os atletas com Sport Page ativa e filtre pelo esporte que conversa com o seu público." },
                { n: "03", t: "Fale direto com o atleta", d: "Abra a página, avalie e chame no WhatsApp ou nas redes. A parceria nasce sem atravessador." },
              ].map((s) => (
                <div key={s.n} className="relative rounded-2xl border border-white/10 p-6">
                  <span className="font-headline text-4xl font-extrabold text-amber-400/30">{s.n}</span>
                  <h3 className="mt-3 font-headline text-lg font-bold">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          <div className="overflow-hidden rounded-3xl border border-amber-400/30 bg-[radial-gradient(120%_140%_at_20%_0%,rgba(251,191,36,.18),rgba(2,6,23,0)_60%)] p-8 text-center md:p-14">
            <Handshake className="mx-auto h-10 w-10 text-amber-400" />
            <h2 className="mx-auto mt-4 max-w-2xl font-headline text-3xl font-extrabold md:text-5xl">
              Sua marca no peito de quem ainda vai subir no pódio
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-300">
              Crie a conta gratuita, conheça os atletas e seja um dos parceiros fundadores da
              ProSport.
            </p>
            <div className="mt-8">
              <Cta label="Quero conhecer os atletas" />
            </div>
            <p className="mt-4 text-sm text-slate-400">
              Prefere falar com a gente antes?{" "}
              <a href="mailto:contato@prosport.ia.br" className="text-amber-400 underline underline-offset-4">
                contato@prosport.ia.br
              </a>
            </p>
          </div>
        </section>
      </main>

      {/* CTA fixo no mobile (checklist CRO da skill) */}
      <div className="sticky bottom-0 z-20 border-t border-white/10 bg-slate-950/95 p-3 backdrop-blur md:hidden">
        <Cta className="w-full" />
      </div>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-slate-500">
        <div className="space-x-4">
          <Link href="/" className="hover:text-slate-300">ProSport</Link>
          <Link href="/termos" className="hover:text-slate-300">Termos de Uso</Link>
          <Link href="/privacidade" className="hover:text-slate-300">Privacidade</Link>
        </div>
      </footer>
    </div>
  );
}
