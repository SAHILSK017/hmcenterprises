import { Router } from "express";
import { connectDB } from "../lib/db";
import { RepairRequest } from "../models/RepairRequest";
import { repairRequestSchema, statusUpdateSchema, quoteSchema } from "../lib/validations";
import { nextSequentialId } from "../lib/utils";
import { AuditLog } from "../models";
import { REPAIR_STATUSES } from "../lib/constants";
import { User } from "../models/User";
import { optionalAuth, requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

const lookup = (id: string) => ({
  $or: [
    { repairId: id.toUpperCase() },
    { _id: id.match(/^[a-f\d]{24}$/i) ? id : null },
  ],
});

router.post("/", optionalAuth, async (req, res) => {
  try {
    const parsed = repairRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    }

    await connectDB();
    const repairId = await nextSequentialId("REP");

    const repair = await RepairRequest.create({
      ...parsed.data,
      email: parsed.data.email || undefined,
      repairId,
      user: req.user?.id,
      status: "pending",
    });

    return res.status(201).json({ success: true, repairId: repair.repairId, id: repair._id });
  } catch (err) {
    console.error("Repair create error:", err);
    return res.status(500).json({ error: "Failed to create repair request" });
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
      filter.status = { $nin: ["completed", "cancelled"] };
    } else if (status) {
      filter.status = status;
    }
    if (q) {
      filter.$or = [
        { repairId: new RegExp(q, "i") },
        { phone: new RegExp(q, "i") },
        { name: new RegExp(q, "i") },
        { model: new RegExp(q, "i") },
      ];
    }

    const [items, total, activeCount, completedCount] = await Promise.all([
      RepairRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      RepairRequest.countDocuments(filter),
      RepairRequest.countDocuments({ status: { $nin: ["completed", "cancelled"] } }),
      RepairRequest.countDocuments({ status: "completed" }),
    ]);

    return res.json({ items, total, activeCount, completedCount, page, limit });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch repairs" });
  }
});

router.get("/mine", requireAuth, async (req, res) => {
  try {
    await connectDB();
    const user = await User.findById(req.user!.id).lean();
    const filters: any[] = [{ user: req.user!.id }];
    if (user?.phone) filters.push({ phone: user.phone });
    if (user?.email) filters.push({ email: user.email });

    const items = await RepairRequest.find({ $or: filters })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.json({ items });
  } catch (err) {
    console.error("Fetch user repairs error:", err);
    return res.status(500).json({ error: "Failed to fetch repairs" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    await connectDB();
    const repair = await RepairRequest.findOne(lookup(req.params.id)).lean();
    if (!repair) return res.status(404).json({ error: "Not found" });
    return res.json(repair);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch repair" });
  }
});

router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const body = req.body;
    await connectDB();

    const repair = await RepairRequest.findOne(lookup(String(req.params.id)));
    if (!repair) return res.status(404).json({ error: "Not found" });

    if (body.diagnosis !== undefined || body.quoteAmount !== undefined) {
      const quote = quoteSchema.safeParse(body);
      if (!quote.success) {
        return res.status(400).json({ error: "Invalid quote", details: quote.error.flatten() });
      }
      repair.diagnosis = quote.data.diagnosis;
      repair.quoteAmount = quote.data.quoteAmount;
      repair.estimatedDays = quote.data.estimatedDays;
      if (repair.status === "diagnosis" || repair.status === "device_received") {
        repair.status = "quote_sent";
      }
    }

    if (body.status) {
      const parsed = statusUpdateSchema.safeParse(body);
      if (
        !parsed.success ||
        !REPAIR_STATUSES.includes(parsed.data.status as (typeof REPAIR_STATUSES)[number])
      ) {
        return res.status(400).json({ error: "Invalid status" });
      }
      repair.status = parsed.data.status as typeof repair.status;
      if (parsed.data.note && repair.statusHistory.length > 0) {
        repair.statusHistory[repair.statusHistory.length - 1].note = parsed.data.note;
        repair.statusHistory[repair.statusHistory.length - 1].changedBy = req.user!
          .id as unknown as (typeof repair.statusHistory)[0]["changedBy"];
      }
      if (parsed.data.status === "completed") {
        repair.completedAt = new Date();
      }
    }

    await repair.save();

    await AuditLog.create({
      actor: req.user!.id,
      action: "update",
      resource: "RepairRequest",
      resourceId: repair.repairId,
      meta: body,
    });

    return res.json({ success: true, repair });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update repair" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const repair = await RepairRequest.findOneAndDelete(lookup(String(req.params.id)));
    if (!repair) return res.status(404).json({ error: "Repair request not found" });

    await AuditLog.create({
      actor: req.user!.id,
      action: "delete",
      resource: "RepairRequest",
      resourceId: repair.repairId,
      meta: { brand: repair.brand, model: repair.model, phone: repair.phone },
    });

    return res.json({ success: true, message: `Repair ${repair.repairId} deleted` });
  } catch (err) {
    console.error("Delete repair error:", err);
    return res.status(500).json({ error: "Failed to delete repair request" });
  }
});

export default router;
