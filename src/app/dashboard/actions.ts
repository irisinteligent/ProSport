"use server";

import { generateSponsorPresentation } from "@/ai/flows/generate-sponsor-presentation";
import type { GenerateSponsorPresentationInput } from "@/ai/flows/types";
import { setPageContent } from "@/lib/storage";
import { uploadAthletePhoto } from "@/lib/upload-photo";
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
}

export async function createBasicPresentation(data: CreateBasicSportpageData) {
  try {
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
    const { photoDataUri, ...athleteData } = data;
    const slug = generateSlug(data.fullName) + `-plus-${Date.now()}`;

    const photoUrl = await uploadAthletePhoto(slug, photoDataUri);
    const sportpageHtml = await generateEnhancedSportpage(athleteData);
    if (
      !sportpageHtml ||
      sportpageHtml.length < 2000 ||
      !/<body[\s>]/i.test(sportpageHtml) ||
      !/<\/body>/i.test(sportpageHtml)
    ) {
      throw new Error(`AI retornou HTML incompleto (${sportpageHtml?.length ?? 0} chars). Tente novamente.`);
    }

    const finalHtml = sportpageHtml.replace('__IMAGE_PLACEHOLDER__', photoUrl);
    await setPageContent(slug, finalHtml);
    return { sportpageHtml: finalHtml, sportpageUrl: `/p/${slug}` };
  } catch (error: any) {
    console.error("createEnhancedSportpage error:", error);
    return { error: `Falha ao gerar Sport Page: ${error.message}` };
  }
}

// ─── AI Test ─────────────────────────────────────────────────────────────────

export async function performAiConnectionTest() {
  try {
    const result = await testAiConnection();
    return { message: result.message };
  } catch (error) {
    console.error("AI Connection Test Failed:", error);
    if (error instanceof Error) return { error: `AI Connection Failed: ${error.message}` };
    return { error: "An unknown error occurred during the AI connection test." };
  }
}
