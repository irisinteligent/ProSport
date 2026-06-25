import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";
import { getAdminStats } from "./actions";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

async function getSessionUid(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("__session")?.value ?? null;
}

async function isAdmin(uid: string): Promise<boolean> {
  const snap = await adminDb.collection("users").doc(uid).get();
  return snap.exists && snap.data()?.role === "admin";
}

export default async function AdminPage() {
  const uid = await getSessionUid();
  if (!uid || !(await isAdmin(uid))) {
    redirect("/dashboard");
  }
  const stats = await getAdminStats();
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="font-headline text-2xl font-bold">Painel do Admin</h1>
        </div>
        <AdminDashboardClient stats={stats} />
      </main>
    </div>
  );
}
