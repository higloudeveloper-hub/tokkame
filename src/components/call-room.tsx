"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { askCall, sandboxHear, startCall, unlock as unlockAction } from "@/lib/actions";
import { PayChoices } from "@/components/pay-choices";
import type { Lang } from "@/lib/lang";

const copy = {
  en: {
    kicker: "Private call · 18+",
    hour: "/ hour",
    more: "More of",
    profile: "See her profile",
    rest: "Her profile has the rest.",
    free: "Free",
    reading: "She is reading your note",
    wait: "Nothing is charged while you wait.",
    steps: ["Note sent", "She reads", "She decides"],
    until: "Left until she answers",
    whileYou: "While you wait",
    sent: "Your note is with her.",
    accepted: "She accepted. Pay for the hour. The call stays on Tokkame.",
    pay: "Pay $13",
    declined: "She said no to that note. Write another if you want to ask again.",
    note: "Note for",
    placeholder: "Tell her why you want the hour.",
    before: "She reads this before the call. She can say yes or no. You pay only if she accepts.",
    send: "Send note",
    connecting: "Connecting with",
    already: "She already accepted. The call stays on Tokkame.",
    on: "On Tokkame with",
    left: "Time left",
    add: "Add another hour",
    addPay: "Add 1 hour · $13",
  },
  es: {
    kicker: "Llamada privada · 18+",
    hour: "/ hora",
    more: "Más de",
    profile: "Ver su perfil",
    rest: "El resto está en su perfil.",
    free: "Gratis",
    reading: "Ella está leyendo tu nota",
    wait: "Nada se cobra mientras esperas.",
    steps: ["Nota enviada", "Ella lee", "Ella decide"],
    until: "Tiempo para que responda",
    whileYou: "Mientras esperas",
    sent: "Tu nota ya está con ella.",
    accepted: "Ella aceptó. Paga la hora. La llamada se queda en Tokkame.",
    pay: "Pagar $13",
    declined: "Dijo que no a esa nota. Escribe otra si quieres pedir de nuevo.",
    note: "Nota para",
    placeholder: "Dile por qué quieres la hora.",
    before: "Ella lee esto antes de la llamada. Puede decir que sí o que no. Pagas solo si acepta.",
    send: "Enviar nota",
    connecting: "Conectando con",
    already: "Ella ya aceptó. La llamada se queda en Tokkame.",
    on: "En Tokkame con",
    left: "Tiempo restante",
    add: "Agregar otra hora",
    addPay: "Agregar 1 hora · $13",
  },
} as const;

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
  lang,
}: {
  name: string;
  username: string;
  photo: string;
  paidUntil: string | null;
  ring: boolean;
  error?: string;
  posts: CallPost[];
  ask: { status: "pending" | "accepted" | "declined" | "closed"; note: string; createdAt: string } | null;
  lang: Lang;
}) {
  const t = copy[lang];
  const router = useRouter();
  const active = Boolean(paidUntil && new Date(paidUntil).getTime() > Date.now());
  const [phase, setPhase] = useState<"pay" | "ring" | "live">(active ? (ring ? "ring" : "live") : "pay");
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (ask?.status !== "pending" || active) return;
    const ends = new Date(ask.createdAt).getTime() + 20000;
    const poll = setInterval(() => router.refresh(), 2000);
    const hear = setTimeout(() => {
      const data = new FormData();
      data.set("username", username);
      void sandboxHear(data);
    }, Math.max(0, ends - Date.now()));
    return () => {
      clearInterval(poll);
      clearTimeout(hear);
    };
  }, [ask?.status, ask?.createdAt, active, router, username]);

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
      {phase === "pay" && ask?.status === "pending" ? (
        <WaitGuide name={name} photo={photo} note={ask.note} createdAt={ask.createdAt} posts={posts} lang={lang} />
      ) : null}

      {phase === "pay" && ask?.status !== "pending" ? (
        <div className="call-pay">
          <img src={photo} alt="" />
          <p className="call-kicker">{t.kicker}</p>
          <h1>{name}</h1>
          <strong>$13 <span>{t.hour}</span></strong>
          <HerPosts name={name} username={username} posts={posts} lang={lang} />
          {ask?.status === "accepted" ? (
            <form action={startCall} className="call-pay-form">
              <input type="hidden" name="username" value={username} />
              <p className="call-copy">{t.accepted}</p>
              <blockquote>{ask.note}</blockquote>
              {error ? <p className="pay-note">{error}</p> : null}
              <PayChoices lang={lang} label={t.pay} />
            </form>
          ) : null}
          {ask?.status !== "pending" && ask?.status !== "accepted" ? (
            <form action={askCall} className="call-pay-form">
              <input type="hidden" name="username" value={username} />
              {ask?.status === "declined" ? <p className="pay-note">{t.declined}</p> : null}
              <label className="call-note">
                <span>{t.note} {name}</span>
                <textarea name="note" required minLength={8} maxLength={240} placeholder={t.placeholder} />
              </label>
              <p className="call-copy">{t.before}</p>
              {error ? <p className="pay-note">{error}</p> : null}
              <button className="red-btn" type="submit">{t.send}</button>
            </form>
          ) : null}
        </div>
      ) : null}

      {phase === "ring" ? (
        <div className="call-ringing">
          <div className="call-pulse">
            <img src={photo} alt="" />
          </div>
          <h1>{t.connecting} {name}</h1>
          <p>{t.already}</p>
        </div>
      ) : null}

      {phase === "live" ? (
        <div className="call-live">
          <img src={photo} alt="" />
          <p>{t.on} {name}</p>
          <b suppressHydrationWarning>{clock(left)}</b>
          <span>{t.left}</span>
          <form action={startCall} className="call-more">
            <input type="hidden" name="username" value={username} />
            <p>{t.add}</p>
            <PayChoices lang={lang} label={t.addPay} />
          </form>
        </div>
      ) : null}
    </section>
  );
}

function WaitGuide({
  name,
  photo,
  note,
  createdAt,
  posts,
  lang,
}: {
  name: string;
  photo: string;
  note: string;
  createdAt: string;
  posts: CallPost[];
  lang: Lang;
}) {
  const t = copy[lang];
  const ends = new Date(createdAt).getTime() + 20000;
  const slides = posts.length ? posts : [{ id: "face", image: photo, caption: name, locked: false, price: "", premium: false }];
  const [now, setNow] = useState(() => Date.now());
  const [slide, setSlide] = useState(0);
  const left = Math.max(0, ends - now);
  const step = left > 14000 ? 0 : left > 7000 ? 1 : 2;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setSlide((value) => (value + 1) % slides.length), 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const current = slides[slide % slides.length];

  return (
    <div className="call-guide">
      <ol className="call-steps">
        {t.steps.map((label, index) => (
          <li key={label} className={index === step ? "on" : index < step ? "done" : ""}>{label}</li>
        ))}
      </ol>
      <div className="call-count">
        <b suppressHydrationWarning>{clock(left)}</b>
        <span>{t.until}</span>
        <i style={{ width: `${Math.min(100, (left / 20000) * 100)}%` }} />
      </div>
      <article className="call-promo" key={current.id + slide}>
        <img src={current.image} alt="" className={current.locked ? "is-locked" : ""} />
        <div>
          <small>{t.whileYou}</small>
          <strong>{current.caption}</strong>
        </div>
      </article>
      <div className="call-promo-dots">
        {slides.map((item, index) => (
          <button key={item.id} type="button" className={index === slide % slides.length ? "on" : ""} aria-label={item.caption} onClick={() => setSlide(index)} />
        ))}
      </div>
      <p className="call-guide-now">{name}</p>
      <p className="call-copy">{step === 0 ? t.sent : step === 1 ? t.reading : t.steps[2]}</p>
      <blockquote>{note}</blockquote>
      <p className="call-copy">{t.wait}</p>
    </div>
  );
}

function HerPosts({ name, username, posts, lang }: { name: string; username: string; posts: CallPost[]; lang: Lang }) {
  const t = copy[lang];
  const unlock = lang === "es" ? "Desbloquear" : "Unlock";
  return (
    <div className="call-extra">
      <div className="call-extra-head">
        <strong>{t.more} {name}</strong>
        <Link href={`/creator/${username}`}>{t.profile}</Link>
      </div>
      {posts.length ? (
        <div className="call-shots">
          {posts.map((post) => (
            <article key={post.id} className={post.locked ? "is-locked" : ""}>
              <img src={post.image} alt="" />
              <span>{post.caption}</span>
              {post.locked && !post.premium ? (
                <form action={unlockAction}>
                  <input type="hidden" name="postId" value={post.id} />
                  <button className="red-btn" type="submit">{unlock} {post.price}</button>
                </form>
              ) : null}
              {post.premium ? <Link className="red-btn" href={`/creator/${username}?tab=premium`}>{unlock}</Link> : null}
              {!post.locked ? <em>{t.free}</em> : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="call-copy">{t.rest}</p>
      )}
    </div>
  );
}
