"use client";

import { useEffect, useState } from "react";
import { TRACKS, type Track } from "@/lib/kit";

let stopCurrent: (() => void) | null = null;

export function TrackButton({ track, lang }: { track: Track; lang: "en" | "es" }) {
  const [on, setOn] = useState(false);
  const name = lang === "es" ? track.es : track.en;

  useEffect(() => {
    const off = () => setOn(false);
    window.addEventListener("tokkame-sound", off);
    return () => window.removeEventListener("tokkame-sound", off);
  }, []);

  function play() {
    stopCurrent?.();
    window.dispatchEvent(new Event("tokkame-sound"));
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const master = ctx.createGain();
    master.gain.value = 0.05;
    master.connect(ctx.destination);
    const nodes = track.notes.map((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = index === 0 ? "sine" : "triangle";
      osc.frequency.value = freq;
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(master);
      osc.start();
      return { osc, gain };
    });
    let step = 0;
    const tick = () => {
      nodes.forEach((node, index) => {
        const active = index === step % nodes.length;
        node.gain.gain.setTargetAtTime(active ? 0.9 : 0.04, ctx.currentTime, 0.03);
      });
      step += 1;
    };
    tick();
    const timer = window.setInterval(tick, track.rate);
    const stop = () => {
      window.clearInterval(timer);
      nodes.forEach((node) => node.osc.stop());
      ctx.close();
      if (stopCurrent === stop) stopCurrent = null;
    };
    stopCurrent = stop;
    setOn(true);
  }

  return (
    <button
      className={`ig-track${on ? " on" : ""}`}
      type="button"
      onClick={() => {
        if (on) {
          stopCurrent?.();
          setOn(false);
          return;
        }
        TRACKS.some((item) => item.id === track.id);
        play();
      }}
    >
      {name}
    </button>
  );
}
