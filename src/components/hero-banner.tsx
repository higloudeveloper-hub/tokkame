"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const slides = {
  en: [
    {
      kicker: "18+",
      pill: "ADULTS ONLY",
      title: ["Buy the drop.", "Open it when", "you want."],
      text: "No live room. Verified adults sell photos and clips. You pay once, or for the month.",
      primary: "See drops",
      secondary: "See plans",
    },
    {
      kicker: "18+",
      pill: "ADULTS ONLY",
      title: ["Not a live room.", "A file.", "With a price."],
      text: "Adults only. She keeps 80%. Tokkame keeps 20%. The receipt stays in your wallet.",
      primary: "See drops",
      secondary: "See plans",
    },
  ],
  es: [
    {
      kicker: "18+",
      pill: "SOLO ADULTOS",
      title: ["Compra el drop.", "Ábrelo cuando", "quieras."],
      text: "No hay sala en vivo. Adultos verificados venden fotos y clips. Pagas una vez, o el mes.",
      primary: "Ver drops",
      secondary: "Ver planes",
    },
    {
      kicker: "18+",
      pill: "SOLO ADULTOS",
      title: ["No es una sala.", "Es un archivo.", "Con precio."],
      text: "Solo adultos. Ella se queda con el 80%. Tokkame con el 20%. El recibo queda en tu billetera.",
      primary: "Ver drops",
      secondary: "Ver planes",
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
            <Link className="red-btn" href="/drops">{slide.primary}</Link>
            <Link className="ghost-btn" href="/pricing">{slide.secondary}</Link>
          </div>
        </div>
      </div>
      <button className="hero-next" type="button" aria-label="Next slide" onClick={() => setIndex((value) => (value + 1) % slides[lang].length)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 6 6 6-6 6" /></svg>
      </button>
    </article>
  );
}
