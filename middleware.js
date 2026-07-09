import { NextResponse } from "next/server";
import { verifySessionToken, ADMIN_SESSION_COOKIE } from "@/lib/auth";

const MUTATING_METHODS = new Set(["POST", "DELETE", "PATCH", "PUT"]);

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isAdminLoginPage = pathname === "/admin/login";
  const isAdminPage = pathname.startsWith("/admin") && !isAdminLoginPage;
  const isProtectedApiMutation =
    pathname.startsWith("/api/portfolio-upload") && MUTATING_METHODS.has(request.method);

  // Everything else (public site, GET requests for listing portfolio items, etc.) passes through.
  if (!isAdminPage && !isProtectedApiMutation) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isAuthenticated = await verifySessionToken(token);

  if (isAuthenticated) {
    return NextResponse.next();
  }

  if (isAdminPage) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.json(
    { success: false, message: "Unauthorized. Please log in as an admin." },
    { status: 401 }
  );
}

export const config = {
  matcher: ["/admin/:path*", "/api/portfolio-upload/:path*"],
};
