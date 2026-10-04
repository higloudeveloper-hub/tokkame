import Link from "next/link";
import { Flash } from "@/components/notices";
import { PromoCard } from "@/components/promo-card";
import { ShareSheet } from "@/components/share-sheet";
import { follow } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { ago, money } from "@/lib/format";
import { getLang } from "@/lib/lang";
import { photoAt } from "@/lib/studio";
import { isDropLocked, readDb } from "@/lib/store";
import { presentPost, type PresentedPost } from "@/lib/view";

function face(username: string) {
  const n = [...username].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return photoAt(n);
}

function mediaOf(item: PresentedPost) {
  const clip = item.post.format === "clip" && item.visible && item.post.image ? `/media/${item.post.image}` : "";
  const photo = item.post.cover
    ? `/media/${item.post.cover}`
    : item.visible && item.post.image && item.post.format !== "clip"
      ? `/media/${item.post.image}`
      : face(item.creator.username);
  const locked = !item.visible;
  const tier = item.creator.tiers.find((entry) => entry.id === (item.post.minTier || "inner")) || item.creator.tiers[0];
  const options = !locked ? [] : item.post.visibility === "ppv"
    ? [{ kind: "ppv" as const, postId: item.post.id, label: `${money(item.post.price)}` }]
    : tier
      ? [{ kind: "sub" as const, creatorId: item.creator.id, tier: tier.id, label: `${tier.name} · ${money(tier.price)}` }]
      : [];
  return { clip, photo, options, locked: locked && !item.post.cover };
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const sp = await searchParams;
  const lang = await getLang();
  const es = lang === "es";
  const db = readDb();
  const viewer = await getSessionUser();
  const cards = db.posts
    .filter((post) => !isDropLocked(post))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 30)
    .map((post) => presentPost(db, post, viewer))
    .filter((item) => item !== null);

  const blocks: Array<{ kind: "post"; item: PresentedPost } | { kind: "strip"; items: PresentedPost[] }> = [];
  for (let i = 0; i < cards.length;) {
    blocks.push({ kind: "post", item: cards[i]! });
    i += 1;
    if (blocks.filter((block) => block.kind === "post").length % 3 === 0 && i < cards.length) {
      const items = cards.slice(i, i + 3);
      if (items.length) {
        blocks.push({ kind: "strip", items });
        i += items.length;
      }
    }
  }

  return (
    <div className="ig">
      <Flash ok={sp.ok} error={sp.error} />
      <header className="ig-top">
        <div>
          <p>{es ? "Para ti" : "For you"}</p>
          <strong>{es ? "Sigue bajando." : "Keep going."}</strong>
        </div>
        <Link href="/crear">{es ? "Crear" : "Create"}</Link>
      </header>
      {blocks.map((block) => {
        if (block.kind === "strip") {
          return (
            <div key={block.items.map((item) => item.post.id).join("-")} className="promo-row">
              {block.items.map((item) => {
                const media = mediaOf(item);
                return (
                  <PromoCard
                    key={item.post.id}
                    postId={item.post.id}
                    photo={media.photo}
                    clip={media.clip}
                    audio={item.post.audio ? `/media/${item.post.audio}` : ""}
                    track={item.post.track || ""}
                    locked={media.locked}
                    liked={item.liked}
                    count={item.post.likes.length}
                    signedIn={Boolean(viewer)}
                    options={media.options.map((option) => ({ ...option, label: `${es ? "Abrir" : "Open"} · ${option.label}` }))}
                  />
                );
              })}
            </div>
          );
        }
        const item = block.item;
        const media = mediaOf(item);
        return (
          <article key={item.post.id} id={item.post.id} className="ig-post feed-in">
            <header>
              <Link href={`/p/${item.creator.username}`}>
                <img src={face(item.creator.username)} alt="" />
                <span>
                  <b>{item.creator.username}</b>
                  <small suppressHydrationWarning>{ago(item.post.createdAt)}</small>
                </span>
              </Link>
              {viewer && viewer.id !== item.creator.id ? (
                <form action={follow}>
                  <input type="hidden" name="creatorId" value={item.creator.id} />
                  <button type="submit">{item.following ? (es ? "Siguiendo" : "Following") : (es ? "Seguir" : "Follow")}</button>
                </form>
              ) : null}
            </header>
            <PromoCard
              wide
              postId={item.post.id}
              photo={media.photo}
              clip={media.clip}
              audio={item.post.audio ? `/media/${item.post.audio}` : ""}
              track={item.post.track || ""}
              locked={media.locked}
              liked={item.liked}
              count={item.post.likes.length}
              signedIn={Boolean(viewer)}
              options={media.options.map((option) => ({ ...option, label: `${es ? "Abrir" : "Open"} · ${option.label}` }))}
            />
            <div className="ig-row">
              <ShareSheet
                lang={lang}
                path={`/p/${item.creator.username}`}
                title={item.creator.displayName}
                text={es ? `Mira el feed de @${item.creator.username} en Tokkame` : `Watch @${item.creator.username} on Tokkame`}
              />
            </div>
            <p className="ig-caption"><b>{item.creator.username}</b> {item.visible ? item.post.caption : (es ? "Post de pago." : "Paid post.")}</p>
          </article>
        );
      })}
    </div>
  );
}
