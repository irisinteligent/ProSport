import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, adminDb } from "./firebase-admin";

export const SESSION_COOKIE_NAME = "session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 5; // 5 dias (limite do Firebase é 14 dias)

export type Role = "athlete" | "company" | "admin";

export type SessionUser = {
  uid: string;
  email: string;
  role: Role;
  plan: string | null;
  fullName?: string;
  companyName?: string;
  subscriptionStatus?: string;
};

/**
 * Lê e valida o cookie de sessão. Retorna `null` se não houver sessão
 * válida — não lança erro, então é seguro chamar em qualquer Server Component.
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    if (!userDoc.exists) return null;

    const data = userDoc.data() as {
      email: string;
      role: Role;
      plan: string | null;
      fullName?: string;
      companyName?: string;
      subscriptionStatus?: string;
    };

    return {
      uid: decoded.uid,
      email: decoded.email ?? data.email,
      role: data.role,
      plan: data.plan ?? null,
      fullName: data.fullName,
      companyName: data.companyName,
      subscriptionStatus: data.subscriptionStatus,
    };
  } catch {
    return null;
  }
}

/**
 * Verifica, em tempo real, se o e-mail do usuário já foi confirmado.
 * Lê direto do Firebase Auth (e não do cookie de sessão, que pode estar
 * desatualizado pois foi emitido no cadastro, antes da verificação).
 * Contas via Google já vêm com e-mail verificado.
 */
// IMPORTANTE: enquanto o Resend não entregar e-mails de verificação a endereços
// externos (o domínio prosport.ia.br ainda NÃO está verificado no Resend), a
// exigência de verificação NÃO pode bloquear o acesso — senão o link nunca chega
// e nenhum usuário de e-mail/senha consegue entrar. Deixe FALSE até o Resend
// estar ativo; depois mude para true para voltar a exigir e-mail confirmado.
const EMAIL_VERIFICATION_ENFORCED = false;

export async function isEmailVerified(uid: string): Promise<boolean> {
  if (!EMAIL_VERIFICATION_ENFORCED) return true;
  try {
    const user = await adminAuth.getUser(uid);
    return user.emailVerified === true;
  } catch {
    return false;
  }
}

/**
 * Para usar no topo de Server Components protegidos. Redireciona se não
 * houver sessão válida, ou se o role do usuário não estiver em `allowedRoles`.
 */
export async function requireSession(
  allowedRoles?: Role[],
  redirectTo = "/"
): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    redirect(redirectTo);
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    redirect(redirectTo);
  }
  return session;
}
