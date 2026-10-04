"use client";

import { useState } from "react";
import { confirmAge } from "@/lib/actions";
import { Mark } from "./ui";

export function AgeGate({ lang = "en" }: { lang?: "en" | "es" }) {
  const [blocked, setBlocked] = useState(false);
  return (
    <div className="age-gate">
      <div className="age-card card">
        <Mark size={42} />
        <p className="kicker" style={{ marginTop: 18 }}>{lang === "es" ? "Adultos 18+" : "Adults 18+"}</p>
        <h1 className="display" style={{ fontSize: 64, lineHeight: 0.9, margin: "8px 0" }}>
          TOKKAME
        </h1>
        <p className="tagline" style={{ marginTop: 0 }}>{lang === "es" ? "Una página. Una noche. Todos en la misma." : "One page. One night. Everyone on it."}</p>
        {blocked ? (
          <p>{lang === "es" ? "Tokkame es solo para personas de 18 años o más. Esta puerta no se abre." : "Tokkame is only for people 18 or older. This door stays shut."}</p>
        ) : (
          <>
            <p className="lead">
              {lang === "es"
                ? "Una edición nocturna para adultos. Lees y dejas una línea. No es sexo y no hay sala en vivo. No está permitida ninguna cuenta ni contenido que involucre a menores."
                : "A nightly edition for adults. You read and leave one line. Not sex, and there is no live room. No account or content involving minors is allowed."}
            </p>
            <div className="row">
              <form action={confirmAge}>
                <button className="btn" type="submit">{lang === "es" ? "Tengo 18 años o más" : "I am 18 or older"}</button>
              </form>
              <button className="btn ghost" type="button" onClick={() => setBlocked(true)}>
                {lang === "es" ? "Soy menor de edad" : "I am under 18"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
