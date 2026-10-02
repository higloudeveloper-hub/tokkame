"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type SlidePerson = { id: string; name: string; photo: string; talk: string };

const copy = [
  { kicker: "Private call", title: "She's on the line.", text: "One conversation. You pay for the time." },
  { kicker: "Say it now", title: "The part you have not said.", text: "Infidelity, work, a secret. She listens." },
  { kicker: "You choose", title: "Nobody else in the room.", text: "If she's online, start the call." },
];

export function CallSlides({ people }: { people: SlidePerson[] }) {
  const slides = people.slice(0, copy.length);
  const [index, setIndex] = useState(0);
  const startX = useRef(0);
  const count = slides.length;

  useEffect(() => {
    if (count < 2) return;
    const timer = setInterval(() => setIndex((value) => (value + 1) % count), 5000);
    return () => clearInterval(timer);
  }, [count]);

  if (!count) return null;
  const person = slides[index];
  const line = copy[index];

  return (
    <section
      className="call-slides"
      aria-roledescription="carousel"
      aria-label="Private calls"
      onTouchStart={(event) => { startX.current = event.touches[0].clientX; }}
      onTouchEnd={(event) => {
        const delta = event.changedTouches[0].clientX - startX.current;
        if (delta > 40) setIndex((value) => (value - 1 + count) % count);
        if (delta < -40) setIndex((value) => (value + 1) % count);
      }}
    >
      <article className="call-slide" key={person.id}>
        <img src={person.photo} alt="" />
        <div>
          <small>{line.kicker}</small>
          <strong>{line.title}</strong>
          <p>{line.text}</p>
          <Link className="red-btn" href={`/messages?with=${person.id}`}>Call · {person.talk}</Link>
        </div>
      </article>
      <div className="call-dots">
        {slides.map((item, dot) => (
          <button key={item.id} type="button" className={dot === index ? "on" : ""} aria-label={`Slide ${dot + 1}`} onClick={() => setIndex(dot)} />
        ))}
      </div>
    </section>
  );
}
