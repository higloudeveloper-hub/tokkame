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
  lang = "en",
}: {
  children: ReactNode;
  startOpen: boolean;
  signedIn: boolean;
  following: boolean;
  profilePath: string;
  creator: { id: string; name: string; username: string; photo: string };
  lines: Line[];
  priceLabel: string;
  lang?: "en" | "es";
}) {
  const es = lang === "es";
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
            <div className="chat-layer" role="dialog" aria-modal="true" aria-label={es ? `Chat privado con ${creator.name}` : `Private chat with ${creator.name}`}>
              <button className="chat-scrim" type="button" aria-label={es ? "Cerrar chat" : "Close chat"} onClick={() => setOpen(false)} />
              <section className="chat-drawer">
                <header>
                  <img src={creator.photo} alt="" />
                  <div>
                    <strong>{creator.name}</strong>
                    <span><i />{es ? "Privado" : "Private"}</span>
                  </div>
                  <button type="button" aria-label={es ? "Cerrar" : "Close"} onClick={() => setOpen(false)}>×</button>
                </header>
                <div className="chat-thread">
                  {lines.length === 0 ? (
                    <p className="chat-empty">{es ? "Ella está aquí. Di lo que no has dicho. Nadie más puede leer esto." : "She is here. Say the part you have not said. Nobody else can read this."}</p>
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
                    <textarea name="body" placeholder={es ? "Escríbele" : "Message her"} maxLength={1000} rows={2} />
                    <button className="red-btn" type="submit">{es ? "Enviar" : "Send"}</button>
                  </form>
                ) : (
                  <form action={follow} className="chat-compose">
                    <input type="hidden" name="creatorId" value={creator.id} />
                    <p>{es ? "Síguela y se abre el chat privado." : "Follow her, then the private chat opens."}</p>
                    <button className="red-btn" type="submit">{es ? "Seguir" : "Follow"}</button>
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
