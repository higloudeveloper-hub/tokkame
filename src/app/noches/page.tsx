import Link from "next/link";
import { getLang } from "@/lib/lang";
import { nightKey, tonightPrompt } from "@/lib/nights";
import { readDb } from "@/lib/store";

export default async function NightsPage() {
  const lang = await getLang();
  const es = lang === "es";
  const db = readDb();
  const today = nightKey();
  const nights = [...new Set((db.lines || []).map((item) => item.night))].sort((a, b) => (a < b ? 1 : -1));

  return (
    <section className="edition">
      <p className="edition-kicker">{es ? "Archivo" : "Archive"}</p>
      <h1>{es ? "Las noches que ya cerraron." : "The nights already closed."}</h1>
      <p className="edition-meta">{es ? "Cada noche se lee entera. Nadie paga por mirar." : "Each night can be read in full. Nobody pays to look."}</p>
      <ol className="edition-list">
        <li>
          <span>{es ? "Hoy" : "Now"}</span>
          <div>
            <strong>{today}</strong>
            <p><Link href="/">{tonightPrompt(lang)}</Link></p>
          </div>
        </li>
        {nights.filter((night) => night !== today).map((night) => {
          const count = (db.lines || []).filter((item) => item.night === night).length;
          return (
            <li key={night}>
              <span>{count}</span>
              <div>
                <strong>{night}</strong>
                <p>{es ? `${count} líneas guardadas` : `${count} lines kept`}</p>
              </div>
            </li>
          );
        })}
      </ol>
      {nights.filter((night) => night !== today).length === 0 ? (
        <p className="edition-empty">{es ? "Cuando pase esta noche, la página queda aquí." : "When tonight is over, the page stays here."}</p>
      ) : null}
    </section>
  );
}
