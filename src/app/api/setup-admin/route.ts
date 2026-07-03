import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

/**
 * Rota administrativa de uso único (promover a conta do dono a admin).
 *
 * SEGURANÇA: o secret NÃO fica mais hardcoded no código (estava commitado no
 * git, o que tornava a rota um backdoor). Agora só funciona se a env var
 * ADMIN_SETUP_SECRET estiver definida na Vercel. Sem a variável, a rota
 * responde 410 e fica efetivamente desativada — que é o estado recomendado.
 */
export async function GET(req: NextRequest) {
  const expected = process.env.ADMIN_SETUP_SECRET;
  if (!expected) {
    return NextResponse.json({ error: 'route disabled' }, { status: 410 });
  }
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const email = process.env.ADMIN_SETUP_EMAIL;
  if (!email) {
    return NextResponse.json({ error: 'ADMIN_SETUP_EMAIL não configurado' }, { status: 400 });
  }

  try {
    const userRecord = await adminAuth.getUserByEmail(email);
    const uid = userRecord.uid;

    await adminDb.collection('users').doc(uid).set(
      {
        uid,
        email,
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
