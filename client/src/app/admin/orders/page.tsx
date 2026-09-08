"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";

type Order = {
  _id: string;
  orderId: string;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  user?: { name?: string; email?: string; phone?: string };
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    whatsapp?: string;
    city?: string;
    line1?: string;
  };
  items?: Array<{ name: string; quantity: number }>;
};

export default function AdminOrdersPage() {
  const [items, setItems] = useState<Order[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const q = status ? `?status=${encodeURIComponent(status)}` : "";
    api<{ items: Order[] }>(`/api/orders${q}`)
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Orders</h2>
          <p className="text-sm text-slate-500">Shop orders, requests, and fulfilment.</p>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs"
        >
          <option value="">All statuses</option>
          {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                {["Order", "Customer", "Items", "Amount", "Payment", "Status", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <tr key={o._id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-semibold">
                    <Link href={`/admin/orders/${o.orderId}`} className="text-[#0071e3] hover:underline">
                      {o.orderId}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.user?.name || o.shippingAddress?.fullName || "Guest Customer"}</p>
                    <p className="text-xs text-slate-400">
                      {o.shippingAddress?.whatsapp || o.shippingAddress?.phone || o.user?.phone || o.user?.email || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {(o.items || []).slice(0, 2).map((i) => `${i.name} ×${i.quantity}`).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(o.total)}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs capitalize">{o.paymentMethod}</p>
                    <StatusBadge status={o.paymentStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && !items.length && (
          <p className="px-4 py-12 text-center text-sm text-slate-400">
            No orders yet. Orders appear here after checkout.
          </p>
        )}
        {loading && <p className="px-4 py-8 text-center text-sm text-slate-400">Loading…</p>}
      </div>
    </div>
  );
}
