"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { startCall } from "@/lib/actions";
import { PayChoices } from "@/components/pay-choices";

function clock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

export function CallRoom({
  name,
  username,
  photo,
  paidUntil,
  ring,
  error,
}: {
  name: string;
  username: string;
  photo: string;
  paidUntil: string | null;
  ring: boolean;
  error?: string;
}) {
  const active = Boolean(paidUntil && new Date(paidUntil).getTime() > Date.now());
  const [phase, setPhase] = useState<"pay" | "ring" | "live">(active ? (ring ? "ring" : "live") : "pay");
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (phase !== "ring") return;
    const timer = setTimeout(() => setPhase("live"), 5600);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "live" || !paidUntil) return;
    const tick = () => {
      const ms = new Date(paidUntil).getTime() - Date.now();
      setLeft(Math.max(0, ms));
      if (ms <= 0) setPhase("pay");
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [phase, paidUntil]);

  return (
    <section className="call-room">
      {phase === "pay" ? (
        <form action={startCall} className="call-pay">
          <input type="hidden" name="username" value={username} />
          <img src={photo} alt="" />
          <p>Private call · 18+</p>
          <h1>{name}</h1>
          <strong>$13 <span>/ hour</span></strong>
          <p className="call-copy">Pay first. The call stays on Tokkame, with the time on screen. Not sex.</p>
          {error ? <p className="pay-note">{error}</p> : null}
          <PayChoices label="Pay $13" />
          <Link href={`/creator/${username}`}>Back to her profile</Link>
        </form>
      ) : null}

      {phase === "ring" ? (
        <div className="call-ringing">
          <div className="call-pulse">
            <img src={photo} alt="" />
          </div>
          <h1>Connecting with {name}</h1>
          <p>Waiting for her to accept. The call stays on Tokkame.</p>
        </div>
      ) : null}

      {phase === "live" ? (
        <div className="call-live">
          <img src={photo} alt="" />
          <p>On Tokkame with {name}</p>
          <b suppressHydrationWarning>{clock(left)}</b>
          <span>Time left</span>
          <form action={startCall} className="call-more">
            <input type="hidden" name="username" value={username} />
            <p>Add another hour</p>
            <PayChoices label="Add 1 hour · $13" />
          </form>
        </div>
      ) : null}
    </section>
  );
}
