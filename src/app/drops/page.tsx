import Link from "next/link";
import { Footer } from "@/components/notices";
import { money } from "@/lib/format";
import { getLang } from "@/lib/lang";
import { photoAt } from "@/lib/studio";
import { findUserById, readDb } from "@/lib/store";

export default async function DropsPage() {
  const lang = await getLang();
  const es = lang === "es";
  const db = readDb();
  const drops = db.posts.filter((post) => post.visibility !== "public").slice(0, 12);

  return (
    <>
      <p className="kicker">Drops</p>
      <h1 className="display" style={{ fontSize: 48, marginTop: 8 }}>{es ? "Compra el archivo. No hay sala." : "Buy the archive. No live room."}</h1>
      <p className="lead">{es ? "Cada drop tiene precio. Lo abres cuando quieres. Ella se queda con el 80%. Tokkame con el 20%. El recibo queda en tu billetera." : "Every drop has a price. You open it when you want. She keeps 80%. Tokkame keeps 20%. The receipt stays in your wallet."}</p>
      <div className="catalog" style={{ marginTop: 18 }}>
        {drops.map((drop, index) => {
          const creator = findUserById(db, drop.creatorId);
          if (!creator || creator.role !== "creator") return null;
          const price = drop.visibility === "ppv" ? money(drop.price) : es ? "Premium" : "Premium";
          return (
            <Link key={drop.id} href={`/creator/${creator.username}?tab=premium`} className="panel" style={{ display: "grid", gap: 8 }}>
              <img src={drop.image || photoAt(index)} alt="" style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 14, filter: "blur(10px)", transform: "scale(1.06)" }} />
              <strong>{creator.displayName}</strong>
              <span className="muted">{drop.caption.split(".")[0]?.slice(0, 72)}</span>
              <b>{price}</b>
            </Link>
          );
        })}
      </div>
      <Footer />
    </>
  );
}
