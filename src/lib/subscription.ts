import type { SessionUser } from "./auth";

// Status do Stripe que liberam acesso ao portal. O webhook
// (src/app/api/webhooks/stripe/route.ts) grava `subscriptionStatus`:
//   - "active"   → checkout.session.completed / assinatura em dia
//   - "trialing" → período de teste (se algum dia for usado)
//   - "canceled" / "past_due" / etc. → SEM acesso
const ACTIVE_STATUSES = new Set(["active", "trialing"]);

/**
 * Fonte única da verdade do gate de pagamento: o atleta só entra no portal
 * depois que o webhook do Stripe confirmou o pagamento (subscriptionStatus
 * ativo). Atleta recém-cadastrado NÃO tem assinatura ativa, então cai na
 * tela de apresentação (/assinar) até pagar.
 */
export function hasActiveSubscription(
  user: Pick<SessionUser, "subscriptionStatus">
): boolean {
  return !!user.subscriptionStatus && ACTIVE_STATUSES.has(user.subscriptionStatus);
}
