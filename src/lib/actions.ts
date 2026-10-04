"use server";

import fs from "fs";
import path from "path";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearSession, confirmAgeCookie, getSessionUser, setSession } from "./auth";
import { hashPassword, uid, verifyPassword } from "./password";
import { CATEGORIES, cents, REGIONS } from "./format";
import { getLang } from "./lang";
import { FILTERS, RETOS, TRACKS } from "./kit";
import { nightKey } from "./nights";
import { cleanText, SAFETY_ERROR, violatesSafety } from "./safety";
import {
  activeSub,
  addTopup,
  canViewPost,
  CHAIR_PRICE,
  chargePlatform,
  DEFAULT_TIERS,
  earnings,
  findCreator,
  findUserByLogin,
  isFollowing,
  LINE_GOAL,
  lineSeats,
  mutate,
  OPEN_PRICE,
  readDb,
  uploadDir,
  SEAT_PRICE,
  spend,
} from "./store";
import type { DropKind, Motif, TierId, Visibility } from "./types";

function checkoutNote(base: string, formData: FormData) {
  const method = String(formData.get("method") || "");
  const label = method === "apple" ? "Apple Pay" : method === "card" ? "Card" : method === "paypal" ? "PayPal" : "";
  return label ? `${base} · ${label}` : base;
}

const RESERVED = new Set([
  "admin",
  "support",
  "tokkame",
  "help",
  "login",
  "signup",
  "feed",
  "discover",
  "wallet",
  "dashboard",
  "messages",
  "subscriptions",
  "rules",
  "creator",
  "api",
  "media",
  "drops",
]);

async function bounce(extra?: Record<string, string>): Promise<never> {
  const h = await headers();
  const ref = h.get("referer");
  const host = h.get("x-forwarded-host") || h.get("host");
  let pathname = "/feed";
  const params = new URLSearchParams();
  if (ref && host) {
    try {
      const url = new URL(ref);
      if (url.host === host) {
        pathname = url.pathname;
        url.searchParams.forEach((value, key) => {
          if (key !== "error" && key !== "ok") params.set(key, value);
        });
      }
    } catch {
      pathname = "/feed";
    }
  }
  if (extra) {
    for (const [key, value] of Object.entries(extra)) params.set(key, value);
  }
  revalidatePath("/", "layout");
  const query = params.toString();
  redirect(query ? `${pathname}?${query}` : pathname);
}

function safeOrBounce(text: string) {
  if (violatesSafety(text)) return true;
  return false;
}

export async function confirmAge() {
  await confirmAgeCookie();
  redirect("/");
}

export async function logout() {
  await clearSession();
  redirect("/");
}

export async function login(formData: FormData) {
  const loginValue = String(formData.get("login") || "");
  const password = String(formData.get("password") || "");
  const db = readDb();
  const user = findUserByLogin(db, loginValue);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    await bounce({ error: "Correo o contraseña incorrectos." });
  }
  if (user!.suspended) await bounce({ error: "Esta cuenta está suspendida." });
  await setSession(user!.id);
  redirect(user!.role === "creator" ? "/dashboard" : "/feed");
}

const WELCOME_CREDITS = "13 créditos de registro";

export async function signInProvider(formData: FormData) {
  const provider = String(formData.get("provider") || "");
  if (provider !== "google" && provider !== "apple") await bounce({ error: "Elige Google o Apple." });
  const db = readDb();
  const user = db.users.find((item) => item.email === "sofia@tokkame.app" && !item.suspended);
  if (!user) await bounce({ error: "No hay una cuenta de demostración." });
  const account = user!;
  const next = safeNext(String(formData.get("next") || ""));
  if (next.startsWith("/call/")) {
    await mutate((store) => {
      const fan = store.users.find((item) => item.id === account.id);
      const already = store.transactions.some((item) => item.toUserId === account.id && item.note === WELCOME_CREDITS);
      if (fan && !already) addTopup(store, fan, 13, WELCOME_CREDITS);
    });
  }
  await confirmAgeCookie();
  await setSession(account.id);
  redirect(next || "/");
}

export async function continueAsGuest(formData: FormData) {
  const next = safeNext(String(formData.get("next") || ""));
  const passwordHash = hashPassword(uid("guest"));
  const created = await mutate((db) => {
    const id = uid("usr");
    const stamp = id.slice(-6).toLowerCase();
    db.users.push({
      id,
      email: `guest.${stamp}@tokkame.app`,
      passwordHash,
      username: `guest.${stamp}`,
      displayName: "Guest",
      role: "fan",
      bio: "",
      categories: [],
      region: null,
      shareRegion: false,
      avatarHue: 0,
      bannerHue: 0,
      tiers: [],
      verified: "none",
      verificationNote: "",
      ageConfirmedAt: new Date().toISOString(),
      balance: 0,
      messagePrice: 0,
      referredBy: null,
      suspended: false,
      createdAt: new Date().toISOString(),
    });
    return id;
  });
  await confirmAgeCookie();
  await setSession(created);
  redirect(next || "/");
}

export async function signup(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const username = String(formData.get("username") || "").trim().toLowerCase();
  const displayName = cleanText(String(formData.get("displayName") || ""), 40);
  const password = String(formData.get("password") || "");
  const asCreator = String(formData.get("role") || "") === "creator";
  const age = formData.get("age") === "on";
  const ref = String(formData.get("ref") || "").trim().toLowerCase();

  if (!age) await bounce({ error: "Tienes que confirmar que tienes 18 años o más." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) await bounce({ error: "Escribe un correo válido." });
  if (!/^[a-z0-9._]{3,20}$/.test(username) || RESERVED.has(username)) {
    await bounce({ error: "El usuario debe tener 3 a 20 caracteres: letras, números, punto o guion bajo." });
  }
  if (displayName.length < 2) await bounce({ error: "Escribe tu nombre público." });
  if (password.length < 8) await bounce({ error: "La contraseña necesita al menos 8 caracteres." });
  if (safeOrBounce(`${displayName} ${username}`)) await bounce({ error: SAFETY_ERROR });

  const passwordHash = hashPassword(password);
  const result = await mutate((db) => {
    if (db.users.some((user) => user.email === email || user.username === username)) {
      return { error: "Ese correo o usuario ya existe." };
    }
    const referrer = ref ? db.users.find((user) => user.username === ref && user.role === "creator") : null;
    const id = uid("usr");
    db.users.push({
      id,
      email,
      passwordHash,
      username,
      displayName,
      role: asCreator ? "creator" : "fan",
      bio: "",
      categories: [],
      region: null,
      shareRegion: false,
      avatarHue: Math.floor(Math.random() * 360),
      bannerHue: Math.floor(Math.random() * 360),
      tiers: asCreator ? DEFAULT_TIERS.map((tier) => ({ ...tier, perks: [...tier.perks] })) : [],
      verified: asCreator ? "pending" : "none",
      verificationNote: "",
      ageConfirmedAt: new Date().toISOString(),
      balance: 100,
      messagePrice: 0,
      referredBy: referrer?.id ?? null,
      suspended: false,
      createdAt: new Date().toISOString(),
    });
    return { id, creator: asCreator };
  });
  if ("error" in result && result.error) await bounce({ error: result.error });
  await setSession(result.id!);
  const next = safeNext(String(formData.get("next") || ""));
  redirect(result.creator ? "/dashboard?ok=cuenta" : next || "/feed?ok=cuenta");
}

function safeNext(value: string) {
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://")) return "";
  return value;
}

export async function follow(formData: FormData) {
  const me = await getSessionUser();
  if (!me) await bounce({ error: "Entra para seguir creadores." });
  const creatorId = String(formData.get("creatorId") || "");
  const result = await mutate((db) => {
    const creator = db.users.find((user) => user.id === creatorId && !user.suspended);
    if (!creator || creator.id === me!.id) return { error: "No se puede seguir ese perfil." };
    const existing = db.follows.find((item) => item.userId === me!.id && item.creatorId === creatorId);
    if (existing) {
      db.follows = db.follows.filter((item) => item !== existing);
      return { ok: "dejas" };
    }
    db.follows.push({ userId: me!.id, creatorId, createdAt: new Date().toISOString() });
    return { ok: "sigues" };
  });
  if ("error" in result && result.error) await bounce({ error: result.error });
  await bounce({ ok: "ok" in result && result.ok ? result.ok : "listo" });
}

export async function subscribe(formData: FormData) {
  const me = await getSessionUser();
  if (!me) await bounce({ error: "Entra para suscribirte." });
  const creatorId = String(formData.get("creatorId") || "");
  const tier = String(formData.get("tier") || "") as TierId;
  if (!["inner", "vip", "elite"].includes(tier)) await bounce({ error: "Elige un nivel." });
  const result = await mutate((db) => {
    const fan = db.users.find((user) => user.id === me!.id)!;
    const creator = db.users.find((user) => user.id === creatorId && user.role === "creator");
    if (!creator || creator.id === fan.id) return { error: "No puedes suscribirte a ese perfil." };
    if (creator.verified !== "verified") return { error: "Este creador todavía no puede cobrar." };
    const chosen = creator.tiers.find((item) => item.id === tier);
    if (!chosen) return { error: "Ese nivel no existe." };
    const current = activeSub(db, fan.id, creator.id);
    if (current?.tier === tier) return { error: "Ya estás en ese nivel." };
    const paid = spend(db, fan, creator, chosen.price, "subscription", checkoutNote(chosen.name, formData));
    if (!paid.ok) return paid;
    if (current) current.status = "canceled";
    const now = new Date();
    db.subscriptions.push({
      id: uid("sub"),
      userId: fan.id,
      creatorId: creator.id,
      tier,
      price: chosen.price,
      status: "active",
      startedAt: now.toISOString(),
      renewsAt: new Date(now.getTime() + 30 * 86400000).toISOString(),
    });
    return { ok: "suscripcion" as const };
  });
  if ("error" in result && result.error) await bounce({ error: result.error });
  await bounce({ ok: "suscripcion" });
}

export async function cancelSubscription(formData: FormData) {
  const me = await getSessionUser();
  if (!me) await bounce({ error: "Entra para administrar suscripciones." });
  const id = String(formData.get("id") || "");
  await mutate((db) => {
    const sub = db.subscriptions.find((item) => item.id === id && item.userId === me!.id);
    if (sub) sub.status = "canceled";
  });
  await bounce({ ok: "cancelada" });
}

export async function tip(formData: FormData) {
  const me = await getSessionUser();
  if (!me) await bounce({ error: "Entra para enviar una propina." });
  const creatorId = String(formData.get("creatorId") || "");
  const amount = Number(formData.get("amount"));
  if (![5, 10, 25, 50].includes(amount)) await bounce({ error: "Elige 5, 10, 25 o 50." });
  const result = await mutate((db) => {
    const fan = db.users.find((user) => user.id === me!.id)!;
    const creator = db.users.find((user) => user.id === creatorId && user.role === "creator");
    if (!creator || creator.id === fan.id) return { error: "No puedes enviarte una propina." };
    if (creator.verified !== "verified") return { error: "Este creador todavía no puede cobrar." };
    return spend(db, fan, creator, amount, "tip", checkoutNote("Propina", formData));
  });
  if ("error" in result && result.error) await bounce({ error: result.error });
  await bounce({ ok: "propina" });
}

const CALL_HOUR = 13;

function callBack(username: string) {
  return `/call/${username}`;
}

export async function askCall(formData: FormData) {
  const username = String(formData.get("username") || "");
  const back = callBack(username);
  const me = await getSessionUser();
  if (!me) redirect(`/signup?next=${encodeURIComponent(back)}`);
  const note = cleanText(String(formData.get("note") || ""), 240);
  const es = (await getLang()) === "es";
  if (note.length < 8) redirect(`${back}?error=${encodeURIComponent(es ? "Primero escríbele una nota." : "Write her a note first.")}`);
  if (violatesSafety(note)) redirect(`${back}?error=${encodeURIComponent(SAFETY_ERROR)}`);
  const result = await mutate((db) => {
    const fan = db.users.find((user) => user.id === me!.id)!;
    const creator = db.users.find((user) => user.username === username && user.role === "creator");
    if (!creator || creator.id === fan.id) return { error: es ? "Esa llamada no está disponible." : "That call is not available." };
    if (creator.verified !== "verified") return { error: es ? "Ella todavía no está verificada para recibir llamadas." : "She is not verified to take calls yet." };
    if (!db.callAsks) db.callAsks = [];
    const open = db.callAsks.find(
      (item) => item.fanId === fan.id && item.creatorId === creator.id && (item.status === "pending" || item.status === "declined"),
    );
    if (open) {
      open.note = note;
      open.status = "pending";
      open.createdAt = new Date().toISOString();
      return { ok: true as const };
    }
    const accepted = db.callAsks.find(
      (item) => item.fanId === fan.id && item.creatorId === creator.id && item.status === "accepted",
    );
    if (accepted) return { ok: true as const };
    db.callAsks.push({
      id: uid("ask"),
      fanId: fan.id,
      creatorId: creator.id,
      note,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    return { ok: true as const };
  });
  if ("error" in result && result.error) redirect(`${back}?error=${encodeURIComponent(result.error)}`);
  redirect(back);
}

export async function answerCall(formData: FormData) {
  const me = await getSessionUser();
  if (!me || me.role !== "creator") redirect("/login");
  const askId = String(formData.get("askId") || "");
  const decision = String(formData.get("decision") || "");
  if (decision !== "accepted" && decision !== "declined") redirect("/dashboard");
  await mutate((db) => {
    const ask = db.callAsks?.find((item) => item.id === askId && item.creatorId === me.id && item.status === "pending");
    if (ask) ask.status = decision;
  });
  redirect("/dashboard?ok=llamada");
}

export async function sandboxHear(formData: FormData) {
  const username = String(formData.get("username") || "");
  const back = callBack(username);
  const me = await getSessionUser();
  if (!me) redirect(`/signup?next=${encodeURIComponent(back)}`);
  await mutate((db) => {
    const creator = db.users.find((user) => user.username === username && user.role === "creator");
    if (!creator) return;
    const ask = db.callAsks?.find(
      (item) => item.fanId === me.id && item.creatorId === creator.id && item.status === "pending",
    );
    if (!ask) return;
    if (Date.now() - new Date(ask.createdAt).getTime() < 18000) return;
    ask.status = "accepted";
  });
  redirect(back);
}

export async function startCall(formData: FormData) {
  const username = String(formData.get("username") || "");
  const back = callBack(username);
  const me = await getSessionUser();
  if (!me) redirect(`/signup?next=${encodeURIComponent(back)}`);
  const esCall = (await getLang()) === "es";
  const result = await mutate((db) => {
    const fan = db.users.find((user) => user.id === me!.id)!;
    const creator = db.users.find((user) => user.username === username && user.role === "creator");
    if (!creator || creator.id === fan.id) return { error: esCall ? "Esa llamada no está disponible." : "That call is not available." };
    if (creator.verified !== "verified") return { error: esCall ? "Ella todavía no está verificada para recibir llamadas." : "She is not verified to take calls yet." };
    if (!db.calls) db.calls = [];
    const now = Date.now();
    const hour = 60 * 60 * 1000;
    const open = db.calls.find((item) => item.fanId === fan.id && item.creatorId === creator.id && new Date(item.paidUntil).getTime() > now);
    if (!open) {
      const ask = db.callAsks?.find((item) => item.fanId === fan.id && item.creatorId === creator.id && item.status === "accepted");
      if (!ask) return { error: esCall ? "Ella todavía no aceptó esta llamada." : "She has not accepted this call yet." };
    }
    const paid = spend(db, fan, creator, CALL_HOUR, "call", checkoutNote("Private hour", formData));
    if ("error" in paid && paid.error) return { error: esCall ? "No alcanza el saldo de prueba. Agrega fondos en la billetera." : "Not enough sandbox balance. Add funds in Wallet." };
    if (open) {
      open.paidUntil = new Date(new Date(open.paidUntil).getTime() + hour).toISOString();
      return { ok: true as const, extend: true };
    }
    const ask = db.callAsks?.find((item) => item.fanId === fan.id && item.creatorId === creator.id && item.status === "accepted");
    if (ask) ask.status = "closed";
    db.calls.push({
      id: uid("call"),
      fanId: fan.id,
      creatorId: creator.id,
      paidUntil: new Date(now + hour).toISOString(),
      createdAt: new Date(now).toISOString(),
    });
    return { ok: true as const, extend: false };
  });
  if ("error" in result && result.error) redirect(`${back}?error=${encodeURIComponent(result.error)}`);
  redirect(result.extend ? back : `${back}?ring=1`);
}

export async function unlock(formData: FormData) {
  const me = await getSessionUser();
  if (!me) await bounce({ error: "Entra para desbloquear." });
  const postId = String(formData.get("postId") || "");
  const result = await mutate((db) => {
    const fan = db.users.find((user) => user.id === me!.id)!;
    const post = db.posts.find((item) => item.id === postId);
    if (!post || post.visibility !== "ppv") return { error: "Esa publicación no está a la venta." };
    if (post.creatorId === fan.id) return { error: "Es tu publicación." };
    if (db.purchases.some((item) => item.userId === fan.id && item.postId === post.id)) {
      return { error: "Ya la tienes." };
    }
    const creator = db.users.find((user) => user.id === post.creatorId)!;
    const paid = spend(db, fan, creator, post.price, "ppv", "Unlock");
    if (!paid.ok) return paid;
    db.purchases.push({
      id: uid("buy"),
      userId: fan.id,
      postId: post.id,
      createdAt: new Date().toISOString(),
    });
    return { ok: true as const };
  });
  if ("error" in result && result.error) await bounce({ error: result.error });
  await bounce({ ok: "unlock" });
}

export async function likePost(formData: FormData) {
  const me = await getSessionUser();
  if (!me) await bounce({ error: "Entra para marcar me gusta." });
  const postId = String(formData.get("postId") || "");
  await mutate((db) => {
    const post = db.posts.find((item) => item.id === postId);
    const viewer = db.users.find((user) => user.id === me!.id) ?? null;
    if (!post || !canViewPost(db, viewer, post)) return;
    post.likes = post.likes.includes(me!.id)
      ? post.likes.filter((id) => id !== me!.id)
      : [...post.likes, me!.id];
  });
  await bounce();
}

export async function comment(formData: FormData) {
  const me = await getSessionUser();
  if (!me) await bounce({ error: "Entra para comentar." });
  const postId = String(formData.get("postId") || "");
  const text = cleanText(String(formData.get("text") || ""), 280);
  if (text.length < 1) await bounce({ error: "Escribe un comentario." });
  if (violatesSafety(text)) await bounce({ error: SAFETY_ERROR });
  const result = await mutate((db) => {
    const post = db.posts.find((item) => item.id === postId);
    const viewer = db.users.find((user) => user.id === me!.id) ?? null;
    if (!post || !canViewPost(db, viewer, post)) return { error: "No puedes comentar esta publicación." };
    post.comments.push({
      id: uid("cmt"),
      userId: me!.id,
      text,
      createdAt: new Date().toISOString(),
    });
    return { ok: true };
  });
  if ("error" in result && result.error) await bounce({ error: result.error });
  await bounce({ ok: "comentario" });
}

async function readImage(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { id: null as string | null };
  if (file.size > 1_500_000) return { error: "La imagen supera 1.5 MB." };
  const ext =
    file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "";
  if (!ext) return { error: "Usa JPG, PNG o WebP." };
  const id = `${uid("media")}.${ext}`;
  const dir = uploadDir();
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, id), Buffer.from(await file.arrayBuffer()));
  return { id };
}

export async function createPost(formData: FormData) {
  const me = await getSessionUser();
  if (!me) await bounce({ error: "Entra para publicar." });
  if (me!.suspended) await bounce({ error: "Esta cuenta está suspendida." });
  const caption = cleanText(String(formData.get("caption") || ""), 500);
  const visibility = String(formData.get("visibility") || "public") as Visibility;
  const minTier = String(formData.get("minTier") || "") as TierId;
  const price = cents(Number(formData.get("price") || 0));
  const allowRemix = formData.get("allowRemix") === "on" && visibility === "public";
  const format = String(formData.get("format") || "foto");
  const motif = String(formData.get("motif") || "orbit") as Motif;
  const track = String(formData.get("track") || "");
  const challenge = String(formData.get("challenge") || "");
  const filter = String(formData.get("filter") || "");
  const back = safeNext(String(formData.get("back") || ""));
  const dropRaw = String(formData.get("dropAt") || "");
  const dropKind = String(formData.get("dropKind") || "") as DropKind;
  const consent = formData.get("consent") === "on";
  if (!consent) await bounce({ error: "Confirma que todas las personas son adultas y consintieron." });
  if (caption.length < 2) await bounce({ error: "Escribe un texto para la publicación." });
  if (violatesSafety(caption)) await bounce({ error: SAFETY_ERROR });
  if (!["public", "circle", "ppv"].includes(visibility)) await bounce({ error: "Visibilidad no válida." });
  if (me!.verified !== "verified" && visibility !== "public") {
    await bounce({ error: "La monetización se activa cuando la verificación queda aprobada." });
  }
  if (visibility === "ppv" && (price < 1 || price > 200)) {
    await bounce({ error: "El precio de unlock va de $1 a $200." });
  }
  let dropAt: string | null = null;
  if (dropRaw) {
    const when = new Date(dropRaw);
    if (Number.isNaN(when.getTime())) await bounce({ error: "La hora del drop no es válida." });
    dropAt = when.toISOString();
  }
  const image = await readImage(formData);
  if ("error" in image && image.error) await bounce({ error: image.error });

  await mutate((db) => {
    const creator = db.users.find((user) => user.id === me!.id)!;
    db.posts.unshift({
      id: uid("post"),
      creatorId: creator.id,
      caption,
      media: {
        hue: creator.bannerHue,
        accent: creator.avatarHue,
        motif: ["orbit", "bloom", "grid", "wave", "prism"].includes(motif) ? motif : "orbit",
        label: visibility === "public" ? "Público" : "Circle",
      },
      image: image.id ?? null,
      format: format === "clip" || format === "post" ? format : "foto",
      visibility,
      minTier: visibility === "circle" && ["inner", "vip", "elite"].includes(minTier) ? minTier : visibility === "circle" ? "inner" : null,
      price: visibility === "ppv" ? price : 0,
      allowRemix,
      remixOf: null,
      dropAt,
      dropKind: dropAt && ["contenido", "coleccion", "conversacion", "acceso"].includes(dropKind) ? dropKind : dropAt ? "contenido" : null,
      track: TRACKS.some((item) => item.id === track) ? track : null,
      challenge: RETOS.some((item) => item.id === challenge) ? challenge : null,
      filter: FILTERS.some((item) => item.id === filter) ? filter : null,
      createdAt: new Date().toISOString(),
      likes: [],
      comments: [],
    });
  });
  if (back) redirect(`${back}${back.includes("?") ? "&" : "?"}ok=publicado`);
  await bounce({ ok: "publicado" });
}

export async function remixPost(formData: FormData) {
  const me = await getSessionUser();
  if (!me) await bounce({ error: "Entra para hacer remix." });
  if (me!.role !== "creator") await bounce({ error: "El remix es entre creadores. Activa tu perfil en el panel." });
  const postId = String(formData.get("postId") || "");
  const caption = cleanText(String(formData.get("caption") || ""), 500);
  if (caption.length < 2) await bounce({ error: "Escribe tu respuesta." });
  if (violatesSafety(caption)) await bounce({ error: SAFETY_ERROR });
  const result = await mutate((db) => {
    const original = db.posts.find((item) => item.id === postId);
    if (!original || original.visibility !== "public" || !original.allowRemix) {
      return { error: "Ese creador no abrió esta publicación a remix." };
    }
    const creator = db.users.find((user) => user.id === me!.id)!;
    db.posts.unshift({
      id: uid("post"),
      creatorId: creator.id,
      caption,
      media: {
        hue: (original.media.hue + 24) % 360,
        accent: creator.avatarHue,
        motif: original.media.motif,
        label: "Remix",
      },
      image: null,
      format: original.format,
      visibility: "public",
      minTier: null,
      price: 0,
      allowRemix: true,
      remixOf: original.id,
      dropAt: null,
      dropKind: null,
      createdAt: new Date().toISOString(),
      likes: [],
      comments: [],
    });
    return { ok: true };
  });
  if ("error" in result && result.error) await bounce({ error: result.error });
  await bounce({ ok: "remix" });
}

export async function deletePost(formData: FormData) {
  const me = await getSessionUser();
  if (!me) await bounce({ error: "Entra de nuevo." });
  const postId = String(formData.get("postId") || "");
  await mutate((db) => {
    const post = db.posts.find((item) => item.id === postId);
    if (!post) return;
    if (post.creatorId !== me!.id && me!.role !== "admin") return;
    if (post.image) {
      const filename = path.basename(post.image);
      const target = path.join(process.cwd(), "data", "uploads", filename);
      if (fs.existsSync(target)) fs.unlinkSync(target);
    }
    db.posts = db.posts.filter((item) => item.id !== postId);
    if (me!.role === "admin") {
      for (const report of db.reports) {
        if (report.postId === postId && report.status === "open") report.status = "removed";
      }
    }
  });
  await bounce({ ok: "eliminado" });
}

export async function updateProfile(formData: FormData) {
  const me = await getSessionUser();
  if (!me) await bounce({ error: "Entra de nuevo." });
  const displayName = cleanText(String(formData.get("displayName") || ""), 40);
  const bio = cleanText(String(formData.get("bio") || ""), 280);
  const messagePrice = cents(Number(formData.get("messagePrice") || 0));
  const region = String(formData.get("region") || "");
  const shareRegion = formData.get("shareRegion") === "on";
  const categories = CATEGORIES.filter((item) => formData.get(`cat_${item}`) === "on");
  if (displayName.length < 2) await bounce({ error: "El nombre es demasiado corto." });
  if (violatesSafety(`${displayName} ${bio}`)) await bounce({ error: SAFETY_ERROR });
  if (messagePrice < 0 || messagePrice > 50) await bounce({ error: "El mensaje puede costar de $0 a $50." });
  await mutate((db) => {
    const user = db.users.find((item) => item.id === me!.id)!;
    user.displayName = displayName;
    user.bio = bio;
    user.categories = categories;
    user.region = REGIONS.includes(region as (typeof REGIONS)[number]) ? region : null;
    user.shareRegion = shareRegion && Boolean(user.region);
    if (user.role === "creator") user.messagePrice = messagePrice;
  });
  await bounce({ ok: "perfil" });
}

export async function updateTiers(formData: FormData) {
  const me = await getSessionUser();
  if (!me || me.role !== "creator") await bounce({ error: "Solo creadores editan niveles." });
  const tiers = DEFAULT_TIERS.map((tier) => {
    const price = cents(Number(formData.get(`price_${tier.id}`) || tier.price));
    const perks = String(formData.get(`perks_${tier.id}`) || "")
      .split("\n")
      .map((line) => cleanText(line, 80))
      .filter(Boolean)
      .slice(0, 6);
    return { id: tier.id, name: tier.name, price, perks: perks.length ? perks : tier.perks };
  });
  if (tiers.some((tier) => tier.price < 1.99 || tier.price > 200)) {
    await bounce({ error: "Cada nivel va de $1.99 a $200." });
  }
  if (tiers.some((tier) => violatesSafety(tier.perks.join(" ")))) await bounce({ error: SAFETY_ERROR });
  await mutate((db) => {
    const user = db.users.find((item) => item.id === me!.id)!;
    user.tiers = tiers;
  });
  await bounce({ ok: "niveles" });
}

export async function becomeCreator() {
  const me = await getSessionUser();
  if (!me) await bounce({ error: "Entra de nuevo." });
  if (me!.role === "admin") await bounce({ error: "La cuenta de administración no se convierte." });
  await mutate((db) => {
    const user = db.users.find((item) => item.id === me!.id)!;
    if (user.role === "fan") {
      user.role = "creator";
      user.tiers = DEFAULT_TIERS.map((tier) => ({ ...tier, perks: [...tier.perks] }));
      user.verified = "pending";
    }
  });
  redirect("/dashboard?ok=creador");
}

export async function submitVerification(formData: FormData) {
  const me = await getSessionUser();
  if (!me || me.role !== "creator") await bounce({ error: "Solo creadores se verifican." });
  const legalName = cleanText(String(formData.get("legalName") || ""), 80);
  const confirm = formData.get("confirm") === "on";
  if (!confirm || legalName.length < 3) {
    await bounce({ error: "Escribe tu nombre legal y confirma que eres mayor de 18." });
  }
  if (violatesSafety(legalName)) await bounce({ error: SAFETY_ERROR });
  await mutate((db) => {
    const user = db.users.find((item) => item.id === me!.id)!;
    user.verified = "pending";
    user.verificationNote = legalName;
  });
  await bounce({ ok: "verificacion" });
}

export async function updateRegion(formData: FormData) {
  const me = await getSessionUser();
  if (!me) await bounce({ error: "Entra para guardar tu región." });
  const region = String(formData.get("region") || "");
  const shareRegion = formData.get("shareRegion") === "on";
  await mutate((db) => {
    const user = db.users.find((item) => item.id === me!.id)!;
    user.region = REGIONS.includes(region as (typeof REGIONS)[number]) ? region : null;
    user.shareRegion = shareRegion && Boolean(user.region);
  });
  await bounce({ ok: "region" });
}

export async function sendMessage(formData: FormData) {
  const me = await getSessionUser();
  if (!me) await bounce({ error: "Entra para escribir." });
  const toId = String(formData.get("toId") || "");
  const body = cleanText(String(formData.get("body") || ""), 1000);
  if (body.length < 1) await bounce({ error: "Escribe un mensaje." });
  if (violatesSafety(body)) await bounce({ error: SAFETY_ERROR });
  const result = await mutate((db) => {
    const from = db.users.find((user) => user.id === me!.id)!;
    const to = db.users.find((user) => user.id === toId);
    if (!to || to.id === from.id || to.suspended) return { error: "No se puede escribir a esa cuenta." };
    const creator = from.role === "creator" && to.role !== "creator" ? from : to.role === "creator" ? to : null;
    if (creator && !isFollowing(db, from.id, creator.id) && from.id !== creator.id) {
      return { error: "Sigue al creador antes de escribir." };
    }
    if (to.role === "creator" && to.messagePrice > 0 && from.id !== to.id) {
      const paid = spend(db, from, to, to.messagePrice, "message", checkoutNote("Mensaje", formData));
      if (!paid.ok) return paid;
    }
    db.messages.push({
      id: uid("msg"),
      fromId: from.id,
      toId: to.id,
      body,
      createdAt: new Date().toISOString(),
    });
    return { ok: true as const };
  });
  if ("error" in result && result.error) await bounce({ error: result.error });
  await bounce({ ok: "mensaje" });
}

export async function reportContent(formData: FormData) {
  const me = await getSessionUser();
  if (!me) await bounce({ error: "Entra para reportar." });
  const postId = String(formData.get("postId") || "") || null;
  const targetUserId = String(formData.get("targetUserId") || "") || null;
  const reason = cleanText(String(formData.get("reason") || ""), 400);
  if (reason.length < 4) await bounce({ error: "Cuéntanos qué hay que revisar." });
  if (violatesSafety(reason)) await bounce({ error: SAFETY_ERROR });
  await mutate((db) => {
    db.reports.unshift({
      id: uid("rpt"),
      reporterId: me!.id,
      postId,
      targetUserId,
      reason,
      createdAt: new Date().toISOString(),
      status: "open",
    });
  });
  await bounce({ ok: "reporte" });
}

export async function addFunds(formData: FormData) {
  const me = await getSessionUser();
  if (!me) await bounce({ error: "Entra de nuevo." });
  const note = checkoutNote("Fondos de prueba", formData);
  await mutate((db) => {
    const user = db.users.find((item) => item.id === me!.id)!;
    addTopup(db, user, 50, note);
  });
  await bounce({ ok: "fondos" });
}

export async function requestPayout() {
  const me = await getSessionUser();
  if (!me || me.role !== "creator") await bounce({ error: "Solo creadores retiran." });
  const result = await mutate((db) => {
    const available = earnings(db, me!.id);
    if (available < 1) return { error: "Todavía no hay saldo para retirar." };
    db.transactions.push({
      id: uid("tx"),
      fromUserId: me!.id,
      toUserId: null,
      type: "payout",
      amount: available,
      fee: 0,
      net: available,
      createdAt: new Date().toISOString(),
      note: "Retiro de prueba, pendiente de procesador",
    });
    return { ok: true as const };
  });
  if ("error" in result && result.error) await bounce({ error: result.error });
  await bounce({ ok: "retiro" });
}

async function requireAdmin() {
  const me = await getSessionUser();
  if (!me || me.role !== "admin") await bounce({ error: "Solo administración." });
  return me!;
}

export async function adminVerify(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") || "");
  const decision = String(formData.get("decision") || "");
  await mutate((db) => {
    const user = db.users.find((item) => item.id === userId && item.role === "creator");
    if (!user) return;
    user.verified = decision === "verified" ? "verified" : "rejected";
  });
  await bounce({ ok: "moderacion" });
}

export async function adminSuspend(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") || "");
  await mutate((db) => {
    const user = db.users.find((item) => item.id === userId);
    if (!user || user.role === "admin") return;
    user.suspended = !user.suspended;
  });
  await bounce({ ok: "moderacion" });
}

export async function adminDismiss(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  await mutate((db) => {
    const report = db.reports.find((item) => item.id === id);
    if (report && report.status === "open") report.status = "dismissed";
  });
  await bounce({ ok: "moderacion" });
}

export async function leaveLine(formData: FormData) {
  const me = await getSessionUser();
  if (!me) redirect("/signup?next=/");
  const es = (await getLang()) === "es";
  const text = cleanText(String(formData.get("text") || ""), 140);
  if (text.length < 3) redirect(`/?error=${encodeURIComponent(es ? "Escribe una línea." : "Write one line.")}`);
  if (violatesSafety(text)) redirect(`/?error=${encodeURIComponent(SAFETY_ERROR)}`);
  const night = nightKey();
  const result = await mutate((db) => {
    if (!db.lines) db.lines = [];
    if (db.lines.some((item) => item.userId === me!.id && item.night === night)) {
      return { error: es ? "Esta noche ya dejaste tu línea." : "You already left your line tonight." };
    }
    db.lines.push({ id: uid("line"), userId: me!.id, night, text, named: false, createdAt: new Date().toISOString() });
    return { ok: true as const };
  });
  if ("error" in result && result.error) redirect(`/?error=${encodeURIComponent(result.error)}`);
  redirect("/?ok=linea");
}

export async function takeChair() {
  const me = await getSessionUser();
  if (!me) redirect("/signup?next=/");
  const es = (await getLang()) === "es";
  const night = nightKey();
  const result = await mutate((db) => {
    const user = db.users.find((item) => item.id === me!.id)!;
    const line = (db.lines || []).find((item) => item.userId === user.id && item.night === night);
    if (!line) return { error: es ? "Primero deja tu línea." : "Leave your line first." };
    if (line.named) return { error: es ? "Tu nombre ya está en esta edición." : "Your name is already on this edition." };
    const paid = chargePlatform(db, user, CHAIR_PRICE, "Silla en la edición");
    if (!paid.ok) return { error: es ? "No alcanza el saldo de prueba." : "Not enough sandbox balance." };
    line.named = true;
    return { ok: true as const };
  });
  if ("error" in result && result.error) redirect(`/?error=${encodeURIComponent(result.error)}`);
  redirect("/?ok=silla");
}

export async function ensureCreatorLink(username: string) {
  const creator = findCreator(readDb(), username);
  return creator?.username ?? null;
}

function lineBack(postId: string) {
  return `/line/${postId}`;
}

export async function takeSeat(formData: FormData) {
  const postId = String(formData.get("postId") || "");
  const back = lineBack(postId);
  const me = await getSessionUser();
  if (!me) redirect(`/signup?next=${encodeURIComponent(back)}`);
  const es = (await getLang()) === "es";
  const result = await mutate((db) => {
    const fan = db.users.find((user) => user.id === me!.id)!;
    const post = db.posts.find((item) => item.id === postId && item.visibility === "ppv");
    const creator = post ? db.users.find((user) => user.id === post.creatorId) : undefined;
    if (!post || !creator || creator.verified !== "verified") return { error: es ? "Esa fila no está abierta." : "That line is not open." };
    if (!db.seats) db.seats = [];
    if (lineSeats(db, post.id).some((item) => item.userId === fan.id)) return { ok: true as const };
    if (lineSeats(db, post.id).length >= LINE_GOAL) return { error: es ? "La fila ya abrió." : "The line already opened." };
    const paid = spend(db, fan, creator, SEAT_PRICE, "ppv", "Puesto en la fila");
    if ("error" in paid && paid.error) return { error: es ? "No alcanza el saldo de prueba." : "Not enough sandbox balance." };
    db.seats.push({ id: uid("seat"), userId: fan.id, postId: post.id, createdAt: new Date().toISOString() });
    return { ok: true as const };
  });
  if ("error" in result && result.error) redirect(`${back}?error=${encodeURIComponent(result.error)}`);
  redirect(`${back}?ok=puesto`);
}

export async function openNow(formData: FormData) {
  const postId = String(formData.get("postId") || "");
  const back = lineBack(postId);
  const me = await getSessionUser();
  if (!me) redirect(`/signup?next=${encodeURIComponent(back)}`);
  const es = (await getLang()) === "es";
  const result = await mutate((db) => {
    const fan = db.users.find((user) => user.id === me!.id)!;
    const post = db.posts.find((item) => item.id === postId && item.visibility === "ppv");
    const creator = post ? db.users.find((user) => user.id === post.creatorId) : undefined;
    if (!post || !creator || creator.verified !== "verified") return { error: es ? "Ese archivo no está a la venta." : "That file is not for sale." };
    if (db.purchases.some((item) => item.userId === fan.id && item.postId === post.id)) return { ok: true as const };
    const paid = spend(db, fan, creator, OPEN_PRICE, "ppv", "Abrir ya");
    if ("error" in paid && paid.error) return { error: es ? "No alcanza el saldo de prueba." : "Not enough sandbox balance." };
    db.purchases.push({ id: uid("buy"), userId: fan.id, postId: post.id, createdAt: new Date().toISOString() });
    return { ok: true as const };
  });
  if ("error" in result && result.error) redirect(`${back}?error=${encodeURIComponent(result.error)}`);
  redirect(`${back}?ok=abierto`);
}
