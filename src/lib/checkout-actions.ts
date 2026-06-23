"use server";

import { headers } from "next/headers";
import { getSession } from "./auth";
import { getStripe } from "./stripe";
import { PLAN_DETAILS, isPlanId, type PlanId } from "./plans";

type CheckoutResult = { success: true; url: string } | { success: false; error: string };

async function getBaseUrl(): Promise<string> {
  const host = (await headers()).get("host") ?? "localhost:9003";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
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

  const baseUrl = await getBaseUrl();
  const dashboardPath = plan.role === "company" ? "/company/dashboard" : "/dashboard";

  try {
    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer_email: session.email,
      client_reference_id: session.uid,
      line_items: [
        {
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
