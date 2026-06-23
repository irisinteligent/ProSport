import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

if (!getApps().length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
  if (serviceAccount) {
    // Vercel: usa service account JSON da env var
    initializeApp({
      credential: cert(JSON.parse(serviceAccount)),
      ...(storageBucket ? { storageBucket } : {}),
    });
  } else {
    // Cloud Run / Firebase App Hosting: credenciais automáticas
    initializeApp(storageBucket ? { storageBucket } : undefined);
  }
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();
export const adminStorage = getStorage();
