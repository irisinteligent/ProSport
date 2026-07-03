import { headers } from "next/headers";

/**
 * URL base canônica do app — fonte única para montar links de e-mail de
 * verificação e URLs de retorno do Stripe.
 *
 * SEGURANÇA: o header `Host` é controlado pelo cliente e pode ser forjado
 * (host header injection), o que permitiria envenenar o link "Confirmar
 * e-mail" enviado ao usuário. Em produção, defina NEXT_PUBLIC_APP_URL na
 * Vercel (ex.: https://prosport.ia.br) — o header só é usado como fallback
 * para desenvolvimento local e previews.
 */
export async function getBaseUrl(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  const host = (await headers()).get("host") ?? "localhost:9003";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}
