import { randomUUID } from 'crypto';
import { adminStorage } from './firebase-admin';
import { buildKontextPrompt } from './sport-scenes';

/**
 * Composição automática do hero do atleta.
 *
 * Pipeline:
 *   1. FLUX Kontext (image-editing) troca o fundo pelo cenário da modalidade e
 *      reilumina o atleta, preservando rosto/uniforme/pose.
 *   2. (Opcional) Upscale/restauração para nitidez de hero grande.
 *   3. Persiste o resultado no Storage e devolve a URL — pronta para entrar no
 *      lugar do `__IMAGE_PLACEHOLDER__` do HTML gerado.
 *
 * Variáveis de ambiente (Vercel → Environment Variables):
 *   - FAL_KEY ...............  obrigatória. Sem ela, devolve a foto crua.
 *   - FAL_KONTEXT_MODEL ....  opcional. Default: 'fal-ai/flux-pro/kontext'.
 *   - FAL_UPSCALE ..........  opcional. '1'/'true' liga o upscale.
 *   - FAL_UPSCALE_MODEL ....  opcional. Default: 'fal-ai/clarity-upscaler'.
 *   - FAL_UPSCALE_FACTOR ...  opcional. Default: 2.
 *
 * Degradação graciosa em TODA etapa: qualquer falha (sem key, rede, erro do
 * modelo, resposta inesperada) cai para o melhor resultado disponível até ali —
 * a geração da sportpage nunca é bloqueada.
 */

const DEFAULT_KONTEXT_MODEL = 'fal-ai/flux-pro/kontext';
const DEFAULT_UPSCALE_MODEL = 'fal-ai/clarity-upscaler';

export async function composeAthleteHero(
  slug: string,
  photoUrl: string,
  sport: string,
): Promise<string> {
  const key = process.env.FAL_KEY;
  if (!key) return photoUrl;

  try {
    // 1) Composição (troca de fundo + reiluminação)
    const composedUrl = await runKontext(key, photoUrl, sport);
    if (!composedUrl) return photoUrl;

    // 2) Upscale opcional
    const finalUrl = await maybeUpscale(key, composedUrl);

    // 3) Re-hospeda no Storage (a URL do provedor pode expirar)
    const imgRes = await fetch(finalUrl);
    if (!imgRes.ok) return finalUrl;
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    return await saveHeroToStorage(slug, buffer);
  } catch (err) {
    console.error('composeAthleteHero falhou:', err);
    return photoUrl;
  }
}

async function runKontext(key: string, photoUrl: string, sport: string): Promise<string | null> {
  const model = process.env.FAL_KONTEXT_MODEL || DEFAULT_KONTEXT_MODEL;
  const res = await fetch(`https://fal.run/${model}`, {
    method: 'POST',
    headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: buildKontextPrompt(sport),
      image_url: photoUrl,
      guidance_scale: 3.5,
      num_inference_steps: 34,
      output_format: 'jpeg',
      safety_tolerance: '2',
    }),
  });
  if (!res.ok) {
    console.error('composeAthleteHero: erro Kontext', res.status, (await res.text().catch(() => '')).slice(0, 500));
    return null;
  }
  return extractImageUrl(await res.json());
}

async function maybeUpscale(key: string, imageUrl: string): Promise<string> {
  const enabled = ['1', 'true', 'yes'].includes((process.env.FAL_UPSCALE || '').toLowerCase());
  if (!enabled) return imageUrl;

  const model = process.env.FAL_UPSCALE_MODEL || DEFAULT_UPSCALE_MODEL;
  const factor = Number(process.env.FAL_UPSCALE_FACTOR) || 2;
  try {
    const res = await fetch(`https://fal.run/${model}`, {
      method: 'POST',
      headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageUrl, upscale_factor: factor, scale_factor: factor }),
    });
    if (!res.ok) {
      console.error('composeAthleteHero: erro upscale', res.status, (await res.text().catch(() => '')).slice(0, 300));
      return imageUrl;
    }
    return extractImageUrl(await res.json()) || imageUrl;
  } catch (err) {
    console.error('composeAthleteHero: upscale falhou:', err);
    return imageUrl;
  }
}

/** Aceita tanto { images: [{ url }] } quanto { image: { url } }. */
function extractImageUrl(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as { images?: unknown; image?: unknown };

  if (Array.isArray(obj.images) && obj.images.length > 0) {
    const url = urlOf(obj.images[0]);
    if (url) return url;
  }
  return urlOf(obj.image);
}

function urlOf(node: unknown): string | null {
  if (node && typeof node === 'object' && 'url' in node) {
    const url = (node as { url?: unknown }).url;
    if (typeof url === 'string') return url;
  }
  return null;
}

async function saveHeroToStorage(slug: string, buffer: Buffer): Promise<string> {
  const bucket = adminStorage.bucket();
  const path = `sportpages/${slug}/hero.jpg`;
  const token = randomUUID();
  await bucket.file(path).save(buffer, {
    contentType: 'image/jpeg',
    metadata: {
      cacheControl: 'public, max-age=31536000',
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}
