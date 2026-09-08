import { connectDB } from "./db";
import { WhatsappMessage } from "../models";
import type { Types } from "mongoose";

interface SendWhatsAppParams {
  to: string;
  message: string;
  relatedModel?: "RepairRequest" | "SellRequest" | "Order";
  relatedId?: string | Types.ObjectId;
  sentBy?: string | Types.ObjectId;
}

/**
 * WhatsApp Business Cloud API is disabled.
 * Messages are stored in the database for record-keeping but never sent externally.
 */
export async function sendWhatsAppMessage({
  to,
  message,
  relatedModel,
  relatedId,
  sentBy,
}: SendWhatsAppParams) {
  await connectDB();

  const normalized = to.replace(/\D/g, "");
  const phone = normalized.length === 10 ? `91${normalized}` : normalized;

  const record = await WhatsappMessage.create({
    to: phone,
    body: message,
    direction: "outbound",
    deliveryStatus: "queued",
    relatedModel,
    relatedId,
    sentBy,
  });

  record.deliveryStatus = "sent";
  record.error = "WhatsApp API disabled — message stored locally only";
  await record.save();

  return { success: true, simulated: true, message: record };
}
