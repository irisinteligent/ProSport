// Chamadas server-side à Identity Toolkit API (REST) do Firebase Auth,
// para as operações que o Admin SDK não cobre (verificar senha, enviar
// e-mail de redefinição). Usa a Web API Key do projeto (FIREBASE_WEB_API_KEY) —
// não é um segredo do ponto de vista do Firebase, mas é usada só no servidor aqui.

const IDENTITY_TOOLKIT_BASE = "https://identitytoolkit.googleapis.com/v1";

function getApiKey(): string {
  const key = process.env.FIREBASE_WEB_API_KEY;
  if (!key) {
    throw new Error(
      "FIREBASE_WEB_API_KEY não está configurada. Veja CLAUDE.md (Variáveis de Ambiente)."
    );
  }
  return key;
}

type IdentityToolkitError = {
  error?: { message?: string };
};

async function identityToolkitRequest<T>(
  method: string,
  body: Record<string, unknown>
): Promise<T> {
  const res = await fetch(
    `${IDENTITY_TOOLKIT_BASE}/accounts:${method}?key=${getApiKey()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    const code = (data as IdentityToolkitError).error?.message ?? "UNKNOWN_ERROR";
    throw new Error(code);
  }

  return data as T;
}

type SignInResult = {
  idToken: string;
  localId: string;
  email: string;
};

export async function signInWithPassword(
  email: string,
  password: string
): Promise<SignInResult> {
  return identityToolkitRequest<SignInResult>("signInWithPassword", {
    email,
    password,
    returnSecureToken: true,
  });
}

export async function signInWithCustomToken(token: string): Promise<SignInResult> {
  return identityToolkitRequest<SignInResult>("signInWithCustomToken", {
    token,
    returnSecureToken: true,
  });
}

export async function sendPasswordResetEmail(email: string): Promise<void> {
  await identityToolkitRequest("sendOobCode", {
    requestType: "PASSWORD_RESET",
    email,
  });
}
