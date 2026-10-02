import Link from "next/link";
import { ago, money } from "@/lib/format";
import type { PresentedPost } from "@/lib/view";
import { comment, follow, likePost, remixPost, reportContent, unlock } from "@/lib/actions";
import { getLang } from "@/lib/lang";
import { Avatar } from "./ui";
import { MediaArt } from "./media-art";

const lockCopy = {
  login: "Entra para ver esto.",
  circle: "Esto vive en el Circle.",
  tier: "Tu nivel no incluye esta publicación.",
  ppv: "Publicación suelta.",
  drop: "El drop todavía no abre.",
};

export async function FeedCard({ item, viewer, poster }: { item: PresentedPost; viewer: boolean; poster?: string }) {
  const es = (await getLang()) === "es";
  const { post, creator } = item;
  return (
    <article className="panel" style={{ padding: 12 }}>
      <MediaArt media={post.media} image={post.image} poster={poster} locked={!item.visible} format={post.format}>
        {!item.visible && item.lock ? (
        <div className="lock-note">
          <strong>{lockCopy[item.lock]}</strong>
          <p className="tiny muted" style={{ margin: "6px 0 10px" }}>
            {item.lock === "ppv"
              ? `${es ? "Desbloquear" : "Unlock"} ${money(post.price)}`
              : item.lock === "drop"
                ? "El contenido abre a la hora anunciada."
                : item.lock === "login"
                  ? "Entra para seguir, desbloquear o suscribirte."
                  : "Suscríbete para entrar al Circle."}
          </p>
          {item.lock === "ppv" && viewer ? (
            <form action={unlock}>
              <input type="hidden" name="postId" value={post.id} />
              <button className="btn small" type="submit">{es ? "Desbloquear" : "Unlock"} {money(post.price)}</button>
            </form>
          ) : (
            <Link className="btn small" href={viewer ? `/creator/${creator.username}` : "/login"}>
              {viewer ? "Ver Circle" : "Entrar"}
            </Link>
          )}
        </div>
        ) : null}
      </MediaArt>
      <div className="creator-line">
        <Avatar hue={creator.avatarHue} name={creator.displayName} />
        <div className="grow">
          <Link href={`/creator/${creator.username}`}>
            <strong>{creator.displayName}</strong>
          </Link>
          <div className="tiny muted" suppressHydrationWarning>@{creator.username} · {ago(post.createdAt)}</div>
        </div>
        {viewer && creator.id ? (
          <form action={follow}>
            <input type="hidden" name="creatorId" value={creator.id} />
            <button className="btn ghost small" type="submit">{item.following ? "Siguiendo" : "Follow"}</button>
          </form>
        ) : null}
      </div>
      {item.visible || item.lock === "drop" ? <p style={{ marginTop: 0 }}>{post.caption}</p> : null}
      {item.remixUsername ? (
        <p className="tiny muted">Remix de @{item.remixUsername}</p>
      ) : null}
      <div className="actions">
        <form action={likePost}>
          <input type="hidden" name="postId" value={post.id} />
          <button className="btn ghost small" type="submit">{item.liked ? "♥" : "♡"} {post.likes.length}</button>
        </form>
        <span className="icon-count">💬 {post.comments.length}</span>
        {!item.subscribed && creator.verified === "verified" ? (
          <Link className="btn small" href={`/creator/${creator.username}?tab=circle`}>Subscribe</Link>
        ) : null}
      </div>
      {item.visible && item.comments.length > 0 ? (
        <div className="list" style={{ marginTop: 10 }}>
          {item.comments.map((entry) => (
            <p key={entry.id} className="tiny" style={{ margin: 0 }}>
              <strong>@{entry.username}</strong> {entry.text}
            </p>
          ))}
        </div>
      ) : null}
      {item.visible && viewer ? (
        <form action={comment} className="form-grid" style={{ marginTop: 10 }}>
          <input type="hidden" name="postId" value={post.id} />
          <input name="text" placeholder="Comenta" maxLength={280} />
        </form>
      ) : null}
      {item.visible && post.allowRemix && post.visibility === "public" && viewer ? (
        <details style={{ marginTop: 10 }}>
          <summary className="tiny">Remix</summary>
          <form action={remixPost} className="form-grid" style={{ marginTop: 8 }}>
            <input type="hidden" name="postId" value={post.id} />
            <textarea name="caption" placeholder="Tu respuesta, reacción o colaboración" maxLength={500} />
            <button className="btn small" type="submit">Publicar remix</button>
          </form>
        </details>
      ) : null}
      {viewer ? (
        <details style={{ marginTop: 8 }}>
          <summary className="tiny muted">Reportar</summary>
          <form action={reportContent} className="form-grid" style={{ marginTop: 8 }}>
            <input type="hidden" name="postId" value={post.id} />
            <input type="hidden" name="targetUserId" value={creator.id} />
            <input name="reason" placeholder="Qué hay que revisar" maxLength={400} />
            <button className="btn ghost small" type="submit">Enviar reporte</button>
          </form>
        </details>
      ) : null}
    </article>
  );
}
