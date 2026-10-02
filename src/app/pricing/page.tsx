import Link from "next/link";
import { getLang } from "@/lib/lang";

const copy = {
  en: {
    kicker: "How she gets paid",
    title: "Talk. Tip. Unlock.",
    lead: "Three charges. She keeps 80% in this demo. Tokkame keeps 20%.",
    plain: "Not sex. You pay for a call, a tip, or to unlock her posts.",
    plans: "Unlock plans",
    inner: "Locked posts and closer photos.",
    vip: "New sets first, and a longer conversation.",
    vipLabel: "VIP · most chosen",
    elite: "The full archive and the closest access.",
    split: "She keeps 80%. Tokkame keeps 20%.",
    choose: "Choose who to unlock",
    most: "MOST CHOSEN",
    premium: "PREMIUM",
    innerEm: "The locked posts and the closer photos.",
    vipEm: "New sets first, and a longer conversation.",
    eliteEm: "The full archive and the closest access.",
    lanes: [
      { kicker: "Talk", price: "From $5", unit: "per message", text: "She sets what a conversation costs. You pay for her time and attention.", image: "/talk/listen.jpg", href: "/talk", cta: "Start talking" },
      { kicker: "Tips", price: "$5–$50", unit: "whenever you want", text: "A tip is extra. It does not unlock the set. It goes to her.", image: "/talk/secret.jpg", href: "/discover", cta: "Find someone" },
      { kicker: "Premium", price: "$5.99", unit: "to unlock, then up", text: "Inner, VIP, or Elite. Whoever subscribes opens what she keeps locked.", image: "/talk/work.jpg", href: "/discover", cta: "Unlock someone" },
    ],
  },
  es: {
    kicker: "Cómo cobra ella",
    title: "Hablar. Propina. Desbloquear.",
    lead: "Tres cobros. Ella se queda con el 80% en esta demo. Tokkame se queda con el 20%.",
    plain: "No es sexo. Pagas por una llamada, una propina o para desbloquear sus posts.",
    plans: "Planes para desbloquear",
    inner: "Posts bloqueados y fotos más cercanas.",
    vip: "Los sets nuevos primero, y una conversación más larga.",
    vipLabel: "VIP · el más elegido",
    elite: "El archivo completo y el acceso más cercano.",
    split: "Ella se queda con el 80%. Tokkame con el 20%.",
    choose: "Elegir a quién desbloquear",
    most: "EL MÁS ELEGIDO",
    premium: "PREMIUM",
    innerEm: "Los posts bloqueados y las fotos más cercanas.",
    vipEm: "Los sets nuevos primero, y una conversación más larga.",
    eliteEm: "El archivo completo y el acceso más cercano.",
    lanes: [
      { kicker: "Hablar", price: "Desde $5", unit: "por mensaje", text: "Ella pone el precio de la conversación. Pagas por su tiempo y su atención.", image: "/talk/listen.jpg", href: "/talk", cta: "Empezar a hablar" },
      { kicker: "Propinas", price: "$5–$50", unit: "cuando quieras", text: "La propina es extra. No desbloquea el set. Va para ella.", image: "/talk/secret.jpg", href: "/discover", cta: "Encontrar a alguien" },
      { kicker: "Premium", price: "$5.99", unit: "para desbloquear, y sube", text: "Inner, VIP o Elite. Quien se suscribe abre lo que ella tiene bloqueado.", image: "/talk/work.jpg", href: "/discover", cta: "Desbloquear a alguien" },
    ],
  },
} as const;

export default async function PricingPage() {
  const t = copy[await getLang()];
  const lanes = t.lanes;
  return (
    <div className="price-page">
      <p className="kicker">{t.kicker}</p>
      <h1>{t.title}</h1>
      <p className="lead">{t.lead}</p>
      <section className="price-simple">
        <p className="price-plain">{t.plain}</p>
        {lanes.map((lane) => (
          <article key={lane.kicker} className="price-row">
            <img src={lane.image} alt="" />
            <div>
              <small>{lane.kicker}</small>
              <strong>{lane.price}</strong>
              <p>{lane.unit}. {lane.text}</p>
            </div>
            <Link className="red-btn" href={lane.href}>{lane.cta}</Link>
          </article>
        ))}
        <h2>{t.plans}</h2>
        <article className="plan-row">
          <div><small>Inner</small><p>{t.inner}</p></div>
          <b>$5.99<span>/mo</span></b>
        </article>
        <article className="plan-row lead">
          <div><small>{t.vipLabel}</small><p>{t.vip}</p></div>
          <b>$19.99<span>/mo</span></b>
        </article>
        <article className="plan-row">
          <div><small>Elite</small><p>{t.elite}</p></div>
          <b>$49.99<span>/mo</span></b>
        </article>
        <p className="price-plain">{t.split}</p>
        <Link className="red-btn" href="/discover">{t.choose}</Link>
      </section>
      <div className="price-lanes">
        {lanes.map((lane) => (
          <article key={lane.kicker} className="price-lane">
            <img src={lane.image} alt="" />
            <div>
              <small>{lane.kicker}</small>
              <strong>{lane.price}</strong>
              <em>{lane.unit}</em>
              <p>{lane.text}</p>
              <Link className="red-btn" href={lane.href}>{lane.cta}</Link>
            </div>
          </article>
        ))}
      </div>
      <div className="tier-board static">
        <article className="tier-pick">
          <small>{t.premium}</small>
          <strong>Inner</strong>
          <b>$5.99<span>/mo</span></b>
          <em>{t.innerEm}</em>
        </article>
        <article className="tier-pick lead">
          <small>{t.most}</small>
          <strong>VIP</strong>
          <b>$19.99<span>/mo</span></b>
          <em>{t.vipEm}</em>
        </article>
        <article className="tier-pick">
          <small>{t.premium}</small>
          <strong>Elite</strong>
          <b>$49.99<span>/mo</span></b>
          <em>{t.eliteEm}</em>
        </article>
      </div>
    </div>
  );
}
