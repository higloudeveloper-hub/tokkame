import Link from "next/link";
import { ProviderSignIn } from "@/components/provider-sign-in";
import { Flash } from "@/components/notices";
import { continueAsGuest, signup } from "@/lib/actions";
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
    <div className={forCall ? "enter-gate" : "panel form-grid"} style={forCall ? undefined : { maxWidth: 640 }}>
      <p className="kicker">{forCall ? (es ? "Para llamarla" : "To call her") : (es ? "Registro" : "Sign up")}</p>
      <h1 className="display">{forCall ? (es ? "Elige cómo entrar" : "Choose how to enter") : (es ? "Entra a Tokkame" : "Join Tokkame")}</h1>
      {forCall ? <p className="call-note-line">{es ? "Si te registras, recibes 13 créditos gratis." : "Register and you get 13 free credits."}</p> : null}
      <ProviderSignIn next={next} lang={lang} bare={forCall} />
      {forCall ? (
        <>
          <div className="enter-or"><span>{es ? "o" : "or"}</span></div>
          <form action={continueAsGuest}>
            {next ? <input type="hidden" name="next" value={next} /> : null}
            <button className="ghost-btn guest-go" type="submit">{es ? "Continuar como invitado" : "Continue as guest"}</button>
          </form>
        </>
      ) : null}
      {forCall ? null : <form action={signup} className="form-grid">
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
      </form>}
    </div>
  );
}
