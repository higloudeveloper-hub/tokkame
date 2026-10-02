import { Flash, Footer } from "@/components/ui";
import { addFunds, requestPayout } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { money } from "@/lib/format";
import { earnings, readDb } from "@/lib/store";
import { redirect } from "next/navigation";

export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const sp = await searchParams;
  const me = await getSessionUser();
  if (!me) redirect("/login");
  const db = readDb();
  const available = me.role === "creator" ? earnings(db, me.id) : 0;
  const rows = db.transactions
    .filter((tx) => tx.fromUserId === me.id || tx.toUserId === me.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 30);

  return (
    <>
      <Flash error={sp.error} ok={sp.ok} />
      <p className="kicker">Wallet</p>
      <h1 className="display" style={{ fontSize: 52, marginTop: 0 }}>Saldos</h1>
      <div className="stat-grid">
        <article className="card stat"><strong>{money(me.balance)}</strong><span>para gastar, prueba</span></article>
        <article className="card stat"><strong>{money(available)}</strong><span>ingresos por retirar</span></article>
      </div>
      <div className="row" style={{ margin: "16px 0" }}>
        <form action={addFunds}><button className="btn" type="submit">Agregar $50 de prueba</button></form>
        {me.role === "creator" ? (
          <form action={requestPayout}><button className="btn gold" type="submit">Solicitar retiro</button></form>
        ) : null}
      </div>
      <p className="tiny muted">
        Esta versión no cobra tarjetas. El saldo de prueba deja ver el recorrido fan → suscripción → ingreso del creador.
        En producción, Tokkame se conecta a un procesador que acepte explícitamente este modelo.
      </p>
      <div className="panel" style={{ marginTop: 16, overflowX: "auto" }}>
        <table>
          <thead>
            <tr><th>Tipo</th><th>Nota</th><th>Bruto</th><th>Neto</th></tr>
          </thead>
          <tbody>
            {rows.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.type}</td>
                <td>{tx.note}</td>
                <td>{money(tx.amount)}</td>
                <td>{money(tx.net)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer />
    </>
  );
}
