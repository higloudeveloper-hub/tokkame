"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { sendMessage, follow } from "@/lib/actions";

type Line = { id: string; mine: boolean; body: string; time: string };

type Chat = {
  open: () => void;
};

const ChatContext = createContext<Chat | null>(null);

export function useChat() {
  const chat = useContext(ChatContext);
  if (!chat) throw new Error("Chat is only available on a profile");
  return chat;
}

export function OpenChat({ className, children }: { className?: string; children: ReactNode }) {
  const chat = useChat();
  return (
    <button className={className} type="button" onClick={() => chat.open()}>
      {children}
    </button>
  );
}

export function ChatRoom({
  children,
  startOpen,
  signedIn,
  following,
  profilePath,
  creator,
  lines,
  priceLabel,
}: {
  children: ReactNode;
  startOpen: boolean;
  signedIn: boolean;
  following: boolean;
  profilePath: string;
  creator: { id: string; name: string; username: string; photo: string };
  lines: Line[];
  priceLabel: string;
}) {
  const [open, setOpen] = useState(startOpen && signedIn);

  function openChat() {
    if (!signedIn) {
      window.location.href = `/signup?next=${encodeURIComponent(`${profilePath}?chat=1`)}`;
      return;
    }
    setOpen(true);
  }

  return (
    <ChatContext.Provider value={{ open: openChat }}>
      {children}
      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="chat-layer" role="dialog" aria-modal="true" aria-label={`Private chat with ${creator.name}`}>
              <button className="chat-scrim" type="button" aria-label="Close chat" onClick={() => setOpen(false)} />
              <section className="chat-drawer">
                <header>
                  <img src={creator.photo} alt="" />
                  <div>
                    <strong>{creator.name}</strong>
                    <span><i />Private</span>
                  </div>
                  <button type="button" aria-label="Close" onClick={() => setOpen(false)}>×</button>
                </header>
                <div className="chat-thread">
                  {lines.length === 0 ? (
                    <p className="chat-empty">She is here. Say the part you have not said. Nobody else can read this.</p>
                  ) : null}
                  {lines.map((line) => (
                    <div key={line.id} className={`bubble${line.mine ? " mine" : ""}`}>
                      <div>{line.body}</div>
                      <div className="tiny muted" suppressHydrationWarning>{line.time}</div>
                    </div>
                  ))}
                </div>
                {priceLabel ? <p className="charge-line">{priceLabel}</p> : null}
                {following ? (
                  <form action={sendMessage} className="chat-compose">
                    <input type="hidden" name="toId" value={creator.id} />
                    <textarea name="body" placeholder="Message her" maxLength={1000} rows={2} />
                    <button className="red-btn" type="submit">Send</button>
                  </form>
                ) : (
                  <form action={follow} className="chat-compose">
                    <input type="hidden" name="creatorId" value={creator.id} />
                    <p>Follow her, then the private chat opens.</p>
                    <button className="red-btn" type="submit">Follow</button>
                  </form>
                )}
              </section>
            </div>,
            document.body,
          )
        : null}
    </ChatContext.Provider>
  );
}
