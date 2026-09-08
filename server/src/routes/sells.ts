import { Router } from "express";
import { connectDB } from "../lib/db";
import { SellRequest } from "../models/SellRequest";
import { sellRequestSchema, offerSchema, statusUpdateSchema } from "../lib/validations";
import { nextSequentialId } from "../lib/utils";
import { SELL_STATUSES } from "../lib/constants";
import { User } from "../models/User";
import { AuditLog } from "../models";
import { optionalAuth, requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

const lookup = (id: string) => ({
  $or: [
    { sellId: id.toUpperCase() },
    { _id: id.match(/^[a-f\d]{24}$/i) ? id : null },
  ],
});

router.post("/", optionalAuth, async (req, res) => {
  try {
    const parsed = sellRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    }
    await connectDB();
    const sellId = await nextSequentialId("SELL");
    const sell = await SellRequest.create({
      ...parsed.data,
      email: parsed.data.email || undefined,
      sellId,
      user: req.user?.id,
      status: "pending",
    });
    return res.status(201).json({ success: true, sellId: sell.sellId, id: sell._id });
  } catch (error) {
    console.error("Sell creation error:", error);
    return res.status(500).json({ error: "Failed to create sell request" });
  }
});

router.get("/", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const status = req.query.status as string | undefined;
    const q = req.query.q as string | undefined;
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Number(req.query.limit || 20));
    const filter: Record<string, unknown> = {};
    if (status === "active") {
      filter.status = { $nin: ["completed", "cancelled", "rejected"] };
    } else if (status) {
      filter.status = status;
    }
    if (q) {
      filter.$or = [
        { sellId: new RegExp(q, "i") },
        { name: new RegExp(q, "i") },
        { phone: new RegExp(q, "i") },
        { model: new RegExp(q, "i") },
        { brand: new RegExp(q, "i") },
      ];
    }
    const [items, total, activeCount, completedCount] = await Promise.all([
      SellRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      SellRequest.countDocuments(filter),
      SellRequest.countDocuments({ status: { $nin: ["completed", "cancelled", "rejected"] } }),
      SellRequest.countDocuments({ status: "completed" }),
    ]);
    return res.json({ items, total, activeCount, completedCount, page, limit });
  } catch (error) {
    console.error("Sell list error:", error);
    return res.status(500).json({ error: "Failed to fetch sell requests" });
  }
});

router.get("/mine", requireAuth, async (req, res) => {
  try {
    await connectDB();
    const user = await User.findById(req.user!.id).lean();
    const filters: any[] = [{ user: req.user!.id }];
    if (user?.phone) filters.push({ phone: user.phone });
    if (user?.email) filters.push({ email: user.email });

    const items = await SellRequest.find({ $or: filters })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.json({ items });
  } catch (error) {
    console.error("Fetch user sells error:", error);
    return res.status(500).json({ error: "Failed to fetch sell requests" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    await connectDB();
    const sell = await SellRequest.findOne(lookup(req.params.id)).lean();
    return sell ? res.json(sell) : res.status(404).json({ error: "Not found" });
  } catch (error) {
    console.error("Sell fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch sell request" });
  }
});

router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const body = req.body;
    await connectDB();
    const sell = await SellRequest.findOne(lookup(String(req.params.id)));
    if (!sell) return res.status(404).json({ error: "Not found" });

    if (body.status) {
      const status = statusUpdateSchema.safeParse(body);
      if (
        !status.success ||
        !SELL_STATUSES.includes(status.data.status as (typeof SELL_STATUSES)[number])
      ) {
        return res.status(400).json({ error: "Invalid status" });
      }
      sell.status = status.data.status as typeof sell.status;
      if (status.data.note && sell.statusHistory.length > 0) {
        sell.statusHistory[sell.statusHistory.length - 1].note = status.data.note;
      }
      if (status.data.status === "completed") {
        sell.completedAt = new Date();
      }
    }

    if (body.offer) {
      const offer = offerSchema.safeParse(body.offer);
      if (!offer.success) {
        return res.status(400).json({ error: "Invalid offer", details: offer.error.flatten() });
      }
      sell.offers.push({
        ...offer.data,
        offeredBy: req.user!.id as unknown as (typeof sell.offers)[0]["offeredBy"],
        expiresAt: offer.data.expiresAt ? new Date(offer.data.expiresAt) : undefined,
      });
      sell.status = "price_offered";
    }

    await sell.save();

    await AuditLog.create({
      actor: req.user!.id,
      action: "update",
      resource: "SellRequest",
      resourceId: sell.sellId,
      meta: body,
    });

    return res.json({ success: true, sell });
  } catch (error) {
    console.error("Sell update error:", error);
    return res.status(500).json({ error: "Failed to update sell request" });
  }
});

router.post("/:id/respond", async (req, res) => {
  try {
    const { action, offerId } = req.body;
    if (!["accept", "reject"].includes(action) || typeof offerId !== "string") {
      return res.status(400).json({ error: "Invalid response" });
    }
    await connectDB();
    const sell = await SellRequest.findOne(lookup(String(req.params.id)));
    if (!sell) return res.status(404).json({ error: "Not found" });
    const offer = sell.offers.id(offerId);
    if (!offer || offer.response !== "pending") {
      return res.status(400).json({ error: "Offer unavailable" });
    }
    offer.response = action === "accept" ? "accepted" : "rejected";
    offer.respondedAt = new Date();
    sell.status = action === "accept" ? "accepted" : "rejected";
    if (action === "accept") sell.finalPrice = offer.amount;
    await sell.save();
    return res.json({ success: true, sell });
  } catch (error) {
    console.error("Sell offer response error:", error);
    return res.status(500).json({ error: "Failed to respond to offer" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const sell = await SellRequest.findOneAndDelete(lookup(String(req.params.id)));
    if (!sell) return res.status(404).json({ error: "Sell request not found" });

    await AuditLog.create({
      actor: req.user!.id,
      action: "delete",
      resource: "SellRequest",
      resourceId: sell.sellId,
      meta: { brand: sell.brand, model: sell.model, phone: sell.phone },
    });

    return res.json({ success: true, message: `Sell request ${sell.sellId} deleted` });
  } catch (err) {
    console.error("Delete sell error:", err);
    return res.status(500).json({ error: "Failed to delete sell request" });
  }
});

export default router;
