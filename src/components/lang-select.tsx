"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const names = { es: "Español", en: "English" } as const;

export function LangSelect({ lang }: { lang: "en" | "es" }) {
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function close(event: PointerEvent) {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  function choose(value: "en" | "es") {
    document.cookie = `tokkame_lang=${value}; path=/; max-age=31536000`;
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="lang-bar" ref={box}>
      <button
        className="lang-current"
        type="button"
        aria-expanded={open}
        aria-label={lang === "es" ? "Idioma" : "Language"}
        onClick={() => setOpen((value) => !value)}
      >
        {names[lang]}
        <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.2 4.4 6 8.2l3.8-3.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
      </button>
      {open ? (
        <div className="lang-menu" role="listbox" aria-label={lang === "es" ? "Idioma" : "Language"}>
          <button type="button" role="option" aria-selected={lang === "es"} className={lang === "es" ? "on" : ""} onClick={() => choose("es")}>Español</button>
          <button type="button" role="option" aria-selected={lang === "en"} className={lang === "en" ? "on" : ""} onClick={() => choose("en")}>English</button>
        </div>
      ) : null}
    </div>
  );
}
