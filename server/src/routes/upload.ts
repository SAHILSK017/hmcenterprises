import { Router } from "express";
import multer from "multer";
import { cloudinary, isCloudinaryConfigured } from "../lib/cloudinary";
import { randomUUID } from "crypto";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image uploads are allowed"));
      return;
    }
    cb(null, true);
  },
});

const router = Router();

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Image file is required" });
    const folder = String(req.body.folder || "hmk/uploads");
    const buffer = req.file.buffer;

    if (isCloudinaryConfigured()) {
      const uploaded = await new Promise<{ secure_url: string; public_id: string }>(
        (resolve, reject) =>
          cloudinary.uploader
            .upload_stream({ folder, resource_type: "image" }, (error, result) =>
              error || !result
                ? reject(error || new Error("Upload failed"))
                : resolve(result as { secure_url: string; public_id: string })
            )
            .end(buffer)
      );
      return res.json({ url: uploaded.secure_url, publicId: uploaded.public_id });
    }

    return res.json({
      url: `data:${req.file.mimetype};base64,${buffer.toString("base64")}`,
      publicId: `local-${randomUUID()}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to upload image",
    });
  }
});

export default router;
