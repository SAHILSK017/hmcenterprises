"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Order = {
  orderId: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  subtotal?: number;
  shippingFee?: number;
  discount?: number;
  createdAt: string;
  trackingNumber?: string;
  trackingCarrier?: string;
  shippingAddress?: Record<string, string>;
  user?: { name?: string; email?: string; phone?: string };
  items?: Array<{ name: string; quantity: number; price: number }>;
};

const STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
  "refunded",
];

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingCarrier, setTrackingCarrier] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    api<{ order?: Order } | Order>(`/api/orders/${id}`)
      .then((d) => {
        const o = ("order" in d && d.order ? d.order : d) as Order;
        setOrder(o);
        setStatus(o.status);
        setTrackingNumber(o.trackingNumber || "");
        setTrackingCarrier(o.trackingCarrier || "");
      })
      .catch((e) => toast.error(e.message));
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  const save = async () => {
    setBusy(true);
    try {
      await api(`/api/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, trackingNumber, trackingCarrier }),
      });
      toast.success("Order updated");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  if (!order) {
    return <div className="rounded-xl border bg-white p-8 text-sm text-slate-400">Loading order…</div>;
  }

  const addr = order.shippingAddress || {};

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button type="button" onClick={() => router.push("/admin/orders")} className="text-xs text-[#0071e3]">
            ← Orders
          </button>
          <h2 className="mt-1 text-xl font-bold">{order.orderId}</h2>
          <p className="text-sm text-slate-500">{formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold">Items</h3>
            <ul className="mt-3 divide-y">
              {(order.items || []).map((item, i) => (
                <li key={i} className="flex justify-between py-2 text-sm">
                  <span>
                    {item.name} ×{item.quantity}
                  </span>
                  <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-1 border-t pt-3 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal || order.total)}</span>
              </div>
              {!!order.discount && (
                <div className="flex justify-between text-slate-500">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span>{formatCurrency(order.shippingFee || 0)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Customer & shipping</h3>
              {(addr.whatsapp || addr.phone || order.user?.phone) && (
                <a
                  href={`https://wa.me/91${(addr.whatsapp || addr.phone || order.user?.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(
                    `Hello ${addr.fullName || order.user?.name || "Customer"}, regarding your HMC Mobile order ${order.orderId}:`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                >
                  Chat on WhatsApp ↗
                </a>
              )}
            </div>
            <p className="mt-2 text-sm font-medium">{order.user?.name || addr.fullName || "Guest Customer"}</p>
            <p className="text-xs text-slate-500">
              WhatsApp / Phone: {addr.whatsapp || addr.phone || order.user?.phone || "—"}
              {(addr.email || order.user?.email) && ` · ${addr.email || order.user?.email}`}
            </p>
            <p className="mt-3 text-sm text-slate-600">
              {[addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ") ||
                "No address on file"}
            </p>
            {addr.notes && (
              <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 border border-slate-100">
                <span className="font-semibold text-slate-700">Customer Note:</span> {addr.notes}
              </div>
            )}
          </section>
        </div>

        <section className="h-fit rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-bold">Fulfilment</h3>
          <label className="mt-3 block text-[11px] font-bold uppercase text-slate-400">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <label className="mt-3 block text-[11px] font-bold uppercase text-slate-400">Carrier</label>
          <input
            value={trackingCarrier}
            onChange={(e) => setTrackingCarrier(e.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
          />
          <label className="mt-3 block text-[11px] font-bold uppercase text-slate-400">Tracking #</label>
          <input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
          />
          <p className="mt-3 text-xs text-slate-500">
            Payment: {order.paymentMethod} · <StatusBadge status={order.paymentStatus} />
          </p>
          <Button className="mt-4 w-full" onClick={save} disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </Button>
          <Link href="/shop" className="mt-2 block text-center text-xs text-[#0071e3]">
            Open shop
          </Link>
        </section>
      </div>
    </div>
  );
}
