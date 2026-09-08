export const REPAIR_STATUSES = [
  "pending",
  "reviewing",
  "contacted",
  "device_received",
  "diagnosis",
  "quote_sent",
  "customer_approved",
  "repairing",
  "ready",
  "delivered",
  "completed",
  "cancelled",
] as const;

export type RepairStatus = (typeof REPAIR_STATUSES)[number];

export const SELL_STATUSES = [
  "pending",
  "under_review",
  "contacted",
  "price_offered",
  "accepted",
  "rejected",
  "device_received",
  "quality_check",
  "payment_processing",
  "completed",
  "cancelled",
] as const;

export type SellStatus = (typeof SELL_STATUSES)[number];

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
  "cod_pending",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PRODUCT_CONDITIONS = [
  "new",
  "refurbished",
  "used_like_new",
  "used_good",
  "used_fair",
] as const;

export type ProductCondition = (typeof PRODUCT_CONDITIONS)[number];

export const INVENTORY_STATUSES = [
  "in_stock",
  "reserved",
  "sold",
  "damaged",
  "returned",
] as const;

export type InventoryStatus = (typeof INVENTORY_STATUSES)[number];

export const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  reviewing: "Reviewing",
  contacted: "Contacted",
  device_received: "Device Received",
  diagnosis: "Diagnosis",
  quote_sent: "Quote Sent",
  customer_approved: "Customer Approved",
  repairing: "Repairing",
  ready: "Ready for Pickup",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
  under_review: "Under Review",
  price_offered: "Price Offered",
  accepted: "Accepted",
  rejected: "Rejected",
  quality_check: "Quality Check",
  payment_processing: "Payment Processing",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  refunded: "Refunded",
  paid: "Paid",
  failed: "Failed",
  cod_pending: "COD Pending",
  new: "Brand New",
  refurbished: "Refurbished",
  used_like_new: "Used — Like New",
  used_good: "Used — Good",
  used_fair: "Used — Fair",
  in_stock: "In Stock",
  reserved: "Reserved",
  sold: "Sold",
  damaged: "Damaged",
  returned: "Returned",
};

/** Maps status → badge color token class */
export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-status-pending/15 text-status-pending border-status-pending/30",
  reviewing: "bg-status-review/15 text-status-review border-status-review/30",
  under_review: "bg-status-review/15 text-status-review border-status-review/30",
  contacted: "bg-status-progress/15 text-status-progress border-status-progress/30",
  device_received: "bg-status-progress/15 text-status-progress border-status-progress/30",
  diagnosis: "bg-status-review/15 text-status-review border-status-review/30",
  quote_sent: "bg-status-offer/15 text-status-offer border-status-offer/30",
  price_offered: "bg-status-offer/15 text-status-offer border-status-offer/30",
  customer_approved: "bg-status-success/15 text-status-success border-status-success/30",
  accepted: "bg-status-success/15 text-status-success border-status-success/30",
  repairing: "bg-status-progress/15 text-status-progress border-status-progress/30",
  quality_check: "bg-status-progress/15 text-status-progress border-status-progress/30",
  payment_processing: "bg-status-offer/15 text-status-offer border-status-offer/30",
  ready: "bg-accent-muted text-accent-hover border-accent/30",
  delivered: "bg-status-success/15 text-status-success border-status-success/30",
  completed: "bg-status-success/15 text-status-success border-status-success/30",
  cancelled: "bg-status-danger/15 text-status-danger border-status-danger/30",
  rejected: "bg-status-danger/15 text-status-danger border-status-danger/30",
  confirmed: "bg-status-progress/15 text-status-progress border-status-progress/30",
  processing: "bg-status-progress/15 text-status-progress border-status-progress/30",
  shipped: "bg-status-offer/15 text-status-offer border-status-offer/30",
  out_for_delivery: "bg-accent-muted text-accent-hover border-accent/30",
  refunded: "bg-status-neutral/15 text-status-neutral border-status-neutral/30",
  paid: "bg-status-success/15 text-status-success border-status-success/30",
  failed: "bg-status-danger/15 text-status-danger border-status-danger/30",
  cod_pending: "bg-status-pending/15 text-status-pending border-status-pending/30",
};

export const PHONE_BRANDS = [
  "Apple",
  "Samsung",
  "Xiaomi",
  "OnePlus",
  "Vivo",
  "Oppo",
  "Realme",
  "Google",
  "Nothing",
  "Motorola",
  "Nokia",
  "Other",
] as const;

export const STORAGE_OPTIONS = ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"] as const;
export const RAM_OPTIONS = ["2GB", "3GB", "4GB", "6GB", "8GB", "12GB", "16GB"] as const;
