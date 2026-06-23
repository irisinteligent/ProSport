import Stripe from "stripe";

// Instanciado de forma lazy (não no carregamento do módulo): o build do
// Next.js avalia módulos de Server Actions estaticamente, e isso quebraria
// caso STRIPE_SECRET_KEY não esteja presente no ambiente de build.
let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY não está configurada. Veja CLAUDE.md (Variáveis de Ambiente).");
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}
