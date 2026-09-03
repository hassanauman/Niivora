import { auth } from "@/auth";
import Navbar from "./Navbar";

export default async function SiteHeader() {
  const session = await auth();

  const isAuthenticated = Boolean(session?.user);

  const isAdmin = session?.user?.role === "ADMIN";

  const isFounder = session?.user?.customerType === "FOUNDER";

  return (
    <Navbar
      isAuthenticated={isAuthenticated}
      isAdmin={isAdmin}
      isFounder={isFounder}
    />
  );
}
