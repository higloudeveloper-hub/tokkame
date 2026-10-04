"use client";

import { useState } from "react";

export function ShareSheet({
  path,
  title,
  text,
  lang,
  label,
}: {
  path: string;
  title: string;
  text: string;
  lang: "en" | "es";
  label?: string;
}) {
  const es = lang === "es";
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");

  function absolute() {
    return new URL(path, window.location.origin).toString();
  }

  async function copy(extra: string) {
    const url = absolute();
    try {
      await navigator.clipboard.writeText(`${extra}\n${url}`);
      setNote(es ? "Enlace copiado. Pégalo en la app." : "Link copied. Paste it in the app.");
    } catch {
      setNote(url);
    }
  }

  async function openShare() {
    const url = absolute();
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        /* closed sheet */
      }
    }
    setOpen(true);
  }

  return (
    <div className="ig-share">
      <button type="button" onClick={openShare}>{label || (es ? "Compartir" : "Share")}</button>
      {open ? (
        <div className="ig-share-pop">
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window === "undefined" ? path : absolute())}`} target="_blank" rel="noreferrer">Facebook</a>
          <button type="button" onClick={() => copy(es ? "Mi feed en Tokkame" : "My Tokkame feed")}>Instagram</button>
          <button type="button" onClick={() => copy(es ? "Entra a mi perfil en Tokkame" : "Come to my Tokkame profile")}>TikTok</button>
          <button type="button" onClick={() => copy(text)}>{es ? "Copiar enlace" : "Copy link"}</button>
        </div>
      ) : null}
      {note ? <p>{note}</p> : null}
    </div>
  );
}
