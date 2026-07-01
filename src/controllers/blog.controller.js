import Blog from "../models/Blog.js";
import slugify from "slugify";
import fs from "fs";

// ==========================
// CREATE BLOG
// ==========================

export const createBlog = async (req, res) => {
    try {
        const {
            title,
            shortDescription,
            content,
            category,
            author,
            readingTime,
            seoTitle,
            seoDescription,
            status,
            featured,
            tags,
        } = req.body;

        if (!title || !content || !shortDescription) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields.",
            });
        }

        let slug = slugify(title, {
            lower: true,
            strict: true,
            trim: true,
        });

        const exists = await Blog.findOne({ slug });

        if (exists) {
            slug = `${slug}-${Date.now()}`;
        }

        const { thumbnailUrl } = req.body;

        let thumbnail = "";

        if (req.files?.thumbnail?.[0]) {
            thumbnail = req.files.thumbnail[0].path
                .replace(/\\/g, "/")
                .replace(/^src\//, "");
        } else if (thumbnailUrl) {
            thumbnail = thumbnailUrl;
        }

        const blog = await Blog.create({
            title,
            slug,
            shortDescription,
            content,
            thumbnail,
            category,
            author,
            readingTime,
            seoTitle,
            seoDescription,
            status,
            featured,
            tags: tags
                ? tags.split(",").map((tag) => tag.trim())
                : [],
        });

        return res.status(201).json({
            success: true,
            message: "Blog created successfully.",
            blog,
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};


// ==========================
// GET ADMIN BLOGS
// ==========================

export const getAdminBlogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            category = "",
            status = "",
            sort = "newest",
        } = req.query;

        const query = {};

        if (search) {
            query.$or = [
                {
                    title: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    shortDescription: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    author: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }

        if (category) {
            query.category = category;
        }

        if (status) {
            query.status = status;
        }

        let sortOption = {
            createdAt: -1,
        };

        switch (sort) {
            case "oldest":
                sortOption = {
                    createdAt: 1,
                };
                break;

            case "title":
                sortOption = {
                    title: 1,
                };
                break;

            case "views":
                sortOption = {
                    views: -1,
                };
                break;

            default:
                sortOption = {
                    createdAt: -1,
                };
        }

        const currentPage = Number(page);

        const perPage = Number(limit);

        const totalBlogs = await Blog.countDocuments(query);

        const blogs = await Blog.find(query)
            .sort(sortOption)
            .skip((currentPage - 1) * perPage)
            .limit(perPage);

        return res.status(200).json({
            success: true,

            blogs,

            pagination: {
                currentPage,
                perPage,
                totalBlogs,
                totalPages: Math.ceil(totalBlogs / perPage),
                hasNext: currentPage < Math.ceil(totalBlogs / perPage),
                hasPrev: currentPage > 1,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==========================
// GET ALL BLOGS (USER)
// ==========================

export const getBlogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 6,
            search = "",
            category = "",
            featured = "",
        } = req.query;

        const query = {
            status: "Published",
        };

        // Search
        if (search) {
            query.$or = [
                {
                    title: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    shortDescription: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    tags: {
                        $in: [
                            new RegExp(search, "i"),
                        ],
                    },
                },
            ];
        }

        // Category
        if (category && category !== "All") {
            query.category = category;
        }

        // Featured
        if (featured === "true") {
            query.featured = true;
        }

        const currentPage = Number(page);
        const perPage = Number(limit);

        const totalBlogs = await Blog.countDocuments(query);

        const blogs = await Blog.find(query)
            .sort({
                createdAt: -1,
            })
            .skip((currentPage - 1) * perPage)
            .limit(perPage)
            .lean();

        // Categories
        const categories = await Blog.distinct("category", {
            status: "Published",
        });

        return res.status(200).json({
            success: true,

            blogs,

            categories: [
                "All",
                ...categories,
            ],

            pagination: {
                currentPage,
                perPage,
                totalBlogs,
                totalPages: Math.ceil(totalBlogs / perPage),
                hasNext:
                    currentPage <
                    Math.ceil(totalBlogs / perPage),
                hasPrev: currentPage > 1,
            },
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ==========================
// GET BLOG BY SLUG
// ==========================

export const getBlogBySlug = async (req, res) => {

    try {

        const blog = await Blog.findOne({

            slug: req.params.slug,

        });

        if (!blog) {

            return res.status(404).json({

                success: false,

                message: "Blog not found.",

            });

        }

        blog.views += 1;

        await blog.save();

        return res.json({

            success: true,

            blog,

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};


// GET BLOG BY ID (ADMIN)

export const getBlogById = async (req, res) => {

    try {

        const blog = await Blog.findById(req.params.id);

        if (!blog) {

            return res.status(404).json({
                success: false,
                message: "Blog not found.",
            });

        }

        return res.json({
            success: true,
            blog,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};// ==========================
// UPDATE BLOG
// ==========================

export const updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found.",
            });
        }

        // Update Thumbnail
        if (req.files?.thumbnail?.length) {
            if (
                blog.thumbnail &&
                !blog.thumbnail.startsWith("http")
            ) {
                const oldThumbnail = `src/${blog.thumbnail}`;

                if (fs.existsSync(oldThumbnail)) {
                    fs.unlinkSync(oldThumbnail);
                }
            }

            blog.thumbnail = req.files.thumbnail[0].path
                .replace(/\\/g, "/")
                .replace(/^src\//, "");
        } else if (
            req.body.thumbnailUrl &&
            req.body.thumbnailUrl.trim()
        ) {
            if (
                blog.thumbnail &&
                !blog.thumbnail.startsWith("http")
            ) {
                const oldThumbnail = `src/${blog.thumbnail}`;

                if (fs.existsSync(oldThumbnail)) {
                    fs.unlinkSync(oldThumbnail);
                }
            }

            blog.thumbnail = req.body.thumbnailUrl;
        }

        // Update Fields
        blog.title = req.body.title || blog.title;
        blog.shortDescription =
            req.body.shortDescription || blog.shortDescription;
        blog.content = req.body.content || blog.content;
        blog.category = req.body.category || blog.category;
        blog.author = req.body.author || blog.author;
        blog.readingTime = req.body.readingTime || blog.readingTime;
        blog.seoTitle = req.body.seoTitle || blog.seoTitle;
        blog.seoDescription =
            req.body.seoDescription || blog.seoDescription;
        blog.status = req.body.status || blog.status;

        if (req.body.featured !== undefined) {
            blog.featured = req.body.featured;
        }

        if (req.body.tags) {
            blog.tags = req.body.tags
                .split(",")
                .map((tag) => tag.trim());
        }

        // Update Slug
        if (req.body.title) {
            const slug = slugify(req.body.title, {
                lower: true,
                strict: true,
                trim: true,
            });

            const exists = await Blog.findOne({
                slug,
                _id: { $ne: blog._id },
            });

            blog.slug = exists
                ? `${slug}-${Date.now()}`
                : slug;
        }

        await blog.save();

        return res.status(200).json({
            success: true,
            message: "Blog updated successfully.",
            blog,
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==========================
// DELETE BLOG
// ==========================

export const deleteBlog = async (req, res) => {

    try {

        const blog = await Blog.findById(req.params.id);

        if (!blog) {

            return res.status(404).json({

                success: false,

                message: "Blog not found.",

            });

        }

        if (
            blog.thumbnail &&
            !blog.thumbnail.startsWith("http")
        ) {
            const thumbnailPath = `src/${blog.thumbnail}`;

            if (fs.existsSync(thumbnailPath)) {
                fs.unlinkSync(thumbnailPath);
            }
        }
        await blog.deleteOne();

        return res.json({

            success: true,

            message: "Blog deleted successfully.",

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};

// ==========================
// GET BLOG FILTERS
// ==========================

export const getBlogFilters = async (req, res) => {
  try {
    const categories = await Blog.distinct("category");

    const statuses = await Blog.distinct("status");

    return res.status(200).json({
      success: true,
      categories: categories.filter(Boolean),
      statuses: statuses.filter(Boolean),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};