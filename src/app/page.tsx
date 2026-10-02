import Link from "next/link";
import { cookies } from "next/headers";
import { HeroBanner } from "@/components/hero-banner";
import { LangSelect } from "@/components/lang-select";
import { PhoneLuxury } from "@/components/phone-luxury";
import { VideoRail } from "@/components/video-rail";
import { CLIPS, creatorCards, photoAt } from "@/lib/studio";
import { isDropLocked, readDb } from "@/lib/store";

const desk = {
  en: {
    listen: "Here to listen",
    more: "more",
    followers: "Followers",
    subscribers: "Subscribers",
    toTalk: "to talk",
    talk: "Talk",
    private: "Private · 18+",
    about: "Talk about it",
    choose: "Choose who",
    cards: [
      ["Infidelity", "The part you", "have not said."],
      ["Work", "When the day", "will not end."],
      ["A secret", "One person.", "Nobody else."],
      ["Just listen", "No advice.", "No judgment."],
    ],
    view: "View all",
    forCreators: "FOR CREATORS",
    income: "Turn Your Audience into Income.",
    tools: "Powerful tools, flexible monetization, and a platform built for you.",
    start: "Start Creating",
    chips: ["Subscriptions", "Premium Content", "Messaging"],
  },
  es: {
    listen: "Aquí para escuchar",
    more: "más",
    followers: "Seguidores",
    subscribers: "Suscriptores",
    toTalk: "para hablar",
    talk: "Hablar",
    private: "Privado · 18+",
    about: "Habla de eso",
    choose: "Elegir quién",
    cards: [
      ["Infidelidad", "Lo que no", "has dicho."],
      ["Trabajo", "Cuando el día", "no termina."],
      ["Un secreto", "Una persona.", "Nadie más."],
      ["Solo escuchar", "Sin consejos.", "Sin juicio."],
    ],
    view: "Ver todas",
    forCreators: "PARA CREADORAS",
    income: "Convierte a tu audiencia en ingreso.",
    tools: "Herramientas claras y una plataforma hecha para ti.",
    start: "Empezar a crear",
    chips: ["Suscripciones", "Contenido premium", "Mensajes"],
  },
} as const;

export default async function HomePage() {
  const jar = await cookies();
  const lang = jar.get("tokkame_lang")?.value === "es" ? "es" : "en";
  const d = desk[lang];
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
        <LangSelect lang={lang} />
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
            lang={lang}
          />
        </section>
        <div className="desk-home">
        <div className="hero-row">
          <HeroBanner lang={lang} />
          {featured ? (
            <aside className="featured">
              <div className="soft">{d.listen}</div>
              <div className="featured-head">
                <img src={featured.photo} alt="" />
                <div>
                  <strong>{featured.username.replace(".", "_")}</strong>
                  <span>{featured.category} & {d.more}</span>
                </div>
              </div>
              <div className="stat-3">
                <div><b>{featured.followers}</b><span>{d.followers}</span></div>
                <div><b>{featured.subscribers}</b><span>{d.subscribers}</span></div>
                <div><b>{featured.talk}</b><span>{d.toTalk}</span></div>
              </div>
              <div className="featured-actions">
                <Link className="red-btn" href={`/messages?with=${featured.id}`}>{d.talk}</Link>
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
                <p className="kicker">{d.private}</p>
                <h2>{d.about}</h2>
              </div>
              <Link href="/talk">{d.choose}</Link>
          </div>
          <div className="talk-grid">
            <Link className="talk-card" href="/talk#infidelity">
              <img src="/talk/infidelity.jpg?v=3" alt="" />
              <b>01</b>
              <span><small>{d.cards[0][0]}</small><strong>{d.cards[0][1]}<br />{d.cards[0][2]}</strong></span>
            </Link>
            <Link className="talk-card" href="/talk#work">
              <img src="/talk/work.jpg?v=3" alt="" />
              <b>02</b>
              <span><small>{d.cards[1][0]}</small><strong>{d.cards[1][1]}<br />{d.cards[1][2]}</strong></span>
            </Link>
            <Link className="talk-card" href="/talk#secret">
              <img src="/talk/secret.jpg?v=3" alt="" />
              <b>03</b>
              <span><small>{d.cards[2][0]}</small><strong>{d.cards[2][1]}<br />{d.cards[2][2]}</strong></span>
            </Link>
            <Link className="talk-card" href="/talk#listen">
              <img src="/talk/listen.jpg?v=3" alt="" />
              <b>04</b>
              <span><small>{d.cards[3][0]}</small><strong>{d.cards[3][1]}<br />{d.cards[3][2]}</strong></span>
            </Link>
          </div>
        </section>

        <VideoRail clips={CLIPS.slice(0, 3)} />

        <div className="section-head">
          <h2>{d.choose}</h2>
          <Link href="/discover">{d.view}</Link>
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
                <span>{d.talk} {creator.talk} · Unlock {creator.price}</span>
              </div>
              <Link className="red-btn block" href={`/messages?with=${creator.id}`}>{d.talk}</Link>
            </article>
          ))}
        </div>

        <section className="creator-banner">
          <div>
            <div className="soft">{d.forCreators}</div>
            <strong style={{ fontSize: 22 }}>{d.income}</strong>
            <p>{d.tools}</p>
          </div>
          <Link className="red-btn" href="/signup?as=creator">{d.start}</Link>
          <div className="chips">
            {d.chips.map((chip) => <span key={chip}>{chip}</span>)}
          </div>
        </section>
        </div>
      </div>
    </div>
  );
}
