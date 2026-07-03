"use server";

import { z } from "zod";
import { getSession } from "./auth";
import { adminDb } from "./firebase-admin";
import { getResend, getEmailFromAddress } from "./email";
import { escapeHtml } from "./escape-html";

/**
 * SEGURANÇA: só aceitamos links de sportpage do nosso próprio domínio
 * (path /p/...). Sem isso, qualquer assinante poderia usar o remetente
 * verificado da ProSport para enviar links arbitrários (spam/phishing),
 * queimando a reputação do domínio no Resend.
 */
function isAllowedSportpageUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    const allowedHosts = new Set(["prosport.ia.br", "www.prosport.ia.br", "localhost"]);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl) {
      try {
        allowedHosts.add(new URL(appUrl).hostname);
      } catch {
        /* ignora APP_URL malformada */
      }
    }
    return allowedHosts.has(url.hostname) && url.pathname.startsWith("/p/");
  } catch {
    return false;
  }
}

/** Limite diário de e-mails a patrocinadores por atleta (anti-abuso). */
const SPONSOR_EMAILS_DAILY_LIMIT = 10;

async function hasReachedDailySendLimit(uid: string): Promise<boolean> {
  const today = new Date().toISOString().slice(0, 10);
  const snap = await adminDb.collection("users").doc(uid).get();
  const data = snap.data() as { sponsorEmailsDate?: string; sponsorEmailsCount?: number } | undefined;
  return data?.sponsorEmailsDate === today && (data.sponsorEmailsCount ?? 0) >= SPONSOR_EMAILS_DAILY_LIMIT;
}

async function recordSponsorEmailSent(uid: string): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const ref = adminDb.collection("users").doc(uid);
  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data() as { sponsorEmailsDate?: string; sponsorEmailsCount?: number } | undefined;
    const count = data?.sponsorEmailsDate === today ? (data.sponsorEmailsCount ?? 0) + 1 : 1;
    tx.set(ref, { sponsorEmailsDate: today, sponsorEmailsCount: count }, { merge: true });
  });
}

const sendToSponsorSchema = z.object({
  sponsorEmail: z.string().email("Informe um e-mail válido para o patrocinador."),
  sponsorName: z.string().max(120).optional(),
  message: z.string().max(1000).optional(),
  sportpageUrl: z.string().url("URL da página esportiva inválida."),
});

export type SendToSponsorInput = z.infer<typeof sendToSponsorSchema>;
export type SendToSponsorResult =
  | { success: true }
  | { success: false; error: string };

export async function sendSportpageToSponsor(
  input: SendToSponsorInput
): Promise<SendToSponsorResult> {
  const session = await getSession();
  if (!session || session.role !== "athlete") {
    return { success: false, error: "Você precisa estar logado como atleta." };
  }
  if (session.plan !== "plus" && session.plan !== "premium") {
    return {
      success: false,
      error: "O envio para patrocinadores está disponível apenas nos planos Plus e Premium.",
    };
  }

  const parsed = sendToSponsorSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { sponsorEmail, sponsorName, message, sportpageUrl } = parsed.data;

  if (!isAllowedSportpageUrl(sportpageUrl)) {
    return { success: false, error: "O link precisa ser de uma Sport Page da ProSport (prosport.ia.br/p/...)." };
  }
  if (await hasReachedDailySendLimit(session.uid)) {
    return {
      success: false,
      error: `Você atingiu o limite de ${SPONSOR_EMAILS_DAILY_LIMIT} envios por dia. Tente novamente amanhã.`,
    };
  }

  const athleteName = session.fullName ?? "Um atleta da ProSport";

  const html = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #1f2937;">
      <p>${sponsorName ? `Olá, ${escapeHtml(sponsorName)},` : "Olá,"}</p>
      <p><strong>${escapeHtml(athleteName)}</strong> usa a ProSport e gostaria de compartilhar a página esportiva abaixo com você:</p>
      <p><a href="${escapeHtml(sportpageUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(sportpageUrl)}</a></p>
      ${message ? `<p>${escapeHtml(message)}</p>` : ""}
      <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">Enviado via ProSport (prosport.ia.br) a pedido do atleta.</p>
    </div>
  `;

  try {
    const { error } = await getResend().emails.send({
      from: getEmailFromAddress(),
      to: sponsorEmail,
      subject: `${athleteName} compartilhou uma página esportiva com você`,
      html,
    });
    if (error) {
      console.error("[sendSportpageToSponsor] erro do Resend", error);
      return { success: false, error: "Não foi possível enviar o e-mail. Tente novamente." };
    }
    await recordSponsorEmailSent(session.uid).catch(() => undefined);
    return { success: true };
  } catch (err) {
    console.error("[sendSportpageToSponsor] erro inesperado", err);
    return { success: false, error: "Não foi possível enviar o e-mail. Tente novamente." };
  }
}
