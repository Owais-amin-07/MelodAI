import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import multer from "multer";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Setup multer for audio uploads
  const uploadDir = path.join(__dirname, "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  const upload = multer({ storage });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Placeholder for AI Analysis
  app.post("/api/analyze/solo", upload.single("audio"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }
    
    // In a real app, we'd send this to Gemini here or in the frontend.
    // The Gemini skill says "Always call Gemini API from the frontend code".
    // So the backend will just deliver the file or a path.
    // But then I need to get the file to the frontend? 
    // OR we can do the analysis in the frontend directly if the user records.
    // If they upload, we need to read it.
    
    res.json({ 
      message: "File uploaded successfully", 
      filename: req.file.filename,
      mimetype: req.file.mimetype
    });
  });

  app.post("/api/analyze/comparative", upload.fields([
    { name: "original", maxCount: 1 },
    { name: "singing", maxCount: 1 }
  ]), async (req, res) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (!files || !files.original || !files.singing) {
      return res.status(400).json({ error: "Missing files" });
    }

    res.json({
      message: "Files uploaded successfully",
      original: files.original[0].filename,
      singing: files.singing[0].filename
    });
  });

  // Serve uploads
  app.use("/uploads", express.static(uploadDir));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Error starting server:", err);
});
