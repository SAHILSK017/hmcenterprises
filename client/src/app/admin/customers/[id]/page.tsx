"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";

export default function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{
    customer: { name: string; email?: string; phone?: string; createdAt: string };
    orders: Array<{ orderId: string; total: number; status: string }>;
    repairs: Array<{ repairId: string; status: string; brand: string; model: string }>;
    sells: Array<{ sellId: string; status: string; brand: string; model: string }>;
    spent: number;
  } | null>(null);

  useEffect(() => {
    if (!id) return;
    api<typeof data>(`/api/admin/customers/${id}`).then(setData).catch(() => setData(null));
  }, [id]);

  if (!data) return <p className="text-sm text-slate-400">Loading…</p>;

  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/customers" className="text-xs text-[#0071e3]">
          ← Customers
        </Link>
        <h2 className="mt-1 text-xl font-bold">{data.customer.name}</h2>
        <p className="text-sm text-slate-500">
          {data.customer.phone} · {data.customer.email}
        </p>
        <p className="mt-1 text-sm font-semibold">Total spent: {formatCurrency(data.spent)}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Section title="Orders">
          {data.orders.map((o) => (
            <Link key={o.orderId} href={`/admin/orders/${o.orderId}`} className="block border-b py-2 text-sm hover:bg-slate-50">
              {o.orderId} · {formatCurrency(o.total)} <StatusBadge status={o.status} />
            </Link>
          ))}
          {!data.orders.length && <Empty />}
        </Section>
        <Section title="Repairs">
          {data.repairs.map((r) => (
            <Link key={r.repairId} href={`/admin/repairs/${r.repairId}`} className="block border-b py-2 text-sm hover:bg-slate-50">
              {r.repairId} · {r.brand} {r.model} <StatusBadge status={r.status} />
            </Link>
          ))}
          {!data.repairs.length && <Empty />}
        </Section>
        <Section title="Sell requests">
          {data.sells.map((s) => (
            <Link key={s.sellId} href={`/admin/sells/${s.sellId}`} className="block border-b py-2 text-sm hover:bg-slate-50">
              {s.sellId} · {s.brand} {s.model} <StatusBadge status={s.status} />
            </Link>
          ))}
          {!data.sells.length && <Empty />}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 text-sm font-bold">{title}</h3>
      {children}
    </div>
  );
}

function Empty() {
  return <p className="py-6 text-center text-xs text-slate-400">None yet</p>;
}
