import { TalkShow } from "@/components/talk-show";
import { creatorCards } from "@/lib/studio";
import { readDb } from "@/lib/store";

const topics = [
  { id: "infidelity", kicker: "01 · Infidelity", title: "The part you have not said.", text: "A ring. A message. One woman hears it.", image: "/talk/infidelity.jpg?v=3" },
  { id: "work", kicker: "02 · Work", title: "When the day will not end.", text: "The job, the boss, the money. Tell her.", image: "/talk/work.jpg?v=3" },
  { id: "secret", kicker: "03 · A secret", title: "One person. Nobody else.", text: "You choose who is in the room.", image: "/talk/secret.jpg?v=3" },
  { id: "listen", kicker: "04 · Just listen", title: "No advice. No judgment.", text: "You talk. She stays with it.", image: "/talk/listen.jpg?v=3" },
];

export default function TalkPage() {
  const people = creatorCards(readDb())
    .sort((a, b) => Number(b.online) - Number(a.online))
    .map((person) => ({
      id: person.id,
      name: person.name,
      username: person.username,
      photo: person.photo,
      online: person.online,
    }));
  return (
    <div className="talk-page">
      <TalkShow topics={topics} people={people} />
    </div>
  );
}
