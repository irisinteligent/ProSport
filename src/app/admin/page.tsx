import { Header } from "@/components/header";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";
import { requireSession } from "@/lib/auth";
import { getAdminMetrics } from "@/lib/admin-metrics";

export default async function AdminPage() {
  const session = await requireSession(["admin"], "/athlete/login");
  const metrics = await getAdminMetrics();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header userLabel="Admin" userEmail={session.email} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="font-headline text-2xl font-bold">Painel do Admin</h1>
        </div>
        <AdminDashboardClient {...metrics} />
      </main>
    </div>
  );
}
