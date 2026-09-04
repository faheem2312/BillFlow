import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const isHttps = req.nextUrl.protocol === "https:" || req.headers.get("x-forwarded-proto") === "https";

  let token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie: isHttps,
  });

  if (!token) {
    token = await getToken({
      req,
      secret: process.env.AUTH_SECRET,
      secureCookie: !isHttps,
    });
  }

  const { pathname } = req.nextUrl;

  const protectedRoutes = ["/dashboard", "/clients", "/invoices", "/settings"];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if ((pathname === "/login" || pathname === "/register") && token) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/clients/:path*", "/invoices/:path*", "/settings/:path*", "/login", "/register"],
};