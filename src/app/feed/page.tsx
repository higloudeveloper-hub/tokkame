import Link from "next/link";
import { redirect } from "next/navigation";
import { FeedCard } from "@/components/feed-card";
import { Flash, Footer } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { until, when } from "@/lib/format";
import { creators, findUserById, publicPosts, readDb, upcomingDrops } from "@/lib/store";
import { getLang } from "@/lib/lang";
import { presentPost } from "@/lib/view";

const tabs = [
  { id: "foryou", en: "For You", es: "Para ti" },
  { id: "following", en: "Following", es: "Siguiendo" },
  { id: "trending", en: "Trending", es: "Tendencias" },
  { id: "new", en: "New", es: "Nuevo" },
] as const;

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; error?: string; ok?: string }>;
}) {
  const lang = await getLang();
  const sp = await searchParams;
  const tab = tabs.some((item) => item.id === sp.tab) ? sp.tab! : "foryou";
  if (tab === "trending") redirect("/trending");
  const db = readDb();
  const viewer = await getSessionUser();
  let posts = publicPosts(db);
  if (tab === "following") {
    const ids = new Set(db.follows.filter((item) => item.userId === viewer?.id).map((item) => item.creatorId));
    posts = posts.filter((post) => ids.has(post.creatorId));
  } else if (tab === "trending") {
    posts = [...posts].sort((a, b) => b.likes.length - a.likes.length);
  } else if (tab === "new") {
    const fresh = new Set(
      creators(db)
        .filter((user) => Date.now() - new Date(user.createdAt).getTime() < 21 * 86400000)
        .map((user) => user.id),
    );
    posts = posts.filter((post) => fresh.has(post.creatorId));
  } else {
    posts = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  if (tab !== "trending") {
    posts = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  const cards = posts.map((post) => presentPost(db, post, viewer)).filter((item) => item !== null);
  const drops = upcomingDrops(db).slice(0, 4);
  const suggested = creators(db).filter((user) => user.verified === "verified").slice(0, 4);

  return (
    <>
      <Flash error={sp.error} ok={sp.ok} />
      <div className="tabs" style={{ marginBottom: 16 }}>
        {tabs.map((item) => (
          <Link key={item.id} className={`tab${tab === item.id ? " active" : ""}`} href={`/feed?tab=${item.id}`}>
            {lang === "es" ? item.es : item.en}
          </Link>
        ))}
      </div>
      <div className="feed-layout">
        <section className="list">
          {cards.length === 0 ? (
            <div className="panel">
              <h2 className="display">Nada en esta vista</h2>
              <p className="muted">
                {tab === "following" ? "Sigue creadores y su contenido público aparece aquí." : "Cuando haya publicaciones públicas, caen en este feed."}
              </p>
              <Link className="btn" href="/discover">{lang === "es" ? "Descubrir" : "Discover"}</Link>
            </div>
          ) : (
            cards.map((item) => <FeedCard key={item.post.id} item={item} viewer={Boolean(viewer)} />)
          )}
        </section>
        <aside className="list">
          <div className="panel">
            <p className="kicker">Drops</p>
            <h2 className="display" style={{ fontSize: 32 }}>Próximos momentos</h2>
            {drops.map((drop) => {
              const creator = findUserById(db, drop.creatorId);
              if (!creator) return null;
              return (
                <Link key={drop.id} href={`/creator/${creator.username}?tab=drops`} className="person">
                  <span>
                    <strong>{creator.displayName}</strong>
                    <span className="tiny muted" style={{ display: "block" }} suppressHydrationWarning>
                      {when(drop.dropAt!)} · {until(drop.dropAt!)}
                    </span>
                  </span>
                </Link>
              );
            })}
            <Link href="/drops">Ver todos</Link>
          </div>
          <div className="panel">
            <h2 className="display" style={{ fontSize: 28 }}>Para conocer</h2>
            {suggested.map((creator) => (
              <Link key={creator.id} href={`/creator/${creator.username}`} className="person">
                <strong>{creator.displayName}</strong>
                <span className="tiny muted">@{creator.username}</span>
              </Link>
            ))}
          </div>
        </aside>
      </div>
      <Footer />
    </>
  );
}
