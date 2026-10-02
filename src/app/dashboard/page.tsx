import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { Flash, Footer } from "@/components/ui";
import {
  answerCall,
  becomeCreator,
  createPost,
  deletePost,
  submitVerification,
  updateProfile,
  updateTiers,
} from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { CATEGORIES, money, REGIONS } from "@/lib/format";
import {
  earnings,
  earningsByType,
  followerCount,
  monthStart,
  readDb,
  subscriberCount,
} from "@/lib/store";
import { redirect } from "next/navigation";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const sp = await searchParams;
  const me = await getSessionUser();
  if (!me) redirect("/login");
  if (me.role === "fan") {
    return (
      <div className="panel form-grid" style={{ maxWidth: 640 }}>
        <Flash error={sp.error} ok={sp.ok} />
        <p className="kicker">Creator OS</p>
        <h1 className="display" style={{ fontSize: 52, margin: 0 }}>Tu perfil todavía es de fan</h1>
        <p className="muted">Cuando lo actives, Tokkame te da perfil, contenido, Circle y un panel de ingresos. La verificación queda pendiente hasta que administración la apruebe.</p>
        <form action={becomeCreator}>
          <button className="btn" type="submit">Activar perfil de creador</button>
        </form>
      </div>
    );
  }

  const db = readDb();
  const since = monthStart();
  const monthNet = earnings(db, me.id, since);
  const buckets = earningsByType(db, me.id, since);
  const subs = db.subscriptions.filter((item) => item.creatorId === me.id);
  const active = subs.filter((item) => item.status === "active" && new Date(item.renewsAt).getTime() > Date.now());
  const newSubs = subs.filter((item) => new Date(item.startedAt).getTime() >= since);
  const retention = subs.length ? Math.round((active.length / subs.length) * 100) : 0;
  const posts = db.posts.filter((post) => post.creatorId === me.id);
  const referred = db.users.filter((user) => user.referredBy === me.id);
  const audience = [
    ...db.follows.filter((item) => item.creatorId === me.id).map((item) => ({ userId: item.userId, kind: "seguidor", since: item.createdAt })),
  ].slice(0, 12);

  return (
    <>
      <Flash error={sp.error} ok={sp.ok} />
      <p className="kicker">Creator OS</p>
      <h1 className="display" style={{ fontSize: 52, marginTop: 0 }}>Este mes</h1>
      {me.verified !== "verified" ? (
        <p className="flash bad">La monetización sigue cerrada hasta que la verificación quede aprobada. Puedes publicar en el feed público.</p>
      ) : null}
      <section className="pay-board">
        <article className="pay-card">
          <img src="/talk/listen.jpg" alt="" />
          <small>TALK</small>
          <strong>{money(buckets.message)}</strong>
          <em>this month · you charge {money(db.users.find((user) => user.id === me.id)?.messagePrice || 0)} a message</em>
        </article>
        <article className="pay-card">
          <img src="/talk/secret.jpg" alt="" />
          <small>TIPS</small>
          <strong>{money(buckets.tip)}</strong>
          <em>this month · $5 to $50, on top of everything</em>
        </article>
        <article className="pay-card lead">
          <img src="/talk/work.jpg" alt="" />
          <small>PREMIUM</small>
          <strong>{money(buckets.subscription)}</strong>
          <em>this month · {subscriberCount(db, me.id)} unlocked you</em>
        </article>
      </section>
      <p className="tiny muted" style={{ marginTop: 8 }}>Net this month {money(monthNet)}. Unlocks also include single posts {money(buckets.ppv)}. New subscribers +{newSubs.length}. Retention {retention}%. Followers {followerCount(db, me.id)}. Referrals {money(buckets.referral)}.</p>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Tu enlace</h2>
        <p>tokkame.com/@{me.username}</p>
        <div className="row">
          <CopyButton path={`/@${me.username}`} label="Copiar enlace de creador" />
          <CopyButton path={`/signup?as=creator&ref=${me.username}`} label="Copiar invitación" />
        </div>
        <p className="tiny muted">
          Si un creador invitado genera ingresos, recibes 5% durante 180 días. Sale de la comisión de Tokkame, no de su parte.
          Invitados: {referred.length}.
        </p>
      </section>

      {db.callAsks?.some((item) => item.creatorId === me.id && item.status === "pending") ? (
        <section className="panel call-asks" style={{ marginTop: 16 }}>
          <h2>Notas de llamada</h2>
          <p className="muted">Lee la nota antes de la hora. Si dices que no, esa llamada no se cobra.</p>
          {db.callAsks
            .filter((item) => item.creatorId === me.id && item.status === "pending")
            .map((item) => {
              const fan = db.users.find((user) => user.id === item.fanId);
              return (
                <article key={item.id}>
                  <strong>{fan?.displayName ?? "Fan"}</strong>
                  <p>{item.note}</p>
                  <form action={answerCall}>
                    <input type="hidden" name="askId" value={item.id} />
                    <button className="red-btn" name="decision" value="accepted" type="submit">Aceptar</button>
                    <button className="quiet" name="decision" value="declined" type="submit">No</button>
                  </form>
                </article>
              );
            })}
        </section>
      ) : null}

      <div className="grid-2" style={{ marginTop: 16 }}>
        <form action={createPost} className="panel form-grid">
          <h2>Publicar</h2>
          <textarea name="caption" placeholder="Qué sale hoy" required maxLength={500} />
          <label className="stack">Formato
            <select name="format" defaultValue="foto">
              <option value="foto">Foto</option>
              <option value="clip">Clip</option>
              <option value="post">Post</option>
            </select>
          </label>
          <label className="stack">Quién lo ve
            <select name="visibility" defaultValue="public">
              <option value="public">Feed público</option>
              <option value="circle">Circle</option>
              <option value="ppv">Unlock</option>
            </select>
          </label>
          <label className="stack">Nivel mínimo del Circle
            <select name="minTier" defaultValue="inner">
              <option value="inner">Inner Circle</option>
              <option value="vip">VIP</option>
              <option value="elite">Elite</option>
            </select>
          </label>
          <label className="stack">Precio unlock
            <input name="price" type="number" min="1" max="200" step="0.01" defaultValue="9" />
          </label>
          <label className="stack">Drop
            <input name="dropAt" type="datetime-local" />
          </label>
          <label className="stack">Tipo de drop
            <select name="dropKind" defaultValue="contenido">
              <option value="contenido">Contenido</option>
              <option value="coleccion">Colección</option>
              <option value="conversacion">Conversación</option>
              <option value="acceso">Acceso especial</option>
            </select>
          </label>
          <label className="stack">Imagen, opcional
            <input name="file" type="file" accept="image/jpeg,image/png,image/webp" />
          </label>
          <label className="check"><input type="checkbox" name="allowRemix" /> Permitir remix del contenido público</label>
          <label className="check"><input type="checkbox" name="consent" required /> Confirmo que todas las personas en esta publicación son adultas y consintieron.</label>
          <button className="btn" type="submit">Publicar</button>
          <p className="tiny muted">Sin archivo, Tokkame muestra una pieza visual. El video de verdad entra con el almacenamiento. El directo no está en esta versión.</p>
        </form>

        <div className="list">
          <section className="panel">
            <h2>Ingresos del mes</h2>
            <p>Suscripciones {money(buckets.subscription)}</p>
            <p>Propinas {money(buckets.tip)}</p>
            <p>Ventas {money(buckets.ppv)}</p>
            <p>Mensajes {money(buckets.message)}</p>
            <p>Referidos {money(buckets.referral)}</p>
            <Link href="/wallet">Wallet</Link>
          </section>
          <section className="panel">
            <h2>Audiencia</h2>
            {audience.length === 0 ? <p className="muted">Todavía no hay seguidores.</p> : null}
            {audience.map((item) => {
              const person = db.users.find((user) => user.id === item.userId);
              const sub = active.find((entry) => entry.userId === item.userId);
              return (
                <p key={item.userId} className="tiny" style={{ margin: "6px 0" }}>
                  @{person?.username} · {sub ? sub.tier : item.kind}
                </p>
              );
            })}
          </section>
        </div>
      </div>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Tu contenido</h2>
        <div className="list">
          {posts.map((post) => (
            <div key={post.id} className="row" style={{ justifyContent: "space-between" }}>
              <span className="tiny">{post.visibility} · {post.caption.slice(0, 80)}</span>
              <form action={deletePost}>
                <input type="hidden" name="postId" value={post.id} />
                <button className="btn ghost small" type="submit">Quitar</button>
              </form>
            </div>
          ))}
        </div>
      </section>

      <form action={updateProfile} className="panel form-grid" style={{ marginTop: 16 }}>
        <h2>Perfil</h2>
        <label className="stack">Nombre<input name="displayName" defaultValue={me.displayName} /></label>
        <label className="stack">Descripción<textarea name="bio" defaultValue={me.bio} maxLength={280} /></label>
        <div className="row">
          {CATEGORIES.map((category) => (
            <label key={category} className="check">
              <input type="checkbox" name={`cat_${category}`} defaultChecked={me.categories.includes(category)} /> {category}
            </label>
          ))}
        </div>
        <label className="stack">Región
          <select name="region" defaultValue={me.region || ""}>
            <option value="">No indicar</option>
            {REGIONS.map((region) => <option key={region}>{region}</option>)}
          </select>
        </label>
        <label className="check"><input type="checkbox" name="shareRegion" defaultChecked={me.shareRegion} /> Compartir región</label>
        <label className="stack">Precio por mensaje
          <input name="messagePrice" type="number" min="0" max="50" step="1" defaultValue={me.messagePrice} />
        </label>
        <button className="btn ghost" type="submit">Guardar perfil</button>
      </form>

      <form action={updateTiers} className="panel form-grid" style={{ marginTop: 16 }}>
        <h2>Niveles del Circle</h2>
        {me.tiers.map((tier) => (
          <div key={tier.id} className="card">
            <strong>{tier.name}</strong>
            <label className="stack">Precio mensual
              <input name={`price_${tier.id}`} type="number" min="1.99" max="200" step="0.01" defaultValue={tier.price} />
            </label>
            <label className="stack">Beneficios, uno por línea
              <textarea name={`perks_${tier.id}`} defaultValue={tier.perks.join("\n")} />
            </label>
          </div>
        ))}
        <button className="btn ghost" type="submit">Guardar niveles</button>
      </form>

      <form action={submitVerification} className="panel form-grid" style={{ marginTop: 16 }}>
        <h2>Verificación</h2>
        <p className="tiny muted">Estado: {me.verified}. En producción, la identidad y la edad las confirma un proveedor especializado. Aquí no se guardan documentos.</p>
        <label className="stack">Nombre legal
          <input name="legalName" defaultValue={me.verificationNote} />
        </label>
        <label className="check"><input type="checkbox" name="confirm" required /> Confirmo que soy mayor de 18 y que el contenido que publique tiene consentimiento de adultos.</label>
        <button className="btn ghost" type="submit">Enviar solicitud</button>
      </form>

      <section className="card" style={{ marginTop: 16 }}>
        <h2>Creator Pro · $19.99/mes</h2>
        <p className="muted">Estadísticas avanzadas, automatizaciones, promoción y segmentación. Entra cuando el cobro real ya funcione.</p>
      </section>
      <Footer />
    </>
  );
}
