import { randomUUID } from 'crypto';
import { adminStorage } from './firebase-admin';

const DATA_URI_PATTERN = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/;

/**
 * Faz upload da foto do atleta (data URI) para o Firebase Storage e devolve
 * uma download URL no mesmo formato gerado por getDownloadURL() do client SDK.
 * Substitui o padrão antigo de embutir a foto em base64 direto no Firestore (CLAUDE.md §6.3).
 */
export async function uploadAthletePhoto(slug: string, photoDataUri: string): Promise<string> {
  const match = photoDataUri.match(DATA_URI_PATTERN);
  if (!match) {
    throw new Error('Foto inválida: esperado um data URI de imagem em base64.');
  }
  const [, mimeType, base64Data] = match;
  // SEGURANÇA: allowlist de formatos raster. SVG fica de fora de propósito —
  // pode carregar <script> e vira vetor de XSS se algum dia for servido inline.
  const ALLOWED_MIMES: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'image/gif': 'gif',
  };
  const extension = ALLOWED_MIMES[mimeType.toLowerCase()];
  if (!extension) {
    throw new Error('Formato de imagem não suportado: use JPG, PNG, WebP, AVIF ou GIF.');
  }
  const buffer = Buffer.from(base64Data, 'base64');

  const bucket = adminStorage.bucket();
  const path = `sportpages/${slug}/photo.${extension}`;
  const file = bucket.file(path);
  const downloadToken = randomUUID();

  await file.save(buffer, {
    contentType: mimeType,
    metadata: {
      cacheControl: 'public, max-age=31536000',
      metadata: { firebaseStorageDownloadTokens: downloadToken },
    },
  });

  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${downloadToken}`;
}
