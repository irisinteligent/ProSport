
import { getPageContent } from '@/lib/storage';
import { notFound } from 'next/navigation';

/**
 * Sportpages sem CSS próprio (ex.: conteúdo simples em texto puro) deixam
 * `html`/`body` com background transparente. Dentro do `<iframe sandbox>`
 * (origem opaca/única), isso revela o fundo preto fixo da página por trás
 * (`html::before` em globals.css) — texto preto sobre fundo transparente
 * que mostra preto atrás fica invisível. `<meta name="color-scheme">` não
 * resolve isso de forma confiável dentro de um documento `srcdoc` sandboxed
 * (confirmado via Playwright: o valor computado continha "normal", não
 * "light"); cor explícita em CSS sempre vence porque deixa de ser
 * transparente, independente de qualquer comportamento de color-scheme do
 * navegador. Baixa especificidade (seletores de tag) garante que o CSS de
 * páginas Plus/Premium geradas pela IA, que vem depois no documento,
 * continue podendo sobrescrever isso normalmente.
 */
function ensureVisibleBackground(html: string): string {
  const style =
    '<style>html,body{background-color:#fff;color:#111}</style>';
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head[^>]*>/i, (match) => `${match}${style}`);
  }
  if (/<html[^>]*>/i.test(html)) {
    return html.replace(/<html[^>]*>/i, (match) => `${match}<head>${style}</head>`);
  }
  return `${style}${html}`;
}

export default async function SportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getPageContent(slug);

  if (!content) {
    notFound();
  }

  return (
    <iframe
      srcDoc={ensureVisibleBackground(content)}
      style={{ width: '100%', height: '100vh', border: 'none', display: 'block' }}
      sandbox="allow-scripts"
      title="Sport Page"
    />
  );
}
