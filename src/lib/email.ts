import { Resend } from "resend";

// Instanciado de forma lazy (não no carregamento do módulo) pelo mesmo
// motivo do getStripe() em stripe.ts: o build do Next.js avalia módulos de
// Server Action estaticamente, e isso quebraria caso RESEND_API_KEY não
// esteja presente no ambiente de build.
let resendClient: Resend | null = null;

export function getResend(): Resend {
  if (!resendClient) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error("RESEND_API_KEY não está configurada. Veja CLAUDE.md (Variáveis de Ambiente).");
    }
    resendClient = new Resend(key);
  }
  return resendClient;
}

/**
 * Antes de verificar um domínio no Resend, só é possível enviar a partir de
 * onboarding@resend.dev. Defina RESEND_FROM_EMAIL com um endereço do
 * domínio verificado (ex.: "ProSport <contato@prosport.ia.br>") em produção.
 */
export function getEmailFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL ?? "ProSport <onboarding@resend.dev>";
}
