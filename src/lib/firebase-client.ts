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

// getAuth() valida a apiKey e LANÇA auth/invalid-api-key se ela faltar. Isso não
// pode derrubar a página inteira: o login por e-mail roda no servidor (sem este
// SDK) e precisa continuar funcionando. Por isso: inicializamos só no navegador
// e protegemos com try/catch — se o Auth do cliente falhar, apenas o "Continuar
// com Google" fica indisponível; o resto da tela de login segue de pé.
let _auth: Auth | undefined;
if (typeof window !== 'undefined') {
  try {
    _auth = getAuth(app);
  } catch (err) {
    console.error('[firebase-client] falha ao inicializar o Auth do navegador:', err);
  }
}
export const auth = _auth as Auth;
