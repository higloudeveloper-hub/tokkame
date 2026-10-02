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
    kicker: "Talk to a woman · 18+",
    title: ["Got a problem?", "Tell her."],
    lead: "If you need to talk, request a woman who is online. Infidelity, work, a secret. She listens. You choose who.",
    live: "Live",
    lines: [
      "Tell her the problem. She is here for it.",
      "Request her. One woman, and what you have not said.",
      "Infidelity, work, a secret. She listens.",
    ],
    call: "Call her",
    profile: "See her profile",
    trust: [
      ["Verified", "Identity checked before she can charge."],
      ["Private", "The hour stays on Tokkame."],
      ["$13 / hour", "You pay only after she accepts."],
    ],
    posts: "Free and locked",
    all: "All",
    free: "Free",
    locked: "Locked",
    request: "Request her",
    online: "online",
    talk: "Talk to her",
    hears: "Tell her the problem. She listens.",
    need: "If you need to talk",
    steps: [
      ["You have a problem", "Infidelity, work, a secret. Whatever it is."],
      ["Request her", "Pick a woman who is online and verified."],
      ["Tell her", "A private conversation. Nobody else is in it."],
    ],
    topicsTitle: "What you can tell her",
    choose: "Choose a woman",
    topics: [
      ["Request her", "Infidelity", "Tell her the part you have not said."],
      ["Request her", "Work", "When the day will not end, tell her."],
      ["Request her", "A secret", "One woman. Nobody else hears it."],
      ["Request her", "Just listen", "You talk. She stays with it."],
    ],
    open: "Open her posts",
    see: "See posts",
    sheOn: "She is online",
    tell: "Tell her the problem.",
    note: "18+ · Private conversation. Not sex.",
    want: "Stay",
    wantTitle: "She can hear it tonight.",
    options: [
      ["Tell her", "The problem, in private.", "/talk"],
      ["See her", "Her profile, before you call.", "profile"],
      ["Unlock", "Free posts, and the blurred ones.", "/discover"],
    ],
    tonight: "On Tokkame",
    meter: [
      ["Verified", "Before she can charge"],
      ["Private", "The hour stays here"],
      ["Profile first", "You see her, then you call"],
    ],
  },
  es: {
    kicker: "Habla con una mujer · 18+",
    title: ["¿Tienes un problema?", "Cuéntaselo."],
    lead: "Si necesitas hablar, solicita a una mujer que esté en línea. Infidelidad, trabajo, un secreto. Ella escucha. Tú eliges.",
    live: "En vivo",
    lines: [
      "Cuéntale el problema. Ella está aquí.",
      "Solicítala. Una mujer, y lo que no has dicho.",
      "Infidelidad, trabajo, un secreto. Ella escucha.",
    ],
    call: "Llamarla",
    profile: "Ver su perfil",
    trust: [
      ["Verificada", "Identidad revisada antes de cobrar."],
      ["Privado", "La hora se queda en Tokkame."],
      ["$13 / hora", "Pagas solo después de que acepte."],
    ],
    posts: "Gratis y bloqueados",
    all: "Todas",
    free: "Gratis",
    locked: "Bloqueado",
    request: "Solicítala",
    online: "en línea",
    talk: "Habla con ella",
    hears: "Cuéntale el problema. Ella escucha.",
    need: "Si necesitas hablar",
    steps: [
      ["Tienes un problema", "Infidelidad, trabajo, un secreto. Lo que sea."],
      ["Solicítala", "Elige a una mujer en línea y verificada."],
      ["Cuéntaselo", "Una conversación privada. Nadie más está ahí."],
    ],
    topicsTitle: "Qué puedes contarle",
    choose: "Elegir una mujer",
    topics: [
      ["Solicítala", "Infidelidad", "Cuéntale lo que no has dicho."],
      ["Solicítala", "Trabajo", "Cuando el día no termina."],
      ["Solicítala", "Un secreto", "Una mujer. Nadie más lo oye."],
      ["Solicítala", "Solo escuchar", "Tú hablas. Ella se queda."],
    ],
    open: "Abrir sus posts",
    see: "Ver posts",
    sheOn: "Está en línea",
    tell: "Cuéntale el problema.",
    note: "18+ · Conversación privada. No es sexo.",
    want: "Quédate",
    wantTitle: "Ella puede escucharlo esta noche.",
    options: [
      ["Contarle", "El problema, en privado.", "/talk"],
      ["Verla", "Su perfil, antes de llamar.", "profile"],
      ["Desbloquear", "Posts gratis y los que están borrosos.", "/discover"],
    ],
    tonight: "En Tokkame",
    meter: [
      ["Verificada", "Antes de poder cobrar"],
      ["Privada", "La hora se queda aquí"],
      ["Perfil primero", "La ves, y después llamas"],
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
    { href: "/talk#infidelity", img: "/talk/infidelity.jpg?v=3" },
    { href: "/talk#work", img: "/talk/work.jpg?v=3" },
    { href: "/talk#secret", img: "/talk/secret.jpg?v=3" },
    { href: "/talk#listen", img: "/talk/listen.jpg?v=3" },
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
