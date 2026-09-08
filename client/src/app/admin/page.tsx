"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import {
  ArrowRight,
  Boxes,
  ClipboardList,
  Package,
  ShoppingBag,
  Users,
  Wrench,
  AlertTriangle,
} from "lucide-react";

type Stats = {
  repairs: number;
  pendingRepairs: number;
  sells: number;
  pendingSells: number;
  products: number;
  lowStock: number;
  orders: number;
  customers: number;
  revenue: number;
  todaySales: number;
};

type Overview = {
  recentOrders: Array<{
    orderId: string;
    total: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
  }>;
  recentRepairs: Array<{
    repairId: string;
    name: string;
    brand: string;
    model: string;
    status: string;
    createdAt: string;
  }>;
  recentSells: Array<{
    sellId: string;
    name: string;
    brand: string;
    model: string;
    status: string;
    createdAt: string;
  }>;
  lowStockProducts: Array<{
    _id: string;
    name: string;
    sku?: string;
    stock: number;
    brand: string;
  }>;
  revenueSeries: Array<{ _id: string; revenue: number; orders: number }>;
};

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      api<Stats>("/api/admin/stats"),
      api<Overview>("/api/admin/overview"),
    ])
      .then(([s, o]) => {
        setStats(s);
        setOverview(o);
      })
      .catch(() => setError(true));
  }, []);

  const kpis = [
    { label: "Total sales", value: stats ? formatCurrency(stats.revenue) : "—", href: "/admin/orders", icon: ShoppingBag, color: "text-[#1473EA]", iconBg: "bg-[#EFF6FF]", borderAccent: "border-l-4 border-l-[#1473EA]" },
    { label: "Today's sales", value: stats ? formatCurrency(stats.todaySales) : "—", href: "/admin/orders", icon: Package, color: "text-[#1473EA]", iconBg: "bg-[#EFF6FF]", borderAccent: "border-l-4 border-l-[#1473EA]" },
    { label: "Orders", value: stats?.orders ?? "—", href: "/admin/orders", icon: ShoppingBag, color: "text-[#4F46E5]", iconBg: "bg-[#EEF2FF]", borderAccent: "border-l-4 border-l-[#4F46E5]" },
    { label: "Pending repairs", value: stats?.pendingRepairs ?? "—", href: "/admin/repairs", icon: Wrench, color: "text-[#00B8D9]", iconBg: "bg-[#ECFEFF]", borderAccent: "border-l-4 border-l-[#00B8D9]" },
    { label: "Sell requests", value: stats?.pendingSells ?? "—", href: "/admin/sells", icon: ClipboardList, color: "text-[#16A34A]", iconBg: "bg-[#F0FDF4]", borderAccent: "border-l-4 border-l-[#16A34A]" },
    { label: "Products", value: stats?.products ?? "—", href: "/admin/products", icon: Boxes, color: "text-[#7C3AED]", iconBg: "bg-[#F5F3FF]", borderAccent: "border-l-4 border-l-[#7C3AED]" },
    { label: "Low stock", value: stats?.lowStock ?? "—", href: "/admin/inventory", icon: AlertTriangle, color: "text-[#F59E0B]", iconBg: "bg-[#FEF3C7]", borderAccent: "border-l-4 border-l-[#F59E0B]" },
    { label: "Customers", value: stats?.customers ?? "—", href: "/admin/customers", icon: Users, color: "text-[#4F46E5]", iconBg: "bg-[#EEF2FF]", borderAccent: "border-l-4 border-l-[#4F46E5]" },
  ];

  const maxRevenue = Math.max(1, ...(overview?.revenueSeries.map((d) => d.revenue) || [1]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#111827]">Dashboard Overview</h2>
          <p className="mt-0.5 text-sm text-[#64748B]">
            Live snapshot of repairs, buybacks, inventory, and sales performance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/repairs" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1473EA] px-3.5 text-xs font-bold text-white shadow-xs hover:bg-[#0F5EC7]">
            Manage repairs <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link href="/admin/sells" className="inline-flex h-9 items-center rounded-lg border border-[#E2E8F0] bg-white px-3.5 text-xs font-bold text-[#111827] hover:bg-[#F8FAFC]">
            Sell requests
          </Link>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-2.5 text-sm font-semibold text-[#DC2626]">
          Could not load dashboard. Ensure the API is running and you are signed in as admin.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Link
            key={k.label}
            href={k.href}
            className={cn(
              "rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs transition-all hover:shadow-md hover:scale-[1.01]",
              k.borderAccent
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">{k.label}</p>
                <p className="mt-2 text-2xl font-extrabold tracking-tight text-[#111827]">
                  {stats || error ? k.value : "…"}
                </p>
              </div>
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", k.iconBg)}>
                <k.icon className={cn("h-4.5 w-4.5 h-[18px] w-[18px]", k.color)} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Revenue chart (real series) */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Revenue (30 days)</h3>
            <p className="text-xs text-slate-500">Paid / COD orders only</p>
          </div>
          <Link href="/admin/reports" className="text-xs font-semibold text-[#0071e3] hover:underline">
            Full reports
          </Link>
        </div>
        <div className="mt-4 flex h-36 items-end gap-1">
          {(overview?.revenueSeries || []).length ? (
            overview!.revenueSeries.map((d) => (
              <div key={d._id} className="group relative flex flex-1 flex-col items-center justify-end">
                <div
                  className="w-full max-w-[18px] rounded-t bg-[#0071e3]/80 transition group-hover:bg-[#0071e3]"
                  style={{ height: `${Math.max(4, (d.revenue / maxRevenue) * 100)}%` }}
                  title={`${d._id}: ${formatCurrency(d.revenue)} · ${d.orders} orders`}
                />
              </div>
            ))
          ) : (
            <p className="w-full self-center text-center text-sm text-slate-400">
              No paid orders in the last 30 days yet.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Pending repairs" href="/admin/repairs" empty="No open repairs.">
          {overview?.recentRepairs.map((r) => (
            <Row
              key={r.repairId}
              href={`/admin/repairs/${r.repairId}`}
              title={r.repairId}
              subtitle={`${r.name} · ${r.brand} ${r.model}`}
              meta={formatDate(r.createdAt)}
              badge={r.status}
            />
          ))}
        </Panel>

        <Panel title="Pending sell requests" href="/admin/sells" empty="No open sell requests.">
          {overview?.recentSells.map((s) => (
            <Row
              key={s.sellId}
              href={`/admin/sells/${s.sellId}`}
              title={s.sellId}
              subtitle={`${s.name} · ${s.brand} ${s.model}`}
              meta={formatDate(s.createdAt)}
              badge={s.status}
            />
          ))}
        </Panel>

        <Panel title="Recent orders" href="/admin/orders" empty="No orders yet.">
          {overview?.recentOrders.map((o) => (
            <Row
              key={o.orderId}
              href={`/admin/orders/${o.orderId}`}
              title={o.orderId}
              subtitle={`${formatCurrency(o.total)} · ${o.paymentStatus}`}
              meta={formatDate(o.createdAt)}
              badge={o.status}
            />
          ))}
        </Panel>

        <Panel title="Low stock" href="/admin/inventory" empty="Stock levels look healthy.">
          {overview?.lowStockProducts.map((p) => (
            <Row
              key={p._id}
              href="/admin/inventory"
              title={p.name}
              subtitle={`${p.brand}${p.sku ? ` · ${p.sku}` : ""}`}
              meta={`${p.stock} left`}
            />
          ))}
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  title,
  href,
  empty,
  children,
}: {
  title: string;
  href: string;
  empty: string;
  children: React.ReactNode;
}) {
  const list = Array.isArray(children) ? children.filter(Boolean) : [children];
  const has = list.some(Boolean);
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <Link href={href} className="text-xs font-semibold text-[#0071e3] hover:underline">
          View all
        </Link>
      </div>
      <div className="divide-y divide-slate-100">
        {has ? children : <p className="px-4 py-8 text-center text-sm text-slate-400">{empty}</p>}
      </div>
    </div>
  );
}

function Row({
  href,
  title,
  subtitle,
  meta,
  badge,
}: {
  href: string;
  title: string;
  subtitle: string;
  meta?: string;
  badge?: string;
}) {
  return (
    <Link href={href} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
        <p className="truncate text-xs text-slate-500">{subtitle}</p>
      </div>
      <div className="shrink-0 text-right">
        {badge && <StatusBadge status={badge} />}
        {meta && <p className="mt-1 text-[11px] text-slate-400">{meta}</p>}
      </div>
    </Link>
  );
}
