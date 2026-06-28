import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

// Rota temporária de uso único — DELETAR APÓS USAR
const SECRET = 'prosport-admin-setup-2026';

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    // Busca o UID pelo email
    const userRecord = await adminAuth.getUserByEmail('irismarketingdigital@gmail.com');
    const uid = userRecord.uid;

    // Cria ou atualiza o documento no Firestore
    await adminDb.collection('users').doc(uid).set(
      {
        uid,
        email: 'irismarketingdigital@gmail.com',
        name: 'Beto Admin',
        role: 'admin',
        plan: 'premium',
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true, uid, message: 'role=admin definido com sucesso' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
