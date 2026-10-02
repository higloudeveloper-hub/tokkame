import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "crypto";

const SECRET = process.env.SESSION_SECRET || "tokkame-dev-secret-change-me";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const verify = scryptSync(password, salt, 32);
  const left = Buffer.from(hash, "hex");
  if (left.length !== verify.length) return false;
  return timingSafeEqual(left, verify);
}

export function signSession(userId: string) {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 14;
  const payload = `${userId}.${exp}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function readSessionToken(token: string | undefined) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, exp, sig] = parts;
  const payload = `${userId}.${exp}`;
  const expected = createHmac("sha256", SECRET).update(payload).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(exp) < Date.now()) return null;
  return userId;
}

export function uid(prefix: string) {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}
