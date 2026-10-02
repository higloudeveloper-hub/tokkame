import Link from "next/link";
import { Flash } from "@/components/ui";
import { login } from "@/lib/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="grid-2">
      <form action={login} className="panel form-grid">
        <p className="kicker">Entrar</p>
        <h1 className="display" style={{ fontSize: 48, margin: 0 }}>Tu cuenta</h1>
        <Flash error={sp.error} ok={sp.ok} />
        <label className="stack">Correo o usuario
          <input name="login" autoComplete="username" required />
        </label>
        <label className="stack">Contraseña
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <button className="btn" type="submit">Entrar</button>
        <Link href="/signup">Crear cuenta</Link>
      </form>
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
