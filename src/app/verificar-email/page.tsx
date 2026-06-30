import { redirect } from "next/navigation";
import { requireSession, isEmailVerified } from "@/lib/auth";
import { VerifyEmailClient } from "@/components/auth/verify-email-client";

export const dynamic = "force-dynamic";

export default async function VerificarEmailPage() {
  const session = await requireSession(undefined, "/");

  // Já confirmou? Segue para o destino do seu perfil.
  if (await isEmailVerified(session.uid)) {
    if (session.role === "admin") redirect("/admin");
    if (session.role === "company") redirect("/company/dashboard");
    redirect("/assinar");
  }

  return <VerifyEmailClient email={session.email} />;
}
