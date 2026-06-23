import { adminDb } from "./firebase-admin";

export type AdminMetrics = {
  totalAthletes: number;
  totalSportpages: number;
  plusSubscriptions: number;
  premiumSubscriptions: number;
  planBreakdown: { plan: string; users: number }[];
};

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const athletesRef = adminDb.collection("users").where("role", "==", "athlete");

  const [totalAthletesSnap, basicSnap, plusSnap, premiumSnap, sportpagesSnap] = await Promise.all([
    athletesRef.count().get(),
    athletesRef.where("plan", "==", "basic").count().get(),
    athletesRef.where("plan", "==", "plus").count().get(),
    athletesRef.where("plan", "==", "premium").count().get(),
    adminDb.collection("sportpages").count().get(),
  ]);

  const plusSubscriptions = plusSnap.data().count;
  const premiumSubscriptions = premiumSnap.data().count;

  return {
    totalAthletes: totalAthletesSnap.data().count,
    totalSportpages: sportpagesSnap.data().count,
    plusSubscriptions,
    premiumSubscriptions,
    planBreakdown: [
      { plan: "Básico", users: basicSnap.data().count },
      { plan: "Plus", users: plusSubscriptions },
      { plan: "Premium", users: premiumSubscriptions },
    ],
  };
}
