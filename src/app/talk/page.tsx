import { TalkShow } from "@/components/talk-show";
import { getLang } from "@/lib/lang";
import { creatorCards } from "@/lib/studio";
import { readDb } from "@/lib/store";

const topics = {
  en: [
    { id: "infidelity", kicker: "01 · Infidelity", title: "The part you have not said.", text: "A ring. A message. One woman hears it.", image: "/talk/infidelity.jpg?v=3" },
    { id: "work", kicker: "02 · Work", title: "When the day will not end.", text: "The job, the boss, the money. Tell her.", image: "/talk/work.jpg?v=3" },
    { id: "secret", kicker: "03 · A secret", title: "One person. Nobody else.", text: "You choose who is in the room.", image: "/talk/secret.jpg?v=3" },
    { id: "listen", kicker: "04 · Just listen", title: "No advice. No judgment.", text: "You talk. She stays with it.", image: "/talk/listen.jpg?v=3" },
  ],
  es: [
    { id: "infidelity", kicker: "01 · Infidelidad", title: "Lo que no has dicho.", text: "Un anillo. Un mensaje. Una mujer lo escucha.", image: "/talk/infidelity.jpg?v=3" },
    { id: "work", kicker: "02 · Trabajo", title: "Cuando el día no termina.", text: "El trabajo, el jefe, el dinero. Cuéntaselo.", image: "/talk/work.jpg?v=3" },
    { id: "secret", kicker: "03 · Un secreto", title: "Una persona. Nadie más.", text: "Tú eliges quién está en la sala.", image: "/talk/secret.jpg?v=3" },
    { id: "listen", kicker: "04 · Solo escuchar", title: "Sin consejos. Sin juicio.", text: "Tú hablas. Ella se queda con eso.", image: "/talk/listen.jpg?v=3" },
  ],
};

export default async function TalkPage() {
  const lang = await getLang();
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
      <TalkShow lang={lang} topics={topics[lang]} people={people} />
    </div>
  );
}
