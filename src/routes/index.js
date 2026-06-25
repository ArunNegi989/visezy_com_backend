import express from "express";

const router = express.Router();

// Health Check
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running successfully 🚀",
  });
});

// Example Route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Test Route Working",
  });
});

export default router;