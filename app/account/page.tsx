import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <main>
      <h1>My Account</h1>

      <p>Welcome, {session.user.name}</p>

      {session.user.image && (
        <img
          src={session.user.image}
          alt={session.user.name ?? "Profile"}
          width={80}
          height={80}
        />
      )}

      <p>Email: {session.user.email}</p>
      <p>Type: {session.user.customerType}</p>
      <p>Role: {session.user.role}</p>
    </main>
  );
}
