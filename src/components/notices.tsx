import Link from "next/link";
import { getLang } from "@/lib/lang";

const OK: Record<"en" | "es", Record<string, string>> = {
  en: {
    cuenta: "Account ready. You have $100 of sandbox balance.",
    sigues: "You are now following this creator.",
    dejas: "You unfollowed.",
    suscripcion: "You are inside the Circle.",
    cancelada: "Subscription canceled. This demo does not refund the current period.",
    propina: "Tip sent.",
    unlock: "Content unlocked.",
    comentario: "Comment posted.",
    publicado: "Post is live.",
    remix: "Remix posted on your profile.",
    eliminado: "Post deleted.",
    perfil: "Profile updated.",
    niveles: "Circle levels updated.",
    creador: "Creator profile created. Verification is pending.",
    verificacion: "Request sent. Admin reviews it before payouts turn on.",
    region: "Region saved. It is used only if you chose to share it.",
    mensaje: "Message sent.",
    reporte: "Report received. It is in the moderation queue.",
    fondos: "$50 of sandbox funds were added to your wallet.",
    retiro: "Payout recorded. In production the processor settles it.",
    moderacion: "Moderation updated.",
    listo: "Done.",
    llamada: "Answer saved. If you said no, that call is not charged.",
  },
  es: {
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
  },
};

export async function Flash({ error, ok }: { error?: string; ok?: string }) {
  const lang = await getLang();
  if (error) return <p className="flash bad">{error}</p>;
  if (ok) return <p className="flash">{OK[lang][ok] ?? (lang === "es" ? "Listo." : "Done.")}</p>;
  return null;
}

export async function Footer() {
  const lang = await getLang();
  return (
    <footer className="site-footer">
      <p>{lang === "es" ? "Solo adultos 18+. Tokkame no permite cuentas ni contenido que involucren a menores." : "Adults 18+ only. Tokkame does not allow accounts or content that involve minors."}</p>
      <Link href="/rules">{lang === "es" ? "Reglas" : "Rules"}</Link>
    </footer>
  );
}
