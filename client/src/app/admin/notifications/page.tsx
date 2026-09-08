"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Bell, ClipboardList, Package, ShoppingBag, Wrench } from "lucide-react";

type Breakdown = {
  pendingRepairs?: number;
  pendingSells?: number;
  pendingOrders?: number;
  lowStock?: number;
};

export default function AdminNotificationsPage() {
  const [breakdown, setBreakdown] = useState<Breakdown>({});

  useEffect(() => {
    api<{ breakdown: Breakdown }>("/api/admin/notifications/unread-count")
      .then((d) => setBreakdown(d.breakdown || {}))
      .catch(() => setBreakdown({}));
  }, []);

  const items = [
    {
      label: "New / pending repairs",
      count: breakdown.pendingRepairs || 0,
      href: "/admin/repairs",
      icon: Wrench,
    },
    {
      label: "Pending sell requests",
      count: breakdown.pendingSells || 0,
      href: "/admin/sells",
      icon: ClipboardList,
    },
    {
      label: "Pending orders",
      count: breakdown.pendingOrders || 0,
      href: "/admin/orders",
      icon: ShoppingBag,
    },
    {
      label: "Low stock products",
      count: breakdown.lowStock || 0,
      href: "/admin/inventory",
      icon: Package,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Notifications</h2>
        <p className="text-sm text-slate-500">Operational alerts from live database activity.</p>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.href + item.label}
            href={item.href}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:border-[#0071e3]/30"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0071e3]/10 text-[#0071e3]">
                <item.icon className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold">{item.label}</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
              {item.count}
            </span>
          </Link>
        ))}
      </div>
      {!items.some((i) => i.count > 0) && (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-white py-12 text-slate-400">
          <Bell className="mb-2 h-6 w-6" />
          <p className="text-sm">All clear — no pending alerts.</p>
        </div>
      )}
    </div>
  );
}
