import Link from "next/link";
import { ProviderSignIn } from "@/components/provider-sign-in";
import { Flash } from "@/components/ui";
import { login } from "@/lib/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string; next?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next?.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "";
  return (
    <div className="grid-2">
      <div className="panel form-grid">
        <p className="kicker">Entrar</p>
        <h1 className="display" style={{ fontSize: 48, margin: 0 }}>Tu cuenta</h1>
        <ProviderSignIn next={next} />
        <form action={login} className="form-grid">
        <Flash error={sp.error} ok={sp.ok} />
        <label className="stack">Correo o usuario
          <input name="login" autoComplete="username" required />
        </label>
        <label className="stack">Contraseña
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <button className="btn" type="submit">Entrar</button>
        <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}>Crear cuenta</Link>
        </form>
      </div>
      <aside className="panel">
        <h2>Cuentas de demostración</h2>
        <p className="tiny muted">Contraseña para las tres: demo1234. El dinero es saldo de prueba.</p>
        <p><strong>sofia@tokkame.app</strong><br />Fan, con Circle y saldo.</p>
        <p><strong>luna@tokkame.app</strong><br />Creadora verificada. Panel de ingresos.</p>
        <p><strong>admin@tokkame.app</strong><br />Verificación y reportes.</p>
      </aside>
    </div>
  );
}
