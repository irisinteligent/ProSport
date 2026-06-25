import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminDb } from "@/lib/firebase-admin";

const SECRET = "prosport-admin-setup-2026";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const pw = req.nextUrl.searchParams.get("pw");
  if (secret !== SECRET || !pw) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const userRecord = await getAuth().getUserByEmail("irismarketingdigital@gmail.com");
    await getAuth().updateUser(userRecord.uid, { password: pw });
    await adminDb.collection("users").doc(userRecord.uid).set({ role: "admin", plan: "premium" }, { merge: true });
    return NextResponse.json({ success: true, message: "senha e role definidos" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
