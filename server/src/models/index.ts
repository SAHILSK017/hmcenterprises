import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, models, model } = mongoose;

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: String,
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: Number,
    usageLimit: Number,
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    startsAt: { type: Date, default: Date.now },
    expiresAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const WhatsappMessageSchema = new Schema(
  {
    to: { type: String, required: true, index: true },
    from: String,
    body: { type: String, required: true },
    direction: { type: String, enum: ["outbound", "inbound"], required: true },
    deliveryStatus: {
      type: String,
      enum: ["queued", "sent", "delivered", "read", "failed"],
      default: "queued",
    },
    externalId: String,
    relatedModel: { type: String, enum: ["RepairRequest", "SellRequest", "Order"] },
    relatedId: Schema.Types.ObjectId,
    sentBy: { type: Schema.Types.ObjectId, ref: "User" },
    error: String,
  },
  { timestamps: true }
);

WhatsappMessageSchema.index({ relatedModel: 1, relatedId: 1, createdAt: -1 });

const NotificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: ["repair", "sell", "order", "system", "promo"],
      default: "system",
    },
    link: String,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ReviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: String,
    comment: String,
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

const SettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

const AuditLogSchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: String,
    meta: Schema.Types.Mixed,
    ip: String,
  },
  { timestamps: true }
);

AuditLogSchema.index({ resource: 1, createdAt: -1 });

const PaymentSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    method: { type: String, enum: ["cod", "upi", "bank"], required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    meta: Schema.Types.Mixed,
  },
  { timestamps: true }
);

export type ICoupon = InferSchemaType<typeof CouponSchema> & { _id: mongoose.Types.ObjectId };
export type IWhatsappMessage = InferSchemaType<typeof WhatsappMessageSchema> & {
  _id: mongoose.Types.ObjectId;
};
export type INotification = InferSchemaType<typeof NotificationSchema> & {
  _id: mongoose.Types.ObjectId;
};
export type IReview = InferSchemaType<typeof ReviewSchema> & { _id: mongoose.Types.ObjectId };
export type ISetting = InferSchemaType<typeof SettingSchema> & { _id: mongoose.Types.ObjectId };
export type IAuditLog = InferSchemaType<typeof AuditLogSchema> & { _id: mongoose.Types.ObjectId };
export type IPayment = InferSchemaType<typeof PaymentSchema> & { _id: mongoose.Types.ObjectId };

export const Coupon = models.Coupon || model("Coupon", CouponSchema);
export const WhatsappMessage =
  models.WhatsappMessage || model("WhatsappMessage", WhatsappMessageSchema);
export const Notification = models.Notification || model("Notification", NotificationSchema);
export const Review = models.Review || model("Review", ReviewSchema);
export const Setting = models.Setting || model("Setting", SettingSchema);
export const AuditLog = models.AuditLog || model("AuditLog", AuditLogSchema);
export const Payment = models.Payment || model("Payment", PaymentSchema);

export * from "./ManagedSellingPhone";
