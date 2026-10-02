"use server";

import fs from "fs";
import path from "path";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearSession, confirmAgeCookie, getSessionUser, setSession } from "./auth";
import { hashPassword, uid, verifyPassword } from "./password";
import { CATEGORIES, cents, REGIONS } from "./format";
import { cleanText, SAFETY_ERROR, violatesSafety } from "./safety";
import {
  activeSub,
  addTopup,
  canViewPost,
  DEFAULT_TIERS,
  earnings,
  findCreator,
  findUserByLogin,
  isFollowing,
  mutate,
  readDb,
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
  redirect(result.creator ? "/dashboard?ok=cuenta" : "/feed?ok=cuenta");
}

export async function follow(formData: FormData) {
  const me = await getSessionUser();
  if (!me) await bounce({ error: "Entra para seguir creadores." });
  const creatorId = String(formData.get("creatorId") || "");
  const result = await mutate((db) => {
    const creator = db.users.find((user) => user.id === creatorId && user.role === "creator");
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
  const dir = path.join(process.cwd(), "data", "uploads");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, id), Buffer.from(await file.arrayBuffer()));
  return { id };
}

export async function createPost(formData: FormData) {
  const me = await getSessionUser();
  if (!me || (me.role !== "creator" && me.role !== "admin")) {
    await bounce({ error: "Solo un creador puede publicar." });
  }
  if (me!.suspended) await bounce({ error: "Esta cuenta está suspendida." });
  const caption = cleanText(String(formData.get("caption") || ""), 500);
  const visibility = String(formData.get("visibility") || "public") as Visibility;
  const minTier = String(formData.get("minTier") || "") as TierId;
  const price = cents(Number(formData.get("price") || 0));
  const allowRemix = formData.get("allowRemix") === "on" && visibility === "public";
  const format = String(formData.get("format") || "foto");
  const motif = String(formData.get("motif") || "orbit") as Motif;
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
      createdAt: new Date().toISOString(),
      likes: [],
      comments: [],
    });
  });
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

export async function ensureCreatorLink(username: string) {
  const creator = findCreator(readDb(), username);
  return creator?.username ?? null;
}
