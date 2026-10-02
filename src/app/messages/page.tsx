import Link from "next/link";
import { PayChoices } from "@/components/pay-choices";
import { Flash, Footer } from "@/components/ui";
import { sendMessage } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { ago, money } from "@/lib/format";
import { findUserById, readDb } from "@/lib/store";
import { redirect } from "next/navigation";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ with?: string; error?: string; ok?: string }>;
}) {
  const sp = await searchParams;
  const me = await getSessionUser();
  if (!me) redirect("/login");
  const db = readDb();
  const related = db.messages.filter((item) => item.fromId === me.id || item.toId === me.id);
  const ids = new Set<string>();
  for (const item of related) ids.add(item.fromId === me.id ? item.toId : item.fromId);
  if (sp.with) ids.add(sp.with);
  const people = [...ids].map((id) => findUserById(db, id)).filter((user) => user !== null);
  const current = sp.with ? findUserById(db, sp.with) : people[0] ?? null;
  const thread = current
    ? related
        .filter((item) => item.fromId === current.id || item.toId === current.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : [];

  return (
    <>
      <Flash error={sp.error} ok={sp.ok} />
      <p className="kicker msg-kicker">Mensajes</p>
      <h1 className="display msg-title" style={{ fontSize: 48, marginTop: 0 }}>Conversaciones</h1>
      <div className={`grid-2 msg-app${current ? " open" : ""}`}>
        <aside className="panel list msg-list">
          {people.length === 0 ? <p className="muted">Sigue a un creador y escríbele desde su perfil.</p> : null}
          {people.map((person) => (
            <Link key={person.id} href={`/messages?with=${person.id}`} className="person">
              <strong>{person.displayName}</strong>
              <span className="tiny muted">@{person.username}</span>
            </Link>
          ))}
        </aside>
        <section className="panel msg-thread">
          {current ? (
            <>
              <div className="msg-head">
                <Link className="msg-back" href="/messages">Back</Link>
                <h2 style={{ marginTop: 0 }}>@{current.username}</h2>
              </div>
              {current.role === "creator" && current.messagePrice > 0 && current.id !== me.id ? (
                <p className="charge-line">Talk is {money(current.messagePrice)} a message. She keeps it. You need to follow her first.</p>
              ) : null}
              <div className="thread">
                {thread.map((item) => (
                  <div key={item.id} className={`bubble${item.fromId === me.id ? " mine" : ""}`}>
                    <div>{item.body}</div>
                    <div className="tiny muted" suppressHydrationWarning>{ago(item.createdAt)}</div>
                  </div>
                ))}
              </div>
              <form action={sendMessage} className="form-grid" style={{ marginTop: 12 }}>
                <input type="hidden" name="toId" value={current.id} />
                <textarea name="body" placeholder="Escribe" maxLength={1000} />
                {current.role === "creator" && current.messagePrice > 0 && current.id !== me.id ? (
                  <PayChoices label={`Send · ${money(current.messagePrice)}`} />
                ) : (
                  <button className="red-btn" type="submit">Send</button>
                )}
              </form>
            </>
          ) : (
            <p className="muted">Elige una conversación.</p>
          )}
        </section>
      </div>
      <Footer />
    </>
  );
}
