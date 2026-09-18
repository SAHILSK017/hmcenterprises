import { Router } from "express";
import bcrypt from "bcryptjs";
import { connectDB } from "../lib/db";
import { User } from "../models/User";
import { loginSchema, registerSchema } from "../lib/validations";
import { requireAuth, signToken } from "../middleware/auth";
import { env } from "../lib/env";

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

router.post("/google", async (req, res) => {
  try {
    const { credential, token: tokenParam } = req.body || {};
    const googleIdToken = (credential || tokenParam)?.trim();

    if (!googleIdToken) {
      return res.status(400).json({ error: "Google credential ID token is required" });
    }

    // Verify Google ID token via Google's tokeninfo endpoint
    const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(googleIdToken)}`;
    const googleRes = await fetch(verifyUrl);

    if (!googleRes.ok) {
      const errData = await googleRes.json().catch(() => ({}));
      console.error("Google token verification failed:", errData);
      return res.status(401).json({ error: "Invalid or expired Google credential" });
    }

    const payload = (await googleRes.json()) as {
      iss?: string;
      sub?: string;
      email?: string;
      email_verified?: string | boolean;
      name?: string;
      picture?: string;
      aud?: string;
    };

    if (!payload.email) {
      return res.status(400).json({ error: "Google account does not have an associated email" });
    }

    const isEmailVerified =
      payload.email_verified === "true" || payload.email_verified === true;
    if (!isEmailVerified) {
      return res.status(400).json({ error: "Google email address is not verified" });
    }

    // Optional verification of audience if server GOOGLE_CLIENT_ID is set
    if (env.googleClientId && payload.aud && payload.aud !== env.googleClientId) {
      console.warn(
        `Audience mismatch: received ${payload.aud}, expected ${env.googleClientId}`
      );
    }

    await connectDB();
    const cleanEmail = payload.email.toLowerCase().trim();
    const cleanName = payload.name?.trim() || cleanEmail.split("@")[0];
    const googleSub = payload.sub ? String(payload.sub) : undefined;
    const avatar = payload.picture || undefined;

    let user = await User.findOne({
      $or: [
        { email: cleanEmail },
        ...(googleSub ? [{ provider: "google", providerId: googleSub }] : []),
      ],
    });

    if (!user) {
      user = await User.create({
        name: cleanName,
        email: cleanEmail,
        avatar,
        provider: "google",
        providerId: googleSub,
        role: "customer",
        isActive: true,
        lastLoginAt: new Date(),
      });
    } else {
      user.lastLoginAt = new Date();
      if (!user.avatar && avatar) user.avatar = avatar;
      if (googleSub && !user.providerId) {
        user.providerId = googleSub;
      }
      if (!user.provider || user.provider === "credentials") {
        user.provider = "google";
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
    console.error("Google authentication error:", error);
    return res.status(500).json({ error: "Failed to authenticate with Google" });
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
