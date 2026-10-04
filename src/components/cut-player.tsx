"use client";

import Link from "next/link";
import { useState } from "react";

export type CutClip = { id: string; title: string; creator: string; src: string; poster: string; caption?: string };

export function CutPlayer({ clips, lang }: { clips: CutClip[]; lang: "en" | "es" }) {
  const es = lang === "es";
  const [index, setIndex] = useState(0);
  const clip = clips[index] ?? clips[0];
  if (!clip) return null;

  function next() {
    setIndex((value) => (value + 1) % clips.length);
  }

  return (
    <section className="cut-app">
      <video key={clip.id + clip.src} src={clip.src} poster={clip.poster} autoPlay muted loop playsInline />
      <div className="cut-shade" />
      <div className="cut-copy">
        <p>{es ? "Gratis · el siguiente empieza solo" : "Free · the next one starts on its own"}</p>
        <h1>{clip.caption || clip.title}</h1>
        <span>{clip.creator}</span>
      </div>
      <div className="cut-side">
        <button type="button" onClick={next}>{es ? "Siguiente" : "Next"}</button>
        <Link href="/studio">{es ? "Publicar" : "Publish"}</Link>
        <Link href="/plus">Plus</Link>
      </div>
      <p className="cut-index">{index + 1} / {clips.length}</p>
    </section>
  );
}
