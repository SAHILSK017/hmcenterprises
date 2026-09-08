"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Eye,
  CheckCircle2,
  Trash2,
  Check,
  Search,
  Smartphone,
  Clock,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

type Sell = {
  _id: string;
  sellId: string;
  name: string;
  phone: string;
  brand: string;
  model: string;
  storage?: string;
  overallCondition?: string;
  expectedPrice?: number;
  status: string;
  offers?: Array<{ amount: number; note?: string }>;
  createdAt: string;
};

type ApiResponse = {
  items: Sell[];
  total: number;
  activeCount?: number;
  completedCount?: number;
};

export default function AdminSells() {
  const [items, setItems] = useState<Sell[]>([]);
  const [tab, setTab] = useState<"all" | "active" | "completed">("all");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [counts, setCounts] = useState<{ total: number; active: number; completed: number }>({
    total: 0,
    active: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    const p = new URLSearchParams();

    // Tab filtering
    if (tab === "active") {
      p.set("status", "active");
    } else if (tab === "completed") {
      p.set("status", "completed");
    } else if (status) {
      p.set("status", status);
    }

    if (q) p.set("q", q);

    api<ApiResponse>(`/api/sells?${p}`)
      .then((d) => {
        setItems(d.items || []);
        if (d.total !== undefined) {
          setCounts({
            total: d.total,
            active: d.activeCount ?? 0,
            completed: d.completedCount ?? 0,
          });
        }
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [tab, status, q]);

  const handleMarkCompleted = async (sellId: string) => {
    setActionLoading(sellId);
    try {
      await api(`/api/sells/${sellId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "completed" }),
      });
      toast.success(`Sell request ${sellId} marked as completed!`);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update sell status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (sellId: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete sell request "${sellId}"? This action cannot be undone.`
      )
    ) {
      return;
    }
    setActionLoading(sellId);
    try {
      await api(`/api/sells/${sellId}`, {
        method: "DELETE",
      });
      toast.success(`Sell request ${sellId} deleted successfully.`);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete sell request");
    } finally {
      setActionLoading(null);
    }
  };

  const conditionColors: Record<string, string> = {
    excellent: "bg-emerald-50 text-emerald-700 border-emerald-200",
    good: "bg-teal-50 text-teal-700 border-teal-200",
    fair: "bg-amber-50 text-amber-700 border-amber-200",
    poor: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Sell Requests</h2>
          <p className="text-sm text-slate-500">
            Evaluate customer devices, send offers, and manage buyback requests.
          </p>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => {
            setTab("all");
            setStatus("");
          }}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            tab === "all" && !status
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Smartphone className="h-3.5 w-3.5" />
          All Requests
          {counts.total > 0 && (
            <span
              className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                tab === "all" ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-700"
              }`}
            >
              {counts.total}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setTab("active");
            setStatus("");
          }}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            tab === "active"
              ? "bg-[#0D9488] text-white"
              : "bg-teal-50 text-teal-700 hover:bg-teal-100"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          Active / Pending Requests
          {counts.active > 0 && (
            <span
              className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                tab === "active" ? "bg-teal-700 text-white" : "bg-teal-100 text-teal-800"
              }`}
            >
              {counts.active}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setTab("completed");
            setStatus("");
          }}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            tab === "completed"
              ? "bg-emerald-600 text-white"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          }`}
        >
          <CheckCircle className="h-3.5 w-3.5" />
          Completed Requests
          {counts.completed > 0 && (
            <span
              className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                tab === "completed" ? "bg-emerald-700 text-white" : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {counts.completed}
            </span>
          )}
        </button>
      </div>

      {/* SEARCH AND SPECIFIC STATUS DROPDOWN */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ID, customer name, phone, device model…"
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs"
          />
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            if (e.target.value) setTab("all");
          }}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700"
        >
          <option value="">Specific status (all)</option>
          {[
            "pending",
            "under_review",
            "contacted",
            "price_offered",
            "accepted",
            "rejected",
            "device_received",
            "quality_check",
            "payment_processing",
            "completed",
            "cancelled",
          ].map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                {[
                  "Sell ID",
                  "Customer",
                  "Device",
                  "Condition",
                  "Expected",
                  "Latest Offer",
                  "Status",
                  "Date",
                  "Actions",
                ].map((x) => (
                  <th key={x} className="px-4 py-3 font-semibold">
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((x) => {
                const latestOffer = x.offers?.[x.offers.length - 1]?.amount;
                return (
                  <tr
                    key={x._id}
                    className="border-t border-slate-100 hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold">
                      <Link
                        className="text-[#0D9488] hover:underline font-mono font-bold"
                        href={`/admin/sells/${x.sellId}`}
                      >
                        {x.sellId}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{x.name}</p>
                      <span className="text-xs text-slate-400">{x.phone}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-900">{x.brand}</span> {x.model}
                      {x.storage && (
                        <span className="text-xs text-slate-500 block font-normal">
                          {x.storage}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {x.overallCondition ? (
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${
                            conditionColors[x.overallCondition.toLowerCase()] ||
                            "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {x.overallCondition}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {x.expectedPrice != null ? formatCurrency(x.expectedPrice) : "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {latestOffer != null ? (
                        <span className="text-emerald-700 font-bold">
                          {formatCurrency(latestOffer)}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={x.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {formatDate(x.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {/* VIEW BUTTON */}
                        <Link
                          href={`/admin/sells/${x.sellId}`}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
                          title="View & manage sell details"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-500" />
                          View
                        </Link>

                        {/* MARK COMPLETED BUTTON */}
                        {x.status !== "completed" ? (
                          <button
                            type="button"
                            disabled={actionLoading === x.sellId}
                            onClick={() => handleMarkCompleted(x.sellId)}
                            className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400 transition-colors shadow-2xs disabled:opacity-50"
                            title="Mark sell request as completed"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            Complete
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            Completed
                          </span>
                        )}

                        {/* DELETE BUTTON */}
                        <button
                          type="button"
                          disabled={actionLoading === x.sellId}
                          onClick={() => handleDelete(x.sellId)}
                          className="inline-flex items-center justify-center rounded-md border border-red-200 bg-red-50 p-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 hover:border-red-300 transition-colors shadow-2xs disabled:opacity-50"
                          title="Delete sell request"
                          aria-label="Delete sell request"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && !items.length && (
          <div className="px-4 py-12 text-center text-sm text-slate-400">
            {tab === "completed" ? (
              <p>No completed sell requests found. When a sell request is completed, it will appear here.</p>
            ) : tab === "active" ? (
              <p>No active sell requests. All buyback requests have been processed or completed.</p>
            ) : (
              <p>No sell requests found matching your filter.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
