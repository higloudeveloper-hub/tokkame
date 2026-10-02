import type { ReactNode } from "react";
import type { Media } from "@/lib/types";

export function MediaArt({
  media,
  image,
  poster,
  locked,
  format,
  children,
}: {
  media: Media;
  image?: string | null;
  poster?: string;
  locked?: boolean;
  format?: string;
  children?: ReactNode;
}) {
  return (
    <figure
      className={`media${locked ? " is-locked" : ""}`}
      style={{ ["--h" as string]: media.hue, ["--a" as string]: media.accent }}
    >
      {image && !locked ? (
        // User uploads stay private to the access check on /media.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/media/${image}`} alt="" />
      ) : poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" />
      ) : (
        <div className="fill" />
      )}
      <span className="orb" />
      <span className="slash" />
      <span className="block" />
      <figcaption>{format === "clip" ? "Clip" : media.label}</figcaption>
      {children}
    </figure>
  );
}
