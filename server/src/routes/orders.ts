import { Router } from "express";
import { connectDB } from "../lib/db";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { Notification, AuditLog } from "../models";
import { checkoutSchema } from "../lib/validations";
import { nextSequentialId } from "../lib/utils";
import { optionalAuth, requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

const paramId = (value: string | string[]) => (Array.isArray(value) ? value[0] : value);

const SHIPPING_FEE = 99;
const FREE_SHIPPING_MIN = 15000;

const lookup = (id: string) => ({
  $or: [
    { orderId: id.toUpperCase() },
    { _id: id.match(/^[a-f\d]{24}$/i) ? id : null },
  ],
});

router.post("/checkout", optionalAuth, async (req, res) => {
  try {
    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    }

    const { address, items } = parsed.data;

    await connectDB();

    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true });
    if (products.length !== items.length) {
      return res.status(400).json({ error: "One or more products are unavailable" });
    }

    const productMap = new Map(products.map((p) => [String(p._id), p]));
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return res.status(400).json({ error: "Product not found" });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name} (${product.stock} available)`,
        });
      }
      const primaryImage = product.images?.find((img: { isPrimary?: boolean }) => img.isPrimary) ?? product.images?.[0];
      orderItems.push({
        product: product._id,
        name: product.name,
        image: primaryImage?.url,
        price: product.price,
        quantity: item.quantity,
        condition: product.condition,
        sku: product.sku,
      });
      subtotal += product.price * item.quantity;
    }

    const shippingFee = subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
    const total = subtotal + shippingFee;
    const orderId = await nextSequentialId("ORD");

    const contactPhone = address.whatsapp || address.phone;

    const order = await Order.create({
      orderId,
      user: req.user?.id || undefined,
      items: orderItems,
      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        email: address.email || req.user?.email || undefined,
        whatsapp: contactPhone,
        line1: address.line1,
        line2: address.line2 || "",
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        notes: address.notes || "",
      },
      subtotal,
      shippingFee,
      total,
      paymentMethod: "direct",
      paymentStatus: "pending",
      status: "pending",
    });

    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity, soldCount: item.quantity },
      });
    }

    await AuditLog.create({
      actor: req.user?.id || null,
      action: "create",
      resource: "Order",
      resourceId: order.orderId,
      meta: {
        customer: address.fullName,
        phone: address.phone,
        whatsapp: contactPhone,
        address: `${address.line1}, ${address.city} - ${address.pincode}`,
        items: orderItems.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
        total,
      },
    });

    // Notify all admins about the new order
    try {
      const admins = await User.find({ role: "admin" }).select("_id");
      const itemSummary = orderItems.map((i) => `${i.name} (×${i.quantity})`).join(", ");
      for (const admin of admins) {
        await Notification.create({
          user: admin._id,
          title: `New Order: ${orderId}`,
          body: `${address.fullName} wants to buy ${itemSummary}. Total: ₹${total.toLocaleString("en-IN")}. Phone: ${contactPhone}`,
          type: "order",
          link: `/admin/orders/${orderId}`,
        });
      }
    } catch (notifErr) {
      console.error("Admin notification error:", notifErr);
    }

    return res.status(201).json({
      success: true,
      orderId: order.orderId,
      total: order.total,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({ error: "Checkout failed" });
  }
});

router.post("/verify-payment", optionalAuth, async (_req, res) => {
  return res.json({ success: true, message: "Direct checkout active. No payment gateway required." });
});

router.get("/mine", requireAuth, async (req, res) => {
  try {
    await connectDB();
    const orders = await Order.find({ user: req.user!.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return res.json({ items: orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.get("/:id", optionalAuth, async (req, res) => {
  try {
    await connectDB();
    const filter: Record<string, unknown> = { ...lookup(paramId(req.params.id)) };
    const order = await Order.findOne(filter).populate("user", "name email phone").lean();
    if (!order) return res.status(404).json({ error: "Order not found" });
    return res.json(order);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch order" });
  }
});

router.get("/", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Number(req.query.limit || 20));
    const status = req.query.status as string | undefined;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const [items, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email phone")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return res.json({ items, total, page, limit });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const order = await Order.findOne(lookup(paramId(req.params.id)));
    if (!order) return res.status(404).json({ error: "Not found" });

    if (req.body.status) {
      order.status = req.body.status;
      if (req.body.status === "delivered") order.deliveredAt = new Date();
    }
    if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;
    if (req.body.trackingCarrier) order.trackingCarrier = req.body.trackingCarrier;

    await order.save();
    return res.json({ success: true, order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update order" });
  }
});

export default router;
