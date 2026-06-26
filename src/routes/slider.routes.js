import express from "express";

import upload from "../middleware/upload.js";

import {
  createSlider,
  getSliders,
  getSliderById,
  updateSlider,
  deleteSlider,
  moveSliderUp,
  moveSliderDown,
} from "../controllers/slider.controller.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Slider Routes
|--------------------------------------------------------------------------
*/

// Create Slider
router.post(
  "/",
  upload.single("image"),
  createSlider
);

// Get All Sliders
router.get(
  "/",
  getSliders
);

// Get Slider By Id
router.get(
  "/id/:id",
  getSliderById
);

// Update Slider
router.put(
  "/:id",
  upload.single("image"),
  updateSlider
);

// Delete Slider
router.delete(
  "/:id",
  deleteSlider
);

// Move Slider Up
router.patch(
  "/:id/move-up",
  moveSliderUp
);

// Move Slider Down
router.patch(
  "/:id/move-down",
  moveSliderDown
);

export default router;