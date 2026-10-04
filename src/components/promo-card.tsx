"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { likePost, subscribe, unlock } from "@/lib/actions";
import { TRACKS } from "@/lib/kit";
import { BrandBurst } from "./brand-burst";

let stopTune: (() => void) | null = null;

function playTune(track: string) {
  stopTune?.();
  const piece = TRACKS.find((item) => item.id === track);
  if (!piece) return;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  const master = ctx.createGain();
  master.gain.value = 0.04;
  master.connect(ctx.destination);
  let step = 0;
  const timer = window.setInterval(() => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = piece.notes[step % piece.notes.length];
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.8, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(master);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    step += 1;
  }, 280);
  stopTune = () => {
    window.clearInterval(timer);
    ctx.close();
    stopTune = null;
  };
}

type Option =
  | { kind: "ppv"; postId: string; label: string }
  | { kind: "sub"; creatorId: string; tier: string; label: string };

export function PromoCard({
  postId,
  photo,
  clip = "",
  audio = "",
  track = "",
  locked,
  liked,
  count,
  signedIn,
  wide = false,
  options,
}: {
  postId: string;
  photo: string;
  clip?: string;
  audio?: string;
  track?: string;
  wide?: boolean;
  locked: boolean;
  liked: boolean;
  count: number;
  signedIn: boolean;
  options: Option[];
}) {
  const router = useRouter();
  const [on, setOn] = useState(liked);
  const [total, setTotal] = useState(count);
  const [burst, setBurst] = useState(false);
  const [sound, setSound] = useState(false);
  const [ready, setReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [, start] = useTransition();

  function toggleMusic() {
    if (sound) {
      audioRef.current?.pause();
      stopTune?.();
      setSound(false);
      return;
    }
    if (audio) {
      const player = audioRef.current || new Audio(audio);
      audioRef.current = player;
      player.play().catch(() => undefined);
    } else if (track) {
      playTune(track);
    }
    setSound(true);
  }

  function flash() {
    setBurst(true);
    window.setTimeout(() => setBurst(false), 900);
  }

  function like(mode: "add" | "toggle") {
    if (!signedIn) {
      router.push("/login");
      return;
    }
    flash();
    if (mode === "add" && on) return;
    const next = mode === "add" ? true : !on;
    setTotal((value) => (next ? value + (on ? 0 : 1) : Math.max(0, value - 1)));
    setOn(next);
    const data = new FormData();
    data.set("postId", postId);
    data.set("mode", mode);
    start(() => likePost(data));
  }

  return (
    <article className={`promo-card${wide ? " is-wide" : ""}${locked ? " is-locked" : ""}`}>
      <div className={`promo-shot${ready ? " is-ready" : ""}`} onDoubleClick={() => like("add")}>
        {clip ? <video src={clip} poster={photo} playsInline muted loop autoPlay onLoadedData={() => setReady(true)} /> : <img src={photo} alt="" onLoad={() => setReady(true)} />}
        {ready ? null : <span className="shot-shimmer" />}
        <BrandBurst on={burst} />
        {audio || track ? (
          <button type="button" className={`promo-music${sound ? " on" : ""}`} onClick={(event) => { event.stopPropagation(); toggleMusic(); }}>♪</button>
        ) : null}
        <button type="button" className={on ? "is-on" : ""} onClick={() => like("toggle")} aria-label="Like">
          {on ? "♥" : "♡"} {total}
        </button>
      </div>
      {options.length > 0 ? (
        <div className="promo-options">
          {options.map((option) => option.kind === "ppv" ? (
            <form key={option.label} action={unlock}>
              <input type="hidden" name="postId" value={option.postId} />
              <button type="submit">{option.label}</button>
            </form>
          ) : (
            <form key={option.label} action={subscribe}>
              <input type="hidden" name="creatorId" value={option.creatorId} />
              <input type="hidden" name="tier" value={option.tier} />
              <button type="submit">{option.label}</button>
            </form>
          ))}
        </div>
      ) : null}
    </article>
  );
}
