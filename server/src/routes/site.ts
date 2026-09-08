import { Router } from "express";
import { connectDB } from "../lib/db";
import { RepairRequest } from "../models/RepairRequest";
import { Product } from "../models/Product";
import { Order } from "../models/Order";
import { SiteSettings } from "../models/SiteSettings";
import { requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/stats", async (_req, res) => {
  try {
    await connectDB();
    let settings = await SiteSettings.findOne({ key: "main" }).lean();
    if (!settings) {
      settings = (await SiteSettings.create({ key: "main", yearsExperience: 0 })).toObject();
    }

    if (!settings.showPublicStats) {
      return res.json({ show: false, items: [], workshopNote: settings.workshopNote });
    }

    const [repairsDone, ordersPaid, soldAgg, reviewsAgg] = await Promise.all([
      RepairRequest.countDocuments({
        status: { $in: ["completed", "delivered", "ready"] },
      }),
      Order.countDocuments({ paymentStatus: { $in: ["paid", "cod"] } }),
      Product.aggregate([{ $group: { _id: null, n: { $sum: "$soldCount" } } }]),
      Product.aggregate([
        { $match: { isActive: true, reviewCount: { $gt: 0 } } },
        {
          $group: {
            _id: null,
            reviews: { $sum: "$reviewCount" },
          },
        },
      ]),
    ]);

    const phonesSoldCount = Math.max(ordersPaid || 0, soldAgg[0]?.n || 0);
    const items: { value: string; label: string }[] = [];
    if (repairsDone > 0) {
      items.push({ value: `${repairsDone.toLocaleString("en-IN")}+`, label: "Devices repaired" });
    }
    if (phonesSoldCount > 0) {
      items.push({ value: `${phonesSoldCount.toLocaleString("en-IN")}+`, label: "Phones sold" });
    }
    if (reviewsAgg[0]?.reviews > 0) {
      items.push({
        value: `${reviewsAgg[0].reviews.toLocaleString("en-IN")}+`,
        label: "Customer ratings",
      });
    }
    if (settings.yearsExperience > 0) {
      items.push({ value: `${settings.yearsExperience}+`, label: "Years of experience" });
    }

    return res.json({
      show: items.length > 0,
      items,
      workshopNote: settings.workshopNote,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch site stats" });
  }
});

router.get("/settings", async (_req, res) => {
  try {
    await connectDB();
    let settings = await SiteSettings.findOne({ key: "main" }).lean();
    if (!settings) {
      settings = (await SiteSettings.create({ key: "main" })).toObject();
    }
    return res.json(settings);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch settings" });
  }
});

router.patch("/settings", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const { yearsExperience, showPublicStats, workshopNote } = req.body || {};
    const updates: Record<string, unknown> = {};
    if (typeof yearsExperience === "number" && yearsExperience >= 0) {
      updates.yearsExperience = Math.min(100, Math.floor(yearsExperience));
    }
    if (typeof showPublicStats === "boolean") updates.showPublicStats = showPublicStats;
    if (typeof workshopNote === "string") updates.workshopNote = workshopNote.slice(0, 500);

    const settings = await SiteSettings.findOneAndUpdate(
      { key: "main" },
      { $set: updates },
      { upsert: true, returnDocument: "after" }
    );
    return res.json(settings);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update settings" });
  }
});

router.get("/reviews", async (_req, res) => {
  try {
    await connectDB();
    const products = await Product.find({
      isActive: true,
      "reviews.0": { $exists: true },
    })
      .select("name slug reviews")
      .limit(20)
      .lean();

    const reviews = products
      .flatMap((p) =>
        (p.reviews || []).map((r: any) => ({
          name: r.name,
          rating: r.rating,
          title: r.title,
          text: r.text,
          verified: r.verified,
          createdAt: r.createdAt,
          productName: p.name,
          productSlug: p.slug,
        }))
      )
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 6);

    return res.json({ items: reviews });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

export default router;
