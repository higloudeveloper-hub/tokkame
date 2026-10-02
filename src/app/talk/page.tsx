import Link from "next/link";
import { creatorCards } from "@/lib/studio";
import { readDb } from "@/lib/store";

const topics = [
  { id: "infidelity", kicker: "01", title: "Infidelity", text: "The part you have not said.", image: "/talk/infidelity.jpg?v=3" },
  { id: "work", kicker: "02", title: "Work", text: "When the day will not end.", image: "/talk/work.jpg?v=3" },
  { id: "secret", kicker: "03", title: "A secret", text: "One woman. Nobody else.", image: "/talk/secret.jpg?v=3" },
  { id: "listen", kicker: "04", title: "Just listen", text: "You talk. She stays with it.", image: "/talk/listen.jpg?v=3" },
];

export default function TalkPage() {
  const people = creatorCards(readDb()).sort((a, b) => Number(b.online) - Number(a.online));
  const online = people.filter((person) => person.online);
  const rest = people.filter((person) => !person.online);
  return (
    <div className="talk-page">
      <section className="talk-hero">
        <div>
          <small>PRIVATE · 18+</small>
          <h1>Tell her the problem.</h1>
          <p>Pick what you need to say. Then call a verified woman. The hour is $13, and the call stays here.</p>
          <Link className="red-btn" href="#people">See who is online</Link>
        </div>
        <img src="/talk/hero.jpg" alt="" />
      </section>

      <div className="section-head">
        <h2>What you can tell her</h2>
      </div>
      <div className="talk-topics">
        {topics.map((topic) => (
          <a key={topic.id} id={topic.id} className="talk-topic" href="#people">
            <img src={topic.image} alt="" />
            <span>
              <small>{topic.kicker}</small>
              <strong>{topic.title}</strong>
              <em>{topic.text}</em>
            </span>
          </a>
        ))}
      </div>

      <div className="section-head" id="people">
        <h2>Online now</h2>
        <Link href="/discover">All</Link>
      </div>
      <People rows={online} />

      {rest.length ? (
        <>
          <div className="section-head">
            <h2>Also verified</h2>
          </div>
          <People rows={rest} />
        </>
      ) : null}
    </div>
  );
}

function People({ rows }: { rows: ReturnType<typeof creatorCards> }) {
  return (
    <div className="talk-list">
      {rows.map((person) => (
        <article key={person.id}>
          <img src={person.photo} alt="" />
          <div>
            <strong>{person.name}</strong>
            <span>{person.online ? "Online · Verified" : "Verified"}</span>
          </div>
          <Link className="red-btn" href={`/call/${person.username}`}>Call her</Link>
        </article>
      ))}
    </div>
  );
}
