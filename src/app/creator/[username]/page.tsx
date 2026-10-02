import Link from "next/link";
import { ChatRoom } from "@/components/chat-room";
import { Decide } from "@/components/decide";
import { PayChoices, PaySheet } from "@/components/pay-choices";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/copy-button";
import { Flash } from "@/components/ui";
import { follow, subscribe, tip, unlock } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { ago, compact, money } from "@/lib/format";
import { getLang } from "@/lib/lang";
import { photoAt } from "@/lib/studio";
import {
  activeSub,
  creators,
  findCreator,
  followerCount,
  isFollowing,
  lowestPrice,
  readDb,
  subscriberCount,
} from "@/lib/store";
import { presentPost } from "@/lib/view";

const tabs = ["premium", "posts", "about"] as const;

export default async function CreatorPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string; error?: string; ok?: string; chat?: string }>;
}) {
  const lang = await getLang();
  const es = lang === "es";
  const { username } = await params;
  const sp = await searchParams;
  const db = readDb();
  const creator = findCreator(db, username);
  if (!creator || creator.suspended) notFound();
  const viewer = await getSessionUser();
  const raw = sp.tab === "circle" || sp.tab === "media" ? "premium" : sp.tab;
  const tab = tabs.includes(raw as (typeof tabs)[number]) ? (raw as (typeof tabs)[number]) : "posts";
  const posts = db.posts
    .filter((post) => post.creatorId === creator.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const cards = posts.map((post) => presentPost(db, post, viewer)).filter((item) => item !== null);
  const sub = viewer ? activeSub(db, viewer.id, creator.id) : null;
  const following = isFollowing(db, viewer?.id, creator.id);
  const slot = Math.max(0, creators(db).findIndex((user) => user.id === creator.id));
  const cover = `/look/v${(slot % 6) + 1}.mp4?v=2`;
  const poster = photoAt(slot);

  const canPay = creator.verified === "verified" && viewer?.id !== creator.id;
  const profilePath = `/creator/${creator.username}`;
  const lines = viewer
    ? db.messages
        .filter((item) => (item.fromId === viewer.id && item.toId === creator.id) || (item.fromId === creator.id && item.toId === viewer.id))
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .map((item) => ({
          id: item.id,
          mine: item.fromId === viewer.id,
          body: item.body,
          time: ago(item.createdAt),
        }))
    : [];

  const shots = tab === "posts" ? cards : [];
  const faces = [0, 1, 2, 3].map((step) => photoAt(slot + step));

  return (
    <ChatRoom
      startOpen={sp.chat === "1"}
      signedIn={Boolean(viewer)}
      following={following}
      profilePath={profilePath}
      creator={{ id: creator.id, name: creator.displayName, username: creator.username, photo: poster }}
      lines={lines}
      lang={lang}
      priceLabel={creator.messagePrice > 0 ? (es ? `${money(creator.messagePrice)} por mensaje. Privado. No es sexo.` : `${money(creator.messagePrice)} a message. Private. Not sex.`) : ""}
    >
      <Flash error={sp.error} ok={sp.ok} />
      <div className="profile-screen">
      <div className="face-slides">
        <div className="face-track">
          {faces.map((src, index) => (
            <figure key={src + index}>
              <img src={src} alt="" />
              {index === 0 ? (
                <figcaption>
                  <b>{creator.displayName}</b>
                  <span>{creator.verified === "verified" ? (es ? "Verificada" : "Verified") : (es ? "En revisión" : "In review")} · {es ? "Privado" : "Private"}</span>
                </figcaption>
              ) : (
                <figcaption><span>{index === 3 ? (es ? "Bloqueado" : "Locked") : (es ? "Más cerca" : "Closer")}</span></figcaption>
              )}
            </figure>
          ))}
        </div>
        <p>{creator.bio}</p>
        {creator.verified === "verified" && viewer?.id !== creator.id ? (
          <Decide
            name={creator.displayName.split(" ")[0]}
            photo={poster}
            unlockPrice={money(lowestPrice(creator))}
            unlockHref={`/creator/${creator.username}?tab=premium`}
            signedIn={Boolean(viewer)}
            profilePath={profilePath}
            lang={lang}
          />
        ) : null}
      </div>
      <section className="profile-stage">
        <div className="profile-hero">
          <video src={cover} poster={poster} autoPlay muted loop playsInline />
          <div className="profile-hero-copy">
            <img className="profile-avatar" src={poster} alt="" />
            <h1>{creator.displayName}</h1>
            <p>
              @{creator.username}
              {creator.verified === "verified" ? (es ? " · Verificada" : " · Verified") : (es ? " · En revisión" : " · In review")}
              {creator.shareRegion && creator.region ? ` · ${creator.region}` : ""}
            </p>
            <p className="profile-bio">{creator.bio}</p>
            <div className="profile-actions">
              {viewer && viewer.id !== creator.id ? (
                <form action={follow}>
                  <input type="hidden" name="creatorId" value={creator.id} />
                  <button className="ghost-btn" type="submit">{following ? (es ? "Siguiendo" : "Following") : (es ? "Seguir" : "Follow")}</button>
                </form>
              ) : null}
              <CopyButton path={`/@${creator.username}`} label={es ? "Copiar enlace" : "Copy link"} />
            </div>
            <div className="profile-stats">
              <div><b>{compact(followerCount(db, creator.id))}</b><span>{es ? "Seguidores" : "Followers"}</span></div>
              <div><b>{compact(subscriberCount(db, creator.id))}</b><span>{es ? "Desbloqueados" : "Unlocked"}</span></div>
              <div><b>{sub ? sub.tier : "—"}</b><span>{sub ? (es ? "Tu premium" : "Your premium") : (es ? "Sin desbloquear" : "Not unlocked")}</span></div>
            </div>
          </div>
        </div>

        <div className="profile-pane">
          <div className="tabs">
            {tabs.map((item) => (
              <Link key={item} className={`tab${tab === item ? " active" : ""}`} href={`/creator/${creator.username}?tab=${item}`}>
                {item === "premium" ? "Premium" : item === "posts" ? (es ? "Posts" : "Posts") : (es ? "Acerca de" : "About")}
              </Link>
            ))}
          </div>
          {tab === "premium" ? (
            <PremiumUnlock creatorId={creator.id} tiers={creator.tiers} verified={creator.verified === "verified"} own={viewer?.id === creator.id} loggedIn={Boolean(viewer)} es={es} lang={lang} />
          ) : null}
          {tab === "about" ? (
            <section className="panel">
              <h2>{es ? "Acerca de" : "About"}</h2>
              <p>{creator.bio || (es ? "Este perfil todavía no tiene bio." : "This profile has no bio yet.")}</p>
              <p className="tiny muted">{es ? "Se le paga por hablar, por la propina y por quien desbloquea premium." : "She is paid to talk, for the tip, and by whoever unlocks premium."}</p>
            </section>
          ) : null}
          {shots.length === 0 && tab === "posts" ? <p className="muted">{es ? "Todavía no hay nada aquí." : "Nothing here yet."}</p> : null}
          {shots.length > 0 ? (
            <div className="post-groups">
              {(["free", "locked"] as const).map((kind) => {
                const group = shots.filter((item) => (kind === "locked" ? !item.visible : item.visible));
                if (!group.length) return null;
                return (
                  <section key={kind} className="post-group">
                    <h3>{kind === "free" ? (es ? "Gratis" : "Free") : (es ? "Bloqueados" : "Locked")}</h3>
                    <div className="profile-mosaic">
                      {group.map((item) => (
                        <article key={item.post.id} className={`shot${item.visible ? " is-free" : " is-paid"}`}>
                          <img src={item.post.image || photoAt(slot + shots.indexOf(item))} alt="" />
                          <span>
                            <strong>{item.post.caption.split(".").slice(0, 1).join("").slice(0, 42)}</strong>
                            <em>{item.visible ? (es ? "Gratis" : "Free") : item.lock === "ppv" ? money(item.post.price) : "Premium"}</em>
                          </span>
                          {!item.visible && item.lock === "ppv" && viewer ? (
                            <form action={unlock}>
                              <input type="hidden" name="postId" value={item.post.id} />
                              <button className="red-btn" type="submit">{es ? "Desbloquear" : "Unlock"}</button>
                            </form>
                          ) : !item.visible ? (
                            <Link className="red-btn" href={viewer ? `/creator/${creator.username}?tab=premium` : "/login"}>{es ? "Desbloquear" : "Unlock"}</Link>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>

      <div className="pay-board slim">
        <article className="pay-card">
          <img src="/talk/listen.jpg" alt="" />
          <small>TALK</small>
          <strong>{creator.messagePrice > 0 ? money(creator.messagePrice) : "—"}</strong>
          <em>{es ? "por mensaje" : "per message"}</em>
          {canPay ? <Link className="red-btn" href={viewer ? `/call/${creator.username}` : `/signup?next=${encodeURIComponent(`/call/${creator.username}`)}`}>{es ? "Llamarla" : "Call her"}</Link> : null}
        </article>
        <article className="pay-card" id="tip">
          <img src="/talk/secret.jpg" alt="" />
          <small>TIP</small>
          <strong>$5–$50</strong>
          <em>{es ? "directo a ella" : "straight to her"}</em>
          {canPay ? (
            <PaySheet lang={lang} action={tip} hidden={[{ name: "creatorId", value: creator.id }]} title={es ? "Enviar propina" : "Send a tip"} amount="$5–$50" trigger={es ? "Enviar" : "Send"}>
              <select name="amount" defaultValue="10" aria-label={es ? "Monto de la propina" : "Tip amount"}>
                <option value="5">$5</option>
                <option value="10">$10</option>
                <option value="25">$25</option>
                <option value="50">$50</option>
              </select>
            </PaySheet>
          ) : null}
        </article>
        <article className="pay-card lead">
          <img src={poster} alt="" />
          <small>PREMIUM</small>
          <strong>{money(lowestPrice(creator))}</strong>
          <em>{es ? "para desbloquear" : "to unlock"}</em>
          <Link className="red-btn" href={`/creator/${creator.username}?tab=premium`}>{es ? "Desbloquear" : "Unlock"}</Link>
        </article>
      </div>
      </div>
    </ChatRoom>
  );
}

function PremiumUnlock({
  creatorId,
  tiers,
  verified,
  own,
  loggedIn,
  es,
  lang,
}: {
  creatorId: string;
  tiers: { id: string; name: string; price: number; perks: string[] }[];
  verified: boolean;
  own: boolean;
  loggedIn: boolean;
  es: boolean;
  lang: "en" | "es";
}) {
  if (own) return <div className="panel"><p>{es ? "Este es tu perfil público. Los tres precios se ajustan en el panel." : "This is your public profile. Set the three prices in the dashboard."}</p><Link className="red-btn" href="/dashboard">{es ? "Abrir ingresos" : "Open earnings"}</Link></div>;
  if (!verified) return <div className="panel"><h2>Premium</h2><p className="muted">{es ? "Todavía no puede cobrar. La verificación sigue abierta." : "She cannot charge yet. Verification is still open."}</p></div>;
  if (!loggedIn) return <div className="panel"><h2>Premium</h2><Link className="red-btn" href="/login">{es ? "Entra para desbloquear" : "Log in to unlock"}</Link></div>;
  return (
    <form action={subscribe} className="tier-board">
      <input type="hidden" name="creatorId" value={creatorId} />
      {tiers.map((tier, index) => (
        <label key={tier.id} className={`tier-pick${index === 1 ? " lead" : ""}`}>
          <input type="radio" name="tier" value={tier.id} defaultChecked={index === 1} />
          <small>{index === 1 ? (es ? "EL MÁS ELEGIDO" : "MOST CHOSEN") : "PREMIUM"}</small>
          <strong>{tier.name}</strong>
          <b>{money(tier.price)}<span>/mo</span></b>
          <em>{tier.perks.join(" · ")}</em>
        </label>
      ))}
      <PayChoices lang={lang} label={es ? "Desbloquear premium" : "Unlock premium"} />
      <p className="tiny muted">{es ? "Tokkame se queda con el 20% en esta demo. El resto es de ella." : "Tokkame keeps 20% in this demo. She keeps the rest."}</p>
    </form>
  );
}
