import { Flash, Footer } from "@/components/ui";
import { adminDismiss, adminSuspend, adminVerify, deletePost } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { findUserById, readDb } from "@/lib/store";
import { redirect } from "next/navigation";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const sp = await searchParams;
  const me = await getSessionUser();
  if (!me) redirect("/login");
  if (me.role !== "admin") redirect("/");
  const db = readDb();
  const pending = db.users.filter((user) => user.role === "creator" && user.verified === "pending");
  const reports = db.reports.filter((item) => item.status === "open");

  return (
    <>
      <Flash error={sp.error} ok={sp.ok} />
      <p className="kicker">Admin</p>
      <h1 className="display" style={{ fontSize: 52, marginTop: 0 }}>Moderación</h1>
      <div className="stat-grid">
        <article className="card stat"><strong>{db.users.length}</strong><span>cuentas</span></article>
        <article className="card stat"><strong>{db.users.filter((user) => user.role === "creator").length}</strong><span>creadores</span></article>
        <article className="card stat"><strong>{reports.length}</strong><span>reportes abiertos</span></article>
        <article className="card stat"><strong>{pending.length}</strong><span>verificaciones</span></article>
      </div>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Verificación de creadores</h2>
        {pending.length === 0 ? <p className="muted">No hay solicitudes pendientes.</p> : null}
        {pending.map((user) => (
          <div key={user.id} className="row" style={{ justifyContent: "space-between", marginTop: 10 }}>
            <span>@{user.username} · {user.verificationNote || "sin nombre legal"}</span>
            <span className="row">
              <form action={adminVerify}>
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="decision" value="verified" />
                <button className="btn small" type="submit">Aprobar</button>
              </form>
              <form action={adminVerify}>
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="decision" value="rejected" />
                <button className="btn ghost small" type="submit">Rechazar</button>
              </form>
            </span>
          </div>
        ))}
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Reportes</h2>
        {reports.length === 0 ? <p className="muted">La cola está vacía.</p> : null}
        {reports.map((report) => {
          const post = report.postId ? db.posts.find((item) => item.id === report.postId) : null;
          const target = report.targetUserId ? findUserById(db, report.targetUserId) : null;
          return (
            <article key={report.id} className="card" style={{ marginTop: 10 }}>
              <p>{report.reason}</p>
              <p className="tiny muted">@{findUserById(db, report.reporterId)?.username} reporta a @{target?.username}</p>
              {post ? <p className="tiny">{post.caption}</p> : null}
              <div className="row">
                {post ? (
                  <form action={deletePost}>
                    <input type="hidden" name="postId" value={post.id} />
                    <button className="btn small" type="submit">Retirar publicación</button>
                  </form>
                ) : null}
                {target ? (
                  <form action={adminSuspend}>
                    <input type="hidden" name="userId" value={target.id} />
                    <button className="btn ghost small" type="submit">{target.suspended ? "Reactivar" : "Suspender"}</button>
                  </form>
                ) : null}
                <form action={adminDismiss}>
                  <input type="hidden" name="id" value={report.id} />
                  <button className="btn ghost small" type="submit">Descartar</button>
                </form>
              </div>
            </article>
          );
        })}
      </section>
      <Footer />
    </>
  );
}
