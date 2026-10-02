import { cookies } from "next/headers";
import { readSessionToken, signSession } from "./password";
import { findUserById, readDb } from "./store";
import type { SessionView, User } from "./types";

const SESSION = "tokkame_session";
export const AGE_COOKIE = "tokkame_age";

export async function setSession(userId: string) {
  const jar = await cookies();
  jar.set(SESSION, signSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION);
}

export async function confirmAgeCookie() {
  const jar = await cookies();
  jar.set(AGE_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function hasAgeCookie() {
  const jar = await cookies();
  return jar.get(AGE_COOKIE)?.value === "1";
}

export async function getSessionUser() {
  const jar = await cookies();
  const id = readSessionToken(jar.get(SESSION)?.value);
  if (!id) return null;
  const user = findUserById(readDb(), id);
  if (!user || user.suspended) return null;
  return user;
}

export function sessionView(user: User): SessionView {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    balance: user.balance,
    verified: user.verified,
    avatarHue: user.avatarHue,
  };
}
