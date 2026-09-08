import { Router } from "express";
import { connectDB } from "../lib/db";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import { productSchema } from "../lib/validations";
import { requireAdmin } from "../middleware/auth";
import { slugify } from "../lib/utils";

const router = Router();

function parseList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return String(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function buildSort(sort?: string): Record<string, 1 | -1> {
  switch (sort) {
    case "price_asc":
      return { price: 1 as const };
    case "price_desc":
      return { price: -1 as const };
    case "newest":
      return { createdAt: -1 as const };
    case "rating":
      return { averageRating: -1 as const, reviewCount: -1 as const };
    case "discount":
      return { discountPercent: -1 as const, price: 1 as const };
    case "popularity":
    default:
      return { popularityScore: -1 as const, isFeatured: -1 as const, soldCount: -1 as const };
  }
}

router.get("/", async (req, res) => {
  try {
    await connectDB();
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(48, Number(req.query.limit || 12));
    const filter: Record<string, unknown> = { isActive: true };

    const brands = parseList(req.query.brand);
    const conditions = parseList(req.query.condition);
    const rams = parseList(req.query.ram);
    const storages = parseList(req.query.storage);
    const warranties = parseList(req.query.warranty).map(Number).filter((n) => Number.isFinite(n));
    const categories = parseList(req.query.category);
    const q = (req.query.q as string | undefined)?.trim();
    const batteryMin = Number(req.query.batteryMin);
    const ratingMin = Number(req.query.ratingMin);
    const min = Number(req.query.minPrice);
    const max = Number(req.query.maxPrice);

    if (brands.length === 1) filter.brand = brands[0];
    else if (brands.length > 1) filter.brand = { $in: brands };

    if (conditions.length === 1) filter.condition = conditions[0];
    else if (conditions.length > 1) filter.condition = { $in: conditions };

    if (categories.length) {
      const typeSet = new Set<string>();
      for (const c of categories) {
        if (c === "phone" || c === "new") typeSet.add("new");
        if (c === "old-phone" || c === "old_phone" || c === "used") typeSet.add("used");
        if (c === "refurbished") typeSet.add("refurbished");
        if (c === "accessories" || c === "accessory") typeSet.add("accessory");
        if (c === "mac" || c === "laptop") {
          typeSet.add("mac");
          typeSet.add("laptop");
        }
      }
      if (typeSet.size) {
        const or: Record<string, unknown>[] = [{ productType: { $in: [...typeSet] } }];
        if (typeSet.has("new")) or.push({ condition: "new", productType: { $nin: ["accessory", "mac", "laptop"] } });
        if (typeSet.has("refurbished")) or.push({ condition: "refurbished" });
        if (typeSet.has("used")) {
          or.push({ condition: { $in: ["used_like_new", "used_good", "used_fair"] } });
        }
        if (typeSet.has("mac") || typeSet.has("laptop")) {
          or.push(
            { productType: { $in: ["mac", "laptop"] } },
            { brand: "Apple", model: { $regex: /mac|imac/i } },
            { name: { $regex: /macbook|imac|mac mini|mac studio/i } }
          );
        }

        const isOnlyAccessory = typeSet.has("accessory") && typeSet.size === 1;
        const isOnlyMac = (typeSet.has("mac") || typeSet.has("laptop")) && !typeSet.has("new") && !typeSet.has("refurbished") && !typeSet.has("used") && !typeSet.has("accessory");

        if (isOnlyAccessory) {
          filter.productType = "accessory";
        } else if (isOnlyMac) {
          filter.$or = [
            { productType: { $in: ["mac", "laptop"] } },
            { brand: "Apple", model: { $regex: /mac|imac/i } },
            { name: { $regex: /macbook|imac|mac mini|mac studio/i } },
          ];
        } else if (typeSet.has("accessory") || typeSet.has("mac") || typeSet.has("laptop")) {
          filter.$and = [...((filter.$and as unknown[]) || []), { $or: or }];
        } else {
          filter.$and = [
            ...((filter.$and as unknown[]) || []),
            {
              $and: [
                { productType: { $nin: ["accessory", "mac", "laptop"] } },
                { $or: or },
              ],
            },
          ];
        }
      }
    }

    if (Number.isFinite(min) || Number.isFinite(max)) {
      filter.price = {
        ...(Number.isFinite(min) ? { $gte: min } : {}),
        ...(Number.isFinite(max) ? { $lte: max } : {}),
      };
    }

    if (rams.length) filter["specifications.ram"] = { $in: rams };
    if (storages.length) filter["specifications.storage"] = { $in: storages };
    if (warranties.length) filter.warrantyMonths = { $in: warranties };
    if (Number.isFinite(batteryMin)) filter.batteryHealth = { $gte: batteryMin };
    if (Number.isFinite(ratingMin)) filter.averageRating = { $gte: ratingMin };

    if (q) {
      filter.$or = [
        { name: new RegExp(q, "i") },
        { brand: new RegExp(q, "i") },
        { model: new RegExp(q, "i") },
        { sku: new RegExp(q, "i") },
        { description: new RegExp(q, "i") },
      ];
    }

    const sort = buildSort(req.query.sort as string | undefined);

    const [items, total] = await Promise.all([
      Product.find(filter)
        .select("-imei")
        .populate("category", "name slug")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return res.json({ items, total, page, limit });
  } catch (error) {
    console.error("Product list error:", error);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/suggest", async (req, res) => {
  try {
    await connectDB();
    const q = String(req.query.q || "").trim();
    if (q.length < 2) return res.json({ items: [] });
    const items = await Product.find({
      isActive: true,
      $or: [
        { name: new RegExp(q, "i") },
        { brand: new RegExp(q, "i") },
        { model: new RegExp(q, "i") },
        { sku: new RegExp(q, "i") },
      ],
    })
      .select("name slug brand price images specifications.storage")
      .limit(8)
      .lean();
    return res.json({ items });
  } catch (error) {
    console.error("Product suggest error:", error);
    return res.status(500).json({ error: "Failed to suggest products" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    }
    await connectDB();
    const base = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.name);
    let slug = base;
    let suffix = 2;
    while (await Product.exists({ slug })) slug = `${base}-${suffix++}`;
    const product = await Product.create({ ...parsed.data, slug });
    return res.status(201).json(product);
  } catch (error) {
    console.error("Product create error:", error);
    return res.status(500).json({ error: "Failed to create product" });
  }
});

router.get("/admin/all", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Number(req.query.limit || 24));
    const q = String(req.query.q || "").trim();
    const brand = String(req.query.brand || "").trim();
    const category = String(req.query.category || "").trim();
    const productType = String(req.query.productType || "").trim();
    const stock = String(req.query.stock || "").trim();
    const status = String(req.query.status || "").trim();

    const filter: Record<string, unknown> = {};
    if (q) {
      filter.$or = [
        { name: new RegExp(q, "i") },
        { sku: new RegExp(q, "i") },
        { brand: new RegExp(q, "i") },
        { model: new RegExp(q, "i") },
      ];
    }
    if (brand && brand !== "all") {
      filter.brand = new RegExp(`^${brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    }
    if (productType && productType !== "all") filter.productType = productType;
    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;
    if (stock === "out") filter.stock = { $lte: 0 };
    if (stock === "low") {
      filter.$expr = { $and: [{ $gt: ["$stock", 0] }, { $lte: ["$stock", { $ifNull: ["$lowStockThreshold", 3] }] }] };
    }
    if (stock === "in") filter.stock = { $gt: 0 };

    if (category && category !== "all") {
      const cat = await Category.findOne({
        $or: [
          { slug: category },
          { _id: category.match(/^[a-f\d]{24}$/i) ? category : null },
        ],
      }).lean();

      const catOr: Record<string, unknown>[] = [];
      if (cat) {
        catOr.push({ category: cat._id });
        if (cat.slug === "phone") {
          catOr.push({ condition: "new", productType: { $nin: ["accessory", "mac", "laptop"] } });
        } else if (cat.slug === "old-phone") {
          catOr.push({
            condition: { $in: ["refurbished", "used_like_new", "used_good", "used_fair"] },
            productType: { $nin: ["accessory", "mac", "laptop"] },
          });
        } else if (cat.slug === "accessories") {
          catOr.push({ productType: "accessory" });
        } else if (cat.slug === "mac") {
          catOr.push(
            { productType: { $in: ["mac", "laptop"] } },
            { brand: "Apple", model: { $regex: /mac|imac/i } },
            { name: { $regex: /macbook|imac/i } }
          );
        }
      } else {
        if (category === "phone" || category === "new") {
          catOr.push({ condition: "new", productType: { $nin: ["accessory", "mac", "laptop"] } });
        } else if (category === "old-phone" || category === "old_phone" || category === "used" || category === "refurbished") {
          catOr.push({
            condition: { $in: ["refurbished", "used_like_new", "used_good", "used_fair"] },
            productType: { $nin: ["accessory", "mac", "laptop"] },
          });
        } else if (category === "accessories" || category === "accessory") {
          catOr.push({ productType: "accessory" });
        } else if (category === "mac") {
          catOr.push(
            { productType: { $in: ["mac", "laptop"] } },
            { brand: "Apple", model: { $regex: /mac|imac/i } },
            { name: { $regex: /macbook|imac/i } }
          );
        }
      }

      if (catOr.length) {
        if (filter.$or) {
          filter.$and = [{ $or: filter.$or }, { $or: catOr }];
          delete filter.$or;
        } else {
          filter.$or = catOr;
        }
      }
    }

    const [phoneCat, oldPhoneCat, accCat, macCat] = await Promise.all([
      Category.findOne({ slug: "phone" }).lean(),
      Category.findOne({ slug: "old-phone" }).lean(),
      Category.findOne({ slug: "accessories" }).lean(),
      Category.findOne({ slug: "mac" }).lean(),
    ]);

    const [items, total, allCount, phoneCount, oldPhoneCount, accCount, macCount] = await Promise.all([
      Product.find(filter)
        .select("-imei")
        .populate("category", "name slug")
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
      Product.countDocuments(),
      Product.countDocuments({
        $or: [
          ...(phoneCat ? [{ category: phoneCat._id }] : []),
          { condition: "new", productType: { $nin: ["accessory", "mac", "laptop"] } },
        ],
      }),
      Product.countDocuments({
        $or: [
          ...(oldPhoneCat ? [{ category: oldPhoneCat._id }] : []),
          {
            condition: { $in: ["refurbished", "used_like_new", "used_good", "used_fair"] },
            productType: { $nin: ["accessory", "mac", "laptop"] },
          },
        ],
      }),
      Product.countDocuments({
        $or: [
          ...(accCat ? [{ category: accCat._id }] : []),
          { productType: "accessory" },
        ],
      }),
      Product.countDocuments({
        $or: [
          ...(macCat ? [{ category: macCat._id }] : []),
          { productType: { $in: ["mac", "laptop"] } },
          { brand: "Apple", model: { $regex: /mac|imac/i } },
          { name: { $regex: /macbook|imac/i } },
        ],
      }),
    ]);

    return res.json({
      items,
      total,
      categoryCounts: {
        all: allCount,
        phone: phoneCount,
        oldPhone: oldPhoneCount,
        accessories: accCount,
        mac: macCount,
      },
      page,
      limit,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to list products" });
  }
});

router.patch("/admin/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const updates = { ...req.body };
    delete updates._id;
    delete updates.__v;
    if (updates.slug) updates.slug = slugify(updates.slug);
    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      returnDocument: "after",
    }).select("-imei");
    if (!product) return res.status(404).json({ error: "Product not found" });
    return res.json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/admin/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    return res.json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to delete product" });
  }
});

router.get("/:slug/related", async (req, res) => {
  try {
    await connectDB();
    const product = await Product.findOne({ slug: req.params.slug, isActive: true }).lean();
    if (!product) return res.status(404).json({ error: "Product not found" });

    const related = await Product.find({
      isActive: true,
      slug: { $ne: product.slug },
      $or: [
        { brand: product.brand },
        {
          price: {
            $gte: Math.max(0, product.price * 0.7),
            $lte: product.price * 1.3,
          },
        },
        { condition: product.condition },
        { "specifications.storage": product.specifications?.storage },
      ],
    })
      .select("-imei")
      .sort({ averageRating: -1, popularityScore: -1 })
      .limit(8)
      .lean();

    return res.json({ items: related });
  } catch (error) {
    console.error("Related products error:", error);
    return res.status(500).json({ error: "Failed to fetch related products" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    await connectDB();
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .select("-imei")
      .lean();
    return product
      ? res.json(product)
      : res.status(404).json({ error: "Product not found" });
  } catch (error) {
    console.error("Product fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch product" });
  }
});

export default router;
