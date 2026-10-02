"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/lang";

type Topic = { id: string; kicker: string; title: string; text: string; image: string };
type Person = { id: string; name: string; username: string; photo: string; online: boolean };

const copy = {
  en: {
    private: "Private · 18+",
    title: "Tell her.",
    lead: "Swipe a subject. Then call a verified woman. $13 an hour, on Tokkame.",
    about: "Call about this",
    promo: "Promo · $13 / hour",
    online: "is online",
    promoText: "Pay, then she accepts. The clock stays on the call.",
    call: "Call her",
    who: "Who can hear it",
    all: "All",
    live: "Online · Verified",
    verified: "Verified",
    profile: "Profile",
  },
  es: {
    private: "Privado · 18+",
    title: "Cuéntaselo.",
    lead: "Desliza un tema. Luego llama a una mujer verificada. $13 la hora, en Tokkame.",
    about: "Llamar por esto",
    promo: "Promo · $13 / hora",
    online: "está en línea",
    promoText: "Pagas y ella acepta. El reloj se queda en la llamada.",
    call: "Llamarla",
    who: "Quién puede escucharlo",
    all: "Todas",
    live: "En línea · Verificada",
    verified: "Verificada",
    profile: "Perfil",
  },
} as const;

export function TalkShow({ lang, topics, people }: { lang: Lang; topics: Topic[]; people: Person[] }) {
  const t = copy[lang];
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const online = people.filter((person) => person.online);
  const first = online[0] || people[0];

  function go(next: number) {
    const el = track.current;
    if (!el || !topics.length) return;
    const i = (next + topics.length) % topics.length;
    const slide = el.children[i] as HTMLElement | undefined;
    if (slide) el.scrollTo({ left: slide.offsetLeft - 16, behavior: "smooth" });
    setIndex(i);
  }

  useEffect(() => {
    if (topics.length < 2) return;
    const timer = setInterval(() => go(index + 1), 4800);
    return () => clearInterval(timer);
  }, [index, topics.length]);

  return (
    <div className="talk-show">
      <header className="talk-lead">
        <p>{t.private}</p>
        <h1>{t.title}</h1>
        <p>{t.lead}</p>
      </header>

      <div className="talk-stage" ref={track} onScroll={(event) => {
        const el = event.currentTarget;
        const width = (el.firstElementChild as HTMLElement | null)?.offsetWidth || 1;
        const next = Math.round(el.scrollLeft / (width + 12));
        setIndex((current) => (current === next ? current : Math.min(next, topics.length - 1)));
      }}>
        {topics.map((topic) => (
          <article className="talk-slide" id={topic.id} key={topic.id}>
            <img src={topic.image} alt="" />
            <div>
              <small>{topic.kicker}</small>
              <strong>{topic.title}</strong>
              <p>{topic.text}</p>
              <a className="red-btn" href="#people">{t.about}</a>
            </div>
          </article>
        ))}
      </div>
      <div className="talk-dots">
        {topics.map((topic, dot) => (
          <button key={topic.id} type="button" className={dot === index ? "on" : ""} aria-label={topic.title} onClick={() => go(dot)} />
        ))}
      </div>

      {first ? (
        <Link className="talk-promo" href={`/call/${first.username}`}>
          <img src={first.photo} alt="" />
          <div>
            <small>{t.promo}</small>
            <strong>{first.name.split(" ")[0]} {t.online}</strong>
            <p>{t.promoText}</p>
            <span className="red-btn">{t.call}</span>
          </div>
        </Link>
      ) : null}

      <div className="section-head" id="people">
        <h2>{t.who}</h2>
        <Link href="/discover">{t.all}</Link>
      </div>
      <div className="talk-people">
        {people.map((person) => (
          <article key={person.id}>
            <img src={person.photo} alt="" />
            <div>
              <strong>{person.name.split(" ")[0]}</strong>
              <span>{person.online ? t.live : t.verified}</span>
              <Link className="red-btn" href={`/call/${person.username}`}>{t.call}</Link>
              <Link className="ghost" href={`/creator/${person.username}`}>{t.profile}</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
