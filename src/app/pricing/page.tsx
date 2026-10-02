import Link from "next/link";

const lanes = [
  {
    kicker: "Talk",
    price: "From $5",
    unit: "per message",
    text: "She sets what a conversation costs. You pay for her time and attention.",
    image: "/talk/listen.jpg",
    href: "/talk",
    cta: "Start talking",
  },
  {
    kicker: "Tips",
    price: "$5–$50",
    unit: "whenever you want",
    text: "A tip is extra. It does not unlock the set. It goes to her.",
    image: "/talk/secret.jpg",
    href: "/discover",
    cta: "Find someone",
  },
  {
    kicker: "Premium",
    price: "$5.99",
    unit: "to unlock, then up",
    text: "Inner, VIP, or Elite. Whoever subscribes opens what she keeps locked.",
    image: "/talk/work.jpg",
    href: "/discover",
    cta: "Unlock someone",
  },
];

export default function PricingPage() {
  return (
    <div className="price-page">
      <p className="kicker">How she gets paid</p>
      <h1>Talk. Tip. Unlock.</h1>
      <p className="lead">Three charges. She keeps 80% in this demo. Tokkame keeps 20%.</p>
      <section className="price-simple">
        <p className="price-plain">Not sex. You pay for a call, a tip, or to unlock her posts.</p>
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
        <h2>Unlock plans</h2>
        <article className="plan-row">
          <div><small>Inner</small><p>Locked posts and closer photos.</p></div>
          <b>$5.99<span>/mo</span></b>
        </article>
        <article className="plan-row lead">
          <div><small>VIP · most chosen</small><p>New sets first, and a longer conversation.</p></div>
          <b>$19.99<span>/mo</span></b>
        </article>
        <article className="plan-row">
          <div><small>Elite</small><p>The full archive and the closest access.</p></div>
          <b>$49.99<span>/mo</span></b>
        </article>
        <p className="price-plain">She keeps 80%. Tokkame keeps 20%.</p>
        <Link className="red-btn" href="/discover">Choose who to unlock</Link>
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
          <small>PREMIUM</small>
          <strong>Inner</strong>
          <b>$5.99<span>/mo</span></b>
          <em>The locked posts and the closer photos.</em>
        </article>
        <article className="tier-pick lead">
          <small>MOST CHOSEN</small>
          <strong>VIP</strong>
          <b>$19.99<span>/mo</span></b>
          <em>New sets first, and a longer conversation.</em>
        </article>
        <article className="tier-pick">
          <small>PREMIUM</small>
          <strong>Elite</strong>
          <b>$49.99<span>/mo</span></b>
          <em>The full archive and the closest access.</em>
        </article>
      </div>
    </div>
  );
}
