import { signInProvider } from "@/lib/actions";

export function ProviderSignIn({ next = "", lang = "en", bare = false }: { next?: string; lang?: "en" | "es"; bare?: boolean }) {
  const es = lang === "es";
  return (
    <div className="providers">
      <form action={signInProvider}>
        <input type="hidden" name="provider" value="google" />
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <button className="provider google" type="submit">
          <svg viewBox="0 0 18 18" aria-hidden="true"><path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.3-.2-1.9H9v3.6h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.6z"/><path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.6-1.9.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.9 10.7a5.4 5.4 0 0 1 0-3.4V5H.9a9 9 0 0 0 0 8l3-2.3z"/><path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6A9 9 0 0 0 .9 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6z"/></svg>
          {es ? "Continuar con Google" : "Continue with Google"}
        </button>
      </form>
      <form action={signInProvider}>
        <input type="hidden" name="provider" value="apple" />
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <button className="provider apple" type="submit">
          <svg viewBox="0 0 18 18" aria-hidden="true"><path fill="currentColor" d="M14.5 9.5c0-1.8 1.5-2.7 1.5-2.7s-1.2-1.7-3-1.8c-1.3-.1-2.5.7-3.1.7s-1.7-.7-2.8-.7c-1.4 0-2.8.8-3.5 2.1-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7s1.6.7 2.8.7 1.9-1 2.6-2c.8-1.2 1.2-2.3 1.2-2.4-.1 0-2.3-.9-2.3-3.9zM12.2 4.1c.6-.7 1-1.7.9-2.6-1 0-2.1.6-2.7 1.4-.6.7-1.1 1.7-.9 2.6 1 .1 2-.5 2.7-1.4z"/></svg>
          {es ? "Continuar con Apple" : "Continue with Apple"}
        </button>
      </form>
      {bare ? null : <p>{es ? "Demo 18+. Un toque. Tokkame no toma tu contraseña de Google ni de Apple." : "18+ demo. One tap. Tokkame does not take your Google or Apple password."}</p>}
    </div>
  );
}
