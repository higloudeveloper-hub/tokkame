import Link from "next/link";

export function Decide({
  unlockHref,
  signedIn,
  profilePath,
  lang = "en",
}: {
  name: string;
  photo: string;
  unlockPrice: string;
  unlockHref: string;
  signedIn: boolean;
  profilePath: string;
  lang?: "en" | "es";
}) {
  const callPath = profilePath.startsWith("/creator/") ? `/call/${profilePath.slice("/creator/".length)}` : profilePath;
  const callHref = signedIn ? callPath : `/signup?next=${encodeURIComponent(callPath)}`;
  const openHref = signedIn ? unlockHref : `/signup?next=${encodeURIComponent(unlockHref)}`;

  return (
    <div className="profile-cta">
      <Link className="red-btn" href={callHref}>{lang === "es" ? "Llamar" : "Call"}</Link>
      <Link className="quiet" href={openHref}>{lang === "es" ? "Desbloquear" : "Unlock"}</Link>
    </div>
  );
}
