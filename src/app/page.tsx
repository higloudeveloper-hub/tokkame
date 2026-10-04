import Link from "next/link";
import { Flash } from "@/components/notices";
import { ShareSheet } from "@/components/share-sheet";
import { TrackButton } from "@/components/track-button";
import { follow, likePost, unlock } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { ago, money } from "@/lib/format";
import { getLang } from "@/lib/lang";
import { retoFor, trackFor } from "@/lib/kit";
import { photoAt } from "@/lib/studio";
import { creators, isDropLocked, readDb } from "@/lib/store";
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
  const people = creators(db).filter((user) => user.verified === "verified");
  const cards = db.posts
    .filter((post) => !isDropLocked(post))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 24)
    .map((post) => presentPost(db, post, viewer))
    .filter((item) => item !== null);

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
      <div className="ig-stories">
        {people.map((person) => (
          <Link key={person.id} href={`/p/${person.username}`}>
            <img src={face(person.username)} alt="" />
            <span>{person.displayName.split(" ")[0]}</span>
          </Link>
        ))}
      </div>
      {cards.map((item) => {
        const reto = retoFor(item.post);
        const track = trackFor(item.post);
        const photo = item.post.image && item.visible ? `/media/${item.post.image}` : face(item.creator.username);
        const clipN = [...item.creator.username].reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const clip = item.post.format === "clip" && item.visible ? `/look/v${(clipN % 6) + 1}.mp4?v=2` : "";
        const paid = !item.visible && item.lock === "ppv";
        return (
          <article key={item.post.id} id={item.post.id} className="ig-post">
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
            <div className={`ig-photo${item.visible ? "" : " is-paid"}`}>
              {clip ? <video src={clip} poster={photo} autoPlay muted loop playsInline /> : <img src={photo} alt="" />}
              {paid ? (
                <div className="ig-pay">
                  {viewer ? (
                    <form action={unlock}>
                      <input type="hidden" name="postId" value={item.post.id} />
                      <button type="submit">{es ? "Abrir" : "Open"} {money(item.post.price)}</button>
                    </form>
                  ) : (
                    <Link href="/login">{es ? "Entra para abrir" : "Log in to open"} {money(item.post.price)}</Link>
                  )}
                </div>
              ) : null}
              {!item.visible && !paid ? (
                <div className="ig-pay">
                  <Link href={viewer ? `/p/${item.creator.username}` : "/login"}>{es ? "Ver en el perfil" : "See on the profile"}</Link>
                </div>
              ) : null}
            </div>
            <div className="ig-row">
              <form action={likePost}>
                <input type="hidden" name="postId" value={item.post.id} />
                <button type="submit">{item.liked ? "♥" : "♡"} {item.post.likes.length}</button>
              </form>
              <TrackButton track={track} lang={lang} />
              <ShareSheet
                lang={lang}
                path={`/p/${item.creator.username}`}
                title={item.creator.displayName}
                text={es ? `Mira el feed de @${item.creator.username} en Tokkame` : `Watch @${item.creator.username} on Tokkame`}
              />
            </div>
            {reto ? <Link className="ig-reto" href={`/retos#${reto.id}`}>{es ? reto.es : reto.en}</Link> : null}
            {item.visible ? <p className="ig-caption"><b>{item.creator.username}</b> {item.post.caption}</p> : <p className="ig-caption">{es ? "Post de pago. Se abre con saldo de prueba." : "Paid post. It opens with sandbox balance."}</p>}
          </article>
        );
      })}
    </div>
  );
}
