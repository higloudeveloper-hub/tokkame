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
  const openHref = signedIn ? unlockHref : `/signup?next=${encodeURIComponent(unlockHref)}`;

  return (
    <div className="profile-cta">
      <Link className="red-btn" href={openHref}>{lang === "es" ? "Suscribirme" : "Subscribe"}</Link>
      <Link className="quiet" href={openHref}>{lang === "es" ? "Desbloquear" : "Unlock"}</Link>
    </div>
  );
}
