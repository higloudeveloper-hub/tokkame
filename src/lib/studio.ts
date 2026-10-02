import { compact, money } from "./format";
import { creators, findUserById, followerCount, lowestPrice, subscriberCount } from "./store";
import type { DB, Transaction } from "./types";

export const PHOTOS = ["/look/c1.jpg", "/look/c2.jpg", "/look/c3.jpg", "/look/c4.jpg", "/look/c5.jpg", "/look/c6.jpg"];

export type Clip = {
  id: string;
  title: string;
  creator: string;
  username: string;
  views: string;
  duration: string;
  src: string;
  poster: string;
};

export const CLIPS: Clip[] = [
  { id: "late-light", title: "Late light", creator: "luna_vale", username: "luna.vale", views: "128.4K", duration: "0:03", src: "/look/v1.mp4?v=2", poster: "/look/c1.jpg" },
  { id: "backstage", title: "Backstage", creator: "nia_reed", username: "nia.reed", views: "86.1K", duration: "0:03", src: "/look/v2.mp4?v=2", poster: "/look/c2.jpg" },
  { id: "morning-set", title: "Morning set", creator: "marco_sol", username: "marco.sol", views: "64.8K", duration: "0:03", src: "/look/v3.mp4?v=2", poster: "/look/c3.jpg" },
  { id: "studio-open", title: "Studio open", creator: "vera_night", username: "vera.night", views: "51.2K", duration: "0:03", src: "/look/v4.mp4?v=2", poster: "/look/c4.jpg" },
  { id: "after-hours", title: "After hours", creator: "kai_oro", username: "kai.oro", views: "43.7K", duration: "0:03", src: "/look/v5.mp4?v=2", poster: "/look/c5.jpg" },
  { id: "first-look", title: "First look", creator: "adrian_cole", username: "adrian.cole", views: "39.5K", duration: "0:03", src: "/look/v6.mp4?v=2", poster: "/look/c6.jpg" },
];

export const NAV_CATS = [
  { label: "Fitness", category: "Fitness" },
  { label: "Cosplay", category: "Moda" },
  { label: "Lifestyle", category: "Estilo de vida" },
  { label: "Adult", category: "" },
  { label: "Gaming", category: "" },
  { label: "Music", category: "Música" },
  { label: "Travel", category: "" },
];

export function photoAt(index: number) {
  return PHOTOS[Math.abs(index) % PHOTOS.length];
}

function labelCategory(categories: string[]) {
  const map: Record<string, string> = {
    "Estilo de vida": "Lifestyle",
    Fotografía: "Lifestyle",
    Música: "Music",
    Moda: "Cosplay",
    Conversación: "Lifestyle",
    Arte: "Art",
    Fitness: "Fitness",
  };
  const preferred = categories.find((item) => item === "Estilo de vida") || categories[0];
  return map[preferred] || "Adult";
}

export function relTime(iso: string) {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  if (seconds < 3600) return `${Math.max(1, Math.floor(seconds / 60))}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function categoryCount(db: DB, label: string, category: string) {
  const list = creators(db);
  if (label === "Adult") return list.length;
  if (label === "Travel") return list.filter((user) => user.shareRegion).length;
  if (!category) return 0;
  return list.filter((user) => user.categories.includes(category)).length;
}

function lineFor(tx: Transaction, name: string) {
  if (tx.type === "tip") return `received a tip of ${money(tx.amount)}`;
  if (tx.type === "subscription") return "gained a new subscriber";
  if (tx.type === "ppv") return `sold premium content for ${money(tx.amount)}`;
  if (tx.type === "message") return "sent you a message";
  if (tx.type === "referral") return "earned a referral";
  return name;
}

export function activityFeed(db: DB) {
  const list = creators(db);
  return [...db.transactions]
    .filter((tx) => tx.type !== "topup" && tx.type !== "payout" && tx.toUserId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
    .map((tx) => {
      const user = findUserById(db, tx.toUserId || "");
      const index = list.findIndex((item) => item.id === user?.id);
      const name = user?.displayName ?? "Creator";
      return {
        id: tx.id,
        name,
        username: user?.username ?? "",
        line: lineFor(tx, name),
        time: relTime(tx.createdAt),
        photo: photoAt(index < 0 ? 0 : index),
      };
    });
}

export function creatorCards(db: DB) {
  return creators(db)
    .filter((user) => user.verified === "verified")
    .map((user, index) => ({
      id: user.id,
      name: user.displayName,
      username: user.username,
      category: labelCategory(user.categories),
      followers: compact(followerCount(db, user.id)),
      subscribers: compact(subscriberCount(db, user.id)),
      price: money(lowestPrice(user)),
      talk: money(user.messagePrice),
      photo: photoAt(index),
    }));
}
