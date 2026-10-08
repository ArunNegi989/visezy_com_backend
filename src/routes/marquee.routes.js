import express from "express";

import {
  createMarquee,
  getMarquee,
  getAdminMarquee,
  updateMarquee,
  deleteMarquee,
} from "../controllers/marquee.controller.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Marquee Routes
|--------------------------------------------------------------------------
*/

// Get Active Marquee - Public
router.get(
  "/",
  getMarquee
);

// Get Marquee - Admin
router.get(
  "/admin",
  getAdminMarquee
);

// Create Marquee
router.post(
  "/",
  createMarquee
);

// Update Marquee
router.put(
  "/:id",
  updateMarquee
);

// Delete Marquee
router.delete(
  "/:id",
  deleteMarquee
);

export default router;