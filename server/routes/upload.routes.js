import express from "express";
import multer from "multer";
import fs from "fs";

const router = express.Router();

// ✅ ensure folder exists
const dir = "uploads/assignments";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// file filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF/DOC/DOCX allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

// ✅ CLEAN ROUTE (FIXED)
router.post("/upload", upload.single("assignment"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.status(200).json({
      success: true,
      fileUrl: `http://localhost:8000/uploads/assignments/${req.file.filename}`,
    });
  } catch (err) {
    console.log("Upload error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;