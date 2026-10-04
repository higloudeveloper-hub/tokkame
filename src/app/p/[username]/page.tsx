import Link from "next/link";
import { notFound } from "next/navigation";
import { Flash } from "@/components/notices";
import { ShareSheet } from "@/components/share-sheet";
import { follow } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { money } from "@/lib/format";
import { getLang } from "@/lib/lang";
import { photoAt } from "@/lib/studio";
import { earnings, followerCount, isDropLocked, readDb } from "@/lib/store";
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
  searchParams: Promise<{ ok?: string; error?: string }>;
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
  const posts = db.posts
    .filter((post) => post.creatorId === person.id && !isDropLocked(post))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const cards = posts.map((post) => presentPost(db, post, viewer)).filter((item) => item !== null);
  const made = earnings(db, person.id);

  return (
    <section className="ig ig-profile">
      <Flash ok={sp.ok} error={sp.error} />
      <header>
        <img src={face(person.username)} alt="" />
        <div>
          <h1>{person.displayName}</h1>
          <p>@{person.username}</p>
          <ul>
            <li><b>{cards.length}</b> {es ? "posts" : "posts"}</li>
            <li><b>{followerCount(db, person.id)}</b> {es ? "seguidores" : "followers"}</li>
            <li><b>{money(made)}</b> {es ? "ganado" : "earned"}</li>
          </ul>
        </div>
      </header>
      <p className="ig-bio">{person.bio || (es ? "Todavía sin bio." : "No bio yet.")}</p>
      <p className="ig-note">{person.verified === "verified" ? (es ? "Verificado. Cada post de pago deja el 80% en este perfil." : "Verified. Each paid post leaves 80% on this profile.") : (es ? "Los posts gratis ya se ven. Cobrar se activa con la verificación." : "Free posts are already visible. Charging turns on after verification.")}</p>
      <div className="ig-profile-actions">
        {mine ? <Link className="red-btn" href="/crear">{es ? "Crear" : "Create"}</Link> : viewer ? (
          <form action={follow}>
            <input type="hidden" name="creatorId" value={person.id} />
            <button className="red-btn" type="submit">{es ? "Seguir" : "Follow"}</button>
          </form>
        ) : <Link className="red-btn" href={`/login?next=/p/${person.username}`}>{es ? "Seguir" : "Follow"}</Link>}
        <ShareSheet
          lang={lang}
          path={`/p/${person.username}`}
          title={person.displayName}
          text={es ? `Entra a mi perfil en Tokkame` : `Come to my Tokkame profile`}
          label={es ? "Compartir feed" : "Share feed"}
        />
      </div>
      <div className="ig-grid">
        {cards.map((item) => {
          const photo = item.post.image && item.visible ? `/media/${item.post.image}` : face(person.username);
          return (
            <Link key={item.post.id} href={`/#${item.post.id}`} className={item.visible ? "" : "is-paid"}>
              <img src={photo} alt="" />
              {!item.visible && item.post.visibility === "ppv" ? <b>{money(item.post.price)}</b> : null}
            </Link>
          );
        })}
      </div>
      {cards.length === 0 ? <p className="ig-note">{es ? "Este feed todavía está vacío." : "This feed is still empty."}</p> : null}
    </section>
  );
}
