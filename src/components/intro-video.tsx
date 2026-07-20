"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const SESSION_KEY = "prosport-intro-vista";

/**
 * Vídeo de abertura com coreografia em tríptico (desktop):
 *   t=0s    → vídeo central começa (cena inicial)
 *   t=1,5s  → painel DIREITO desliza para dentro, exibindo outra cena (~40%)
 *   t=3,0s  → painel ESQUERDO desliza para dentro, terceira cena (~70%)
 *   t=6,0s  → painel esquerdo sai
 *   t=7,5s  → painel direito sai — central segue com o fundo desfocado
 * No mobile só o vídeo central aparece (a tela já é preenchida).
 * Autoplay é sempre MUDO (regra dos navegadores) — botão ativa o som.
 * Exibido uma vez por sessão do navegador.
 */
export function IntroVideo({ src }: { src: string }) {
  const [show, setShow] = useState(false);
  const [muted, setMuted] = useState(true);
  const [rightIn, setRightIn] = useState(false);
  const [leftIn, setLeftIn] = useState(false);

  const centerRef = useRef<HTMLVideoElement>(null);
  const rightRef = useRef<HTMLVideoElement>(null);
  const leftRef = useRef<HTMLVideoElement>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    setShow(true);
    const at = (ms: number, fn: () => void) =>
      timersRef.current.push(window.setTimeout(fn, ms));
    at(1500, () => setRightIn(true));
    at(3000, () => setLeftIn(true));
    at(6000, () => setLeftIn(false));
    at(7500, () => setRightIn(false));
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  /** Posiciona o painel numa cena diferente do vídeo (fração da duração). */
  const playFrom = (v: HTMLVideoElement | null, fraction: number) => {
    if (!v) return;
    const start = () => {
      const d = v.duration;
      if (isFinite(d) && d > 1) v.currentTime = Math.min(d * fraction, d - 1);
      void v.play();
    };
    if (v.readyState >= 1) start();
    else v.addEventListener("loadedmetadata", start, { once: true });
  };

  useEffect(() => {
    if (rightIn) playFrom(rightRef.current, 0.4);
  }, [rightIn]);
  useEffect(() => {
    if (leftIn) playFrom(leftRef.current, 0.7);
  }, [leftIn]);

  const close = () => {
    timersRef.current.forEach(clearTimeout);
    sessionStorage.setItem(SESSION_KEY, "1");
    setShow(false);
  };

  const toggleSound = () => {
    const v = centerRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) void v.play();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black">
      {/* Fundo: o próprio vídeo desfocado preenche as laterais */}
      <video
        src={src}
        autoPlay
        muted
        playsInline
        aria-hidden
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-lg brightness-[.6]"
      />

      {/* Painel ESQUERDO — terceira cena */}
      <video
        ref={leftRef}
        src={src}
        muted
        playsInline
        loop
        aria-hidden
        className={`absolute inset-y-0 left-0 hidden w-1/3 object-cover shadow-2xl transition-all duration-700 ease-out md:block ${
          leftIn ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        }`}
      />

      {/* Painel DIREITO — segunda cena */}
      <video
        ref={rightRef}
        src={src}
        muted
        playsInline
        loop
        aria-hidden
        className={`absolute inset-y-0 right-0 hidden w-1/3 object-cover shadow-2xl transition-all duration-700 ease-out md:block ${
          rightIn ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      />

      {/* Vídeo CENTRAL — protagonista, sem cortes */}
      <video
        ref={centerRef}
        src={src}
        autoPlay
        muted={muted}
        playsInline
        onEnded={close}
        className="relative h-full w-full object-contain"
      />

      <button
        type="button"
        onClick={toggleSound}
        aria-label={muted ? "Ativar som" : "Desativar som"}
        className="absolute bottom-6 left-6 z-10 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        {muted ? "Ativar som" : "Som ligado"}
      </button>
      <button
        type="button"
        onClick={close}
        className="absolute bottom-6 right-6 z-10 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:bg-white/85"
      >
        Pular introdução
      </button>
    </div>
  );
}
