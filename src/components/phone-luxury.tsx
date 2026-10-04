"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type LuxPerson = {
  id: string;
  name: string;
  username: string;
  photo: string;
  clip?: string;
};

export type LuxPost = {
  id: string;
  name: string;
  username: string;
  photo: string;
  locked: boolean;
};

const pack = {
  en: {
    kicker: "Premium drops · 18+",
    title: ["Buy the drop.", "Open it later."],
    lead: "No live room. You pay for the file: one drop, or the month. She keeps 80%.",
    live: "Drop",
    lines: [
      "Locked until you pay. Then it is yours.",
      "Subscribe and the new sets open first.",
      "A receipt stays in your wallet.",
    ],
    call: "Open drop",
    profile: "See her profile",
    trust: [
      ["Verified", "She can charge only after review."],
      ["Yours", "The file stays after you pay."],
      ["80 / 20", "She keeps 80%. Tokkame keeps 20%."],
    ],
    posts: "Free and locked",
    all: "All",
    free: "Free",
    locked: "Locked",
    request: "Buy her drop",
    online: "for sale",
    talk: "Open the set",
    hears: "Pay once. The blur comes off.",
    need: "How you pay",
    steps: [
      ["Pick a drop", "A photo or a clip with a price on it."],
      ["Pay in the sandbox", "Card, Apple Pay, or PayPal. No live call."],
      ["Keep the receipt", "80% is hers. 20% is Tokkame."],
    ],
    topicsTitle: "What is for sale",
    choose: "See the drop",
    topics: [
      ["Single drop", "One post", "Pay the price. It unlocks."],
      ["The month", "Inner to Elite", "New sets open while you are subscribed."],
      ["The archive", "Everything locked", "One plan. The blur comes off."],
      ["A tip", "Extra", "It does not unlock the set. It goes to her."],
    ],
    open: "Open her posts",
    see: "See posts",
    sheOn: "For sale",
    tell: "Open her drop.",
    note: "18+ · You buy the file. Not a live room. Not sex.",
    want: "Buy",
    wantTitle: "Three ways to pay. No one has to be online.",
    options: [
      ["Drops", "One price. One file.", "/drops"],
      ["Her page", "Free posts sharp. Locked posts blurred.", "profile"],
      ["Plans", "Inner, VIP, Elite.", "/pricing"],
    ],
    tonight: "On Tokkame",
    meter: [
      ["Drop", "Pay once"],
      ["Month", "From $5.99"],
      ["Receipt", "Stays in Wallet"],
    ],
  },
  es: {
    kicker: "Drops premium · 18+",
    title: ["Compra el drop.", "Ábrelo después."],
    lead: "No hay sala en vivo. Pagas por el archivo: un drop, o el mes. Ella se queda con el 80%.",
    live: "Drop",
    lines: [
      "Bloqueado hasta que pagas. Después es tuyo.",
      "Si te suscribes, los sets nuevos abren primero.",
      "El recibo se queda en tu billetera.",
    ],
    call: "Abrir drop",
    profile: "Ver su perfil",
    trust: [
      ["Verificada", "Cobra solo después de la revisión."],
      ["Tuyo", "El archivo se queda después de pagar."],
      ["80 / 20", "Ella se queda con el 80%. Tokkame con el 20%."],
    ],
    posts: "Gratis y bloqueados",
    all: "Todas",
    free: "Gratis",
    locked: "Bloqueado",
    request: "Comprar su drop",
    online: "en venta",
    talk: "Abrir el set",
    hears: "Pagas una vez. Se quita el blur.",
    need: "Cómo se paga",
    steps: [
      ["Elige un drop", "Una foto o un clip con precio."],
      ["Paga en la demo", "Tarjeta, Apple Pay o PayPal. Sin llamada."],
      ["Guarda el recibo", "80% es de ella. 20% es de Tokkame."],
    ],
    topicsTitle: "Qué está en venta",
    choose: "Ver el drop",
    topics: [
      ["Un drop", "Un post", "Pagas el precio. Se abre."],
      ["El mes", "Inner a Elite", "Los sets nuevos abren mientras estás suscrito."],
      ["El archivo", "Todo lo bloqueado", "Un plan. Se quita el blur."],
      ["Una propina", "Extra", "No abre el set. Va para ella."],
    ],
    open: "Abrir sus posts",
    see: "Ver posts",
    sheOn: "En venta",
    tell: "Abre su drop.",
    note: "18+ · Compras el archivo. No es una sala en vivo. No es sexo.",
    want: "Comprar",
    wantTitle: "Tres formas de pagar. Nadie tiene que estar en línea.",
    options: [
      ["Drops", "Un precio. Un archivo.", "/drops"],
      ["Su página", "Lo gratis nítido. Lo de pago borroso.", "profile"],
      ["Planes", "Inner, VIP, Elite.", "/pricing"],
    ],
    tonight: "En Tokkame",
    meter: [
      ["Drop", "Pagas una vez"],
      ["Mes", "Desde $5.99"],
      ["Recibo", "Queda en Billetera"],
    ],
  },
} as const;

function Check() {
  return (
    <i className="lux-check" aria-label="Verified">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 5 5L20 7" /></svg>
    </i>
  );
}

export function PhoneLuxury({ live, more, posts, lang }: { live: LuxPerson[]; more: LuxPerson[]; posts: LuxPost[]; lang: "en" | "es" }) {
  const t = pack[lang];
  const topicCards = [
    { href: "/drops", img: "/talk/infidelity.jpg?v=3" },
    { href: "/pricing", img: "/talk/work.jpg?v=3" },
    { href: "/discover", img: "/talk/secret.jpg?v=3" },
    { href: "/drops", img: "/talk/listen.jpg?v=3" },
  ];
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const count = live.length;
  const first = live[0];

  function stride() {
    const el = track.current;
    const slide = el?.querySelector<HTMLElement>(".lux-slide");
    if (!el || !slide) return 1;
    const gap = Number.parseFloat(getComputedStyle(el).columnGap || "0") || 0;
    return slide.offsetWidth + gap;
  }

  function go(next: number) {
    const el = track.current;
    if (!el || !count) return;
    const i = (next + count) % count;
    el.scrollTo({ left: i * stride(), behavior: "smooth" });
    setIndex(i);
  }

  function onScroll() {
    const el = track.current;
    if (!el) return;
    const next = Math.round(el.scrollLeft / stride());
    setIndex((current) => (current === next ? current : next));
  }

  useEffect(() => {
    if (count < 2) return;
    const timer = setInterval(() => go(index + 1), 5200);
    return () => clearInterval(timer);
  }, [index, count]);

  return (
    <div className="lux">
      <header className="lux-intro">
        <p>{t.kicker}</p>
        <h1>{t.title[0]}<span>{t.title[1]}</span></h1>
        <p className="lead">{t.lead}</p>
      </header>

      <div className="lux-stories">
        {live.map((person, i) => (
          <button key={person.id} type="button" className={i === index ? "on" : ""} onClick={() => go(i)}>
            <span className="lux-ring">
              <img src={person.photo} alt="" />
              <Check />
            </span>
            <strong>{person.name.split(" ")[0]}</strong>
            <em>{t.live}</em>
          </button>
        ))}
      </div>

      <div className="lux-stage" ref={track} onScroll={onScroll}>
        {live.map((person, i) => (
          <div className="lux-slide" key={person.id}>
            <article className="lux-card">
              <div className="frame">
                {i === index ? <span className="lux-progress"><b /></span> : null}
                {person.clip ? (
                  <video src={person.clip} poster={person.photo} autoPlay muted loop playsInline />
                ) : (
                  <img className="drift" src={person.photo} alt="" />
                )}
                <span className="lux-live"><i />{t.live}</span>
              </div>
              <div className="sheet">
                <h2>{person.name.split(" ")[0]} <Check /></h2>
                <p>{t.lines[i % t.lines.length]}</p>
                <Link className="red-btn call-now" href={`/creator/${person.username}`}>{t.call}</Link>
                <Link className="see" href={`/creator/${person.username}`}>{t.profile}</Link>
              </div>
            </article>
          </div>
        ))}
      </div>
      <div className="lux-dots">
        {live.map((person, dot) => (
          <button key={person.id} type="button" className={dot === index ? "on" : ""} aria-label={person.name} onClick={() => go(dot)} />
        ))}
      </div>

      <section className="lux-pull">
        <p>{t.want}</p>
        <h3>{t.wantTitle}</h3>
        <div>
          {t.options.map((item) => (
            <Link key={item[0]} href={item[2] === "profile" && first ? `/creator/${first.username}` : item[2] === "profile" ? "/discover" : item[2]}>
              <strong>{item[0]}</strong>
              <span>{item[1]}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="lux-meter">
        <p>{t.tonight}</p>
        <div>
          {t.meter.map((item) => (
            <article key={item[0]}>
              <strong>{item[0]}</strong>
              <span>{item[1]}</span>
            </article>
          ))}
        </div>
      </section>

      <ul className="lux-trust">
        {t.trust.map((item) => (
          <li key={item[0]}>
            <Check />
            <strong>{item[0]}</strong>
            <span>{item[1]}</span>
          </li>
        ))}
      </ul>

      {posts.length ? (
        <section className="lux-block">
          <div className="lux-head">
            <h3>{t.posts}</h3>
            <Link href="/discover">{t.all}</Link>
          </div>
          <div className="lux-feed">
            {posts.map((post) => (
              <Link key={post.id} className={post.locked ? "locked" : ""} href={`/creator/${post.username}`}>
                <img src={post.photo} alt="" />
                <span>
                  <strong>{post.name.split(" ")[0]}</strong>
                  <em>{post.locked ? t.locked : t.free}</em>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="lux-block">
        <div className="lux-head">
          <h3>{t.request}</h3>
          <span>{live.length} {t.online}</span>
        </div>
        <div className="lux-calls">
          {live.map((person) => (
            <Link className="lux-call" key={person.id} href={`/creator/${person.username}`}>
              <img src={person.photo} alt="" />
              <div>
                <small>{t.talk}</small>
                <strong>{person.name.split(" ")[0]} <Check /></strong>
                <p>{t.hears}</p>
                <span className="red-btn call-now">{t.call}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="lux-block">
        <div className="lux-head">
          <h3>{t.need}</h3>
        </div>
        <ol className="lux-steps">
          {t.steps.map((item, step) => (
            <li key={item[0]}><b>0{step + 1}</b><strong>{item[0]}</strong><span>{item[1]}</span></li>
          ))}
        </ol>
      </section>

      <section className="lux-block">
        <div className="lux-head">
          <h3>{t.topicsTitle}</h3>
          <Link href="/talk">{t.all}</Link>
        </div>
        <div className="lux-topics">
          {topicCards.map((topic, i) => (
            <Link className="lux-topic" key={topic.href} href={topic.href}>
              <img className="drift" src={topic.img} alt="" />
              <div>
                <small>{t.topics[i][0]}</small>
                <strong>{t.topics[i][1]}</strong>
                <p>{t.topics[i][2]}</p>
                <span className="red-btn">{t.choose}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="lux-block">
        <div className="lux-head">
          <h3>{t.open}</h3>
          <Link href="/discover">{t.all}</Link>
        </div>
        <div className="lux-unlock">
          {more.map((person) => (
            <Link key={person.id} href={`/creator/${person.username}`}>
              <img src={person.photo} alt="" />
              <span>
                <strong>{person.name.split(" ")[0]} <Check /></strong>
                <em>{t.see}</em>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {first ? (
        <Link className="lux-close" href={`/creator/${first.username}`}>
          <div>
            <small>{t.sheOn}</small>
            <strong>{t.tell}</strong>
          </div>
          <span className="red-btn call-now">{t.call}</span>
        </Link>
      ) : null}

      <p className="lux-note">{t.note}</p>
    </div>
  );
}
