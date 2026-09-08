import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, models, model } = mongoose;
import { PRODUCT_CONDITIONS } from "../lib/constants";

const ImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const SpecsSchema = new Schema(
  {
    storage: String,
    ram: String,
    color: String,
    display: String,
    displayType: String,
    resolution: String,
    refreshRate: String,
    processor: String,
    gpu: String,
    battery: String,
    batteryCapacity: String,
    charging: String,
    camera: String,
    rearCamera: String,
    frontCamera: String,
    videoRecording: String,
    os: String,
    expandableStorage: String,
    network5g: String,
    network4g: String,
    wifi: String,
    bluetooth: String,
    nfc: String,
    usb: String,
    height: String,
    width: String,
    thickness: String,
    weight: String,
    releaseYear: String,
    model: String,
  },
  { _id: false }
);

const DeviceConditionSchema = new Schema(
  {
    display: String,
    body: String,
    camera: String,
    speaker: String,
    charging: String,
    originalParts: Boolean,
    boxAvailable: Boolean,
    chargerAvailable: Boolean,
    billAvailable: Boolean,
  },
  { _id: false }
);

const SellerSchema = new Schema(
  {
    name: { type: String, default: "HMC Mobile Store" },
    rating: { type: Number, default: 4.7 },
    ratingCount: { type: Number, default: 2840 },
    verified: { type: Boolean, default: true },
    location: { type: String, default: "India" },
    sinceYear: { type: Number, default: 2019 },
    productsSold: { type: Number, default: 12000 },
    returnPolicy: { type: String, default: "7-day replacement on manufacturing defects" },
    warrantyNote: { type: String, default: "HMC warranty as listed on product" },
  },
  { _id: false }
);

const ReviewSchema = new Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: String,
    text: { type: String, required: true },
    verified: { type: Boolean, default: true },
    helpful: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const QuestionSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: String,
    askedBy: String,
    answeredBy: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    brand: { type: String, required: true, index: true },
    model: { type: String, trim: true },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    productType: {
      type: String,
      enum: ["new", "used", "refurbished", "accessory", "mac", "laptop"],
      default: "used",
      index: true,
    },
    description: { type: String, required: true },
    highlights: [{ type: String }],
    price: { type: Number, required: true, index: true },
    compareAtPrice: Number,
    discountPercent: { type: Number, default: 0, index: true },
    condition: {
      type: String,
      enum: PRODUCT_CONDITIONS,
      required: true,
      index: true,
    },
    stock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 3 },
    warrantyMonths: { type: Number, default: 0, index: true },
    batteryHealth: { type: Number, min: 0, max: 100, index: true },
    specifications: SpecsSchema,
    deviceCondition: DeviceConditionSchema,
    images: [ImageSchema],
    model3dUrl: String,
    imei: { type: String, sparse: true, select: false },
    sku: { type: String, unique: true, sparse: true },
    averageRating: { type: Number, default: 0, min: 0, max: 5, index: true },
    reviewCount: { type: Number, default: 0 },
    ratingBreakdown: {
      five: { type: Number, default: 0 },
      four: { type: Number, default: 0 },
      three: { type: Number, default: 0 },
      two: { type: Number, default: 0 },
      one: { type: Number, default: 0 },
    },
    reviews: [ReviewSchema],
    questions: [QuestionSchema],
    offers: [{ type: String }],
    seller: SellerSchema,
    deliveryInfo: { type: String, default: "Usually ships in 1–2 business days" },
    returnPolicy: { type: String, default: "7-day replacement on manufacturing defects" },
    availableColors: [{ type: String }],
    availableStorage: [{ type: String }],
    availableRam: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    soldCount: { type: Number, default: 0 },
    popularityScore: { type: Number, default: 0, index: true },
    sourceSellRequest: { type: Schema.Types.ObjectId, ref: "SellRequest" },
  },
  { timestamps: true }
);

ProductSchema.index({ brand: 1, condition: 1, price: 1 });
ProductSchema.index({ isActive: 1, isFeatured: 1, createdAt: -1 });
ProductSchema.index({ "specifications.ram": 1 });
ProductSchema.index({ "specifications.storage": 1 });
ProductSchema.index({ name: "text", brand: "text", model: "text", sku: "text", description: "text" });

export type IProduct = InferSchemaType<typeof ProductSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Product = models.Product || model("Product", ProductSchema);
