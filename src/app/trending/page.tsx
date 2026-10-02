import Link from "next/link";
import { compact, money } from "@/lib/format";
import { photoAt } from "@/lib/studio";
import { creators, followerCount, lowestPrice, publicPosts, readDb, subscriberCount } from "@/lib/store";

export default function TrendingPage() {
  const db = readDb();
  const likesOf = (id: string) =>
    publicPosts(db).filter((post) => post.creatorId === id).reduce((sum, post) => sum + post.likes.length, 0);
  const ranked = creators(db)
    .filter((user) => user.verified === "verified")
    .map((user, index) => ({
      user,
      photo: photoAt(index),
      likes: likesOf(user.id),
      followers: followerCount(db, user.id),
      subscribers: subscriberCount(db, user.id),
      price: lowestPrice(user),
    }))
    .sort((a, b) => b.likes - a.likes || b.subscribers - a.subscribers);
  const top = ranked[0];
  const peak = top?.likes || 1;

  return (
    <div className="chart-page">
      <div className="section-head" style={{ marginTop: 0 }}>
        <h2>Chart</h2>
        <Link href="/discover">Browse the catalog</Link>
      </div>

      {top ? (
        <section className="chart-board">
          <Link className="chart-photo" href={`/creator/${top.user.username}?tab=circle`}>
            <img src={top.photo} alt="" />
            <span className="rank">#1</span>
          </Link>
          <div className="chart-copy">
            <small>THIS WEEK</small>
            <h1>{top.user.username.replace(".", "_")}</h1>
            <p>Most watched content right now. The preview is free. The rest opens with a subscription.</p>
            <div className="heat"><span style={{ width: "100%" }} /></div>
            <div className="chart-stats">
              <div><b>{compact(top.likes)}</b><span>likes</span></div>
              <div><b>{compact(top.followers)}</b><span>followers</span></div>
              <div><b>{money(top.price)}</b><span>/month</span></div>
            </div>
            <Link className="red-btn" href={`/creator/${top.user.username}?tab=circle`}>Subscribe to #1</Link>
          </div>
        </section>
      ) : null}

      <ol className="board">
        {ranked.slice(1).map((row, index) => (
          <li key={row.user.id}>
            <span className="board-rank">{index + 2}</span>
            <Link className="board-main" href={`/creator/${row.user.username}`}>
              <img src={row.photo} alt="" />
              <span>
                <strong>{row.user.username.replace(".", "_")}</strong>
                <em>{compact(row.likes)} likes · {money(row.price)}/mo</em>
                <i className="heat"><b style={{ width: `${Math.max(18, Math.round((row.likes / peak) * 100))}%` }} /></i>
              </span>
            </Link>
            <Link className="red-btn" href={`/creator/${row.user.username}?tab=circle`}>Subscribe</Link>
          </li>
        ))}
      </ol>

    </div>
  );
}
