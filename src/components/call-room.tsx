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
    wait: "She can accept or decline. The hour is not charged until she says yes.",
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
    wait: "Puede aceptar o decir que no. La hora no se cobra hasta que diga que sí.",
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
  ask: { status: "pending" | "accepted" | "declined" | "closed"; note: string } | null;
  lang: Lang;
}) {
  const t = copy[lang];
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
          <p className="call-kicker">{t.kicker}</p>
          <h1>{name}</h1>
          <strong>$13 <span>{t.hour}</span></strong>
          <HerPosts name={name} username={username} posts={posts} lang={lang} />
          {ask?.status === "pending" ? (
            <div className="call-wait">
              <div className="call-pulse">
                <img src={photo} alt="" />
              </div>
              <h2>{t.reading}</h2>
              <blockquote>{ask.note}</blockquote>
              <p>{t.wait}</p>
            </div>
          ) : null}
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
