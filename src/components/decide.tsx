import Link from "next/link";

export function Decide({
  unlockHref,
  signedIn,
  profilePath,
}: {
  name: string;
  photo: string;
  unlockPrice: string;
  unlockHref: string;
  signedIn: boolean;
  profilePath: string;
}) {
  const callPath = profilePath.startsWith("/creator/") ? `/call/${profilePath.slice("/creator/".length)}` : profilePath;
  const callHref = signedIn ? callPath : `/signup?next=${encodeURIComponent(callPath)}`;
  const openHref = signedIn ? unlockHref : `/signup?next=${encodeURIComponent(unlockHref)}`;

  return (
    <div className="profile-cta">
      <Link className="red-btn" href={callHref}>Call</Link>
      <Link className="quiet" href={openHref}>Unlock</Link>
    </div>
  );
}
