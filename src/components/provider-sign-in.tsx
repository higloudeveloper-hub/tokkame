import { signInProvider } from "@/lib/actions";

export function ProviderSignIn({ next = "", lang = "en" }: { next?: string; lang?: "en" | "es" }) {
  const es = lang === "es";
  return (
    <div className="providers">
      <form action={signInProvider}>
        <input type="hidden" name="provider" value="google" />
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <button className="provider google" type="submit">{es ? "Continuar con Google" : "Continue with Google"}</button>
      </form>
      <form action={signInProvider}>
        <input type="hidden" name="provider" value="apple" />
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <button className="provider apple" type="submit">{es ? "Continuar con Apple" : "Continue with Apple"}</button>
      </form>
      <p>{es ? "Demo 18+. Un toque. Tokkame no toma tu contraseña de Google ni de Apple." : "18+ demo. One tap. Tokkame does not take your Google or Apple password."}</p>
    </div>
  );
}
