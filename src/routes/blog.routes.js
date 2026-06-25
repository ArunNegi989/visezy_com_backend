import express from "express";

import upload from "../middleware/upload.js";

import {
  createBlog,
  getAdminBlogs,
  getBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  getBlogById,
} from "../controllers/blog.controller.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Blog Routes
|--------------------------------------------------------------------------
*/

// Create Blog
router.post(
  "/",
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  createBlog
);

//get admin all blogs
router.get("/admin/all", getAdminBlogs);


// Get All Blogs
router.get("/", getBlogs);

router.get("/admin/:id", getBlogById);

// Get Blog By Slug
router.get("/:slug", getBlogBySlug);

// Update Blog
router.put(
  "/:id",
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  updateBlog
);

// Delete Blog
router.delete("/:id", deleteBlog);

export default router;