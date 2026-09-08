"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  Printer,
  Store,
  Save,
  Clock,
  Cpu,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Layers,
  IndianRupee,
  User,
  MapPin,
  CreditCard,
  History,
  FileCheck,
  X,
  AlertCircle,
  Camera,
  BatteryCharging,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ManagedPhone } from "../page";

export default function ManagedSellDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [item, setItem] = useState<ManagedPhone | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusNote, setStatusNote] = useState("");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Form states
  const [device, setDevice] = useState({
    brand: "",
    model: "",
    storage: "",
    ram: "",
    color: "",
    imei: "",
    imei2: "",
    serialNumber: "",
    batteryHealth: 90,
    condition: "good" as "excellent" | "good" | "fair" | "poor",
    checklist: {
      screen: "working",
      body: "minor_wear",
      camera: "working",
      battery: "good",
      charging: "working",
      displayWorking: true,
      biometricsWorking: true,
      cameraWorking: true,
      powersOn: true,
    },
  });

  const [pricing, setPricing] = useState({
    purchasePrice: 0,
    estimatedRepairCost: 0,
    targetSellingPrice: 0,
  });

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
    },
    aadhaar: {
      number: "",
      verified: false,
      photoFrontUrl: "",
      photoBackUrl: "",
    },
    pan: {
      number: "",
      verified: false,
      photoUrl: "",
    },
    payout: {
      method: "upi" as "upi" | "bank_transfer" | "cash",
      upiId: "",
      bankAccount: "",
      bankIfsc: "",
      transactionRef: "",
      status: "pending" as "pending" | "processing" | "paid" | "failed",
    },
    declarationAccepted: true,
  });

  const [status, setStatus] = useState<ManagedPhone["status"]>("procured");
  const [notes, setNotes] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api<{ item: ManagedPhone }>(`/api/managed-sells/${id}`);
      const d = res.item;
      setItem(d);
      setDevice({
        brand: d.device.brand || "",
        model: d.device.model || "",
        storage: d.device.storage || "",
        ram: d.device.ram || "",
        color: d.device.color || "",
        imei: d.device.imei || "",
        imei2: d.device.imei2 || "",
        serialNumber: d.device.serialNumber || "",
        batteryHealth: d.device.batteryHealth || 90,
        condition: d.device.condition || "good",
        checklist: {
          screen: (d.device as any).checklist?.screen || "working",
          body: (d.device as any).checklist?.body || "minor_wear",
          camera: (d.device as any).checklist?.camera || "working",
          battery: (d.device as any).checklist?.battery || "good",
          charging: (d.device as any).checklist?.charging || "working",
          displayWorking: (d.device as any).checklist?.displayWorking !== false,
          biometricsWorking: (d.device as any).checklist?.biometricsWorking !== false,
          cameraWorking: (d.device as any).checklist?.cameraWorking !== false,
          powersOn: (d.device as any).checklist?.powersOn !== false,
        },
      });

      setPricing({
        purchasePrice: d.pricing.purchasePrice || 0,
        estimatedRepairCost: d.pricing.estimatedRepairCost || 0,
        targetSellingPrice: d.pricing.targetSellingPrice || 0,
      });

      setCustomer({
        name: d.customer.name || "",
        phone: d.customer.phone || "",
        email: d.customer.email || "",
        address: {
          street: d.customer.address?.street || "",
          city: d.customer.address?.city || "",
          state: d.customer.address?.state || "",
          pincode: d.customer.address?.pincode || "",
        },
        aadhaar: {
          number: d.customer.aadhaar?.number || "",
          verified: !!d.customer.aadhaar?.verified,
          photoFrontUrl: d.customer.aadhaar?.photoFrontUrl || "",
          photoBackUrl: d.customer.aadhaar?.photoBackUrl || "",
        },
        pan: {
          number: d.customer.pan?.number || "",
          verified: !!d.customer.pan?.verified,
          photoUrl: d.customer.pan?.photoUrl || "",
        },
        payout: {
          method: d.customer.payout?.method || "upi",
          upiId: (d.customer.payout as any)?.upiId || "",
          bankAccount: (d.customer.payout as any)?.bankAccount || "",
          bankIfsc: (d.customer.payout as any)?.bankIfsc || "",
          transactionRef: d.customer.payout?.transactionRef || "",
          status: d.customer.payout?.status || "pending",
        },
        declarationAccepted: d.customer.declarationAccepted !== false,
      });

      setStatus(d.status);
      setNotes((d as any).notes || "");
    } catch (err: any) {
      toast.error(err.message || "Failed to load managed phone record");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSave = async () => {
    if (!device.imei || device.imei.length < 14) {
      toast.error("Please enter a valid 15-digit primary IMEI number");
      return;
    }

    setSaving(true);
    try {
      const res = await api<{ success: boolean; item: ManagedPhone }>(`/api/managed-sells/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          device,
          pricing,
          customer,
          status,
          notes,
          note: statusNote || undefined,
        }),
      });
      toast.success("Record updated successfully");
      setStatusNote("");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update record");
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToCatalog = async () => {
    if (!device.imei || device.imei.startsWith("PENDING")) {
      toast.error("Assign a valid IMEI before publishing to shop catalog");
      return;
    }

    setSaving(true);
    try {
      const res = await api<{ success: boolean; product: any }>(
        `/api/managed-sells/${id}/publish-product`,
        { method: "POST" }
      );
      toast.success(`Published live to Old Phone catalog as: ${res.product.name}`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to publish device to catalog");
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Smartphone className="h-5 w-5 animate-pulse text-teal-600" />
          Loading device intake record...
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-600">Managed selling phone record not found.</p>
        <Link href="/admin/managed-sells" className="mt-4 inline-block text-sm font-semibold text-teal-600">
          Return to list
        </Link>
      </div>
    );
  }

  const totalCost = pricing.purchasePrice + pricing.estimatedRepairCost;
  const projectedMargin = pricing.targetSellingPrice - totalCost;
  const marginPercentage =
    totalCost > 0 ? Math.round((projectedMargin / totalCost) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* TOP BAR / BREADCRUMBS */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/managed-sells"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-teal-700">
                {item.managedId}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 capitalize">
                {(item.intakeType || "direct_walkin").replace(/_/g, " ")}
              </span>
              {(item.sourceSellRequest || (item as any).sellRequestId) && (
                <Link
                  href={`/admin/sells/${item.sourceSellRequest?.sellId || (item as any).sellRequestId}`}
                  className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 hover:underline font-mono"
                >
                  Source: {item.sourceSellRequest?.sellId || (item as any).sellRequestId}
                </Link>
              )}
            </div>
            <h1 className="text-lg font-bold text-slate-900">
              {device.brand} {device.model} ({device.storage})
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPrintModalOpen(true)}
            className="text-xs font-semibold text-slate-700"
          >
            <Printer className="mr-1.5 h-4 w-4 text-slate-500" />
            Print Agreement / Voucher
          </Button>

          {item.convertedProduct ? (
            <Link
              href={`/shop/${item.convertedProduct.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800 hover:bg-teal-100"
            >
              <Store className="h-4 w-4 text-teal-600" />
              View in Shop <ExternalLink className="h-3 w-3" />
            </Link>
          ) : (
            <Button
              variant="outline"
              onClick={handlePublishToCatalog}
              disabled={saving}
              className="border-teal-200 bg-teal-50/60 text-teal-800 hover:bg-teal-100 text-xs font-semibold"
            >
              <Store className="mr-1.5 h-4 w-4 text-teal-600" />
              Publish to Shop Catalog
            </Button>
          )}

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm shadow-teal-600/20"
          >
            <Save className="mr-1.5 h-4 w-4" />
            {saving ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* 2-COLUMN MAIN DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: HARDWARE & CUSTOMER KYC (2 COLS SPAN) */}
        <div className="lg:col-span-2 space-y-6">
          {/* CARD 1: DEVICE & HARDWARE IDENTIFICATION */}
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-teal-600" />
                  Hardware & IMEI Identification
                </span>
                <span className="text-xs font-normal text-slate-500">
                  Primary IMEI must be exactly 15 digits
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Brand</Label>
                  <Input
                    value={device.brand}
                    onChange={(e) => setDevice({ ...device, brand: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Model</Label>
                  <Input
                    value={device.model}
                    onChange={(e) => setDevice({ ...device, model: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Color</Label>
                  <Input
                    value={device.color}
                    onChange={(e) => setDevice({ ...device, color: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">Storage</Label>
                  <Input
                    value={device.storage}
                    onChange={(e) => setDevice({ ...device, storage: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">RAM</Label>
                  <Input
                    value={device.ram}
                    onChange={(e) => setDevice({ ...device, ram: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Condition Grading</Label>
                  <Select
                    value={device.condition}
                    onChange={(e) => setDevice({ ...device, condition: e.target.value as any })}
                  >
                    <option value="excellent">Excellent (Like New)</option>
                    <option value="good">Good (Minor Scratches)</option>
                    <option value="fair">Fair (Visible Wear)</option>
                    <option value="poor">Poor (Defective/Broken)</option>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Battery Health %</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="40"
                      max="100"
                      value={device.batteryHealth}
                      onChange={(e) => setDevice({ ...device, batteryHealth: Number(e.target.value) })}
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">%</span>
                  </div>
                </div>
              </div>

              {/* IMEI & HARDWARE IDENTIFIERS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl bg-slate-50 p-4 border border-slate-200">
                <div>
                  <Label className="text-xs font-bold text-slate-800">
                    Primary IMEI (15-Digits) *
                  </Label>
                  <Input
                    maxLength={15}
                    placeholder="356872091234567"
                    value={device.imei}
                    onChange={(e) => setDevice({ ...device, imei: e.target.value })}
                    className="font-mono font-bold text-slate-900 border-teal-300 focus:border-teal-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {device.imei ? `${device.imei.length}/15 digits` : "Required for NOC & Sale"}
                  </span>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">
                    Secondary IMEI 2 (eSIM / SIM 2)
                  </Label>
                  <Input
                    maxLength={15}
                    placeholder="Dual-SIM IMEI 2"
                    value={device.imei2}
                    onChange={(e) => setDevice({ ...device, imei2: e.target.value })}
                    className="font-mono text-slate-800"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">
                    Serial Number / Apple SN
                  </Label>
                  <Input
                    placeholder="Device Serial Number"
                    value={device.serialNumber}
                    onChange={(e) => setDevice({ ...device, serialNumber: e.target.value })}
                    className="font-mono uppercase text-slate-800"
                  />
                </div>
              </div>

              {/* QC INSPECTION CHECKLIST */}
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                  9-Point QC Diagnostic Checklist
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={device.checklist.powersOn}
                      onChange={(e) =>
                        setDevice({
                          ...device,
                          checklist: { ...device.checklist, powersOn: e.target.checked },
                        })
                      }
                      className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                    />
                    <span className="font-medium text-slate-700">Powers On & Boots</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={device.checklist.displayWorking}
                      onChange={(e) =>
                        setDevice({
                          ...device,
                          checklist: { ...device.checklist, displayWorking: e.target.checked },
                        })
                      }
                      className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                    />
                    <span className="font-medium text-slate-700">Touch & Screen OEM</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={device.checklist.cameraWorking}
                      onChange={(e) =>
                        setDevice({
                          ...device,
                          checklist: { ...device.checklist, cameraWorking: e.target.checked },
                        })
                      }
                      className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                    />
                    <span className="font-medium text-slate-700">Front & Back Cameras</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={device.checklist.biometricsWorking}
                      onChange={(e) =>
                        setDevice({
                          ...device,
                          checklist: { ...device.checklist, biometricsWorking: e.target.checked },
                        })
                      }
                      className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                    />
                    <span className="font-medium text-slate-700">Biometrics / Face ID</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={device.checklist.charging === "working"}
                      onChange={(e) =>
                        setDevice({
                          ...device,
                          checklist: {
                            ...device.checklist,
                            charging: e.target.checked ? "working" : "faulty",
                          },
                        })
                      }
                      className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                    />
                    <span className="font-medium text-slate-700">Charging Port & Jack</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={device.checklist.battery === "good"}
                      onChange={(e) =>
                        setDevice({
                          ...device,
                          checklist: {
                            ...device.checklist,
                            battery: e.target.checked ? "good" : "needs_replacement",
                          },
                        })
                      }
                      className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                    />
                    <span className="font-medium text-slate-700">Battery Backup Valid</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CARD 2: CUSTOMER IDENTITY & KYC COMPLIANCE */}
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-teal-600" />
                  Customer Identity & Regulatory KYC
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Legal Ownership & NOC Record
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Customer Legal Name *</Label>
                  <Input
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Mobile / WhatsApp Number *</Label>
                  <Input
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Email Address</Label>
                  <Input
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  />
                </div>
              </div>

              {/* ADDRESS */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <Label className="text-xs">Permanent Residential Address</Label>
                  <Input
                    placeholder="House / Flat, Street, Area"
                    value={customer.address.street}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        address: { ...customer.address, street: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">City / District</Label>
                  <Input
                    placeholder="City"
                    value={customer.address.city}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        address: { ...customer.address, city: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Pincode</Label>
                  <Input
                    placeholder="Pincode"
                    value={customer.address.pincode}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        address: { ...customer.address, pincode: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              {/* AADHAAR CARD SECTION */}
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 text-blue-700 text-xs font-bold">
                      A
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      Aadhaar Card Verification (12 Digits)
                    </span>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customer.aadhaar.verified}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          aadhaar: { ...customer.aadhaar, verified: e.target.checked },
                        })
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span
                      className={
                        customer.aadhaar.verified ? "text-emerald-700" : "text-slate-500"
                      }
                    >
                      {customer.aadhaar.verified ? "Verified By Store" : "Pending Verification"}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Aadhaar Number</Label>
                    <Input
                      maxLength={12}
                      placeholder="12-digit Aadhaar"
                      value={customer.aadhaar.number}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          aadhaar: { ...customer.aadhaar, number: e.target.value },
                        })
                      }
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Front Photo URL / Document Link</Label>
                    <Input
                      placeholder="https://... /aadhaar_front.jpg"
                      value={customer.aadhaar.photoFrontUrl}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          aadhaar: { ...customer.aadhaar, photoFrontUrl: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Back Photo URL / Document Link</Label>
                    <Input
                      placeholder="https://... /aadhaar_back.jpg"
                      value={customer.aadhaar.photoBackUrl}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          aadhaar: { ...customer.aadhaar, photoBackUrl: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* PAN CARD SECTION */}
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 text-amber-800 text-xs font-bold">
                      P
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      PAN Card Verification (10 Characters)
                    </span>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customer.pan.verified}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          pan: { ...customer.pan, verified: e.target.checked },
                        })
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span
                      className={customer.pan.verified ? "text-emerald-700" : "text-slate-500"}
                    >
                      {customer.pan.verified ? "Verified By Store" : "Pending Verification"}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">PAN Number</Label>
                    <Input
                      maxLength={10}
                      placeholder="ABCDE1234F"
                      value={customer.pan.number}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          pan: { ...customer.pan, number: e.target.value.toUpperCase() },
                        })
                      }
                      className="font-mono uppercase"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">PAN Document Photo URL</Label>
                    <Input
                      placeholder="https://... /pan_card.jpg"
                      value={customer.pan.photoUrl}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          pan: { ...customer.pan, photoUrl: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* LEGAL NOC CHECKBOX */}
              <div className="flex items-start gap-2.5 rounded-lg bg-teal-50/70 p-3 border border-teal-200">
                <input
                  type="checkbox"
                  id="noc-accept"
                  checked={customer.declarationAccepted}
                  onChange={(e) =>
                    setCustomer({ ...customer, declarationAccepted: e.target.checked })
                  }
                  className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
                <label htmlFor="noc-accept" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
                  <span className="font-bold text-slate-900">Legal Ownership & NOC Declaration:</span> The seller declares and confirms that this device is free from any liens, outstanding finance/EMIs, or police claims. Ownership of the hardware and IMEI is legally transferred to HMK Mobile.
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: PIPELINE STATUS, PRICING, PAYOUT (1 COL) */}
        <div className="space-y-6">
          {/* CARD 3: STATUS & WORKFLOW */}
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-teal-600" />
                Pipeline Lifecycle Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div>
                <Label className="text-xs">Current State</Label>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="font-semibold text-slate-900"
                >
                  <option value="procured">1. Procured (Device Received)</option>
                  <option value="qc_inspection">2. QC Inspection / Diagnostics</option>
                  <option value="refurbishing">3. Refurbishing / Servicing</option>
                  <option value="ready_for_sale">4. Ready for Sale</option>
                  <option value="listed">5. Listed in Catalog</option>
                  <option value="sold">6. Sold Out</option>
                  <option value="returned">7. Returned to Customer</option>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Transition Note</Label>
                <Input
                  placeholder="e.g. Battery replaced, display cleaned..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
              </div>

              {/* AUDIT LOG TIMELINE */}
              {item.statusHistory && item.statusHistory.length > 0 && (
                <div className="border-t border-slate-100 pt-3">
                  <Label className="text-[11px] font-bold uppercase text-slate-500 block mb-2">
                    Status History
                  </Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {item.statusHistory.map((h: { status: string; note?: string; changedAt: string }, i: number) => (
                      <div key={i} className="text-xs border-l-2 border-teal-500 pl-2.5 py-0.5">
                        <div className="font-semibold text-slate-800 capitalize">
                          {h.status.replace(/_/g, " ")}
                        </div>
                        {h.note && <div className="text-slate-600 text-[11px]">{h.note}</div>}
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {formatDate(h.changedAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CARD 4: PRICING & MARGIN */}
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-teal-600" />
                Pricing & Profit Margin
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <div>
                <Label className="text-xs">Purchase / Procurement Cost (₹)</Label>
                <Input
                  type="number"
                  value={pricing.purchasePrice}
                  onChange={(e) =>
                    setPricing({ ...pricing, purchasePrice: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <Label className="text-xs">Repair & Refurbishment Cost (₹)</Label>
                <Input
                  type="number"
                  value={pricing.estimatedRepairCost}
                  onChange={(e) =>
                    setPricing({ ...pricing, estimatedRepairCost: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <Label className="text-xs">Target Resale Price in Catalog (₹)</Label>
                <Input
                  type="number"
                  value={pricing.targetSellingPrice}
                  onChange={(e) =>
                    setPricing({ ...pricing, targetSellingPrice: Number(e.target.value) })
                  }
                />
              </div>

              {/* MARGIN SUMMARY */}
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Total Cost Basis:</span>
                  <span className="font-semibold">{formatCurrency(totalCost)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Target Selling Price:</span>
                  <span className="font-semibold">{formatCurrency(pricing.targetSellingPrice)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold">
                  <span className="text-slate-800">Projected Margin:</span>
                  <span className={projectedMargin >= 0 ? "text-emerald-600" : "text-rose-600"}>
                    {formatCurrency(projectedMargin)} ({marginPercentage}%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CARD 5: CUSTOMER PAYOUT */}
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-teal-600" />
                Procurement Payout Settlement
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <div>
                <Label className="text-xs">Payout Method</Label>
                <Select
                  value={customer.payout.method}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      payout: { ...customer.payout, method: e.target.value as any },
                    })
                  }
                >
                  <option value="upi">UPI Transfer (Instant)</option>
                  <option value="bank_transfer">Bank Transfer (IMPS/NEFT)</option>
                  <option value="cash">Cash In Store</option>
                </Select>
              </div>

              <div>
                <Label className="text-xs">UPI ID / Bank A/C</Label>
                <Input
                  placeholder="customer@okaxis / 50100..."
                  value={customer.payout.upiId}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      payout: { ...customer.payout, upiId: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <Label className="text-xs">UTR Reference / Payment Receipt</Label>
                <Input
                  placeholder="e.g. 439281729102"
                  value={customer.payout.transactionRef}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      payout: { ...customer.payout, transactionRef: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <Label className="text-xs">Payout Status</Label>
                <Select
                  value={customer.payout.status}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      payout: { ...customer.payout, status: e.target.value as any },
                    })
                  }
                >
                  <option value="pending">Pending Settlement</option>
                  <option value="processing">Processing</option>
                  <option value="paid">Paid & Settled</option>
                  <option value="failed">Failed / Reversed</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* INTERNAL NOTES */}
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-3">
              <CardTitle className="text-sm font-bold text-slate-900">
                Staff Internal Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <Textarea
                rows={3}
                placeholder="Any special remarks regarding physical condition, origin or testing..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PRINTABLE LEGAL PURCHASE VOUCHER MODAL */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl space-y-6 my-auto">
            {/* Action buttons on top of modal (hidden when printing) */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Customer Purchase Voucher & NOC Agreement
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handlePrint} className="bg-teal-600 hover:bg-teal-700 text-white text-xs">
                  <Printer className="mr-1.5 h-4 w-4" /> Print Document
                </Button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* PRINTABLE CONTENT CONTAINER */}
            <div ref={printRef} className="space-y-6 text-slate-900 text-xs">
              {/* STORE HEADER */}
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900">
                    HMK MOBILE
                  </h2>
                  <p className="text-[11px] text-slate-600 font-medium">
                    Smartphones · Repairs · Certified Pre-Owned
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    GSTIN: 29ABCDE1234F1Z5 · Support: +91 98765 43210
                  </p>
                </div>
                <div className="text-right">
                  <div className="rounded border border-slate-300 px-2.5 py-1 text-[11px] font-mono font-bold bg-slate-50">
                    INTAKE NO: {item.managedId}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Date: {formatDate(item.createdAt)}
                  </div>
                </div>
              </div>

              {/* DOCUMENT TITLE */}
              <div className="text-center py-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 underline underline-offset-4">
                  Used Mobile Device Purchase Voucher & Legal Transfer NOC
                </h3>
              </div>

              {/* CUSTOMER KYC BOX */}
              <div className="rounded-lg border border-slate-300 p-3 space-y-1.5">
                <div className="font-bold uppercase text-[10px] text-slate-500 border-b border-slate-200 pb-1">
                  1. Seller / Customer Details & KYC Proof
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Customer Name:</span>{" "}
                    <span className="font-bold">{customer.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Mobile Phone:</span>{" "}
                    <span className="font-mono font-bold">{customer.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Aadhaar No:</span>{" "}
                    <span className="font-mono font-bold">
                      {customer.aadhaar.number ? `•••• •••• ${customer.aadhaar.number.slice(-4)}` : "Not provided"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">PAN No:</span>{" "}
                    <span className="font-mono font-bold">{customer.pan.number || "Not provided"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 font-medium">Address:</span>{" "}
                    <span>
                      {customer.address.street || ""}, {customer.address.city || ""},{" "}
                      {customer.address.pincode || ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* DEVICE & IMEI BOX */}
              <div className="rounded-lg border border-slate-300 p-3 space-y-1.5">
                <div className="font-bold uppercase text-[10px] text-slate-500 border-b border-slate-200 pb-1">
                  2. Device & Hardware Identification
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Brand & Model:</span>{" "}
                    <span className="font-bold">{device.brand} {device.model}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Storage & Color:</span>{" "}
                    <span className="font-medium">{device.storage} / {device.color || "Standard"}</span>
                  </div>
                  <div className="col-span-2 rounded bg-slate-50 p-2 font-mono text-xs border border-slate-200">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-700">PRIMARY IMEI:</span>
                      <span className="font-bold text-slate-900">{device.imei}</span>
                    </div>
                    {device.imei2 && (
                      <div className="flex justify-between mt-1 text-[11px] text-slate-600">
                        <span>SECONDARY IMEI:</span>
                        <span>{device.imei2}</span>
                      </div>
                    )}
                    {device.serialNumber && (
                      <div className="flex justify-between mt-1 text-[11px] text-slate-600">
                        <span>SERIAL NO:</span>
                        <span>{device.serialNumber}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Condition Grade:</span>{" "}
                    <span className="capitalize font-semibold">{device.condition}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Battery Health:</span>{" "}
                    <span className="font-semibold">{device.batteryHealth}%</span>
                  </div>
                </div>
              </div>

              {/* FINANCIAL SETTLEMENT */}
              <div className="rounded-lg border border-slate-300 p-3 space-y-1.5">
                <div className="font-bold uppercase text-[10px] text-slate-500 border-b border-slate-200 pb-1">
                  3. Procurement Payout Settlement
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Total Amount Paid:</span>{" "}
                    <span className="text-base font-bold text-slate-900">
                      {formatCurrency(pricing.purchasePrice)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Payment Mode:</span>{" "}
                    <span className="capitalize font-semibold">{customer.payout.method.replace(/_/g, " ")}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 font-medium">Transaction Reference / UTR:</span>{" "}
                    <span className="font-mono font-semibold">
                      {customer.payout.transactionRef || "Cash In Hand / Direct Settlement"}
                    </span>
                  </div>
                </div>
              </div>

              {/* LEGAL UNDERTAKING */}
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 text-[10px] text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800">SELLER DECLARATION:</span> I hereby confirm that I am the lawful sole owner of the aforementioned mobile device. The device is not stolen, blacklisted, financed under pending loan, or encumbered by any legal disputes. I have removed all personal cloud accounts (Apple ID / Google ID) and PIN passwords. I hereby transfer all ownership rights to HMK Mobile.
              </div>

              {/* SIGNATURES */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
                <div className="border-t border-slate-400 pt-2">
                  <div className="font-bold text-slate-900">{customer.name}</div>
                  <div className="text-[10px] text-slate-500">Signature of Seller / Customer</div>
                </div>
                <div className="border-t border-slate-400 pt-2">
                  <div className="font-bold text-slate-900">HMK Mobile Store Manager</div>
                  <div className="text-[10px] text-slate-500">Authorized Store Stamp & Signature</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
