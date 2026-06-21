import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ATHLETE   = ['/dashboard'];
const PROTECTED_COMPANY   = ['/company/dashboard'];
const PROTECTED_CLUB      = ['/club/dashboard'];
const PROTECTED_ADMIN     = ['/admin'];
const AUTH_PAGES          = ['/athlete/login', '/company/login', '/club/login', '/signup', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('__session')?.value;

  const isProtected =
    [...PROTECTED_ATHLETE, ...PROTECTED_COMPANY, ...PROTECTED_CLUB, ...PROTECTED_ADMIN]
      .some((p) => pathname.startsWith(p));

  // Rota protegida sem sessao → redireciona para login
  if (isProtected && !session) {
    const loginUrl = new URL('/athlete/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Ja logado tentando acessar pagina de auth → redireciona para dashboard
  if (session && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/company/dashboard/:path*',
    '/club/dashboard/:path*',
    '/athlete/login',
    '/company/login',
    '/club/login',
    '/signup',
    '/forgot-password',
  ],
};
