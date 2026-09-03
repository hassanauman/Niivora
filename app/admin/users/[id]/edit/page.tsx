import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import UserForm from "@/components/admin/UserForm";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Edit Customer</h1>

        <p className="mt-2 text-gray-500">
          Manage this customer's account settings.
        </p>

        <div className="mt-8 rounded-xl border bg-white p-6">
          {/* User Information */}
          <div className="mb-8 flex items-center gap-4">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name ?? "User"}
                className="h-16 w-16 rounded-full"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-xl font-medium">
                {user.name?.charAt(0).toUpperCase() ?? "?"}
              </div>
            )}

            <div>
              <h2 className="font-semibold">{user.name ?? "Unnamed User"}</h2>

              <p className="text-sm text-gray-500">
                {user.email ?? "No email"}
              </p>
            </div>
          </div>

          <UserForm
            user={{
              ...user,
              founderDiscount: user.founderDiscount?.toString() ?? null,
            }}
          />
        </div>
      </div>
    </main>
  );
}
