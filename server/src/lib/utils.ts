import { Counter } from "../models/Counter";

/** Generate public IDs like REP-A3F9K / SELL-B2X7M / ORD-C9D1P */
export function generatePublicId(prefix: "REP" | "SELL" | "ORD" | "INV") {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 5; i++) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${prefix}-${suffix}`;
}

/** Sequential IDs like REP-10001, SELL-10001, ORD-10001, MSP-10001 */
export async function nextSequentialId(prefix: "REP" | "SELL" | "ORD" | "MSP") {
  const counter = await Counter.findByIdAndUpdate(
    prefix,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const seq = counter?.seq ?? 10001;
  return `${prefix}-${seq}`;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
