import Link from "next/link";

export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="12.5" fill="none" stroke="#ff4d1c" strokeWidth="2.4" />
      <circle cx="16" cy="16" r="4.5" fill="#e6b56a" />
    </svg>
  );
}

export function Avatar({
  hue,
  name,
  size = 40,
}: {
  hue: number;
  name: string;
  size?: number;
}) {
  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        background: `hsl(${hue} 52% 40%)`,
        fontSize: size < 36 ? 12 : 16,
      }}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

const OK: Record<string, string> = {
  cuenta: "Cuenta lista. Tienes $100 de saldo de prueba.",
  sigues: "Ahora sigues a este creador.",
  dejas: "Dejaste de seguir.",
  suscripcion: "Ya estás dentro del Circle.",
  cancelada: "Suscripción cancelada. Esta demo no reembolsa el período en curso.",
  propina: "Propina enviada.",
  unlock: "Contenido desbloqueado.",
  comentario: "Comentario publicado.",
  publicado: "Publicación lista.",
  remix: "Remix publicado en tu perfil.",
  eliminado: "Publicación eliminada.",
  perfil: "Perfil actualizado.",
  niveles: "Niveles del Circle actualizados.",
  creador: "Perfil de creador creado. La verificación quedó pendiente.",
  verificacion: "Solicitud enviada. Administración la revisa antes de activar cobros.",
  region: "Región guardada. Solo se usa si elegiste compartirla.",
  mensaje: "Mensaje enviado.",
  reporte: "Reporte recibido. Entra a la cola de moderación.",
  fondos: "Se agregaron $50 de prueba a tu wallet.",
  retiro: "Retiro registrado. En producción lo liquida el procesador.",
  moderacion: "Moderación actualizada.",
  listo: "Listo.",
  llamada: "Respuesta guardada. Si dijiste que no, esa llamada no se cobra.",
};

export function Flash({ error, ok }: { error?: string; ok?: string }) {
  if (error) return <p className="flash bad">{error}</p>;
  if (ok) return <p className="flash">{OK[ok] ?? "Listo."}</p>;
  return null;
}

export function Footer() {
  return (
    <footer className="site-footer">
      <p>Solo adultos 18+. Tokkame no permite cuentas ni contenido que involucren a menores.</p>
      <Link href="/rules">Reglas</Link>
    </footer>
  );
}
