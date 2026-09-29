import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { AdminSession } from "@/types/auth";

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "default-dev-secret-key-at-least-32-chars-long!"
);

const COOKIE_NAME = "mykit_admin_session";

export async function createAdminSession(email: string): Promise<string> {
  const token = await new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return token;
}

export async function verifyAdminSessionToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role === "admin" && typeof payload.email === "string") {
      return {
        email: payload.email,
        role: "admin",
        iat: payload.iat,
        exp: payload.exp,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyAdminSessionToken(token);
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const expectedEmail = process.env.ADMIN_EMAIL || "admin@mykit.com";
  const expectedPassword = process.env.ADMIN_PASSWORD || "AdminSecure@123";

  return email.toLowerCase() === expectedEmail.toLowerCase() && password === expectedPassword;
}
