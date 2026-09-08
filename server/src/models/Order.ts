import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, models, model } = mongoose;
import { ORDER_STATUSES, PAYMENT_STATUSES } from "../lib/constants";

const OrderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: String,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    condition: String,
    sku: String,
  },
  { _id: false }
);

const AddressSnapshotSchema = new Schema(
  {
    fullName: String,
    phone: String,
    email: String,
    whatsapp: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    notes: String,
  },
  { _id: false }
);

const StatusHistorySchema = new Schema(
  {
    status: { type: String, required: true },
    note: String,
    changedBy: { type: Schema.Types.ObjectId, ref: "User" },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: false },
    items: { type: [OrderItemSchema], required: true },
    shippingAddress: { type: AddressSnapshotSchema, required: true },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: String,
    paymentMethod: { type: String, default: "direct" },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "pending",
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending",
      index: true,
    },
    statusHistory: { type: [StatusHistorySchema], default: [] },
    trackingNumber: String,
    trackingCarrier: String,
    notes: String,
    cancelledAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true }
);

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

OrderSchema.pre("save", function () {
  if (this.isNew) {
    this.set("statusHistory", [
      {
        status: this.status || "pending",
        note: "Order placed",
        changedAt: new Date(),
      },
    ]);
  } else if (this.isModified("status")) {
    const history = (this.statusHistory ?? []) as Array<{
      status: string;
      note?: string;
      changedAt: Date;
    }>;
    history.push({
      status: this.status,
      changedAt: new Date(),
    });
    this.set("statusHistory", history);
  }
});

export type IOrder = InferSchemaType<typeof OrderSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Order = models.Order || model("Order", OrderSchema);
