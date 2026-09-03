import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <main>
      <h1>Sign In</h1>

      <form
        action={async () => {
          "use server";
          await signIn("google", {
            redirectTo: "/account",
          });
        }}
      >
        <button type="submit">Continue with Google</button>
      </form>
    </main>
  );
}
