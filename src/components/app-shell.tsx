"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { logout } from "@/lib/actions";
import type { SessionView } from "@/lib/types";

type Activity = { id: string; name: string; username: string; line: string; time: string; photo: string };

const mainLinks = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/talk", label: "Talk", icon: "chat" },
  { href: "/videos", label: "Videos", icon: "play" },
  { href: "/discover", label: "Discover", icon: "compass" },
  { href: "/trending", label: "Trending", icon: "flame" },
];

export function AppShell({
  user,
  activity,
  children,
}: {
  user: SessionView | null;
  activity: Activity[];
  children: ReactNode;
}) {
  const path = usePathname();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const [bell, setBell] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("tokkame-theme");
    if (saved === "light") {
      setDark(false);
      document.documentElement.dataset.theme = "light";
    }
  }, []);

  useEffect(() => {
    setOpen(false);
    setBell(false);
  }, [path]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("tokkame-theme", next ? "dark" : "light");
  }

  function active(href: string) {
    if (href === "/") return path === "/";
    const [pathname, query] = href.split("?");
    if (path !== pathname) return false;
    if (!query) return pathname !== "/discover" || sp.toString() === "";
    const wanted = new URLSearchParams(query);
    for (const [key, value] of wanted) if (sp.get(key) !== value) return false;
    return true;
  }

  return (
    <div className="app">
      <header className="app-top">
        <button className="icon-btn menu-btn" type="button" aria-label="Open menu" onClick={() => setOpen(true)}>
          <Icon name="menu" />
        </button>
        <Link href="/" className="wordmark"><i />TOKKAME</Link>
        <form className="search" action="/discover">
          <Icon name="search" />
          <input name="q" placeholder="Search creators, categories..." aria-label="Search creators, categories" />
        </form>
        <div className="top-right">
          <div style={{ position: "relative" }}>
            <button className="icon-btn" type="button" aria-label="Notifications" onClick={() => setBell((value) => !value)}>
              <Icon name="bell" />
            </button>
            {bell ? (
              <div className="bell-pop">
                {activity.length === 0 ? <p className="soft">No activity yet.</p> : null}
                {activity.map((item) => (
                  <Link key={item.id} href={item.username ? `/creator/${item.username}` : "/feed"}>
                    <img src={item.photo} alt="" />
                    <span className="grow">
                      <strong>{item.name}</strong>
                      <span className="soft" suppressHydrationWarning>{item.line} · {item.time}</span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          {user ? (
            <Link className="avatar-link" href={user.role === "creator" ? "/dashboard" : "/wallet"} aria-label="Your account">
              {user.displayName.slice(0, 1)}
            </Link>
          ) : (
            <Link className="red-btn" href="/login">Log in</Link>
          )}
        </div>
      </header>
      <div className="ticker" aria-hidden>
        <div className="ticker-track">
          {Array.from({ length: 2 }).map((_, copy) => (
            <div key={copy}>
              <span>18+ ADULTS ONLY</span>
              <span>SAY IT HERE</span>
              <span>INFIDELITY</span>
              <span>WORK</span>
              <span>A SECRET</span>
              <span>YOU CHOOSE WHO</span>
            </div>
          ))}
        </div>
      </div>
      <div className="app-body">
        <button className={`scrim${open ? " show" : ""}`} type="button" aria-label="Close menu" onClick={() => setOpen(false)} />
        <aside className={`app-side${open ? " open" : ""}`}>
          {mainLinks.map((link) => (
            <Link key={link.label} href={link.href} className={`side-link${active(link.href) ? " on" : ""}`}>
              <Icon name={link.icon} /> {link.label}
            </Link>
          ))}
          <Link href="/pricing" className={`side-link${path === "/pricing" ? " on" : ""}`}><Icon name="dot" /> Pricing</Link>
          <Link href="/signup?as=creator" className="side-link"><Icon name="dot" /> For Creators</Link>
          <div className="premium">
            <Icon name="crown" />
            <strong>Premium</strong>
            <p>Talk, tip, or unlock her subscription.</p>
            <Link className="red-btn block" href="/pricing">See the three</Link>
          </div>
          <div className="theme-row">
            Dark mode
            <button className={`switch${dark ? " on" : ""}`} type="button" aria-label="Toggle dark mode" onClick={toggleTheme}>
              <span />
            </button>
          </div>
          {user ? (
            <form action={logout}>
              <button className="side-link" type="submit" style={{ width: "100%", background: "transparent" }}>Log out</button>
            </form>
          ) : null}
        </aside>
        <div className="app-main">{children}</div>
      </div>
      <footer className="studio-foot">
        <Link href="/" className="wordmark" style={{ fontSize: 14 }}><i />TOKKAME</Link>
        <nav>
          <Link href="/rules">About</Link>
          <Link href="/rules">Terms</Link>
          <Link href="/rules">Privacy</Link>
          <Link href="/rules">Help</Link>
        </nav>
        <div className="socials" aria-hidden>
          <span>X</span><span>IG</span><span>TT</span><span>YT</span>
        </div>
        <small>© 2026 Tokkame. All rights reserved.</small>
      </footer>
    </div>
  );
}

function Icon({ name }: { name: string }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8 };
  if (name === "chat") return <svg {...common}><path d="M5 6h14v9H8l-3 3z" /></svg>;
  if (name === "play") return <svg {...common}><path d="M8 6.5v11l9-5.5z" /></svg>;
  if (name === "home") return <svg {...common}><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" /></svg>;
  if (name === "compass") return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="m14.5 9.5-1.2 4.8-4.8 1.2 1.2-4.8z" /></svg>;
  if (name === "flame") return <svg {...common}><path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1.2 3 2 3C11 7.5 12 5 12 3z" /></svg>;
  if (name === "spark") return <svg {...common}><path d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3" /></svg>;
  if (name === "star") return <svg {...common}><path d="m12 3 2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z" /></svg>;
  if (name === "pin") return <svg {...common}><path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" /><circle cx="12" cy="11" r="2" /></svg>;
  if (name === "search") return <svg {...common}><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></svg>;
  if (name === "bell") return <svg {...common}><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z" /><path d="M10 19a2 2 0 0 0 4 0" /></svg>;
  if (name === "menu") return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
  if (name === "crown") return <svg {...common}><path d="m3 17 2-9 5 5 2-7 2 7 5-5 2 9z" /></svg>;
  if (name === "more") return <svg {...common}><path d="M5 12h.01M12 12h.01M19 12h.01" strokeWidth="3" /></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="3" /></svg>;
}
