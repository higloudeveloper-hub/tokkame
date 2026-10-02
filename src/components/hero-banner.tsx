"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const slides = {
  en: [
    {
      kicker: "18+",
      pill: "ADULTS ONLY",
      title: ["Say it.", "Someone hears it.", "You choose who."],
      text: "Infidelity. Work. A secret. Whatever you cannot say out loud. Pick the person and start the conversation.",
      primary: "Start talking",
      secondary: "Choose who",
    },
    {
      kicker: "18+",
      pill: "ADULTS ONLY",
      title: ["Not a clinic.", "A conversation.", "On your terms."],
      text: "Adults only. You pay for time and attention. The rest of the room stays out of it.",
      primary: "Start talking",
      secondary: "Choose who",
    },
  ],
  es: [
    {
      kicker: "18+",
      pill: "SOLO ADULTOS",
      title: ["Dilo.", "Alguien lo escucha.", "Tú eliges quién."],
      text: "Infidelidad. Trabajo. Un secreto. Lo que no puedes decir en voz alta. Elige a la persona y empieza.",
      primary: "Empezar a hablar",
      secondary: "Elegir quién",
    },
    {
      kicker: "18+",
      pill: "SOLO ADULTOS",
      title: ["No es una clínica.", "Es una conversación.", "A tu manera."],
      text: "Solo adultos. Pagas por el tiempo y la atención. El resto de la sala se queda afuera.",
      primary: "Empezar a hablar",
      secondary: "Elegir quién",
    },
  ],
};

export function HeroBanner({ lang }: { lang: "en" | "es" }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((value) => (value + 1) % slides[lang].length), 7000);
    return () => clearInterval(timer);
  }, []);
  const slide = slides[lang][index];
  return (
    <article className="hero-banner">
      <img className="hero-photo" src="/talk/hero.jpg" alt="" />
      <div className="hero-shade" />
      <div className="hero-stage" key={index}>
        <div className="hero-copy">
          <span className="age-pill"><b>{slide.kicker}</b> {slide.pill}</span>
          <h1>
            {slide.title.map((line) => <span key={line}>{line}</span>)}
          </h1>
          <p>{slide.text}</p>
          <div className="hero-actions">
            <Link className="red-btn" href="/talk">{slide.primary}</Link>
            <Link className="ghost-btn" href="/discover">{slide.secondary}</Link>
          </div>
        </div>
      </div>
      <button className="hero-next" type="button" aria-label="Next slide" onClick={() => setIndex((value) => (value + 1) % slides[lang].length)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 6 6 6-6 6" /></svg>
      </button>
    </article>
  );
}
