import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

/**
 * Health check para monitoramento externo (ex.: UptimeRobot, BetterStack —
 * grátis, ping a cada 5 min em https://prosport.ia.br/api/health com alerta
 * por e-mail). Cobre o ponto cego de "o site quebrou e ninguém percebeu":
 * verifica que o app responde E que o Firestore está acessível com as
 * credenciais de produção (a falha mais provável na Vercel).
 */
export async function GET() {
  try {
    // Leitura barata só para validar credenciais/conexão com o Firestore.
    await adminDb.collection("sportpages").limit(1).get();
    return NextResponse.json({ status: "ok", time: new Date().toISOString() });
  } catch (err) {
    console.error("[health] Firestore inacessível", err);
    return NextResponse.json(
      { status: "degraded", error: "firestore" },
      { status: 503 }
    );
  }
}
