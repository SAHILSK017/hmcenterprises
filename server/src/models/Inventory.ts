import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, models, model } = mongoose;
import { INVENTORY_STATUSES } from "../lib/constants";

const InventorySchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    sku: { type: String, required: true, unique: true, index: true },
    imei: { type: String, sparse: true, unique: true },
    status: {
      type: String,
      enum: INVENTORY_STATUSES,
      default: "in_stock",
      index: true,
    },
    location: { type: String, default: "main" },
    costPrice: Number,
    notes: String,
  },
  { timestamps: true }
);

InventorySchema.index({ product: 1, status: 1 });

export type IInventory = InferSchemaType<typeof InventorySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Inventory = models.Inventory || model("Inventory", InventorySchema);
