import { auth, signOut } from "@/auth";
import Link from "next/link";

export default async function AuthButton() {
  const session = await auth();

  if (!session?.user) {
    return <Link href="/login">Sign In</Link>;
  }

  return (
    <div>
      <Link href="/account">
        {session.user.image && (
          <img
            src={session.user.image}
            alt={session.user.name ?? "Profile"}
            width={40}
            height={40}
          />
        )}

        <span>{session.user.name}</span>
      </Link>

      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button type="submit">Sign Out</button>
      </form>
    </div>
  );
}
