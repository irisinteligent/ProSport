"use server";

import { adminDb } from "@/lib/firebase-admin";
import { getStripe } from "@/lib/stripe";
import { getSession } from "@/lib/auth";

export type RevenueStats = {
  today: number;
  thisMonth: number;
  prevMonth: number;
};

export type AdminStats = {
  totalAthletes: number;
  totalSportPages: number;
  planCounts: { basic: number; plus: number; premium: number };
  recentUsers: {
    uid: string;
    name: string;
    email: string;
    plan: string;
    createdAt: string;
  }[];
  revenue: RevenueStats;
};

function toUnix(d: Date): number {
  return Math.floor(d.getTime() / 1000);
}

async function fetchRevenue(): Promise<RevenueStats> {
  try {
    const stripe = getStripe();
    const now = new Date();

    // Inicio de hoje (00:00:00)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Inicio do mes atual
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Inicio e fim do mes anterior
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 1);

    // Busca todas as transacoes do mes atual + mes anterior em paralelo
    const [currentMonthTxs, prevMonthTxs] = await Promise.all([
      stripe.balanceTransactions.list({
        type: "charge",
        created: { gte: toUnix(monthStart) },
        limit: 100,
      }),
      stripe.balanceTransactions.list({
        type: "charge",
        created: { gte: toUnix(prevMonthStart), lt: toUnix(prevMonthEnd) },
        limit: 100,
      }),
    ]);

    const todayStartUnix = toUnix(todayStart);

    let today = 0;
    let thisMonth = 0;

    for (const tx of currentMonthTxs.data) {
      if (tx.net > 0) {
        thisMonth += tx.net;
        if (tx.created >= todayStartUnix) {
          today += tx.net;
        }
      }
    }

    let prevMonth = 0;
    for (const tx of prevMonthTxs.data) {
      if (tx.net > 0) prevMonth += tx.net;
    }

    // Stripe retorna centavos — divide por 100 para reais
    return {
      today:     today / 100,
      thisMonth: thisMonth / 100,
      prevMonth: prevMonth / 100,
    };
  } catch {
    // Stripe nao configurado ou erro — retorna zeros
    return { today: 0, thisMonth: 0, prevMonth: 0 };
  }
}

export async function getAdminStats(): Promise<AdminStats> {
  // SEGURANÇA: Server Actions são endpoints POST públicos (o ID da action fica
  // em chunks JS estáticos). Sem esta checagem, qualquer visitante conseguiria
  // extrair e-mails de todos os usuários e o faturamento. O gate da página
  // /admin NÃO protege a action em si.
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("Acesso negado.");
  }
  try {
    const [[usersSnap, pagesSnap], revenue] = await Promise.all([
      Promise.all([
        adminDb.collection("users").get(),
        adminDb.collection("sportpages").get(),
      ]),
      fetchRevenue(),
    ]);

    const planCounts = { basic: 0, plus: 0, premium: 0 };
    const recentUsers: AdminStats["recentUsers"] = [];

    usersSnap.forEach((doc) => {
      const data = doc.data();
      const plan = (data.plan as string) || "basic";
      if (plan === "plus") planCounts.plus++;
      else if (plan === "premium") planCounts.premium++;
      else planCounts.basic++;

      recentUsers.push({
        uid: doc.id,
        name: data.name || data.fullName || "—",
        email: data.email || "—",
        plan,
        createdAt:
          typeof data.createdAt === "string"
            ? new Date(data.createdAt).toLocaleDateString("pt-BR")
            : data.createdAt?.toDate?.()?.toLocaleDateString("pt-BR") ?? "—",
      });
    });

    recentUsers.sort((a, b) => {
      if (a.createdAt === "—") return 1;
      if (b.createdAt === "—") return -1;
      return b.createdAt.localeCompare(a.createdAt);
    });

    return {
      totalAthletes: usersSnap.size,
      totalSportPages: pagesSnap.size,
      planCounts,
      recentUsers: recentUsers.slice(0, 10),
      revenue,
    };
  } catch (error) {
    console.error("[getAdminStats] erro:", error);
    return {
      totalAthletes: 0,
      totalSportPages: 0,
      planCounts: { basic: 0, plus: 0, premium: 0 },
      recentUsers: [],
      revenue: { today: 0, thisMonth: 0, prevMonth: 0 },
    };
  }
}
