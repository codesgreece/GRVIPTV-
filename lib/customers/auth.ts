import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "grvip_admin_session";
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

function getPassword() {
  return process.env.ADMIN_GR_PASSWORD?.trim() || "";
}

function getSigningKey() {
  return process.env.ADMIN_GR_SECRET?.trim() || getPassword() || "grvip-admin-dev-only";
}

export function isAdminPasswordConfigured() {
  return getPassword().length >= 4;
}

export function adminAuthRequired() {
  return Boolean(process.env.VERCEL) || process.env.NODE_ENV === "production";
}

export function verifyAdminPassword(password: string) {
  const expected = getPassword();
  if (!expected) return !adminAuthRequired();

  const left = Buffer.from(password);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function createAdminSessionValue() {
  const expires = Date.now() + SESSION_MS;
  const payload = String(expires);
  const signature = createHmac("sha256", getSigningKey()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function isAdminSessionValid(value: string | undefined) {
  if (!value) return !adminAuthRequired() && !isAdminPasswordConfigured();

  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;

  const expected = createHmac("sha256", getSigningKey()).update(payload).digest("base64url");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  if (!timingSafeEqual(left, right)) return false;

  const expires = Number(payload);
  return Number.isFinite(expires) && expires > Date.now();
}

export async function isAdminAuthenticated() {
  if (!adminAuthRequired() && !isAdminPasswordConfigured()) return true;

  const jar = await cookies();
  return isAdminSessionValid(jar.get(ADMIN_COOKIE)?.value);
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
