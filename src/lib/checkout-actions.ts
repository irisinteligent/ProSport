"use server";

import { getSession, isEmailVerified } from "./auth";
import { getStripe } from "./stripe";
import { getBaseUrl } from "./base-url";
import { PLAN_DETAILS, isPlanId, type PlanId } from "./plans";

type CheckoutResult = { success: true; url: string } | { success: false; error: string };

/**
 * Se houver um Price pré-criado no Stripe Dashboard para o plano (env vars
 * STRIPE_PRICE_<PLANO>_<MONTHLY|ANNUAL>, ex.: STRIPE_PRICE_PLUS_MONTHLY),
 * usa esse Price em vez de price_data inline. Isso permite ativar a troca de
 * plano no Customer Portal do Stripe (que exige Products/Prices cadastrados).
 * Sem as envs, tudo continua funcionando com price_data inline — o portal
 * apenas fica limitado a cancelar/atualizar cartão.
 */
function getConfiguredPriceId(planId: PlanId, isAnnual: boolean): string | undefined {
  const key = `STRIPE_PRICE_${planId.toUpperCase()}_${isAnnual ? "ANNUAL" : "MONTHLY"}`;
  const value = process.env[key];
  return value && value.trim() !== "" ? value : undefined;
}

export async function createCheckoutSession(input: {
  planId: string;
  isAnnual: boolean;
}): Promise<CheckoutResult> {
  if (!isPlanId(input.planId)) {
    return { success: false, error: "Plano inválido." };
  }
  const planId: PlanId = input.planId;
  const plan = PLAN_DETAILS[planId];

  const session = await getSession();
  if (!session) {
    return { success: false, error: "Você precisa estar logado." };
  }
  if (session.role !== plan.role) {
    return { success: false, error: "Esta conta não pode assinar este plano." };
  }
  // Sem e-mail confirmado o portal fica bloqueado mesmo após o pagamento —
  // bloquear aqui evita cobrar alguém que não conseguiria entrar (e chargeback).
  if (!(await isEmailVerified(session.uid))) {
    return {
      success: false,
      error: "Confirme seu e-mail antes de assinar. Verifique sua caixa de entrada (e o spam).",
    };
  }

  const baseUrl = await getBaseUrl();
  const dashboardPath = plan.role === "company" ? "/company/dashboard" : "/dashboard";

  const configuredPriceId = getConfiguredPriceId(planId, input.isAnnual);

  try {
    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer_email: session.email,
      client_reference_id: session.uid,
      line_items: [
        configuredPriceId
          ? { price: configuredPriceId, quantity: 1 }
          : {
              price_data: {
                currency: "brl",
                product_data: { name: `ProSport - Plano ${plan.name}` },
                recurring: { interval: input.isAnnual ? "year" : "month" },
                unit_amount: input.isAnnual ? plan.annualPriceCents : plan.monthlyPriceCents,
              },
              quantity: 1,
            },
      ],
      metadata: { uid: session.uid, planId },
      subscription_data: {
        metadata: { uid: session.uid, planId },
      },
      success_url: `${baseUrl}${dashboardPath}?checkout=success`,
      cancel_url: `${baseUrl}/checkout?plan=${planId}`,
    });

    if (!checkoutSession.url) {
      return { success: false, error: "Não foi possível iniciar o checkout." };
    }
    return { success: true, url: checkoutSession.url };
  } catch (err) {
    console.error("[createCheckoutSession]", err);
    return { success: false, error: "Não foi possível iniciar o checkout. Tente novamente." };
  }
}
