import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase-admin";

function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET não está configurada. Veja CLAUDE.md (Variáveis de Ambiente).");
  }
  return secret;
}

export async function POST(req: Request): Promise<NextResponse> {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Assinatura ausente." }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, getWebhookSecret());
  } catch (err) {
    console.error("[stripe webhook] assinatura inválida", err);
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.client_reference_id ?? session.metadata?.uid;
        const planId = session.metadata?.planId;
        if (uid && planId) {
          // set + merge (não update): se o doc não existir por qualquer motivo,
          // update() lança e o pagamento confirmado ficaria sem efeito no portal.
          await adminDb.collection("users").doc(uid).set(
            {
              plan: planId,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              subscriptionStatus: "active",
            },
            { merge: true }
          );
        } else {
          console.error("[stripe webhook] checkout.session.completed sem uid/planId", session.id);
        }
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const uid = subscription.metadata?.uid;
        if (uid) {
          await adminDb.collection("users").doc(uid).update({
            subscriptionStatus: subscription.status,
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const uid = subscription.metadata?.uid;
        if (uid) {
          await adminDb.collection("users").doc(uid).update({
            plan: null,
            subscriptionStatus: "canceled",
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[stripe webhook] erro ao processar evento", event.type, err);
    return NextResponse.json({ error: "Erro ao processar evento." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
