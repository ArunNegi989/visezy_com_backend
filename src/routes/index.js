import express from "express";

import blogRoutes from "./blog.routes.js";
import sliderRoutes from "./slider.routes.js"
import contactRoutes from "./contact.routes.js"
import careerRoutes from "./career.routes.js"
import authRoutes from "./auth.routes.js"

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Visezy API Running 🚀",
  });
});

/*
|--------------------------------------------------------------------------
| Blog Routes
|--------------------------------------------------------------------------
*/

router.use("/blogs", blogRoutes);


/*
|--------------------------------------------------------------------------
| Slider Routes
|--------------------------------------------------------------------------
*/

router.use("/sliders", sliderRoutes);


router.use("/contact", contactRoutes);
router.use("/career", careerRoutes);

router.use("/auth", authRoutes);
export default router;