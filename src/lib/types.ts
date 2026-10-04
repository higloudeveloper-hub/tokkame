export type Role = "fan" | "creator" | "admin";
export type TierId = "inner" | "vip" | "elite";
export type Verification = "none" | "pending" | "verified" | "rejected";
export type Visibility = "public" | "circle" | "ppv";
export type DropKind = "contenido" | "coleccion" | "conversacion" | "acceso";
export type Motif = "orbit" | "bloom" | "grid" | "wave" | "prism";

export type Tier = {
  id: TierId;
  name: string;
  price: number;
  perks: string[];
};

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  username: string;
  displayName: string;
  role: Role;
  bio: string;
  categories: string[];
  region: string | null;
  shareRegion: boolean;
  avatarHue: number;
  bannerHue: number;
  tiers: Tier[];
  verified: Verification;
  verificationNote: string;
  ageConfirmedAt: string | null;
  balance: number;
  plusUntil?: string | null;
  messagePrice: number;
  referredBy: string | null;
  suspended: boolean;
  createdAt: string;
};

export type Media = {
  hue: number;
  accent: number;
  motif: Motif;
  label: string;
};

export type Comment = {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
};

export type Post = {
  id: string;
  creatorId: string;
  caption: string;
  media: Media;
  image: string | null;
  cover?: string | null;
  curtain?: number | null;
  format: "foto" | "clip" | "post";
  visibility: Visibility;
  minTier: TierId | null;
  price: number;
  allowRemix: boolean;
  remixOf: string | null;
  dropAt: string | null;
  dropKind: DropKind | null;
  track?: string | null;
  challenge?: string | null;
  filter?: string | null;
  createdAt: string;
  likes: string[];
  comments: Comment[];
};

export type Follow = {
  userId: string;
  creatorId: string;
  createdAt: string;
};

export type Subscription = {
  id: string;
  userId: string;
  creatorId: string;
  tier: TierId;
  price: number;
  status: "active" | "canceled";
  startedAt: string;
  renewsAt: string;
};

export type Purchase = {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
};

export type TxType =
  | "subscription"
  | "tip"
  | "ppv"
  | "message"
  | "call"
  | "payout"
  | "topup"
  | "referral";

export type Transaction = {
  id: string;
  fromUserId: string | null;
  toUserId: string | null;
  type: TxType;
  amount: number;
  fee: number;
  net: number;
  createdAt: string;
  note: string;
};

export type DirectMessage = {
  id: string;
  fromId: string;
  toId: string;
  body: string;
  createdAt: string;
};

export type Report = {
  id: string;
  reporterId: string;
  postId: string | null;
  targetUserId: string | null;
  reason: string;
  createdAt: string;
  status: "open" | "removed" | "dismissed";
};

export type CallSession = {
  id: string;
  fanId: string;
  creatorId: string;
  paidUntil: string;
  createdAt: string;
};

export type NightLine = {
  id: string;
  userId: string;
  night: string;
  text: string;
  named: boolean;
  createdAt: string;
};

export type Cut = {
  id: string;
  userId: string;
  clipId: string;
  caption: string;
  createdAt: string;
};

export type Seat = {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
};

export type CallAsk = {
  id: string;
  fanId: string;
  creatorId: string;
  note: string;
  status: "pending" | "accepted" | "declined" | "closed";
  createdAt: string;
};

export type DB = {
  version: number;
  users: User[];
  posts: Post[];
  follows: Follow[];
  subscriptions: Subscription[];
  purchases: Purchase[];
  transactions: Transaction[];
  messages: DirectMessage[];
  reports: Report[];
  calls: CallSession[];
  callAsks: CallAsk[];
  seats: Seat[];
  cuts: Cut[];
  lines: NightLine[];
};

export type PublicUser = Omit<User, "passwordHash">;

export type SessionView = {
  id: string;
  username: string;
  displayName: string;
  role: Role;
  balance: number;
  verified: Verification;
  avatarHue: number;
};
