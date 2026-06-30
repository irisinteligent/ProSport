"use server";

import { cookies, headers } from "next/headers";
import { z } from "zod";
import { adminAuth, adminDb } from "./firebase-admin";
import {
  sendPasswordResetEmail,
  signInWithCustomToken,
  signInWithPassword,
} from "./firebase-rest";
import { getSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, type Role } from "./auth";
import { getResend, getEmailFromAddress } from "./email";

async function getBaseUrl(): Promise<string> {
  const host = (await headers()).get("host") ?? "localhost:9003";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

/**
 * Gera o link de verificação no Firebase e envia ao e-mail cadastrado via Resend.
 * Falha (Resend/rede) é logada e NÃO bloqueia o cadastro — o usuário pode reenviar
 * na tela /verificar-email. Garante que só e-mails reais avancem para o portal.
 */
async function sendEmailVerification(email: string, displayName?: string): Promise<void> {
  try {
    const baseUrl = await getBaseUrl();
    const link = await adminAuth.generateEmailVerificationLink(email, {
      url: `${baseUrl}/verificar-email`,
      handleCodeInApp: false,
    });
    const nome = displayName ? displayName.split(" ")[0] : "Atleta";
    const html = `
      <div style="font-family:sans-serif;line-height:1.6;color:#1f2937;max-width:520px;margin:auto">
        <h2 style="color:#0B6E4F">Confirme seu e-mail</h2>
        <p>Olá, ${nome}! Bem-vindo à ProSport.</p>
        <p>Para ativar sua conta e acessar seu portal, confirme seu e-mail clicando no botão abaixo:</p>
        <p style="margin:28px 0">
          <a href="${link}" style="background:#0B6E4F;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold">Confirmar e-mail</a>
        </p>
        <p style="font-size:13px;color:#6b7280">Se você não criou esta conta, ignore este e-mail.</p>
        <p style="font-size:12px;color:#9ca3af;margin-top:24px">ProSport · prosport.ia.br</p>
      </div>`;
    await getResend().emails.send({
      from: getEmailFromAddress(),
      to: email,
      subject: "Confirme seu e-mail · ProSport",
      html,
    });
  } catch (err) {
    console.error("[auth][sendEmailVerification]", err);
  }
}

type ActionResult<T = object> =
  | ({ success: true } & T)
  | { success: false; error: string };

function mapAuthError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  // O Firebase Admin guarda o tipo do erro em `err.code` (ex.: "auth/email-already-exists"),
  // e a frase legível em `err.message` ("The email address is already in use..."). Antes só
  // olhávamos a message — por isso erros conhecidos caíam no genérico. Agora combinamos os dois.
  const code = typeof (err as { code?: unknown })?.code === "string" ? (err as { code: string }).code : "";
  const hay = `${code} ${message}`;

  if (
    hay.includes("auth/email-already-exists") ||
    hay.includes("EMAIL_EXISTS") ||
    hay.includes("email-already-in-use") ||
    hay.includes("already in use")
  ) {
    return "Este e-mail já está cadastrado.";
  }
  if (
    hay.includes("auth/invalid-password") ||
    hay.includes("WEAK_PASSWORD") ||
    hay.includes("at least 6 characters")
  ) {
    return "A senha precisa ter pelo menos 6 caracteres.";
  }
  if (hay.includes("auth/invalid-email") || hay.includes("INVALID_EMAIL")) {
    return "Endereço de e-mail inválido.";
  }
  if (
    hay.includes("INVALID_LOGIN_CREDENTIALS") ||
    hay.includes("EMAIL_NOT_FOUND") ||
    hay.includes("INVALID_PASSWORD") ||
    hay.includes("auth/wrong-password") ||
    hay.includes("auth/user-not-found")
  ) {
    return "E-mail ou senha inválidos.";
  }

  return "Ocorreu um erro inesperado. Tente novamente.";
}

async function createSessionForIdToken(idToken: string): Promise<void> {
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_SECONDS * 1000,
  });

  (await cookies()).set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

async function createUserProfileAndSession(
  uid: string,
  profile: { email: string; role: Role; plan: string | null; fullName?: string; companyName?: string }
): Promise<void> {
  await adminDb.collection("users").doc(uid).set({
    ...profile,
    createdAt: new Date().toISOString(),
  });

  const customToken = await adminAuth.createCustomToken(uid);
  const { idToken } = await signInWithCustomToken(customToken);
  await createSessionForIdToken(idToken);
}

const athleteSignupSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signupAthlete(
  input: z.infer<typeof athleteSignupSchema>
): Promise<ActionResult> {
  const parsed = athleteSignupSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos." };
  }
  const { fullName, email, password } = parsed.data;

  try {
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: fullName,
    });
    await createUserProfileAndSession(userRecord.uid, {
      email,
      role: "athlete",
      plan: "basic",
      fullName,
    });
    await sendEmailVerification(email, fullName);
    return { success: true };
  } catch (err) {
    console.error("[auth][signupAthlete]", err);
    return { success: false, error: mapAuthError(err) };
  }
}

const companySignupSchema = z.object({
  companyName: z.string().min(1),
  cnpj: z.string().min(1),
  sponsorshipType: z.string().min(1),
  sportInterest: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signupCompany(
  input: z.infer<typeof companySignupSchema>
): Promise<ActionResult> {
  const parsed = companySignupSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos." };
  }
  const { companyName, cnpj, sponsorshipType, sportInterest, email, password } = parsed.data;

  try {
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: companyName,
    });
    await adminDb.collection("users").doc(userRecord.uid).set({
      email,
      role: "company",
      plan: null,
      companyName,
      cnpj,
      sponsorshipType,
      sportInterest,
      createdAt: new Date().toISOString(),
    });
    const customToken = await adminAuth.createCustomToken(userRecord.uid);
    const { idToken } = await signInWithCustomToken(customToken);
    await createSessionForIdToken(idToken);
    await sendEmailVerification(email, companyName);
    return { success: true };
  } catch (err) {
    console.error("[auth][signupCompany]", err);
    return { success: false, error: mapAuthError(err) };
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function loginUser(
  input: z.infer<typeof loginSchema>
): Promise<ActionResult<{ role: Role }>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos." };
  }
  const { email, password } = parsed.data;

  try {
    const { idToken, localId } = await signInWithPassword(email, password);
    const userDoc = await adminDb.collection("users").doc(localId).get();
    if (!userDoc.exists) {
      return { success: false, error: "E-mail ou senha inválidos." };
    }
    await createSessionForIdToken(idToken);
    const role = userDoc.data()?.role as Role;
    return { success: true, role };
  } catch (err) {
    console.error("[auth][loginUser]", err);
    return { success: false, error: mapAuthError(err) };
  }
}

export async function logoutUser(): Promise<void> {
  const session = await getSession();
  if (session) {
    await adminAuth.revokeRefreshTokens(session.uid).catch(() => undefined);
  }
  (await cookies()).delete(SESSION_COOKIE_NAME);
}

/** Reenvia o e-mail de verificação para o usuário logado (tela /verificar-email). */
export async function resendVerificationEmail(): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Sessão inválida. Faça login novamente." };
  }
  await sendEmailVerification(session.email, session.fullName ?? session.companyName);
  return { success: true };
}

const resetSchema = z.object({ email: z.string().email() });


export async function loginWithGoogleToken(
  idToken: string
): Promise<ActionResult<{ role: Role }>> {
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email ?? "";

    const userRef = adminDb.collection("users").doc(uid);
    const userDoc = await userRef.get();

    let role: Role = "athlete";
    if (!userDoc.exists) {
      await userRef.set({
        email,
        role: "athlete",
        plan: "basic",
        fullName: decoded.name ?? "",
        createdAt: new Date().toISOString(),
      });
    } else {
      role = (userDoc.data()?.role as Role) ?? "athlete";
    }

    await createSessionForIdToken(idToken);
    return { success: true, role };
  } catch (err) {
    console.error("[auth][loginWithGoogleToken]", err);
    return { success: false, error: "Erro ao autenticar com Google. Tente novamente." };
  }
}

export async function requestPasswordReset(
  input: z.infer<typeof resetSchema>
): Promise<ActionResult> {
  const parsed = resetSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos." };
  }

  // Não revela se o e-mail existe ou não — sempre retorna sucesso.
  await sendPasswordResetEmail(parsed.data.email).catch(() => undefined);
  return { success: true };
}

