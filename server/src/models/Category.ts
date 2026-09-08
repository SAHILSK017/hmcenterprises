import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, models, model } = mongoose;

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    image: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const BrandSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    logo: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type ICategory = InferSchemaType<typeof CategorySchema> & {
  _id: mongoose.Types.ObjectId;
};
export type IBrand = InferSchemaType<typeof BrandSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Category = models.Category || model("Category", CategorySchema);
export const Brand = models.Brand || model("Brand", BrandSchema);
