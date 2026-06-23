
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth";
import { redirectToBillingPortal } from "@/lib/billing-actions";
import { AthleteSearchSection } from "@/components/company/athlete-search-section";

export default async function CompanyDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireSession(["company"], "/company/login");
  const { q } = await searchParams;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header
        plansPath="/company/plans"
        dashboardPath="/company/dashboard"
        userLabel={session.companyName ?? "Empresa"}
        userEmail={session.email}
      />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-2xl font-bold">Painel do Patrocinador</h1>
          <form action={redirectToBillingPortal}>
            <Button type="submit" variant="outline" size="sm">
              Gerenciar assinatura
            </Button>
          </form>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AthleteSearchSection query={q} />
        </div>
      </main>
    </div>
  );
}
