"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession, type SessionUser } from "./auth";
import { getStripe } from "./stripe";
import { adminDb } from "./firebase-admin";

type BillingPortalResult = { success: true; url: string } | { success: false; error: string };

async function getBaseUrl(): Promise<string> {
  const host = (await headers()).get("host") ?? "localhost:9003";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

function dashboardPathFor(session: SessionUser): string {
  return session.role === "company" ? "/company/dashboard" : "/dashboard";
}

async function getPortalUrl(session: SessionUser): Promise<BillingPortalResult> {
  const userDoc = await adminDb.collection("users").doc(session.uid).get();
  const stripeCustomerId = userDoc.data()?.stripeCustomerId as string | undefined;
  if (!stripeCustomerId) {
    return { success: false, error: "Nenhuma assinatura encontrada para esta conta." };
  }

  const baseUrl = await getBaseUrl();
  try {
    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${baseUrl}${dashboardPathFor(session)}`,
    });
    return { success: true, url: portalSession.url };
  } catch (err) {
    console.error("[billing-actions] erro ao criar sessão do portal", err);
    return { success: false, error: "Não foi possível abrir o portal de cobrança. Tente novamente." };
  }
}

/** Usado por client components que tratam o resultado (ex.: exibir um toast de erro). */
export async function createBillingPortalSession(): Promise<BillingPortalResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Você precisa estar logado." };
  }
  return getPortalUrl(session);
}

/** Usado em `<form action={redirectToBillingPortal}>` — sem JS no client, redireciona direto. */
export async function redirectToBillingPortal(): Promise<void> {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }
  const result = await getPortalUrl(session);
  redirect(result.success ? result.url : `${dashboardPathFor(session)}?billingError=1`);
}
