import Link from "next/link";
import { Flash, Footer } from "@/components/ui";
import { cancelSubscription } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { money, when } from "@/lib/format";
import { findUserById, readDb } from "@/lib/store";
import { redirect } from "next/navigation";

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const sp = await searchParams;
  const me = await getSessionUser();
  if (!me) redirect("/login");
  const db = readDb();
  const mine = db.subscriptions
    .filter((item) => item.userId === me.id)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  return (
    <>
      <Flash error={sp.error} ok={sp.ok} />
      <p className="kicker">Circles</p>
      <h1 className="display" style={{ fontSize: 52, marginTop: 0 }}>Tus suscripciones</h1>
      {mine.length === 0 ? (
        <div className="panel">
          <p>Todavía no entraste a un Circle.</p>
          <Link className="btn" href="/discover">Discover</Link>
        </div>
      ) : (
        <div className="list">
          {mine.map((sub) => {
            const creator = findUserById(db, sub.creatorId);
            if (!creator) return null;
            return (
              <article key={sub.id} className="panel row" style={{ justifyContent: "space-between" }}>
                <div>
                  <Link href={`/creator/${creator.username}`}><strong>{creator.displayName}</strong></Link>
                  <p className="tiny muted" style={{ margin: "4px 0" }}>
                    <span suppressHydrationWarning>{sub.tier} · {money(sub.price)}/mes · {sub.status} · desde {when(sub.startedAt)}</span>
                  </p>
                </div>
                {sub.status === "active" ? (
                  <form action={cancelSubscription}>
                    <input type="hidden" name="id" value={sub.id} />
                    <button className="btn ghost small" type="submit">Cancelar</button>
                  </form>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
      <Footer />
    </>
  );
}
