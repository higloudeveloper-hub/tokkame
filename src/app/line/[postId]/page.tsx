import Link from "next/link";
import { notFound } from "next/navigation";
import { openNow, takeSeat } from "@/lib/actions";
import { Flash } from "@/components/notices";
import { getSessionUser } from "@/lib/auth";
import { getLang } from "@/lib/lang";
import { photoAt } from "@/lib/studio";
import { canViewPost, creators, LINE_GOAL, lineSeats, OPEN_PRICE, readDb, SEAT_PRICE } from "@/lib/store";

export default async function LinePage({
  params,
  searchParams,
}: {
  params: Promise<{ postId: string }>;
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { postId } = await params;
  const sp = await searchParams;
  const lang = await getLang();
  const es = lang === "es";
  const db = readDb();
  const post = db.posts.find((item) => item.id === postId && item.visibility === "ppv");
  if (!post) notFound();
  const list = creators(db);
  const creator = list.find((user) => user.id === post.creatorId);
  if (!creator || creator.verified !== "verified") notFound();
  const viewer = await getSessionUser();
  const user = viewer ? db.users.find((item) => item.id === viewer.id) ?? null : null;
  const seats = lineSeats(db, post.id);
  const filled = Math.min(LINE_GOAL, seats.length);
  const open = filled >= LINE_GOAL;
  const mine = Boolean(viewer && seats.some((item) => item.userId === viewer.id));
  const seen = canViewPost(db, user, post);
  const slot = Math.max(0, list.findIndex((user) => user.id === creator.id));
  const photo = post.image || photoAt(slot);

  return (
    <section className="line-page">
      <Flash error={sp.error} ok={sp.ok} />
      <p className="kicker">{es ? "La fila" : "The line"}</p>
      <h1>{creator.displayName.split(" ")[0]}</h1>
      <p className="line-count"><b>{filled}</b><span>/ {LINE_GOAL}</span></p>
      <div className="line-track" aria-hidden><i style={{ width: `${(filled / LINE_GOAL) * 100}%` }} /></div>
      <p className="line-left">{open ? (es ? "La fila abrió. Quien pagó puesto ya lo tiene." : "The line opened. Everyone who paid for a seat has it.") : (es ? `Faltan ${LINE_GOAL - filled} puestos.` : `${LINE_GOAL - filled} seats left.`)}</p>
      <figure className={seen ? "line-shot open" : "line-shot"}>
        <img src={photo} alt="" />
      </figure>
      <p className="line-rule">{es ? "Un puesto cuesta $2. Cuando llegan a 24, el archivo abre para esa fila. Si no quieres esperar, lo abres ya por $19. Nadie tiene que estar en línea." : "A seat is $2. At 24, the file opens for that line. If you do not want to wait, open it now for $19. Nobody has to be online."}</p>
      {seen ? <p className="line-left">{es ? "Ya es tuyo." : "It is yours."}</p> : null}
      {!seen && !open ? (
        <div className="line-actions">
          <form action={takeSeat}>
            <input type="hidden" name="postId" value={post.id} />
            <button className="red-btn" type="submit">{mine ? (es ? "Ya tienes puesto" : "You have a seat") : (es ? `Tomar puesto · $${SEAT_PRICE}` : `Take a seat · $${SEAT_PRICE}`)}</button>
          </form>
          <form action={openNow}>
            <input type="hidden" name="postId" value={post.id} />
            <button className="ghost-btn" type="submit">{es ? `Abrir ya · $${OPEN_PRICE}` : `Open now · $${OPEN_PRICE}`}</button>
          </form>
        </div>
      ) : null}
      <Link href={`/creator/${creator.username}`}>{es ? "Ver su página" : "See her page"}</Link>
    </section>
  );
}
