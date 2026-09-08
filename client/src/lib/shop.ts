export type MarketplaceProduct = {
  _id: string;
  slug: string;
  name: string;
  brand: string;
  model?: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  discountPercent?: number;
  condition: string;
  stock: number;
  warrantyMonths?: number;
  batteryHealth?: number;
  productType?: string;
  averageRating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
  images: { url: string; isPrimary?: boolean }[];
  specifications?: Record<string, string | undefined>;
  deviceCondition?: Record<string, string | boolean | undefined>;
  highlights?: string[];
  offers?: string[];
  seller?: {
    name?: string;
    rating?: number;
    ratingCount?: number;
    verified?: boolean;
    location?: string;
    sinceYear?: number;
    productsSold?: number;
    returnPolicy?: string;
    warrantyNote?: string;
  };
  deliveryInfo?: string;
  returnPolicy?: string;
  availableColors?: string[];
  availableStorage?: string[];
  availableRam?: string[];
  model3dUrl?: string;
  ratingBreakdown?: {
    five?: number;
    four?: number;
    three?: number;
    two?: number;
    one?: number;
  };
  reviews?: {
    _id?: string;
    name: string;
    rating: number;
    title?: string;
    text: string;
    verified?: boolean;
    helpful?: number;
    createdAt?: string;
  }[];
  questions?: {
    _id?: string;
    question: string;
    answer?: string;
    askedBy?: string;
    answeredBy?: string;
    createdAt?: string;
  }[];
  sku?: string;
};

export const SHOP_BRANDS = [
  "Apple",
  "Samsung",
  "OnePlus",
  "Google",
  "Xiaomi",
  "Vivo",
  "Oppo",
  "Realme",
  "Motorola",
  "Nothing",
  "boAt",
  "Spigen",
] as const;

export const PRICE_PRESETS = [
  { id: "u10", label: "Under ₹10,000", min: 0, max: 9999 },
  { id: "10-20", label: "₹10,000 – ₹20,000", min: 10000, max: 20000 },
  { id: "20-30", label: "₹20,000 – ₹30,000", min: 20000, max: 30000 },
  { id: "30-50", label: "₹30,000 – ₹50,000", min: 30000, max: 50000 },
  { id: "a50", label: "Above ₹50,000", min: 50001, max: undefined },
] as const;

export const CONDITION_FILTERS = [
  { value: "new", label: "Brand New" },
  { value: "used_like_new", label: "Like New" },
  { value: "used_good", label: "Good" },
  { value: "used_fair", label: "Fair" },
  { value: "refurbished", label: "Refurbished" },
] as const;

export const RAM_FILTERS = ["4GB", "6GB", "8GB", "12GB", "16GB"] as const;
export const STORAGE_FILTERS = ["64GB", "128GB", "256GB", "512GB", "1TB"] as const;
export const BATTERY_FILTERS = [
  { value: 80, label: "80%+" },
  { value: 90, label: "90%+" },
  { value: 95, label: "95%+" },
  { value: 100, label: "100%" },
] as const;
export const WARRANTY_FILTERS = [
  { value: 0, label: "No Warranty" },
  { value: 3, label: "3 Months" },
  { value: 6, label: "6 Months" },
  { value: 12, label: "1 Year" },
] as const;
export const RATING_FILTERS = [
  { value: 4, label: "4★ & above" },
  { value: 3, label: "3★ & above" },
] as const;
export const CATEGORY_FILTERS = [
  { value: "phone", label: "Phones (New)" },
  { value: "old-phone", label: "Old Phones (Used / Refurbished)" },
  { value: "accessories", label: "Accessories" },
  { value: "mac", label: "Mac" },
] as const;

export const SORT_OPTIONS = [
  { value: "popularity", label: "Popularity" },
  { value: "price_asc", label: "Price — Low to High" },
  { value: "price_desc", label: "Price — High to Low" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Rating" },
  { value: "discount", label: "Discount" },
] as const;

export function calcDiscount(price: number, mrp?: number) {
  if (!mrp || mrp <= price) return null;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function starsLabel(rating = 0) {
  const full = Math.round(rating);
  return "★".repeat(Math.min(5, Math.max(0, full))) + "☆".repeat(Math.max(0, 5 - full));
}
