import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that do NOT require a JWT
const PUBLIC_PATHS = ["/account/login", "/static/"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some(p => pathname.toLowerCase().startsWith(p))) {
    return NextResponse.next();
  }

  const jwt = request.cookies.get("jwt");

  if (!jwt || !jwt.value) {
    const url = request.nextUrl.clone();
    url.pathname = "/account/login";
    return NextResponse.redirect(url);
  }

  // Keep going
  return NextResponse.next();
}

// Apply the middleware to all routes
export const config = {
  matcher: "/admin/:path*"
};
