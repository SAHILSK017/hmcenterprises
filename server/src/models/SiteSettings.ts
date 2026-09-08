import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, models, model } = mongoose;

const SiteSettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "main" },
    yearsExperience: { type: Number, default: 0 },
    showPublicStats: { type: Boolean, default: true },
    workshopNote: {
      type: String,
      default: "Our technicians diagnose carefully, use quality parts, and test every device before return.",
    },
  },
  { timestamps: true }
);

export type ISiteSettings = InferSchemaType<typeof SiteSettingsSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SiteSettings =
  models.SiteSettings || model("SiteSettings", SiteSettingsSchema);
