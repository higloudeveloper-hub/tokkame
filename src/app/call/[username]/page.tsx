import { notFound, redirect } from "next/navigation";
import { CallRoom } from "@/components/call-room";
import { getSessionUser } from "@/lib/auth";
import { money } from "@/lib/format";
import { getLang } from "@/lib/lang";
import { photoAt } from "@/lib/studio";
import { canViewPost, creators, isDropLocked, readDb } from "@/lib/store";

export default async function CallPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ ring?: string; error?: string }>;
}) {
  const lang = await getLang();
  const { username } = await params;
  const sp = await searchParams;
  const db = readDb();
  const list = creators(db);
  const creator = list.find((user) => user.username === username);
  if (!creator || creator.verified !== "verified") notFound();
  const viewer = await getSessionUser();
  if (!viewer) redirect(`/signup?next=${encodeURIComponent(`/call/${username}`)}`);
  const now = Date.now();
  const session = viewer
    ? db.calls.find((item) => item.fanId === viewer.id && item.creatorId === creator.id && new Date(item.paidUntil).getTime() > now)
    : undefined;
  const slot = list.findIndex((user) => user.id === creator.id);
  const ask = db.callAsks
    .filter((item) => item.fanId === viewer.id && item.creatorId === creator.id && item.status !== "closed")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const posts = db.posts
    .filter((post) => post.creatorId === creator.id && !isDropLocked(post))
    .slice(0, 6)
    .map((post, index) => {
      const visible = canViewPost(db, viewer, post);
      return {
        id: post.id,
        image: post.image || photoAt(slot + index + 1),
        caption: post.caption.split(".")[0]?.slice(0, 42) || "Post",
        locked: !visible,
        price: post.visibility === "ppv" ? money(post.price) : "",
        premium: !visible && post.visibility !== "ppv",
      };
    });

  return (
    <CallRoom
      name={creator.displayName.split(" ")[0]}
      username={creator.username}
      photo={photoAt(slot)}
      paidUntil={session?.paidUntil ?? null}
      ring={sp.ring === "1"}
      error={sp.error}
      posts={posts}
      ask={ask ? { status: ask.status, note: ask.note, createdAt: ask.createdAt } : null}
      lang={lang}
    />
  );
}
