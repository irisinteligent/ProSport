import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { AthleteDashboardClient } from "@/components/dashboard/athlete-dashboard-client";
import { requireSession } from "@/lib/auth";
import { hasActiveSubscription } from "@/lib/subscription";

export default async function DashboardPage() {
  const session = await requireSession(["athlete"], "/athlete/login");

  // Gate de pagamento: sem assinatura ativa confirmada, o atleta vê a tela de
  // apresentação (/assinar) e não entra no portal. Ver src/lib/subscription.ts.
  if (!hasActiveSubscription(session)) {
    redirect("/assinar");
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header userLabel={session.fullName ?? "Atleta"} userEmail={session.email} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="font-headline text-2xl font-bold">Painel do Atleta</h1>
        </div>
        <AthleteDashboardClient
          currentPlan={(session.plan as "basic" | "plus" | "premium" | null) ?? "basic"}
        />
      </main>
    </div>
  );
}
