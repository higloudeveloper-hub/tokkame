"use client";

import { useRouter } from "next/navigation";

export function LangSelect({ lang }: { lang: "en" | "es" }) {
  const router = useRouter();

  function choose(value: "en" | "es") {
    if (value === lang) return;
    document.cookie = `tokkame_lang=${value}; path=/; max-age=31536000`;
    router.refresh();
  }

  return (
    <div className="lang-bar" role="group" aria-label={lang === "es" ? "Idioma" : "Language"}>
      <button type="button" className={lang === "es" ? "on" : ""} onClick={() => choose("es")}>Español</button>
      <button type="button" className={lang === "en" ? "on" : ""} onClick={() => choose("en")}>English</button>
    </div>
  );
}
