import Link from "next/link";
import { ChatRoom, OpenChat } from "@/components/chat-room";
import { Decide } from "@/components/decide";
import { PayChoices, PaySheet } from "@/components/pay-choices";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/copy-button";
import { Flash } from "@/components/ui";
import { follow, subscribe, tip, unlock } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { ago, compact, money } from "@/lib/format";
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
      priceLabel={creator.messagePrice > 0 ? `${money(creator.messagePrice)} a message. Private. Not sex.` : ""}
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
                  <span>{creator.verified === "verified" ? "Verified" : "In review"} · Private</span>
                </figcaption>
              ) : (
                <figcaption><span>{index === 3 ? "Locked" : "Closer"}</span></figcaption>
              )}
            </figure>
          ))}
        </div>
        <p>{creator.bio}</p>
      </div>
      <section className="profile-stage">
        <div className="profile-hero">
          <video src={cover} poster={poster} autoPlay muted loop playsInline />
          <div className="profile-hero-copy">
            <img className="profile-avatar" src={poster} alt="" />
            <h1>{creator.displayName}</h1>
            <p>
              @{creator.username}
              {creator.verified === "verified" ? " · Verified" : " · In review"}
              {creator.shareRegion && creator.region ? ` · ${creator.region}` : ""}
            </p>
            <p className="profile-bio">{creator.bio}</p>
            <div className="profile-actions">
              {viewer && viewer.id !== creator.id ? (
                <form action={follow}>
                  <input type="hidden" name="creatorId" value={creator.id} />
                  <button className="ghost-btn" type="submit">{following ? "Following" : "Follow"}</button>
                </form>
              ) : null}
              <CopyButton path={`/@${creator.username}`} label="Copy link" />
            </div>
            <div className="profile-stats">
              <div><b>{compact(followerCount(db, creator.id))}</b><span>Followers</span></div>
              <div><b>{compact(subscriberCount(db, creator.id))}</b><span>Unlocked</span></div>
              <div><b>{sub ? sub.tier : "—"}</b><span>{sub ? "Your premium" : "Not unlocked"}</span></div>
            </div>
          </div>
        </div>

        <div className="profile-pane">
          <div className="tabs">
            {tabs.map((item) => (
              <Link key={item} className={`tab${tab === item ? " active" : ""}`} href={`/creator/${creator.username}?tab=${item}`}>
                {item === "premium" ? "Premium" : item === "posts" ? "Posts" : "About"}
              </Link>
            ))}
          </div>
          {tab === "premium" ? (
            <PremiumUnlock creatorId={creator.id} tiers={creator.tiers} verified={creator.verified === "verified"} own={viewer?.id === creator.id} loggedIn={Boolean(viewer)} />
          ) : null}
          {tab === "about" ? (
            <section className="panel">
              <h2>About</h2>
              <p>{creator.bio || "Este perfil todavía no tiene bio."}</p>
              <p className="tiny muted">She is paid to talk, for the tip, and by whoever unlocks premium.</p>
            </section>
          ) : null}
          {shots.length === 0 && tab === "posts" ? <p className="muted">Nothing here yet.</p> : null}
          {shots.length > 0 ? <div className="profile-mosaic">
          {shots.map((item, index) => (
            <article key={item.post.id} className="shot">
              <img src={photoAt(slot + index)} alt="" />
              <span>
                <strong>{item.post.caption.split(".").slice(0, 1).join("").slice(0, 42)}</strong>
                {!item.visible ? <em>{item.lock === "ppv" ? money(item.post.price) : "Premium"}</em> : <em>Open</em>}
              </span>
              {!item.visible && item.lock === "ppv" && viewer ? (
                <form action={unlock}>
                  <input type="hidden" name="postId" value={item.post.id} />
                  <button className="red-btn" type="submit">Unlock</button>
                </form>
              ) : !item.visible ? (
                <Link className="red-btn" href={viewer ? `/creator/${creator.username}?tab=premium` : "/login"}>Unlock</Link>
              ) : null}
            </article>
          ))}
          </div> : null}
        </div>
      </section>

      {creator.verified === "verified" && viewer?.id !== creator.id ? (
        <Decide
          name={creator.displayName.split(" ")[0]}
          photo={poster}
          callPrice={creator.messagePrice > 0 ? money(creator.messagePrice) : "Free"}
          unlockPrice={money(lowestPrice(creator))}
          unlockHref={`/creator/${creator.username}?tab=premium`}
          signedIn={Boolean(viewer)}
          profilePath={profilePath}
        />
      ) : null}
      <div className="pay-board slim">
        <article className="pay-card">
          <img src="/talk/listen.jpg" alt="" />
          <small>TALK</small>
          <strong>{creator.messagePrice > 0 ? money(creator.messagePrice) : "—"}</strong>
          <em>per message</em>
          {canPay ? <OpenChat className="red-btn">Talk</OpenChat> : null}
        </article>
        <article className="pay-card" id="tip">
          <img src="/talk/secret.jpg" alt="" />
          <small>TIP</small>
          <strong>$5–$50</strong>
          <em>straight to her</em>
          {canPay ? (
            <PaySheet action={tip} hidden={[{ name: "creatorId", value: creator.id }]} title="Send a tip" amount="$5–$50" trigger="Send">
              <select name="amount" defaultValue="10" aria-label="Tip amount">
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
          <em>to unlock</em>
          <Link className="red-btn" href={`/creator/${creator.username}?tab=premium`}>Unlock</Link>
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
}: {
  creatorId: string;
  tiers: { id: string; name: string; price: number; perks: string[] }[];
  verified: boolean;
  own: boolean;
  loggedIn: boolean;
}) {
  if (own) return <div className="panel"><p>This is your public profile. Set the three prices in the dashboard.</p><Link className="red-btn" href="/dashboard">Open earnings</Link></div>;
  if (!verified) return <div className="panel"><h2>Premium</h2><p className="muted">She cannot charge yet. Verification is still open.</p></div>;
  if (!loggedIn) return <div className="panel"><h2>Premium</h2><Link className="red-btn" href="/login">Log in to unlock</Link></div>;
  return (
    <form action={subscribe} className="tier-board">
      <input type="hidden" name="creatorId" value={creatorId} />
      {tiers.map((tier, index) => (
        <label key={tier.id} className={`tier-pick${index === 1 ? " lead" : ""}`}>
          <input type="radio" name="tier" value={tier.id} defaultChecked={index === 1} />
          <small>{index === 1 ? "MOST CHOSEN" : "PREMIUM"}</small>
          <strong>{tier.name}</strong>
          <b>{money(tier.price)}<span>/mo</span></b>
          <em>{tier.perks.join(" · ")}</em>
        </label>
      ))}
      <PayChoices label="Unlock premium" />
      <p className="tiny muted">Tokkame keeps 20% in this demo. She keeps the rest.</p>
    </form>
  );
}
