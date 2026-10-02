import { signInProvider } from "@/lib/actions";

export function ProviderSignIn() {
  return (
    <div className="providers">
      <form action={signInProvider}>
        <input type="hidden" name="provider" value="google" />
        <button className="provider google" type="submit">Continue with Google</button>
      </form>
      <form action={signInProvider}>
        <input type="hidden" name="provider" value="apple" />
        <button className="provider apple" type="submit">Continue with Apple</button>
      </form>
      <p>18+ verified demo. One tap. Tokkame does not take your Google or Apple password.</p>
    </div>
  );
}
