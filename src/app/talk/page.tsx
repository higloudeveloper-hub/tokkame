import Link from "next/link";
import { creatorCards } from "@/lib/studio";
import { readDb } from "@/lib/store";

const topics = [
  { id: "infidelity", kicker: "Infidelity", title: ["The part you", "have not said."], text: "A ring. A message. Say it to one person.", image: "/talk/infidelity.jpg?v=3" },
  { id: "work", kicker: "Work", title: ["When the day", "will not end."], text: "The job, the boss, the money.", image: "/talk/work.jpg?v=3" },
  { id: "secret", kicker: "A secret", title: ["One person.", "Nobody else."], text: "You choose who is in the room.", image: "/talk/secret.jpg?v=3" },
  { id: "listen", kicker: "Just listen", title: ["No advice.", "No judgment."], text: "You want to be heard.", image: "/talk/listen.jpg?v=3" },
];

export default function TalkPage() {
  const people = creatorCards(readDb());
  return (
    <div className="talk-page">
      <section className="talk-hero">
        <img src="/talk/hero.jpg" alt="" />
        <div>
          <small>18+ · PRIVATE CONVERSATION</small>
          <h1>Talk about whatever it is. Connect with who you want.</h1>
          <p>Infidelity, work, stress, a secret. This is not a clinic and it is not a performance. You pick the person. They listen. You pay for the time.</p>
          <Link className="red-btn" href="#people">Choose someone</Link>
        </div>
      </section>

      <div className="talk-grid">
        {topics.map((topic) => (
          <article key={topic.id} id={topic.id} className="talk-card">
            <img src={topic.image} alt="" />
            <span>
              <small>{topic.kicker}</small>
              <strong>{topic.title.map((line) => <span key={line}>{line}</span>)}</strong>
              <em>{topic.text}</em>
            </span>
          </article>
        ))}
      </div>

      <div className="section-head" id="people">
        <h2>Who will hear it</h2>
        <Link href="/discover">See everyone</Link>
      </div>
      <div className="catalog">
        {people.slice(0, 4).map((person) => (
          <article key={person.id} className="tcard">
            <Link className="tcard-visual" href={`/creator/${person.username}`}>
              <img src={person.photo} alt="" />
            </Link>
            <div className="tcard-meta">
              <strong>{person.name}</strong>
              <span>Talk {person.talk} · Unlock {person.price}</span>
            </div>
            <Link className="red-btn block" href={`/messages?with=${person.id}`}>Talk</Link>
          </article>
        ))}
      </div>
    </div>
  );
}
