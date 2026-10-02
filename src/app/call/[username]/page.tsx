import { notFound } from "next/navigation";
import { CallRoom } from "@/components/call-room";
import { getSessionUser } from "@/lib/auth";
import { photoAt } from "@/lib/studio";
import { creators, readDb } from "@/lib/store";

export default async function CallPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ ring?: string; error?: string }>;
}) {
  const { username } = await params;
  const sp = await searchParams;
  const db = readDb();
  const list = creators(db);
  const creator = list.find((user) => user.username === username);
  if (!creator || creator.verified !== "verified") notFound();
  const viewer = await getSessionUser();
  const now = Date.now();
  const session = viewer
    ? db.calls.find((item) => item.fanId === viewer.id && item.creatorId === creator.id && new Date(item.paidUntil).getTime() > now)
    : undefined;
  const slot = list.findIndex((user) => user.id === creator.id);

  return (
    <CallRoom
      name={creator.displayName.split(" ")[0]}
      username={creator.username}
      photo={photoAt(slot)}
      paidUntil={session?.paidUntil ?? null}
      ring={sp.ring === "1"}
      error={sp.error}
    />
  );
}
