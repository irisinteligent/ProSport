import {onRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// ======= Versão/diagnóstico =======
const BUILD_ID = "prosport-functions@C:\\PROSPORT | 2025-08-28T00:00-03";
const CODEBASE = "default";
const REGIONS = ["southamerica-east1", "us-central1"]; // mantém em 2 regiões para evitar conflito

// Util: slug simples p/ montar URL
function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 64);
}

// -------- generateLanding (POST) grava no Firestore e retorna URL ----------
export const generateLanding = onRequest(
  {
    region: REGIONS,
    cors: false,
  },
  async (req, res): Promise<void> => {
    // Headers p/ debug
    res.setHeader("X-Build-Id", BUILD_ID);
    res.setHeader("X-Codebase", CODEBASE);
    res.setHeader("X-Regions", REGIONS.join(","));

    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");

    if (req.method === "OPTIONS") {
      res.status(204).send(""); return;
    }
    if (req.method !== "POST") {
      res.status(405).json({error: "Use POST"}); return;
    }

    try {
      const b = (req.body ?? {}) as Record<string, unknown>;

      // Normalização de campos PT/EN
      const plano =
        (b["plano"] as string | undefined) ??
        (b["plan"] as string | undefined) ?? null;

      const nome =
        (b["nome"] as string | undefined) ??
        (b["athleteName"] as string | undefined) ??
        (b["name"] as string | undefined) ?? null;

      const modalidade =
        (b["modalidade"] as string | undefined) ??
        (b["modality"] as string | undefined) ??
        (b["sport"] as string | undefined) ?? null;

      const imagem =
        (b["imagem"] as string | undefined) ??
        (b["imageUrl"] as string | undefined) ??
        (b["image"] as string | undefined) ??
        (b["foto"] as string | undefined) ?? null;

      if (!plano || !nome || !modalidade || !imagem) {
        res.status(400).json({
          ok: false,
          error: "Campos obrigatórios: plano, nome, modalidade, imagem.",
          buildId: BUILD_ID, codebase: CODEBASE, regions: REGIONS,
        });
        return;
      }

      const slug = slugify(String(nome));
      const docRef = db.collection("landings").doc(slug);
      const docSnap = await docRef.get();
      const now = admin.firestore.FieldValue.serverTimestamp();

      // Conteúdo base do landing
      const data: Record<string, any> = {
        plano,
        nome,
        modalidade,
        imagem,
        // Campos extras úteis pra layout:
        bio: (b["bio"] as string | undefined) ?? "",
        contatoEmail: (b["contatoEmail"] as string | undefined) ?? (b["contactEmail"] as string | undefined) ?? "",
        redes: (b["redes"] as any) ?? (b["social"] as any) ?? {
          instagram: "",
          youtube: "",
          tiktok: "",
        },
        theme: (b["theme"] as any) ?? {primary: "#0ea5e9", dark: "#0f172a"},
        updatedAt: now,
        buildId: BUILD_ID,
        codebase: CODEBASE,
      };

      // Preserva createdAt no primeiro registro; não sobrescreve em atualizações
      if (!docSnap.exists) {
        data["createdAt"] = now;
      }

      await docRef.set(data, {merge: true});

      const url = `https://prosport-portfolio.web.app/landing/${slug}`;

      res.status(200).json({
        ok: true,
        buildId: BUILD_ID,
        codebase: CODEBASE,
        regions: REGIONS,
        url,
        recebido: {plano, nome, modalidade, imagem},
      });
      return;
    } catch (err: any) {
      console.error("[generateLanding][ERROR]", err);
      res.status(500).json({
        ok: false,
        error: String(err?.message ?? err),
        buildId: BUILD_ID, codebase: CODEBASE, regions: REGIONS,
      });
      return;
    }
  }
);

// ---------- getLanding (GET) devolve JSON/HTML do landing ----------
export const getLanding = onRequest(
  {
    region: REGIONS,
    cors: false,
  },
  async (req, res): Promise<void> => {
    // Headers p/ debug
    res.setHeader("X-Build-Id", BUILD_ID);
    res.setHeader("X-Codebase", CODEBASE);
    res.setHeader("X-Regions", REGIONS.join(","));

    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");

    if (req.method === "OPTIONS") {
      res.status(204).send(""); return;
    }
    if (req.method !== "GET") {
      res.status(405).json({error: "Use GET"}); return;
    }

    try {
      const slug = String(req.query.slug ?? "").trim();
      const format = String(req.query.format ?? "json").toLowerCase();

      if (!slug) {
        res.status(400).json({ok: false, error: "Parâmetro 'slug' obrigatório"});
        return;
      }

      const snap = await db.collection("landings").doc(slug).get();
      if (!snap.exists) {
        res.status(404).json({ok: false, error: "Landing não encontrada"});
        return;
      }

      const landing = snap.data()!;
      const payload = {
        ok: true,
        slug,
        landing,
        buildId: BUILD_ID,
        codebase: CODEBASE,
        regions: REGIONS,
      };

      if (format === "html") {
        // Render HTML simples (opcional para testes diretos no navegador)
        const html = renderHTML(landing, slug);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.status(200).send(html);
        return;
      }

      // JSON por padrão
      res.status(200).json(payload);
      return;
    } catch (err: any) {
      console.error("[getLanding][ERROR]", err);
      res.status(500).json({
        ok: false,
        error: String(err?.message ?? err),
        buildId: BUILD_ID, codebase: CODEBASE, regions: REGIONS,
      });
      return;
    }
  }
);

// Escapa caracteres especiais de HTML para evitar XSS ao
// renderizar dados gravados pelo usuário.
function escapeHtml(value: unknown): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Template HTML (usado só se format=html)
function renderHTML(landing: any, slug: string): string {
  const nome = escapeHtml(landing?.nome ?? slug);
  const modalidade = escapeHtml(landing?.modalidade ?? "");
  const imagem = escapeHtml(landing?.imagem ?? "");
  const plano = escapeHtml(String(landing?.plano ?? "basic").toUpperCase());
  const cor = escapeHtml(landing?.theme?.primary ?? "#0ea5e9");

  return `<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${nome} · ${modalidade}</title>
<style>
  :root { --primary: ${cor}; --bg:#0f172a; --fg:#e2e8f0; }
  body { margin:0; font-family: system-ui, Arial, sans-serif; background:var(--bg); color:var(--fg); }
  .hero { display:grid; grid-template-columns: 1fr 1fr; gap:24px; padding:32px; max-width:1100px; margin:0 auto; }
  .card { background:#111827; border:1px solid #1f2937; border-radius:16px; padding:24px; box-shadow: 0 10px 30px rgba(0,0,0,.25); }
  h1 { margin:0 0 8px; font-size:40px }
  .badge { display:inline-block; padding:4px 10px; border-radius:999px; background:var(--primary); color:#03131f; font-weight:700; }
  .img { border-radius:16px; overflow:hidden; }
  .img img { width:100%; display:block; }
  .cta a { background:var(--primary); color:#03131f; padding:12px 18px; border-radius:12px; text-decoration:none; font-weight:700 }
  .grid { display:grid; gap:16px; grid-template-columns: repeat(3,1fr); margin-top:24px }
  @media (max-width: 900px){ .hero{ grid-template-columns:1fr; } .grid{ grid-template-columns:1fr; } }
</style>
</head>
<body>
  <section class="hero">
    <div class="img card">
      <img src="${imagem}" alt="${nome}" />
    </div>
    <div class="card">
      <div class="badge">${plano}</div>
      <h1>${nome}</h1>
      <p style="margin:0 0 8px; opacity:.8">${modalidade}</p>
      <div class="cta" style="margin-top:16px">
        ${landing?.contatoEmail ? `<a href="mailto:${escapeHtml(landing.contatoEmail)}">Contato</a>` : ""}
      </div>
      ${landing?.bio ? `<p style="margin-top:16px; opacity:.9">${escapeHtml(landing.bio)}</p>` : ""}
    </div>
  </section>
  <section class="grid" style="max-width:1100px; margin:0 auto; padding:0 32px 32px">
    <div class="card"><b>Treinos</b><p style="opacity:.8">Rotina, foco, objetivos...</p></div>
    <div class="card"><b>Conquistas</b><p style="opacity:.8">Títulos, pódios, rankings...</p></div>
    <div class="card"><b>Parceiros</b><p style="opacity:.8">Marcas e colaborações.</p></div>
  </section>
</body>
</html>`;
}
