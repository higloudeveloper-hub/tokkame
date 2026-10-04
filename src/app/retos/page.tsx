import Link from "next/link";
import { getLang } from "@/lib/lang";
import { RETOS, retoFor } from "@/lib/kit";
import { photoAt } from "@/lib/studio";
import { isDropLocked, readDb } from "@/lib/store";

export default async function RetosPage() {
  const lang = await getLang();
  const es = lang === "es";
  const db = readDb();
  const posts = db.posts.filter((post) => !isDropLocked(post));

  return (
    <section className="ig">
      <p className="ig-kicker">{es ? "Retos" : "Challenges"}</p>
      <h1 className="ig-title">{es ? "Crea dentro de un reto." : "Create inside a challenge."}</h1>
      <p className="ig-note">{es ? "El reto se ve en el feed. La gente entra a tu perfil desde ahí." : "The challenge shows on the feed. People reach your profile from there."}</p>
      {RETOS.map((reto) => {
        const hits = posts.filter((post) => retoFor(post)?.id === reto.id);
        return (
          <article key={reto.id} id={reto.id} className="ig-reto-card">
            <h2>{es ? reto.es : reto.en}</h2>
            <p>{es ? reto.detail.es : reto.detail.en}</p>
            <div className="ig-grid">
              {hits.slice(0, 6).map((post) => {
                const user = db.users.find((item) => item.id === post.creatorId);
                const n = [...(user?.username || "a")].reduce((sum, char) => sum + char.charCodeAt(0), 0);
                return user ? <Link key={post.id} href={`/p/${user.username}`}><img src={photoAt(n)} alt="" /></Link> : null;
              })}
            </div>
            <Link className="red-btn" href={`/crear?reto=${reto.id}`}>{es ? "Entrar al reto" : "Join the challenge"} · {hits.length}</Link>
          </article>
        );
      })}
    </section>
  );
}
