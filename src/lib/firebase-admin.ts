import admin from 'firebase-admin';

// Inicializa o Firebase Admin SDK uma única vez (singleton).
// No Firebase App Hosting (Cloud Run) as credenciais são detectadas automaticamente.
if (!admin.apps.length) {
  admin.initializeApp();
}

export const adminDb = admin.firestore();
