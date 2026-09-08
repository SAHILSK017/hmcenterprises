import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { env } from "./lib/env";
import { connectDB } from "./lib/db";
import authRoutes from "./routes/auth";
import repairRoutes from "./routes/repairs";
import sellRoutes from "./routes/sells";
import managedSellsRoutes from "./routes/managedSells";
import productRoutes from "./routes/products";
import uploadRoutes from "./routes/upload";
import orderRoutes from "./routes/orders";
import adminRoutes from "./routes/admin";
import blogRoutes from "./routes/blog";
import siteRoutes from "./routes/site";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "hmk-server" });
});

app.use("/api/auth", authRoutes);
app.use("/api/repairs", repairRoutes);
app.use("/api/sells", sellRoutes);
app.use("/api/managed-sells", managedSellsRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/site", siteRoutes);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
);

async function start() {
  if (!env.mongodbUri) {
    console.warn("⚠ MONGODB_URI is not set — API routes that need DB will fail until configured.");
  } else {
    await connectDB();
    console.log("✓ Connected to MongoDB");
  }

  app.listen(env.port, () => {
    console.log(`✓ HMK API listening on http://localhost:${env.port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
