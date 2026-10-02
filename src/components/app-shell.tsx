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
    <div className={`app${open ? " nav-open" : ""}`}>
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
          <Link href="/discover" className="icon-btn phone-only" aria-label="Search">
            <Icon name="search" />
          </Link>
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
      <nav className="tabbar" aria-label="App">
        {mainLinks.map((link) => (
          <Link key={link.href} href={link.href} className={active(link.href) ? "on" : ""}>
            <Icon name={link.icon} />
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

function Icon({ name }: { name: string }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "chat") return <svg {...common}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
  if (name === "play") return <svg {...common}><path d="M7 5.5v13l12-6.5z" /></svg>;
  if (name === "home") return <svg {...common}><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .7-1.5l7-6a2 2 0 0 1 2.6 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>;
  if (name === "compass") return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3z" /></svg>;
  if (name === "flame") return <svg {...common}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>;
  if (name === "search") return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
  if (name === "bell") return <svg {...common}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /></svg>;
  if (name === "menu") return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
  if (name === "crown") return <svg {...common}><path d="M11.6 3.4a.5.5 0 0 1 .8 0l2.4 3.6 4.2-1.2a.5.5 0 0 1 .6.6L18 14H6L4.4 6.4a.5.5 0 0 1 .6-.6l4.2 1.2z" /><path d="M6 18h12" /></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="3" /></svg>;
}
