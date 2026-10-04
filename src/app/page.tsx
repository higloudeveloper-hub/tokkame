import { Flash } from "@/components/notices";
import { leaveLine, takeChair } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { getLang } from "@/lib/lang";
import { nightKey, tonightPrompt } from "@/lib/nights";
import { CHAIR_PRICE, readDb } from "@/lib/store";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const sp = await searchParams;
  const lang = await getLang();
  const es = lang === "es";
  const night = nightKey();
  const db = readDb();
  const session = await getSessionUser();
  const rows = (db.lines || [])
    .filter((item) => item.night === night)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map((item) => {
      const user = db.users.find((person) => person.id === item.userId);
      return { id: item.id, text: item.text, name: item.named ? user?.displayName || (es ? "Con nombre" : "Named") : (es ? "Anónimo" : "Anonymous"), named: item.named };
    });
  const mine = session ? (db.lines || []).find((item) => item.userId === session.id && item.night === night) : null;
  const date = new Date(`${night}T00:00:00.000Z`).toLocaleDateString(es ? "es" : "en", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

  return (
    <section className="edition">
      <Flash ok={sp.ok} error={sp.error} />
      <p className="edition-kicker">{es ? "Una sola página para todos" : "One page for everyone"}</p>
      <time dateTime={night}>{date}</time>
      <h1>{tonightPrompt(lang)}</h1>
      <p className="edition-meta">
        {rows.length} {es ? (rows.length === 1 ? "línea" : "líneas") : (rows.length === 1 ? "line" : "lines")}
        {" · "}
        {es ? "leer es gratis" : "reading is free"}
      </p>
      {rows.length === 0 ? (
        <p className="edition-empty">{es ? "Esta noche todavía está en blanco. La primera línea abre la página." : "Tonight is still blank. The first line opens the page."}</p>
      ) : (
        <ol className="edition-list">
          {rows.map((row, index) => (
            <li key={row.id} className={row.named ? "is-named" : ""}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{row.name}</strong>
                <p>{row.text}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
      {mine?.named ? (
        <p className="edition-mine">{es ? "Tu nombre ya quedó en esta edición." : "Your name is already on this edition."}</p>
      ) : mine ? (
        <form action={takeChair} className="edition-chair">
          <p>{es ? "Tu línea está en la página, sin nombre." : "Your line is on the page, without a name."}</p>
          <button className="red-btn" type="submit">{es ? `Poner mi nombre · $${CHAIR_PRICE}` : `Put my name on it · $${CHAIR_PRICE}`}</button>
        </form>
      ) : (
        <form action={leaveLine} className="edition-write">
          <label>
            <span>{es ? "Tu línea de esta noche" : "Your line tonight"}</span>
            <textarea name="text" required minLength={3} maxLength={140} placeholder={es ? "Una frase. Se lee gratis." : "One sentence. Reading is free."} />
          </label>
          <button className="red-btn" type="submit">{es ? "Dejar mi línea" : "Leave my line"}</button>
        </form>
      )}
      <p className="edition-foot">{es ? `La silla son $${CHAIR_PRICE} del saldo de prueba y solo pone tu nombre. No abre nada. La tarjeta no se guarda.` : `The chair is $${CHAIR_PRICE} from sandbox balance and only puts your name on the page. It opens nothing. The card is not stored.`}</p>
    </section>
  );
}
