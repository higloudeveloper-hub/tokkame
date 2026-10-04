import Link from "next/link";
import { Flash } from "@/components/notices";
import { PromoCard } from "@/components/promo-card";
import { ShareSheet } from "@/components/share-sheet";
import { follow } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { money } from "@/lib/format";
import { getLang } from "@/lib/lang";
import { photoAt } from "@/lib/studio";
import { isDropLocked, readDb } from "@/lib/store";
import { presentPost } from "@/lib/view";

function face(username: string) {
  const n = [...username].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return photoAt(n);
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
    .map((post) => presentPost(db, post, viewer))
    .filter((item) => item !== null);

  const groups = [...new Set(cards.map((item) => item.creator.id))].map((id) => {
    const posts = cards.filter((item) => item.creator.id === id).slice(0, 8);
    return { creator: posts[0]!.creator, following: posts[0]!.following, posts };
  });

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
      {groups.map((group) => (
        <section key={group.creator.id} className="ig-block">
          <header className="ig-post">
            <div className="ig-row" style={{ paddingTop: 12 }}>
              <Link href={`/p/${group.creator.username}`}>
                <img src={face(group.creator.username)} alt="" />
                <b>{group.creator.username}</b>
              </Link>
              {viewer && viewer.id !== group.creator.id ? (
                <form action={follow}>
                  <input type="hidden" name="creatorId" value={group.creator.id} />
                  <button type="submit">{group.following ? (es ? "Siguiendo" : "Following") : (es ? "Seguir" : "Follow")}</button>
                </form>
              ) : null}
              <ShareSheet
                lang={lang}
                path={`/p/${group.creator.username}`}
                title={group.creator.displayName}
                text={es ? `Mira el feed de @${group.creator.username} en Tokkame` : `Watch @${group.creator.username} on Tokkame`}
              />
            </div>
          </header>
          <div className="promo-row">
            {group.posts.map((item) => {
              const photo = (item.visible && item.post.image ? `/media/${item.post.image}` : "") || (item.post.cover ? `/media/${item.post.cover}` : "") || face(item.creator.username);
              const locked = !item.visible;
              const tier = item.creator.tiers.find((entry) => entry.id === (item.post.minTier || "inner")) || item.creator.tiers[0];
              const options = !locked ? [] : item.post.visibility === "ppv"
                ? [{ kind: "ppv" as const, postId: item.post.id, label: `${es ? "Abrir" : "Open"} · ${money(item.post.price)}` }]
                : tier
                  ? [{ kind: "sub" as const, creatorId: item.creator.id, tier: tier.id, label: `${tier.name} · ${money(tier.price)}` }]
                  : [];
              return (
                <PromoCard
                  key={`${item.post.id}-${item.liked}-${item.post.likes.length}`}
                  postId={item.post.id}
                  photo={photo}
                  locked={locked && !item.post.cover}
                  liked={item.liked}
                  count={item.post.likes.length}
                  signedIn={Boolean(viewer)}
                  options={options}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
