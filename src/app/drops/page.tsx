import Link from "next/link";
import { Footer } from "@/components/notices";
import { until, when } from "@/lib/format";
import { findUserById, readDb, upcomingDrops } from "@/lib/store";

export default function DropsPage() {
  const db = readDb();
  const drops = upcomingDrops(db);
  return (
    <>
      <p className="kicker">Drops</p>
      <h1 className="display" style={{ fontSize: 56, marginTop: 8 }}>Momentos, no un archivo más</h1>
      <p className="lead">El creador anuncia la hora. El contenido abre entonces. El livestream queda para después.</p>
      <div className="list" style={{ marginTop: 18 }}>
        {drops.map((drop) => {
          const creator = findUserById(db, drop.creatorId);
          if (!creator) return null;
          return (
            <Link key={drop.id} href={`/creator/${creator.username}?tab=drops`} className="panel">
              <p className="kicker" style={{ margin: 0 }} suppressHydrationWarning>{drop.dropKind} · {until(drop.dropAt!)}</p>
              <h2 className="display" style={{ margin: "6px 0" }}>{creator.displayName}</h2>
              <p className="muted" suppressHydrationWarning>{when(drop.dropAt!)} · {drop.visibility === "public" ? "Feed público" : "Circle"}</p>
            </Link>
          );
        })}
      </div>
      <Footer />
    </>
  );
}
