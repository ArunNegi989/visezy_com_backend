import express from "express";

import {
  createCareer,
  getCareers,
  getCareer,
  updateCareerStatus,
  deleteCareer,
  sendCareerReply,
} from "../controllers/career.controller.js";

import careerUpload from "../middleware/careerUpload.js";

const router = express.Router();

// ======================================================
// PUBLIC
// ======================================================

// Apply for Career
router.post(
  "/",
  careerUpload.single("resume"),
  createCareer
);

// ======================================================
// ADMIN
// ======================================================

// Get All Applications
router.get("/", getCareers);

// Get Single Application
router.get("/:id", getCareer);

// Update Status
router.patch(
  "/:id/status",
  updateCareerStatus
);

// Delete Application
router.delete(
  "/:id",
  deleteCareer
);

// Send Reply Email
router.post(
  "/send-email",
  sendCareerReply
);

export default router;