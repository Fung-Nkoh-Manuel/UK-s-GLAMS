// lib/auth.js
//
// Lightweight, dependency-free session tokens for the admin area.
// Uses the Web Crypto API (crypto.subtle) so it works in both the
// Node.js runtime (API routes) and the Edge runtime (middleware)
// without pulling in extra packages like jsonwebtoken or bcrypt.

const encoder = new TextEncoder();
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

async function getKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Creates a signed session token: `${issuedAt}.${signatureHex}`
 * The token has no server-side state to check (no DB/session store needed).
 */
export async function createSessionToken() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set");
  }

  const issuedAt = Date.now().toString();
  const key = await getKey(secret);
  const signature = toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(issuedAt)));

  return `${issuedAt}.${signature}`;
}

/**
 * Verifies a session token's signature and expiry.
 * Returns true/false — never throws on malformed input.
 */
export async function verifySessionToken(token) {
  if (!token || typeof token !== "string") return false;

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;

  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature) return false;

  const issuedAtNum = Number(issuedAt);
  if (!Number.isFinite(issuedAtNum)) return false;
  if (Date.now() - issuedAtNum > SESSION_MAX_AGE_MS) return false;

  try {
    const key = await getKey(secret);
    const expected = toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(issuedAt)));
    return timingSafeEqual(expected, signature);
  } catch {
    return false;
  }
}

export const ADMIN_SESSION_COOKIE = "admin_session";
