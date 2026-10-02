import Link from "next/link";
import { Flash, Footer } from "@/components/ui";
import { updateRegion } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { compact, money, REGIONS } from "@/lib/format";
import { getLang } from "@/lib/lang";
import { NAV_CATS, photoAt } from "@/lib/studio";
import { creators, followerCount, lowestPrice, publicPosts, readDb, subscriberCount } from "@/lib/store";
import type { DB, User } from "@/lib/types";

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; region?: string; q?: string; error?: string; ok?: string }>;
}) {
  const sp = await searchParams;
  const lang = await getLang();
  const es = lang === "es";
  const db = readDb();
  const viewer = await getSessionUser();
  const sort = sp.sort || "popular";
  let list = creators(db);
  if (sp.category) list = list.filter((user) => user.categories.includes(sp.category!));
  if (sp.region) list = list.filter((user) => user.shareRegion && user.region === sp.region);
  if (sp.q) {
    const q = sp.q.toLowerCase();
    list = list.filter((user) => user.username.includes(q) || user.displayName.toLowerCase().includes(q));
  }
  const likes = (id: string) =>
    publicPosts(db).filter((post) => post.creatorId === id).reduce((sum, post) => sum + post.likes.length, 0);
  if (sort === "new") list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  else if (sort === "trending") list.sort((a, b) => likes(b.id) - likes(a.id));
  else list.sort((a, b) => subscriberCount(db, b.id) - subscriberCount(db, a.id));

  function linkTo(next: { category?: string; sort?: string }) {
    const params = new URLSearchParams();
    const category = next.category === undefined ? sp.category || "" : next.category;
    const nextSort = next.sort || sort;
    if (sp.q) params.set("q", sp.q);
    if (category) params.set("category", category);
    if (nextSort && nextSort !== "popular") params.set("sort", nextSort);
    if (sp.region) params.set("region", sp.region);
    const query = params.toString();
    return query ? `/discover?${query}` : "/discover";
  }

  return (
    <div className="discover">
      <Flash error={sp.error} ok={sp.ok} />
      <div className="section-head" style={{ marginTop: 0 }}>
        <h2>{es ? "Descubrir" : "Discover"}</h2>
        <Link href="/trending">{es ? "Abrir el ranking" : "Open the chart"}</Link>
      </div>
      <form className="discover-bar" action="/discover">
        <input name="q" defaultValue={sp.q || ""} placeholder={es ? "Busca un nombre..." : "Search a name or a set..."} aria-label={es ? "Buscar creadoras" : "Search creators"} />
        {sp.category ? <input type="hidden" name="category" value={sp.category} /> : null}
        {sort !== "popular" ? <input type="hidden" name="sort" value={sort} /> : null}
        {sp.region ? <input type="hidden" name="region" value={sp.region} /> : null}
        <button className="red-btn" type="submit">{es ? "Buscar" : "Search"}</button>
      </form>

      <div className="cat-mosaic">
        {NAV_CATS.map((cat, index) => (
          <Link
            key={cat.label}
            className="cat-door"
            href={cat.category ? linkTo({ category: cat.category }) : "/discover"}
          >
            <img src={photoAt(index)} alt="" />
            <strong>{es ? ({ Lifestyle: "Estilo de vida", Adult: "Adultos", Gaming: "Juegos", Music: "Música", Travel: "Viajes" } as Record<string, string>)[cat.label] || cat.label : cat.label}</strong>
          </Link>
        ))}
      </div>

      <div className="section-head">
        <h2>{sp.category || (es ? "Catálogo" : "Catalog")}</h2>
        <div className="filters">
          <Link href={linkTo({ sort: "popular", category: "" })} className={!sp.category && sort === "popular" ? "on" : ""}>{es ? "Todas" : "All"}</Link>
          <Link href={linkTo({ sort: "popular" })} className={sort === "popular" && Boolean(sp.category) ? "on" : ""}>{es ? "Populares" : "Popular"}</Link>
          <Link href={linkTo({ sort: "new" })} className={sort === "new" ? "on" : ""}>{es ? "Nuevas" : "New"}</Link>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="panel">
          <h2>{es ? "Sin resultados" : "No matches"}</h2>
          <p className="muted">{es ? "Prueba otro nombre o categoría." : "Try another name or category."}</p>
        </div>
      ) : (
        <div className="catalog">
          {list.map((creator, index) => (
            <CreatorCard key={creator.id} creator={creator} photo={photoAt(index)} db={db} es={es} />
          ))}
        </div>
      )}

      {viewer ? (
        <form action={updateRegion} className="discover-region">
          <strong>{es ? "Tu región" : "Your region"}</strong>
          <p>{es ? "Sin GPS. Compártela solo si quieres creadoras de la misma ciudad." : "No GPS. Share it only if you want creators who shared the same city."}</p>
          <div className="discover-bar">
            <select name="region" defaultValue={viewer.region || ""} aria-label={es ? "Tu región" : "Your region"}>
              <option value="">{es ? "No compartir" : "Don’t share"}</option>
              {REGIONS.map((item) => <option key={item}>{item}</option>)}
            </select>
            <button className="ghost-btn" type="submit">{es ? "Guardar" : "Save"}</button>
          </div>
          <label className="check"><input type="checkbox" name="shareRegion" defaultChecked={viewer.shareRegion} /> {es ? "Compartir mi región dentro de Tokkame" : "Share my region inside Tokkame"}</label>
        </form>
      ) : null}
      <Footer />
    </div>
  );
}

function CreatorCard({
  creator,
  photo,
  db,
  es,
}: {
  creator: User;
  photo: string;
  db: DB;
  es: boolean;
}) {
  const ready = creator.verified === "verified";
  return (
    <article className="tcard">
      <Link className="tcard-visual" href={`/creator/${creator.username}`}>
        <img src={photo} alt="" />
        <span className="heart" aria-hidden>♡</span>
      </Link>
      <div className="tcard-meta">
        <strong>{creator.username.replace(".", "_")}</strong>
        <span>
          {compact(followerCount(db, creator.id))} {es ? "seguidores" : "followers"}
          {ready ? ` · ${money(lowestPrice(creator))}/${es ? "mes" : "mo"}` : ""}
        </span>
      </div>
      <Link className="red-btn block" href={ready ? `/creator/${creator.username}?tab=circle` : `/creator/${creator.username}`}>
        {ready ? (es ? "Suscribirme" : "Subscribe") : (es ? "Ver" : "View")}
      </Link>
    </article>
  );
}
