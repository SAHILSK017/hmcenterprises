import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, models, model } = mongoose;
import { REPAIR_STATUSES } from "../lib/constants";

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

const RepairRequestSchema = new Schema(
  {
    repairId: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    email: String,
    phone: { type: String, required: true, index: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    problemCategory: {
      type: String,
      enum: ["screen", "battery", "charging", "camera", "speaker", "software", "water_damage", "other"],
      required: true,
    },
    problemDescription: { type: String, required: true },
    preferredContact: { type: String, enum: ["whatsapp", "call", "either"], default: "whatsapp" },
    images: [ImageSchema],
    status: {
      type: String,
      enum: REPAIR_STATUSES,
      default: "pending",
      index: true,
    },
    statusHistory: { type: [StatusHistorySchema], default: [] },
    diagnosis: String,
    quoteAmount: Number,
    estimatedDays: Number,
    messages: [MessageSchema],
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    completedAt: Date,
  },
  { timestamps: true }
);

RepairRequestSchema.index({ status: 1, createdAt: -1 });
RepairRequestSchema.index({ phone: 1, createdAt: -1 });

/** Auto-append status history on create and status changes */
RepairRequestSchema.pre("save", function () {
  if (this.isNew) {
    this.set("statusHistory", [
      {
        status: this.status || "pending",
        note: "Repair request submitted",
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

export type IRepairRequest = InferSchemaType<typeof RepairRequestSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const RepairRequest =
  models.RepairRequest || model("RepairRequest", RepairRequestSchema);
