
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth";
import { redirectToBillingPortal } from "@/lib/billing-actions";

export default async function ClubDashboardPage() {
  const session = await requireSession(["company"], "/club/login");

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header
        plansPath="/company/plans"
        dashboardPath="/club/dashboard"
        userLabel={session.companyName ?? "Clube"}
        userEmail={session.email}
      />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-2xl font-bold">Painel de Empresas/Clubes</h1>
          <form action={redirectToBillingPortal}>
            <Button type="submit" variant="outline" size="sm">
              Gerenciar assinatura
            </Button>
          </form>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Buscar Atletas</CardTitle>
                    <CardDescription>
                        Filtre para encontrar o talento ideal para sua equipe.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Input type="text" id="search" placeholder="Buscar por modalidade, nome, localização..." />
                </CardContent>
            </Card>
            {/* Athlete cards will be listed here */}
        </div>
      </main>
    </div>
  );
}
