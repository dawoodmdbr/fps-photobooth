import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PHOTOS_DIR = path.join(__dirname, "photos");
const BASE_URL = process.env.BASE_URL || "https://fps-photobooth.onrender.com";

// Ensure photos directory exists
if (!fs.existsSync(PHOTOS_DIR)) fs.mkdirSync(PHOTOS_DIR);

const app = express();
app.use(cors({ origin: "https://fps-photobooth.vercel.app/" }));
app.use(express.json());

// Serve photos statically
app.use("/photos", express.static(PHOTOS_DIR));

// Multer: save with original filename (lowercased)
const storage = multer.diskStorage({
  destination: PHOTOS_DIR,
  filename: (req, file, cb) => cb(null, file.originalname.toLowerCase()),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

// GET /api/photo/:roll — find and return photo URL for a roll number
app.get("/api/photo/:roll", (req, res) => {
  const roll = req.params.roll.toLowerCase(); // e.g. "24f3053"
  for (const ext of EXTENSIONS) {
    const filePath = path.join(PHOTOS_DIR, `${roll}.${ext}`);
    if (fs.existsSync(filePath)) {
      return res.json({ url: `${BASE_URL}/photos/${roll}.${ext}`, filename: `${roll}.${ext}` });
    }
  }
  return res.status(404).json({ error: "Photo not found" });
});

// GET /api/students — list all photos
app.get("/api/students", (req, res) => {
  const files = fs.readdirSync(PHOTOS_DIR).filter((f) =>
    EXTENSIONS.some((ext) => f.endsWith(`.${ext}`))
  );
  const students = files.map((filename) => ({
    filename,
    url: `${BASE_URL}/photos/${filename}`,
  }));
  res.json(students);
});

// POST /api/upload — batch upload
app.post("/api/upload", upload.array("photos", 500), (req, res) => {
  const results = req.files.map((f) => ({ filename: f.filename, status: "success" }));
  res.json(results);
});

// PUT /api/update/:filename — replace a photo
app.put("/api/update/:filename", upload.single("photo"), (req, res) => {
  const oldFilename = req.params.filename;
  const newFile = req.file;
  if (!newFile) return res.status(400).json({ error: "No file provided" });

  // If extension changed, delete old file
  const oldPath = path.join(PHOTOS_DIR, oldFilename);
  if (oldFilename !== newFile.filename && fs.existsSync(oldPath)) {
    fs.unlinkSync(oldPath);
  }

  res.json({ filename: newFile.filename, status: "success" });
});

// DELETE /api/delete/:filename — delete a photo
app.delete("/api/delete/:filename", (req, res) => {
  const filePath = path.join(PHOTOS_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });
  fs.unlinkSync(filePath);
  res.json({ status: "deleted" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`FPS backend running at http://localhost:${PORT}`));