"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";
import { PageSection } from "@/components/layout/page-section";

interface OrderRow {
  orderId: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  items: { name: string; quantity: number }[];
}

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ items: OrderRow[] }>("/api/orders/mine")
      .then((data) => setOrders(data.items))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageSection centered={false} innerClassName="py-0">
        <p className="text-foreground-muted">Loading orders…</p>
      </PageSection>
    );
  }

  if (!orders.length) {
    return (
      <PageSection centered={false} innerClassName="py-0">
        <h1 className="font-display text-2xl font-bold mb-6">My orders</h1>
        <EmptyState
          icon={<Package className="h-10 w-10" />}
          title="No orders yet"
          description="Browse certified phones and check out when you're ready."
          action={
            <Link href="/shop">
              <Button>Browse shop</Button>
            </Link>
          }
        />
      </PageSection>
    );
  }

  return (
    <PageSection centered={false} innerClassName="py-0">
      <h1 className="font-display text-2xl font-bold mb-6">My orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.orderId} className="glass-panel rounded-2xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-semibold text-emerald-400">{order.orderId}</p>
                <p className="mt-1 text-xs text-foreground-muted">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <Badge variant="outline">{STATUS_LABELS[order.status] ?? order.status}</Badge>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-foreground-muted">
              {order.items.map((item, i) => (
                <li key={i}>
                  {item.name} × {item.quantity}
                </li>
              ))}
            </ul>
            <p className="mt-3 font-semibold">{formatCurrency(order.total)}</p>
          </div>
        ))}
      </div>
    </PageSection>
  );
}
