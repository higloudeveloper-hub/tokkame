import Link from "next/link";
import { notFound } from "next/navigation";
import { Flash } from "@/components/notices";
import { ShareSheet } from "@/components/share-sheet";
import { follow } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { money } from "@/lib/format";
import { getLang } from "@/lib/lang";
import { photoAt } from "@/lib/studio";
import { earnings, followerCount, isDropLocked, isFollowing, readDb } from "@/lib/store";
import { presentPost } from "@/lib/view";

function face(username: string) {
  const n = [...username].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return photoAt(n);
}

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ ok?: string; error?: string; tab?: string }>;
}) {
  const { username } = await params;
  const sp = await searchParams;
  const lang = await getLang();
  const es = lang === "es";
  const db = readDb();
  const person = db.users.find((user) => user.username === username.toLowerCase() && !user.suspended);
  if (!person) notFound();
  const viewer = await getSessionUser();
  const mine = viewer?.id === person.id;
  const following = isFollowing(db, viewer?.id, person.id);
  const tab = sp.tab === "gratis" || sp.tab === "pago" ? sp.tab : "todo";
  const posts = db.posts
    .filter((post) => post.creatorId === person.id && !isDropLocked(post))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const cards = posts.map((post) => presentPost(db, post, viewer)).filter((item) => item !== null);
  const shown = cards.filter((item) => {
    if (tab === "gratis") return item.post.visibility === "public";
    if (tab === "pago") return item.post.visibility === "ppv";
    return true;
  });
  const made = earnings(db, person.id);
  const tabs = [
    { id: "todo", es: "Todo", en: "All" },
    { id: "gratis", es: "Gratis", en: "Free" },
    { id: "pago", es: "De pago", en: "Paid" },
  ];

  return (
    <section className="ig ig-profile">
      <Flash ok={sp.ok} error={sp.error} />
      <header className="prof-head">
        <img src={face(person.username)} alt="" />
        <div>
          <h1>{person.displayName}</h1>
          <p>@{person.username}</p>
          <em>{person.verified === "verified" ? (es ? "Verificado · 80% de cada post de pago" : "Verified · 80% of each paid post") : (es ? "Posts gratis activos" : "Free posts are on")}</em>
        </div>
      </header>
      <div className="prof-stats">
        <div><b>{cards.length}</b><span>{es ? "posts" : "posts"}</span></div>
        <div><b>{followerCount(db, person.id)}</b><span>{es ? "seguidores" : "followers"}</span></div>
        <div><b>{money(made)}</b><span>{es ? "ganado" : "earned"}</span></div>
      </div>
      <p className="prof-bio">{person.bio || (es ? "Todavía sin bio." : "No bio yet.")}</p>
      <div className="prof-actions">
        {mine ? <Link className="red-btn" href="/crear">{es ? "Crear" : "Create"}</Link> : viewer ? (
          <form action={follow}>
            <input type="hidden" name="creatorId" value={person.id} />
            <button className="red-btn" type="submit">{following ? (es ? "Siguiendo" : "Following") : (es ? "Seguir" : "Follow")}</button>
          </form>
        ) : <Link className="red-btn" href={`/login?next=/p/${person.username}`}>{es ? "Seguir" : "Follow"}</Link>}
        <ShareSheet
          lang={lang}
          path={`/p/${person.username}`}
          title={person.displayName}
          text={es ? "Entra a mi perfil en Tokkame" : "Come to my Tokkame profile"}
          label={es ? "Compartir" : "Share"}
        />
      </div>
      <nav className="prof-tabs">
        {tabs.map((item) => (
          <Link key={item.id} href={item.id === "todo" ? `/p/${person.username}` : `/p/${person.username}?tab=${item.id}`} className={tab === item.id ? "on" : ""}>
            {es ? item.es : item.en}
          </Link>
        ))}
      </nav>
      <div className="ig-grid">
        {shown.map((item) => {
          const photo = item.post.cover ? `/media/${item.post.cover}` : item.post.image && item.visible ? `/media/${item.post.image}` : face(person.username);
          const locked = !item.visible && !item.post.cover;
          return (
            <Link key={item.post.id} href={`/#${item.post.id}`} className={locked ? "is-paid" : ""}>
              <img src={photo} alt="" />
              {item.post.visibility === "ppv" ? <b>{money(item.post.price)}</b> : null}
            </Link>
          );
        })}
      </div>
      {shown.length === 0 ? <p className="ig-note">{es ? "Nada en esta pestaña." : "Nothing in this tab."}</p> : null}
    </section>
  );
}
