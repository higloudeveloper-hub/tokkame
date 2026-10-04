"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandBurst } from "./brand-burst";

export function LangSelect({ lang }: { lang: "en" | "es" }) {
  const router = useRouter();
  const [burst, setBurst] = useState(false);

  function choose(value: "en" | "es") {
    if (value === lang) return;
    setBurst(true);
    document.cookie = `tokkame_lang=${value}; path=/; max-age=31536000`;
    window.setTimeout(() => router.refresh(), 850);
  }

  return (
    <div className="lang-bar" role="group" aria-label={lang === "es" ? "Idioma" : "Language"}>
      <BrandBurst on={burst} screen />
      <button type="button" className={lang === "es" ? "on" : ""} onClick={() => choose("es")}>Español</button>
      <button type="button" className={lang === "en" ? "on" : ""} onClick={() => choose("en")}>English</button>
    </div>
  );
}
