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

const lines = [
  "She's here. Say the part you have not said.",
  "One room. Nobody else is listening.",
  "After the day ends, she is still on.",
];

const promos = [
  { href: "/talk#infidelity", img: "/talk/infidelity.jpg?v=3", kicker: "Tonight", title: "Infidelity" },
  { href: "/talk#work", img: "/talk/work.jpg?v=3", kicker: "After hours", title: "Work" },
  { href: "/talk#secret", img: "/talk/secret.jpg?v=3", kicker: "Just you", title: "A secret" },
  { href: "/talk#listen", img: "/talk/listen.jpg?v=3", kicker: "Quiet", title: "Just listen" },
];

function Check() {
  return (
    <i className="lux-check" aria-label="Verified">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="m5 12 5 5L20 7" /></svg>
    </i>
  );
}

export function PhoneLuxury({ live, more }: { live: LuxPerson[]; more: LuxPerson[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const count = live.length;

  function go(next: number) {
    const el = track.current;
    if (!el || !count) return;
    const i = (next + count) % count;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    setIndex(i);
  }

  function onScroll() {
    const el = track.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / (el.clientWidth || 1)));
  }

  useEffect(() => {
    if (count < 2) return;
    const timer = setInterval(() => go(index + 1), 5200);
    return () => clearInterval(timer);
  }, [index, count]);

  return (
    <div className="lux">
      <div className="lux-stories">
        {live.map((person, i) => (
          <button key={person.id} type="button" className={i === index ? "on" : ""} onClick={() => go(i)}>
            <span className="lux-ring">
              <img src={person.photo} alt="" />
              <Check />
            </span>
            <strong>{person.name.split(" ")[0]}</strong>
          </button>
        ))}
      </div>

      <div className="lux-stage" ref={track} onScroll={onScroll}>
        {live.map((person, i) => (
          <article className="lux-card" key={person.id}>
            {person.clip ? (
              <video src={person.clip} poster={person.photo} autoPlay muted loop playsInline />
            ) : (
              <img className="drift" src={person.photo} alt="" />
            )}
            <div className="shade" />
            <div className="copy">
              <span className="lux-live"><i />Live · Verified</span>
              <h2>{person.name.split(" ")[0]} <Check /></h2>
              <p>{lines[i % lines.length]}</p>
              <div className="lux-actions">
                <Link className="red-btn" href={`/creator/${person.username}`}>Call her</Link>
                <Link className="glass" href={`/creator/${person.username}`}>See her</Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="lux-dots">
        {live.map((person, dot) => (
          <button key={person.id} type="button" className={dot === index ? "on" : ""} aria-label={person.name} onClick={() => go(dot)} />
        ))}
      </div>

      <div className="lux-head">
        <h3>Promos</h3>
        <Link href="/talk">All</Link>
      </div>
      <div className="lux-promos">
        {promos.map((promo) => (
          <Link className="lux-promo" key={promo.href} href={promo.href}>
            <img className="drift" src={promo.img} alt="" />
            <div className="shade" />
            <span>
              <small>{promo.kicker}</small>
              <strong>{promo.title}</strong>
            </span>
          </Link>
        ))}
      </div>

      <div className="lux-head">
        <h3>Unlock</h3>
        <Link href="/discover">All</Link>
      </div>
      <div className="lux-unlock">
        {more.map((person) => (
          <Link key={person.id} href={`/creator/${person.username}`}>
            <img src={person.photo} alt="" />
            <span>
              <strong>{person.name.split(" ")[0]} <Check /></strong>
              <em>Posts</em>
            </span>
          </Link>
        ))}
      </div>
      <p className="lux-note">18+ · Private conversation. Not sex.</p>
    </div>
  );
}
