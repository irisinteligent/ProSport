'use server';

import { adminDb } from './firebase-admin';
import { cookies } from 'next/headers';
import admin from 'firebase-admin';

const USERS_COLLECTION = 'users';

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  userType: 'athlete' | 'company' | 'club';
  plan: 'basic' | 'plus' | 'premium';
  createdAt: string;
}

/** Cria sessao apos login (salva UID em cookie httpOnly) */
export async function createSession(idToken: string) {
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const cookieStore = await cookies();
    cookieStore.set('__session', decoded.uid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    });
    return { uid: decoded.uid };
  } catch (error) {
    console.error('createSession error:', error);
    throw new Error('Token invalido');
  }
}

/** Remove sessao (logout) */
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('__session');
}

/** Retorna UID da sessao atual */
export async function getSessionUid(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('__session')?.value ?? null;
}

/** Cria perfil do usuario no Firestore apos cadastro */
export async function createUserProfile(data: {
  uid: string;
  email: string;
  fullName: string;
  userType: 'athlete' | 'company' | 'club';
}) {
  const profile: UserProfile = {
    ...data,
    plan: 'basic',
    createdAt: new Date().toISOString(),
  };
  await adminDb.collection(USERS_COLLECTION).doc(data.uid).set(profile);
}

/** Busca perfil do usuario logado */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const uid = await getSessionUid();
  if (!uid) return null;
  const snap = await adminDb.collection(USERS_COLLECTION).doc(uid).get();
  if (!snap.exists) return null;
  return snap.data() as UserProfile;
}

/** Atualiza o plano do usuario */
export async function updateUserPlan(uid: string, plan: 'basic' | 'plus' | 'premium') {
  await adminDb.collection(USERS_COLLECTION).doc(uid).update({ plan });
}

/** Conta totais para o admin */
export async function getAdminStats() {
  const usersSnap = await adminDb.collection(USERS_COLLECTION).get();
  const pagesSnap = await adminDb.collection('sportpages').get();

  const total = usersSnap.size;
  const plus = usersSnap.docs.filter(d => d.data().plan === 'plus').length;
  const premium = usersSnap.docs.filter(d => d.data().plan === 'premium').length;

  return { totalAthletes: total, totalPages: pagesSnap.size, plusCount: plus, premiumCount: premium };
}
