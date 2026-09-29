import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "default-dev-secret-key-at-least-32-chars-long!"
);

const COOKIE_NAME = "mykit_admin_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if accessing admin UI routes
  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  // Check if accessing admin API routes
  const isAdminApiRoute = pathname.startsWith("/api/admin") && pathname !== "/api/admin/login";

  if (isAdminRoute || isAdminApiRoute) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    let isAuthenticated = false;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        if (payload.role === "admin") {
          isAuthenticated = true;
        }
      } catch {
        isAuthenticated = false;
      }
    }

    if (!isAuthenticated) {
      if (isAdminApiRoute) {
        return NextResponse.json(
          {
            success: false,
            error: { message: "Unauthorized. Admin session required." },
          },
          { status: 401 }
        );
      }

      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
