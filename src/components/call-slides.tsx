"use client";

import Link from "next/link";
import { useRef, useState } from "react";

export type SlidePerson = { id: string; name: string; username: string; photo: string; talk: string };

const copy = [
  { kicker: "Private call", title: "She's on the line.", text: "One conversation. Nobody else is here." },
  { kicker: "Say it now", title: "The part you have not said.", text: "Infidelity, work, a secret. She listens." },
  { kicker: "You choose", title: "Nobody else in the room.", text: "If she's online, she can hear it." },
];

export function CallSlides({ people }: { people: SlidePerson[] }) {
  const slides = people.slice(0, copy.length);
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  if (!slides.length) return null;

  function onScroll() {
    const el = track.current;
    if (!el) return;
    const width = el.clientWidth || 1;
    setIndex(Math.round(el.scrollLeft / (width * 0.86)));
  }

  return (
    <section className="call-slides" aria-roledescription="carousel" aria-label="Private calls">
      <div className="call-track" ref={track} onScroll={onScroll}>
        {slides.map((person, i) => {
          const line = copy[i];
          return (
            <article className="call-slide" key={person.id}>
              <img src={person.photo} alt="" />
              <div>
                <small>{line.kicker}</small>
                <strong>{line.title}</strong>
                <p>{person.name.split(" ")[0]}. {line.text}</p>
                <Link className="red-btn" href={`/creator/${person.username}`}>She's here</Link>
              </div>
            </article>
          );
        })}
      </div>
      <div className="call-dots">
        {slides.map((item, dot) => (
          <button
            key={item.id}
            type="button"
            className={dot === index ? "on" : ""}
            aria-label={`Slide ${dot + 1}`}
            onClick={() => {
              const el = track.current;
              if (!el) return;
              el.scrollTo({ left: dot * el.clientWidth * 0.86, behavior: "smooth" });
            }}
          />
        ))}
      </div>
    </section>
  );
}
