"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  Star,
  Truck,
  ZoomIn,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";
import { calcDiscount, starsLabel, type MarketplaceProduct } from "@/lib/shop";
import { useCart } from "@/components/shop/cart-context";
import { useWishlist } from "@/components/shop/wishlist-context";
import { getRecentlyViewed, pushRecentlyViewed, type RecentProduct } from "@/lib/recently-viewed";
import { MarketplaceProductCard } from "@/components/shop/marketplace-product-card";
import { getProductImageBgStyle } from "@/lib/product-image-tint";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { addItem } = useCart();
  const wishlist = useWishlist();

  const [product, setProduct] = useState<MarketplaceProduct | null>(null);
  const [related, setRelated] = useState<MarketplaceProduct[]>([]);
  const [recent, setRecent] = useState<RecentProduct[]>([]);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [pincode, setPincode] = useState("");
  const [deliveryMsg, setDeliveryMsg] = useState("");
  const [color, setColor] = useState("");
  const [storage, setStorage] = useState("");
  const [ram, setRam] = useState("");
  const [question, setQuestion] = useState("");

  useEffect(() => {
    if (!slug) return;
    setError("");
    api<MarketplaceProduct>(`/api/products/${slug}`)
      .then((p) => {
        setProduct(p);
        setActiveImage(0);
        setQty(1);
        setColor(p.specifications?.color || p.availableColors?.[0] || "");
        setStorage(p.specifications?.storage || p.availableStorage?.[0] || "");
        setRam(p.specifications?.ram || p.availableRam?.[0] || "");
        pushRecentlyViewed({
          _id: p._id,
          slug: p.slug,
          name: p.name,
          brand: p.brand,
          price: p.price,
          image: p.images?.[0]?.url,
        });
        setRecent(getRecentlyViewed().filter((r) => r.slug !== p.slug));
      })
      .catch((e) => setError(e.message));

    api<{ items: MarketplaceProduct[] }>(`/api/products/${slug}/related`)
      .then((d) => setRelated(d.items || []))
      .catch(() => setRelated([]));
  }, [slug]);

  const images = product?.images?.length ? product.images : [];
  const discount = product
    ? product.discountPercent || calcDiscount(product.price, product.compareAtPrice)
    : null;
  const wished = product ? wishlist.has(product._id) : false;
  const inStock = (product?.stock || 0) > 0;

  const ratingBars = useMemo(() => {
    if (!product?.ratingBreakdown) return [];
    const b = product.ratingBreakdown;
    const total =
      (b.five || 0) + (b.four || 0) + (b.three || 0) + (b.two || 0) + (b.one || 0) || 1;
    return [
      { label: "5 ★", count: b.five || 0, pct: ((b.five || 0) / total) * 100, barColor: "bg-[#16A34A]" },
      { label: "4 ★", count: b.four || 0, pct: ((b.four || 0) / total) * 100, barColor: "bg-[#1473EA]" },
      { label: "3 ★", count: b.three || 0, pct: ((b.three || 0) / total) * 100, barColor: "bg-[#00B8D9]" },
      { label: "2 ★", count: b.two || 0, pct: ((b.two || 0) / total) * 100, barColor: "bg-[#F59E0B]" },
      { label: "1 ★", count: b.one || 0, pct: ((b.one || 0) / total) * 100, barColor: "bg-[#EF4444]" },
    ];
  }, [product]);

  const addToCart = () => {
    if (!product || !inStock) return;
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url,
      slug: product.slug,
      condition: product.condition,
      quantity: qty,
    });
    toast.success("Added to cart");
  };

  if (error) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-foreground/60">{error}</p>
        <Link href="/shop" className="mt-4 inline-block text-sm font-semibold text-[#0071e3]">
          Back to shop
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] p-6">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-xl bg-white" />
          <div className="h-96 animate-pulse rounded-xl bg-white" />
        </div>
      </div>
    );
  }

  const specGroups: { title: string; rows: [string, string][] }[] = [
    {
      title: "General",
      rows: [
        ["Brand", product.brand],
        ["Model", product.model || product.specifications?.model || product.name],
        ["Release Year", product.specifications?.releaseYear || "—"],
        ["Condition", STATUS_LABELS[product.condition] || product.condition],
        ["SKU", product.sku || "—"],
      ],
    },
    {
      title: "Display",
      rows: [
        ["Display Size", product.specifications?.display || "—"],
        ["Display Type", product.specifications?.displayType || "—"],
        ["Resolution", product.specifications?.resolution || "—"],
        ["Refresh Rate", product.specifications?.refreshRate || "—"],
      ],
    },
    {
      title: "Performance",
      rows: [
        ["Processor", product.specifications?.processor || "—"],
        ["RAM", product.specifications?.ram || "—"],
        ["GPU", product.specifications?.gpu || "—"],
      ],
    },
    {
      title: "Memory",
      rows: [
        ["Internal Storage", product.specifications?.storage || "—"],
        ["Expandable Storage", product.specifications?.expandableStorage || "No"],
      ],
    },
    {
      title: "Camera",
      rows: [
        ["Rear Camera", product.specifications?.rearCamera || product.specifications?.camera || "—"],
        ["Front Camera", product.specifications?.frontCamera || "—"],
        ["Video Recording", product.specifications?.videoRecording || "—"],
      ],
    },
    {
      title: "Battery",
      rows: [
        ["Battery Capacity", product.specifications?.batteryCapacity || product.specifications?.battery || "—"],
        ["Battery Health", product.batteryHealth != null ? `${product.batteryHealth}%` : "—"],
        ["Charging", product.specifications?.charging || "—"],
      ],
    },
    {
      title: "Connectivity",
      rows: [
        ["5G", product.specifications?.network5g || "—"],
        ["4G", product.specifications?.network4g || "Yes"],
        ["WiFi", product.specifications?.wifi || "—"],
        ["Bluetooth", product.specifications?.bluetooth || "—"],
        ["NFC", product.specifications?.nfc || "—"],
        ["USB", product.specifications?.usb || "—"],
      ],
    },
    {
      title: "Physical",
      rows: [
        ["Height", product.specifications?.height || "—"],
        ["Width", product.specifications?.width || "—"],
        ["Thickness", product.specifications?.thickness || "—"],
        ["Weight", product.specifications?.weight || "—"],
        ["Color", color || product.specifications?.color || "—"],
      ],
    },
    {
      title: "Warranty",
      rows: [
        ["Warranty Period", product.warrantyMonths ? `${product.warrantyMonths} Months` : "No Warranty"],
        ["Warranty Type", product.seller?.warrantyNote || "HMC Store Warranty"],
        ["Service Details", "Carry-in to HMC Mobile service centre"],
      ],
    },
  ];

  const imgBg = getProductImageBgStyle(product);

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-24 lg:pb-10">
      <div className="container-page py-4">
        <nav className="flex flex-wrap items-center gap-1 text-xs font-semibold text-[#64748B]">
          <Link href="/" className="hover:text-[#1473EA]">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/shop" className="hover:text-[#1473EA]">Shop</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/shop?brand=${encodeURIComponent(product.brand)}`} className="hover:text-[#1473EA]">
            {product.brand}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-bold text-[#111827]">{product.name}</span>
        </nav>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
          {/* Gallery */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-3 sm:p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="hidden w-16 shrink-0 flex-col gap-2 sm:flex">
                {images.map((img, i) => (
                  <button
                    key={`${img.url}-${i}`}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "h-16 w-16 overflow-hidden rounded-xl border p-1 transition-all",
                      i === activeImage ? "border-[#1473EA] ring-2 ring-[#1473EA]/20 bg-[#EFF6FF]" : "border-[#E2E8F0] bg-[#F8FAFC]"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
              <div className={cn("relative min-w-0 flex-1 overflow-hidden rounded-xl border transition-colors", imgBg.className)}>
                <div className="aspect-square">
                  {images[activeImage] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={images[activeImage].url}
                      alt={product.name}
                      className="h-full w-full object-contain p-6 sm:p-10"
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setFullscreen(true)}
                  className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 border border-[#E2E8F0] px-3 py-1.5 text-xs font-bold text-[#111827] shadow-xs backdrop-blur-md"
                >
                  <ZoomIn className="h-3.5 w-3.5 text-[#1473EA]" /> Zoom
                </button>
                {product.model3dUrl && (
                  <a
                    href={product.model3dUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute bottom-3 left-3 rounded-full bg-[#1473EA] px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:bg-[#0F5EC7]"
                  >
                    VIEW IN 3D
                  </a>
                )}
              </div>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto sm:hidden">
              {images.map((img, i) => (
                <button
                  key={`${img.url}-m-${i}`}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "h-14 w-14 shrink-0 overflow-hidden rounded-lg border p-1",
                    i === activeImage ? "border-[#1473EA] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-[#F8FAFC]"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Buy box */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-6 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#1473EA]">
              {product.brand}
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
              {product.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#16A34A] px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
                {(product.averageRating || 0).toFixed(1)} <Star className="h-3 w-3 fill-white" />
              </span>
              <span className="text-[#64748B] font-medium">
                {(product.reviewCount || 0).toLocaleString("en-IN")} Ratings & Reviews
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-end gap-3">
              <p className="text-3xl font-bold text-[#111827]">{formatCurrency(product.price)}</p>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <p className="text-lg text-[#94A3B8] line-through">
                    {formatCurrency(product.compareAtPrice)}
                  </p>
                  {discount ? (
                    <p className="text-base font-bold text-[#16A34A]">{discount}% OFF</p>
                  ) : null}
                </>
              )}
            </div>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[#16A34A]">
              Special Price
            </p>

            <div className="mt-5 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-3.5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#15803D]">
                Available Offers
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-[#111827]">
                {(product.offers?.length
                  ? product.offers
                  : [
                      "Bank Offer — 5% instant discount on select cards",
                      "UPI Offer — Extra ₹250 off on first UPI payment",
                      "No Cost EMI available on orders above ₹10,000",
                      "Free Delivery on this item",
                    ]
                ).map((offer) => (
                  <li key={offer} className="flex gap-2 font-medium">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
                    {offer}
                  </li>
                ))}
              </ul>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-[#f5f5f7] p-3">
                <dt className="text-xs text-foreground/45">Condition</dt>
                <dd className="mt-1 font-semibold">
                  {STATUS_LABELS[product.condition] || product.condition}
                </dd>
              </div>
              <div className="rounded-lg bg-[#f5f5f7] p-3">
                <dt className="text-xs text-foreground/45">Battery Health</dt>
                <dd className="mt-1 font-semibold">
                  {product.batteryHealth != null ? `${product.batteryHealth}%` : "N/A"}
                </dd>
              </div>
              <div className="rounded-lg bg-[#f5f5f7] p-3">
                <dt className="text-xs text-foreground/45">RAM</dt>
                <dd className="mt-1 font-semibold">{ram || product.specifications?.ram || "—"}</dd>
              </div>
              <div className="rounded-lg bg-[#f5f5f7] p-3">
                <dt className="text-xs text-foreground/45">Storage</dt>
                <dd className="mt-1 font-semibold">
                  {storage || product.specifications?.storage || "—"}
                </dd>
              </div>
              <div className="rounded-lg bg-[#f5f5f7] p-3">
                <dt className="text-xs text-foreground/45">Warranty</dt>
                <dd className="mt-1 font-semibold">
                  {product.warrantyMonths ? `${product.warrantyMonths} Months` : "No Warranty"}
                </dd>
              </div>
              <div className="rounded-lg bg-[#f5f5f7] p-3">
                <dt className="text-xs text-foreground/45">Stock</dt>
                <dd className={cn("mt-1 font-semibold", inStock ? "text-emerald-600" : "text-red-500")}>
                  {inStock ? "In Stock" : "Out of Stock"}
                </dd>
              </div>
            </dl>

            {(product.availableColors?.length || 0) > 0 && (
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-foreground/45">Color</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.availableColors!.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-sm font-semibold",
                        color === c ? "border-[#0071e3] bg-[#0071e3]/10 text-[#0071e3]" : "border-black/10"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(product.availableStorage?.length || 0) > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-foreground/45">Storage</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.availableStorage!.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStorage(s)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-sm font-semibold",
                        storage === s ? "border-[#0071e3] bg-[#0071e3]/10 text-[#0071e3]" : "border-black/10"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(product.availableRam?.length || 0) > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-foreground/45">RAM</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.availableRam!.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRam(r)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-sm font-semibold",
                        ram === r ? "border-[#0071e3] bg-[#0071e3]/10 text-[#0071e3]" : "border-black/10"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground/45">Delivery</p>
              <div className="mt-2 flex gap-2">
                <input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter Pincode"
                  className="h-10 flex-1 rounded-lg border border-black/10 px-3 text-sm outline-none focus:border-[#0071e3]/40"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (pincode.length !== 6) {
                      setDeliveryMsg("Enter a valid 6-digit pincode");
                      return;
                    }
                    setDeliveryMsg(
                      product.deliveryInfo ||
                        `Delivery available to ${pincode} in 2–4 days`
                    );
                  }}
                  className="h-10 rounded-lg bg-foreground px-4 text-sm font-bold text-white"
                >
                  Check
                </button>
              </div>
              {deliveryMsg && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-foreground/65">
                  <Truck className="h-4 w-4 text-[#0071e3]" /> {deliveryMsg}
                </p>
              )}
            </div>

            <div className="mt-5 flex items-center gap-3">
              <p className="text-sm font-semibold text-foreground/60">Quantity</p>
              <div className="inline-flex items-center rounded-lg border border-black/10">
                <button
                  type="button"
                  className="px-3 py-2"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-8 text-center text-sm font-bold">{qty}</span>
                <button
                  type="button"
                  className="px-3 py-2"
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  disabled={qty >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-5 hidden gap-3 sm:flex">
              <button
                type="button"
                disabled={!inStock}
                onClick={addToCart}
                className="h-12 flex-1 rounded-lg border-2 border-[#0071e3] text-sm font-bold text-[#0071e3] disabled:opacity-40"
              >
                ADD TO CART
              </button>
              <button
                type="button"
                disabled={!inStock}
                onClick={() => {
                  addToCart();
                  router.push("/cart");
                }}
                className="h-12 flex-1 rounded-lg bg-[#0071e3] text-sm font-bold text-white disabled:opacity-40"
              >
                {inStock ? "BUY NOW" : "OUT OF STOCK"}
              </button>
              <button
                type="button"
                onClick={() => {
                  wishlist.toggle({
                    productId: product._id,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    image: product.images?.[0]?.url,
                  });
                  toast.success(wished ? "Removed from wishlist" : "Saved to wishlist");
                }}
                className={cn(
                  "inline-flex h-12 w-12 items-center justify-center rounded-lg border",
                  wished ? "border-red-200 bg-red-50 text-red-500" : "border-black/10"
                )}
              >
                <Heart className={cn("h-5 w-5", wished && "fill-current")} />
              </button>
            </div>

            <p className="mt-4 flex items-center gap-2 text-sm text-foreground/60">
              <ShieldCheck className="h-4 w-4 text-[#0071e3]" />
              {product.returnPolicy || "7-day replacement on manufacturing defects"}
            </p>
          </div>
        </div>

        {/* Highlights */}
        <section className="mt-4 rounded-xl border border-black/[0.06] bg-white p-4 sm:p-6">
          <h2 className="text-lg font-bold">Product Highlights</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {(product.highlights?.length
              ? product.highlights
              : [
                  product.specifications?.storage && `${product.specifications.storage} Storage`,
                  product.specifications?.ram && `${product.specifications.ram} RAM`,
                  product.batteryHealth != null && `${product.batteryHealth}% Battery Health`,
                  STATUS_LABELS[product.condition],
                  product.warrantyMonths ? `${product.warrantyMonths} Months Warranty` : null,
                  "Fully Tested",
                  "Unlocked",
                  "Quality Checked by HMC",
                ].filter(Boolean) as string[]
            ).map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-foreground/75">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0071e3]" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Specs */}
        <section className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-7 shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3 mb-6">
            <span className="h-5 w-1.5 rounded-full bg-[#1473EA]" />
            <h2 className="text-lg font-bold text-[#111827]">Technical Specifications</h2>
          </div>
          <div className="space-y-6">
            {specGroups.map((group) => {
              const specHeaderTheme: Record<string, { bg: string; text: string; border: string }> = {
                General: { bg: "bg-[#EFF6FF]", text: "text-[#1473EA]", border: "border-[#BFDBFE]" },
                Display: { bg: "bg-[#ECFEFF]", text: "text-[#00B8D9]", border: "border-[#CFFAFE]" },
                Performance: { bg: "bg-[#EEF2FF]", text: "text-[#4F46E5]", border: "border-[#C7D2FE]" },
                Memory: { bg: "bg-[#EEF2FF]", text: "text-[#4F46E5]", border: "border-[#C7D2FE]" },
                Camera: { bg: "bg-[#F5F3FF]", text: "text-[#7C3AED]", border: "border-[#DDD6FE]" },
                Battery: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", border: "border-[#BBF7D0]" },
                Connectivity: { bg: "bg-[#EFF6FF]", text: "text-[#1473EA]", border: "border-[#BFDBFE]" },
                Physical: { bg: "bg-[#F8FAFC]", text: "text-[#111827]", border: "border-[#E2E8F0]" },
                Warranty: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", border: "border-[#BBF7D0]" },
              };
              const theme = specHeaderTheme[group.title] || { bg: "bg-[#EFF6FF]", text: "text-[#1473EA]", border: "border-[#BFDBFE]" };

              return (
                <div key={group.title}>
                  <div className={cn("inline-flex items-center rounded-lg border px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2", theme.bg, theme.text, theme.border)}>
                    {group.title}
                  </div>
                  <dl className="overflow-hidden rounded-xl border border-[#E2E8F0]">
                    {group.rows.map(([k, v], i) => (
                      <div
                        key={k}
                        className={cn(
                          "grid grid-cols-2 text-sm",
                          i % 2 === 0 ? "bg-[#F8FAFC]" : "bg-white"
                        )}
                      >
                        <dt className="border-r border-[#E2E8F0] px-3.5 py-2.5 font-semibold text-[#64748B]">{k}</dt>
                        <dd className="px-3.5 py-2.5 font-bold text-[#111827]">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              );
            })}
          </div>
        </section>

        {/* Used phone condition details */}
        {product.condition !== "new" && product.deviceCondition && (
          <section className="mt-4 rounded-xl border border-black/[0.06] bg-white p-4 sm:p-6">
            <h2 className="text-lg font-bold">Device Condition Report</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(product.deviceCondition)
                .filter(([, v]) => v !== undefined && v !== null && v !== "")
                .map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-[#f5f5f7] p-3 text-sm">
                    <dt className="capitalize text-foreground/45">{k.replace(/([A-Z])/g, " $1")}</dt>
                    <dd className="mt-1 font-semibold">
                      {typeof v === "boolean" ? (v ? "Yes" : "No") : String(v)}
                    </dd>
                  </div>
                ))}
            </dl>
          </section>
        )}

        {/* Seller */}
        <section className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-7 shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3 mb-4">
            <span className="h-5 w-1.5 rounded-full bg-[#1473EA]" />
            <h2 className="text-lg font-bold text-[#111827]">Seller Information</h2>
          </div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-base font-bold text-[#111827]">{product.seller?.name || "HMC Mobile Store"}</p>
              <p className="mt-1 text-sm font-bold text-[#F59E0B]">
                {starsLabel(product.seller?.rating || 4.7)} {(product.seller?.rating || 4.7).toFixed(1)}
              </p>
              <p className="mt-1 text-sm text-[#64748B] font-medium">
                {(product.seller?.ratingCount || 2840).toLocaleString("en-IN")}+ Ratings
                {product.seller?.verified !== false && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] px-2.5 py-0.5 text-xs font-bold text-[#16A34A]">
                    Verified Seller ✓
                  </span>
                )}
              </p>
              <p className="mt-2 text-sm text-[#64748B]">
                Location: {product.seller?.location || "India"} · Since{" "}
                {product.seller?.sinceYear || 2019} ·{" "}
                {(product.seller?.productsSold || 12000).toLocaleString("en-IN")} products sold
              </p>
              <p className="mt-2 text-sm text-[#64748B]">
                Return Policy: {product.seller?.returnPolicy || product.returnPolicy}
              </p>
            </div>
            <Link
              href="/about"
              className="rounded-xl border border-[#1473EA] bg-white px-5 py-2 text-sm font-bold text-[#1473EA] hover:bg-[#EFF6FF] transition-colors"
            >
              VIEW SELLER
            </Link>
          </div>
        </section>

        {/* Reviews */}
        <section className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-7 shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3 mb-6">
            <span className="h-5 w-1.5 rounded-full bg-[#7C3AED]" />
            <h2 className="text-lg font-bold text-[#111827]">Ratings & Reviews</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-center">
              <p className="text-5xl font-extrabold text-[#111827]">{(product.averageRating || 0).toFixed(1)}</p>
              <p className="mt-1 text-base text-[#F59E0B]">{starsLabel(product.averageRating || 0)}</p>
              <p className="mt-1 text-xs font-semibold text-[#64748B]">
                {(product.reviewCount || 0).toLocaleString("en-IN")} Verified Reviews
              </p>
              <div className="mt-5 space-y-2 text-left">
                {ratingBars.map((row) => (
                  <div key={row.label} className="flex items-center gap-2 text-xs">
                    <span className="w-8 font-bold text-[#111827]">{row.label}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#E2E8F0]">
                      <div className={cn("h-full rounded-full transition-all", row.barColor)} style={{ width: `${row.pct}%` }} />
                    </div>
                    <span className="w-8 text-right font-medium text-[#64748B]">{row.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {(product.reviews || []).length ? (
                product.reviews!.map((review, idx) => (
                  <article key={review._id || idx} className="border-b border-[#E2E8F0] pb-4 last:border-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#16A34A] px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
                        {review.rating} ★
                      </span>
                      <p className="font-bold text-[#111827]">{review.title || "Customer review"}</p>
                      {review.verified && (
                        <span className="rounded-full bg-[#F0FDF4] border border-[#BBF7D0] px-2 py-0.5 text-xs font-bold text-[#16A34A]">
                          Verified Purchase ✓
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{review.text}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#94A3B8]">
                      <span className="font-semibold text-[#111827]">{review.name}</span>
                      {review.createdAt && <span>{formatDate(review.createdAt)}</span>}
                      <button type="button" className="font-bold text-[#1473EA] hover:underline">
                        Helpful ({review.helpful || 0})
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <p className="text-sm font-medium text-[#64748B]">No reviews yet for this product.</p>
              )}
            </div>
          </div>
        </section>

        {/* Q&A */}
        <section className="mt-4 rounded-xl border border-black/[0.06] bg-white p-4 sm:p-6">
          <h2 className="text-lg font-bold">Questions & Answers</h2>
          <div className="mt-4 space-y-4">
            {(product.questions || []).map((qa, idx) => (
              <div key={qa._id || idx} className="rounded-lg bg-[#f5f5f7] p-3 text-sm">
                <p className="font-semibold">Q: {qa.question}</p>
                {qa.answer ? (
                  <p className="mt-1 text-foreground/70">A: {qa.answer}</p>
                ) : (
                  <p className="mt-1 text-foreground/45">Awaiting seller answer</p>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about this product"
              className="h-10 flex-1 rounded-lg border border-black/10 px-3 text-sm outline-none focus:border-[#0071e3]/40"
            />
            <button
              type="button"
              onClick={() => {
                if (!question.trim()) return;
                toast.success("Question submitted — seller will respond soon");
                setQuestion("");
              }}
              className="h-10 rounded-lg bg-foreground px-4 text-sm font-bold text-white"
            >
              ASK A QUESTION
            </button>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-4">
            <h2 className="mb-3 text-lg font-bold">Similar Products</h2>
            <div className="space-y-3">
              {related.slice(0, 4).map((p) => (
                <MarketplaceProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

        {related.length > 4 && (
          <section className="mt-4">
            <h2 className="mb-3 text-lg font-bold">You May Also Like</h2>
            <div className="space-y-3">
              {related.slice(4, 8).map((p) => (
                <MarketplaceProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

        {recent.length > 0 && (
          <section className="mt-4 rounded-xl border border-black/[0.06] bg-white p-4 sm:p-6">
            <h2 className="text-lg font-bold">Recently Viewed</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {recent.map((r) => (
                <Link
                  key={r._id}
                  href={`/product/${r.slug}`}
                  className="rounded-lg border border-black/[0.06] p-2 hover:shadow-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.image}
                    alt={r.name}
                    className="aspect-square w-full rounded bg-[#f5f5f7] object-contain p-2"
                  />
                  <p className="mt-2 truncate text-xs font-semibold">{r.name}</p>
                  <p className="text-sm font-bold">{formatCurrency(r.price)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white p-3 sm:hidden">
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!inStock}
            onClick={addToCart}
            className="h-11 flex-1 rounded-lg border-2 border-[#0071e3] text-sm font-bold text-[#0071e3] disabled:opacity-40"
          >
            ADD TO CART
          </button>
          <button
            type="button"
            disabled={!inStock}
            onClick={() => {
              addToCart();
              router.push("/cart");
            }}
            className="h-11 flex-1 rounded-lg bg-[#0071e3] text-sm font-bold text-white disabled:opacity-40"
          >
            {inStock ? "BUY NOW" : "OUT OF STOCK"}
          </button>
        </div>
      </div>

      {fullscreen && images[activeImage] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-bold"
            onClick={() => setFullscreen(false)}
          >
            Close
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[activeImage].url}
            alt={product.name}
            className="max-h-[90vh] max-w-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
