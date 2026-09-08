import Link from "next/link";
import { Heart, ShoppingCart, Zap } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/shop/cart-context";
import { useWishlist } from "@/components/shop/wishlist-context";
import { cn, formatCurrency } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";
import {
  calcDiscount,
  starsLabel,
  type MarketplaceProduct,
} from "@/lib/shop";
import { getProductImageBgStyle } from "@/lib/product-image-tint";

export function MarketplaceProductCard({ product }: { product: MarketplaceProduct }) {
  const { addItem } = useCart();
  const wishlist = useWishlist();
  const image = product.images?.[0]?.url;
  const secondary = product.images?.[1]?.url;
  const discount = product.discountPercent || calcDiscount(product.price, product.compareAtPrice);
  const wished = wishlist.has(product._id);
  const inStock = product.stock > 0;
  const imgBg = getProductImageBgStyle(product);

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image,
      slug: product.slug,
      condition: product.condition,
    });
    toast.success("Added to cart");
  };

  const buyNow = (e: React.MouseEvent) => {
    addToCart(e);
    window.location.href = "/cart";
  };

  const toggleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    wishlist.toggle({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image,
    });
    toast.success(wished ? "Removed from wishlist" : "Saved to wishlist");
  };

  return (
    <article className="group rounded-xl border border-[#E2E8F0] bg-white p-3 shadow-[0_1px_3px_rgba(17,24,39,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-[#0D9488]/40 hover:shadow-[0_12px_28px_rgba(13,148,136,0.12)] sm:p-4">
      <div className="flex gap-3 sm:gap-5">
        <Link
          href={`/product/${product.slug}`}
          className={cn("relative h-28 w-28 shrink-0 overflow-hidden rounded-lg border transition-colors sm:h-36 sm:w-36", imgBg.className)}
        >
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={product.name}
              loading="lazy"
              className={cn(
                "h-full w-full object-contain p-2 transition-opacity duration-300",
                secondary && "group-hover:opacity-0"
              )}
            />
          )}
          {secondary && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={secondary}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-contain p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#0D9488]">
                {product.brand}
              </p>
              <Link
                href={`/product/${product.slug}`}
                className="mt-0.5 block truncate text-[15px] font-bold text-[#111827] hover:text-[#0D9488] sm:text-base"
              >
                {product.name}
              </Link>
            </div>
            <button
              type="button"
              onClick={toggleWish}
              className={cn(
                "rounded-full border p-2 transition-colors",
                wished
                  ? "border-red-200 bg-red-50 text-red-500"
                  : "border-[#E2E8F0] text-[#64748B] hover:border-red-200 hover:text-red-500"
              )}
              aria-label="Wishlist"
            >
              <Heart className={cn("h-4 w-4", wished && "fill-current")} />
            </button>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#64748B]">
            <span className="font-semibold text-[#F59E0B] flex items-center gap-1">
              {starsLabel(product.averageRating || 0)}{" "}
              <span className="text-[#111827] font-bold">{(product.averageRating || 0).toFixed(1)}</span>
            </span>
            <span>{(product.reviewCount || 0).toLocaleString("en-IN")} Reviews</span>
            <span className="rounded-md bg-[#EEF3F8] px-2 py-0.5 font-bold text-[#111827]">
              {STATUS_LABELS[product.condition] ?? product.condition}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#64748B]">
            {product.specifications?.storage && <span>{product.specifications.storage}</span>}
            {product.specifications?.ram && <span>{product.specifications.ram} RAM</span>}
            {typeof product.batteryHealth === "number" && (
              <span>Battery Health: {product.batteryHealth}%</span>
            )}
            {typeof product.warrantyMonths === "number" && (
              <span>
                {product.warrantyMonths === 0
                  ? "No Warranty"
                  : `${product.warrantyMonths} Months Warranty`}
              </span>
            )}
            <span className={inStock ? "font-bold text-[#16A34A]" : "font-bold text-[#EF4444]"}>
              {inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-bold tracking-tight text-[#111827]">
                  {formatCurrency(product.price)}
                </p>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <p className="text-sm text-[#94A3B8] line-through">
                    {formatCurrency(product.compareAtPrice)}
                  </p>
                )}
                {discount ? (
                  <p className="text-sm font-bold text-[#16A34A]">{discount}% OFF</p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!inStock}
                onClick={addToCart}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#0D9488] bg-white px-3 text-xs font-bold text-[#0D9488] transition-all duration-200 hover:bg-[#F0FDFA] hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                ADD TO CART
              </button>
              <button
                type="button"
                disabled={!inStock}
                onClick={buyNow}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#0D9488] px-3 text-xs font-bold text-white transition-all duration-200 hover:bg-[#0F766E] hover:-translate-y-0.5 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 shadow-xs"
              >
                <Zap className="h-3.5 w-3.5" />
                BUY NOW
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
