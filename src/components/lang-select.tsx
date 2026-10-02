"use client";

import { useRouter } from "next/navigation";

export function LangSelect({ lang }: { lang: "en" | "es" }) {
  const router = useRouter();

  function choose(value: string) {
    document.cookie = `tokkame_lang=${value}; path=/; max-age=31536000`;
    router.refresh();
  }

  return (
    <div className="lang-bar">
      <label>
        <span>{lang === "es" ? "Idioma" : "Language"}</span>
        <select aria-label="Language" value={lang} onChange={(event) => choose(event.target.value)}>
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
      </label>
    </div>
  );
}
