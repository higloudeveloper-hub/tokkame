import { Flash } from "@/components/ui";
import { signup } from "@/lib/actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string; ref?: string; as?: string }>;
}) {
  const sp = await searchParams;
  const asCreator = sp.as === "creator";
  return (
    <form action={signup} className="panel form-grid" style={{ maxWidth: 640 }}>
      <p className="kicker">Registro</p>
      <h1 className="display" style={{ fontSize: 48, margin: 0 }}>Entra a Tokkame</h1>
      <Flash error={sp.error} ok={sp.ok} />
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
    </form>
  );
}
