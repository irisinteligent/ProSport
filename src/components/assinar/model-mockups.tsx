import { Trophy, Award, Play, Star, Info, HeartHandshake, BarChart3, ChevronRight, ArrowRight } from "lucide-react";

/* =========================================================================
   Mockups realistas das SportPages — usados no hero e na seção "Modelos"
   da /assinar. São réplicas em miniatura (HTML/CSS, sem JS) dos três estilos
   de página que a ProSport entrega. Fotos: Unsplash (uso livre, ilustrativas).
   ========================================================================= */

const HERO_KIT = "https://images.unsplash.com/photo-1764842262144-e58d386299ac?w=640&h=900&fit=crop&q=85";
const SOCCER = "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=640&h=520&fit=crop&q=80";
const SOCCER_RUN = "https://images.unsplash.com/photo-1551280857-2b9bbe52acf4?w=400&h=300&fit=crop&q=75";
const SOCCER_JUMP = "https://images.unsplash.com/photo-1504305754058-2f08ccd89a0a?w=400&h=300&fit=crop&q=75";
const CINEMA = "https://images.unsplash.com/photo-1607080033776-63b372e37828?w=720&h=1100&fit=crop&q=85";

function BrowserBar() {
  return (
    <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-2">
      <span className="h-2 w-2 rounded-full bg-red-400/80" />
      <span className="h-2 w-2 rounded-full bg-amber-400/80" />
      <span className="h-2 w-2 rounded-full bg-green-400/80" />
      <div className="ml-3 h-3 w-32 rounded bg-slate-700" />
    </div>
  );
}

function LineChart({ stroke }: { stroke: string }) {
  return (
    <svg viewBox="0 0 100 40" className="h-full w-full" preserveAspectRatio="none">
      <polyline
        points="2,32 14,28 26,30 38,22 50,24 62,16 74,18 86,10 98,6"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {[2, 14, 26, 38, 50, 62, 74, 86, 98].map((x, i) => {
        const ys = [32, 28, 30, 22, 24, 16, 18, 10, 6];
        return <circle key={i} cx={x} cy={ys[i]} r="1.4" fill={stroke} />;
      })}
    </svg>
  );
}

function BarChart({ fill }: { fill: string }) {
  const bars = [16, 26, 20, 30, 22, 14, 24];
  return (
    <svg viewBox="0 0 100 40" className="h-full w-full" preserveAspectRatio="none">
      {bars.map((h, i) => (
        <rect key={i} x={4 + i * 14} y={38 - h} width="8" height={h} rx="1" fill={fill} />
      ))}
    </svg>
  );
}

function IconStat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Trophy;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-5 w-5 text-amber-400" />
      <div>
        <div className="font-headline text-base font-extrabold leading-none text-white">{value}</div>
        <div className="text-[6px] font-bold uppercase tracking-widest text-white/60">{label}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ PLUS */
/* Flagship desktop: hero escuro full-bleed + analytics claro (estilo NFL). */
export function ModelPlus() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
      <BrowserBar />
      <div className="bg-white">
        {/* HERO */}
        <div className="relative h-52 overflow-hidden bg-gradient-to-br from-[#0b1f16] via-[#0c241a] to-black">
          {/* foto full-bleed à direita */}
          <div className="absolute inset-y-0 right-0 w-[58%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={HERO_KIT} alt="" className="h-full w-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c241a] via-[#0c241a]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c241a] via-transparent to-transparent" />
          </div>
          {/* glow dourado de estádio */}
          <div className="pointer-events-none absolute -right-6 top-2 h-40 w-40 rounded-full bg-amber-500/25 blur-2xl" />
          {/* hexágonos decorativos */}
          <div className="pointer-events-none absolute right-1/2 top-6 h-20 w-20 rotate-12 rounded-xl border border-amber-400/20" />
          <div className="pointer-events-none absolute right-[42%] top-20 h-12 w-12 rotate-45 rounded-lg border border-amber-400/20" />

          <div className="relative flex h-full flex-col px-5 pt-3">
            <nav className="flex items-center gap-3 text-[7px] font-semibold text-white/70">
              <span className="text-white">Home</span>
              <span>Stats</span>
              <span>Mídia</span>
              <span>Carreira</span>
              <span className="ml-auto">Contato</span>
            </nav>
            <div className="mt-auto pb-6">
              <div className="font-headline text-3xl font-extrabold uppercase leading-[0.82] text-[#f3efe0]">
                Rafael<br />Lima
              </div>
              <div className="mt-1.5 text-[9px] font-bold tracking-[0.3em] text-white/70">PRO ATHLETE</div>
              <div className="mt-2.5 inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-amber-400 to-amber-600 px-3 py-1.5 text-[8px] font-bold text-slate-900">
                Ver Perfil Completo <ArrowRight className="h-2.5 w-2.5" />
              </div>
              <div className="mt-3.5 flex gap-4">
                <IconStat icon={Trophy} value="3×" label="Campeão" />
                <IconStat icon={Award} value="5×" label="Convocações" />
                <IconStat icon={Star} value="120+" label="Partidas" />
              </div>
            </div>
          </div>
          {/* pílula de carrossel */}
          <div className="absolute -bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-3 py-1 shadow-lg">
            <span className="h-1 w-1 rounded-full bg-slate-900/50" />
            <span className="h-1 w-3 rounded-full bg-slate-900/70" />
            <span className="h-1 w-1 rounded-full bg-slate-900/50" />
            <ChevronRight className="h-2.5 w-2.5 text-slate-900" />
          </div>
        </div>

        {/* ANALYTICS */}
        <div className="bg-slate-100 px-5 pb-4 pt-5">
          <div className="text-[9px] font-extrabold uppercase tracking-wide text-slate-800">Performance Analytics</div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-white p-2 shadow-sm">
              <div className="text-[6px] font-semibold text-slate-400">Jardas por Temporada</div>
              <div className="mt-1 h-9">
                <LineChart stroke="#15803d" />
              </div>
            </div>
            <div className="rounded-lg bg-white p-2 shadow-sm">
              <div className="text-[6px] font-semibold text-slate-400">Desarmes por Jogo</div>
              <div className="mt-1 h-9">
                <BarChart fill="#15803d" />
              </div>
            </div>
            <div className="rounded-lg bg-white p-2 shadow-sm">
              <div className="text-[6px] font-semibold text-slate-400">Stat Breakdown</div>
              <div className="mt-1.5 space-y-1">
                {["Ataque", "Defesa", "Equipes"].map((s) => (
                  <div key={s} className="flex items-center justify-between rounded bg-slate-50 px-1.5 py-1">
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-sm bg-green-600" />
                      <span className="text-[6px] font-medium text-slate-600">{s}</span>
                    </div>
                    <ChevronRight className="h-2 w-2 text-slate-300" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CAREER HIGHLIGHTS */}
          <div className="mt-3 text-[9px] font-extrabold uppercase tracking-wide text-slate-800">Destaques da Carreira</div>
          <div className="mt-2 flex items-center justify-between rounded-lg bg-white p-2 shadow-sm">
            {["2018", "2019", "2020", "2021", "2022", "2023"].map((y, i) => (
              <div key={y} className="flex flex-col items-center gap-1">
                <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${i === 2 ? "border-green-600" : "border-slate-200"}`}>
                  <Play className={`h-2.5 w-2.5 ${i === 2 ? "text-green-600" : "text-slate-300"}`} />
                </span>
                <span className="text-[5px] font-semibold text-slate-400">{y}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ BASIC */
/* Proposta de Patrocínio (estilo flyer mobile, claro e verde). */
export function ModelBasic() {
  return (
    <div className="mx-auto w-full max-w-[260px] overflow-hidden rounded-[1.5rem] border-4 border-slate-800 bg-[#f3f4ef] shadow-2xl">
      <div className="flex justify-center py-1.5">
        <div className="h-1 w-12 rounded-full bg-black/20" />
      </div>
      <div className="bg-emerald-800 py-2 text-center text-[10px] font-extrabold uppercase tracking-[0.2em] text-white">
        Proposta de Patrocínio
      </div>
      <div className="p-3">
        <div className="overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SOCCER} alt="" className="h-32 w-full object-cover" />
        </div>
        <div className="mt-3 text-center font-headline text-base font-extrabold text-emerald-800">Visão do Atleta</div>
        <p className="mt-1 text-center text-[7px] leading-relaxed text-slate-500">
          Atacante experiente, preciso e confiante em campo. Agilidade e leitura tática que comandam o
          ataque e criam conexões com a torcida.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {[
            { icon: Trophy, t: "Conquistas" },
            { icon: BarChart3, t: "Público" },
            { icon: HeartHandshake, t: "Oportunidades" },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.t} className="rounded-lg bg-white/70 p-1.5 text-center">
                <Icon className="mx-auto h-3.5 w-3.5 text-emerald-700" />
                <div className="mt-1 text-[7px] font-bold text-slate-700">{c.t}</div>
                <div className="mt-0.5 text-[5px] leading-tight text-slate-400">Texto curto de apoio</div>
              </div>
            );
          })}
        </div>
        <div className="mx-auto mt-3 w-max rounded-lg bg-emerald-800 px-4 py-1.5 text-[8px] font-bold text-white">
          Fale Conosco
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ PREMIUM */
/* Flagship mobile cinematográfico (full-bleed + dourado). */
export function ModelPremium() {
  return (
    <div className="relative mx-auto w-full max-w-[260px] overflow-hidden rounded-[1.5rem] border-4 border-slate-800 bg-slate-950 shadow-2xl">
      <div className="relative h-[340px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CINEMA} alt="" className="absolute inset-0 h-full w-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-slate-950" />
        <div className="pointer-events-none absolute -left-6 top-10 h-32 w-32 rounded-full bg-amber-500/20 blur-2xl" />
        <div className="relative flex h-full flex-col p-3">
          <nav className="flex gap-3 text-[7px] font-semibold text-white/80">
            <span>Home</span>
            <span>Sobre</span>
            <span>Contato</span>
          </nav>
          <div className="mt-auto">
            <div className="font-headline text-3xl font-extrabold uppercase leading-[0.82] text-white drop-shadow-lg">
              Bruno<br />Alves
            </div>
            <div className="mt-2 inline-flex w-max items-center gap-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-600 px-3 py-1.5 text-[8px] font-bold text-slate-900 shadow-lg">
              Entre em Contato <ArrowRight className="h-2.5 w-2.5" />
            </div>
            <div className="mt-3 flex items-center gap-4">
              <IconStat icon={Trophy} value="3×" label="Campeão" />
              <IconStat icon={Award} value="5×" label="Convocações" />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-slate-950 p-3">
        <div className="flex items-center gap-1.5">
          <Info className="h-3 w-3 text-amber-400" />
          <span className="font-headline text-[10px] font-extrabold uppercase tracking-wide text-white">Sobre</span>
        </div>
        <p className="mt-1.5 text-[7px] leading-relaxed text-slate-400">
          Atleta dinâmico e fisicamente imponente, conhecido pela performance excepcional. Força,
          velocidade e dedicação que renderam múltiplos títulos e o respeito de companheiros e torcida.
        </p>
        <div className="mt-2.5 flex items-center gap-1.5 border-t border-white/10 pt-2">
          <Star className="h-3 w-3 text-amber-400" />
          <span className="font-headline text-[10px] font-extrabold uppercase tracking-wide text-white">Destaques da Carreira</span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {[SOCCER_RUN, SOCCER_JUMP, SOCCER_RUN].map((src, i) => (
            <div key={i} className="relative overflow-hidden rounded-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-12 w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play className="h-3 w-3 text-white" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
