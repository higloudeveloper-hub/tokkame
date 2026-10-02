"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    kicker: "18+",
    title: ["Say it.", "Someone hears it.", "You choose who."],
    text: "Infidelity. Work. A secret. Whatever you cannot say out loud. Pick the person and start the conversation.",
  },
  {
    kicker: "18+",
    title: ["Not a clinic.", "A conversation.", "On your terms."],
    text: "Adults only. You pay for time and attention. The rest of the room stays out of it.",
  },
];

export function HeroBanner() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((value) => (value + 1) % slides.length), 7000);
    return () => clearInterval(timer);
  }, []);
  const slide = slides[index];
  return (
    <article className="hero-banner">
      <img className="hero-photo" src="/talk/hero.jpg" alt="" />
      <div className="hero-shade" />
      <div className="hero-stage" key={index}>
        <div className="hero-copy">
          <span className="age-pill"><b>{slide.kicker}</b> ADULTS ONLY</span>
          <h1>
            {slide.title.map((line) => <span key={line}>{line}</span>)}
          </h1>
          <p>{slide.text}</p>
          <div className="hero-actions">
            <Link className="red-btn" href="/talk">Start talking</Link>
            <Link className="ghost-btn" href="/discover">Choose who</Link>
          </div>
        </div>
      </div>
      <button className="hero-next" type="button" aria-label="Next slide" onClick={() => setIndex((value) => (value + 1) % slides.length)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 6 6 6-6 6" /></svg>
      </button>
    </article>
  );
}
