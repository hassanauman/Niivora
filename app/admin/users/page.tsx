import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customers</h1>

            <p className="mt-2 text-gray-500">
              Manage your store customers and accounts.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-lg border bg-white px-5 py-3 text-sm font-medium"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Users Table */}
        <div className="mt-8 overflow-hidden rounded-xl border bg-white">
          {users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left">Customer</th>

                    <th className="px-6 py-4 text-left">Role</th>

                    <th className="px-6 py-4 text-left">Type</th>

                    <th className="px-6 py-4 text-left">Discount</th>

                    <th className="px-6 py-4 text-left">Joined</th>

                    <th className="px-6 py-4 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name ?? "User"}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium">
                              {user.name?.charAt(0).toUpperCase() ?? "?"}
                            </div>
                          )}

                          <div>
                            <p className="font-medium">
                              {user.name ?? "Unnamed User"}
                            </p>

                            <p className="text-sm text-gray-500">
                              {user.email ?? "No email"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span
                          className={
                            user.role === "ADMIN"
                              ? "font-medium text-purple-600"
                              : "text-gray-600"
                          }
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* Customer Type */}
                      <td className="px-6 py-4">
                        <span
                          className={
                            user.customerType === "FOUNDER"
                              ? "font-medium text-blue-600"
                              : "text-gray-600"
                          }
                        >
                          {user.customerType}
                        </span>
                      </td>

                      {/* Discount */}
                      <td className="px-6 py-4">
                        {user.founderDiscount
                          ? `${user.founderDiscount.toString()}%`
                          : "—"}
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.createdAt.toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/users/${user.id}/edit`}
                          className="font-medium underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
