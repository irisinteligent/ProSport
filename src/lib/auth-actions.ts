"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { adminAuth, adminDb } from "./firebase-admin";
import {
  sendPasswordResetEmail,
  signInWithCustomToken,
  signInWithPassword,
} from "./firebase-rest";
import { getSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, type Role } from "./auth";

type ActionResult<T = object> =
  | ({ success: true } & T)
  | { success: false; error: string };

function mapAuthError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);

  if (message.includes("auth/email-already-exists") || message.includes("EMAIL_EXISTS")) {
    return "Este e-mail já está cadastrado.";
  }
  if (message.includes("auth/invalid-password") || message.includes("WEAK_PASSWORD")) {
    return "A senha precisa ter pelo menos 6 caracteres.";
  }
  if (message.includes("auth/invalid-email")) {
    return "Endereço de e-mail inválido.";
  }
  if (
    message.includes("INVALID_LOGIN_CREDENTIALS") ||
    message.includes("EMAIL_NOT_FOUND") ||
    message.includes("INVALID_PASSWORD")
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
    return { success: true };
  } catch (err) {
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
    return { success: true };
  } catch (err) {
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

const resetSchema = z.object({ email: z.string().email() });

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

