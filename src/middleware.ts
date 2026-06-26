import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/admin", "/company/dashboard", "/club/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("__session")?.value ?? request.cookies.get("session")?.value;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));

  // Protege rotas privadas: sem cookie → redireciona para login
  if (isProtected && !session) {
    const loginUrl = new URL("/athlete/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // NÃO redireciona das páginas de auth mesmo com cookie presente.
  // O servidor valida o token ao carregar /dashboard e redireciona se expirado.
  // Isso evita loop: cookie expirado → /dashboard rejeita → /athlete/login redireciona → loop.

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/company/dashboard/:path*",
    "/club/dashboard/:path*",
  ],
};
