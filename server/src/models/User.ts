import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, models, model } = mongoose;

const AddressSchema = new Schema(
  {
    label: { type: String, enum: ["home", "work", "other"], default: "home" },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, sparse: true },
    passwordHash: { type: String, required: false },
    provider: { type: String, enum: ["credentials", "google", "github"], default: "credentials" },
    providerId: { type: String, sparse: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    avatar: String,
    addresses: [AddressSchema],
    isActive: { type: Boolean, default: true },
    whatsappOptIn: { type: Boolean, default: true },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

UserSchema.index({ role: 1, createdAt: -1 });

export type IUser = InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };

export const User = models.User || model("User", UserSchema);
