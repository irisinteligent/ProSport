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
