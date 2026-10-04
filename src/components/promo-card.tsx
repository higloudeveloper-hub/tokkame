"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { likePost, subscribe, unlock } from "@/lib/actions";
import { BrandBurst } from "./brand-burst";

type Option =
  | { kind: "ppv"; postId: string; label: string }
  | { kind: "sub"; creatorId: string; tier: string; label: string };

export function PromoCard({
  postId,
  photo,
  locked,
  liked,
  count,
  signedIn,
  options,
}: {
  postId: string;
  photo: string;
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
  const [, start] = useTransition();

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
    <article className={`promo-card${locked ? " is-locked" : ""}`}>
      <div className="promo-shot" onDoubleClick={() => like("add")}>
        <img src={photo} alt="" />
        <BrandBurst on={burst} />
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
