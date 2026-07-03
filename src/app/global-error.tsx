"use client";

/**
 * Última linha de defesa: captura erros não tratados que estourariam a
 * árvore inteira do App Router (inclusive erros no root layout) e mostra
 * uma tela amigável em vez de página em branco. Precisa renderizar <html>
 * e <body> próprios (requisito do Next.js para global-error).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[global-error]", error);
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "sans-serif", display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", margin: 0, background: "#f8fafc", color: "#0f172a" }}>
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: 480 }}>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Algo deu errado</h1>
          <p style={{ color: "#475569", marginBottom: "1.5rem" }}>
            Ocorreu um erro inesperado. Nossa equipe foi notificada — tente novamente em instantes.
            {error.digest ? ` (código: ${error.digest})` : ""}
          </p>
          <button
            onClick={() => reset()}
            style={{ background: "#0f172a", color: "#fff", border: 0, borderRadius: 8, padding: "0.75rem 1.5rem", fontSize: "1rem", cursor: "pointer" }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
