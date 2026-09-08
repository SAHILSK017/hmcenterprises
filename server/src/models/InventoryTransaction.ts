import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, models, model } = mongoose;

const InventoryTransactionSchema = new Schema(
  {
    inventory: { type: Schema.Types.ObjectId, ref: "Inventory" },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    type: {
      type: String,
      enum: ["in", "out", "reserve", "unreserve", "damage", "return", "adjust"],
      required: true,
    },
    quantity: { type: Number, required: true },
    previousStock: Number,
    newStock: Number,
    referenceType: { type: String, enum: ["Order", "SellRequest", "RepairRequest", "Manual"] },
    referenceId: Schema.Types.ObjectId,
    note: String,
    performedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

InventoryTransactionSchema.index({ product: 1, createdAt: -1 });

export type IInventoryTransaction = InferSchemaType<typeof InventoryTransactionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const InventoryTransaction =
  models.InventoryTransaction || model("InventoryTransaction", InventoryTransactionSchema);
