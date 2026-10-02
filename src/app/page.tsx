import Link from "next/link";
import { CallSlides } from "@/components/call-slides";
import { HeroBanner } from "@/components/hero-banner";
import { VideoRail } from "@/components/video-rail";
import { CLIPS, creatorCards } from "@/lib/studio";
import { readDb } from "@/lib/store";

export default function HomePage() {
  const cards = creatorCards(readDb());
  const featured = cards[0];
  const online = cards.filter((creator) => creator.online);

  return (
    <div className="studio solo">
      <div>
        <section className="phone-home">
          <CallSlides people={online} />
          <p className="phone-how">Call who is online. Then talk, tip, or unlock. Pay with Apple Pay, a card, or PayPal.</p>
          <div className="section-head">
            <h2>Online now</h2>
            <span>{online.length} on</span>
          </div>
          <div className="online-row">
            {online.map((creator) => (
              <Link key={creator.id} href={`/messages?with=${creator.id}`}>
                <img src={creator.photo} alt="" />
                <strong>{creator.name.split(" ")[0]}</strong>
                <span>Call {creator.talk}</span>
              </Link>
            ))}
          </div>
        </section>
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
                <span className="heart" aria-hidden>♡</span>
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
  );
}
