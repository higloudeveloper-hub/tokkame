import Link from "next/link";
import { ProviderSignIn } from "@/components/provider-sign-in";
import { Flash } from "@/components/ui";
import { login } from "@/lib/actions";
import { getLang } from "@/lib/lang";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string; next?: string }>;
}) {
  const sp = await searchParams;
  const lang = await getLang();
  const es = lang === "es";
  const next = sp.next?.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "";
  return (
    <div className="grid-2">
      <div className="panel form-grid">
        <p className="kicker">{es ? "Entrar" : "Log in"}</p>
        <h1 className="display" style={{ fontSize: 48, margin: 0 }}>{es ? "Tu cuenta" : "Your account"}</h1>
        <ProviderSignIn next={next} lang={lang} />
        <form action={login} className="form-grid">
        <Flash error={sp.error} ok={sp.ok} />
        <label className="stack">{es ? "Correo o usuario" : "Email or username"}
          <input name="login" autoComplete="username" required />
        </label>
        <label className="stack">{es ? "Contraseña" : "Password"}
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <button className="btn" type="submit">{es ? "Entrar" : "Log in"}</button>
        <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}>{es ? "Crear cuenta" : "Create account"}</Link>
        </form>
      </div>
      <aside className="panel">
        <h2>{es ? "Cuentas de demostración" : "Demo accounts"}</h2>
        <p className="tiny muted">{es ? "Contraseña para las tres: demo1234. El dinero es saldo de prueba." : "Password for all three: demo1234. The money is sandbox balance."}</p>
        <p><strong>sofia@tokkame.app</strong><br />{es ? "Fan, con Circle y saldo." : "Fan, with a Circle and balance."}</p>
        <p><strong>luna@tokkame.app</strong><br />{es ? "Creadora verificada. Panel de ingresos." : "Verified creator. Earnings panel."}</p>
        <p><strong>admin@tokkame.app</strong><br />{es ? "Verificación y reportes." : "Verification and reports."}</p>
      </aside>
    </div>
  );
}
