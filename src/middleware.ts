import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/admin", "/company/dashboard", "/club/dashboard"];
const AUTH_PAGES = ["/athlete/login", "/company/login", "/club/login", "/signup", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Cookie setado por createSessionForIdToken (auth-actions.ts)
  const session = request.cookies.get("session")?.value;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));

  if (isProtected && !session) {
    const loginUrl = new URL("/athlete/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/company/dashboard/:path*",
    "/club/dashboard/:path*",
    "/athlete/login",
    "/company/login",
    "/club/login",
    "/signup",
    "/forgot-password",
  ],
};
