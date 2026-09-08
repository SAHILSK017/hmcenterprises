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
import { z } from "zod";
import imageCompression from "browser-image-compression";
import { Input, Textarea, Label, Select } from "@/components/ui/input";
import {
  PHONE_BRANDS,
  PHONE_MODELS_BY_BRAND,
  LAPTOP_BRANDS,
  LAPTOP_MODELS_BY_BRAND,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

const contactSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit mobile required"),
  email: z.string().email().optional().or(z.literal("")),
  preferredContact: z.enum(["whatsapp", "call", "either"]),
});

const deviceSchema = z.object({
  brand: z.string().min(1, "Select brand"),
  model: z.string().min(1, "Enter model"),
  problemCategory: z.enum([
    "screen",
    "battery",
    "charging",
    "camera",
    "speaker",
    "software",
    "water_damage",
    "other",
  ]),
  problemDescription: z.string().min(10, "Describe the issue (min 10 characters)"),
});

type ContactValues = z.infer<typeof contactSchema>;
type DeviceValues = z.infer<typeof deviceSchema>;

const STEPS = [
  { id: "contact", label: "Contact" },
  { id: "device", label: "Device" },
  { id: "photos", label: "Photos" },
  { id: "review", label: "Review" },
] as const;

const PROBLEMS = [
  { value: "screen", label: "Cracked / blank screen" },
  { value: "battery", label: "Battery drain / swelling" },
  { value: "charging", label: "Not charging / port issue" },
  { value: "camera", label: "Camera issues" },
  { value: "speaker", label: "Speaker / mic" },
  { value: "software", label: "Software / boot loop" },
  { value: "water_damage", label: "Water damage" },
  { value: "other", label: "Other" },
] as const;

const LAPTOP_PROBLEMS = [
  { value: "screen", label: "Display / Screen damage" },
  { value: "battery", label: "Battery drain / Replacement" },
  { value: "charging", label: "Charging port / Adapter" },
  { value: "speaker", label: "Keyboard / Trackpad repair" },
  { value: "camera", label: "Overheating / Fan noise" },
  { value: "software", label: "Motherboard / IC repair" },
  { value: "water_damage", label: "Liquid / Water spill" },
  { value: "other", label: "Other issue" },
] as const;

const STEP_MAX_WIDTH: Record<number, number> = {
  0: 520,
  1: 720,
  2: 680,
  3: 760,
};

interface UploadedImage {
  url: string;
  publicId: string;
  preview: string;
}

export function RepairForm() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [contact, setContact] = useState<ContactValues | null>(null);
  const [device, setDevice] = useState<DeviceValues | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [customModel, setCustomModel] = useState("");
  const [deviceCategory, setDeviceCategory] = useState<"smartphone" | "laptop">("smartphone");
  const isFirstStepRender = useRef(true);

  const contactForm = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { preferredContact: "whatsapp", email: "" },
  });

  const deviceForm = useForm<DeviceValues>({
    resolver: zodResolver(deviceSchema),
  });

  const brand = deviceForm.watch("brand");
  const model = deviceForm.watch("model");

  const brandOptions = deviceCategory === "smartphone" ? PHONE_BRANDS : LAPTOP_BRANDS;
  const modelsMap = deviceCategory === "smartphone" ? PHONE_MODELS_BY_BRAND : LAPTOP_MODELS_BY_BRAND;
  const problemOptions = deviceCategory === "smartphone" ? PROBLEMS : LAPTOP_PROBLEMS;

  useEffect(() => {
    if (isFirstStepRender.current) {
      isFirstStepRender.current = false;
      return;
    }
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [step]);

  const goToStep = (target: number) => setStep(target);

  async function handleImageSelect(files: FileList | null) {
    if (!files?.length) return;
    if (images.length + files.length > 6) {
      toast.error("Maximum 6 images");
      return;
    }
    setBusy(true);
    try {
      const next: UploadedImage[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`);
          continue;
        }
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        });
        const formData = new FormData();
        formData.append("file", compressed);
        formData.append("folder", "hmk/repairs");
        const data = await api<{ url: string; publicId: string }>("/api/upload", {
          method: "POST",
          body: formData,
        });
        next.push({
          url: data.url,
          publicId: data.publicId,
          preview: URL.createObjectURL(compressed),
        });
      }
      setImages((prev) => [...prev, ...next]);
      if (next.length) toast.success(`${next.length} photo(s) added`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const next = async () => {
    if (step === 0) {
      const valid = await contactForm.trigger();
      if (!valid) return;
      setContact(contactForm.getValues());
    } else if (step === 1) {
      if (deviceForm.getValues("model") === "Other") {
        if (!customModel.trim()) {
          toast.error("Please enter your device model");
          deviceForm.setError("model", { message: "Please enter your device model" });
          return;
        }
        deviceForm.setValue("model", customModel.trim(), { shouldValidate: true });
      }
      const valid = await deviceForm.trigger();
      if (!valid) return;
      setDevice(deviceForm.getValues());
    }
    setStep((s) => s + 1);
  };

  async function submit() {
    if (!contact || !device) return;
    setBusy(true);
    try {
      const data = await api<{ repairId: string }>("/api/repairs", {
        method: "POST",
        body: JSON.stringify({
          ...contact,
          ...device,
          images: images.map(({ url, publicId }) => ({ url, publicId })),
        }),
      });
      setSubmittedId(data.repairId);
      toast.success("Your repair request has been submitted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit");
    } finally {
      setBusy(false);
    }
  }

  const problemLabel =
    PROBLEMS.find((p) => p.value === device?.problemCategory)?.label ??
    device?.problemCategory?.replace(/_/g, " ") ??
    "—";

  const preferredContactLabel =
    contact?.preferredContact === "whatsapp"
      ? "WhatsApp"
      : contact?.preferredContact === "call"
        ? "Phone call"
        : "Either";

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
          Your repair request has been submitted
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground/60">
          Your repair ID:{" "}
          <span className="font-semibold text-foreground">{submittedId}</span>
        </p>
        <p className="mt-1 text-sm leading-relaxed text-foreground/60">
          We&apos;ll contact you shortly on WhatsApp with next steps.
        </p>
        <Link
          href={`https://wa.me/918130155540?text=${encodeURIComponent(`Hi HMC Mobile, I submitted repair request ${submittedId}.`)}`}
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
          Track your repair
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
      <nav className="mb-5 flex items-center gap-1" aria-label="Form progress">
        {STEPS.map(({ label }, i) => (
          <div key={label} className="flex min-w-0 flex-1 items-center gap-1">
            <div className="flex min-w-0 flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all",
                  i < step && "bg-brand text-white",
                  i === step &&
                    "bg-brand text-white ring-2 ring-brand/30 ring-offset-2 ring-offset-[var(--canvas)]",
                  i > step && "border border-border bg-muted text-foreground/40"
                )}
              >
                {i < step ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden truncate text-[9px] font-bold uppercase tracking-wider sm:block",
                  i === step ? "text-brand" : i < step ? "text-foreground/55" : "text-foreground/35"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "mb-4 h-px min-w-[6px] flex-1",
                  i < step ? "bg-brand/60" : "bg-border"
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
                    desc="We'll use these to update you on WhatsApp or call."
                  />
                  <div className="mt-6 space-y-4">
                    <FormField label="Full name" error={contactForm.formState.errors.name?.message}>
                      <Input className="sell-field" placeholder="Your name" {...contactForm.register("name")} />
                    </FormField>
                    <FormField label="Mobile number" error={contactForm.formState.errors.phone?.message}>
                      <Input
                        className="sell-field"
                        placeholder="9876543210"
                        inputMode="numeric"
                        maxLength={10}
                        {...contactForm.register("phone")}
                      />
                    </FormField>
                    <FormField label="Email (optional)" error={contactForm.formState.errors.email?.message}>
                      <Input
                        className="sell-field"
                        type="email"
                        placeholder="you@email.com"
                        {...contactForm.register("email")}
                      />
                    </FormField>
                    <FormField label="Preferred contact">
                      <Select className="sell-field" {...contactForm.register("preferredContact")}>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="call">Phone call</option>
                        <option value="either">Either</option>
                      </Select>
                    </FormField>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <StepHeader
                    title="Device & problem"
                    desc="Tell us what device you have and what's wrong so we can prepare parts and quote faster."
                  />
                  <div className="mt-6 space-y-4">
                    {/* Device Category Selector */}
                    <div>
                      <Label className="text-sm font-semibold text-foreground">Device Category</Label>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setDeviceCategory("smartphone");
                            deviceForm.setValue("brand", "", { shouldValidate: false });
                            deviceForm.setValue("model", "", { shouldValidate: false });
                            setCustomModel("");
                          }}
                          className={cn(
                            "flex items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-bold transition-all cursor-pointer",
                            deviceCategory === "smartphone"
                              ? "border-[#0071E3] bg-[#EFF6FF] text-[#0071E3] shadow-xs ring-2 ring-[#0071E3]/20"
                              : "border-border bg-background text-foreground/60 hover:bg-muted"
                          )}
                        >
                          📱 Smartphone
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeviceCategory("laptop");
                            deviceForm.setValue("brand", "", { shouldValidate: false });
                            deviceForm.setValue("model", "", { shouldValidate: false });
                            setCustomModel("");
                          }}
                          className={cn(
                            "flex items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-bold transition-all cursor-pointer",
                            deviceCategory === "laptop"
                              ? "border-[#0071E3] bg-[#EFF6FF] text-[#0071E3] shadow-xs ring-2 ring-[#0071E3]/20"
                              : "border-border bg-background text-foreground/60 hover:bg-muted"
                          )}
                        >
                          💻 Laptop / Mac
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField label="Brand" error={deviceForm.formState.errors.brand?.message}>
                        <Select
                          className="sell-field"
                          {...deviceForm.register("brand", {
                            onChange: (e) => {
                              deviceForm.setValue("brand", e.target.value, { shouldValidate: true });
                              deviceForm.setValue("model", "", { shouldValidate: false });
                              setCustomModel("");
                            },
                          })}
                        >
                          <option value="">Select brand</option>
                          {brandOptions.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </Select>
                      </FormField>
                      <FormField label="Model" error={deviceForm.formState.errors.model?.message}>
                        <Select
                          className="sell-field"
                          disabled={!brand}
                          {...deviceForm.register("model", {
                            onChange: (e) => {
                              deviceForm.setValue("model", e.target.value, { shouldValidate: true });
                              if (e.target.value !== "Other") setCustomModel("");
                            },
                          })}
                        >
                          <option value="">{brand ? "Select model" : "Select brand first"}</option>
                          {(brand
                            ? (modelsMap as Record<string, readonly string[]>)[brand] ?? ["Other"]
                            : []
                          ).map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </Select>
                        {model === "Other" && (
                          <Input
                            className="sell-field mt-2"
                            placeholder="Enter your model name"
                            value={customModel}
                            onChange={(e) => {
                              setCustomModel(e.target.value);
                              deviceForm.clearErrors("model");
                            }}
                          />
                        )}
                      </FormField>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-foreground">Problem type</Label>
                      {deviceForm.formState.errors.problemCategory && (
                        <p className="mt-1 text-xs font-medium text-status-danger">
                          {deviceForm.formState.errors.problemCategory.message}
                        </p>
                      )}
                      <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                        {problemOptions.map(({ value, label }) => {
                          const categoryStyles: Record<string, { unselectedBg: string; activeBorder: string; activeBg: string; text: string }> = {
                            screen: { unselectedBg: "bg-[#EFF6FF]/60 border-[#BFDBFE]", activeBorder: "border-[#0071E3] ring-2 ring-[#0071E3]/20", activeBg: "bg-[#EFF6FF]", text: "text-[#0071E3]" },
                            battery: { unselectedBg: "bg-[#F0FDF4]/60 border-[#BBF7D0]", activeBorder: "border-[#16A34A] ring-2 ring-[#16A34A]/20", activeBg: "bg-[#F0FDF4]", text: "text-[#16A34A]" },
                            charging: { unselectedBg: "bg-[#ECFEFF]/60 border-[#CFFAFE]", activeBorder: "border-[#00B8D9] ring-2 ring-[#00B8D9]/20", activeBg: "bg-[#ECFEFF]", text: "text-[#00B8D9]" },
                            camera: { unselectedBg: "bg-[#F5F3FF]/60 border-[#DDD6FE]", activeBorder: "border-[#7C3AED] ring-2 ring-[#7C3AED]/20", activeBg: "bg-[#F5F3FF]", text: "text-[#7C3AED]" },
                            speaker: { unselectedBg: "bg-[#EEF2FF]/60 border-[#C7D2FE]", activeBorder: "border-[#4F46E5] ring-2 ring-[#4F46E5]/20", activeBg: "bg-[#EEF2FF]", text: "text-[#4F46E5]" },
                            software: { unselectedBg: "bg-[#FEF3C7]/60 border-[#FDE68A]", activeBorder: "border-[#F59E0B] ring-2 ring-[#F59E0B]/20", activeBg: "bg-[#FEF3C7]", text: "text-[#D97706]" },
                            water_damage: { unselectedBg: "bg-[#FEF2F2]/60 border-[#FECACA]", activeBorder: "border-[#EF4444] ring-2 ring-[#EF4444]/20", activeBg: "bg-[#FEF2F2]", text: "text-[#EF4444]" },
                            other: { unselectedBg: "bg-[#FEF3C7]/60 border-[#FDE68A]", activeBorder: "border-[#F59E0B] ring-2 ring-[#F59E0B]/20", activeBg: "bg-[#FEF3C7]", text: "text-[#D97706]" },
                          };
                          const style = categoryStyles[value] || categoryStyles.screen;
                          const isSelected = deviceForm.watch("problemCategory") === value;

                          return (
                            <label
                              key={value}
                              className={cn(
                                "cursor-pointer rounded-2xl border px-4 py-3.5 transition-all flex items-center justify-between",
                                style.unselectedBg,
                                isSelected ? style.activeBorder + " " + style.activeBg : "hover:shadow-xs"
                              )}
                            >
                              <input
                                type="radio"
                                value={value}
                                className="sr-only"
                                {...deviceForm.register("problemCategory")}
                              />
                              <p className={cn("text-sm font-bold", isSelected ? style.text : "text-[#111827]")}>{label}</p>
                              {isSelected && <span className={cn("h-2.5 w-2.5 rounded-full", style.text.replace("text-", "bg-"))} />}
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <FormField
                      label="Describe the issue"
                      error={deviceForm.formState.errors.problemDescription?.message}
                    >
                      <Textarea
                        className="sell-field min-h-[120px] resize-none py-3"
                        placeholder="When did it start? Any drops or water exposure?"
                        {...deviceForm.register("problemDescription")}
                      />
                    </FormField>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <StepHeader
                    title="Photos (optional)"
                    desc="Clear photos of damage help us quote faster. Max 6 images."
                  />
                  <div className="mt-6 space-y-4">
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/20 px-6 py-10 transition-colors hover:border-brand/40 hover:bg-brand/5">
                      {busy ? (
                        <Loader2 className="h-8 w-8 animate-spin text-brand" />
                      ) : (
                        <Upload className="h-8 w-8 text-brand" strokeWidth={1.5} />
                      )}
                      <span className="text-sm font-semibold">
                        {busy ? "Compressing & uploading…" : "Tap to upload photos"}
                      </span>
                      <span className="text-xs text-foreground/45">JPG, PNG · auto-compressed</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        disabled={busy}
                        onChange={(e) => handleImageSelect(e.target.files)}
                      />
                    </label>
                    {images.length > 0 && (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {images.map((img, i) => (
                          <div
                            key={img.publicId}
                            className="group relative aspect-square overflow-hidden rounded-2xl border border-border"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.preview || img.url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-foreground/80 text-background opacity-0 transition-opacity group-hover:opacity-100"
                              onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {step === 3 && contact && device && (
                <>
                  <StepHeader title="Review & submit" desc="Confirm details — you'll get a Repair ID instantly." />
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <ReviewBlock
                      title="Contact"
                      onChange={() => goToStep(0)}
                      rows={[
                        ["Name", contact.name],
                        ["Mobile", contact.phone],
                        ["Email", contact.email || "Not provided"],
                        ["Preferred", preferredContactLabel],
                      ]}
                    />
                    <ReviewBlock
                      title="Device"
                      onChange={() => goToStep(1)}
                      rows={[
                        ["Brand", device.brand],
                        ["Model", device.model],
                        ["Problem", problemLabel],
                      ]}
                    />
                    <ReviewBlock
                      title="Description"
                      onChange={() => goToStep(1)}
                      className="sm:col-span-2"
                      rows={[["Issue", device.problemDescription]]}
                    />
                    <ReviewBlock
                      title="Photos"
                      onChange={() => goToStep(2)}
                      rows={[["Uploaded", `${images.length} photo(s)`]]}
                    />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 space-y-3">
            {step > 0 && step < 4 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex w-full items-center justify-center gap-1.5 py-2 text-sm font-semibold text-foreground/55 transition-colors hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            )}

            {step < 3 ? (
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
                Submit repair request
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

function ReviewBlock({
  title,
  rows,
  onChange,
  className,
}: {
  title: string;
  rows: [string, string][];
  onChange: () => void;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border/80 p-4", className)}>
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
            <dt className="shrink-0 text-foreground/50">{k}</dt>
            <dd className="text-right font-semibold text-foreground">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
