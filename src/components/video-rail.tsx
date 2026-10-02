"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Clip } from "@/lib/studio";

export function VideoRail({ clips, layout = "row", showHeading = true }: { clips: Clip[]; layout?: "row" | "grid"; showHeading?: boolean }) {
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
            Videos
          </h2>
          <Link href="/videos">View all</Link>
        </div>
      ) : null}
      <div className={layout === "grid" ? "video-grid" : "video-row"}>
        {clips.map((clip, index) => (
          <ClipCard key={clip.id} clip={clip} index={index} onOpen={setOpen} />
        ))}
      </div>
      {open ? <Theater clip={open} onClose={() => setOpen(null)} /> : null}
    </section>
  );
}

function ClipCard({ clip, index, onOpen }: { clip: Clip; index: number; onOpen: (clip: Clip) => void }) {
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
      <button className="vcard-screen" type="button" onClick={() => onOpen(clip)} aria-label={`Play ${clip.title}`}>
        <video ref={video} poster={clip.poster} src={clip.src} muted loop playsInline preload="metadata" />
        <span className="vdur">{clip.duration}</span>
        <span className="vplay" aria-hidden>▶</span>
      </button>
      <div className="vmeta">
        <strong>{clip.title}</strong>
        <span>{clip.creator} · {clip.views} views</span>
      </div>
    </article>
  );
}

function Theater({ clip, onClose }: { clip: Clip; onClose: () => void }) {
  return (
    <div className="theater" role="dialog" aria-modal="true" aria-label={clip.title}>
      <button className="theater-scrim" type="button" aria-label="Close video" onClick={onClose} />
      <div className="theater-card">
        <video src={clip.src} poster={clip.poster} controls autoPlay loop playsInline />
        <div className="theater-meta">
          <div>
            <strong>{clip.title}</strong>
            <span>{clip.creator} · {clip.views} views</span>
          </div>
          <Link className="red-btn" href={`/creator/${clip.username}?tab=circle`}>Subscribe</Link>
          <button className="ghost-btn" type="button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
