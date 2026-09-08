"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";

type OrderPay = {
  orderId: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
};

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState<OrderPay[]>([]);

  useEffect(() => {
    api<{ orders: OrderPay[] }>("/api/admin/payments")
      .then((d) => setOrders(d.orders || []))
      .catch(() => setOrders([]));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Payments</h2>
        <p className="text-sm text-slate-500">Payment status snapshots from orders.</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-[11px] uppercase text-slate-500">
            <tr>
              {["Order", "Amount", "Method", "Payment", "Order status", "Date"].map((h) => (
                <th key={h} className="px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.orderId} className="border-t">
                <td className="px-4 py-3 font-semibold">
                  <Link href={`/admin/orders/${o.orderId}`} className="text-[#0071e3]">
                    {o.orderId}
                  </Link>
                </td>
                <td className="px-4 py-3">{formatCurrency(o.total)}</td>
                <td className="px-4 py-3 capitalize">{o.paymentMethod}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.paymentStatus} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">{formatDate(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders.length && <p className="py-12 text-center text-sm text-slate-400">No payments yet.</p>}
      </div>
    </div>
  );
}
