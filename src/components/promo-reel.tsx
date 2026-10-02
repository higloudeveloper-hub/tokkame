"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const ads = [
  {
    kicker: "INFIDELITY",
    title: "Say the part you have not said.",
    text: "One person. A private conversation. You pick who hears it.",
    cta: "Talk now",
    href: "/talk#infidelity",
    photo: "/talk/infidelity.jpg",
  },
  {
    kicker: "WORK",
    title: "Leave the day with someone who listens.",
    text: "Not a meeting. Not a performance. Just the truth of the week.",
    cta: "Find them",
    href: "/talk#work",
    photo: "/talk/work.jpg",
  },
  {
    kicker: "YOU CHOOSE",
    title: "Connect with whoever you want.",
    text: "Scroll the people. Open a chat. Pay for the time.",
    cta: "See people",
    href: "/discover",
    photo: "/talk/secret.jpg",
  },
];

export function PromoReel() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((value) => (value + 1) % ads.length), 4500);
    return () => clearInterval(timer);
  }, []);
  const ad = ads[index];
  return (
    <Link className="ad-slot" href={ad.href} key={ad.kicker}>
      <img src={ad.photo} alt="" />
      <span className="ad-shade" />
      <span className="ad-shine" />
      <span className="ad-copy">
        <small>{ad.kicker}</small>
        <strong>{ad.title}</strong>
        <em>{ad.text}</em>
      </span>
      <span className="red-btn">{ad.cta}</span>
    </Link>
  );
}
