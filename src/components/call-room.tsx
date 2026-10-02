"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { askCall, sandboxHear, startCall, unlock } from "@/lib/actions";
import { PayChoices } from "@/components/pay-choices";

function clock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

export type CallPost = {
  id: string;
  image: string;
  caption: string;
  locked: boolean;
  price: string;
  premium: boolean;
};

export function CallRoom({
  name,
  username,
  photo,
  paidUntil,
  ring,
  error,
  posts,
  ask,
}: {
  name: string;
  username: string;
  photo: string;
  paidUntil: string | null;
  ring: boolean;
  error?: string;
  posts: CallPost[];
  ask: { status: "pending" | "accepted" | "declined" | "closed"; note: string } | null;
}) {
  const router = useRouter();
  const active = Boolean(paidUntil && new Date(paidUntil).getTime() > Date.now());
  const [phase, setPhase] = useState<"pay" | "ring" | "live">(active ? (ring ? "ring" : "live") : "pay");
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (ask?.status !== "pending" || active) return;
    const poll = setInterval(() => router.refresh(), 2000);
    const hear = setTimeout(() => {
      const data = new FormData();
      data.set("username", username);
      void sandboxHear(data);
    }, 5200);
    return () => {
      clearInterval(poll);
      clearTimeout(hear);
    };
  }, [ask?.status, active, router, username]);

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
        <div className="call-pay">
          <img src={photo} alt="" />
          <p className="call-kicker">Private call · 18+</p>
          <h1>{name}</h1>
          <strong>$13 <span>/ hour</span></strong>
          <HerPosts name={name} username={username} posts={posts} />
          {ask?.status === "pending" ? (
            <div className="call-wait">
              <div className="call-pulse">
                <img src={photo} alt="" />
              </div>
              <h2>She is reading your note</h2>
              <blockquote>{ask.note}</blockquote>
              <p>She can accept or decline. The hour is not charged until she says yes.</p>
            </div>
          ) : null}
          {ask?.status === "accepted" ? (
            <form action={startCall} className="call-pay-form">
              <input type="hidden" name="username" value={username} />
              <p className="call-copy">She accepted. Pay for the hour. The call stays on Tokkame.</p>
              <blockquote>{ask.note}</blockquote>
              {error ? <p className="pay-note">{error}</p> : null}
              <PayChoices label="Pay $13" />
            </form>
          ) : null}
          {ask?.status !== "pending" && ask?.status !== "accepted" ? (
            <form action={askCall} className="call-pay-form">
              <input type="hidden" name="username" value={username} />
              {ask?.status === "declined" ? <p className="pay-note">She said no to that note. Write another if you want to ask again.</p> : null}
              <label className="call-note">
                <span>Note for {name}</span>
                <textarea name="note" required minLength={8} maxLength={240} placeholder="Tell her why you want the hour." />
              </label>
              <p className="call-copy">She reads this before the call. She can say yes or no. You pay only if she accepts.</p>
              {error ? <p className="pay-note">{error}</p> : null}
              <button className="red-btn" type="submit">Send note</button>
            </form>
          ) : null}
        </div>
      ) : null}

      {phase === "ring" ? (
        <div className="call-ringing">
          <div className="call-pulse">
            <img src={photo} alt="" />
          </div>
          <h1>Connecting with {name}</h1>
          <p>She already accepted. The call stays on Tokkame.</p>
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

function HerPosts({ name, username, posts }: { name: string; username: string; posts: CallPost[] }) {
  return (
    <div className="call-extra">
      <div className="call-extra-head">
        <strong>More of {name}</strong>
        <Link href={`/creator/${username}`}>See her profile</Link>
      </div>
      {posts.length ? (
        <div className="call-shots">
          {posts.map((post) => (
            <article key={post.id} className={post.locked ? "is-locked" : ""}>
              <img src={post.image} alt="" />
              <span>{post.caption}</span>
              {post.locked && !post.premium ? (
                <form action={unlock}>
                  <input type="hidden" name="postId" value={post.id} />
                  <button className="red-btn" type="submit">Unlock {post.price}</button>
                </form>
              ) : null}
              {post.premium ? <Link className="red-btn" href={`/creator/${username}?tab=premium`}>Unlock</Link> : null}
              {!post.locked ? <em>Free</em> : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="call-copy">Her profile has the rest.</p>
      )}
    </div>
  );
}
