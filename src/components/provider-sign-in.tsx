import { signInProvider } from "@/lib/actions";

export function ProviderSignIn({ next = "" }: { next?: string }) {
  return (
    <div className="providers">
      <form action={signInProvider}>
        <input type="hidden" name="provider" value="google" />
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <button className="provider google" type="submit">Continue with Google</button>
      </form>
      <form action={signInProvider}>
        <input type="hidden" name="provider" value="apple" />
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <button className="provider apple" type="submit">Continue with Apple</button>
      </form>
      <p>18+ demo. One tap. Tokkame does not take your Google or Apple password.</p>
    </div>
  );
}
