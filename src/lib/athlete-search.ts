import { adminDb } from "./firebase-admin";

export type AthleteSearchResult = {
  uid: string;
  fullName: string;
  sport: string;
  isAmateur: boolean;
  achievements: string;
  photoUrl: string;
  sportpageUrl: string;
  plan: "plus" | "premium";
};

/**
 * Só atletas Plus/Premium são pesquisáveis — Básico não inclui divulgação
 * ativa da ProSport (ver CLAUDE.md §1). O plano é lido direto de `users/{uid}`,
 * que o webhook do Stripe mantém atualizado, então cancelamentos somem da
 * busca automaticamente.
 */
export async function searchAthletes(query?: string): Promise<AthleteSearchResult[]> {
  const athletesRef = adminDb.collection("users").where("role", "==", "athlete");
  const [plusSnap, premiumSnap] = await Promise.all([
    athletesRef.where("plan", "==", "plus").get(),
    athletesRef.where("plan", "==", "premium").get(),
  ]);

  const results: AthleteSearchResult[] = [];
  for (const doc of [...plusSnap.docs, ...premiumSnap.docs]) {
    const data = doc.data();
    const profile = data.athleteProfile;
    if (!profile) continue; // plano Plus/Premium, mas ainda não gerou nenhuma sportpage

    results.push({
      uid: doc.id,
      fullName: data.fullName ?? "",
      sport: profile.sport ?? "",
      isAmateur: profile.isAmateur ?? true,
      achievements: profile.achievements ?? "",
      photoUrl: profile.photoUrl ?? "",
      sportpageUrl: profile.sportpageUrl ?? "",
      plan: data.plan,
    });
  }

  const q = query?.trim().toLowerCase();
  const filtered = q
    ? results.filter(
        (a) => a.fullName.toLowerCase().includes(q) || a.sport.toLowerCase().includes(q)
      )
    : results;

  return filtered.sort((a, b) => a.fullName.localeCompare(b.fullName));
}
