"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { toast } from "sonner";
import { Input, Label, Select } from "@/components/ui/input";
import {
  PHONE_BRANDS,
  PHONE_COLORS,
  PHONE_MODELS_BY_BRAND,
  LAPTOP_BRANDS,
  LAPTOP_MODELS_BY_BRAND,
  LAPTOP_STORAGE_OPTIONS,
} from "@/lib/constants";
import { sellRequestSchema } from "@/lib/validations";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { z } from "zod";

type SellFormValues = z.infer<typeof sellRequestSchema>;

const STEPS = [
  { id: "contact", label: "Contact" },
  { id: "device", label: "Device" },
  { id: "condition", label: "Condition" },
  { id: "photos", label: "Photos" },
  { id: "offer", label: "Offer" },
] as const;

const STORAGE_OPTIONS_UI = ["64GB", "128GB", "256GB", "512GB", "1TB"] as const;

const PURCHASE_YEARS = Array.from({ length: 12 }, (_, i) => String(new Date().getFullYear() - i));

const CONDITIONS = [
  { value: "excellent" as const, label: "LIKE NEW", hint: "Looks almost unused" },
  { value: "good" as const, label: "GOOD", hint: "Minor signs of use" },
  { value: "fair" as const, label: "AVERAGE", hint: "Visible wear or scratches" },
  { value: "poor" as const, label: "DAMAGED", hint: "Cracked, broken, or faulty" },
];

const YES_NO_QUESTIONS = [
  { key: "displayWorking" as const, label: "Is the display working properly?" },
  { key: "biometricsWorking" as const, label: "Is Face ID / Fingerprint working?" },
  { key: "cameraWorking" as const, label: "Is the camera working?" },
  { key: "batteryOriginal" as const, label: "Is the battery original?" },
  { key: "powersOn" as const, label: "Does the phone power on?" },
];

const PHOTO_SLOTS = [
  { id: "front", label: "Front", required: true },
  { id: "back", label: "Back", required: true },
  { id: "side", label: "Side", required: true },
  { id: "damage", label: "Damage", required: false },
] as const;

/** Form grows wider (to the right) on content-heavy steps instead of taller only */
const STEP_MAX_WIDTH: Record<number, number> = {
  0: 520,
  1: 680,
  2: 760,
  3: 720,
  4: 780,
};

type PhotoSlotId = (typeof PHOTO_SLOTS)[number]["id"];
type SlotFile = { url: string; publicId: string; preview?: string };

function mapChecklistFromAnswers(
  overall: SellFormValues["overallCondition"],
  answers: SellFormValues["checklist"]
): SellFormValues["checklist"] {
  const bodyMap = {
    excellent: "perfect",
    good: "minor_wear",
    fair: "dents",
    poor: "heavy_damage",
  } as const;

  return {
    ...answers,
    screen: answers.displayWorking === false ? "broken" : overall === "excellent" ? "perfect" : "minor_scratches",
    camera: answers.cameraWorking === false ? "broken" : "working",
    battery: answers.batteryOriginal === false ? "needs_replacement" : "excellent",
    charging: answers.powersOn === false ? "not_working" : "working",
    body: bodyMap[overall],
    accessories: answers.accessories ?? [],
    billAvailable: answers.billAvailable ?? false,
    warrantyValid: answers.warrantyValid ?? false,
  };
}

export function SellForm() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Partial<Record<PhotoSlotId, SlotFile>>>({});
  const [conditionErrors, setConditionErrors] = useState<string[]>([]);
  const [customModel, setCustomModel] = useState("");
  const [deviceCategory, setDeviceCategory] = useState<"smartphone" | "laptop">("smartphone");

  const form = useForm<SellFormValues>({
    resolver: zodResolver(sellRequestSchema) as never,
    defaultValues: {
      email: "",
      color: "",
      imei: "",
      purchaseYear: "",
      checklist: {
        screen: "perfect",
        battery: "good",
        body: "minor_wear",
        camera: "working",
        charging: "working",
        accessories: [],
        billAvailable: false,
        warrantyValid: false,
      },
      images: [],
    },
  });

  const values = form.watch();
  const isFirstStepRender = useRef(true);

  const brandOptions = deviceCategory === "smartphone" ? PHONE_BRANDS : LAPTOP_BRANDS;
  const modelsMap = deviceCategory === "smartphone" ? PHONE_MODELS_BY_BRAND : LAPTOP_MODELS_BY_BRAND;
  const storageOptions = deviceCategory === "smartphone" ? STORAGE_OPTIONS_UI : LAPTOP_STORAGE_OPTIONS;

  useEffect(() => {
    if (isFirstStepRender.current) {
      isFirstStepRender.current = false;
      return;
    }
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [step]);

  const goToStep = (target: number) => {
    setStep(target);
  };

  const uploadSlot = async (slotId: PhotoSlotId, list: FileList | null) => {
    const file = list?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "hmk/sells");
      const res = await api<{ url: string; publicId: string }>("/api/upload", {
        method: "POST",
        body: data,
      });
      setPhotos((prev) => ({
        ...prev,
        [slotId]: { ...res, preview: URL.createObjectURL(file) },
      }));
      toast.success(`${PHOTO_SLOTS.find((s) => s.id === slotId)?.label} photo added`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const removeSlot = (slotId: PhotoSlotId) => {
    setPhotos((prev) => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
  };

  const photoList = Object.values(photos).filter(Boolean) as SlotFile[];

  const validateConditionStep = () => {
    const missing: string[] = [];
    if (!values.overallCondition) missing.push("overallCondition");
    for (const { key, label } of YES_NO_QUESTIONS) {
      if (values.checklist?.[key] === undefined) {
        missing.push(label);
      }
    }
    setConditionErrors(missing.filter((m) => !m.startsWith("overall")));
    if (!values.overallCondition) {
      form.setError("overallCondition", { message: "Select overall condition" });
      return false;
    }
    if (missing.length > 0) {
      toast.error("Please answer all condition questions");
      return false;
    }
    return true;
  };

  const validatePhotosStep = () => {
    const missingLabels: string[] = [];
    for (const slot of PHOTO_SLOTS.filter((s) => s.required)) {
      if (!photos[slot.id]) missingLabels.push(slot.label);
    }
    if (values.overallCondition === "poor" && !photos.damage) {
      missingLabels.push("Damage");
    }
    if (missingLabels.length > 0) {
      toast.error(`Please upload: ${missingLabels.join(", ")}`);
      return false;
    }
    return true;
  };

  const next = async () => {
    if (step === 0) {
      if (!(await form.trigger(["name", "phone", "email"]))) return;
    } else if (step === 1) {
      if (values.model === "Other") {
        if (!customModel.trim()) {
          toast.error("Please enter your phone model");
          form.setError("model", { message: "Please enter your phone model" });
          return;
        }
        form.setValue("model", customModel.trim(), { shouldValidate: true });
      }
      if (!(await form.trigger(["brand", "model", "storage", "color", "purchaseYear"]))) return;
    } else if (step === 2) {
      if (!validateConditionStep()) return;
    } else if (step === 3) {
      if (!validatePhotosStep()) return;
    }
    setStep((s) => s + 1);
  };

  const submit = form.handleSubmit(async (value) => {
    if (!photoList.length) {
      toast.error("Upload at least one photo");
      return;
    }
    setBusy(true);
    try {
      const payload: SellFormValues = {
        ...value,
        checklist: mapChecklistFromAnswers(value.overallCondition, value.checklist),
        images: photoList,
      };
      const data = await api<{ sellId: string }>("/api/sells", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setSubmittedId(data.sellId);
      toast.success("Your valuation request has been submitted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setBusy(false);
    }
  });

  if (submittedId) {
    return (
      <div
        ref={cardRef}
        className="w-full max-w-[560px] overflow-hidden rounded-[22px] border border-border/80 bg-background p-8 shadow-[0_8px_40px_rgba(15,23,42,0.07)] sm:p-10"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </div>
        <h2 className="mt-5 font-display text-2xl font-bold tracking-tight">
          Your phone details have been submitted
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground/60">
          Your valuation request ID:{" "}
          <span className="font-semibold text-foreground">{submittedId}</span>
        </p>
        <p className="mt-1 text-sm leading-relaxed text-foreground/60">
          We&apos;ll contact you shortly on WhatsApp.
        </p>
        <Link
          href={`https://wa.me/918130155540?text=${encodeURIComponent(`Hi HMC Mobile, I submitted sell request ${submittedId}.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-[15px] font-semibold text-white shadow-[0_4px_20px_rgba(0,113,227,0.25)] transition-transform hover:scale-[1.01]"
        >
          <WhatsAppIcon className="h-4 w-4 fill-white text-white" /> Chat on WhatsApp
        </Link>
        <Link
          href={`/track/${submittedId}`}
          className="mt-3 flex h-11 w-full items-center justify-center rounded-full border border-border text-sm font-semibold text-foreground/70 transition-colors hover:text-foreground"
        >
          Track your request
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      layout
      className="w-full origin-top-left"
      animate={{ maxWidth: STEP_MAX_WIDTH[step] }}
      transition={{ maxWidth: { duration: 0.32, ease: [0.25, 0.1, 0.25, 1] } }}
    >
      {/* Progress stepper */}
      <nav className="mb-5 flex items-center gap-1" aria-label="Form progress">
        {STEPS.map(({ label }, i) => (
          <div key={label} className="flex min-w-0 flex-1 items-center gap-1">
            <div className="flex min-w-0 flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all shadow-xs",
                  i < step && "bg-[#16A34A] text-white",
                  i === step && "bg-[#0D9488] text-white ring-4 ring-[#0D9488]/20 scale-105",
                  i > step && "border border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8]"
                )}
              >
                {i < step ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden truncate text-[10px] font-bold uppercase tracking-wider sm:block",
                  i === step ? "text-[#0D9488]" : i < step ? "text-[#16A34A]" : "text-[#94A3B8]"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "mb-4 h-0.5 min-w-[6px] flex-1 rounded-full transition-colors",
                  i < step ? "bg-[#16A34A]" : "bg-[#E2E8F0]"
                )}
              />
            )}
          </div>
        ))}
      </nav>

      <motion.div
        layout
        transition={{ layout: { duration: 0.28, ease: [0.25, 0.1, 0.25, 1] } }}
        className="overflow-hidden rounded-[22px] border border-border/80 bg-background shadow-[0_8px_40px_rgba(15,23,42,0.07)]"
      >
        <div className="p-8 sm:p-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              layout
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22 }}
            >
              {step === 0 && (
                <>
                  <StepHeader
                    title="Your contact details"
                    desc="We'll use these details to send your valuation and contact you about your phone."
                  />
                  <div className="mt-6 space-y-4">
                    <FormField label="Full name" error={form.formState.errors.name?.message}>
                      <Input className="sell-field" placeholder="Your name" {...form.register("name")} />
                    </FormField>
                    <FormField
                      label="Mobile number"
                      error={form.formState.errors.phone?.message || undefined}
                    >
                      <Input
                        className="sell-field"
                        placeholder="9876543210"
                        inputMode="numeric"
                        maxLength={10}
                        {...form.register("phone")}
                      />
                    </FormField>
                    <FormField label="Email address (optional)" error={form.formState.errors.email?.message}>
                      <Input
                        className="sell-field"
                        type="email"
                        placeholder="you@email.com"
                        {...form.register("email")}
                      />
                    </FormField>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <StepHeader title="Tell us about your device" desc="Smartphone or Laptop details help us prepare an accurate buyback offer." />
                  <div className="mt-6 space-y-4">
                    {/* Device Category Selector */}
                    <div>
                      <Label className="text-sm font-semibold text-foreground">Device Category</Label>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setDeviceCategory("smartphone");
                            form.setValue("brand", "", { shouldValidate: false });
                            form.setValue("model", "", { shouldValidate: false });
                            form.setValue("storage", "", { shouldValidate: false });
                            setCustomModel("");
                          }}
                          className={cn(
                            "flex items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-bold transition-all cursor-pointer",
                            deviceCategory === "smartphone"
                              ? "border-[#0D9488] bg-[#F0FDFA] text-[#0D9488] shadow-xs ring-2 ring-[#0D9488]/20"
                              : "border-border bg-background text-foreground/60 hover:bg-muted"
                          )}
                        >
                          📱 Smartphone
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeviceCategory("laptop");
                            form.setValue("brand", "", { shouldValidate: false });
                            form.setValue("model", "", { shouldValidate: false });
                            form.setValue("storage", "", { shouldValidate: false });
                            setCustomModel("");
                          }}
                          className={cn(
                            "flex items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-bold transition-all cursor-pointer",
                            deviceCategory === "laptop"
                              ? "border-[#0D9488] bg-[#F0FDFA] text-[#0D9488] shadow-xs ring-2 ring-[#0D9488]/20"
                              : "border-border bg-background text-foreground/60 hover:bg-muted"
                          )}
                        >
                          💻 Laptop / Mac
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField label="Brand" error={form.formState.errors.brand?.message}>
                        <Select
                          className="sell-field"
                          {...form.register("brand", {
                            onChange: (e) => {
                              form.setValue("brand", e.target.value, { shouldValidate: true });
                              form.setValue("model", "", { shouldValidate: false });
                              setCustomModel("");
                            },
                          })}
                        >
                          <option value="">Select brand</option>
                          {brandOptions.map((x) => (
                            <option key={x} value={x}>
                              {x}
                            </option>
                          ))}
                        </Select>
                      </FormField>
                      <FormField label="Model" error={form.formState.errors.model?.message}>
                        <Select
                          className="sell-field"
                          disabled={!values.brand}
                          {...form.register("model", {
                            onChange: (e) => {
                              form.setValue("model", e.target.value, { shouldValidate: true });
                              if (e.target.value !== "Other") setCustomModel("");
                            },
                          })}
                        >
                          <option value="">{values.brand ? "Select model" : "Select brand first"}</option>
                          {(values.brand
                            ? (modelsMap as Record<string, readonly string[]>)[values.brand] ?? ["Other"]
                            : []
                          ).map((x) => (
                            <option key={x} value={x}>
                              {x}
                            </option>
                          ))}
                        </Select>
                        {values.model === "Other" && (
                          <Input
                            className="sell-field mt-2"
                            placeholder="Enter your model name"
                            value={customModel}
                            onChange={(e) => {
                              setCustomModel(e.target.value);
                              form.clearErrors("model");
                            }}
                          />
                        )}
                      </FormField>
                      <FormField label="Storage" error={form.formState.errors.storage?.message}>
                        <Select className="sell-field" {...form.register("storage")}>
                          <option value="">Select storage</option>
                          {storageOptions.map((x) => (
                            <option key={x} value={x}>
                              {x}
                            </option>
                          ))}
                        </Select>
                      </FormField>
                      <FormField label="Color (optional)" error={form.formState.errors.color?.message}>
                        <Select className="sell-field" {...form.register("color")}>
                          <option value="">Select color</option>
                          {PHONE_COLORS.map((x) => (
                            <option key={x} value={x}>
                              {x}
                            </option>
                          ))}
                        </Select>
                      </FormField>
                      <FormField label="Purchase year" className="sm:col-span-2 sm:max-w-[calc(50%-0.5rem)]">
                        <Select className="sell-field" {...form.register("purchaseYear")}>
                          <option value="">Select year</option>
                          {PURCHASE_YEARS.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </Select>
                      </FormField>
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <StepHeader
                    title="What condition is your phone in?"
                    desc="Select the option that best describes your device."
                  />
                  <div className="mt-6 space-y-5">
                    <div>
                      {form.formState.errors.overallCondition && (
                        <p className="mb-2 text-xs font-medium text-status-danger">
                          {form.formState.errors.overallCondition.message}
                        </p>
                      )}
                      <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
                        {CONDITIONS.map(({ value, label, hint }) => (
                          <label
                            key={value}
                            className={cn(
                              "cursor-pointer rounded-2xl border px-4 py-3.5 transition-all",
                              values.overallCondition === value
                                ? "border-brand bg-brand/5 ring-1 ring-brand/25"
                                : "border-border hover:border-brand/40"
                            )}
                          >
                            <input
                              type="radio"
                              value={value}
                              className="sr-only"
                              {...form.register("overallCondition")}
                            />
                            <p className="text-sm font-bold tracking-wide">{label}</p>
                            <p className="mt-0.5 text-xs text-foreground/55">{hint}</p>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {YES_NO_QUESTIONS.map(({ key, label }) => (
                        <YesNoField
                          key={key}
                          label={label}
                          value={values.checklist?.[key]}
                          error={conditionErrors.includes(label)}
                          onChange={(v) => {
                            form.setValue(`checklist.${key}`, v, { shouldDirty: true });
                            setConditionErrors((prev) => prev.filter((e) => e !== label));
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <StepHeader
                    title="Show us your phone"
                    desc="Clear photos help us give you a more accurate offer."
                  />
                  <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {PHOTO_SLOTS.map(({ id, label, required }) => {
                      const slot = photos[id];
                      return (
                        <div
                          key={id}
                          className="relative overflow-hidden rounded-2xl border border-border bg-muted/20"
                        >
                          {slot ? (
                            <div className="group relative aspect-[4/3]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={slot.preview || slot.url}
                                alt={label}
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeSlot(id)}
                                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-foreground/80 text-background opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 p-4 transition-colors hover:bg-brand/5">
                              <Upload className="h-5 w-5 text-brand" strokeWidth={1.5} />
                              <span className="text-xs font-semibold text-foreground">{label}</span>
                              <span className="text-[10px] text-foreground/45">
                                {required ? "Required" : "If applicable"}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={busy}
                                onChange={(e) => uploadSlot(id, e.target.files)}
                              />
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <StepHeader title="Review your details" desc="Get your valuation" />
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <ReviewBlock
                      title="Contact"
                      onChange={() => goToStep(0)}
                      rows={[
                        ["Name", values.name || "—"],
                        ["Mobile", values.phone || "—"],
                        ["Email", values.email || "Not provided"],
                      ]}
                    />
                    <ReviewBlock
                      title="Device"
                      onChange={() => goToStep(1)}
                      rows={[
                        ["Brand", values.brand || "—"],
                        ["Model", values.model || "—"],
                        ["Storage", values.storage || "—"],
                        ["Color", values.color || "—"],
                        ["Purchase year", values.purchaseYear || "—"],
                      ]}
                    />
                    <ReviewBlock
                      title="Condition"
                      onChange={() => goToStep(2)}
                      rows={[
                        [
                          "Overall",
                          CONDITIONS.find((c) => c.value === values.overallCondition)?.label ?? "—",
                        ],
                        ["Display", yesNoLabel(values.checklist?.displayWorking)],
                        ["Biometrics", yesNoLabel(values.checklist?.biometricsWorking)],
                        ["Camera", yesNoLabel(values.checklist?.cameraWorking)],
                        ["Battery original", yesNoLabel(values.checklist?.batteryOriginal)],
                        ["Powers on", yesNoLabel(values.checklist?.powersOn)],
                      ]}
                    />
                    <ReviewBlock
                      title="Photos"
                      onChange={() => goToStep(3)}
                      rows={[["Uploaded", `${photoList.length} photo(s)`]]}
                    />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 space-y-3">
            {step > 0 && step < 5 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex w-full items-center justify-center gap-1.5 py-2 text-sm font-semibold text-foreground/55 transition-colors hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={next}
                disabled={busy}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-[15px] font-semibold text-white shadow-[0_4px_20px_rgba(0,113,227,0.22)] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
              >
                Continue <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={busy}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-[15px] font-semibold text-white shadow-[0_4px_20px_rgba(0,113,227,0.22)] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Get My Offer
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StepHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-foreground/55">{desc}</p>
    </div>
  );
}

function FormField({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-sm font-semibold text-foreground">{label}</Label>
      <div className="mt-2">{children}</div>
      {error && <p className="mt-1.5 text-xs font-medium text-status-danger">{error}</p>}
    </div>
  );
}

function YesNoField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value?: boolean;
  onChange: (v: boolean) => void;
  error?: boolean;
}) {
  return (
    <div>
      <p className={cn("text-sm font-semibold", error && "text-status-danger")}>{label}</p>
      <div className="mt-2 flex gap-2">
        {(["Yes", "No"] as const).map((opt, i) => {
          const boolVal = i === 0;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(boolVal)}
              className={cn(
                "flex-1 rounded-2xl border py-2.5 text-sm font-semibold transition-all",
                value === boolVal
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border text-foreground/65 hover:border-brand/40"
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReviewBlock({
  title,
  rows,
  onChange,
}: {
  title: string;
  rows: [string, string][];
  onChange: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border/80 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-foreground/45">{title}</p>
        <button
          type="button"
          onClick={onChange}
          className="text-xs font-semibold text-brand hover:underline"
        >
          Change
        </button>
      </div>
      <dl className="space-y-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 text-sm">
            <dt className="text-foreground/50">{k}</dt>
            <dd className="font-semibold text-foreground">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function yesNoLabel(v?: boolean) {
  if (v === undefined) return "—";
  return v ? "Yes" : "No";
}
