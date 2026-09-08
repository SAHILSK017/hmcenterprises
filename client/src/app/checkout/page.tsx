"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  CheckCircle2,
  Loader2,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/components/shop/cart-context";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { PageSection } from "@/components/layout/page-section";

const addressFormSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  whatsapp: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit WhatsApp number required"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Valid 10-digit mobile number required")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  line1: z.string().min(5, "Enter house/flat number and street address"),
  line2: z.string().optional(),
  city: z.string().min(2, "Enter city"),
  state: z.string().min(2, "Enter state"),
  pincode: z.string().regex(/^\d{6}$/, "Enter valid 6-digit pincode"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof addressFormSchema>;

const SHIPPING = 99;
const FREE_SHIPPING_MIN = 15000;

interface PlacedOrderData {
  orderId: string;
  total: number;
  fullName: string;
  phone: string;
  whatsapp: string;
  address: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrderData | null>(null);

  const shipping = subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING;
  const total = subtotal + shipping;

  const form = useForm<FormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      fullName: user?.name ?? "",
      phone: user?.phone ?? "",
      whatsapp: user?.phone ?? "",
      email: user?.email ?? "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
      notes: "",
    },
  });

  // Automatically prefill customer details when logged in
  useEffect(() => {
    if (!user) return;
    form.setValue("fullName", user.name ?? "");
    if (user.phone) {
      form.setValue("phone", user.phone);
      form.setValue("whatsapp", user.phone);
    }
    if (user.email) {
      form.setValue("email", user.email);
    }
  }, [user, form]);

  async function onSubmit(values: FormValues) {
    if (!items.length) {
      toast.error("Your cart is empty");
      return;
    }

    setSubmitting(true);
    try {
      const whatsappNumber = values.whatsapp.trim();
      const primaryPhone = values.phone?.trim() || whatsappNumber;
      const payload = {
        address: {
          fullName: values.fullName.trim(),
          phone: primaryPhone,
          whatsapp: whatsappNumber,
          email: values.email?.trim() || undefined,
          line1: values.line1.trim(),
          line2: values.line2?.trim() || undefined,
          city: values.city.trim(),
          state: values.state.trim(),
          pincode: values.pincode.trim(),
          notes: values.notes?.trim() || undefined,
        },
        paymentMethod: "direct",
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      };

      const result = await api<{
        success: boolean;
        orderId: string;
        total: number;
      }>("/api/orders/checkout", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (result.success && result.orderId) {
        setPlacedOrder({
          orderId: result.orderId,
          total: result.total || total,
          fullName: values.fullName,
          phone: primaryPhone,
          whatsapp: whatsappNumber,
          address: `${values.line1}${values.line2 ? `, ${values.line2}` : ""}, ${values.city}, ${values.state} - ${values.pincode}`,
          items: items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price,
            image: i.image,
          })),
        });

        clearCart();
        toast.success(`Order request ${result.orderId} submitted!`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  // If order was successfully placed, display confirmation view
  if (placedOrder) {
    const waText = encodeURIComponent(
      `Hello HMC Mobile! I just placed order request *${placedOrder.orderId}* for ${placedOrder.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}. Please confirm my order details.`
    );
    const waLink = `https://wa.me/918130155540?text=${waText}`;

    return (
      <PageSection centered={false} innerClassName="py-4">
        <div className="mx-auto max-w-2xl">
          <Card className="border-teal-500/20 shadow-lg shadow-teal-500/5">
            <CardHeader className="text-center pb-4 pt-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Order Request Received
              </p>
              <CardTitle className="mt-1 font-display text-2xl sm:text-3xl">
                Thank you, {placedOrder.fullName}!
              </CardTitle>
              <p className="mx-auto mt-2 max-w-md text-sm text-foreground-muted">
                Your order request has been sent to our admin team. No payment was required.
                We will contact you on WhatsApp to confirm delivery details.
              </p>
            </CardHeader>

            <CardContent className="space-y-6 pt-2 pb-8">
              {/* Order ID Pill */}
              <div className="flex flex-col items-center justify-between rounded-xl bg-muted/60 p-4 sm:flex-row gap-2">
                <div>
                  <span className="text-xs text-foreground-muted">Order Reference ID:</span>
                  <p className="font-mono text-lg font-bold text-teal-600 dark:text-teal-400">
                    {placedOrder.orderId}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-teal-500/10 px-3 py-1.5 text-xs font-medium text-teal-700 dark:text-teal-300">
                  <PackageCheck className="h-4 w-4" />
                  Status: Confirmation Pending
                </div>
              </div>

              {/* WhatsApp Notification Alert */}
              <div className="rounded-xl border border-teal-500/30 bg-teal-500/5 p-4 flex gap-3.5 items-start">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-foreground">WhatsApp Confirmation Sent</p>
                  <p className="text-foreground-muted mt-0.5">
                    We&apos;ve sent a confirmation message to{" "}
                    <span className="font-medium text-foreground">{placedOrder.whatsapp}</span>.
                    You can also message our support desk directly below to speed up processing.
                  </p>
                </div>
              </div>

              {/* Items Summary */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-3">
                  Items in this order
                </h3>
                <div className="divide-y divide-border/60 rounded-xl border border-border/60 bg-card p-3">
                  {placedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 text-sm">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt=""
                            className="h-10 w-10 rounded-md object-cover border border-border/50"
                          />
                        )}
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-foreground-muted">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3 text-base font-bold">
                    <span>Total Amount</span>
                    <span className="text-teal-600 dark:text-teal-400">
                      {formatCurrency(placedOrder.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-2">
                  Delivery Details
                </h3>
                <div className="rounded-xl border border-border/60 bg-card p-3 text-sm flex gap-3 items-start">
                  <MapPin className="h-4 w-4 text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{placedOrder.fullName}</p>
                    <p className="text-foreground-muted">{placedOrder.address}</p>
                    <p className="text-xs text-foreground-muted mt-1">
                      Phone / WhatsApp: {placedOrder.whatsapp}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-11"
                  asChild
                >
                  <a href={waLink} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" />
                    Chat on WhatsApp to Confirm
                  </a>
                </Button>
                <Button variant="outline" className="flex-1 h-11" asChild>
                  <Link href={`/track/${placedOrder.orderId}`}>Track Order Status</Link>
                </Button>
                <Button variant="ghost" className="h-11" asChild>
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageSection>
    );
  }

  // If cart is empty
  if (!items.length) {
    return (
      <PageSection innerClassName="flex justify-center">
        <Card className="mx-auto w-full max-w-lg text-center">
          <CardContent className="py-12">
            <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
            <h1 className="mt-4 font-display text-2xl font-bold">Your cart is empty</h1>
            <p className="mt-2 text-sm text-foreground-muted">
              Add devices or certified pre-owned phones to your cart before proceeding to checkout.
            </p>
            <Button className="mt-5" asChild>
              <Link href="/shop">Browse phones & devices</Link>
            </Button>
          </CardContent>
        </Card>
      </PageSection>
    );
  }

  return (
    <PageSection centered={false} innerClassName="py-2 sm:py-4">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-foreground-muted mb-2">
          <Link href="/cart" className="hover:underline">
            Cart
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground">Checkout</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Checkout & Order Details</h1>
        <p className="text-sm text-foreground-muted mt-1">
          Provide your WhatsApp contact and delivery address. Our team will verify and fulfill your order directly.
        </p>

        {/* User login status indicator */}
        <div className="mt-3 flex items-center gap-2 text-xs">
          {user ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-3 py-1 font-medium text-teal-700 dark:text-teal-300">
              <UserCheck className="h-3.5 w-3.5" />
              Logged in as {user.name} — your details have been auto-filled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-foreground-muted">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              Checking out as Guest.{" "}
              <Link
                href="/login?next=/checkout"
                className="font-medium text-teal-600 hover:underline dark:text-teal-400"
              >
                Sign in to auto-fill details
              </Link>
            </span>
          )}
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Customer & WhatsApp Contact Info */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Phone className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                Customer & WhatsApp Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="e.g. Rahul Sharma"
                  {...form.register("fullName")}
                  className="mt-1"
                />
                {form.formState.errors.fullName && (
                  <p className="mt-1 text-xs text-status-danger">
                    {form.formState.errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="whatsapp" className="flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                    WhatsApp Number *
                  </Label>
                  <span className="text-[11px] text-emerald-600 font-medium">Updates & Confirmation</span>
                </div>
                <Input
                  id="whatsapp"
                  placeholder="10-digit WhatsApp number"
                  {...form.register("whatsapp")}
                  className="mt-1 border-emerald-500/30 focus-visible:ring-emerald-500"
                />
                {form.formState.errors.whatsapp && (
                  <p className="mt-1 text-xs text-status-danger">
                    {form.formState.errors.whatsapp.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Alternate Mobile (Optional)</Label>
                <Input
                  id="phone"
                  placeholder="10-digit calling number"
                  {...form.register("phone")}
                  className="mt-1"
                />
                {form.formState.errors.phone && (
                  <p className="mt-1 text-xs text-status-danger">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="email">Email Address (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com (for order receipt)"
                  {...form.register("email")}
                  className="mt-1"
                />
                {form.formState.errors.email && (
                  <p className="mt-1 text-xs text-status-danger">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="line1">Flat / House No. / Building & Street *</Label>
                <Input
                  id="line1"
                  placeholder="e.g. Flat 302, Green Valley Apartments, Station Road"
                  {...form.register("line1")}
                  className="mt-1"
                />
                {form.formState.errors.line1 && (
                  <p className="mt-1 text-xs text-status-danger">
                    {form.formState.errors.line1.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="line2">Landmark / Area (Optional)</Label>
                <Input
                  id="line2"
                  placeholder="e.g. Near Metro Gate 2"
                  {...form.register("line2")}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="e.g. Mumbai"
                  {...form.register("city")}
                  className="mt-1"
                />
                {form.formState.errors.city && (
                  <p className="mt-1 text-xs text-status-danger">
                    {form.formState.errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  placeholder="e.g. Maharashtra"
                  {...form.register("state")}
                  className="mt-1"
                />
                {form.formState.errors.state && (
                  <p className="mt-1 text-xs text-status-danger">
                    {form.formState.errors.state.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  placeholder="6-digit pincode"
                  {...form.register("pincode")}
                  className="mt-1"
                />
                {form.formState.errors.pincode && (
                  <p className="mt-1 text-xs text-status-danger">
                    {form.formState.errors.pincode.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Delivery Instructions (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="e.g. Call before delivery"
                  {...form.register("notes")}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary & Confirmation Box */}
        <div className="space-y-4">
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-64 overflow-y-auto divide-y divide-border/50">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 py-2.5 text-sm">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        className="h-12 w-12 rounded-lg object-cover border border-border/60 shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <ShoppingBag className="h-5 w-5 text-foreground-muted" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{item.name}</p>
                      <p className="text-xs text-foreground-muted">
                        Qty: {item.quantity} · {item.condition || "Certified"}
                      </p>
                      <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-0.5">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/50 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-foreground-muted">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-foreground-muted">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between border-t border-border/50 pt-2 text-base font-bold">
                  <span>Total Due</span>
                  <span className="text-teal-600 dark:text-teal-400">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Zero-friction Reassurance Banner */}
              <div className="rounded-xl border border-teal-500/25 bg-teal-500/5 p-3 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-teal-700 dark:text-teal-300">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  No Upfront Payment Required
                </div>
                <p className="text-foreground-muted leading-relaxed">
                  Submit your request and our executive will contact your WhatsApp to confirm order details and delivery arrangement.
                </p>
                <div className="flex items-center gap-1.5 text-foreground-muted pt-1">
                  <Truck className="h-3.5 w-3.5 text-teal-600" />
                  <span>Free inspection & doorstep assistance</span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white h-11 text-sm font-semibold shadow-md shadow-teal-600/20 gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending Request…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Confirm & Place Order Request
                  </>
                )}
              </Button>

              <p className="text-center text-[11px] text-foreground-muted">
                By placing this request, you agree to our terms of service and order confirmation policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </PageSection>
  );
}
