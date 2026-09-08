import { Router } from "express";
import { connectDB } from "../lib/db";
import { RepairRequest } from "../models/RepairRequest";
import { SellRequest } from "../models/SellRequest";
import { Product } from "../models/Product";
import { Order } from "../models/Order";
import { User } from "../models/User";
import { Category, Brand } from "../models/Category";
import {
  Coupon,
  Notification,
  AuditLog,
  Payment,
} from "../models";
import { requireAdmin } from "../middleware/auth";
import { slugify } from "../lib/utils";

const router = Router();

router.use(requireAdmin);

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysAgo(n: number) {
  const x = new Date();
  x.setDate(x.getDate() - n);
  x.setHours(0, 0, 0, 0);
  return x;
}

router.get("/stats", async (_req, res) => {
  try {
    await connectDB();
    const today = startOfDay();
    const pendingRepairStatuses = [
      "pending",
      "reviewing",
      "contacted",
      "device_received",
      "diagnosis",
      "quote_sent",
      "customer_approved",
      "repairing",
    ];

    const [
      repairs,
      pendingRepairs,
      sells,
      pendingSells,
      products,
      lowStock,
      orders,
      customers,
      revenueAgg,
      todayRevenueAgg,
    ] = await Promise.all([
      RepairRequest.countDocuments(),
      RepairRequest.countDocuments({ status: { $in: pendingRepairStatuses } }),
      SellRequest.countDocuments(),
      SellRequest.countDocuments({
        status: { $in: ["pending", "under_review", "contacted", "price_offered"] },
      }),
      Product.countDocuments(),
      Product.countDocuments({
        isActive: true,
        $expr: { $lte: ["$stock", { $ifNull: ["$lowStockThreshold", 2] }] },
      }),
      Order.countDocuments(),
      User.countDocuments({ role: "customer" }),
      Order.aggregate([
        { $match: { paymentStatus: { $in: ["paid", "cod"] } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: today },
            paymentStatus: { $in: ["paid", "cod"] },
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);

    return res.json({
      repairs,
      pendingRepairs,
      sells,
      pendingSells,
      products,
      lowStock,
      orders,
      customers,
      revenue: revenueAgg[0]?.total || 0,
      todaySales: todayRevenueAgg[0]?.total || 0,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

router.get("/overview", async (_req, res) => {
  try {
    await connectDB();
    const since = daysAgo(30);

    const [recentOrders, recentRepairs, recentSells, lowStockProducts, revenueSeries] =
      await Promise.all([
        Order.find().sort({ createdAt: -1 }).limit(8).lean(),
        RepairRequest.find({ status: { $nin: ["completed", "cancelled", "delivered"] } })
          .sort({ createdAt: -1 })
          .limit(8)
          .lean(),
        SellRequest.find({
          status: { $in: ["pending", "under_review", "contacted", "price_offered"] },
        })
          .sort({ createdAt: -1 })
          .limit(8)
          .lean(),
        Product.find({
          isActive: true,
          $expr: { $lte: ["$stock", { $ifNull: ["$lowStockThreshold", 2] }] },
        })
          .select("name sku stock brand price")
          .sort({ stock: 1 })
          .limit(8)
          .lean(),
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: since },
              paymentStatus: { $in: ["paid", "cod"] },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              revenue: { $sum: "$total" },
              orders: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

    return res.json({
      recentOrders,
      recentRepairs,
      recentSells,
      lowStockProducts,
      revenueSeries,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to load overview" });
  }
});

router.get("/search", async (req, res) => {
  try {
    await connectDB();
    const q = String(req.query.q || "").trim();
    if (!q) return res.json({ items: [] });
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const [repairs, sells, orders, products, customers] = await Promise.all([
      RepairRequest.find({ $or: [{ repairId: rx }, { name: rx }, { phone: rx }] })
        .limit(5)
        .select("repairId name phone status")
        .lean(),
      SellRequest.find({ $or: [{ sellId: rx }, { name: rx }, { phone: rx }, { brand: rx }] })
        .limit(5)
        .select("sellId name phone status brand model")
        .lean(),
      Order.find({ $or: [{ orderId: rx }] })
        .limit(5)
        .select("orderId total status paymentStatus")
        .lean(),
      Product.find({ $or: [{ name: rx }, { sku: rx }, { brand: rx }] })
        .limit(5)
        .select("name sku brand price stock")
        .lean(),
      User.find({ role: "customer", $or: [{ name: rx }, { email: rx }, { phone: rx }] })
        .limit(5)
        .select("name email phone")
        .lean(),
    ]);

    const items = [
      ...repairs.map((r) => ({
        type: "repair",
        id: r.repairId,
        title: r.repairId,
        subtitle: `${r.name} · ${r.phone}`,
        href: `/admin/repairs/${r.repairId}`,
      })),
      ...sells.map((s) => ({
        type: "sell",
        id: s.sellId,
        title: s.sellId,
        subtitle: `${s.name} · ${s.brand} ${s.model}`,
        href: `/admin/sells/${s.sellId}`,
      })),
      ...orders.map((o) => ({
        type: "order",
        id: o.orderId,
        title: o.orderId,
        subtitle: `${o.status} · ₹${o.total}`,
        href: `/admin/orders/${o.orderId}`,
      })),
      ...products.map((p) => ({
        type: "product",
        id: String(p._id),
        title: p.name,
        subtitle: `${p.brand} · ${p.sku || "—"}`,
        href: `/admin/products/${p._id}`,
      })),
      ...customers.map((c) => ({
        type: "customer",
        id: String(c._id),
        title: c.name,
        subtitle: c.email || c.phone || "",
        href: `/admin/customers/${c._id}`,
      })),
    ];

    return res.json({ items });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Search failed" });
  }
});

router.get("/notifications", async (req, res) => {
  try {
    await connectDB();
    const userId = req.user!.id;
    const items = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(40)
      .lean();
    return res.json({ items });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to load notifications" });
  }
});

router.get("/notifications/unread-count", async (req, res) => {
  try {
    await connectDB();
    // Operational alerts derived from live data (no fake seed required)
    const [pendingRepairs, pendingSells, pendingOrders, lowStock] = await Promise.all([
      RepairRequest.countDocuments({ status: "pending" }),
      SellRequest.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "pending" }),
      Product.countDocuments({
        isActive: true,
        $expr: { $lte: ["$stock", { $ifNull: ["$lowStockThreshold", 2] }] },
      }),
    ]);
    const unread = pendingRepairs + pendingSells + pendingOrders + (lowStock > 0 ? 1 : 0);
    return res.json({
      unread,
      breakdown: { pendingRepairs, pendingSells, pendingOrders, lowStock },
    });
  } catch (error) {
    console.error(error);
    return res.json({ unread: 0, breakdown: {} });
  }
});

router.get("/customers", async (req, res) => {
  try {
    await connectDB();
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Number(req.query.limit || 20));
    const q = String(req.query.q || "").trim();
    const filter: Record<string, unknown> = { role: "customer" };
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
    }
    const [items, total] = await Promise.all([
      User.find(filter)
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);
    return res.json({ items, total, page, limit });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to load customers" });
  }
});

router.get("/customers/:id", async (req, res) => {
  try {
    await connectDB();
    const customer = await User.findById(req.params.id).select("-passwordHash").lean();
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    const [orders, repairs, sells] = await Promise.all([
      Order.find({ user: customer._id }).sort({ createdAt: -1 }).limit(20).lean(),
      RepairRequest.find({ $or: [{ user: customer._id }, { phone: customer.phone }] })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      SellRequest.find({ $or: [{ user: customer._id }, { phone: customer.phone }] })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
    ]);
    const spent = orders
      .filter((o) => ["paid", "cod"].includes(o.paymentStatus))
      .reduce((s, o) => s + (o.total || 0), 0);
    return res.json({ customer, orders, repairs, sells, spent });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to load customer" });
  }
});

export const DEFAULT_CATEGORIES = [
  {
    name: "Phone",
    slug: "phone",
    description: "Brand-new sealed smartphones with full manufacturer warranty.",
    isActive: true,
  },
  {
    name: "Old Phone",
    slug: "old-phone",
    description: "Certified pre-owned and refurbished smartphones thoroughly inspected.",
    isActive: true,
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Chargers, cases, cables, adapters, and audio accessories.",
    isActive: true,
  },
  {
    name: "Mac",
    slug: "mac",
    description: "Apple MacBooks, iMacs, and Mac desktops.",
    isActive: true,
  },
];

export const DEFAULT_BRANDS = [
  { name: "Apple", slug: "apple", isActive: true },
  { name: "Samsung", slug: "samsung", isActive: true },
  { name: "OnePlus", slug: "oneplus", isActive: true },
  { name: "Google", slug: "google", isActive: true },
  { name: "Xiaomi", slug: "xiaomi", isActive: true },
  { name: "Realme", slug: "realme", isActive: true },
  { name: "Vivo", slug: "vivo", isActive: true },
  { name: "Oppo", slug: "oppo", isActive: true },
  { name: "Nothing", slug: "nothing", isActive: true },
  { name: "boAt", slug: "boat", isActive: true },
  { name: "Spigen", slug: "spigen", isActive: true },
  { name: "Motorola", slug: "motorola", isActive: true },
];

async function syncDefaultCategoriesAndBrands() {
  await connectDB();
  const catMap = new Map<string, any>();
  for (const c of DEFAULT_CATEGORIES) {
    const doc = await Category.findOneAndUpdate(
      { slug: c.slug },
      { $setOnInsert: c },
      { upsert: true, new: true }
    );
    catMap.set(c.slug, doc);
  }

  for (const b of DEFAULT_BRANDS) {
    await Brand.findOneAndUpdate(
      { slug: b.slug },
      { $setOnInsert: b },
      { upsert: true, new: true }
    );
  }

  // Auto-link existing products in database that lack a category
  const macCat = catMap.get("mac");
  const accCat = catMap.get("accessories");
  const phoneCat = catMap.get("phone");
  const oldPhoneCat = catMap.get("old-phone");

  if (macCat) {
    await Product.updateMany(
      {
        $or: [
          { productType: { $in: ["mac", "laptop"] } },
          { brand: "Apple", model: { $regex: /mac|imac/i } },
          { name: { $regex: /macbook|imac/i } },
        ],
      },
      { $set: { category: macCat._id } }
    );
  }

  if (accCat) {
    await Product.updateMany(
      { productType: "accessory" },
      { $set: { category: accCat._id } }
    );
  }

  if (phoneCat) {
    await Product.updateMany(
      {
        condition: "new",
        productType: { $nin: ["accessory", "mac", "laptop"] },
        category: { $exists: false },
      },
      { $set: { category: phoneCat._id } }
    );
  }

  if (oldPhoneCat) {
    await Product.updateMany(
      {
        $or: [
          { condition: { $in: ["refurbished", "used_like_new", "used_good", "used_fair"] } },
          { productType: "used" },
        ],
        productType: { $nin: ["accessory", "mac", "laptop"] },
      },
      { $set: { category: oldPhoneCat._id } }
    );
  }
}

router.get("/categories", async (req, res) => {
  try {
    await connectDB();
    const count = await Category.countDocuments();
    if (count === 0) {
      await syncDefaultCategoriesAndBrands();
    }
    const q = String(req.query.q || "").trim();
    const filter: Record<string, unknown> = {};
    if (q) {
      filter.$or = [
        { name: new RegExp(q, "i") },
        { slug: new RegExp(q, "i") },
        { description: new RegExp(q, "i") },
      ];
    }
    const rawItems = await Category.find(filter).sort({ name: 1 }).lean();

    const items = await Promise.all(
      rawItems.map(async (cat) => {
        const productCount = await Product.countDocuments({
          $or: [
            { category: cat._id },
            cat.slug === "phone"
              ? { condition: "new", productType: { $nin: ["accessory", "mac", "laptop"] } }
              : cat.slug === "old-phone"
              ? { condition: { $in: ["refurbished", "used_like_new", "used_good", "used_fair"] }, productType: { $nin: ["accessory", "mac", "laptop"] } }
              : cat.slug === "accessories"
              ? { productType: "accessory" }
              : cat.slug === "mac"
              ? { productType: { $in: ["mac", "laptop"] } }
              : { category: cat._id },
          ],
        });
        return { ...cat, productCount };
      })
    );

    return res.json({ items, total: items.length });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to load categories" });
  }
});

router.post("/categories/seed-defaults", async (_req, res) => {
  try {
    await syncDefaultCategoriesAndBrands();
    const items = await Category.find().sort({ name: 1 }).lean();
    return res.json({ success: true, message: "Default categories and brands synced", items });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to seed default categories" });
  }
});

router.post("/categories", async (req, res) => {
  try {
    await connectDB();
    const name = String(req.body.name || "").trim();
    if (!name) return res.status(400).json({ error: "Name required" });
    const slug = slugify(req.body.slug || name);
    const item = await Category.create({
      name,
      slug,
      description: req.body.description || "",
      image: req.body.image || "",
      isActive: req.body.isActive !== false,
    });
    return res.status(201).json(item);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create category" });
  }
});

router.patch("/categories/:id", async (req, res) => {
  try {
    await connectDB();
    const updates: Record<string, unknown> = {};
    if (req.body.name) updates.name = String(req.body.name).trim();
    if (req.body.slug) updates.slug = slugify(req.body.slug);
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.image !== undefined) updates.image = req.body.image;
    if (typeof req.body.isActive === "boolean") updates.isActive = req.body.isActive;
    const item = await Category.findByIdAndUpdate(req.params.id, updates, {
      returnDocument: "after",
    });
    if (!item) return res.status(404).json({ error: "Not found" });
    return res.json(item);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update category" });
  }
});

router.delete("/categories/:id", async (req, res) => {
  try {
    await connectDB();
    const linked = await Product.countDocuments({ category: req.params.id });
    if (linked > 0) {
      return res.status(400).json({
        error: `Cannot delete: ${linked} product(s) still assigned. Reassign first.`,
      });
    }
    await Category.findByIdAndDelete(req.params.id);
    return res.json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to delete category" });
  }
});

router.get("/brands", async (req, res) => {
  try {
    await connectDB();
    const count = await Brand.countDocuments();
    if (count === 0) {
      await syncDefaultCategoriesAndBrands();
    }
    const q = String(req.query.q || "").trim();
    const filter: Record<string, unknown> = {};
    if (q) {
      filter.$or = [
        { name: new RegExp(q, "i") },
        { slug: new RegExp(q, "i") },
      ];
    }
    const rawItems = await Brand.find(filter).sort({ name: 1 }).lean();

    const items = await Promise.all(
      rawItems.map(async (brand) => {
        const productCount = await Product.countDocuments({
          brand: new RegExp(`^${brand.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
        });
        return { ...brand, productCount };
      })
    );

    return res.json({ items, total: items.length });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to load brands" });
  }
});

router.post("/brands/seed-defaults", async (_req, res) => {
  try {
    await syncDefaultCategoriesAndBrands();
    const items = await Brand.find().sort({ name: 1 }).lean();
    return res.json({ success: true, message: "Default brands synced", items });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to seed default brands" });
  }
});

router.post("/brands", async (req, res) => {
  try {
    await connectDB();
    const name = String(req.body.name || "").trim();
    if (!name) return res.status(400).json({ error: "Name required" });
    const item = await Brand.create({
      name,
      slug: slugify(req.body.slug || name),
      logo: req.body.logo || "",
      isActive: req.body.isActive !== false,
    });
    return res.status(201).json(item);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create brand" });
  }
});

router.patch("/brands/:id", async (req, res) => {
  try {
    await connectDB();
    const updates: Record<string, unknown> = {};
    if (req.body.name) updates.name = String(req.body.name).trim();
    if (req.body.slug) updates.slug = slugify(req.body.slug);
    if (req.body.logo !== undefined) updates.logo = req.body.logo;
    if (typeof req.body.isActive === "boolean") updates.isActive = req.body.isActive;
    const item = await Brand.findByIdAndUpdate(req.params.id, updates, {
      returnDocument: "after",
    });
    if (!item) return res.status(404).json({ error: "Not found" });
    return res.json(item);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update brand" });
  }
});

router.delete("/brands/:id", async (req, res) => {
  try {
    await connectDB();
    await Brand.findByIdAndDelete(req.params.id);
    return res.json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to delete brand" });
  }
});

router.get("/inventory", async (_req, res) => {
  try {
    await connectDB();
    const products = await Product.find()
      .select("name sku brand stock lowStockThreshold price isActive productType condition")
      .sort({ stock: 1 })
      .lean();

    let stockValue = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let totalStock = 0;

    const items = products.map((p) => {
      const min = p.lowStockThreshold ?? 2;
      const available = p.stock || 0;
      totalStock += available;
      stockValue += available * (p.price || 0);
      if (available <= 0) outOfStock += 1;
      else if (available <= min) lowStock += 1;
      return {
        ...p,
        available,
        reserved: 0,
        minimumStock: min,
        status: available <= 0 ? "out" : available <= min ? "low" : "ok",
      };
    });

    return res.json({
      summary: {
        totalStock,
        stockValue,
        lowStock,
        outOfStock,
        products: products.length,
      },
      items,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to load inventory" });
  }
});

router.post("/inventory/adjust", async (req, res) => {
  try {
    await connectDB();
    const { productId, quantity, type, reason } = req.body || {};
    const qty = Number(quantity);
    if (!productId || !Number.isFinite(qty) || qty === 0) {
      return res.status(400).json({ error: "productId and non-zero quantity required" });
    }
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const delta =
      type === "out" || type === "damage" ? -Math.abs(qty) : Math.abs(qty);
    const prev = product.stock || 0;
    product.stock = Math.max(0, prev + delta);
    await product.save();

    await AuditLog.create({
      actor: req.user!.id,
      action: `inventory.${type || "adjust"}`,
      resource: "Product",
      resourceId: String(product._id),
      meta: { previous: prev, next: product.stock, quantity: delta, reason: reason || "" },
    });

    return res.json({ product, previous: prev, next: product.stock });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to adjust stock" });
  }
});

router.get("/coupons", async (_req, res) => {
  try {
    await connectDB();
    const items = await Coupon.find().sort({ createdAt: -1 }).lean();
    return res.json({ items });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to load coupons" });
  }
});

router.post("/coupons", async (req, res) => {
  try {
    await connectDB();
    const code = String(req.body.code || "").trim().toUpperCase();
    if (!code) return res.status(400).json({ error: "Code required" });
    const item = await Coupon.create({
      code,
      description: req.body.description || "",
      type: req.body.type === "fixed" ? "fixed" : "percentage",
      value: Number(req.body.value) || 0,
      minOrderAmount: Number(req.body.minOrderAmount) || 0,
      maxDiscount: req.body.maxDiscount ? Number(req.body.maxDiscount) : undefined,
      usageLimit: req.body.usageLimit ? Number(req.body.usageLimit) : undefined,
      startsAt: req.body.startsAt ? new Date(req.body.startsAt) : new Date(),
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
      isActive: req.body.isActive !== false,
    });
    return res.status(201).json(item);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create coupon" });
  }
});

router.patch("/coupons/:id", async (req, res) => {
  try {
    await connectDB();
    const updates: Record<string, unknown> = { ...req.body };
    if (updates.code) updates.code = String(updates.code).toUpperCase();
    const item = await Coupon.findByIdAndUpdate(req.params.id, updates, {
      returnDocument: "after",
    });
    if (!item) return res.status(404).json({ error: "Not found" });
    return res.json(item);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update coupon" });
  }
});

router.delete("/coupons/:id", async (req, res) => {
  try {
    await connectDB();
    await Coupon.findByIdAndDelete(req.params.id);
    return res.json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to delete coupon" });
  }
});

router.get("/reviews", async (_req, res) => {
  try {
    await connectDB();
    // Prefer embedded product reviews (already in use)
    const products = await Product.find({ "reviews.0": { $exists: true } })
      .select("name slug reviews")
      .lean();
    const items = products.flatMap((p) =>
      (p.reviews || []).map((r: any, idx: number) => ({
        id: `${p._id}-${idx}`,
        productId: String(p._id),
        productName: p.name,
        productSlug: p.slug,
        name: r.name,
        rating: r.rating,
        title: r.title,
        text: r.text,
        verified: r.verified,
        createdAt: r.createdAt,
        hidden: false,
      }))
    );
    items.sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    return res.json({ items: items.slice(0, 100) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to load reviews" });
  }
});

router.post("/reviews", async (req, res) => {
  try {
    await connectDB();
    const { productId, name, rating, title, text, verified, createdAt } = req.body;
    if (!productId) return res.status(400).json({ error: "Product is required" });
    if (!name || !text) return res.status(400).json({ error: "Reviewer name and comment are required" });

    const numRating = Math.min(5, Math.max(1, Number(rating) || 5));
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const newReview = {
      name: name.trim(),
      rating: numRating,
      title: (title || "").trim(),
      text: text.trim(),
      verified: verified !== false,
      helpful: 0,
      createdAt: createdAt ? new Date(createdAt) : new Date(),
    };

    product.reviews.push(newReview as any);
    product.reviewCount = product.reviews.length;
    const totalRating = product.reviews.reduce((acc: number, cur: any) => acc + (cur.rating || 0), 0);
    product.rating = Math.round((totalRating / product.reviews.length) * 10) / 10;

    await product.save();

    await AuditLog.create({
      actor: (req as any).user?.id,
      action: "create",
      resource: "Review",
      resourceId: String(product._id),
      meta: { productName: product.name, reviewer: name, rating: numRating },
    });

    return res.status(201).json({
      success: true,
      review: {
        ...newReview,
        productId: String(product._id),
        productName: product.name,
        productSlug: product.slug,
      },
    });
  } catch (error) {
    console.error("Create review error:", error);
    return res.status(500).json({ error: "Failed to create review" });
  }
});

router.delete("/reviews/:productId/:reviewId", async (req, res) => {
  try {
    await connectDB();
    const { productId, reviewId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const prevCount = product.reviews.length;
    product.reviews = product.reviews.filter((r: any, idx: number) => {
      const idMatch = r._id ? String(r._id) === reviewId : false;
      const compositeMatch = `${productId}-${idx}` === reviewId;
      const indexMatch = String(idx) === reviewId;
      return !(idMatch || compositeMatch || indexMatch);
    });

    if (product.reviews.length === prevCount) {
      const idx = parseInt(reviewId, 10);
      if (!isNaN(idx) && idx >= 0 && idx < product.reviews.length) {
        product.reviews.splice(idx, 1);
      }
    }

    product.reviewCount = product.reviews.length;
    if (product.reviews.length > 0) {
      const totalRating = product.reviews.reduce((acc: number, cur: any) => acc + (cur.rating || 0), 0);
      product.rating = Math.round((totalRating / product.reviews.length) * 10) / 10;
    } else {
      product.rating = 5;
    }

    await product.save();

    return res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("Delete review error:", error);
    return res.status(500).json({ error: "Failed to delete review" });
  }
});

router.get("/payments", async (_req, res) => {
  try {
    await connectDB();
    const items = await Payment.find().sort({ createdAt: -1 }).limit(50).lean();
    // Also surface order payment snapshots
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .select("orderId total paymentMethod paymentStatus createdAt status")
      .lean();
    return res.json({ payments: items, orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to load payments" });
  }
});

router.get("/audit-logs", async (req, res) => {
  try {
    await connectDB();
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Number(req.query.limit || 30));
    const [items, total] = await Promise.all([
      AuditLog.find()
        .populate("actor", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(),
    ]);
    return res.json({ items, total, page, limit });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to load audit logs" });
  }
});

router.get("/users", async (_req, res) => {
  try {
    await connectDB();
    const items = await User.find({ role: "admin" }).select("-passwordHash").lean();
    return res.json({ items });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to load admin users" });
  }
});

router.get("/reports", async (req, res) => {
  try {
    await connectDB();
    const range = String(req.query.range || "30");
    const days = range === "7" ? 7 : range === "90" ? 90 : range === "365" ? 365 : 30;
    const since = daysAgo(days);

    const [sales, repairs, sells, topProducts] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: null,
            orders: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [{ $in: ["$paymentStatus", ["paid", "cod"]] }, "$total", 0],
              },
            },
          },
        },
      ]),
      RepairRequest.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      SellRequest.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Product.find({ isActive: true })
        .sort({ soldCount: -1 })
        .limit(10)
        .select("name brand soldCount price stock")
        .lean(),
    ]);

    return res.json({
      range: days,
      sales: sales[0] || { orders: 0, revenue: 0 },
      repairsByStatus: repairs,
      sellsByStatus: sells,
      topProducts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to load reports" });
  }
});

router.get("/imei-devices", async (_req, res) => {
  try {
    await connectDB();
    // Used/refurbished products with IMEI (admin-only field)
    const items = await Product.find({
      productType: { $in: ["used", "refurbished"] },
    })
      .select("+imei name brand model sku stock price condition batteryHealth productType isActive")
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();
    return res.json({ items });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to load IMEI devices" });
  }
});

export default router;
