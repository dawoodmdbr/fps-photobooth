import express from "express";
import multer from "multer";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// ─── Cloudinary config ────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const FOLDER = "fps-photobooth"; // all photos stored under this folder in Cloudinary

const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN || "https://fps-photobooth.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: false,
}));
app.use(express.json());

// Multer — store in memory (no local disk needed)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ─── Helper: upload buffer to Cloudinary ─────────────────────
function uploadToCloudinary(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: FOLDER,
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
}

// ─── Helper: strip folder prefix from public_id ──────────────
function toPublicId(roll) {
  return `${FOLDER}/${roll}`;
}

// GET /api/photo/:roll — fetch photo URL for a roll number
app.get("/api/photo/:roll", async (req, res) => {
  const roll = req.params.roll.toLowerCase();
  try {
    const result = await cloudinary.api.resource(toPublicId(roll));
    const filename = `${roll}.${result.format}`;
    return res.json({ url: result.secure_url, filename });
  } catch (e) {
    return res.status(404).json({ error: "Photo not found" });
  }
});

// GET /api/students — list all photos
app.get("/api/students", async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: FOLDER + "/",
      max_results: 500,
    });
    const students = result.resources.map((r) => {
      const filename = `${r.public_id.replace(FOLDER + "/", "")}.${r.format}`;
      return { filename, url: r.secure_url };
    });
    res.json(students);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/upload — batch upload
app.post("/api/upload", upload.array("photos", 500), async (req, res) => {
  const results = [];
  for (const file of req.files) {
    const nameNoExt = file.originalname.replace(/\.[^/.]+$/, "").toLowerCase();
    try {
      await uploadToCloudinary(file.buffer, nameNoExt);
      results.push({ filename: file.originalname.toLowerCase(), status: "success" });
    } catch (e) {
      results.push({ filename: file.originalname.toLowerCase(), status: "error", msg: e.message });
    }
  }
  res.json(results);
});

// PUT /api/update/:filename — replace a photo
app.put("/api/update/:filename", upload.single("photo"), async (req, res) => {
  const oldNameNoExt = req.params.filename.replace(/\.[^/.]+$/, "").toLowerCase();
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No file provided" });

  try {
    // Delete old then upload new (handles extension changes)
    await cloudinary.uploader.destroy(toPublicId(oldNameNoExt));
    const newNameNoExt = file.originalname.replace(/\.[^/.]+$/, "").toLowerCase();
    const result = await uploadToCloudinary(file.buffer, newNameNoExt);
    const filename = `${newNameNoExt}.${result.format}`;
    res.json({ filename, status: "success" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/delete/:filename — delete a photo
app.delete("/api/delete/:filename", async (req, res) => {
  const nameNoExt = req.params.filename.replace(/\.[^/.]+$/, "").toLowerCase();
  try {
    await cloudinary.uploader.destroy(toPublicId(nameNoExt));
    res.json({ status: "deleted" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`FPS backend running at http://localhost:${PORT}`));
