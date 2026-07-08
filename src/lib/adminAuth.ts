import crypto from "crypto";

/**
 * Minimal, dependency-free admin session auth. A session cookie is an
 * `issuedAt.HMAC(issuedAt)` pair signed with ADMIN_PASSWORD as the key, so it
 * cannot be forged without the password and expires after MAX_AGE.
 *
 * SECURITY: there is deliberately no default password. Until ADMIN_PASSWORD is
 * set in the environment, login always fails and every session is invalid.
 */
export const ADMIN_COOKIE = "radiance_admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

export function isAdminConfigured(): boolean {
  return secret().length > 0;
}

export function checkPassword(password: string): boolean {
  const s = secret();
  if (!s) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(s);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function sign(issuedAt: number): string {
  return crypto.createHmac("sha256", secret()).update(String(issuedAt)).digest("hex");
}

export function createSessionToken(): string {
  const iat = Date.now();
  return `${iat}.${sign(iat)}`;
}

export function verifySessionToken(token?: string | null): boolean {
  if (!token || !isAdminConfigured()) return false;
  const [iatStr, sig] = token.split(".");
  const iat = Number(iatStr);
  if (!iatStr || !sig || !Number.isFinite(iat)) return false;
  if (Date.now() - iat > ADMIN_COOKIE_MAX_AGE * 1000) return false;
  const expected = sign(iat);
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}
