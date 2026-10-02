"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Topic = { id: string; kicker: string; title: string; text: string; image: string };
type Person = { id: string; name: string; username: string; photo: string; online: boolean };

export function TalkShow({ topics, people }: { topics: Topic[]; people: Person[] }) {
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
        <p>Private · 18+</p>
        <h1>Tell her.</h1>
        <p>Swipe a subject. Then call a verified woman. $13 an hour, on Tokkame.</p>
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
              <a className="red-btn" href="#people">Call about this</a>
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
            <small>Promo · $13 / hour</small>
            <strong>{first.name.split(" ")[0]} is online</strong>
            <p>Pay, then she accepts. The clock stays on the call.</p>
            <span className="red-btn">Call her</span>
          </div>
        </Link>
      ) : null}

      <div className="section-head" id="people">
        <h2>Who can hear it</h2>
        <Link href="/discover">All</Link>
      </div>
      <div className="talk-people">
        {people.map((person) => (
          <article key={person.id}>
            <img src={person.photo} alt="" />
            <div>
              <strong>{person.name.split(" ")[0]}</strong>
              <span>{person.online ? "Online · Verified" : "Verified"}</span>
              <Link className="red-btn" href={`/call/${person.username}`}>Call her</Link>
              <Link className="ghost" href={`/creator/${person.username}`}>Profile</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
