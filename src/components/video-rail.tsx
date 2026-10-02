"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/lang";
import type { Clip } from "@/lib/studio";

const copy = {
  en: { videos: "Videos", all: "View all", views: "views", play: "Play", close: "Close video", subscribe: "Subscribe", shut: "Close" },
  es: { videos: "Videos", all: "Ver todas", views: "vistas", play: "Reproducir", close: "Cerrar video", subscribe: "Suscribirme", shut: "Cerrar" },
} as const;

export function VideoRail({ clips, layout = "row", showHeading = true, lang = "en" }: { clips: Clip[]; layout?: "row" | "grid"; showHeading?: boolean; lang?: Lang }) {
  const t = copy[lang];
  const [open, setOpen] = useState<Clip | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <section>
      {showHeading ? (
        <div className="section-head">
          <h2>
            <span className="live-dot" />
            {t.videos}
          </h2>
          <Link href="/videos">{t.all}</Link>
        </div>
      ) : null}
      <div className={layout === "grid" ? "video-grid" : "video-row"}>
        {clips.map((clip, index) => (
          <ClipCard key={clip.id} clip={clip} index={index} lang={lang} onOpen={setOpen} />
        ))}
      </div>
      {open ? <Theater clip={open} lang={lang} onClose={() => setOpen(null)} /> : null}
    </section>
  );
}

function ClipCard({ clip, index, lang, onOpen }: { clip: Clip; index: number; lang: Lang; onOpen: (clip: Clip) => void }) {
  const t = copy[lang];
  const video = useRef<HTMLVideoElement>(null);

  function play() {
    const node = video.current;
    if (!node) return;
    node.play().catch(() => undefined);
  }

  function stop() {
    const node = video.current;
    if (!node) return;
    node.pause();
    node.currentTime = 0;
  }

  return (
    <article className="vcard" style={{ animationDelay: `${index * 45}ms` }} onMouseEnter={play} onMouseLeave={stop}>
      <button className="vcard-screen" type="button" onClick={() => onOpen(clip)} aria-label={`${t.play} ${clip.title}`}>
        <video ref={video} poster={clip.poster} src={clip.src} muted loop playsInline preload="metadata" />
        <span className="vdur">{clip.duration}</span>
        <span className="vplay" aria-hidden>▶</span>
      </button>
      <div className="vmeta">
        <strong>{clip.title}</strong>
        <span>{clip.creator} · {clip.views} {t.views}</span>
      </div>
    </article>
  );
}

function Theater({ clip, lang, onClose }: { clip: Clip; lang: Lang; onClose: () => void }) {
  const t = copy[lang];
  return (
    <div className="theater" role="dialog" aria-modal="true" aria-label={clip.title}>
      <button className="theater-scrim" type="button" aria-label={t.close} onClick={onClose} />
      <div className="theater-card">
        <video src={clip.src} poster={clip.poster} controls autoPlay loop playsInline />
        <div className="theater-meta">
          <div>
            <strong>{clip.title}</strong>
            <span>{clip.creator} · {clip.views} {t.views}</span>
          </div>
          <Link className="red-btn" href={`/creator/${clip.username}?tab=circle`}>{t.subscribe}</Link>
          <button className="ghost-btn" type="button" onClick={onClose}>{t.shut}</button>
        </div>
      </div>
    </div>
  );
}
