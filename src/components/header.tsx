"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { money } from "@/lib/format";
import type { SessionView } from "@/lib/types";
import { Avatar, Mark } from "./ui";
import { logout } from "@/lib/actions";

const links = [
  { href: "/feed", label: "Feed" },
  { href: "/discover", label: "Discover" },
  { href: "/drops", label: "Drops" },
  { href: "/subscriptions", label: "Circles" },
];

export function Header({ user }: { user: SessionView | null }) {
  const path = usePathname();
  const active = (href: string) => (path === href ? "active" : "");
  return (
    <>
      <header className="topbar">
        <Link href="/" className="brand">
          <Mark />
          TOKKAME
        </Link>
        <nav className="nav-links">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={active(link.href)}>
              {link.label}
            </Link>
          ))}
          {user?.role === "creator" || user?.role === "admin" ? (
            <Link href="/dashboard" className={active("/dashboard")}>
              Panel
            </Link>
          ) : null}
          {user?.role === "admin" ? (
            <Link href="/admin" className={active("/admin")}>
              Admin
            </Link>
          ) : null}
        </nav>
        <div className="top-actions">
          {user ? (
            <>
              <Link className="balance" href="/wallet">
                {money(user.balance)}
              </Link>
              <Link href="/messages" className="btn ghost small desktop-only">
                Mensajes
              </Link>
              <form action={logout}>
                <button className="btn ghost small" type="submit">
                  Salir
                </button>
              </form>
              <Link href={user.role === "creator" ? "/dashboard" : "/subscriptions"} aria-label="Tu cuenta">
                <Avatar hue={user.avatarHue} name={user.displayName} size={36} />
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="btn ghost small">
                Entrar
              </Link>
              <Link href="/signup" className="btn small">
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </header>
      <nav className="bottom-nav">
        <Link href="/feed" className={active("/feed")}>Feed</Link>
        <Link href="/discover" className={active("/discover")}>Discover</Link>
        <Link href="/drops" className={active("/drops")}>Drops</Link>
        <Link href={user ? "/messages" : "/login"} className={active("/messages")}>Mensajes</Link>
        <Link href={user?.role === "creator" ? "/dashboard" : user ? "/wallet" : "/login"} className={active("/dashboard")}>
          {user?.role === "creator" ? "Panel" : "Wallet"}
        </Link>
      </nav>
    </>
  );
}
