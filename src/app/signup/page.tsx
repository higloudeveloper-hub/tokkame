import Link from "next/link";
import { ProviderSignIn } from "@/components/provider-sign-in";
import { Flash } from "@/components/ui";
import { signup } from "@/lib/actions";
import { getLang } from "@/lib/lang";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string; ref?: string; as?: string; next?: string }>;
}) {
  const sp = await searchParams;
  const asCreator = sp.as === "creator";
  const next = sp.next?.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "";
  const lang = await getLang();
  const es = lang === "es";
  const forCall = next.startsWith("/call/");
  return (
    <div className="panel form-grid" style={{ maxWidth: 640 }}>
      <p className="kicker">{forCall ? (es ? "Antes de la llamada" : "Before the call") : (es ? "Registro" : "Sign up")}</p>
      <h1 className="display" style={{ fontSize: 48, margin: 0 }}>{forCall ? (es ? "Regístrate para llamarla" : "Sign up to call her") : (es ? "Entra a Tokkame" : "Join Tokkame")}</h1>
      {forCall ? <p className="tiny muted">{es ? "Un toque con Google o Apple. Luego pagas la hora. Tokkame no toma esa contraseña." : "One tap with Google or Apple. Then you pay for the hour. Tokkame does not take that password."}</p> : null}
      <ProviderSignIn next={next} lang={lang} />
      <form action={signup} className="form-grid">
      <Flash error={sp.error} ok={sp.ok} />
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {sp.ref ? <p className="tiny">Invitación de @{sp.ref}</p> : null}
      <input type="hidden" name="ref" value={sp.ref || ""} />
      <label className="stack">Nombre público
        <input name="displayName" required maxLength={40} />
      </label>
      <label className="stack">Usuario
        <input name="username" required placeholder="tu.nombre" maxLength={20} />
      </label>
      <label className="stack">Correo
        <input name="email" type="email" required />
      </label>
      <label className="stack">Contraseña
        <input name="password" type="password" required minLength={8} />
      </label>
      <label className="stack">Quiero
        <select name="role" defaultValue={asCreator ? "creator" : "fan"}>
          <option value="fan">Descubrir y suscribirme</option>
          <option value="creator">Crear mi perfil y monetizar</option>
        </select>
      </label>
      <label className="check">
        <input type="checkbox" name="age" required />
        Confirmo que tengo 18 años o más y que no publicaré contenido que involucre a menores.
      </label>
      <button className="btn" type="submit">Crear cuenta</button>
      <p className="tiny muted">La cuenta nueva recibe $100 de saldo de prueba. Los cobros reales se conectan después con un procesador que acepte este modelo.</p>
      <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}>Ya tengo cuenta</Link>
      </form>
    </div>
  );
}
