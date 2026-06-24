"use server";

import { z } from "zod";
import { getSession } from "./auth";
import { getResend, getEmailFromAddress } from "./email";
import { escapeHtml } from "./escape-html";

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
    return { success: true };
  } catch (err) {
    console.error("[sendSportpageToSponsor] erro inesperado", err);
    return { success: false, error: "Não foi possível enviar o e-mail. Tente novamente." };
  }
}
