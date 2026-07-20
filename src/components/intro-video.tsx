"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const SESSION_KEY = "prosport-intro-vista";

/**
 * Vídeo de abertura exibido antes da tela de login.
 * - Autoplay só funciona MUDO nos navegadores — botão dedicado ativa o som.
 * - "Pular" encerra na hora; ao terminar, fecha sozinho.
 * - Exibido uma vez por sessão do navegador (sessionStorage).
 */
export function IntroVideo({ src }: { src: string }) {
  const [show, setShow] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!sessionStorage.getItem(SESSION_KEY)) setShow(true);
  }, []);

  const close = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setShow(false);
  };

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) void v.play();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted={muted}
        playsInline
        onEnded={close}
        className="h-full w-full object-contain"
      />
      <button
        type="button"
        onClick={toggleSound}
        aria-label={muted ? "Ativar som" : "Desativar som"}
        className="absolute bottom-6 left-6 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        {muted ? "Ativar som" : "Som ligado"}
      </button>
      <button
        type="button"
        onClick={close}
        className="absolute bottom-6 right-6 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:bg-white/85"
      >
        Pular introdução
      </button>
    </div>
  );
}
