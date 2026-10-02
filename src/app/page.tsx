import Link from "next/link";
import { HeroBanner } from "@/components/hero-banner";
import { PhoneLuxury } from "@/components/phone-luxury";
import { VideoRail } from "@/components/video-rail";
import { CLIPS, creatorCards, photoAt } from "@/lib/studio";
import { isDropLocked, readDb } from "@/lib/store";

export default async function HomePage() {
  const db = readDb();
  const cards = creatorCards(db);
  const featured = cards[0];
  const online = cards.filter((creator) => creator.online);
  const posts = db.posts
    .filter((post) => !isDropLocked(post))
    .slice(0, 8)
    .map((post, index) => {
      const creator = cards.find((item) => item.id === post.creatorId);
      if (!creator) return null;
      return {
        id: post.id,
        name: creator.name,
        username: creator.username,
        photo: post.image || photoAt(index + 2),
        locked: post.visibility !== "public",
      };
    })
    .filter((post) => post !== null);

  return (
    <div className="studio solo">
      <div>
        <section className="phone-home">
          <PhoneLuxury
            live={online.map((creator) => ({
              id: creator.id,
              name: creator.name,
              username: creator.username,
              photo: creator.photo,
              clip: CLIPS.find((clip) => clip.username === creator.username)?.src,
            }))}
            more={cards.slice(0, 6).map((creator) => ({
              id: creator.id,
              name: creator.name,
              username: creator.username,
              photo: creator.photo,
            }))}
            posts={posts}
          />
        </section>
        <div className="desk-home">
        <div className="hero-row">
          <HeroBanner />
          {featured ? (
            <aside className="featured">
              <div className="soft">Here to listen</div>
              <div className="featured-head">
                <img src={featured.photo} alt="" />
                <div>
                  <strong>{featured.username.replace(".", "_")}</strong>
                  <span>{featured.category} & more</span>
                </div>
              </div>
              <div className="stat-3">
                <div><b>{featured.followers}</b><span>Followers</span></div>
                <div><b>{featured.subscribers}</b><span>Subscribers</span></div>
                <div><b>{featured.talk}</b><span>to talk</span></div>
              </div>
              <div className="featured-actions">
                <Link className="red-btn" href={`/messages?with=${featured.id}`}>Talk</Link>
              </div>
              <div className="thumbs">
                {cards.slice(0, 4).map((creator) => (
                  <Link key={creator.id} href={`/creator/${creator.username}`}>
                    <img src={creator.photo} alt="" />
                  </Link>
                ))}
              </div>
            </aside>
          ) : null}
        </div>

        <section className="talk-block">
          <div className="section-head">
            <div>
              <p className="kicker">Private · 18+</p>
              <h2>Talk about it</h2>
            </div>
            <Link href="/talk">Choose who</Link>
          </div>
          <div className="talk-grid">
            <Link className="talk-card" href="/talk#infidelity">
              <img src="/talk/infidelity.jpg?v=3" alt="" />
              <b>01</b>
              <span><small>Infidelity</small><strong>The part you<br />have not said.</strong></span>
            </Link>
            <Link className="talk-card" href="/talk#work">
              <img src="/talk/work.jpg?v=3" alt="" />
              <b>02</b>
              <span><small>Work</small><strong>When the day<br />will not end.</strong></span>
            </Link>
            <Link className="talk-card" href="/talk#secret">
              <img src="/talk/secret.jpg?v=3" alt="" />
              <b>03</b>
              <span><small>A secret</small><strong>One person.<br />Nobody else.</strong></span>
            </Link>
            <Link className="talk-card" href="/talk#listen">
              <img src="/talk/listen.jpg?v=3" alt="" />
              <b>04</b>
              <span><small>Just listen</small><strong>No advice.<br />No judgment.</strong></span>
            </Link>
          </div>
        </section>

        <VideoRail clips={CLIPS.slice(0, 3)} />

        <div className="section-head">
          <h2>Choose who</h2>
          <Link href="/discover">View all</Link>
        </div>
        <div className="trend-row">
          {cards.slice(0, 3).map((creator, index) => (
            <article key={creator.id} className="tcard" style={{ animationDelay: `${index * 50}ms` }}>
              <Link className="tcard-visual" href={`/creator/${creator.username}`}>
                <img src={creator.photo} alt="" />
                <span className="rank">#{index + 1}</span>
              </Link>
              <div className="tcard-meta">
                <strong>{creator.username.replace(".", "_")}</strong>
                <span>Talk {creator.talk} · Unlock {creator.price}</span>
              </div>
              <Link className="red-btn block" href={`/messages?with=${creator.id}`}>Talk</Link>
            </article>
          ))}
        </div>

        <section className="creator-banner">
          <div>
            <div className="soft">FOR CREATORS</div>
            <strong style={{ fontSize: 22 }}>Turn Your Audience into Income.</strong>
            <p>Powerful tools, flexible monetization, and a platform built for you.</p>
          </div>
          <Link className="red-btn" href="/signup?as=creator">Start Creating</Link>
          <div className="chips">
            <span>Subscriptions</span>
            <span>Premium Content</span>
            <span>Messaging</span>
          </div>
        </section>
        </div>
      </div>
    </div>
  );
}
