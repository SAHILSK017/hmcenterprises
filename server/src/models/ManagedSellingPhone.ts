import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, models, model } = mongoose;

export const MANAGED_SELLING_STATUSES = [
  "procured",
  "qc_inspection",
  "refurbishing",
  "ready_for_sale",
  "listed",
  "sold",
] as const;

export type ManagedSellingStatus = (typeof MANAGED_SELLING_STATUSES)[number];

const StatusHistorySchema = new Schema(
  {
    status: { type: String, required: true },
    note: String,
    changedBy: { type: Schema.Types.ObjectId, ref: "User" },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ManagedSellingPhoneSchema = new Schema(
  {
    managedId: { type: String, required: true, unique: true, index: true },
    intakeType: {
      type: String,
      enum: ["imported_from_sell", "direct_walkin"],
      default: "direct_walkin",
      index: true,
    },
    sellRequest: { type: Schema.Types.ObjectId, ref: "SellRequest", sparse: true },
    sellRequestId: { type: String, index: true },
    convertedProduct: { type: Schema.Types.ObjectId, ref: "Product", sparse: true },

    device: {
      brand: { type: String, required: true, index: true },
      model: { type: String, required: true },
      storage: { type: String, default: "128GB" },
      ram: String,
      color: String,
      imei: { type: String, default: "" },
      imei2: String,
      serialNumber: String,
      batteryHealth: { type: Number, min: 0, max: 100 },
      condition: {
        type: String,
        enum: ["excellent", "good", "fair", "poor"],
        default: "good",
      },
      grade: { type: String, default: "A" },
      checklist: {
        screen: { type: String, default: "working" },
        body: { type: String, default: "minor_wear" },
        camera: { type: String, default: "working" },
        battery: { type: String, default: "good" },
        charging: { type: String, default: "working" },
        displayWorking: { type: Boolean, default: true },
        biometricsWorking: { type: Boolean, default: true },
        cameraWorking: { type: Boolean, default: true },
        powersOn: { type: Boolean, default: true },
      },
      images: [
        {
          url: String,
          publicId: String,
        },
      ],
    },

    pricing: {
      purchasePrice: { type: Number, required: true, default: 0 },
      estimatedRepairCost: { type: Number, default: 0 },
      targetSellingPrice: { type: Number, default: 0 },
      actualSellingPrice: Number,
    },

    customer: {
      name: { type: String, required: true, index: true },
      phone: { type: String, required: true, index: true },
      email: String,
      address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
      },
      aadhaar: {
        number: { type: String, default: "" },
        frontImage: String,
        backImage: String,
        photoFrontUrl: String,
        photoBackUrl: String,
        verified: { type: Boolean, default: false },
        verifiedAt: Date,
      },
      pan: {
        number: { type: String, default: "" },
        image: String,
        photoUrl: String,
        verified: { type: Boolean, default: false },
        verifiedAt: Date,
      },
      payout: {
        method: {
          type: String,
          enum: ["upi", "bank_transfer", "cash"],
          default: "upi",
        },
        upiId: String,
        accountNumber: String,
        ifsc: String,
        transactionRef: String,
        paidAt: Date,
        status: {
          type: String,
          enum: ["pending", "processing", "paid", "completed", "failed"],
          default: "pending",
        },
      },
      declarationAccepted: { type: Boolean, default: true },
    },

    status: {
      type: String,
      enum: MANAGED_SELLING_STATUSES,
      default: "procured",
      index: true,
    },
    statusHistory: { type: [StatusHistorySchema], default: [] },
    notes: String,
    intakeDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ManagedSellingPhoneSchema.index({ "device.brand": 1, status: 1 });
ManagedSellingPhoneSchema.index({ "customer.phone": 1, createdAt: -1 });

ManagedSellingPhoneSchema.pre("save", function () {
  if (this.isNew) {
    this.set("statusHistory", [
      {
        status: this.status || "procured",
        note: "Device intake recorded",
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

export type IManagedSellingPhone = InferSchemaType<typeof ManagedSellingPhoneSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ManagedSellingPhone =
  models.ManagedSellingPhone || model("ManagedSellingPhone", ManagedSellingPhoneSchema);
