import Link from "next/link";
import { getLang } from "@/lib/lang";

export default async function NotFound() {
  const es = (await getLang()) === "es";
  return (
    <div className="panel">
      <h1 className="display">{es ? "Ese perfil no está" : "That profile is not here"}</h1>
      <Link className="btn" href="/discover">{es ? "Volver a descubrir" : "Back to Discover"}</Link>
    </div>
  );
}
