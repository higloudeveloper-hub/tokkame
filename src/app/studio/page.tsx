import { Flash } from "@/components/notices";
import { publishCut } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { getLang } from "@/lib/lang";
import { CLIPS } from "@/lib/studio";
import { plusActive, readDb } from "@/lib/store";

export default async function StudioPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
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
      <p className="kicker">{es ? "Estudio" : "Studio"}</p>
      <h1>{es ? "Publica un corte." : "Publish a cut."}</h1>
      <p>{es ? "Eliges un video, escribes una línea y entra al programa. Ver es gratis. Sin Plus puedes publicar uno al día." : "Pick a video, write one line, and it enters the program. Watching is free. Without Plus you can publish one a day."}</p>
      <form action={publishCut} className="form-grid">
        <label className="stack">{es ? "Línea" : "Line"}
          <input name="caption" required minLength={3} maxLength={80} placeholder={es ? "Una frase. Nada más." : "One line. Nothing else."} />
        </label>
        <label className="stack">{es ? "Video" : "Video"}
          <select name="clipId" defaultValue={CLIPS[0]?.id}>
            {CLIPS.map((clip) => (
              <option key={clip.id} value={clip.id}>{clip.title}</option>
            ))}
          </select>
        </label>
        <button className="red-btn" type="submit">{es ? "Publicar" : "Publish"}</button>
      </form>
      <p className="muted">{plus ? (es ? "Plus activo: sin límite de hoy." : "Plus is on: no limit today.") : (es ? "Plan gratis: 1 corte al día. Plus son $6.99 al mes." : "Free plan: 1 cut a day. Plus is $6.99 a month.")}</p>
    </section>
  );
}
