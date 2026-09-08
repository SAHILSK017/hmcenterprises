export const RECENT_KEY = "hmk-recently-viewed";

export type RecentProduct = {
  _id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  image?: string;
};

export function pushRecentlyViewed(product: RecentProduct) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const prev: RecentProduct[] = raw ? JSON.parse(raw) : [];
    const next = [product, ...prev.filter((p) => p._id !== product._id)].slice(0, 8);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getRecentlyViewed(): RecentProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
