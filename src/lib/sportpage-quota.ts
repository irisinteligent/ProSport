import { adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Limite de Sport Pages que um atleta pode gerar no seu plano assinado.
 * A contagem total fica em `users/{uid}.sportpagesGenerated` e cobre tanto o
 * fluxo Básico quanto o Plus/Premium (limite por ATLETA, não por plano).
 */
export const SPORTPAGE_LIMIT = 2;

export async function getSportpageCount(uid: string): Promise<number> {
  const snap = await adminDb.collection('users').doc(uid).get();
  const data = snap.data() as { sportpagesGenerated?: number } | undefined;
  return data?.sportpagesGenerated ?? 0;
}

/** True se o atleta já atingiu (ou passou) o limite de Sport Pages. */
export async function hasReachedSportpageLimit(uid: string): Promise<boolean> {
  return (await getSportpageCount(uid)) >= SPORTPAGE_LIMIT;
}

/**
 * Registra mais uma Sport Page gerada para o atleta (chamar só APÓS sucesso,
 * para que falhas não consumam a cota). Incrementa o contador e guarda o slug.
 */
export async function recordSportpageGenerated(uid: string, slug: string): Promise<void> {
  await adminDb.collection('users').doc(uid).set(
    {
      sportpagesGenerated: FieldValue.increment(1),
      sportpageSlugs: FieldValue.arrayUnion(slug),
    },
    { merge: true },
  );
}
