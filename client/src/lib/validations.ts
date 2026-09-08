import { z } from "zod";
import {
  PRODUCT_CONDITIONS,
  PHONE_BRANDS,
  STORAGE_OPTIONS,
  RAM_OPTIONS,
  PHONE_COLORS,
} from "./constants";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const repairRequestSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile"),
  brand: z.string().min(1, "Select a brand"),
  model: z.string().min(1, "Enter model name"),
  problemCategory: z.enum([
    "screen",
    "battery",
    "charging",
    "camera",
    "speaker",
    "software",
    "water_damage",
    "other",
  ]),
  problemDescription: z.string().min(10, "Describe the issue (min 10 chars)"),
  preferredContact: z.enum(["whatsapp", "call", "either"]).default("whatsapp"),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        publicId: z.string(),
      })
    )
    .max(6)
    .optional()
    .default([]),
});

export const sellRequestSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  brand: z.enum(PHONE_BRANDS as unknown as [string, ...string[]], {
    message: "Please select a brand",
  }),
  model: z.string().min(1, "Please select or enter a model"),
  storage: z.enum(STORAGE_OPTIONS as unknown as [string, ...string[]], {
    message: "Please select storage",
  }),
  ram: z.enum(RAM_OPTIONS as unknown as [string, ...string[]]).optional(),
  color: z
    .enum(PHONE_COLORS as unknown as [string, ...string[]])
    .optional()
    .or(z.literal("")),
  imei: z.string().regex(/^\d{15}$/, "IMEI must be 15 digits").optional().or(z.literal("")),
  purchaseYear: z.string().optional(),
  overallCondition: z.enum(["excellent", "good", "fair", "poor"]),
  checklist: z.object({
    screen: z.enum(["perfect", "minor_scratches", "cracked", "broken"]),
    battery: z.enum(["excellent", "good", "needs_replacement"]),
    body: z.enum(["perfect", "minor_wear", "dents", "heavy_damage"]),
    camera: z.enum(["working", "issues", "broken"]),
    charging: z.enum(["working", "loose", "not_working"]),
    accessories: z.array(z.string()).default([]),
    billAvailable: z.boolean().default(false),
    warrantyValid: z.boolean().default(false),
    displayWorking: z.boolean().optional(),
    biometricsWorking: z.boolean().optional(),
    cameraWorking: z.boolean().optional(),
    batteryOriginal: z.boolean().optional(),
    powersOn: z.boolean().optional(),
  }),
  expectedPrice: z.number().min(0).optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        publicId: z.string(),
      })
    )
    .min(1, "Upload at least one photo")
    .max(8),
});

export const productSchema = z.object({
  name: z.string().min(2),
  brand: z.string().min(1),
  category: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().min(10),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  condition: z.enum(PRODUCT_CONDITIONS),
  stock: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(3),
  warrantyMonths: z.number().int().min(0).default(0),
  specifications: z
    .object({
      storage: z.string().optional(),
      ram: z.string().optional(),
      color: z.string().optional(),
      display: z.string().optional(),
      processor: z.string().optional(),
      battery: z.string().optional(),
      camera: z.string().optional(),
      os: z.string().optional(),
    })
    .optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        publicId: z.string(),
        isPrimary: z.boolean().optional(),
      })
    )
    .min(1),
  imei: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const addressSchema = z.object({
  label: z.enum(["home", "work", "other"]).default("home"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit mobile number required"),
  whatsapp: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit WhatsApp number required").optional().or(z.literal("")),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  line1: z.string().min(5, "Address must be at least 5 characters"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Valid 6-digit pincode required"),
  notes: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const checkoutSchema = z.object({
  address: addressSchema,
  paymentMethod: z.string().optional().default("direct"),
  couponCode: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

export const statusUpdateSchema = z.object({
  status: z.string(),
  note: z.string().optional(),
});

export const quoteSchema = z.object({
  diagnosis: z.string().min(5),
  quoteAmount: z.number().positive(),
  estimatedDays: z.number().int().positive().optional(),
});

export const offerSchema = z.object({
  amount: z.number().positive(),
  note: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
});

export const whatsappMessageSchema = z.object({
  to: z.string().regex(/^[6-9]\d{9}$/),
  message: z.string().min(1).max(4096),
  relatedModel: z.enum(["RepairRequest", "SellRequest", "Order"]).optional(),
  relatedId: z.string().optional(),
});

export type RepairRequestInput = z.infer<typeof repairRequestSchema>;
export type SellRequestInput = z.infer<typeof sellRequestSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
