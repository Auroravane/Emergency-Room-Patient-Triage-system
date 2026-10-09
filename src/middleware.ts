import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/triage", "/dashboard"];
const AUTH_ROUTES = ["/login"];

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    // Check for standard Better Auth session token or generic session cookies
    const sessionCookie =
      request.cookies.get("better-auth.session_token") ||
      request.cookies.get("__Secure-better-auth.session_token") ||
      request.cookies.get("er_session");

    const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
    const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));

    if (isProtected && !sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAuthRoute && sessionCookie) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } catch (e) {
    console.error("Middleware error:", e);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/triage/:path*", "/dashboard/:path*", "/login"],
};
