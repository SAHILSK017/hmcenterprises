import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";
import { getProductImageBgStyle } from "@/lib/product-image-tint";

export type ShopProduct = {
  _id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  compareAtPrice?: number;
  condition: string;
  images: { url: string }[];
  stock: number;
  isFeatured?: boolean;
  warrantyMonths?: number;
  specifications?: {
    storage?: string;
    color?: string;
    ram?: string;
  };
};

function discountPercent(price: number, compareAt?: number) {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function ProductCard({ product }: { product: ShopProduct }) {
  const image = product.images?.[0]?.url;
  const discount = discountPercent(product.price, product.compareAtPrice);
  const storage = product.specifications?.storage;
  const outOfStock = product.stock <= 0;
  const imgBg = getProductImageBgStyle(product);

  const getConditionBadgeStyle = (cond: string) => {
    switch (cond) {
      case "new":
        return "bg-[#F0FDFA] text-[#0D9488] border-[#99F6E4]";
      case "refurbished":
        return "bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]";
      default:
        return "bg-[#ECFEFF] text-[#00B8D9] border-[#CFFAFE]";
    }
  };

  return (
    <Link
      href={`/shop/${product.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(17,24,39,0.04)] transition-all duration-300 ease-out",
        "hover:-translate-y-1.5 hover:border-[#0D9488]/50 hover:shadow-[0_16px_34px_-6px_rgba(13,148,136,0.18)]"
      )}
    >
      <div className={cn("relative aspect-[4/5] overflow-hidden border-b transition-colors duration-300", imgBg.className)}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-contain p-6 transition-transform duration-500 ease-out group-hover:scale-108 sm:p-8"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#64748B]">
            No image
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.isFeatured && (
            <span className="rounded-full bg-[#0D9488] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs animate-pulse-glow">
              Featured
            </span>
          )}
          {discount != null && (
            <span className="rounded-full bg-[#F0FDF4] border border-[#BBF7D0] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#16A34A] shadow-xs">
              {discount}% off
            </span>
          )}
        </div>

        <span className={cn("absolute right-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-xs backdrop-blur-md", getConditionBadgeStyle(product.condition))}>
          {STATUS_LABELS[product.condition] ?? product.condition}
        </span>

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[2px]">
            <span className="rounded-full bg-[#EF4444] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5 bg-white">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0D9488]">
          {product.brand}
        </p>
        <h3 className="mt-1.5 line-clamp-2 min-h-[2.75rem] text-[15px] font-bold leading-snug tracking-tight text-[#111827] group-hover:text-[#0D9488] transition-colors sm:text-base">
          {product.name}
        </h3>

        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-[#64748B]">
          {storage && (
            <span className="rounded-md bg-[#EEF3F8] px-2 py-0.5 font-semibold text-[#111827]">{storage}</span>
          )}
          {product.specifications?.color && (
            <span className="rounded-md bg-[#EEF3F8] px-2 py-0.5 font-semibold text-[#111827]">
              {product.specifications.color}
            </span>
          )}
          {product.warrantyMonths ? (
            <span className="rounded-md bg-[#F0FDF4] border border-[#BBF7D0] px-2 py-0.5 font-semibold text-[#16A34A]">
              {product.warrantyMonths} mo warranty
            </span>
          ) : null}
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-lg font-bold tracking-tight text-[#111827] sm:text-xl">
                {formatCurrency(product.price)}
              </p>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <p className="mt-0.5 text-xs text-[#94A3B8] line-through">
                  {formatCurrency(product.compareAtPrice)}
                </p>
              )}
            </div>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#0D9488] text-white shadow-xs transition-all duration-300 group-hover:bg-[#0F766E] group-hover:scale-110 group-hover:shadow-[0_4px_14px_rgba(13,148,136,0.35)] group-hover:rotate-6 active:scale-95">
              <ShoppingBag className="h-4 w-4" strokeWidth={2} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
