'use server';

import { adminDb } from './firebase-admin';
import admin from 'firebase-admin';

const COLLECTION = 'sportpages';

/**
 * Faz upload de uma imagem (base64 data URI) para o Firebase Storage
 * e retorna a URL publica permanente.
 */
export async function uploadAthletePhoto(
  dataUri: string,
  slug: string
): Promise<string> {
  const match = dataUri.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error('Invalid data URI format');

  const mimeType = match[1];
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, 'base64');

  const ext = mimeType.split('/')[1]?.split('+')[0] || 'jpg';
  const fileName = `athlete-photos/${slug}-${crypto.randomUUID()}.${ext}`;

  const bucket = admin.storage().bucket();
  const file = bucket.file(fileName);

  await file.save(buffer, {
    metadata: { contentType: mimeType },
    public: true,
  });

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  return publicUrl;
}

/**
 * Salva o conteudo HTML de uma sport page no Firestore.
 */
export async function setPageContent(slug: string, content: string): Promise<void> {
  await adminDb.collection(COLLECTION).doc(slug).set({
    content,
    createdAt: new Date().toISOString(),
  });
}

/**
 * Recupera o conteudo HTML de uma sport page pelo slug.
 */
export async function getPageContent(slug: string): Promise<string | undefined> {
  const snap = await adminDb.collection(COLLECTION).doc(slug).get();
  if (!snap.exists) return undefined;
  return snap.data()?.content as string | undefined;
}
