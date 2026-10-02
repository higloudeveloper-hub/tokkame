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
  "Tell her the problem. She is here for it.",
  "Request her. One woman, and what you have not said.",
  "Infidelity, work, a secret. She listens.",
];

const topics = [
  { href: "/talk#infidelity", img: "/talk/infidelity.jpg?v=3", kicker: "Request her", title: "Infidelity", text: "Tell her the part you have not said." },
  { href: "/talk#work", img: "/talk/work.jpg?v=3", kicker: "Request her", title: "Work", text: "When the day will not end, tell her." },
  { href: "/talk#secret", img: "/talk/secret.jpg?v=3", kicker: "Request her", title: "A secret", text: "One woman. Nobody else hears it." },
  { href: "/talk#listen", img: "/talk/listen.jpg?v=3", kicker: "Request her", title: "Just listen", text: "You talk. She stays with it." },
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
  const first = live[0];

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
    const next = Math.round(el.scrollLeft / (el.clientWidth || 1));
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
        <p>Talk to a woman · 18+</p>
        <h1>Got a problem?<span>Tell her.</span></h1>
        <p className="lead">If you need to talk, request a woman who is online. Infidelity, work, a secret. She listens. You choose who.</p>
      </header>

      <div className="lux-stories">
        {live.map((person, i) => (
          <button key={person.id} type="button" className={i === index ? "on" : ""} onClick={() => go(i)}>
            <span className="lux-ring">
              <img src={person.photo} alt="" />
              <Check />
            </span>
            <strong>{person.name.split(" ")[0]}</strong>
            <em>Live</em>
          </button>
        ))}
      </div>

      <div className="lux-stage" ref={track} onScroll={onScroll}>
        {live.map((person, i) => (
          <div className="lux-slide" key={person.id}>
            <article className="lux-card">
              <div className="frame">
                {person.clip ? (
                  <video src={person.clip} poster={person.photo} autoPlay muted loop playsInline />
                ) : (
                  <img className="drift" src={person.photo} alt="" />
                )}
                <span className="lux-live"><i />Live</span>
              </div>
              <div className="sheet">
                <h2>{person.name.split(" ")[0]} <Check /></h2>
                <p>{lines[i % lines.length]}</p>
                <Link className="red-btn call-now" href={`/call/${person.username}`}>Call her</Link>
                <Link className="see" href={`/creator/${person.username}`}>See her profile</Link>
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

      <section className="lux-block">
        <div className="lux-head">
          <h3>Request her</h3>
          <span>{live.length} online</span>
        </div>
        <div className="lux-calls">
          {live.map((person) => (
            <Link className="lux-call" key={person.id} href={`/call/${person.username}`}>
              <img src={person.photo} alt="" />
              <div>
                <small>Talk to her</small>
                <strong>{person.name.split(" ")[0]} <Check /></strong>
                <p>Tell her the problem. She listens.</p>
                <span className="red-btn call-now">Call her</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="lux-block">
        <div className="lux-head">
          <h3>If you need to talk</h3>
        </div>
        <ol className="lux-steps">
          <li><b>01</b><strong>You have a problem</strong><span>Infidelity, work, a secret. Whatever it is.</span></li>
          <li><b>02</b><strong>Request her</strong><span>Pick a woman who is online and verified.</span></li>
          <li><b>03</b><strong>Tell her</strong><span>A private conversation. Nobody else is in it.</span></li>
        </ol>
      </section>

      <section className="lux-block">
        <div className="lux-head">
          <h3>What you can tell her</h3>
          <Link href="/talk">All</Link>
        </div>
        <div className="lux-topics">
          {topics.map((topic) => (
            <Link className="lux-topic" key={topic.href} href={topic.href}>
              <img className="drift" src={topic.img} alt="" />
              <div>
                <small>{topic.kicker}</small>
                <strong>{topic.title}</strong>
                <p>{topic.text}</p>
                <span className="red-btn">Choose a woman</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="lux-block">
        <div className="lux-head">
          <h3>Open her posts</h3>
          <Link href="/discover">All</Link>
        </div>
        <div className="lux-unlock">
          {more.map((person) => (
            <Link key={person.id} href={`/creator/${person.username}`}>
              <img src={person.photo} alt="" />
              <span>
                <strong>{person.name.split(" ")[0]} <Check /></strong>
                <em>See posts</em>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {first ? (
        <Link className="lux-close" href={`/call/${first.username}`}>
          <div>
            <small>She is online</small>
            <strong>Tell her the problem.</strong>
          </div>
          <span className="red-btn call-now">Call her</span>
        </Link>
      ) : null}

      <p className="lux-note">18+ · Private conversation. Not sex.</p>
    </div>
  );
}
