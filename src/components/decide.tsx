"use client";

import Link from "next/link";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useChat } from "@/components/chat-room";

export function Decide({
  name,
  photo,
  callPrice,
  unlockPrice,
  unlockHref,
  signedIn,
  profilePath,
}: {
  name: string;
  photo: string;
  callPrice: string;
  unlockPrice: string;
  unlockHref: string;
  signedIn: boolean;
  profilePath: string;
}) {
  const chat = useChat();
  const [choice, setChoice] = useState<"call" | "unlock" | null>(null);
  const next = choice === "call" ? `${profilePath}?chat=1` : unlockHref;
  const href = signedIn || !next ? next : `/signup?next=${encodeURIComponent(next)}`;

  return (
    <>
      <div className="decide-bar">
        <button type="button" onClick={() => setChoice("call")}>Call her</button>
        <button type="button" className="ghost" onClick={() => setChoice("unlock")}>Unlock</button>
      </div>
      {choice && typeof document !== "undefined"
        ? createPortal(
            <div className="pay-sheet decide-sheet" role="dialog" aria-modal="true" aria-label="Your choice">
              <button className="pay-scrim" type="button" aria-label="Close" onClick={() => setChoice(null)} />
              <div className="pay-panel decide-panel">
                <img src={photo} alt="" />
                <small>{choice === "call" ? "Private call" : "Her locked posts"}</small>
                <strong>{choice === "call" ? `${name} is listening.` : `Open ${name}'s posts.`}</strong>
                <p>{choice === "call" ? "One conversation. Nobody else in the room. Not sex." : "The photos she keeps locked. Still not sex."}</p>
                <b>{choice === "call" ? `${callPrice} a message` : `From ${unlockPrice}`}</b>
                {choice === "call" && signedIn ? (
                  <button className="red-btn" type="button" onClick={() => { setChoice(null); chat.open(); }}>Open the private chat</button>
                ) : (
                  <Link className="red-btn" href={href}>{signedIn ? "Continue" : "Continue with Google or Apple"}</Link>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
