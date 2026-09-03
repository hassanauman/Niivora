import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Add Product</h1>

        <p className="mt-2 text-gray-500">Add a new product to your store.</p>

        <div className="mt-8">
          <ProductForm />
        </div>
      </div>
    </main>
  );
}
