import { Router } from "express";
import bcrypt from "bcryptjs";
import { connectDB } from "../lib/db";
import { User } from "../models/User";
import { loginSchema, registerSchema } from "../lib/validations";
import { requireAuth, signToken } from "../middleware/auth";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    }
    await connectDB();
    const { email, phone, password, name } = parsed.data;
    if (await User.exists({ $or: [{ email: email.toLowerCase() }, { phone }] })) {
      return res.status(409).json({ error: "An account with this email or phone already exists" });
    }
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash: await bcrypt.hash(password, 12),
      role: "customer",
    });
    const authUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role as "customer" | "admin",
      phone: user.phone,
    };
    const token = signToken(authUser);
    return res.status(201).json({ token, user: authUser });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Failed to create account" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    await connectDB();
    const user = await User.findOne({
      email: parsed.data.email.toLowerCase(),
      isActive: true,
    });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    user.lastLoginAt = new Date();
    await user.save();

    const authUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role as "customer" | "admin",
      phone: user.phone,
    };
    const token = signToken(authUser);
    return res.json({ token, user: authUser });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Failed to sign in" });
  }
});

router.post("/oauth", async (req, res) => {
  try {
    const { provider = "google", providerId, email, name, avatar } = req.body || {};

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email is required from OAuth provider" });
    }

    await connectDB();
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = typeof name === "string" && name.trim() ? name.trim() : cleanEmail.split("@")[0];

    let user = await User.findOne({
      $or: [
        { email: cleanEmail },
        ...(providerId ? [{ provider, providerId: String(providerId) }] : []),
      ],
    });

    if (!user) {
      user = await User.create({
        name: cleanName,
        email: cleanEmail,
        avatar: typeof avatar === "string" ? avatar : undefined,
        provider: provider === "github" ? "github" : "google",
        providerId: providerId ? String(providerId) : undefined,
        role: "customer",
        isActive: true,
        lastLoginAt: new Date(),
      });
    } else {
      user.lastLoginAt = new Date();
      if (!user.avatar && avatar) user.avatar = avatar;
      if (providerId && !user.providerId) {
        user.providerId = String(providerId);
      }
      await user.save();
    }

    const authUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role as "customer" | "admin",
      phone: user.phone || undefined,
      avatar: user.avatar || undefined,
    };

    const token = signToken(authUser);
    return res.json({ token, user: authUser });
  } catch (error) {
    console.error("OAuth error:", error);
    return res.status(500).json({ error: "Failed to authenticate with OAuth provider" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  return res.json({ user: req.user });
});

export default router;
