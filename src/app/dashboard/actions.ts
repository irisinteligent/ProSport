"use server";

import { generateSponsorPresentation } from "@/ai/flows/generate-sponsor-presentation";
import type { GenerateSponsorPresentationInput } from "@/ai/flows/types";
import { setPageContent } from "@/lib/storage";
import { uploadAthletePhoto } from "@/lib/upload-photo";
import { composeAthleteHero } from "@/lib/compose-hero";
import { getSession } from "@/lib/auth";
import { hasActiveSubscription } from "@/lib/subscription";
import { hasReachedSportpageLimit, recordSportpageGenerated, SPORTPAGE_LIMIT } from "@/lib/sportpage-quota";
import { testAiConnection } from "@/ai/flows/test-ai-connection";
import { generateEnhancedSportpage } from '@/ai/flows/generate-enhanced-sportpage';
import { generateBasicSportpage } from '@/ai/flows/generate-basic-sportpage';
import type { GenerateEnhancedSportpageInput } from '@/ai/flows/types';

const generateSlug = (name: string) =>
  name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

// ─── Basic Plan ──────────────────────────────────────────────────────────────

interface CreateBasicSportpageData extends GenerateSponsorPresentationInput {
  photoDataUri?: string;
  team?: string;
  contact?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
}

export async function createBasicPresentation(data: CreateBasicSportpageData) {
  try {
    const session = await getSession();
    if (!session || session.role !== "athlete") {
      return { error: "Sessão inválida. Faça login como atleta para gerar sua Sport Page." };
    }
    if (!hasActiveSubscription(session)) {
      return { error: "Assinatura necessária. Escolha um plano para gerar sua Sport Page." };
    }
    if (await hasReachedSportpageLimit(session.uid)) {
      return { error: `Você atingiu o limite de ${SPORTPAGE_LIMIT} Sport Pages no seu plano.` };
    }

    const slug = generateSlug(data.fullName) + `-basic-${Date.now()}`;

    let photoUrl: string | undefined;
    if (data.photoDataUri) {
      photoUrl = await uploadAthletePhoto(slug, data.photoDataUri);
    }

    const html = await generateBasicSportpage({
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      sport: data.sport,
      isAmateur: data.isAmateur,
      details: data.details,
      achievements: data.achievements,
      team: data.team,
      contact: data.contact,
      instagramUrl: data.instagramUrl,
      facebookUrl: data.facebookUrl,
      tiktokUrl: data.tiktokUrl,
      photoUrl,
    });

    // Garante que a IA retornou HTML completo (com <html>, <body> e conteúdo mínimo)
    if (
      !html ||
      html.length < 1500 ||
      !/<html/i.test(html) ||
      !/<body[\s>]/i.test(html) ||
      !/<\/body>/i.test(html)
    ) {
      throw new Error(`IA retornou HTML incompleto (${html?.length ?? 0} chars, body ausente). Tente novamente.`);
    }

    await setPageContent(slug, html);
    await recordSportpageGenerated(session.uid, slug);
    return { presentation: html, presentationUrl: `/p/${slug}` };
  } catch (error: any) {
    console.error("createBasicPresentation error:", error);
    return { error: "Falha ao gerar Sport Page Básica." };
  }
}

// ─── Plus / Premium Plan ─────────────────────────────────────────────────────

interface CreateEnhancedSportpageData extends GenerateEnhancedSportpageInput {
  photoDataUri: string;
}

export async function createEnhancedSportpage(data: CreateEnhancedSportpageData) {
  try {
    const session = await getSession();
    if (!session || session.role !== "athlete") {
      return { error: "Sessão inválida. Faça login como atleta para gerar sua Sport Page." };
    }
    if (!hasActiveSubscription(session)) {
      return { error: "Assinatura necessária. Escolha um plano para gerar sua Sport Page." };
    }
    if (await hasReachedSportpageLimit(session.uid)) {
      return { error: `Você atingiu o limite de ${SPORTPAGE_LIMIT} Sport Pages no seu plano.` };
    }

    const { photoDataUri, ...athleteData } = data;
    const slug = generateSlug(data.fullName) + `-plus-${Date.now()}`;

    const photoUrl = await uploadAthletePhoto(slug, photoDataUri);
    // Composição automática do hero: troca o fundo pelo cenário da modalidade e
    // reilumina o atleta (FLUX Kontext via fal). Sem FAL_KEY ou em falha, devolve
    // a própria photoUrl — nunca bloqueia a geração. Ver src/lib/compose-hero.ts.
    const heroUrl = await composeAthleteHero(slug, photoUrl, data.sport);
    const sportpageHtml = await generateEnhancedSportpage(athleteData);
    if (
      !sportpageHtml ||
      sportpageHtml.length < 2000 ||
      !/<body[\s>]/i.test(sportpageHtml) ||
      !/<\/body>/i.test(sportpageHtml)
    ) {
      throw new Error(`AI retornou HTML incompleto (${sportpageHtml?.length ?? 0} chars). Tente novamente.`);
    }

    const finalHtml = sportpageHtml.split('__IMAGE_PLACEHOLDER__').join(heroUrl);
    await setPageContent(slug, finalHtml);
    await recordSportpageGenerated(session.uid, slug);
    return { sportpageHtml: finalHtml, sportpageUrl: `/p/${slug}` };
  } catch (error: any) {
    console.error("createEnhancedSportpage error:", error);
    return { error: `Falha ao gerar Sport Page: ${error.message}` };
  }
}

// ─── AI Test ─────────────────────────────────────────────────────────────────

export async function performAiConnectionTest() {
  // SEGURANÇA: diagnóstico consome cota paga do Gemini — restrito a admin
  // (Server Action é endpoint público; sem o gate, vira vetor de abuso de custo).
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { error: "Acesso restrito ao administrador." };
  }
  try {
    const result = await testAiConnection();
    return { message: result.message };
  } catch (error) {
    console.error("AI Connection Test Failed:", error);
    if (error instanceof Error) return { error: `AI Connection Failed: ${error.message}` };
    return { error: "An unknown error occurred during the AI connection test." };
  }
}
