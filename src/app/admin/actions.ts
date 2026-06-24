"use server";

import { adminDb } from "@/lib/firebase-admin";

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
};

export async function getAdminStats(): Promise<AdminStats> {
  try {
    const [usersSnap, pagesSnap] = await Promise.all([
      adminDb.collection("users").get(),
      adminDb.collection("sportpages").get(),
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
        name: data.name || "—",
        email: data.email || "—",
        plan: plan,
        createdAt: data.createdAt?.toDate?.()?.toLocaleDateString("pt-BR") ?? "—",
      });
    });

    // Ordena por createdAt desc e pega os 10 mais recentes
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
    };
  } catch (error) {
    console.error("[getAdminStats] erro:", error);
    return {
      totalAthletes: 0,
      totalSportPages: 0,
      planCounts: { basic: 0, plus: 0, premium: 0 },
      recentUsers: [],
    };
  }
}
