import fs from "fs";
import path from "path";
import { hashPassword, uid } from "./password";
import { cents, TIER_RANK } from "./format";
import type {
  DB,
  DropKind,
  Follow,
  Post,
  PublicUser,
  Subscription,
  Tier,
  TierId,
  Transaction,
  TxType,
  User,
} from "./types";

export const FEE = 0.2;
export const REFERRAL_RATE = 0.05;
export const REFERRAL_DAYS = 180;
export const SEED_VERSION = 1;

const file = process.env.VERCEL
  ? path.join("/tmp", "tokkame-db.json")
  : path.join(process.cwd(), "data", "db.json");

const g = globalThis as unknown as { __tokkameQueue?: Promise<unknown> };
if (!g.__tokkameQueue) g.__tokkameQueue = Promise.resolve();

export const DEFAULT_TIERS: Tier[] = [
  {
    id: "inner",
    name: "Inner Circle",
    price: 5.99,
    perks: ["The private posts", "Her closer photos", "The locked set"],
  },
  {
    id: "vip",
    name: "VIP",
    price: 19.99,
    perks: ["Everything in Inner", "New sets first", "A longer conversation"],
  },
  {
    id: "elite",
    name: "Elite",
    price: 49.99,
    perks: ["Everything in VIP", "The full archive", "The closest access"],
  },
];

export function toPublic(user: User): PublicUser {
  const { passwordHash: _password, ...rest } = user;
  void _password;
  return rest;
}

export function tierRank(id: TierId | null) {
  if (!id) return 1;
  return TIER_RANK[id] ?? 1;
}

function cloneTiers() {
  return DEFAULT_TIERS.map((tier) => ({ ...tier, perks: [...tier.perks] }));
}

let demoHash: string | null = null;
function demoPassword() {
  if (!demoHash) demoHash = hashPassword("demo1234");
  return demoHash;
}

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86400000).toISOString();
}

function hoursAhead(n: number) {
  return new Date(Date.now() + n * 3600000).toISOString();
}

function makeUser(
  partial: Pick<User, "id" | "email" | "username" | "displayName" | "role"> &
    Partial<User>,
): User {
  return {
    passwordHash: demoPassword(),
    bio: "",
    categories: [],
    region: null,
    shareRegion: false,
    avatarHue: 18,
    bannerHue: 32,
    tiers: partial.role === "creator" ? cloneTiers() : [],
    verified: partial.role === "creator" ? "verified" : "none",
    verificationNote: "",
    ageConfirmedAt: daysAgo(12),
    balance: 0,
    messagePrice: 0,
    referredBy: null,
    suspended: false,
    createdAt: daysAgo(20),
    ...partial,
  };
}

function seed(): DB {
  const luna = makeUser({
    id: "usr_luna",
    email: "luna@tokkame.app",
    username: "luna.vale",
    displayName: "Luna Vale",
    role: "creator",
    bio: "Fotografía, circles y drops de los viernes. Lo público es la puerta. El Circle es la casa.",
    categories: ["Fotografía", "Estilo de vida"],
    region: "Ciudad de México",
    shareRegion: true,
    avatarHue: 16,
    bannerHue: 28,
    messagePrice: 5,
    createdAt: daysAgo(40),
    balance: 40,
  });
  const nia = makeUser({
    id: "usr_nia",
    email: "nia@tokkame.app",
    username: "nia.reed",
    displayName: "Nia Reed",
    role: "creator",
    bio: "Moda, backstage y conversaciones con quien se queda.",
    categories: ["Moda"],
    region: "Madrid",
    shareRegion: true,
    avatarHue: 340,
    bannerHue: 355,
    messagePrice: 8,
    createdAt: daysAgo(28),
  });
  const marco = makeUser({
    id: "usr_marco",
    email: "marco@tokkame.app",
    username: "marco.sol",
    displayName: "Marco Sol",
    role: "creator",
    bio: "Entrenamiento, disciplina y un Inner Circle sin ruido.",
    categories: ["Fitness"],
    region: "Miami",
    shareRegion: true,
    avatarHue: 200,
    bannerHue: 210,
    messagePrice: 6,
    createdAt: daysAgo(18),
  });
  const vera = makeUser({
    id: "usr_vera",
    email: "vera@tokkame.app",
    username: "vera.night",
    displayName: "Vera Night",
    role: "creator",
    bio: "Música en voz baja y drops que duran una noche.",
    categories: ["Música"],
    region: "Buenos Aires",
    shareRegion: true,
    avatarHue: 270,
    bannerHue: 280,
    messagePrice: 7,
    createdAt: daysAgo(15),
  });
  const kai = makeUser({
    id: "usr_kai",
    email: "kai@tokkame.app",
    username: "kai.oro",
    displayName: "Kai Oro",
    role: "creator",
    bio: "Arte, proceso y piezas que salen primero en el Circle.",
    categories: ["Arte"],
    region: "Barcelona",
    shareRegion: true,
    avatarHue: 42,
    bannerHue: 36,
    referredBy: luna.id,
    messagePrice: 5,
    createdAt: daysAgo(12),
  });
  const adrian = makeUser({
    id: "usr_adrian",
    email: "adrian@tokkame.app",
    username: "adrian.cole",
    displayName: "Adrián Cole",
    role: "creator",
    bio: "Conversaciones largas. Pocas publicaciones. Más presencia.",
    categories: ["Conversación"],
    region: "Bogotá",
    shareRegion: false,
    avatarHue: 150,
    bannerHue: 160,
    messagePrice: 10,
    createdAt: daysAgo(9),
  });
  const novo = makeUser({
    id: "usr_novo",
    email: "novo@tokkame.app",
    username: "novo.studio",
    displayName: "Novo Studio",
    role: "creator",
    bio: "Perfil nuevo, todavía en verificación.",
    categories: ["Fotografía"],
    region: "Lima",
    shareRegion: true,
    verified: "pending",
    verificationNote: "Solicitud de demostración",
    createdAt: daysAgo(1),
  });

  const sofia = makeUser({
    id: "usr_sofia",
    email: "sofia@tokkame.app",
    username: "sofia.m",
    displayName: "Sofía M",
    role: "fan",
    region: "Ciudad de México",
    shareRegion: true,
    avatarHue: 8,
    balance: 250,
    createdAt: daysAgo(6),
  });
  const admin = makeUser({
    id: "usr_admin",
    email: "admin@tokkame.app",
    username: "admin",
    displayName: "Tokkame Admin",
    role: "admin",
    avatarHue: 0,
    balance: 0,
    createdAt: daysAgo(60),
  });

  const fans: User[] = [sofia];
  for (let i = 1; i <= 16; i++) {
    fans.push(
      makeUser({
        id: `usr_fan_${i}`,
        email: `fan${i}@tokkame.app`,
        username: `fan${i}`,
        displayName: `Miembro ${i}`,
        role: "fan",
        avatarHue: (i * 23) % 360,
        balance: 120,
        region: i % 2 === 0 ? "Ciudad de México" : "Madrid",
        shareRegion: i % 3 === 0,
        createdAt: daysAgo(3 + (i % 5)),
      }),
    );
  }

  const db: DB = {
    version: SEED_VERSION,
    users: [luna, nia, marco, vera, kai, adrian, novo, admin, ...fans],
    posts: [],
    follows: [],
    subscriptions: [],
    purchases: [],
    transactions: [],
    messages: [],
    reports: [],
    calls: [],
  };

  const post = (
    creator: User,
    caption: string,
    extra: Partial<Post> & Pick<Post, "id" | "visibility">,
  ) => {
    db.posts.push({
      creatorId: creator.id,
      caption,
      media: {
        hue: creator.bannerHue + (db.posts.length % 5) * 8,
        accent: creator.avatarHue,
        motif: (["orbit", "bloom", "grid", "wave", "prism"] as const)[
          db.posts.length % 5
        ],
        label: extra.format === "clip" ? "Clip" : extra.visibility === "public" ? "Público" : "Circle",
      },
      image: null,
      format: "foto",
      minTier: null,
      price: 0,
      allowRemix: extra.visibility === "public",
      remixOf: null,
      dropAt: null,
      dropKind: null,
      createdAt: daysAgo(1),
      likes: [],
      comments: [],
      ...extra,
    });
  };

  post(luna, "La puerta está abierta. El resto vive en el Circle.", {
    id: "post_luna_1",
    visibility: "public",
    format: "clip",
    allowRemix: true,
    createdAt: daysAgo(1),
  });
  post(luna, "Luz de tarde, antes del drop del viernes.", {
    id: "post_luna_2",
    visibility: "public",
    format: "foto",
    createdAt: hoursAhead(-8),
  });
  post(luna, "Set exclusivo para quienes ya entraron.", {
    id: "post_luna_3",
    visibility: "circle",
    minTier: "inner",
    format: "foto",
    allowRemix: false,
    createdAt: daysAgo(2),
  });
  post(luna, "Una pieza suelta. Se queda con quien la elige.", {
    id: "post_luna_4",
    visibility: "ppv",
    price: 12,
    format: "foto",
    allowRemix: false,
    createdAt: daysAgo(3),
  });
  post(luna, "DROP — conversación en el Circle. Llegan preguntas, no un archivo más.", {
    id: "post_luna_drop",
    visibility: "circle",
    minTier: "vip",
    dropAt: hoursAhead(30),
    dropKind: "conversacion",
    format: "post",
    allowRemix: false,
    createdAt: daysAgo(0.2),
  });

  post(nia, "Remix de la luz de Luna. Otra ciudad, el mismo gesto.", {
    id: "post_nia_remix",
    visibility: "public",
    format: "foto",
    remixOf: "post_luna_1",
    allowRemix: true,
    createdAt: hoursAhead(-5),
  });
  post(nia, "Backstage corto. Lo demás es del Circle.", {
    id: "post_nia_2",
    visibility: "public",
    format: "clip",
    createdAt: daysAgo(2),
  });
  post(nia, "Colección de la semana, solo suscriptores.", {
    id: "post_nia_3",
    visibility: "circle",
    minTier: "inner",
    allowRemix: false,
    createdAt: daysAgo(1),
  });
  post(nia, "DROP — acceso al fitting del sábado.", {
    id: "post_nia_drop",
    visibility: "circle",
    dropAt: hoursAhead(54),
    dropKind: "acceso",
    allowRemix: false,
    createdAt: daysAgo(0.3),
  });

  post(marco, "Sesión de la mañana. Pública, a propósito.", {
    id: "post_marco_1",
    visibility: "public",
    format: "clip",
    createdAt: daysAgo(1),
  });
  post(marco, "Rutina VIP. Sin atajos.", {
    id: "post_marco_2",
    visibility: "circle",
    minTier: "vip",
    allowRemix: false,
    createdAt: daysAgo(2),
  });
  post(marco, "DROP — entrenamiento en vivo llega más adelante. Hoy, el plan escrito.", {
    id: "post_marco_drop",
    visibility: "public",
    dropAt: hoursAhead(20),
    dropKind: "contenido",
    allowRemix: false,
    createdAt: daysAgo(0.1),
  });

  post(vera, "Un fragmento de la canción. El resto cae en el drop.", {
    id: "post_vera_1",
    visibility: "public",
    format: "clip",
    createdAt: daysAgo(1),
  });
  post(vera, "DROP — escucha anticipada para el Circle.", {
    id: "post_vera_drop",
    visibility: "circle",
    dropAt: hoursAhead(8),
    dropKind: "coleccion",
    allowRemix: false,
    createdAt: daysAgo(0.4),
  });

  post(kai, "Estudio abierto. Proceso, no resultado.", {
    id: "post_kai_1",
    visibility: "public",
    format: "foto",
    createdAt: daysAgo(1),
  });
  post(kai, "Pieza para el Inner Circle.", {
    id: "post_kai_2",
    visibility: "circle",
    allowRemix: false,
    createdAt: daysAgo(2),
  });

  post(adrian, "Una pregunta pública. La respuesta larga es privada.", {
    id: "post_adrian_1",
    visibility: "public",
    format: "post",
    createdAt: daysAgo(1),
  });

  const like = (postId: string, userIds: string[]) => {
    const item = db.posts.find((p) => p.id === postId);
    if (item) item.likes = userIds;
  };
  like("post_luna_1", fans.slice(0, 10).map((f) => f.id));
  like("post_luna_2", fans.slice(0, 6).map((f) => f.id));
  like("post_nia_remix", fans.slice(2, 9).map((f) => f.id));
  like("post_marco_1", fans.slice(1, 7).map((f) => f.id));
  like("post_vera_1", fans.slice(4, 12).map((f) => f.id));
  like("post_kai_1", fans.slice(0, 4).map((f) => f.id));

  db.posts.find((p) => p.id === "post_luna_1")?.comments.push({
    id: "cmt_1",
    userId: sofia.id,
    text: "Esto es exactamente el tipo de descubrimiento que quería.",
    createdAt: hoursAhead(-4),
  });

  const follow = (userId: string, creatorId: string, at: string) => {
    db.follows.push({ userId, creatorId, createdAt: at });
  };
  for (const fan of fans) follow(fan.id, luna.id, daysAgo(2));
  follow(sofia.id, nia.id, daysAgo(2));
  follow(sofia.id, vera.id, daysAgo(1));
  for (const fan of fans.slice(0, 8)) follow(fan.id, nia.id, daysAgo(3));
  for (const fan of fans.slice(0, 6)) follow(fan.id, marco.id, daysAgo(2));
  for (const fan of fans.slice(0, 5)) follow(fan.id, vera.id, daysAgo(2));
  for (const fan of fans.slice(0, 4)) follow(fan.id, kai.id, daysAgo(2));
  for (const fan of fans.slice(0, 3)) follow(fan.id, adrian.id, daysAgo(1));

  const subscribe = (
    fan: User,
    creator: User,
    tier: TierId,
    status: "active" | "canceled",
    startedDays: number,
  ) => {
    const price = creator.tiers.find((t) => t.id === tier)?.price ?? 0;
    const started = daysAgo(startedDays);
    db.subscriptions.push({
      id: uid("sub"),
      userId: fan.id,
      creatorId: creator.id,
      tier,
      price,
      status,
      startedAt: started,
      renewsAt: new Date(Date.now() + (status === "active" ? 29 : -2) * 86400000).toISOString(),
    });
    if (status === "active") charge(db, fan, creator, price, "subscription", `Circle ${tier}`, started);
  };

  const lunaFans = fans;
  const plan: [User, TierId, "active" | "canceled", number][] = [
    [lunaFans[0], "vip", "active", 1],
    [lunaFans[1], "inner", "active", 1],
    [lunaFans[2], "inner", "active", 1],
    [lunaFans[3], "elite", "active", 0.5],
    [lunaFans[4], "vip", "active", 1],
    [lunaFans[5], "inner", "active", 1],
    [lunaFans[6], "inner", "active", 0.4],
    [lunaFans[7], "inner", "active", 1],
    [lunaFans[8], "inner", "canceled", 40],
    [lunaFans[9], "inner", "canceled", 36],
    [lunaFans[10], "vip", "canceled", 34],
  ];
  for (const [fan, tier, status, started] of plan) subscribe(fan, luna, tier, status, started);
  subscribe(fans[0], nia, "inner", "active", 1);
  subscribe(fans[2], marco, "vip", "active", 1);
  subscribe(fans[3], vera, "inner", "active", 1);
  subscribe(fans[4], kai, "inner", "active", 1);
  subscribe(fans[5], kai, "vip", "active", 0.6);

  charge(db, fans[1], luna, 10, "tip", "Propina", daysAgo(0.3));
  charge(db, fans[2], luna, 25, "tip", "Propina", daysAgo(0.8));
  charge(db, fans[4], luna, 5, "tip", "Propina", daysAgo(1));
  charge(db, sofia, luna, 12, "ppv", "Unlock", daysAgo(0.5));
  db.purchases.push({
    id: uid("buy"),
    userId: sofia.id,
    postId: "post_luna_4",
    createdAt: daysAgo(0.5),
  });
  charge(db, fans[4], kai, 15, "tip", "Propina", daysAgo(0.7));

  db.messages.push(
    {
      id: uid("msg"),
      fromId: sofia.id,
      toId: luna.id,
      body: "El drop del viernes entra con VIP, ¿verdad?",
      createdAt: hoursAhead(-6),
    },
    {
      id: uid("msg"),
      fromId: luna.id,
      toId: sofia.id,
      body: "Sí. VIP y Elite. Inner ve el archivo después.",
      createdAt: hoursAhead(-5),
    },
  );

  db.reports.push({
    id: "rpt_demo",
    reporterId: sofia.id,
    postId: "post_marco_1",
    targetUserId: marco.id,
    reason: "Quiero que moderación lo revise. Es un reporte de demostración.",
    createdAt: daysAgo(0.2),
    status: "open",
  });

  return db;
}

function charge(
  db: DB,
  from: User,
  to: User,
  gross: number,
  type: TxType,
  note: string,
  at: string,
) {
  const amount = cents(gross);
  from.balance = cents(from.balance - amount);
  const fee = cents(amount * FEE);
  const net = cents(amount - fee);
  db.transactions.push({
    id: uid("tx"),
    fromUserId: from.id,
    toUserId: to.id,
    type,
    amount,
    fee,
    net,
    createdAt: at,
    note,
  });
  payReferral(db, to, amount, at);
}

function payReferral(db: DB, creator: User, gross: number, at: string) {
  if (!creator.referredBy) return;
  const age = Date.now() - new Date(creator.createdAt).getTime();
  if (age > REFERRAL_DAYS * 86400000) return;
  const bonus = cents(gross * REFERRAL_RATE);
  if (bonus <= 0) return;
  db.transactions.push({
    id: uid("tx"),
    fromUserId: creator.id,
    toUserId: creator.referredBy,
    type: "referral",
    amount: bonus,
    fee: 0,
    net: bonus,
    createdAt: at,
    note: `Referido @${creator.username}`,
  });
}

function readFile(): DB | null {
  try {
    if (!fs.existsSync(file)) return null;
    const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as DB;
    if (!parsed || parsed.version !== SEED_VERSION) return null;
    if (!parsed.calls) parsed.calls = [];
    return parsed;
  } catch {
    return null;
  }
}

function persist(db: DB) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(db));
}

export function readDb(): DB {
  return readFile() ?? seedAndSave();
}

function seedAndSave() {
  const db = seed();
  persist(db);
  return db;
}

export function mutate<T>(fn: (db: DB) => T): Promise<T> {
  const run = g.__tokkameQueue!.then(async () => {
    const db = readFile() ?? seed();
    const result = fn(db);
    persist(db);
    return result;
  });
  g.__tokkameQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function findUserById(db: DB, id: string) {
  return db.users.find((user) => user.id === id) ?? null;
}

export function findUserByLogin(db: DB, login: string) {
  const key = login.trim().toLowerCase();
  return (
    db.users.find(
      (user) => user.email.toLowerCase() === key || user.username === key,
    ) ?? null
  );
}

export function findCreator(db: DB, username: string) {
  const key = username.trim().toLowerCase();
  return db.users.find((user) => user.username === key && user.role === "creator") ?? null;
}

export function isDropLocked(post: Post) {
  return Boolean(post.dropAt && new Date(post.dropAt).getTime() > Date.now());
}

export function activeSub(db: DB, userId: string, creatorId: string) {
  return (
    db.subscriptions.find(
      (sub) =>
        sub.userId === userId &&
        sub.creatorId === creatorId &&
        sub.status === "active" &&
        new Date(sub.renewsAt).getTime() > Date.now(),
    ) ?? null
  );
}

export function canViewPost(db: DB, viewer: User | null, post: Post) {
  if (isDropLocked(post)) return false;
  if (viewer?.id === post.creatorId) return true;
  if (viewer?.role === "admin") return true;
  if (post.visibility === "public") return true;
  if (!viewer) return false;
  if (post.visibility === "ppv") {
    return db.purchases.some((item) => item.userId === viewer.id && item.postId === post.id);
  }
  const sub = activeSub(db, viewer.id, post.creatorId);
  if (!sub) return false;
  return tierRank(sub.tier) >= tierRank(post.minTier);
}

export function followerCount(db: DB, creatorId: string) {
  return db.follows.filter((item) => item.creatorId === creatorId).length;
}

export function subscriberCount(db: DB, creatorId: string) {
  return db.subscriptions.filter(
    (item) =>
      item.creatorId === creatorId &&
      item.status === "active" &&
      new Date(item.renewsAt).getTime() > Date.now(),
  ).length;
}

export function isFollowing(db: DB, userId: string | undefined, creatorId: string) {
  if (!userId) return false;
  return db.follows.some((item) => item.userId === userId && item.creatorId === creatorId);
}

export function earnings(db: DB, userId: string, since?: number) {
  let total = 0;
  for (const tx of db.transactions) {
    if (since && new Date(tx.createdAt).getTime() < since) continue;
    if (
      tx.toUserId === userId &&
      (tx.type === "subscription" ||
        tx.type === "tip" ||
        tx.type === "ppv" ||
        tx.type === "message" ||
        tx.type === "call" ||
        tx.type === "referral")
    ) {
      total += tx.net;
    }
    if (tx.type === "payout" && tx.fromUserId === userId) total -= tx.amount;
  }
  return cents(total);
}

export function earningsByType(db: DB, userId: string, since?: number) {
  const buckets: Record<string, number> = {
    subscription: 0,
    tip: 0,
    ppv: 0,
    message: 0,
    call: 0,
    referral: 0,
  };
  for (const tx of db.transactions) {
    if (since && new Date(tx.createdAt).getTime() < since) continue;
    if (tx.toUserId === userId && tx.type in buckets) buckets[tx.type] += tx.net;
  }
  return buckets;
}

export function monthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

export function creators(db: DB) {
  return db.users.filter((user) => user.role === "creator" && !user.suspended);
}

export function publicPosts(db: DB) {
  return db.posts.filter((post) => post.visibility === "public" && !isDropLocked(post));
}

export function upcomingDrops(db: DB) {
  return db.posts
    .filter((post) => isDropLocked(post))
    .sort((a, b) => new Date(a.dropAt!).getTime() - new Date(b.dropAt!).getTime());
}

export function uploadDir() {
  return process.env.VERCEL
    ? path.join("/tmp", "tokkame-uploads")
    : path.join(process.cwd(), "data", "uploads");
}

export function spend(
  db: DB,
  from: User,
  to: User,
  gross: number,
  type: TxType,
  note: string,
) {
  const amount = cents(gross);
  if (from.balance + 0.001 < amount) {
    return { ok: false as const, error: "Saldo de prueba insuficiente. Agrega fondos en Wallet." };
  }
  charge(db, from, to, amount, type, note, new Date().toISOString());
  return { ok: true as const };
}

export function addTopup(db: DB, user: User, amount: number, note = "Fondos de prueba") {
  const value = cents(amount);
  user.balance = cents(Math.min(5000, user.balance + value));
  db.transactions.push({
    id: uid("tx"),
    fromUserId: null,
    toUserId: user.id,
    type: "topup",
    amount: value,
    fee: 0,
    net: value,
    createdAt: new Date().toISOString(),
    note,
  });
}

export function lowestPrice(user: User) {
  if (!user.tiers.length) return 0;
  return Math.min(...user.tiers.map((tier) => tier.price));
}

export type { Follow, Subscription, Transaction };
export type { DropKind };
