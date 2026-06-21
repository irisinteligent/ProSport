import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccount) {
    // Vercel: usa service account JSON da env var
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccount)),
      storageBucket: 'prosport-portfolio.firebasestorage.app',
    });
  } else {
    // Cloud Run / Firebase App Hosting: credenciais automaticas
    admin.initializeApp({
      storageBucket: 'prosport-portfolio.firebasestorage.app',
    });
  }
}

export const adminDb = admin.firestore();
