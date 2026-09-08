import { Router } from "express";
import { connectDB } from "../lib/db";
import { whatsappMessageSchema } from "../lib/validations";
import { sendWhatsAppMessage } from "../lib/whatsapp";
import { RepairRequest } from "../models/RepairRequest";
import { SellRequest } from "../models/SellRequest";
import { requireAdmin } from "../middleware/auth";

const router = Router();

router.post("/", requireAdmin, async (req, res) => {
  try {
    const parsed = whatsappMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    }

    await connectDB();
    const result = await sendWhatsAppMessage({
      ...parsed.data,
      sentBy: req.user!.id,
    });

    if (parsed.data.relatedModel && parsed.data.relatedId && result.message) {
      const Model =
        parsed.data.relatedModel === "SellRequest" ? SellRequest : RepairRequest;
      await Model.findByIdAndUpdate(parsed.data.relatedId, {
        $push: {
          messages: {
            direction: "outbound",
            channel: "whatsapp",
            body: parsed.data.message,
            deliveryStatus: result.message.deliveryStatus,
            sentBy: req.user!.id,
            externalId: result.message.externalId,
            createdAt: new Date(),
          },
        },
      });
    }

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
