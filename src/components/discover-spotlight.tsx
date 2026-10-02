"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type Spot = {
  kicker: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  photo: string;
};

export function DiscoverSpotlight({ slides }: { slides: Spot[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((value) => (value + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);
  const slide = slides[index] ?? slides[0];
  if (!slide) return null;
  return (
    <section className="spot" key={slide.kicker}>
      <img src={slide.photo} alt="" />
      <span className="ad-shade" />
      <span className="ad-shine" />
      <div className="spot-copy">
        <small>{slide.kicker}</small>
        <h1>{slide.title}</h1>
        <p>{slide.text}</p>
        <div className="hero-actions">
          <Link className="red-btn" href={slide.href}>{slide.cta}</Link>
          <div className="spot-dots">
            {slides.map((item, dot) => (
              <button
                key={item.kicker}
                type="button"
                className={dot === index ? "on" : ""}
                aria-label={item.kicker}
                onClick={() => setIndex(dot)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
