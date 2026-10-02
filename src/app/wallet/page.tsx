import { PayChoices } from "@/components/pay-choices";
import { Flash, Footer } from "@/components/ui";
import { addFunds, requestPayout } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { money } from "@/lib/format";
import { getLang } from "@/lib/lang";
import { earnings, readDb } from "@/lib/store";
import { redirect } from "next/navigation";

export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const sp = await searchParams;
  const lang = await getLang();
  const es = lang === "es";
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
      <p className="kicker">{es ? "Billetera" : "Wallet"}</p>
      <h1 className="display" style={{ fontSize: 52, marginTop: 0 }}>{es ? "Saldos" : "Balances"}</h1>
      <div className="stat-grid">
        <article className="card stat"><strong>{money(me.balance)}</strong><span>{es ? "para gastar, prueba" : "to spend, sandbox"}</span></article>
        <article className="card stat"><strong>{money(available)}</strong><span>{es ? "ingresos por retirar" : "earnings to withdraw"}</span></article>
      </div>
      <div className="row" style={{ margin: "16px 0" }}>
        <form action={addFunds} className="wallet-pay">
          <PayChoices lang={lang} label={es ? "Agregar $50" : "Add $50"} />
        </form>
        {me.role === "creator" ? (
          <form action={requestPayout}><button className="btn gold" type="submit">{es ? "Solicitar retiro" : "Request payout"}</button></form>
        ) : null}
      </div>
      <p className="tiny muted">
        {es ? "Eliges Apple Pay, tarjeta o PayPal. En esta demo el cargo entra al saldo de prueba y el número de tarjeta no se guarda." : "Choose Apple Pay, card, or PayPal. In this demo the charge hits the sandbox balance and the card number is not stored."}
      </p>
      <div className="panel" style={{ marginTop: 16, overflowX: "auto" }}>
        <table>
          <thead>
            <tr><th>{es ? "Tipo" : "Type"}</th><th>{es ? "Nota" : "Note"}</th><th>{es ? "Bruto" : "Gross"}</th><th>{es ? "Neto" : "Net"}</th></tr>
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
