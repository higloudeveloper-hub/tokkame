"use client";

import Link from "next/link";
import { useState } from "react";

export type RecoItem = {
  id: string;
  title: string;
  creator: string;
  price: string;
  photo: string;
  href: string;
  action: string;
  locked: boolean;
  bucket: "trending" | "new" | "popular";
};

const tabs = ["All", "Trending", "New", "Popular"] as const;

export function RecoRow({ items }: { items: RecoItem[] }) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const shown = tab === "All" ? items : items.filter((item) => item.bucket === tab.toLowerCase());
  return (
    <section>
      <div className="section-head">
        <h2>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff2e3c" strokeWidth="1.8"><path d="M12 3v6M12 15v6M4.9 6.5l4.2 4.2M14.9 13.3l4.2 4.2M3 12h6M15 12h6M4.9 17.5l4.2-4.2M14.9 10.7l4.2-4.2" /></svg>
          Recommended For You
        </h2>
        <div className="filters">
          {tabs.map((item) => (
            <button key={item} type="button" className={tab === item ? "on" : ""} onClick={() => setTab(item)}>
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="reco-row" key={tab}>
        {shown.map((item, index) => (
          <article key={item.id} className="rcard" style={{ animationDelay: `${index * 40}ms` }}>
            <Link className="rcard-visual" href={item.href}>
              <img src={item.photo} alt="" />
              {item.locked ? <span className="lock" aria-hidden>🔒</span> : null}
            </Link>
            <div className="rcard-body">
              <span className="soft">{item.creator}</span>
              <strong>{item.title}</strong>
              <div className="price">{item.price}</div>
              <Link className="red-btn block" href={item.href}>{item.action}</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
