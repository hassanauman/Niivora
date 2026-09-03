"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type OrderStatusFormProps = {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
};

export default function OrderStatusForm({
  orderId,
  currentStatus,
  currentPaymentStatus,
}: OrderStatusFormProps) {
  const router = useRouter();

  const [status, setStatus] = useState(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          paymentStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to update order.");
        return;
      }

      setMessage("Order updated successfully.");

      router.refresh();
    } catch (error) {
      console.error(error);

      setMessage("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-xl border bg-white p-6">
      <h2 className="mb-5 text-lg font-semibold">Update Order</h2>

      <div className="space-y-5">
        {/* Order Status */}
        <div>
          <label
            htmlFor="order-status"
            className="mb-2 block text-sm font-medium"
          >
            Order Status
          </label>

          <select
            id="order-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
          >
            <option value="PENDING">Pending</option>

            <option value="PROCESSING">Processing</option>

            <option value="SHIPPED">Shipped</option>

            <option value="DELIVERED">Delivered</option>

            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Payment Status */}
        <div>
          <label
            htmlFor="payment-status"
            className="mb-2 block text-sm font-medium"
          >
            Payment Status
          </label>

          <select
            id="payment-status"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
          >
            <option value="PENDING">Pending</option>

            <option value="PAID">Paid</option>

            <option value="FAILED">Failed</option>
          </select>
        </div>

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        {message && (
          <p
            className={`text-sm ${
              message === "Order updated successfully."
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
