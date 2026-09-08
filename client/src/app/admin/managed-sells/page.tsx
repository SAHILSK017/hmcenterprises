"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Smartphone,
  Search,
  Plus,
  ArrowDownToLine,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Trash2,
  Eye,
  Tag,
  IndianRupee,
  Cpu,
  Layers,
  Check,
  X,
  ExternalLink,
  Store,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

export type ManagedPhone = {
  _id: string;
  managedId: string;
  sourceSellRequest?: {
    _id: string;
    sellId: string;
    brand: string;
    model: string;
    finalPrice?: number;
    expectedPrice?: number;
  };
  intakeType: "imported_from_sell" | "direct_walkin";
  device: {
    brand: string;
    model: string;
    storage: string;
    ram?: string;
    color?: string;
    imei: string;
    imei2?: string;
    serialNumber?: string;
    batteryHealth?: number;
    condition: "excellent" | "good" | "fair" | "poor";
    images?: Array<{ url: string }>;
  };
  pricing: {
    purchasePrice: number;
    estimatedRepairCost: number;
    targetSellingPrice: number;
  };
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
    };
    aadhaar: {
      number?: string;
      verified: boolean;
      photoFrontUrl?: string;
      photoBackUrl?: string;
    };
    pan: {
      number?: string;
      verified: boolean;
      photoUrl?: string;
    };
    payout?: {
      method: "upi" | "bank_transfer" | "cash";
      status: "pending" | "processing" | "paid" | "failed";
      transactionRef?: string;
    };
    declarationAccepted?: boolean;
  };
  status: "procured" | "qc_inspection" | "refurbishing" | "ready_for_sale" | "listed" | "sold" | "returned";
  statusHistory?: Array<{
    status: string;
    note?: string;
    changedAt: string;
  }>;
  convertedProduct?: {
    _id: string;
    name: string;
    slug: string;
    price: number;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

type SellsSummary = {
  _id: string;
  sellId: string;
  name: string;
  phone: string;
  brand: string;
  model: string;
  storage?: string;
  status: string;
  expectedPrice?: number;
  finalPrice?: number;
  createdAt: string;
};

const STATUS_TABS: Array<{ id: string; label: string; icon: any }> = [
  { id: "all", label: "All Devices", icon: Smartphone },
  { id: "procured", label: "Procured", icon: Clock },
  { id: "qc_inspection", label: "QC Inspection", icon: Cpu },
  { id: "refurbishing", label: "Refurbishing", icon: Layers },
  { id: "ready_for_sale", label: "Ready for Sale", icon: CheckCircle2 },
  { id: "listed", label: "Listed in Catalog", icon: Store },
  { id: "sold", label: "Sold Out", icon: Tag },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  procured: { bg: "bg-blue-50 text-blue-700 border-blue-200", text: "text-blue-700", label: "Procured" },
  qc_inspection: { bg: "bg-purple-50 text-purple-700 border-purple-200", text: "text-purple-700", label: "QC Inspection" },
  refurbishing: { bg: "bg-amber-50 text-amber-700 border-amber-200", text: "text-amber-700", label: "Refurbishing" },
  ready_for_sale: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", text: "text-emerald-700", label: "Ready for Sale" },
  listed: { bg: "bg-teal-50 text-teal-700 border-teal-200", text: "text-teal-700", label: "Listed in Shop" },
  sold: { bg: "bg-slate-100 text-slate-700 border-slate-300", text: "text-slate-700", label: "Sold" },
  returned: { bg: "bg-rose-50 text-rose-700 border-rose-200", text: "text-rose-700", label: "Returned" },
};

export default function ManagedSellsPage() {
  const [items, setItems] = useState<ManagedPhone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [kycFilter, setKycFilter] = useState("all");
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modals state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [sellRequests, setSellRequests] = useState<SellsSummary[]>([]);
  const [loadingSellRequests, setLoadingSellRequests] = useState(false);
  const [manualSellId, setManualSellId] = useState("");

  // New Intake Form state
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    storage: "128GB",
    ram: "8GB",
    color: "",
    imei: "",
    imei2: "",
    serialNumber: "",
    batteryHealth: 90,
    condition: "good" as "excellent" | "good" | "fair" | "poor",
    purchasePrice: "",
    targetSellingPrice: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    aadhaarNumber: "",
    panNumber: "",
    payoutMethod: "upi" as "upi" | "bank_transfer" | "cash",
    payoutUpi: "",
    payoutRef: "",
  });

  const loadItems = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedTab !== "all") params.set("status", selectedTab);
    if (searchQuery) params.set("q", searchQuery);

    api<{ items: ManagedPhone[]; statusCounts: Record<string, number> }>(
      `/api/managed-sells?${params.toString()}`
    )
      .then((data) => {
        setItems(data.items || []);
        if (data.statusCounts) {
          setStatusCounts(data.statusCounts);
        }
      })
      .catch((err) => {
        toast.error("Failed to load managed selling phones");
        setItems([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(loadItems, 200);
    return () => clearTimeout(timer);
  }, [selectedTab, searchQuery]);

  // Load available Sell Requests for import
  const openImportModal = async () => {
    setIsImportModalOpen(true);
    setLoadingSellRequests(true);
    try {
      const data = await api<{ items: SellsSummary[] }>("/api/sells?limit=50");
      setSellRequests(data.items || []);
    } catch {
      toast.error("Failed to fetch sell requests");
    } finally {
      setLoadingSellRequests(false);
    }
  };

  const handleImport = async (sellIdToImport: string) => {
    if (!sellIdToImport) {
      toast.error("Please provide a valid Sell Request ID");
      return;
    }
    setActionLoading(sellIdToImport);
    try {
      const res = await api<{ success: boolean; item: ManagedPhone }>(
        `/api/managed-sells/import/${sellIdToImport.trim()}`,
        { method: "POST" }
      );
      toast.success(`Successfully imported ${res.item.device.brand} ${res.item.device.model} (${res.item.managedId})`);
      setIsImportModalOpen(false);
      setManualSellId("");
      loadItems();
    } catch (err: any) {
      toast.error(err.message || "Failed to import sell request");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brand || !formData.model || !formData.customerName || !formData.customerPhone) {
      toast.error("Brand, Model, Customer Name, and Phone are required");
      return;
    }

    if (!formData.imei || formData.imei.length < 14) {
      toast.error("Please enter a valid 15-digit primary IMEI number");
      return;
    }

    setActionLoading("creating_intake");
    try {
      const res = await api<{ success: boolean; item: ManagedPhone }>("/api/managed-sells", {
        method: "POST",
        body: JSON.stringify({
          intakeType: "direct_walkin",
          device: {
            brand: formData.brand,
            model: formData.model,
            storage: formData.storage,
            ram: formData.ram,
            color: formData.color,
            imei: formData.imei,
            imei2: formData.imei2,
            serialNumber: formData.serialNumber,
            batteryHealth: Number(formData.batteryHealth) || 90,
            condition: formData.condition,
          },
          pricing: {
            purchasePrice: Number(formData.purchasePrice) || 0,
            targetSellingPrice: Number(formData.targetSellingPrice) || 0,
          },
          customer: {
            name: formData.customerName,
            phone: formData.customerPhone,
            email: formData.customerEmail,
            address: {
              street: formData.street,
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode,
            },
            aadhaar: {
              number: formData.aadhaarNumber,
              verified: !!formData.aadhaarNumber && formData.aadhaarNumber.length === 12,
            },
            pan: {
              number: formData.panNumber.toUpperCase(),
              verified: !!formData.panNumber && formData.panNumber.length === 10,
            },
            payout: {
              method: formData.payoutMethod,
              upiId: formData.payoutUpi,
              transactionRef: formData.payoutRef,
              status: formData.payoutRef ? "paid" : "pending",
            },
            declarationAccepted: true,
          },
          status: "procured",
        }),
      });

      toast.success(`Intake created successfully with ID ${res.item.managedId}`);
      setIsIntakeModalOpen(false);
      // Reset form
      setFormData({
        brand: "",
        model: "",
        storage: "128GB",
        ram: "8GB",
        color: "",
        imei: "",
        imei2: "",
        serialNumber: "",
        batteryHealth: 90,
        condition: "good",
        purchasePrice: "",
        targetSellingPrice: "",
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        aadhaarNumber: "",
        panNumber: "",
        payoutMethod: "upi",
        payoutUpi: "",
        payoutRef: "",
      });
      loadItems();
    } catch (err: any) {
      toast.error(err.message || "Failed to create intake record");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, managedId: string) => {
    if (!confirm(`Are you sure you want to permanently delete managed phone record ${managedId}?`)) {
      return;
    }
    setActionLoading(id);
    try {
      await api(`/api/managed-sells/${id}`, { method: "DELETE" });
      toast.success(`Record ${managedId} removed`);
      loadItems();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete record");
    } finally {
      setActionLoading(null);
    }
  };

  const handleQuickPublish = async (id: string, managedId: string) => {
    setActionLoading(id);
    try {
      const res = await api<{ success: boolean; product: any }>(
        `/api/managed-sells/${id}/publish-product`,
        { method: "POST" }
      );
      toast.success(`Successfully published as product: ${res.product.name}`);
      loadItems();
    } catch (err: any) {
      toast.error(err.message || "Failed to publish device to catalog");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter items by KYC filter client-side for quick responsiveness
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (kycFilter === "verified") {
        return item.customer.aadhaar.verified && item.customer.pan.verified;
      }
      if (kycFilter === "pending") {
        return !item.customer.aadhaar.verified || !item.customer.pan.verified;
      }
      if (kycFilter === "aadhaar_missing") {
        return !item.customer.aadhaar.number;
      }
      if (kycFilter === "pan_missing") {
        return !item.customer.pan.number;
      }
      return true;
    });
  }, [items, kycFilter]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm shadow-teal-600/30">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Manage Selling Phone
              </h1>
              <p className="text-xs text-slate-500">
                Procure old phones, verify IMEI & customer KYC (Aadhaar / PAN), inspect condition, and list to shop.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={openImportModal}
            className="border-teal-200 bg-teal-50/60 text-teal-800 hover:bg-teal-100 hover:text-teal-900 text-xs font-semibold"
          >
            <ArrowDownToLine className="mr-1.5 h-4 w-4 text-teal-700" />
            Import from Sell Request
          </Button>

          <Button
            onClick={() => setIsIntakeModalOpen(true)}
            className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            + Direct Intake
          </Button>

          <button
            onClick={loadItems}
            title="Refresh list"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-teal-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* STATUS TABS */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3">
        {STATUS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedTab === tab.id;
          const count = statusCounts[tab.id] ?? 0;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedTab(tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {count > 0 && (
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    isActive ? "bg-teal-700/80 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[260px] flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by IMEI, Intake ID, Model, Customer Name, Phone, Aadhaar, PAN..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-400" />
          <select
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-xs focus:border-teal-500 focus:outline-none"
          >
            <option value="all">KYC Status (All)</option>
            <option value="verified">KYC Complete (Aadhaar + PAN)</option>
            <option value="pending">KYC Incomplete / Pending</option>
            <option value="aadhaar_missing">Aadhaar Missing</option>
            <option value="pan_missing">PAN Missing</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Intake ID</th>
                <th className="px-4 py-3">Device & Specs</th>
                <th className="px-4 py-3">IMEI / Hardware</th>
                <th className="px-4 py-3">Customer Identity</th>
                <th className="px-4 py-3">KYC (Aadhaar / PAN)</th>
                <th className="px-4 py-3">Pricing & Margin</th>
                <th className="px-4 py-3">Pipeline Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-teal-600" />
                      Loading managed phone records...
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Smartphone className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-sm font-medium text-slate-700">No managed selling phone records found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Import a customer sell request or click &quot;+ Direct Intake&quot; to register a procured old phone.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const style = STATUS_STYLES[item.status] || STATUS_STYLES.procured;
                  const aadhaarOk = item.customer.aadhaar?.verified;
                  const panOk = item.customer.pan?.verified;
                  const margin = item.pricing.targetSellingPrice - item.pricing.purchasePrice;

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* INTAKE ID */}
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/admin/managed-sells/${item.managedId}`}
                          className="font-mono text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline block"
                        >
                          {item.managedId}
                        </Link>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {formatDate(item.createdAt)}
                        </span>
                        {item.sourceSellRequest && (
                          <Link
                            href={`/admin/sells/${item.sourceSellRequest.sellId}`}
                            className="inline-flex items-center gap-1 text-[10px] text-teal-600 hover:underline font-mono mt-0.5"
                          >
                            <ArrowDownToLine className="h-2.5 w-2.5" />
                            {item.sourceSellRequest.sellId}
                          </Link>
                        )}
                      </td>

                      {/* DEVICE */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900 text-xs">
                          {item.device.brand} {item.device.model}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700">
                            {item.device.storage}
                          </span>
                          {item.device.color && <span>{item.device.color}</span>}
                          {item.device.batteryHealth && (
                            <span className="text-emerald-600 font-medium">
                              {item.device.batteryHealth}% Batt
                            </span>
                          )}
                        </div>
                      </td>

                      {/* IMEI */}
                      <td className="px-4 py-3.5">
                        <div className="font-mono text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                          <span>{item.device.imei || "Not assigned"}</span>
                        </div>
                        {item.device.imei2 && (
                          <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                            IMEI 2: {item.device.imei2}
                          </div>
                        )}
                        <span className="inline-block mt-1 text-[10px] font-medium text-slate-500 capitalize">
                          Grade: {item.device.condition}
                        </span>
                      </td>

                      {/* CUSTOMER */}
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-900 text-xs">
                          {item.customer.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {item.customer.phone}
                        </div>
                        {item.customer.address?.city && (
                          <div className="text-[10px] text-slate-400">
                            {item.customer.address.city}, {item.customer.address.state}
                          </div>
                        )}
                      </td>

                      {/* KYC BADGES */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold uppercase text-slate-500 w-12">
                              Aadhaar:
                            </span>
                            {item.customer.aadhaar?.number ? (
                              <span
                                className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                  aadhaarOk
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}
                              >
                                {aadhaarOk ? (
                                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <ShieldAlert className="h-3 w-3 text-amber-600" />
                                )}
                                {item.customer.aadhaar.number.slice(-4) ? `•••• ${item.customer.aadhaar.number.slice(-4)}` : "Added"}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Missing</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold uppercase text-slate-500 w-12">
                              PAN:
                            </span>
                            {item.customer.pan?.number ? (
                              <span
                                className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                  panOk
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}
                              >
                                {panOk ? (
                                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <ShieldAlert className="h-3 w-3 text-amber-600" />
                                )}
                                {item.customer.pan.number}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Missing</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* PRICING */}
                      <td className="px-4 py-3.5">
                        <div className="text-xs font-semibold text-slate-900">
                          {formatCurrency(item.pricing.purchasePrice)}
                          <span className="text-[10px] font-normal text-slate-400 ml-1">in</span>
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          {formatCurrency(item.pricing.targetSellingPrice)}
                          <span className="text-[10px] font-normal text-slate-400 ml-1">out</span>
                        </div>
                        {margin > 0 && (
                          <div className="text-[10px] font-semibold text-emerald-600">
                            +{formatCurrency(margin)} margin
                          </div>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${style.bg}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {style.label}
                        </span>
                        {item.convertedProduct && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-semibold text-teal-700">
                              <Store className="h-2.5 w-2.5" /> Catalog
                            </span>
                          </div>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/managed-sells/${item.managedId}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs"
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-500" />
                            Manage
                          </Link>

                          {item.status === "ready_for_sale" && !item.convertedProduct && (
                            <button
                              type="button"
                              onClick={() => handleQuickPublish(item._id, item.managedId)}
                              disabled={actionLoading === item._id}
                              title="Publish directly to Shop catalog"
                              className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 shadow-xs disabled:opacity-50"
                            >
                              <Store className="h-3.5 w-3.5" />
                              Publish
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(item._id, item.managedId)}
                            disabled={actionLoading === item._id}
                            title="Delete record"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* IMPORT SELL REQUEST MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ArrowDownToLine className="h-5 w-5 text-teal-600" />
                  Import from Customer Sell Request
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a pending or accepted sell request to automatically convert it into an inventory intake record with full customer info and device details.
                </p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick manual entry */}
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-3 border border-slate-200">
              <input
                value={manualSellId}
                onChange={(e) => setManualSellId(e.target.value)}
                placeholder="Or enter Sell Request ID directly (e.g. SR-10001)..."
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400"
              />
              <Button
                onClick={() => handleImport(manualSellId)}
                disabled={!manualSellId || !!actionLoading}
                className="bg-teal-600 text-white hover:bg-teal-700 text-xs font-semibold"
              >
                Import ID
              </Button>
            </div>

            {/* List of recent sell requests */}
            <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1">
              {loadingSellRequests ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  <RefreshCw className="mx-auto h-5 w-5 animate-spin text-teal-600 mb-2" />
                  Fetching recent sell requests...
                </div>
              ) : sellRequests.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No sell requests available.
                </div>
              ) : (
                sellRequests.map((sr) => (
                  <div
                    key={sr._id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:border-teal-300 hover:bg-teal-50/30 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-teal-700">{sr.sellId}</span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-medium text-slate-600 capitalize">
                          {sr.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-900 mt-1">
                        {sr.brand} {sr.model} {sr.storage ? `(${sr.storage})` : ""}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Customer: <span className="font-medium text-slate-700">{sr.name}</span> ({sr.phone})
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900">
                        {formatCurrency(sr.finalPrice || sr.expectedPrice || 0)}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleImport(sr.sellId)}
                        disabled={actionLoading === sr.sellId}
                        className="mt-2 bg-teal-600 hover:bg-teal-700 text-white text-xs"
                      >
                        {actionLoading === sr.sellId ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          "Import Record"
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
              <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DIRECT INTAKE MODAL */}
      {isIntakeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-teal-600" />
                  Direct Walk-In Intake / Procure Old Phone
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record device identification, primary IMEI, customer identity (Aadhaar/PAN), and purchase payout.
                </p>
              </div>
              <button
                onClick={() => setIsIntakeModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIntake} className="mt-4 flex-1 overflow-y-auto space-y-6 pr-1">
              {/* SECTION 1: DEVICE SPECIFICATIONS */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-3 flex items-center gap-1.5">
                  <Cpu className="h-4 w-4" /> 1. Device & Hardware Identification
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Brand *</Label>
                    <Input
                      required
                      placeholder="e.g. Apple, Samsung, OnePlus"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Model *</Label>
                    <Input
                      required
                      placeholder="e.g. iPhone 13, Galaxy S22"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Color</Label>
                    <Input
                      placeholder="e.g. Midnight, Phantom Black"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
                  <div>
                    <Label className="text-xs">Storage</Label>
                    <Select
                      value={formData.storage}
                      onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                    >
                      <option value="64GB">64 GB</option>
                      <option value="128GB">128 GB</option>
                      <option value="256GB">256 GB</option>
                      <option value="512GB">512 GB</option>
                      <option value="1TB">1 TB</option>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">RAM</Label>
                    <Input
                      placeholder="e.g. 6GB, 8GB"
                      value={formData.ram}
                      onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Condition Grade</Label>
                    <Select
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                    >
                      <option value="excellent">Excellent (Like New)</option>
                      <option value="good">Good (Minor Wear)</option>
                      <option value="fair">Fair (Scratches/Dents)</option>
                      <option value="poor">Poor (Needs Refurbishment)</option>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Battery Health %</Label>
                    <Input
                      type="number"
                      min="40"
                      max="100"
                      value={formData.batteryHealth}
                      onChange={(e) => setFormData({ ...formData, batteryHealth: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <div>
                    <Label className="text-xs">Primary IMEI (15 Digits) *</Label>
                    <Input
                      required
                      maxLength={15}
                      placeholder="e.g. 356872091234567"
                      value={formData.imei}
                      onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Secondary IMEI 2 (Optional)</Label>
                    <Input
                      maxLength={15}
                      placeholder="Dual SIM IMEI 2"
                      value={formData.imei2}
                      onChange={(e) => setFormData({ ...formData, imei2: e.target.value })}
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Serial Number</Label>
                    <Input
                      placeholder="Device Serial Number"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: CUSTOMER DETAILS & KYC */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" /> 2. Customer Identity & KYC Verification
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Customer Full Name *</Label>
                    <Input
                      required
                      placeholder="Full Name as on ID"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">WhatsApp / Phone *</Label>
                    <Input
                      required
                      placeholder="10-digit mobile number"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Email Address</Label>
                    <Input
                      type="email"
                      placeholder="customer@email.com"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <Label className="text-xs">Aadhaar Card Number (12 Digits)</Label>
                    <Input
                      maxLength={12}
                      placeholder="e.g. 5432 1098 7654"
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">PAN Card Number (10 Characters)</Label>
                    <Input
                      maxLength={10}
                      placeholder="e.g. ABCDE1234F"
                      value={formData.panNumber}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                      className="font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Street Address</Label>
                    <Input
                      placeholder="House/Flat, Street name"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">City</Label>
                    <Input
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Pincode</Label>
                    <Input
                      placeholder="e.g. 560001"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: PRICING & PAYOUT */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-3 flex items-center gap-1.5">
                  <IndianRupee className="h-4 w-4" /> 3. Pricing & Payout Settlement
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Procurement / Purchase Price (₹) *</Label>
                    <Input
                      type="number"
                      required
                      placeholder="Price paid to customer"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Target Selling Price in Catalog (₹)</Label>
                    <Input
                      type="number"
                      placeholder="Expected resale price"
                      value={formData.targetSellingPrice}
                      onChange={(e) => setFormData({ ...formData, targetSellingPrice: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <div>
                    <Label className="text-xs">Payout Method</Label>
                    <Select
                      value={formData.payoutMethod}
                      onChange={(e) => setFormData({ ...formData, payoutMethod: e.target.value as any })}
                    >
                      <option value="upi">UPI Transfer</option>
                      <option value="bank_transfer">Bank Transfer (NEFT/IMPS)</option>
                      <option value="cash">Cash in Hand</option>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">UPI ID / Account Info</Label>
                    <Input
                      placeholder="name@okaxis / Bank A/C"
                      value={formData.payoutUpi}
                      onChange={(e) => setFormData({ ...formData, payoutUpi: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Transaction UTR / Receipt Ref</Label>
                    <Input
                      placeholder="e.g. 423987162534"
                      value={formData.payoutRef}
                      onChange={(e) => setFormData({ ...formData, payoutRef: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsIntakeModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading === "creating_intake"}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                >
                  {actionLoading === "creating_intake" ? "Saving..." : "Register Intake"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
