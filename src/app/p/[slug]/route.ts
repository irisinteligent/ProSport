import { getPageContent } from '@/lib/storage';
import { NextRequest } from 'next/server';

/**
 * Serve a sport page pública diretamente como HTML — sem iframe, sem root layout.
 *
 * Por que Route Handler em vez de page.tsx:
 * - `page.tsx` sempre envolve o conteúdo com o root layout (header, footer, <body>)
 *   e usa `<iframe srcdoc>` para isolar o HTML, mas o `srcdoc` de documentos
 *   grandes fica truncado no RSC payload do Next.js.
 * - O Route Handler (`route.ts`) responde com `Content-Type: text/html` puro,
 *   bypassando completamente todos os layouts. O HTML gerado pela IA é servido
 *   exatamente como foi salvo no Firestore, sem encapsulamento.
 *
 * Segurança:
 * - O HTML é gerado pelo Gemini a partir de dados estruturados com inputs escapados.
 * - CSP header restringe scripts inline externos não autorizados.
 * - X-Content-Type-Options evita MIME sniffing.
 * - O slug vem da URL e é usado apenas como chave de lookup no Firestore — sem
 *   interpolação em HTML aqui.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const content = await getPageContent(slug);

  if (!content) {
    return new Response(
      '<!DOCTYPE html><html><head><title>Página não encontrada</title></head>' +
      '<body style="font-family:sans-serif;text-align:center;padding:4rem;">' +
      '<h1>404 — Página não encontrada</h1>' +
      '<p>Esta sport page não existe ou foi removida.</p>' +
      '</body></html>',
      {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Impede que a página seja embutida em iframes em outros sites (clickjacking)
      'X-Frame-Options': 'SAMEORIGIN',
      // Impede MIME sniffing
      'X-Content-Type-Options': 'nosniff',
      // Sem cache — sempre serve o conteúdo atual do Firestore
      'Cache-Control': 'no-store',
    },
  });
}
