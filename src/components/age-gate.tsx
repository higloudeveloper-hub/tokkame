"use client";

import { useState } from "react";
import { confirmAge } from "@/lib/actions";
import { Mark } from "./ui";

export function AgeGate() {
  const [blocked, setBlocked] = useState(false);
  return (
    <div className="age-gate">
      <div className="age-card card">
        <Mark size={42} />
        <p className="kicker" style={{ marginTop: 18 }}>Adultos 18+</p>
        <h1 className="display" style={{ fontSize: 64, lineHeight: 0.9, margin: "8px 0" }}>
          TOKKAME
        </h1>
        <p className="tagline" style={{ marginTop: 0 }}>Say it. Choose who hears it.</p>
        {blocked ? (
          <p>Tokkame es solo para personas de 18 años o más. Esta puerta no se abre.</p>
        ) : (
          <>
            <p className="lead">
              Conversación privada para adultos. No es sexo. Infidelidad, trabajo, un secreto, lo que sea. Eliges con quién. No está permitida ninguna cuenta ni contenido que involucre a menores.
            </p>
            <div className="row">
              <form action={confirmAge}>
                <button className="btn" type="submit">Tengo 18 años o más</button>
              </form>
              <button className="btn ghost" type="button" onClick={() => setBlocked(true)}>
                Soy menor de edad
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
