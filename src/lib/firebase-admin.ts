import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
  if (serviceAccount) {
    // Vercel: usa service account JSON da env var
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccount)),
      ...(storageBucket ? { storageBucket } : {}),
    });
  } else {
    // Cloud Run / Firebase App Hosting: credenciais automáticas
    admin.initializeApp(storageBucket ? { storageBucket } : undefined);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
