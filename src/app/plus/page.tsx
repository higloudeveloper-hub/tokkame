import { Flash } from "@/components/notices";
import { buyPlus } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { getLang } from "@/lib/lang";
import { PLUS_PRICE, plusActive, readDb } from "@/lib/store";

export default async function PlusPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const sp = await searchParams;
  const lang = await getLang();
  const es = lang === "es";
  const session = await getSessionUser();
  const db = readDb();
  const user = session ? db.users.find((item) => item.id === session.id) : null;
  const plus = plusActive(user);

  return (
    <section className="studio-tool">
      <Flash error={sp.error} ok={sp.ok} />
      <p className="kicker">Tokkame Plus</p>
      <h1>${PLUS_PRICE}<span> / {es ? "mes" : "mo"}</span></h1>
      <p>{es ? "Ver el programa es gratis, para que pueda crecer. Plus es la herramienta: publicas sin el límite de un corte al día, durante 30 días. Se cobra del saldo de prueba. La tarjeta no se guarda." : "Watching the program is free, so it can grow. Plus is the tool: you publish without the one-cut-a-day limit, for 30 days. It charges sandbox balance. The card is not stored."}</p>
      <ul className="plus-list">
        <li>{es ? "Ver todos los cortes, sin pagar" : "Watch every cut, without paying"}</li>
        <li>{es ? "Publicar más de uno al día" : "Publish more than one a day"}</li>
        <li>{es ? "Recibo en la billetera" : "Receipt in the wallet"}</li>
      </ul>
      {plus ? <p>{es ? `Activo hasta ${new Date(user!.plusUntil!).toLocaleDateString()}` : `On until ${new Date(user!.plusUntil!).toLocaleDateString()}`}</p> : (
        <form action={buyPlus}>
          <button className="red-btn" type="submit">{es ? `Activar Plus · $${PLUS_PRICE}` : `Start Plus · $${PLUS_PRICE}`}</button>
        </form>
      )}
    </section>
  );
}
