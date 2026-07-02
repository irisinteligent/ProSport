import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN     ?? 'prosport-portfolio.firebaseapp.com',
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID       ?? 'prosport-portfolio',
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET   ?? 'prosport-portfolio.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// getAuth() valida a apiKey e LANÇA se ela faltar — isso quebrava o `next build`
// ao pré-renderizar as páginas de login (erro auth/invalid-api-key no servidor).
// O SDK de auth do navegador só é usado no clique de "login com Google", então
// inicializamos apenas no cliente. No servidor `auth` fica indefinido (não é usado lá).
export const auth: Auth =
  typeof window !== 'undefined' ? getAuth(app) : (undefined as unknown as Auth);
