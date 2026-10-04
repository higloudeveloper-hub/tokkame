import { CutPlayer } from "@/components/cut-player";
import { Flash } from "@/components/notices";
import { getLang } from "@/lib/lang";
import { CLIPS } from "@/lib/studio";
import { readDb } from "@/lib/store";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const sp = await searchParams;
  const lang = await getLang();
  const db = readDb();
  const extra = (db.cuts || []).map((cut) => {
    const clip = CLIPS.find((item) => item.id === cut.clipId);
    const user = db.users.find((item) => item.id === cut.userId);
    if (!clip) return null;
    return { id: cut.id, title: clip.title, creator: user?.displayName || clip.creator, src: clip.src, poster: clip.poster, caption: cut.caption };
  }).filter((item) => item !== null);

  const clips = [
    ...extra.reverse(),
    ...CLIPS.map((clip) => ({ id: clip.id, title: clip.title, creator: clip.creator, src: clip.src, poster: clip.poster })),
  ];

  return (
    <>
      <Flash ok={sp.ok} error={sp.error} />
      <CutPlayer clips={clips} lang={lang} />
    </>
  );
}
