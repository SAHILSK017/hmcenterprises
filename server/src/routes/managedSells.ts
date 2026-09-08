import { Router } from "express";
import { connectDB } from "../lib/db";
import { ManagedSellingPhone } from "../models/ManagedSellingPhone";
import { SellRequest } from "../models/SellRequest";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import { AuditLog } from "../models";
import { requireAdmin } from "../middleware/auth";
import { nextSequentialId, slugify } from "../lib/utils";

const router = Router();

const lookup = (id: string) => ({
  $or: [
    { managedId: id.toUpperCase() },
    { _id: id.match(/^[a-f\d]{24}$/i) ? id : null },
  ],
});

router.get("/", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Number(req.query.limit || 24));
    const status = String(req.query.status || "").trim();
    const q = String(req.query.q || "").trim();

    const filter: Record<string, unknown> = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (q) {
      filter.$or = [
        { managedId: new RegExp(q, "i") },
        { sellRequestId: new RegExp(q, "i") },
        { "device.brand": new RegExp(q, "i") },
        { "device.model": new RegExp(q, "i") },
        { "device.imei": new RegExp(q, "i") },
        { "device.serialNumber": new RegExp(q, "i") },
        { "customer.name": new RegExp(q, "i") },
        { "customer.phone": new RegExp(q, "i") },
        { "customer.aadhaar.number": new RegExp(q, "i") },
        { "customer.pan.number": new RegExp(q, "i") },
      ];
    }

    const [
      items,
      total,
      allCount,
      procuredCount,
      qcCount,
      refurbCount,
      readyCount,
      listedCount,
      soldCount,
    ] = await Promise.all([
      ManagedSellingPhone.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ManagedSellingPhone.countDocuments(filter),
      ManagedSellingPhone.countDocuments(),
      ManagedSellingPhone.countDocuments({ status: "procured" }),
      ManagedSellingPhone.countDocuments({ status: "qc_inspection" }),
      ManagedSellingPhone.countDocuments({ status: "refurbishing" }),
      ManagedSellingPhone.countDocuments({ status: "ready_for_sale" }),
      ManagedSellingPhone.countDocuments({ status: "listed" }),
      ManagedSellingPhone.countDocuments({ status: "sold" }),
    ]);

    const statusMap = {
      all: allCount,
      procured: procuredCount,
      qc_inspection: qcCount,
      refurbishing: refurbCount,
      ready_for_sale: readyCount,
      listed: listedCount,
      sold: soldCount,
    };

    return res.json({
      items,
      total,
      counts: statusMap,
      statusCounts: statusMap,
      page,
      limit,
    });
  } catch (error) {
    console.error("Managed sells list error:", error);
    return res.status(500).json({ error: "Failed to fetch managed selling phones" });
  }
});

router.get("/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const item = await ManagedSellingPhone.findOne(lookup(String(req.params.id)))
      .populate("sellRequest")
      .populate("convertedProduct", "name slug price stock")
      .lean();

    if (!item) return res.status(404).json({ error: "Managed phone record not found" });
    return res.json({ success: true, item, ...item });
  } catch (error) {
    console.error("Managed sell fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch managed phone details" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const body = req.body;
    if (!body.device?.brand || !body.device?.model) {
      return res.status(400).json({ error: "Device brand and model are required" });
    }
    if (!body.customer?.name || !body.customer?.phone) {
      return res.status(400).json({ error: "Customer name and phone are required" });
    }

    const managedId = await nextSequentialId("MSP");

    const item = await ManagedSellingPhone.create({
      ...body,
      managedId,
      device: {
        ...body.device,
        imei: body.device.imei || `PENDING-${Date.now().toString().slice(-6)}`,
      },
      pricing: {
        purchasePrice: Number(body.pricing?.purchasePrice || 0),
        estimatedRepairCost: Number(body.pricing?.estimatedRepairCost || 0),
        targetSellingPrice: Number(body.pricing?.targetSellingPrice || 0),
      },
      status: body.status || "procured",
    });

    await AuditLog.create({
      actor: req.user!.id,
      action: "create",
      resource: "ManagedSellingPhone",
      resourceId: item.managedId,
      meta: { device: item.device.model, customer: item.customer.name },
    });

    return res.status(201).json({ success: true, item });
  } catch (error) {
    console.error("Managed phone create error:", error);
    return res.status(500).json({ error: "Failed to create managed phone record" });
  }
});

router.post("/import/:sellId", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const sellParam = String(req.params.sellId);
    const sell = await SellRequest.findOne({
      $or: [
        { sellId: sellParam.toUpperCase() },
        { _id: sellParam.match(/^[a-f\d]{24}$/i) ? sellParam : null },
      ],
    });

    if (!sell) {
      return res.status(404).json({ error: `Sell request ${sellParam} not found` });
    }

    // Check if already imported
    const existing = await ManagedSellingPhone.findOne({ sellRequest: sell._id });
    if (existing) {
      return res.json({
        success: true,
        alreadyImported: true,
        managedId: existing.managedId,
        item: existing,
      });
    }

    const managedId = await nextSequentialId("MSP");
    const purchasePrice =
      sell.finalPrice ||
      sell.offers?.[sell.offers.length - 1]?.amount ||
      sell.expectedPrice ||
      0;
    const targetSellingPrice = Math.round(purchasePrice * 1.3);

    const item = await ManagedSellingPhone.create({
      managedId,
      intakeType: "imported_from_sell",
      sellRequest: sell._id,
      sellRequestId: sell.sellId,
      device: {
        brand: sell.brand,
        model: sell.model,
        storage: sell.storage || "128GB",
        ram: sell.ram || "",
        color: sell.color || "",
        imei: sell.imei || "",
        batteryHealth: 88,
        condition: sell.overallCondition || "good",
        grade: sell.overallCondition === "excellent" ? "A+" : sell.overallCondition === "good" ? "A" : "B",
        checklist: {
          screen: sell.checklist?.screen || "working",
          body: sell.checklist?.body || "minor_wear",
          camera: sell.checklist?.camera || "working",
          battery: sell.checklist?.battery || "good",
          charging: sell.checklist?.charging || "working",
          displayWorking: sell.checklist?.displayWorking !== false,
          biometricsWorking: sell.checklist?.biometricsWorking !== false,
          cameraWorking: sell.checklist?.cameraWorking !== false,
          powersOn: sell.checklist?.powersOn !== false,
        },
        images: sell.images || [],
      },
      pricing: {
        purchasePrice,
        estimatedRepairCost: 0,
        targetSellingPrice,
      },
      customer: {
        name: sell.name,
        phone: sell.phone,
        email: sell.email || "",
        address: {
          street: "",
          city: "",
          state: "",
          pincode: "",
        },
        aadhaar: {
          number: "",
          verified: false,
        },
        pan: {
          number: "",
          verified: false,
        },
        payout: {
          method: "upi",
          status: "pending",
        },
        declarationAccepted: true,
      },
      status: "procured",
      notes: `Imported from customer sell request ${sell.sellId}`,
    });

    // Optionally update sell request status
    if (sell.status !== "completed") {
      sell.status = "device_received";
      await sell.save();
    }

    await AuditLog.create({
      actor: req.user!.id,
      action: "create",
      resource: "ManagedSellingPhone",
      resourceId: item.managedId,
      meta: { importedFrom: sell.sellId },
    });

    return res.status(201).json({ success: true, item });
  } catch (error) {
    console.error("Import sell error:", error);
    return res.status(500).json({ error: "Failed to import sell request" });
  }
});

router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const item = await ManagedSellingPhone.findOne(lookup(String(req.params.id)));
    if (!item) return res.status(404).json({ error: "Record not found" });

    const body = req.body;

    if (body.device) {
      if (body.device.checklist && item.device.checklist) {
        Object.assign(item.device.checklist, body.device.checklist);
        delete body.device.checklist;
      }
      Object.assign(item.device, body.device);
    }
    if (body.pricing) {
      Object.assign(item.pricing, body.pricing);
    }
    if (body.customer) {
      if (body.customer.address && item.customer.address) {
        Object.assign(item.customer.address, body.customer.address);
        delete body.customer.address;
      }
      if (body.customer.aadhaar && item.customer.aadhaar) {
        Object.assign(item.customer.aadhaar, body.customer.aadhaar);
        delete body.customer.aadhaar;
      }
      if (body.customer.pan && item.customer.pan) {
        Object.assign(item.customer.pan, body.customer.pan);
        delete body.customer.pan;
      }
      if (body.customer.payout && item.customer.payout) {
        Object.assign(item.customer.payout, body.customer.payout);
        delete body.customer.payout;
      }
      Object.assign(item.customer, body.customer);
    }
    if (body.status && body.status !== item.status) {
      item.status = body.status;
      if (body.note) {
        item.statusHistory.push({
          status: body.status,
          note: body.note,
          changedBy: req.user!.id as unknown as (typeof item.statusHistory)[0]["changedBy"],
          changedAt: new Date(),
        });
      }
    }
    if (body.notes !== undefined) item.notes = body.notes;

    await item.save();

    await AuditLog.create({
      actor: req.user!.id,
      action: "update",
      resource: "ManagedSellingPhone",
      resourceId: item.managedId,
      meta: body,
    });

    return res.json({ success: true, item });
  } catch (error) {
    console.error("Update managed phone error:", error);
    return res.status(500).json({ error: "Failed to update record", details: (error as any)?.message });
  }
});

router.post("/:id/publish-product", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const item = await ManagedSellingPhone.findOne(lookup(String(req.params.id)));
    if (!item) return res.status(404).json({ error: "Record not found" });

    if (!item.device.imei || item.device.imei.startsWith("PENDING")) {
      return res.status(400).json({ error: "Please assign a valid IMEI number before publishing" });
    }

    // Find or create "Old Phone" category
    let oldPhoneCat = await Category.findOne({ slug: "old-phone" });
    if (!oldPhoneCat) {
      oldPhoneCat = await Category.create({
        name: "Old Phone",
        slug: "old-phone",
        description: "Certified pre-owned and refurbished smartphones.",
        isActive: true,
      });
    }

    const price =
      item.pricing.targetSellingPrice > 0
        ? item.pricing.targetSellingPrice
        : Math.round(item.pricing.purchasePrice * 1.25);

    const productName = `${item.device.brand} ${item.device.model} ${item.device.storage} (${
      item.device.color || "Certified Pre-Owned"
    })`;

    const slug = `${slugify(item.device.brand)}-${slugify(item.device.model)}-${item.managedId.toLowerCase()}`;

    const conditionMap: Record<string, string> = {
      excellent: "used_like_new",
      good: "used_good",
      fair: "used_fair",
      poor: "used_fair",
    };

    const product = await Product.findOneAndUpdate(
      { slug },
      {
        name: productName,
        slug,
        brand: item.device.brand,
        model: item.device.model,
        category: oldPhoneCat._id,
        productType: "used",
        description: `Certified pre-owned ${item.device.brand} ${item.device.model} (${item.device.storage}). Inspected, tested, verified IMEI, battery health at ${item.device.batteryHealth || 88}%. Includes store warranty.`,
        price,
        compareAtPrice: Math.round(price * 1.15),
        condition: conditionMap[item.device.condition] || "used_good",
        stock: 1,
        sku: item.managedId,
        imei: item.device.imei,
        batteryHealth: item.device.batteryHealth || 88,
        specifications: {
          storage: item.device.storage,
          ram: item.device.ram,
          color: item.device.color,
        },
        images:
          item.device.images.length > 0
            ? item.device.images.map((img: any, i: number) => ({ url: img.url, isPrimary: i === 0 }))
            : [
                {
                  url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab",
                  isPrimary: true,
                },
              ],
        isActive: true,
      },
      { upsert: true, new: true }
    );

    item.convertedProduct = product._id;
    item.status = "listed";
    await item.save();

    await AuditLog.create({
      actor: req.user!.id,
      action: "update",
      resource: "ManagedSellingPhone",
      resourceId: item.managedId,
      meta: { publishedAsProduct: product.slug },
    });

    return res.json({ success: true, product, item });
  } catch (error) {
    console.error("Publish product error:", error);
    return res.status(500).json({ error: "Failed to publish device to catalog" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const item = await ManagedSellingPhone.findOneAndDelete(lookup(String(req.params.id)));
    if (!item) return res.status(404).json({ error: "Record not found" });

    await AuditLog.create({
      actor: req.user!.id,
      action: "delete",
      resource: "ManagedSellingPhone",
      resourceId: item.managedId,
      meta: { device: item.device.model, customer: item.customer.name },
    });

    return res.json({ success: true, message: `Managed phone ${item.managedId} deleted` });
  } catch (error) {
    console.error("Delete managed phone error:", error);
    return res.status(500).json({ error: "Failed to delete record" });
  }
});

export default router;

