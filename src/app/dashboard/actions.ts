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

    // Garante que a IA retornou HTML válido (mínimo de 500 chars com tag html/body)
    if (!html || html.length < 500 || !/<html/i.test(html)) {
      throw new Error(`IA retornou conteúdo inválido (${html?.length ?? 0} chars). Tente novamente.`);
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
    if (!sportpageHtml) throw new Error("AI did not return HTML content.");

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
