import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, models, model } = mongoose;
import { SELL_STATUSES } from "../lib/constants";

const ImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
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

const OfferSchema = new Schema(
  {
    amount: { type: Number, required: true },
    note: String,
    offeredBy: { type: Schema.Types.ObjectId, ref: "User" },
    offeredAt: { type: Date, default: Date.now },
    expiresAt: Date,
    response: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    respondedAt: Date,
  },
  { _id: true }
);

const MessageSchema = new Schema(
  {
    direction: { type: String, enum: ["outbound", "inbound"], required: true },
    channel: { type: String, enum: ["whatsapp", "system", "note"], default: "whatsapp" },
    body: { type: String, required: true },
    sentBy: { type: Schema.Types.ObjectId, ref: "User" },
    deliveryStatus: {
      type: String,
      enum: ["queued", "sent", "delivered", "read", "failed"],
      default: "queued",
    },
    externalId: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const SellRequestSchema = new Schema(
  {
    sellId: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    email: String,
    phone: { type: String, required: true, index: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    storage: { type: String, required: true },
    ram: String,
    color: String,
    imei: String,
    purchaseYear: String,
    overallCondition: {
      type: String,
      enum: ["excellent", "good", "fair", "poor"],
      required: true,
    },
    checklist: {
      screen: { type: String, required: true },
      battery: { type: String, required: true },
      body: { type: String, required: true },
      camera: { type: String, required: true },
      charging: { type: String, required: true },
      accessories: [String],
      billAvailable: { type: Boolean, default: false },
      warrantyValid: { type: Boolean, default: false },
      displayWorking: Boolean,
      biometricsWorking: Boolean,
      cameraWorking: Boolean,
      batteryOriginal: Boolean,
      powersOn: Boolean,
    },
    expectedPrice: Number,
    images: [ImageSchema],
    status: {
      type: String,
      enum: SELL_STATUSES,
      default: "pending",
      index: true,
    },
    statusHistory: { type: [StatusHistorySchema], default: [] },
    offers: [OfferSchema],
    finalPrice: Number,
    messages: [MessageSchema],
    convertedProduct: { type: Schema.Types.ObjectId, ref: "Product" },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    completedAt: Date,
  },
  { timestamps: true }
);

SellRequestSchema.index({ status: 1, createdAt: -1 });

SellRequestSchema.pre("save", function () {
  if (this.isNew) {
    this.set("statusHistory", [
      {
        status: this.status || "pending",
        note: "Sell request submitted",
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

export type ISellRequest = InferSchemaType<typeof SellRequestSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SellRequest = models.SellRequest || model("SellRequest", SellRequestSchema);
