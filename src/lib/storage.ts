import { adminDb } from './firebase-admin';

const COLLECTION = 'sportpages';

/**
 * Salva o conteúdo HTML de uma sport page no Firestore.
 * Funciona tanto em dev local (com emulador) quanto em produção (App Hosting / Cloud Run).
 */
export async function setPageContent(slug: string, content: string): Promise<void> {
  await adminDb.collection(COLLECTION).doc(slug).set({
    content,
    createdAt: new Date().toISOString(),
  });
}

/**
 * Recupera o conteúdo HTML de uma sport page pelo slug.
 * Retorna undefined se não encontrada.
 */
export async function getPageContent(slug: string): Promise<string | undefined> {
  const snap = await adminDb.collection(COLLECTION).doc(slug).get();
  if (!snap.exists) return undefined;
  return snap.data()?.content as string | undefined;
}
